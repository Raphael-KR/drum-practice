"""Source-specific vector PDF transcription. No timing inferred from beatXs."""

import argparse, copy, hashlib, json, logging
from fractions import Fraction
from pathlib import Path
import xml.etree.ElementTree as ET
import pdfplumber

logging.getLogger("pdfminer").setLevel(logging.ERROR)
EXPECTED_PDF_SHA256 = "33a98caa89daee7c5d9d56f272f73f0f8f6e9cb6526fe80af6c5f798807bcefd"
HEADS = {"œ", "x", "o"}
RESTS = {"Œ": 1, "‰": 0.5, "≈": 0.25, "∑": 4}
UNIT = 2.56245
# Staff top = F5. Instrument names are conventional interpretations, not a source legend.
INSTRUMENTS = {
    ("œ", 7): ("kick", "Bass drum", 36, "F", 4, "normal"),
    ("œ", 3): ("snare", "Snare", 38, "C", 5, "normal"),
    ("œ", 1): ("tom-high", "High tom", 50, "E", 5, "normal"),
    ("œ", 2): ("tom-mid", "Mid tom", 47, "D", 5, "normal"),
    ("œ", 5): ("tom-low", "Low tom", 43, "A", 4, "normal"),
    ("x", 0): ("ride", "Ride cymbal", 51, "F", 5, "x"),
    ("x", -1): ("hh", "Closed hi-hat", 42, "G", 5, "x"),
    ("o", -1): ("hh-open", "Open hi-hat", 46, "G", 5, "circle-x"),
    ("x", -2): ("crash", "Crash cymbal", 49, "A", 5, "x"),
    ("x", 3): ("cross-stick", "Cross stick", 37, "C", 5, "x"),
}


