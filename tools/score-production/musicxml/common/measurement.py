"""Local, metadata-only production timing and Codex usage collection.

One final scan selects exact root_turn_id records, including compaction usage.
Message/reasoning bodies and cumulative token_count values are never exported.
"""
import hashlib
import json
import re
from time import perf_counter
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path


KEYS = ("input_tokens", "cached_input_tokens", "cache_write_input_tokens",
        "output_tokens", "reasoning_output_tokens", "total_tokens")
KINDS = {"session_meta", "turn_context", "event_msg", "token_usage_record", "compacted"}
HEADER_TYPE = re.compile(rb'"type"\s*:\s*"([^"\\]+)"')
HEADER_TIME = re.compile(rb'"timestamp"\s*:\s*"([^"\\]+)"')


def timestamp(value):
    try:
        result = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (AttributeError, TypeError, ValueError):
        raise ValueError(f"timestamp expected=ISO-8601 with timezone actual={value!r}") from None
    if result.utcoffset() is None:
        raise ValueError(f"timestamp expected=explicit timezone actual={value!r}")
    return result.astimezone(timezone.utc)


def now():
    return datetime.now(timezone.utc).isoformat()


def zero():
    return dict.fromkeys(KEYS, 0)


def add(total, usage):
    for key in KEYS:
        total[key] += usage[key]


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_json(path):
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise ValueError(f"JSON expected=valid object path={path} actual=invalid line={error.lineno} column={error.colno}") from None
    if not isinstance(value, dict):
        raise ValueError(f"JSON expected=object path={path} actual_type={type(value).__name__}")
    return value


def events(path, warnings, scan=None):
    """Skip body-only event types before parsing; never yield compacted bodies."""
    try:
        with path.open("rb") as source:
            for line_no, raw in enumerate(source, 1):
                if scan is not None:
                    scan["bytes_read"] += len(raw)
                location = {"log": str(path), "line": line_no}
                if not raw.endswith(b"\n"):
                    warnings.append({"code": "unterminated_log_line", **location,
                                     "expected": "newline-terminated JSONL", "actual_bytes": len(raw)})
                header = raw[:256]
                match = HEADER_TYPE.search(header)
                kind = match[1].decode("ascii", errors="replace") if match else None
                if kind and kind not in KINDS:
                    continue
                if kind == "event_msg":
                    subtype = HEADER_TYPE.search(header, match.end())
                    if subtype and subtype[1] not in (b"thread_settings_applied", b"task_started", b"task_complete"):
                        continue
                # Compaction replacement_history may be large and contain private bodies.
                stamp = HEADER_TIME.search(header)
                if kind == "compacted" and stamp:
                    yield line_no, {"type": kind, "timestamp": stamp[1].decode("ascii"), "payload": {}}
                    continue
                try:
                    event = json.loads(raw)
                except (json.JSONDecodeError, UnicodeDecodeError) as error:
                    warnings.append({"code": "invalid_log_json", **location,
                                     "expected": "valid JSON", "actual_bytes": len(raw),
                                     "error_offset": getattr(error, "pos", getattr(error, "start", None))})
                    continue
                if isinstance(event, dict) and event.get("type") in KINDS:
                    yield line_no, event
    except OSError as error:
        warnings.append({"code": "unreadable_log", "log": str(path), "errno": error.errno})


def root_identity(root_log, root_turn_id):
    warnings, matches, thread_id = [], [], None
    for line_no, event in events(root_log, warnings):
        payload = event.get("payload", {})
        if event["type"] == "session_meta":
            thread_id = payload.get("id", thread_id)
        if (event["type"] == "event_msg" and payload.get("type") == "task_started"
                and payload.get("turn_id") == root_turn_id):
            attribution = payload.get("turn_attribution", {})
            actual_root = attribution.get("root_turn_id", payload.get("root_turn_id"))
            if actual_root != root_turn_id:
                raise ValueError(f"root identity expected={root_turn_id!r} actual={actual_root!r} log={root_log} line={line_no}")
            matches.append({"timestamp": event.get("timestamp"), "log": str(root_log), "line": line_no})
    if not thread_id or len(matches) != 1:
        raise ValueError(f"root identity expected=one task_started and session_meta.id actual_matches={len(matches)} actual_thread_id={thread_id!r} root_turn_id={root_turn_id!r} log={root_log}")
    timestamp(matches[0]["timestamp"])
    return thread_id, matches[0], warnings


