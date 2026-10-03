"""Loveholic Opus vector-score transcription; never apply to another PDF.

PDF text origins supply staff positions. Real stems and beam rectangles supply
rhythm; horizontal spacing is not converted into durations. Raw symbols remain
in the intermediate representation for review before instrument assignment.
"""

import argparse
import hashlib
import json
import xml.etree.ElementTree as E
from collections import Counter
from pathlib import Path

import pdfplumber

PDF_SHA256 = "003e2b2a6db24c34f5d37847940098a34bcd368956ded94f0dd0f8b9541b8625"
HEADS = {"œ", "¿", "Y"}
RESTS = {"‰": 0.5, "Œ": 1, "Ó": 2, "∑": 4}
SIGNS = {"¯": "open", "±": "half-open", "+": "close"}
# Approved project legend; this follows source positions, not instrument inference
# from the sound of the recording or the outline of a PDF glyph.
INSTRUMENTS = {
    ("œ", 7): ("kick", "Right Bass / Single Kick", 36, "F", 4, "normal"),
    ("œ", 3): ("snare", "Snare", 38, "C", 5, "normal"),
    ("œ", 1): ("tom1", "Tom 1", 50, "E", 5, "normal"),
    ("œ", 2): ("tom2", "Tom 2", 47, "D", 5, "normal"),
    ("œ", 5): ("tom4", "Tom 4 / Floor Tom", 43, "A", 4, "normal"),
    ("¿", 0): ("ride", "Ride", 51, "F", 5, "x"),
    ("¿", -1): ("hh", "Closed Hi-Hat", 42, "G", 5, "x"),
    ("Y", -1): ("crash", "Crash cymbal", 49, "A", 5, "x"),
}
SECTIONS = {1: "B(후렴)", 21: "A1(1절)", 37: "B(후렴)", 53: "In(간주)",
            63: "A2(2절)", 80: "B(후렴)", 96: "B(후렴)", 112: "O(엔딩)"}


def origin_y(page, char):
    return page.height - char["matrix"][5]


def clusters(values, gap):
    groups = []
    for value in sorted(values):
        if not groups or value - groups[-1][-1] > gap:
            groups.append([value])
        else:
            groups[-1].append(value)
    return groups


def geometry(pdf):
    systems = []
    number = 1
    for pi, page in enumerate(pdf.pages):
        staff_lines = sorted(
            (l for l in page.lines if l["width"] > 400 and l["height"] < 0.01),
            key=lambda l: l["top"],
        )
        if len(staff_lines) % 5:
            raise ValueError("Incomplete staff-line group")
        for i in range(0, len(staff_lines), 5):
            staff = staff_lines[i : i + 5]
            top, bottom = staff[0]["top"], staff[-1]["top"]
            spacing = (bottom - top) / 4
            if any(abs(l["top"] - (top + j * spacing)) > 0.05 for j, l in enumerate(staff)):
                raise ValueError("Staff spacing changed")
            barlines = [
                l["x0"] for l in page.lines
                if l["width"] < 0.01
                and abs(l["top"] - top) < 0.4
                and abs(l["bottom"] - bottom) < 0.4
            ]
            # Adjacent strokes of a double/final barline are one boundary.
            edges = [staff[0]["x0"]] + [max(g) for g in clusters(barlines, 4)]
            labels = sorted(
                (c for c in page.chars if c["x0"] < 75
                 and top - 30 < c["top"] < top - 8
                 and "Opus" not in c["fontname"] and c["text"].isdigit()),
                key=lambda c: c["x0"],
            )
            printed = "".join(c["text"] for c in labels)
            if printed and int(printed) != number:
                raise ValueError(f"Printed system {printed} != counted {number}")
            systems.append(dict(page=pi + 1, start=number, staff=top, spacing=spacing, edges=edges))
            number += len(edges) - 1
    return systems


