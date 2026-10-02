"""Read-only comparison against separately transcribed PDF sample measures.
The sample is independent of both generated XML files and extracted.json.
F1 counts simultaneous noteheads separately; rest segmentation and voice labels
are ignored so equivalent MusicXML encodings are not penalized.
"""

import argparse, copy, hashlib, json
from collections import Counter, defaultdict
from fractions import Fraction as F
from pathlib import Path
from lxml import etree as E
from verify import Resolver

# Source-read tokens: glyph/staff roles; labels do not establish a source drum legend.
# R rest, X high cross cymbal, Y top-line cross cymbal, H above-staff hi-hat,
# O above-staff open head, S normal C5, T normal E5, M normal D5, L normal A4, K normal F4.
SOURCE = {
    5: {1: "Y:3/4 Y:1/4 R:1/2 Y:1/2 R:1/2 Y:1/2 Y:1/4 Y:3/4", 2: "R:1 R:1 R:1 R:1"},
    7: {1: "Y:1/2 X:3/2 X:1/2 S:0 S:1/2 L:1/2 X:1/2", 2: "R:1 R:1 R:1 R:1/2 K:1/2"},
    9: {
        1: "X:1/2 H:1/2 H+S:1/2 H:1/4 S:1/4 H:1/2 H:1/2 H+S:1/2 H:1/4 S:1/4",
        2: "K:1 R:1 R:1/2 K:1/2 R:1",
    },
    12: {
        1: "H:1/2 H:1/2 H+S:1/2 H:1/4 S:1/4 H:1/2 H:1/4 S:1/4 H:1/4 S:1/4 L:1/2",
        2: "K:1/2 K:1/2 R:1 R:1/2 K:1/2 R:1",
    },
    72: {
        1: "O:1/2 T:1/4 S:1/4 R:1/4 T:1/2 S:1/4 M:1/2 M:1/4 M:1/4 S:1/6 S:1/6 T:1/6 T:1/6 L:1/6 L:1/6",
        2: "K:1 R:1 R:1 R:1",
    },
    84: {
        1: "R:1/2 S+L:1/2 S+L:1/2 S+L:1/2 S+L:1/2 S+L:1/2 S+L:1/2 S:1/4 S:1/4 R:1",
        2: "R:1 K:1 K:1 K:1/2 K:1/4 K:1/4 R:1",
    },
    100: {
        1: "X:1/2 X:1/2 T:1/4 T:1/2 M:1/4 M:1/2 M:1/4 M:1/4 T:1/6 T:1/6 M:1/6 M:1/6 L:1/6 L:1/6",
        2: "K:1/2 K:1/2 R:1 R:1 R:1",
    },
}
ROLE_GM = {
    "Y": 51,
    "X": 49,
    "H": 42,
    "O": 46,
    "S": 38,
    "T": 50,
    "M": 47,
    "L": 43,
    "K": 36,
}
ROLE_DISPLAY = {
    "Y": ("F5", "x"),
    "X": ("A5", "x"),
    "H": ("G5", "x"),
    "O": ("G5", "o"),
    "S": ("C5", "normal"),
    "T": ("E5", "normal"),
    "M": ("D5", "normal"),
    "L": ("A4", "normal"),
    "K": ("F4", "normal"),
}


def reference():
    notes = []
    for bar, voices in SOURCE.items():
        for voice, tokens in voices.items():
            onset = F(0)
            for token in tokens.split():
                roles, dur = token.split(":")
                duration = F(dur)
                for role in roles.split("+"):
                    if role != "R":
                        display, head = ROLE_DISPLAY[role]
                        notes.append(
                            dict(
                                bar=bar,
                                onset=onset,
                                duration=duration,
                                gm=ROLE_GM[role],
                                display=display,
                                head=head,
                                grace=duration == 0,
                            )
                        )
                onset += duration
            assert onset == (5 if bar == 84 else 4), (bar, voice, onset)
    return notes


def read(path):
    doc = E.parse(str(path), E.XMLParser(resolve_entities=False, no_network=True))
    gm = {
        e.get("id"): int(e.findtext("midi-unpitched")) - 1
        for e in doc.findall(".//midi-instrument")
        if e.find("midi-unpitched") is not None
    }
    notes = []
    measures = []
    div = 1
    expected = F(4)
    errors = []
    for measure in doc.findall("./part/measure"):
        bar = int(measure.get("number"))
        cursor = F(0)
        last = F(0)
        voices = defaultdict(list)
        if measure.find("./attributes/divisions") is not None:
            div = int(measure.findtext("./attributes/divisions"))
        if measure.find("./attributes/time") is not None:
            expected = (
                F(measure.findtext("./attributes/time/beats"))
                * 4
                / F(measure.findtext("./attributes/time/beat-type"))
            )
        for el in measure:
            if el.tag in ("backup", "forward"):
                cursor += (-1 if el.tag == "backup" else 1) * F(
                    int(el.findtext("duration")), div
                )
            if el.tag != "note":
                continue
            grace = el.find("grace") is not None
            duration = F(el.findtext("duration", "0")) / div
            chord = el.find("chord") is not None
            onset = last if chord else cursor
            if not chord:
                last = onset
                cursor += duration
            voice = el.findtext("voice", "1")
            if not chord and not grace:
                voices[voice].append((onset, onset + duration))
            typ = el.findtext("type")
            type_dur = {
                "whole": F(4),
                "half": F(2),
                "quarter": F(1),
                "eighth": F(1, 2),
                "16th": F(1, 4),
                "32nd": F(1, 8),
            }.get(typ, expected)
            type_dur *= 2 - F(1, 2 ** len(el.findall("dot")))
            tm = el.find("time-modification")
            if tm is not None:
                type_dur *= F(tm.findtext("normal-notes")) / F(
                    tm.findtext("actual-notes")
                )
            if not grace and type_dur != duration:
                errors.append((bar, "type-duration"))
            if el.find("rest") is not None:
                continue
            instrument = el.find("instrument")
            head = el.findtext("notehead", "normal")
            if head == "circle-x" or (
                head == "normal"
                and el.find("notehead") is not None
                and el.find("notehead").get("filled") == "no"
            ):
                head = "o"
            notes.append(
                dict(
                    bar=bar,
                    onset=onset,
                    duration=duration,
                    gm=gm.get(instrument.get("id")) if instrument is not None else None,
                    display=el.findtext("unpitched/display-step", "?")
                    + el.findtext("unpitched/display-octave", "?"),
                    head=head,
                    grace=grace,
                )
            )
        valid = bool(voices)
        for voice, intervals in voices.items():
            intervals.sort()
            valid &= (
                intervals[0][0] == 0
                and intervals[-1][1] == expected
                and all(a[1] == b[0] for a, b in zip(intervals, intervals[1:]))
            )
        measures.append(
            dict(number=bar, beats=str(expected), voice_totals_valid=bool(valid))
        )
    return doc, notes, measures, errors