def extract(page, geo, left, right, number):
    staff = geo["staff"]
    chars = [
        dict(c)
        for c in page.chars
        if left - 0.1 <= c["x0"] < right - 0.3
        and geo["top"] - 2 <= c["top"] < geo["bottom"] + 10
        and ("Maestro" in c["fontname"])
    ]
    lines = [
        l
        for l in page.lines
        if l["width"] < 0.1
        and 7 < l["height"] < 50
        and left < l["x0"] < right
        and geo["top"] - 10 < l["top"] < geo["bottom"]
    ]
    beams = [
        c
        for c in page.curves
        if c["fill"]
        and len(c["pts"]) == 4
        and all(p[0] in {"m", "l", "h"} for p in c.get("path", []))
        and c["width"] > 3
        and c["height"] < 15
        and left - 1 < c["x0"] < right
        and geo["top"] - 10 < c["top"] < geo["bottom"]
    ]
    events = []
    issues = []
    if number <= 4 or number == 110:
        return (
            [{"voice": 1, "x": left, "duration": 4, "rest": True, "whole": True}],
            [],
            chars,
        )
    if any(c["text"] == "‘" for c in chars):
        return [], ["repeat"], chars
    for c in chars:
        if c["text"] not in HEADS | set(RESTS):
            continue
        if c["text"] in RESTS:
            # Lower voice rests are displaced below the staff in this engraving.
            voice = 2 if c["top"] - staff > 20 else 1
            events.append(
                dict(
                    x=c["x0"],
                    voice=voice,
                    duration=RESTS[c["text"]],
                    rest=True,
                    glyph=c["text"],
                )
            )
            continue
        pos = round((c["top"] + 7.749 - staff) / UNIT)
        candidates = []
        for l in lines:
            for voice, dx in [
                (1, abs(l["x0"] - (c["x1"] - 0.2))),
                (2, abs(l["x0"] - (c["x0"] + 0.19))),
            ]:
                y = c["top"] + 7.749
                if dx < 1.1 and l["top"] - 2 < y < l["bottom"] + 3:
                    candidates.append((dx, voice, l))
        if not candidates:
            issues.append(f"unmatched head {c['text']} x={c['x0']:.2f} pos={pos}")
            continue
        _, voice, stem = min(candidates, key=lambda a: a[0])
        existing = next(
            (
                e
                for e in events
                if e.get("stem") == round(stem["x0"], 3) and e["voice"] == voice
            ),
            None,
        )
        head = dict(
            glyph=c["text"], pos=pos, x=round(c["x0"], 3), top=round(c["top"], 3)
        )
        if (c["text"], pos) not in INSTRUMENTS:
            issues.append(f'unknown instrument {c["text"]}/{pos}')
        if existing:
            existing["heads"].append(head)
            continue
        tip = stem["top"] if voice == 1 else stem["bottom"]
        bs = []
        for b in beams:
            if b["x0"] - 0.4 <= stem["x0"] <= b["x1"] + 0.4:
                # Each filled quadrilateral is one beam; evaluate at stem X.
                pts = b["pts"]
                y = (
                    pts[0][1]
                    + (pts[1][1] - pts[0][1])
                    * (stem["x0"] - pts[0][0])
                    / (pts[1][0] - pts[0][0])
                    if pts[1][0] != pts[0][0]
                    else b["top"]
                )
                if -2 < y - tip < 10 if voice == 1 else -10 < y - tip < 2:
                    bs.append(b)
        flags = [
            f
            for f in chars
            if f["text"] in {"ι", "Ι"}
            and abs(f["x0"] - stem["x0"]) < 1
            and abs(f["top"] - tip) < 12
        ]
        level = len(bs) or bool(flags)
        duration = 1 / (2**level)
        dots = [
            d
            for d in chars
            if d["text"] == "−"
            and 5 < d["x0"] - c["x0"] < 14
            and abs(d["top"] - c["top"]) < 8
        ]
        if dots:
            duration *= 1.5
        events.append(
            dict(
                x=c["x0"],
                voice=voice,
                heads=[head],
                stem=round(stem["x0"], 3),
                duration=duration,
                beams=[dict(x0=b["x0"], x1=b["x1"]) for b in bs],
                dot=bool(dots),
                flag=bool(flags),
            )
        )
    events.sort(key=lambda e: (e["voice"], e["x"]))
    for voice in (1, 2):
        total = 0
        for e in (e for e in events if e["voice"] == voice):
            e["onset"] = total
            total += e["duration"]
        expected = 5 if number == 84 else 4
        if total != expected:
            issues.append(f"voice {voice} total {total} != {expected}")
    return events, issues, chars


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdf", type=Path, required=True)
    ap.add_argument("--geometry", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256(args.pdf.read_bytes()).hexdigest()
    if digest != EXPECTED_PDF_SHA256:
        raise ValueError("Source-specific decisions require the verified PDF digest")
    geometry = json.loads(args.geometry.read_text())
    bars = []
    with pdfplumber.open(args.pdf) as pdf:
        for g in geometry:
            edges = g["edges"]
            if g["start"] == 1:
                edges = [edges[0] + (edges[-1] - edges[0]) * i / 4 for i in range(5)]
            for i, (l, r) in enumerate(zip(edges, edges[1:])):
                n = g["start"] + i
                ev, issues, chars = extract(pdf.pages[g["page"]], g, l, r, n)
                bars.append(
                    dict(
                        number=n,
                        page=g["page"] + 1,
                        system=g["start"],
                        bounds=[l, g["top"], r, g["bottom"]],
                        staff=g["staff"],
                        events=ev,
                        issues=issues,
                        glyphs=[
                            dict(
                                text=c["text"],
                                x=round(c["x0"], 3),
                                top=round(c["top"], 3),
                            )
                            for c in chars
                        ],
                    )
                )
    apply_source_decisions(bars)
    for b in bars:
        if b["issues"] == ["repeat"]:
            b["repeat"] = b["number"] - 1
            b["events"] = copy.deepcopy(bars[b["number"] - 2]["events"])
            b["issues"] = copy.deepcopy(bars[b["number"] - 2]["issues"])
    (args.out / "extracted.json").write_text(
        json.dumps(bars, ensure_ascii=False, indent=2)
    )
    print("bars", len(bars), "clean", sum(not b["issues"] for b in bars))
    (args.out / "provenance.json").write_text(
        json.dumps(
            {
                "pdf": str(args.pdf),
                "pdf_sha256": digest,
                "geometry_sha256": hashlib.sha256(
                    args.geometry.read_bytes()
                ).hexdigest(),
                "source_pages": 3,
            },
            indent=2,
        )
    )
    for b in bars:
        if b["issues"]:
            print(b["number"], b["issues"])


def apply_source_decisions(bars):
    """Explicit decisions from source crops, never a fit-to-total repair."""
    shared = {8: [0], 84: [-1], 107: [1, 2, 3], 108: [-2, -1], 109: [1, 2, 3]}
    for b in bars:
        n = b["number"]
        up = [e for e in b["events"] if e["voice"] == 1]
        b["decisions"] = []
        b["section"] = {
            1: "Intro",
            9: "A",
            25: "サビ",
            41: "A",
            57: "サビ",
            73: "C",
            81: "Interlude",
            85: "サビ",
            101: "Ending",
        }.get(n)
        if n in shared:
            for index in shared[n]:
                e = copy.deepcopy(up[index])
                assert e.get("rest")
                e.update(voice=2, hidden=True, shared=True)
                b["events"].append(e)
            b["decisions"].append(
                "Source rest shared by both voices; duplicate hidden rest completes voice 2."
            )
        if n in [72, 100]:
            for i, e in enumerate(up[-6:]):
                assert e["duration"] == 0.25
                e.update(
                    duration=1 / 6,
                    tuplet=[6, 4],
                    tuplet_edge="start" if i == 0 else "stop" if i == 5 else None,
                )
            b["decisions"].append(
                "Final six 16ths have printed 6: sextuplet 6 in time of 4."
            )
        if n == 7:
            up[1]["tremolo"] = 3
            up[1]["tie"] = "start"
            up[2]["tie"] = "stop"
            b["events"].append(
                dict(
                    x=391.635,
                    voice=1,
                    duration=0,
                    grace=True,
                    heads=[dict(glyph="œ", pos=3, x=391.635, top=214.76)],
                    beams=[],
                    flag=True,
                )
            )
            b["decisions"].append(
                "Small slashed snare grace before x=400.39; dotted quarter crash tremolo (3 strokes) tied to eighth."
            )
        if b["issues"] == ["repeat"]:
            continue
        b["events"].sort(key=lambda e: (e["voice"], e["x"]))
        b["raw_issues"] = b["issues"]
        b["issues"] = []
        for issue in b["raw_issues"]:
            if not issue.startswith("voice ") and not (
                n == 7 and "unmatched head œ x=391.63" in issue
            ):
                b["issues"].append(issue)
        for v in set(e["voice"] for e in b["events"]):
            onset = Fraction(0)
            for e in (e for e in b["events"] if e["voice"] == v):
                e["onset"] = float(onset)
                onset += Fraction(e["duration"]).limit_denominator(48)
            expected = 5 if n == 84 else 4
            if onset != expected:
                b["issues"].append(f"voice {v} total {onset} != {expected}")


if __name__ == "__main__":
    main()