def extract_measure(page, system, left, right, number):
    top = system["staff"]
    half_space = system["spacing"] / 2
    chars = [c for c in page.chars
             if left <= c["x0"] < right - 0.3 and "Opus" in c["fontname"]
             and top - 45 < origin_y(page, c) < top + 28]
    stems = [l for l in page.lines
             if l["width"] < 0.01 and 7 < l["height"] < 45
             and left < l["x0"] < right and top - 30 < l["top"] < top + 23
             and abs(l["linewidth"] - 0.4650468804) < 0.03]
    beams = [r for r in page.rects if r["fill"] and r["width"] > 3
             and 1.5 < r["height"] < 3.5 and left < r["x0"] < right
             and top - 30 < r["top"] < top + 12]
    events, issues, raw = [], [], []
    for c in chars:
        text = c["text"]
        y = origin_y(page, c)
        raw.append(dict(glyph=text, font=c["fontname"].split("+")[-1], x=c["x0"], y=y))
        if text in RESTS:
            events.append(dict(x=c["x0"], duration=RESTS[text], rest=True, glyph=text, beams=[]))
            continue
        if text not in HEADS:
            continue
        pos = round((y - top) / half_space)
        if abs(y - (top + pos * half_space)) > 0.2:
            issues.append(f"Non-grid head {text} at {c['x0']:.3f}/{y:.3f}")
        # Opus bounding boxes include right sidebearing; glyph advance is not stem X.
        offset = {"œ": 6.665, "¿": 5.115, "Y": 6.510}[text]
        candidates = [l for l in stems
                      if abs(l["x0"] - (c["x0"] + offset)) < 0.4
                      and l["top"] - 1 < y < l["bottom"] + 2.2]
        if len(candidates) != 1:
            issues.append(f"Stem match {text}/{pos} at {c['x0']:.3f}: {len(candidates)}")
            continue
        stem = candidates[0]
        head = dict(glyph=text, pos=pos, x=c["x0"], y=y)
        existing = next((e for e in events if e.get("stem") == stem["x0"]), None)
        if existing:
            existing["heads"].append(head)
            continue
        hits = [r for r in beams if r["x0"] - 0.3 <= stem["x0"] <= r["x1"] + 0.3
                and -0.5 < r["top"] - stem["top"] < 8]
        flags = [f for f in chars if f["text"] == "j"
                 and abs(f["x0"] - stem["x0"]) < 0.4
                 and abs(origin_y(page, f) - stem["top"] - 4.9603) < 0.4]
        level = len(hits) or int(bool(flags))
        events.append(dict(x=stem["x0"], stem=stem["x0"], duration=1 / 2 ** level,
                           heads=[head], flag=bool(flags),
                           beams=[dict(x0=r["x0"], x1=r["x1"], top=r["top"]) for r in hits]))
    events.sort(key=lambda e: e["x"])
    onset = 0
    for event in events:
        event["onset"] = onset
        onset += event["duration"]
        event["heads"] = sorted(event.get("heads", []), key=lambda h: h["pos"])
    if onset != 4:
        issues.append(f"Duration {onset} != 4")
    for c in chars:
        if c["text"] in SIGNS or c["text"] == ">":
            sounding = [e for e in events if not e.get("rest")]
            if not sounding:
                issues.append("Technique/accent without sounding event")
                continue
            event = min(sounding, key=lambda e: abs(e["x"] - c["x0"]))
            if abs(event["x"] - c["x0"]) > 9:
                issues.append(f"Unmatched sign {c['text']} at {c['x0']:.3f}")
                continue
            if c["text"] == ">":
                event["accent"] = True
            else:
                event["technique"] = SIGNS[c["text"]]
    double = [l for l in page.lines if l["width"] < 0.01
              and right - 4 <= l["x0"] <= right + 0.2
              and abs(l["top"] - top) < 0.4
              and abs(l["bottom"] - (top + 4 * system["spacing"])) < 0.4]
    diagonals = [l for l in page.lines if left < l["x0"] < right
                 and l["width"] > 10 and 0.3 < l["height"] < 8
                 and top - 28 < l["top"] < top - 6]
    wedges = []
    for l in diagonals:
        if l["pts"][0][1] > l["pts"][1][1]:
            partner = next((r for r in diagonals if r is not l and r["pts"][0] == l["pts"][0]), None)
            if partner:
                sounding = [e for e in events if not e.get("rest")]
                start = min(sounding, key=lambda e: abs(e["x"] - l["x0"]))
                end = min(sounding, key=lambda e: abs(e["x"] - l["x1"]))
                wedges.append(dict(type="crescendo", start=start["onset"], end=end["onset"] + end["duration"],
                                   source=[l["x0"], l["x1"]]))
    return dict(number=number, page=system["page"], system=system["start"],
                staff=top, bounds=[left, top - 43, right, top + 29],
                events=events, glyphs=raw, issues=issues, wedges=wedges,
                barline="light-heavy" if number == 123 else "light-light" if len(double) > 1 else "regular",
                section=SECTIONS.get(number))