def f1(expected, actual, keys):
    def counter(items):
        return Counter(tuple(n[k] for k in keys) for n in items if not n["grace"])

    ref = counter(expected)
    got = counter(actual)
    tp = sum((ref & got).values())
    nr = sum(ref.values())
    ng = sum(got.values())
    return dict(
        matched=tp,
        reference_notes=nr,
        candidate_notes=ng,
        precision=round(100 * tp / ng, 2) if ng else 0,
        recall=round(100 * tp / nr, 2),
        f1=round(200 * tp / (ng + nr), 2),
    )


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--claude", type=Path, required=True)
    p.add_argument("--codex", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    a = p.parse_args()
    a.out.mkdir(parents=True, exist_ok=True)
    schema_path = (
        Path(__file__).resolve().parents[2] / "docs/experiments/musicxml/schema"
    )
    parser = E.XMLParser(no_network=True)
    parser.resolvers.add(Resolver(schema_path))
    schema = E.XMLSchema(E.parse(str(schema_path / "musicxml.xsd"), parser))
    ref = reference()
    result = {
        "sample_measures": list(SOURCE),
        "reference_description": "Manually transcribed from PDF, not generated from either XML or extracted.json",
        "formula": "F1=2*exact matched noteheads/(reference noteheads+candidate noteheads); notated starts, not audio attacks; tied continuations included; grace excluded from main timing score and assessed separately",
        "results": {},
    }
    for name, path in [("Claude", a.claude), ("Codex", a.codex)]:
        doc, notes, measures, errors = read(path)
        sample = [n for n in notes if n["bar"] in SOURCE]
        valid = schema.validate(doc)
        metrics = {
            label: f1(ref, sample, keys)
            for label, keys in [
                ("attack_timing", ["bar", "onset"]),
                ("attack_and_duration", ["bar", "onset", "duration"]),
                ("attack_duration_gm_conventional", ["bar", "onset", "duration", "gm"]),
                (
                    "source_staff_and_head",
                    ["bar", "onset", "duration", "display", "head"],
                ),
            ]
        }
        rows = {
            n: f1(
                [e for e in ref if e["bar"] == n],
                [e for e in sample if e["bar"] == n],
                ["bar", "onset", "duration"],
            )
            for n in SOURCE
        }
        counts = {
            tag: len(doc.findall(".//" + tag))
            for tag in [
                "note",
                "chord",
                "dot",
                "grace",
                "tie",
                "tremolo",
                "time-modification",
                "measure-repeat",
                "multiple-rest",
                "beam",
            ]
        }
        result["results"][name] = dict(
            path=str(path),
            sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
            schema_valid=valid,
            schema_errors=str(schema.error_log),
            measure_count=len(measures),
            missing_measures=sorted(
                set(range(1, 111)) - {m["number"] for m in measures}
            ),
            valid_duration_measures=sum(m["voice_totals_valid"] for m in measures),
            duration_errors=errors,
            meters=[m for m in measures if m["beats"] != "4"],
            tempos=[e.get("tempo") for e in doc.findall(".//sound") if e.get("tempo")],
            notehead_count=len(notes),
            counts=counts,
            metrics=metrics,
            sample_by_measure=rows,
            gm_notes=dict(Counter(n["gm"] for n in notes)),
        )
        # Common excerpt: original notes untouched, equivalent layout and no lyric/text blocks.
        excerpt = copy.deepcopy(doc)
        for c in list(excerpt.getroot()):
            if c.tag not in ["part-list", "part"]:
                excerpt.getroot().remove(c)
        for part in excerpt.findall("./part"):
            for m in list(part):
                if int(m.get("number")) not in [9, 12, 84]:
                    part.remove(m)
                    continue
                for el in list(m):
                    if el.tag in ["direction", "print"]:
                        m.remove(el)
                pr = E.Element("print", **{"new-system": "yes"})
                m.insert(0, pr)
                if m.find("attributes") is None:
                    attrs = copy.deepcopy(doc.find("./part/measure/attributes"))
                    for child in list(attrs):
                        if child.tag not in [
                            "divisions",
                            "key",
                            "time",
                            "staves",
                            "clef",
                            "staff-details",
                        ]:
                            attrs.remove(child)
                    m.insert(1, attrs)
        (a.out / f"{name.lower()}-excerpt.musicxml").write_bytes(
            E.tostring(excerpt, encoding="utf-8", xml_declaration=True)
        )
    (a.out / "comparison.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2)
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