def start(output, label, root_log, root_turn_id, sessions_root):
    output, root_log, sessions_root = (Path(p).expanduser().resolve() for p in (output, root_log, sessions_root))
    if output.exists():
        raise ValueError(f"output expected=fresh directory actual=exists path={output}")
    if not sessions_root.is_dir():
        raise ValueError(f"sessions root expected=directory actual=missing-or-not-directory path={sessions_root}")
    thread_id, evidence, warnings = root_identity(root_log, root_turn_id)
    run = {"schema_version": 1, "label": label, "created_at": now(),
           "root_thread_id": thread_id, "root_turn_id": root_turn_id,
           "root_log": str(root_log), "sessions_root": str(sessions_root),
           "started_at": evidence["timestamp"], "start_evidence": evidence,
           "milestones": [], "start_warnings": warnings}
    output.mkdir(parents=True, exist_ok=False)
    write_json(output / "run.json", run)
    return run


def mark(output, stage, status, evidence, at=None):
    path = Path(output).expanduser().resolve() / "run.json"
    run = read_json(path)
    stamp = timestamp(at or now())
    if stamp < timestamp(run["started_at"]):
        raise ValueError(f"milestone expected=at-or-after {run['started_at']} actual={stamp.isoformat()}")
    row = {"stage": stage, "status": status, "timestamp": stamp.isoformat(),
           "recorded_at": now(), "evidence": evidence,
           "seconds_since_request": (stamp - timestamp(run["started_at"])).total_seconds()}
    run["milestones"].append(row)
    write_json(path, run)
    return row


def valid_usage(value):
    if not isinstance(value, dict):
        return False
    return (all(type(value.get(k)) is int and value[k] >= 0 for k in KEYS)
            and value["input_tokens"] + value["output_tokens"] == value["total_tokens"]
            and value["cached_input_tokens"] <= value["input_tokens"]
            and value["cache_write_input_tokens"] <= value["input_tokens"]
            and value["reasoning_output_tokens"] <= value["output_tokens"])


def relationship(row, root_thread_id, threads, tasks):
    thread, turn, seen = row["thread_id"], row["turn_id"], set()
    while thread and (thread, turn) not in seen:
        seen.add((thread, turn))
        if thread == root_thread_id:
            return "producer"
        metadata = threads.get(thread, {})
        if metadata.get("source") == "user":
            return "causally_linked_thread"
        if metadata.get("parent"):
            thread = metadata["parent"]
        else:
            turn = tasks.get(turn, {}).get("parent_turn_id")
            thread = tasks.get(turn, {}).get("thread_id")
    return "unknown_relationship"