def extract(pdf_path, out):
    if hashlib.sha256(pdf_path.read_bytes()).hexdigest() != PDF_SHA256:
        raise ValueError("This converter is restricted to the reviewed Loveholic PDF")
    with pdfplumber.open(pdf_path) as pdf:
        systems = geometry(pdf)
        bars = []
        for system in systems:
            page = pdf.pages[system["page"] - 1]
            for i, (left, right) in enumerate(zip(system["edges"], system["edges"][1:])):
                bars.append(extract_measure(page, system, left, right, system["start"] + i))
    out.mkdir(parents=True, exist_ok=True)
    (out / "geometry.json").write_text(json.dumps(systems, ensure_ascii=False, indent=2))
    (out / "extracted.json").write_text(json.dumps(bars, ensure_ascii=False, indent=2))
    print("measures", len(bars), "clean", sum(not b["issues"] for b in bars))
    print("heads", Counter((h["glyph"], h["pos"]) for b in bars for e in b["events"] for h in e["heads"]))
    for b in bars:
        if b["issues"]:
            print(b["number"], b["issues"])
    return bars


def source_lyrics(pdf_path, systems):
    """Preserve printed cues; their X positions are not vocal rhythm evidence."""
    cues = []
    with pdfplumber.open(pdf_path) as pdf:
        for system in systems:
            page = pdf.pages[system["page"] - 1]
            chars = sorted((c for c in page.chars if "Opus" not in c["fontname"]
                            and system["staff"] + 21 < c["top"] < system["staff"] + 40
                            and c["x0"] > 65), key=lambda c: c["x0"])
            if chars:
                cues.append(dict(page=system["page"], system=system["start"],
                                 text="".join(c["text"] for c in chars),
                                 chars=[dict(text=c["text"], x=c["x0"], top=c["top"]) for c in chars],
                                 status="printed-cue-only; vocal timing unverified"))
    return cues


def pdf_crop_systems(systems, folder, cues):
    """Split PDF practice rows at blank raster bands after the previous lyrics.

    Music font boxes include large sidebearings, so their boxes cannot determine
    the visible ink boundary. Poppler pages are the package's actual raster.
    Crop geometry is independent of musical duration and XML extraction.
    """
    from PIL import Image
    result = []
    for page_number in sorted({s['page'] for s in systems}):
        page_systems = [s for s in systems if s['page'] == page_number]
        image = Image.open(folder / f'source-poppler-{page_number}.png').convert('L')
        sx, sy = image.width / 596, image.height / 842
        boundaries = [max(0, page_systems[0]['staff'] - 43)]
        for previous, current in zip(page_systems, page_systems[1:]):
            lo = int((previous['staff'] + 23) * sy)
            hi = int((current['staff'] - 24) * sy)
            spans = []
            for y in range(lo, hi):
                row = image.crop((int(43 * sx), y, int(560 * sx), y + 1))
                if row.getextrema()[0] <= 200:
                    continue
                if not spans or y > spans[-1][-1] + 1:
                    spans.append([y])
                else:
                    spans[-1].append(y)
            spans = [span for span in spans if len(span) >= 3]
            if not spans:
                raise ValueError(f'No safe blank crop band before system {current["start"]}')
            # The last band avoids assigning the previous row's lyrics to the
            # next row. Both adjacent crops share this boundary without overlap.
            span = spans[-1]
            boundaries.append((span[0] + span[-1] + 1) / (2 * sy))
        last = page_systems[-1]
        cue_bottom = [c['top'] + 13 for cue in cues
                      if cue['page'] == page_number and cue['system'] == last['start']
                      for c in cue['chars']]
        # Include this row's lyrics, but do not pull in the page footer.
        boundaries.append(min(842, max([last['staff'] + 29] + cue_bottom)))
        for i, system in enumerate(page_systems):
            if not boundaries[i] < system['staff'] < boundaries[i+1]:
                raise ValueError('Crop does not contain its staff')
            result.append(dict(page=page_number, system=system['start'],
                               top=boundaries[i], bottom=boundaries[i+1]))
    (folder / 'pdf-crop-systems.json').write_text(json.dumps(result, indent=2))
    return result


