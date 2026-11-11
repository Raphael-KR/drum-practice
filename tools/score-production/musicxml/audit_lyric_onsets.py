"""Read-only audit of actual MusicXML lyric starts; no automatic correction."""

import argparse
import json
from pathlib import Path
from lxml import etree as E
from common.lyric_onsets import audit_lyric_onsets


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("musicxml", nargs="+", type=Path)
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()
    rows = []
    for path in args.musicxml:
        try:
            root = E.parse(
                str(path), E.XMLParser(no_network=True, resolve_entities=False)
            ).getroot()
            rows.append(dict(path=str(path), **audit_lyric_onsets(root)))
        except (OSError, ValueError, E.XMLSyntaxError, KeyError, TypeError) as error:
            rows.append(
                dict(
                    path=str(path),
                    status="ERROR",
                    error=f"{type(error).__name__}: {error}",
                )
            )
    report = dict(
        status="PASS" if all(r["status"] == "PASS" for r in rows) else "NEEDS_REVIEW",
        results=rows,
    )
    text = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.out:
        args.out.write_text(text)
    else:
        print(text, end="")
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