def collect(run, cutoff):
    scan_started = perf_counter()
    root_log = Path(run["root_log"])
    started = timestamp(run["started_at"])
    target = run["root_turn_id"]
    records, tasks, warnings, compactions, logs, threads = {}, {}, [], [], [], {}
    duplicates, root_cumulative = 0, None
    paths = sorted(set(Path(run["sessions_root"]).rglob("*.jsonl")) | {root_log})
    scan = {"bytes_read": 0}
    for path in paths:
        model = effort = tier = active_root = None
        thread_source = thread_id = None
        local_warnings, selected = [], path == root_log
        for line_no, event in events(path, local_warnings, scan):
            payload = event.get("payload", {})
            if not isinstance(payload, dict):
                continue
            try:
                stamp = timestamp(event.get("timestamp"))
            except ValueError:
                local_warnings.append({"code": "invalid_event_timestamp", "log": str(path), "line": line_no,
                                       "expected": "ISO-8601 with timezone", "actual": event.get("timestamp")})
                continue
            if stamp > cutoff:
                continue
            kind, subtype = event["type"], payload.get("type")
            if kind == "session_meta":
                thread_source = payload.get("thread_source")
                thread_id = payload.get("id")
                threads[thread_id] = {"source": thread_source,
                                      "parent": lookup(payload, "source", "subagent", "thread_spawn", "parent_thread_id")}
            if kind == "event_msg" and subtype == "thread_settings_applied":
                settings = payload.get("thread_settings", {})
                model, effort, tier = (settings.get("model", model), settings.get("reasoning_effort", effort),
                                       settings.get("service_tier", tier))
            if kind == "turn_context":
                model, effort = payload.get("model", model), payload.get("effort", effort)
                tier = payload.get("service_tier", tier)
                active_root = payload.get("root_turn_id")
            if kind == "event_msg" and subtype == "task_started":
                attribution = payload.get("turn_attribution", {})
                active_root = attribution.get("root_turn_id", payload.get("root_turn_id"))
                if active_root == target and stamp >= started:
                    selected = True
                    turn = payload.get("turn_id")
                    tasks.setdefault(turn, {"turn_id": turn, "thread_id": thread_id, "start": event["timestamp"],
                                           "trigger": attribution.get("turn_trigger"),
                                           "parent_turn_id": attribution.get("parent_turn_id"),
                                           "log": str(path), "line": line_no})
            if kind == "event_msg" and subtype == "task_complete" and payload.get("turn_id") in tasks:
                tasks[payload["turn_id"]].update(end=event["timestamp"], duration_ms=payload.get("duration_ms"))
            if kind == "compacted" and active_root == target and stamp >= started:
                compactions.append({"timestamp": event["timestamp"], "log": str(path), "line": line_no})
            if kind != "token_usage_record" or payload.get("root_turn_id") != target or stamp < started:
                continue
            selected, active_root = True, target
            identity, usage = payload.get("response_id"), payload.get("usage")
            if not identity or not valid_usage(usage):
                local_warnings.append({"code": "invalid_usage_record", "log": str(path), "line": line_no,
                                       "response_id": identity, "expected": "response_id and nonnegative token counts; total=input+output; cache/reasoning are subsets",
                                       "actual_usage": {k: usage.get(k) for k in KEYS} if isinstance(usage, dict) else None})
                continue
            row = {"timestamp": event["timestamp"], "thread_id": payload.get("thread_id"),
                   "turn_id": payload.get("turn_id"), "root_turn_id": target, "response_id": identity,
                   "model": model, "effort": effort, "service_tier": tier, "thread_source": thread_source,
                   "usage": {k: usage[k] for k in KEYS}, "log": str(path), "line": line_no}
            if identity in records:
                duplicates += 1
                previous = records[identity]
                if previous["usage"] != row["usage"]:
                    local_warnings.append({"code": "conflicting_response_usage", "response_id": identity,
                                           "expected_first": previous["usage"], "actual_duplicate": row["usage"],
                                           "log": str(path), "line": line_no})
            else:
                records[identity] = row
            if path == root_log and payload.get("turn_id") == target and valid_usage(payload.get("turn_token_usage")):
                root_cumulative = {k: payload["turn_token_usage"][k] for k in KEYS}
        if selected:
            logs.append(str(path))
        # Damaged candidates may contain related usage even when attribution is unreadable.
        warnings.extend(local_warnings)
    rows = sorted(records.values(), key=lambda row: timestamp(row["timestamp"]))
    root_total = zero()
    for row in rows:
        row["scope"] = relationship(row, run["root_thread_id"], threads, tasks)
        if row["thread_id"] == run["root_thread_id"] and row["turn_id"] == target:
            add(root_total, row["usage"])
    if root_cumulative is not None and root_total != root_cumulative:
        warnings.append({"code": "root_cumulative_mismatch", "expected": root_cumulative, "actual": root_total})
    incomplete = [t["turn_id"] for t in tasks.values() if "end" not in t]
    if incomplete:
        warnings.append({"code": "tasks_not_complete_at_cutoff", "actual_turn_ids": incomplete,
                         "expected": "task_complete before cutoff", "cutoff": cutoff.isoformat()})
    if not rows:
        warnings.append({"code": "no_usage_records", "expected_root_turn_id": target, "actual_count": 0})
    return rows, list(tasks.values()), warnings, {
        "scanned_log_count": len(paths), "bytes_read": scan["bytes_read"],
        "scan_elapsed_seconds": round(perf_counter() - scan_started, 6),
        "related_logs": logs, "duplicate_response_records": duplicates,
        "compactions": compactions, "root_turn_cumulative": root_cumulative, "root_turn_collected": root_total,
        "root_turn_cumulative_matches": root_total == root_cumulative if root_cumulative is not None else None}


