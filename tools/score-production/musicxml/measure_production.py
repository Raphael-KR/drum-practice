#!/usr/bin/env python3
"""Record production stages, then collect local Codex usage once at finish.

Evidence arguments must be paths/receipt identifiers or brief status metadata,
never private message text. Pricing is an optional dated reference rates JSON.
"""
import argparse
import json
import sys
from pathlib import Path
from common.measurement import finish, mark, start


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    begin = commands.add_parser("start", help="Create run.json in a fresh output directory")
    begin.add_argument("--out", required=True, type=Path)
    begin.add_argument("--label", required=True)
    begin.add_argument("--root-log", required=True, type=Path)
    begin.add_argument("--root-turn-id", required=True)
    begin.add_argument("--sessions-root", type=Path, default=Path.home() / ".codex/sessions",
                       help="Recursive discovery scope; default ~/.codex/sessions. Explicit root log is always included")
    milestone = commands.add_parser("mark", help="Record an explicit stage/status/evidence timestamp")
    milestone.add_argument("--out", required=True, type=Path)
    milestone.add_argument("--stage", required=True)
    milestone.add_argument("--status", required=True)
    milestone.add_argument("--evidence", required=True, help="Metadata only: path or receipt/status identifier")
    milestone.add_argument("--at", help="Observed ISO timestamp with timezone; default now")
    end = commands.add_parser("finish", help="Write report.json, report.md and metadata-only usage-records.json")
    end.add_argument("--out", required=True, type=Path)
    end.add_argument("--cutoff", help="ISO timestamp with timezone; default now")
    end.add_argument("--pricing", type=Path, help="Dated rates JSON; omitted/unsupported rates remain unpriced")
    args = parser.parse_args()
    try:
        if args.command == "start":
            run = start(args.out, args.label, args.root_log, args.root_turn_id, args.sessions_root)
            result = {"command": "start", "run": str(args.out.resolve() / "run.json"),
                      "started_at": run["started_at"], "root_thread_id": run["root_thread_id"],
                      "sessions_root": run["sessions_root"],
                      "warning_count": len(run["start_warnings"])}
        elif args.command == "mark":
            result = {"command": "mark", **mark(args.out, args.stage, args.status, args.evidence, args.at)}
        else:
            report = finish(args.out, args.cutoff, args.pricing)
            result = {"command": "finish", "report": str(args.out.resolve() / "report.json"),
                      "snapshot_at": report["snapshot_at"], "response_count": report["response_count"],
                      "total_tokens": report["tokens"]["total_tokens"],
                      "reference_api_usd_priced_subset": report["reference_api_usd_priced_subset"],
                      "unpriced_tokens": report["unpriced_tokens"]["total_tokens"],
                      "sessions_root": report["coverage"]["sessions_root"],
                      "scanned_logs": report["diagnostics"]["scanned_log_count"],
                      "scan_bytes": report["diagnostics"]["bytes_read"],
                      "scan_seconds": report["diagnostics"]["scan_elapsed_seconds"],
                      "warning_count": len(report["warnings"])}
    except (OSError, ValueError, KeyError) as error:
        print(json.dumps({"command": args.command, "error": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