def add(parent, tag, text=None, **attrs):
    el = E.SubElement(parent, tag, {k.replace("_", "-"): str(v) for k, v in attrs.items()})
    if text is not None:
        el.text = str(text)
    return el


def write_musicxml(bars, path, provenance, cues):
    if any(b["issues"] for b in bars):
        raise ValueError("Refuse export with unresolved structural issues")
    root = E.Element("score-partwise", version="4.0")
    add(add(root, "work"), "work-title", "Loveholic")
    ident = add(root, "identification")
    add(ident, "creator", "러브홀릭", type="artist")
    add(ident, "rights", "Source PDF: Copyright © Drumplace. All Rights Reserved.")
    enc = add(ident, "encoding")
    add(enc, "software", "drum-practice Loveholic vector transcription")
    add(enc, "encoding-description", "Source-bound vector transcription. Approved project instrument legend. Printed lyric cues are preserved as metadata without invented vocal rhythm. Source circled-plus technical marks use half-muted with the official percussion SMuFL pictHalfOpen1 glyph. OSMD 2.1.2 has no native half-muted rendering; the approved app renderer supplies that exact official glyph.")
    misc = add(ident, "miscellaneous")
    for name, data in [("drum-practice:source-provenance", {k:provenance[k] for k in ["pdf_sha256", "audio_sha256"]}),
                       ("drum-practice:printed-lyric-cues", cues),
                       ("drum-practice:source-notation", [dict(measure=b["number"], onset=e["onset"], sourceGlyph="±", musicxml="half-muted", smufl="pictHalfOpen1", rendering="OSMD 2.1.2 native unsupported; approved app renders official percussion glyph")
                                                          for b in bars for e in b["events"] if e.get("technique") == "half-open"])]:
        add(misc, "miscellaneous-field", json.dumps(data, ensure_ascii=False, separators=(",", ":")), name=name)
    defaults = add(root, "defaults")
    scaling = add(defaults, "scaling")
    add(scaling, "millimeters", 7); add(scaling, "tenths", 40)
    layout = add(defaults, "page-layout")
    add(layout, "page-height", 1697); add(layout, "page-width", 1201)
    margins = add(layout, "page-margins", type="both")
    for k, v in [("left-margin", 65), ("right-margin", 65), ("top-margin", 45), ("bottom-margin", 45)]:
        add(margins, k, v)
    plist = add(root, "part-list")
    sp = add(plist, "score-part", id="P1")
    add(sp, "part-name", "Drum")
    for iid, name, midi, step, octave, head in INSTRUMENTS.values():
        add(add(sp, "score-instrument", id="P1-" + iid), "instrument-name", name)
    for iid, name, midi, step, octave, head in INSTRUMENTS.values():
        mi = add(sp, "midi-instrument", id="P1-" + iid)
        add(mi, "midi-channel", 10); add(mi, "midi-unpitched", midi + 1)
    part = add(root, "part", id="P1")
    previous = None
    for bar in bars:
        m = add(part, "measure", number=bar["number"], width=round((bar["bounds"][2] - bar["bounds"][0]) * 2, 2))
        if previous is None or bar["system"] != previous["system"]:
            flags = {} if previous is None else {"new_page" if previous["page"] != bar["page"] else "new_system": "yes"}
            pr = add(m, "print", **flags)
            sl = add(pr, "system-layout")
            if previous is None: add(sl, "top-system-distance", 180)
            else: add(sl, "system-distance", 88)
        if previous is None:
            attr = add(m, "attributes")
            add(attr, "divisions", 48)
            time = add(attr, "time"); add(time, "beats", 4); add(time, "beat-type", 4)
            add(add(attr, "clef"), "sign", "percussion")
            direction = add(m, "direction", placement="above")
            met = add(add(direction, "direction-type"), "metronome")
            add(met, "beat-unit", "quarter"); add(met, "per-minute", 136)
            add(direction, "sound", tempo=136)
        if bar.get("section"):
            add(add(add(m, "direction", placement="above"), "direction-type"), "rehearsal", bar["section"])
        for w in bar["wedges"]:
            for typ, offset in [("crescendo", w["start"]), ("stop", w["end"])]:
                d = add(m, "direction", placement="above")
                add(add(d, "direction-type"), "wedge", type=typ, number=1)
                add(d, "offset", int(offset * 48))
        for ei, event in enumerate(bar["events"]):
            for hi, h in enumerate(event["heads"] or [None]):
                note = add(m, "note", default_x=round((event["x"] - bar["bounds"][0]) * 2, 2))
                if hi: add(note, "chord")
                if h:
                    iid, _, _, step, octave, head = INSTRUMENTS[(h["glyph"], h["pos"])]
                    u = add(note, "unpitched"); add(u, "display-step", step); add(u, "display-octave", octave)
                else:
                    add(note, "rest", **({"measure":"yes"} if event["duration"] == 4 else {}))
                add(note, "duration", int(event["duration"] * 48))
                if h: add(note, "instrument", id="P1-" + iid)
                add(note, "voice", 1)
                if event["duration"] != 4:
                    add(note, "type", {2:"half",1:"quarter",0.5:"eighth",0.25:"16th"}[event["duration"]])
                if h:
                    add(note, "stem", "up"); add(note, "notehead", head)
                if not hi:
                    for level, beam in enumerate(sorted(event["beams"], key=lambda b:b["top"]), 1):
                        others = [j for j, ev in enumerate(bar["events"]) if beam in ev["beams"]]
                        if len(others) > 1:
                            value = "begin" if ei == min(others) else "end" if ei == max(others) else "continue"
                        else:
                            value = "forward hook" if beam["x1"] > event["x"] + 1 else "backward hook"
                        add(note, "beam", value, number=level)
                # Technical open/close is attached only to the matching hi-hat head.
                technical = h and h["pos"] == -1 and event.get("technique") in {"open", "close", "half-open"}
                if (event.get("accent") and not hi) or technical:
                    notation = add(note, "notations")
                    if event.get("accent") and not hi: add(add(notation, "articulations"), "accent", placement="above")
                    if technical:
                        attributes = {"placement": "above"}
                        if event["technique"] == "half-open":
                            attributes["smufl"] = "pictHalfOpen1"
                        add(add(notation, "technical"), {"open":"open-string", "close":"stopped", "half-open":"half-muted"}[event["technique"]], **attributes)
        if bar["barline"] != "regular": add(add(m, "barline", location="right"), "bar-style", bar["barline"])
        previous = bar
    E.indent(root)
    path.write_bytes(E.tostring(root, encoding="utf-8", xml_declaration=True))


