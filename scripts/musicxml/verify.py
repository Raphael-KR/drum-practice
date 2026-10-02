"""Independent XML timeline/schema checks plus manually read representative rhythms."""

import argparse, json, hashlib
from collections import Counter
from fractions import Fraction as F
from pathlib import Path
from lxml import etree as E
from convert import INSTRUMENTS

# Read from original crops. Symbols denote source staff positions; R = rest.
EXPECTED = {
    9: {
        1: "X:1/2 H:1/2 H+S:1/2 H:1/4 S:1/4 H:1/2 H:1/2 H+S:1/2 H:1/4 S:1/4",
        2: "K:1 R:1 R:1/2 K:1/2 R:1",
    },
    12: {
        1: "H:1/2 H:1/2 H+S:1/2 H:1/4 S:1/4 H:1/2 H:1/4 S:1/4 H:1/4 S:1/4 L:1/2",
        2: "K:1/2 K:1/2 R:1 R:1/2 K:1/2 R:1",
    },
    84: {
        1: "R:1/2 S+L:1/2 S+L:1/2 S+L:1/2 S+L:1/2 S+L:1/2 S+L:1/2 S:1/4 S:1/4 R:1",
        2: "R:1 K:1 K:1 K:1/2 K:1/4 K:1/4 R:1",
    },
}
IDS = {"X": "crash", "H": "hh", "S": "snare", "L": "tom-low", "K": "kick", "R": "rest"}


class Resolver(E.Resolver):
    def __init__(self, directory):
        self.directory = directory

    def resolve(self, url, pubid, context):
        local = self.directory / url.split("/")[-1]
        if local.exists():
            return self.resolve_filename(str(local.resolve()), context)