def load_pricing(path):
    if path is None:
        return None, {"status": "absent", "checked_on": None}
    path = Path(path).expanduser().resolve()
    rates = read_json(path)
    metadata = {"path": str(path), "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                "checked_on": rates.get("checked_on"), "sources": rates.get("sources", [])}
    try:
        date.fromisoformat(rates["checked_on"])
        limit = rates["short_context_max_input_tokens"]
        if type(limit) is not int or limit < 0 or not isinstance(rates.get("api_usd_per_million"), dict):
            raise ValueError()
    except (KeyError, TypeError, ValueError):
        return None, {**metadata, "status": "unsupported", "expected": "dated rates with checked_on, integer short_context_max_input_tokens and api_usd_per_million mapping",
                      "actual_context_limit": rates.get("short_context_max_input_tokens"),
                      "actual_api_rates_type": type(rates.get("api_usd_per_million")).__name__}
    return rates, {**metadata, "status": "supplied_reference_rates"}


def price(usage, rate):
    if not isinstance(rate, dict):
        return None
    try:
        numbers = {k: Decimal(str(rate[k])) for k in ("input", "cached", "output")}
    except (KeyError, InvalidOperation):
        return None
    if any(not v.is_finite() or v < 0 for v in numbers.values()):
        return None
    uncached = usage["input_tokens"] - usage["cached_input_tokens"]
    return (uncached * numbers["input"] + usage["cached_input_tokens"] * numbers["cached"]
            + usage["output_tokens"] * numbers["output"]) / 1_000_000


def lookup(value, *keys):
    for key in keys:
        if not isinstance(value, dict):
            return None
        value = value.get(key)
    return value


def summarize(rows, rates):
    total, unpriced, groups, scopes = zero(), zero(), {}, {}
    api_total = credit_total = Decimal(0)
    api_count = credit_count = 0
    for row in rows:
        usage = row["usage"]
        add(total, usage)
        group_key = (row["thread_id"], row["model"], row["effort"], row["service_tier"])
        group = groups.setdefault(group_key, {k: row[k] for k in ("thread_id", "model", "effort", "service_tier")}
                                  | {"scope": row["scope"], "tokens": zero(), "responses": 0, "unpriced_tokens": zero()})
        scope = scopes.setdefault(row["scope"], {"scope": row["scope"], "tokens": zero(), "responses": 0,
                                               "reference_api_usd_priced_subset": None})
        add(scope["tokens"], usage)
        scope["responses"] += 1
        add(group["tokens"], usage)
        group["responses"] += 1
        api = credits = None
        if rates:
            tier = "standard" if row["service_tier"] == "default" else row["service_tier"]
            context = "long" if usage["input_tokens"] > rates["short_context_max_input_tokens"] else "short"
            rate = lookup(rates, "api_usd_per_million", row["model"], tier, context)
            # A cache-write count does not identify its retention period/rate.
            if usage["cache_write_input_tokens"] == 0:
                api = price(usage, rate)
            credits = price(usage, lookup(rates, "codex_credits_per_million", row["model"], tier))
        row["reference_api_usd"] = float(api) if api is not None else None
        row["reference_codex_credits"] = float(credits) if credits is not None else None
        if api is None:
            add(unpriced, usage)
            add(group["unpriced_tokens"], usage)
        else:
            api_total += api
            api_count += 1
            subtotal = scope["reference_api_usd_priced_subset"] or Decimal(0)
            scope["reference_api_usd_priced_subset"] = subtotal + api
        if credits is not None:
            credit_total += credits
            credit_count += 1
    for scope in scopes.values():
        amount = scope["reference_api_usd_priced_subset"]
        scope["reference_api_usd_priced_subset"] = float(amount) if amount is not None else None
    return {"tokens": total, "threads": list(groups.values()), "scopes": list(scopes.values()), "response_count": len(rows),
            "actual_charge_usd": None, "reference_api_usd_priced_subset": float(api_total) if api_count else None,
            "reference_codex_credits_priced_subset": float(credit_total) if credit_count else None,
            "api_priced_responses": api_count, "api_unpriced_responses": len(rows) - api_count,
            "credit_priced_responses": credit_count, "unpriced_tokens": unpriced}


def markdown(report):
    lines = [f"# {report['label']} — 제작 실측", "",
             f"시작: {report['started_at']} · 집계 기준: {report['snapshot_at']}",
             f"경과: {report['wall_seconds_to_snapshot']:.3f}초 · 응답: {report['response_count']:,}개", "",
             "| 단계 | 상태 | 시각 | 요청부터 경과(초) | 근거 |", "| --- | --- | --- | ---: | --- |"]
    def cell(value):
        return str(value).replace("|", "\\|").replace("\n", " ")
    for row in report["milestones"]:
        lines.append("| " + " | ".join(cell(row[k]) for k in ("stage", "status", "timestamp", "seconds_since_request", "evidence")) + " |")
    lines += ["", "| 사용량 | 토큰 |", "| --- | ---: |"]
    lines += [f"| {key} | {report['tokens'][key]:,} |" for key in KEYS]
    reference = report["reference_api_usd_priced_subset"]
    lines += ["", "캐시 입력과 추론 출력은 각각 입력·출력의 부분집합이며 별도로 더하지 않는다.",
              "", "실제 청구액: 미확인. 구독 포함량이나 청구서 귀속은 이 로그로 확인하지 못한다.",
              f"참고용 API 환산액(단가가 있는 응답만): {'미산정' if reference is None else f'${reference:.6f} USD'}.",
              f"미산정: {report['api_unpriced_responses']}개 응답, {report['unpriced_tokens']['total_tokens']:,}토큰.",
              f"단가 확인일: {report['pricing'].get('checked_on') or '미제공'}.", "",
              report["method"], "", report["scope_note"], "",
              f"검색 범위: {report['coverage']['sessions_root']} (재귀 탐색) + 지정 root log.",
              f"로컬 로그 스캔: {report['diagnostics']['scanned_log_count']}개 파일, {report['diagnostics']['bytes_read']:,}바이트, {report['diagnostics']['scan_elapsed_seconds']:.3f}초. 모델 응답 지연 측정값이 아니다.",
              "", "| 귀속 범위 | 응답 | 토큰 | 참고 API USD |", "| --- | ---: | ---: | ---: |"]
    for scope in report["scopes"]:
        amount = scope["reference_api_usd_priced_subset"]
        lines.append(f"| {scope['scope']} | {scope['responses']} | {scope['tokens']['total_tokens']:,} | {'미산정' if amount is None else f'{amount:.6f}'} |")
    lines += ["", "producer는 루트·하위 에이전트·자동 검토다. causally_linked_thread는 같은 root_turn_id로 이어진 별도 사용자 스레드이며, 인계받은 작업이 포함될 수 있다. unknown_relationship은 관계 메타정보가 부족하다.", "", "## 경고", ""]
    lines += ["- " + json.dumps(w, ensure_ascii=False) for w in report["warnings"]] or ["- 없음"]
    lines += ["", "상세: report.json · 응답별 메타데이터: usage-records.json · 시작·단계 기록: run.json", ""]
    return "\n".join(lines)


def finish(output, cutoff=None, pricing=None):
    output = Path(output).expanduser().resolve()
    run = read_json(output / "run.json")
    until = timestamp(cutoff or now())
    if until < timestamp(run["started_at"]):
        raise ValueError(f"cutoff expected=at-or-after {run['started_at']} actual={until.isoformat()}")
    if not Path(run["sessions_root"]).is_dir():
        raise ValueError(f"sessions root expected=directory actual=missing-or-not-directory path={run['sessions_root']}")
    rates, pricing_info = load_pricing(pricing)
    rows, tasks, warnings, diagnostics = collect(run, until)
    marks = [m for m in run["milestones"] if timestamp(m["timestamp"]) <= until]
    report = {"schema_version": 1, "label": run["label"], "root_thread_id": run["root_thread_id"],
              "root_turn_id": run["root_turn_id"], "started_at": run["started_at"], "snapshot_at": until.isoformat(),
              "collected_at": now(), "latest_observed_usage_at": rows[-1]["timestamp"] if rows else None,
              "wall_seconds_to_snapshot": (until - timestamp(run["started_at"])).total_seconds(),
              "start_evidence": run["start_evidence"], "milestones": marks, "tasks": tasks,
              "coverage": {"sessions_root": run["sessions_root"], "root_log": run["root_log"],
                           "selection": "exact root_turn_id within supplied recursive sessions root plus explicit root log",
                           "limitation": "Logs outside this scope, deleted logs and not-yet-persisted events are not discoverable. root_turn_id can propagate to non-child recipient threads."},
              "method": "Exact root_turn_id token_usage_record.usage across scoped logs; response_id deduplication includes compaction usage. Never add token_count or cumulative usage.",
              "scope_note": "Persisted usage through cutoff only. An ongoing response, this collector's enclosing response, final replies and later work may be absent. Milestones are explicitly recorded evidence, not inferred file timestamps. Local compute, external services, tax and currency conversion are unmeasured. No message or reasoning bodies are exported.",
              "pricing": pricing_info, "diagnostics": diagnostics, "warnings": warnings,
              **summarize(rows, rates)}
    write_json(output / "usage-records.json", rows)
    write_json(output / "report.json", report)
    (output / "report.md").write_text(markdown(report), encoding="utf-8")
    return report
