"""Preserve lyric production inputs and statically compare grouped MusicXML."""

import argparse
from copy import deepcopy
from fractions import Fraction as F
import hashlib
import json
from pathlib import Path
import shutil

from lxml import etree as E
from common.lyric_onsets import lyric_onsets, audit_lyric_onsets
from common.musicxml import validate_schema


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def read_xml(path):
    return E.parse(str(path), E.XMLParser(no_network=True, resolve_entities=False))


def metadata(tree):
    fields = tree.findall("identification/miscellaneous/miscellaneous-field")
    values = [
        f for f in fields if f.get("name", "").startswith("drum-practice:score:v")
    ]
    if len(values) != 1:
        raise ValueError(f"Expected one canonical manifest, actual={len(values)}")
    return json.loads(values[0].text), fields


def save_json(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def prepare(args):
    source = args.xml.resolve()
    tree = read_xml(source)
    data, fields = metadata(tree)
    if data["version"] != 2:
        raise ValueError(f"Production migration expects v2, actual={data['version']}")
    rows = lyric_onsets(tree.getroot())
    identity = {item["id"]: item for item in data["lyrics"]}
    if len(rows) != len(identity) or any(row["id"] not in identity for row in rows):
        raise ValueError(
            f"Lyric identity mismatch: XML={len(rows)}, manifest={len(identity)}"
        )
    for row in rows:
        row["confirmed"] = identity[row["id"]]["confirmed"]
        row["measureId"] = data["measures"][row["measureIndex"]]["id"]
    # Source snapshots retain complete bytes; extracted fields make the audit usable.
    removed = [
        dict(name=f.get("name"), value=f.text)
        for f in fields
        if "lyric" in f.get("name", "")
    ]
    args.out.mkdir(parents=True, exist_ok=False)
    shutil.copyfile(source, args.out / "before.musicxml")
    work = dict(
        version=1,
        input=dict(path=str(source), sha256=digest(source)),
        sourceManifest=data,
        removedFields=removed,
        lyrics=rows,
    )
    if args.song:
        shutil.copyfile(args.song, args.out / "before-song.json")
        work["sourceSong"] = dict(
            path=str(args.song.resolve()), sha256=digest(args.song)
        )
    save_json(args.out / "work.json", work)
    print(
        json.dumps(
            dict(path=str(args.out), syllables=len(rows), sourceSHA256=digest(source))
        )
    )


def without_lyric_changes(tree, removed_names):
    root = deepcopy(tree.getroot())
    for measure in root.findall("part/measure"):
        inside = False
        for node in list(measure):
            if (
                isinstance(node, E._Comment)
                and node.text == "drum-practice:lyric-voices:start"
            ):
                inside = True
            if inside:
                measure.remove(node)
            if (
                isinstance(node, E._Comment)
                and node.text == "drum-practice:lyric-voices:end"
            ):
                inside = False
        if inside:
            raise ValueError(
                f"Unterminated lyric block: measure={measure.get('number')}"
            )
    misc = root.find("identification/miscellaneous")
    for field in list(misc):
        name = field.get("name", "")
        if name.startswith("drum-practice:score:v") or name in removed_names:
            misc.remove(field)
    # XML serializer whitespace is not musical data.
    for node in root.iter():
        if node.text is not None and not node.text.strip():
            node.text = None
        if node.tail is not None and not node.tail.strip():
            node.tail = None
    return E.tostring(root, method="c14n")


def verify(args):
    work = json.loads((args.out / "work.json").read_text())
    groups = json.loads((args.out / "groups.json").read_text())
    before = read_xml(args.out / "before.musicxml")
    output = args.out / "score.musicxml"
    after = read_xml(output)
    old, _ = metadata(before)
    new, fields = metadata(after)
    removed = {f["name"] for f in work["removedFields"]}
    preserved_before = without_lyric_changes(before, removed)
    preserved_after = without_lyric_changes(after, removed)
    checks = {
        "sourceSnapshot": digest(args.out / "before.musicxml")
        == work["input"]["sha256"],
        "sourceUnchanged": digest(work["input"]["path"]) == work["input"]["sha256"],
        "manifestVersion": new["version"] == 3,
        "drumAndOtherXML": preserved_before == preserved_after,
        "otherManifest": {
            k: v for k, v in old.items() if k not in ("version", "lyrics")
        }
        == {k: v for k, v in new.items() if k not in ("version", "lyrics")},
        "rawLyricFieldsRemoved": not any(f.get("name") in removed for f in fields),
    }
    if "sourceSong" in work:
        checks["sourceSongUnchanged"] = (
            digest(work["sourceSong"]["path"]) == work["sourceSong"]["sha256"]
        )
        checks["sourceSongSnapshot"] = (
            digest(args.out / "before-song.json") == work["sourceSong"]["sha256"]
        )
    sources = {row["id"]: row for row in work["lyrics"]}
    flattened = [sid for group in groups["groups"] for sid in group["sourceIds"]]
    checks["allSourceIdsExactlyOnce"] = flattened == [r["id"] for r in work["lyrics"]]
    rows = lyric_onsets(after.getroot())
    identities = {row["id"]: row for row in new["lyrics"]}
    mismatches = []
    expected_groups = {}
    for group in groups["groups"]:
        first = sources[group["sourceIds"][0]]
        members = [sources[sid] for sid in group["sourceIds"]]
        end = max(F(s["absoluteQuarter"]) + F(s["durationQuarters"]) for s in members)
        expected_groups[group["id"]] = (
            group["text"],
            F(first["absoluteQuarter"]),
            end - F(first["absoluteQuarter"]),
            all(s["confirmed"] for s in members),
        )
    # Replay semantics live in the shared app module. Here compare its recorded
    # accepted before/after changes to the grouping baseline and serialized XML.
    corrections = groups.get("corrections", {})
    checks["confirmedCorrectionsResolved"] = not corrections.get("conflicts")
    if corrections:
        checks["correctionOutputHash"] = corrections["outputSHA256"] == digest(output)
        input_hash = groups.get("correctionInput", {}).get("sha256")
        if input_hash:
            checks["correctionInputSnapshot"] = (
                digest(args.out / "corrections.json") == input_hash
            )
    starts = {}
    offset = F(0)
    for measure in new["measures"]:
        starts[measure["id"]] = offset
        offset += F(measure["beats"] * 4, measure["denominator"])

    def corrected_value(value):
        if value is None:
            return None
        position = value["scorePosition"]
        return (
            value["text"],
            starts[position["measureId"]] + F(str(position["quarterOffset"])),
            F(str(position["durationQuarters"])),
            value["confirmed"],
        )

    for change in corrections.get("changes", []):
        before_value, after_value = change.get("before"), change.get("after")
        key = (before_value or after_value)["id"]
        if expected_groups.get(key) != corrected_value(before_value):
            raise ValueError(
                f"Correction baseline differs from source groups: id={key}"
            )
        if after_value:
            expected_groups[key] = corrected_value(after_value)
        else:
            expected_groups.pop(key, None)
    checks["groupCount"] = len(rows) == len(expected_groups) == len(new["lyrics"])
    checks["groupIDs"] = set(expected_groups) == {row["id"] for row in rows}
    for row in rows:
        expected = expected_groups.get(row["id"])
        actual = (
            row["text"],
            F(row["absoluteQuarter"]),
            F(row["durationQuarters"]),
            identities[row["id"]]["confirmed"],
        )
        if expected != actual:
            mismatches.append(
                dict(
                    id=row["id"],
                    expected=None if expected is None else list(map(str, expected)),
                    actual=list(map(str, actual)),
                )
            )
    checks["groupPositionsTextAndConfirmation"] = not mismatches
    checks["leftJustified"] = all(
        node.get("justify") == "left"
        for node in after.findall("part/measure/note/lyric")
    )
    validate_schema(output, args.schema)
    checks["musicxml40XSD"] = True
    audit = audit_lyric_onsets(after.getroot())
    checks["distinctOnsetsAndGrid64"] = audit["status"] == "PASS"
    report = dict(
        status="PASS" if all(checks.values()) else "FAIL",
        scope="static XML, rational positions, schema and file preservation; no renderer or regression execution",
        checks=checks,
        sourceSHA256=work["input"]["sha256"],
        outputSHA256=digest(output),
        protectedXMLSHA256=hashlib.sha256(preserved_before).hexdigest(),
        sourceLyrics=len(sources),
        groups=len(rows),
        measures=len(new["measures"]),
        measureLyrics=len(new.get("measureLyrics", [])),
        mismatches=mismatches,
        onsetAudit=audit,
    )
    save_json(args.out / "static-verification.json", report)
    print(
        json.dumps(
            {
                k: report[k]
                for k in ("status", "checks", "sourceLyrics", "groups", "outputSHA256")
            }
        )
    )
    if report["status"] != "PASS":
        raise SystemExit(1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("prepare")
    p.add_argument("--xml", type=Path, required=True)
    p.add_argument("--song", type=Path)
    p.add_argument("--out", type=Path, required=True)
    p = sub.add_parser("verify")
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--schema", type=Path, required=True)
    args = parser.parse_args()
    (prepare if args.command == "prepare" else verify)(args)


if __name__ == "__main__":
    main()