def verify_musicxml(bars, path, schema_path):
    from lxml import etree
    from verify import Resolver
    parser = etree.XMLParser(resolve_entities=False, no_network=True)
    parser.resolvers.add(Resolver(schema_path.parent))
    tree = etree.parse(str(path), parser)
    schema = etree.XMLSchema(etree.parse(str(schema_path), parser))
    schema.assertValid(tree)
    # The app canonical writer adds a separate hidden lyric-rest part. Verify
    # the actual percussion part without counting those auxiliary measures.
    measures = tree.xpath("/score-partwise/part[@id='P1']/measure")
    if len(measures) != len(bars): raise ValueError("Measure count changed")
    for bar, measure in zip(bars, measures):
        cursor, actual, last = 0, [], None
        for note in measure.findall("note"):
            dur = int(note.findtext("duration")) / 48
            if note.find("chord") is None:
                last = dict(onset=cursor, duration=dur, heads=[], accent=note.find('notations/articulations/accent') is not None)
                actual.append(last); cursor += dur
            elif not last or dur != last["duration"]:
                raise ValueError("Chord duration mismatch")
            if note.find("rest") is None:
                last["heads"].append((note.find("instrument").get("id"), note.findtext("unpitched/display-step"),
                                      note.findtext("unpitched/display-octave"), note.findtext("notehead"),
                                      tuple(n.tag for n in note.findall('notations/technical/*'))))
        expected = []
        for ev in bar["events"]:
            heads = []
            for h in ev["heads"]:
                iid, _, _, step, octave, head = INSTRUMENTS[(h["glyph"], h["pos"])]
                technique = {"open":"open-string", "close":"stopped", "half-open":"half-muted"}.get(ev.get('technique')) if h['pos']==-1 else None
                heads.append(("P1-" + iid, step, str(octave), head, (technique,) if technique else ()))
            expected.append(dict(onset=ev["onset"], duration=ev["duration"], heads=heads, accent=bool(ev.get('accent'))))
        if cursor != 4 or actual != expected: raise ValueError(f"Measure {bar['number']} differs after XML reread")
    counts = dict(measures=len(bars), quarter_beats=len(bars)*4,
                  noteheads=sum(len(e["heads"]) for b in bars for e in b["events"]),
                  rests=sum(bool(e.get("rest")) for b in bars for e in b["events"]),
                  accents=len(tree.xpath("//accent")), open_actions=len(tree.xpath("//open-string")),
                  close_actions=len(tree.xpath("//stopped")), half_muted=len(tree.xpath("//half-muted")), wedges=len(tree.xpath("//wedge[@type='crescendo']")),
                  source_circled_plus=sum(e.get("technique") == "half-open" for b in bars for e in b["events"]))
    if counts["accents"] != sum(bool(e.get("accent")) for b in bars for e in b["events"]): raise ValueError("Accent loss")
    if counts["wedges"] != sum(len(b["wedges"]) for b in bars): raise ValueError("Wedge loss")
    return counts


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--pdf", type=Path, required=True)
    p.add_argument("--out", type=Path, required=True)
    a = p.parse_args()
    generated = ["geometry.json", "extracted.json", "printed-lyric-cues.json",
                 "pdf-crop-systems.json", "representatives.musicxml", "loveholic.musicxml",
                 "representatives.musicxml.audit.json", "loveholic.musicxml.audit.json"]
    existing = [name for name in generated if (a.out / name).exists()]
    if existing:
        p.error("Use a fresh output directory; preserving existing results: " + ", ".join(existing))
    bars = extract(a.pdf, a.out)
    systems = json.loads((a.out / "geometry.json").read_text())
    cues = source_lyrics(a.pdf, systems)
    pdf_crop_systems(systems, a.out, cues)
    provenance = json.loads((a.out / "provenance.json").read_text())
    (a.out / "printed-lyric-cues.json").write_text(json.dumps(cues, ensure_ascii=False, indent=2))
    for subset, filename in [(bars[:10], "representatives.musicxml"), (bars, "loveholic.musicxml")]:
        path = a.out / filename
        write_musicxml(subset, path, provenance, cues)
        counts = verify_musicxml(subset, path, Path("docs/experiments/musicxml/schema/musicxml.xsd"))
        (a.out / (filename + ".audit.json")).write_text(json.dumps(counts, indent=2))
        print(filename, counts)
