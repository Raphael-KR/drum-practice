"""Export the audited intermediate representation as unpitched MusicXML 4.0."""

import argparse, copy, json
from pathlib import Path
from fractions import Fraction
import xml.etree.ElementTree as E
from convert import INSTRUMENTS

DIVISIONS = 48


def add(parent, tag, text=None, **attrs):
    el = E.SubElement(
        parent, tag, {k.replace("_", "-"): str(v) for k, v in attrs.items()}
    )
    if text is not None:
        el.text = str(text)
    return el


def create(bars, path, metadata):
    assert not any(
        b["issues"] for b in bars
    ), "Refuse export with unresolved structural issues"
    root = E.Element("score-partwise", version="4.0")
    add(add(root, "work"), "work-title", metadata["title"])
    add(root, "movement-title", metadata["display_title"])
    ident = add(root, "identification")
    for role in ("composer", "lyricist", "artist"):
        add(ident, "creator", metadata[role], type=role)
    add(
        ident,
        "rights",
        "Source score: © Arkadia Drums. Private transcription from user-provided PDF.",
    )
    enc = add(ident, "encoding")
    add(enc, "software", "drum-practice vector transcription")
    add(
        enc,
        "encoding-description",
        "Candidate transcription. Instrument identities are conventional, source has no legend. See audit.json for per-measure review.",
    )
    misc = add(ident, "miscellaneous")
    for key in ("artist_url", "lyricist_url", "authority"):
        add(misc, "miscellaneous-field", metadata[key], name=key)
    defaults = add(root, "defaults")
    sc = add(defaults, "scaling")
    add(sc, "millimeters", 7)
    add(sc, "tenths", 40)
    layout = add(defaults, "page-layout")
    add(layout, "page-height", 1600)
    add(layout, "page-width", 1236)
    margins = add(layout, "page-margins", type="both")
    for k, v in [
        ("left-margin", 70),
        ("right-margin", 70),
        ("top-margin", 50),
        ("bottom-margin", 50),
    ]:
        add(margins, k, v)
    credit = add(root, "credit", page=1)
    add(credit, "credit-type", "title")
    add(
        credit,
        "credit-words",
        metadata["display_title"],
        default_x=618,
        default_y=1530,
        justify="center",
        valign="top",
        font_size=24,
    )
    plist = add(root, "part-list")
    partdef = add(plist, "score-part", id="P1")
    add(partdef, "part-name", "Drum set")
    add(partdef, "part-abbreviation", "Dr.")
    for id, name, midi, step, octave, head in INSTRUMENTS.values():
        si = add(partdef, "score-instrument", id="P1-" + id)
        add(si, "instrument-name", name)
    for id, name, midi, step, octave, head in INSTRUMENTS.values():
        mi = add(partdef, "midi-instrument", id="P1-" + id)
        add(mi, "midi-channel", 10)
        add(mi, "midi-unpitched", midi + 1)
    part = add(root, "part", id="P1")
    previous = None
    for b in bars:
        n = b["number"]
        beats = 5 if n == 84 else 4
        m = add(
            part,
            "measure",
            number=n,
            width=round((b["bounds"][2] - b["bounds"][0]) * 2, 2),
        )
        first = previous is None
        printel = None
        if first or b["system"] != previous["system"]:
            attrs = {}
            if not first:
                attrs["new_page" if b["page"] != previous["page"] else "new_system"] = (
                    "yes"
                )
            printel = add(m, "print", **attrs)
            sl = add(printel, "system-layout")
            add(sl, "system-distance", 72)
        attributes = add(m, "attributes")
        if first:
            add(attributes, "divisions", DIVISIONS)
        if first or n in (84, 85):
            time = add(attributes, "time")
            add(time, "beats", beats)
            add(time, "beat-type", 4)
        if first:
            clef = add(attributes, "clef")
            add(clef, "sign", "percussion")
        if n == 1:
            add(add(attributes, "measure-style"), "multiple-rest", 4, use_symbols="no")
        if b.get("repeat") and not (previous and previous.get("repeat")):
            add(
                add(attributes, "measure-style"),
                "measure-repeat",
                1,
                type="start",
                slashes=1,
            )
        if previous and previous.get("repeat") and not b.get("repeat"):
            add(add(attributes, "measure-style"), "measure-repeat", type="stop")
        if len(attributes) == 0:
            m.remove(attributes)
        if first or n == 5:
            direction = add(m, "direction", placement="above")
            add(add(direction, "direction-type"), "words", "BPM = 94")
            add(direction, "sound", tempo=94)
        if b.get("section"):
            d = add(m, "direction", placement="above")
            add(
                add(d, "direction-type"),
                "rehearsal",
                b["section"],
                font_family="YuMincho",
            )
        voices = sorted(set(e["voice"] for e in b["events"]))
        for vi, voice in enumerate(voices):
            if vi:
                add(add(m, "backup"), "duration", beats * DIVISIONS)
            events = [e for e in b["events"] if e["voice"] == voice]
            for ei, e in enumerate(events):
                heads = e.get("heads", [None])
                for hi, h in enumerate(heads):
                    attrs = {}
                    if e.get("hidden"):
                        attrs["print_object"] = "no"
                    note = add(m, "note", **attrs)
                    if e.get("grace"):
                        add(note, "grace", slash="yes")
                    if hi:
                        add(note, "chord")
                    if h is None:
                        add(
                            note,
                            "rest",
                            **({"measure": "yes"} if e.get("whole") else {})
                        )
                    else:
                        id, name, midi, step, octave, head = INSTRUMENTS[
                            (h["glyph"], h["pos"])
                        ]
                        u = add(note, "unpitched")
                        add(u, "display-step", step)
                        add(u, "display-octave", octave)
                    if not e.get("grace"):
                        add(note, "duration", round(e["duration"] * DIVISIONS))
                    if e.get("tie"):
                        add(note, "tie", type=e["tie"])
                    if h is not None:
                        add(note, "instrument", id="P1-" + id)
                    add(note, "voice", voice)
                    dur = Fraction(e["duration"]).limit_denominator(48)
                    if e.get("tuplet"):
                        dur = Fraction(1, 4)
                    if e.get("dot"):
                        dur /= Fraction(3, 2)
                    typ = (
                        "eighth"
                        if e.get("grace")
                        else {
                            Fraction(4): "whole",
                            Fraction(2): "half",
                            Fraction(1): "quarter",
                            Fraction(1, 2): "eighth",
                            Fraction(1, 4): "16th",
                            Fraction(1, 8): "32nd",
                        }[dur]
                    )
                    if not e.get("whole"):
                        add(note, "type", typ)
                    if e.get("dot"):
                        add(note, "dot")
                    if e.get("tuplet"):
                        tm = add(note, "time-modification")
                        add(tm, "actual-notes", 6)
                        add(tm, "normal-notes", 4)
                        add(tm, "normal-type", "16th")
                    if h:
                        add(note, "stem", "up" if voice == 1 else "down")
                        add(
                            note,
                            "notehead",
                            "normal" if h["glyph"] == "o" else head,
                            **({"filled": "no"} if h["glyph"] == "o" else {})
                        )
                    if not hi:
                        for level, beam in enumerate(e.get("beams", []), 1):
                            others = [
                                j
                                for j, ee in enumerate(events)
                                if any(
                                    abs(bb["x0"] - beam["x0"]) < 0.01
                                    and abs(bb["x1"] - beam["x1"]) < 0.01
                                    for bb in ee.get("beams", [])
                                )
                            ]
                            if len(others) > 1:
                                value = (
                                    "begin"
                                    if ei == min(others)
                                    else "end" if ei == max(others) else "continue"
                                )
                            else:
                                value = (
                                    "forward hook"
                                    if e["stem"] < (beam["x0"] + beam["x1"]) / 2
                                    else "backward hook"
                                )
                            add(note, "beam", value, number=level)
                    if e.get("tie") or e.get("tremolo") or e.get("tuplet_edge"):
                        nt = add(note, "notations")
                        if e.get("tie"):
                            add(nt, "tied", type=e["tie"])
                        if e.get("tremolo"):
                            add(
                                add(nt, "ornaments"),
                                "tremolo",
                                e["tremolo"],
                                type="single",
                            )
                        if e.get("tuplet_edge"):
                            add(
                                nt,
                                "tuplet",
                                type=e["tuplet_edge"],
                                number=1,
                                bracket="no",
                                show_number="actual",
                            )
        if n == 110:
            add(add(m, "barline", location="right"), "bar-style", "light-heavy")
        previous = b
    E.indent(root)
    path.write_bytes(
        b'<?xml version="1.0" encoding="utf-8"?>\n' + E.tostring(root, encoding="utf-8")
    )


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--input", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--representatives", action="store_true")
    args = p.parse_args()
    bars = json.loads(args.input.read_text())
    if args.representatives:
        bars = [copy.deepcopy(b) for b in bars if b["number"] in (9, 12, 84)]
        for b in bars:
            b["system"] = b["number"]
            b["page"] = 1
    metadata = json.loads(Path(__file__).with_name("song-metadata.json").read_text())
    create(bars, args.out, metadata)