def verify(xml, ir, schema):
    p = E.XMLParser()
    p.resolvers.add(Resolver(schema))
    xsd = E.XMLSchema(E.parse(str(schema / "musicxml.xsd"), p))
    doc = E.parse(str(xml))
    xsd.assertValid(doc)
    measures = doc.findall("./part/measure")
    assert [int(m.get("number")) for m in measures] == [b["number"] for b in ir]
    assert doc.find(".//sound").get("tempo") == "94"
    div = 48
    beats = 4
    rows = []
    allnotes = 0
    repeat_active = False
    mappings = {row[0]: row for row in INSTRUMENTS.values()}
    for m, b in zip(measures, ir):
        n = int(m.get("number"))
        repeat_style = m.find("./attributes/measure-style/measure-repeat")
        if repeat_style is not None:
            repeat_active = repeat_style.get("type") == "start"
        assert repeat_active == bool(b.get("repeat")), (n, "repeat style")
        t = m.find("./attributes/time/beats")
        if t is not None:
            beats = int(t.text)
        assert beats == (5 if n == 84 else 4)
        cursor = 0
        last = {}
        notes = []
        voice_events = {}
        for el in m:
            if el.tag == "backup":
                cursor -= int(el.findtext("duration"))
                assert cursor >= 0
            elif el.tag == "forward":
                raise AssertionError("No unresolved forwards permitted")
            elif el.tag == "note":
                voice = int(el.findtext("voice"))
                duration = int(el.findtext("duration", "0"))
                grace = el.find("grace") is not None
                chord = el.find("chord") is not None
                onset = last[voice] if chord else cursor
                if not chord:
                    last[voice] = onset
                    cursor += duration
                if not grace:
                    typ = el.findtext("type")
                    nominal = {
                        "whole": 4,
                        "half": 2,
                        "quarter": 1,
                        "eighth": F(1, 2),
                        "16th": F(1, 4),
                        "32nd": F(1, 8),
                    }.get(typ, beats)
                    if el.find("dot") is not None:
                        nominal *= F(3, 2)
                    if el.find("time-modification") is not None:
                        nominal *= F(
                            int(el.findtext("time-modification/normal-notes")),
                            int(el.findtext("time-modification/actual-notes")),
                        )
                    assert nominal * div == duration, (
                        n,
                        "duration/type",
                        nominal,
                        duration,
                    )
                id = el.find("instrument")
                instrument = "rest" if id is None else id.get("id").removeprefix("P1-")
                if instrument != "rest":
                    assert el.find("unpitched") is not None
                    mapped = mappings[instrument]
                    assert el.findtext("unpitched/display-step") == mapped[3]
                    assert el.findtext("unpitched/display-octave") == str(mapped[4])
                    expected_head = "normal" if instrument == "hh-open" else mapped[5]
                    assert el.findtext("notehead") == expected_head
                    if instrument == "hh-open":
                        assert el.find("notehead").get("filled") == "no"
                notes.append((voice, onset, duration, instrument, grace))
                if not chord and not grace:
                    voice_events.setdefault(voice, []).append(
                        [onset, duration, [instrument]]
                    )
                elif chord:
                    voice_events[voice][-1][2].append(instrument)
        assert cursor == beats * div, (n, "cursor", cursor)
        for v, events in voice_events.items():
            assert events[0][0] == 0
            assert sum(e[1] for e in events) == beats * div, (n, v, "sum")
            for a, c in zip(events, events[1:]):
                assert a[0] + a[1] == c[0]
        expected = []
        for e in b["events"]:
            for h in e.get("heads", [None]):
                id = "rest" if h is None else INSTRUMENTS[(h["glyph"], h["pos"])][0]
                expected.append(
                    (
                        e["voice"],
                        round(e["onset"] * div),
                        round(e["duration"] * div),
                        id,
                        bool(e.get("grace")),
                    )
                )
        assert Counter(notes) == Counter(expected), (n, "XML/IR mismatch")
        if n in EXPECTED:
            for v, text in EXPECTED[n].items():
                manual = [
                    (
                        F(t.split(":")[1]) * div,
                        sorted(IDS[i] for i in t.split(":")[0].split("+")),
                    )
                    for t in text.split()
                ]
                actual = [(dur, sorted(ids)) for onset, dur, ids in voice_events[v]]
                assert manual == actual, (n, v, "manual fixture mismatch")
        heads = sum(len(e.get("heads", [])) for e in b["events"])
        if not b.get("repeat"):
            assert heads == sum(c["text"] in {"œ", "o", "x"} for c in b["glyphs"]), (
                n,
                "source head conservation",
            )
        # Same onset in two voices must align in the original, independently of note spacing.
        if not b.get("repeat"):
            for a in b["events"]:
                for c in b["events"]:
                    if (
                        a["voice"] != c["voice"]
                        and not a.get("grace")
                        and abs(a["onset"] - c["onset"]) < 1e-7
                    ):
                        assert abs(a["x"] - c["x"]) < 2, (
                            n,
                            "cross-voice source alignment",
                        )
        uncertainty = []
        if heads:
            uncertainty.append(
                "instrument identities conventional; original has no instrument legend"
            )
        if n == 7:
            uncertainty.append(
                "grace playback timing and tremolo attack rate unspecified by source"
            )
        if b.get("repeat"):
            uncertainty.append(
                "renderer compresses percent-repeat width and adds repetition counter"
            )
        rows.append(
            dict(
                measure=n,
                page=b["page"],
                rhythm="schema/timeline/source-alignment pass",
                review=(
                    "detailed original/render comparison"
                    if n in [7, 9, 12, 72, 84, 100]
                    else "page-level visual scan; no separate manual rhythm fixture"
                ),
                source_heads=heads,
                repeat_source=b.get("repeat"),
                decisions=b.get("decisions", []),
                uncertainty=uncertainty,
            )
        )
        allnotes += len(notes)
    if len(ir) == 110:
        assert [b["number"] for b in ir if b.get("repeat")] == [6, 43, 44, 47, 51, 103]
        assert len(doc.findall(".//time-modification")) == 12
        assert len(doc.findall(".//grace")) == 1
        assert len(doc.findall(".//tie")) == 2
        assert doc.findtext(".//multiple-rest") == "4"
        assert len(doc.findall('.//print[@new-page="yes"]')) == 2
    return dict(
        status="PASS",
        schema="W3C MusicXML 4.0",
        measure_count=len(ir),
        xml_notes=allnotes,
        xml_sha256=hashlib.sha256(xml.read_bytes()).hexdigest(),
        total_quarter_beats=sum(5 if b["number"] == 84 else 4 for b in ir),
        measure_audit=rows,
    )


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--xml", type=Path, required=True)
    p.add_argument("--ir", type=Path, required=True)
    p.add_argument("--schema", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    a = p.parse_args()
    ir = json.loads(a.ir.read_text())
    numbers = [
        int(e.get("number")) for e in E.parse(str(a.xml)).findall("./part/measure")
    ]
    ir = [b for b in ir if b["number"] in numbers]
    report = verify(a.xml, ir, a.schema)
    a.out.write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print({k: v for k, v in report.items() if k != "measure_audit"})
