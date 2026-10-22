"""Export the reviewed I.O.I source IR, retaining printed and performed order.

PDF interpretation lives in ioi_suddenly_extract.py and its source profile.
This adapter never derives rhythm from the horizontal distance between notes.
"""
import argparse
import json
from collections import Counter
from pathlib import Path
from lxml import etree as E
from xml_helpers import add
from common.artifacts import sha, require_equal
from common.musicxml import validate_schema, read_timeline

ORDER = list(range(1, 29)) + list(range(21, 28)) + list(range(29, 55)) + list(range(47, 54)) + list(range(55, 80))
INSTRUMENTS = {
    ('\ue0a4', 7): ('kick', 'Right Bass / Single Kick', 36, 'F', 4, 'normal'),
    ('\ue0a4', 3): ('snare', 'Snare', 38, 'C', 5, 'normal'),
    ('\ue0a4', 1): ('tom1', 'Tom 1', 50, 'E', 5, 'normal'),
    ('\ue0a4', 2): ('tom2', 'Tom 2', 47, 'D', 5, 'normal'),
    ('\ue0a4', 5): ('tom4', 'Tom 4 / Floor Tom', 43, 'A', 4, 'normal'),
    ('\ue0a9', -1): ('hh', 'Closed Hi-Hat', 42, 'G', 5, 'x'),
    ('\ue0a9', 0): ('ride', 'Ride', 51, 'F', 5, 'x'),
    ('\ue0a9', 3): ('cross-stick', 'Cross Stick / Rim Click', 37, 'C', 5, 'x'),
    ('\ue0b3', -2): ('crash', 'Crash cymbal', 49, 'A', 5, 'x'),
}
SECTIONS = {1: 'Intro', 5: 'A', 13: 'B', 21: 'C', 31: 'A', 39: 'B', 47: 'C', 56: 'D', 64: 'C1', 72: 'C2'}
TYPES = {4: 'whole', 2: 'half', 1: 'quarter', .5: 'eighth', .25: '16th', .125: '32nd'}
DOUBLE_BARS = {4, 12, 20, 30, 38, 46, 55, 63, 71}


def instrument(head):
    return INSTRUMENTS[(head['glyph'], head['pos'])]


def barline(measure, source_number):
    if source_number in (21, 47):
        line = add(measure, 'barline', location='left')
        add(line, 'bar-style', 'heavy-light'); add(line, 'repeat', direction='forward')
    if source_number in (28, 29, 54, 55):
        line = add(measure, 'barline', location='left')
        add(line, 'ending', number=1 if source_number in (28, 54) else 2, type='start')
    if source_number in (28, 30, 54, 55):
        line = add(measure, 'barline', location='right')
        if source_number in (28, 54):
            add(line, 'bar-style', 'light-heavy')
        else: add(line, 'bar-style', 'light-light')
        add(line, 'ending', number=1 if source_number in (28, 54) else 2,
            type='stop' if source_number in (28, 54) else 'discontinue')
        if source_number in (28, 54): add(line, 'repeat', direction='backward')
    elif source_number in DOUBLE_BARS:
        add(add(measure, 'barline', location='right'), 'bar-style', 'light-light')


def write_score(bars, order, path, digest, printed=False):
    root = E.Element('score-partwise', version='4.0')
    add(add(root, 'work'), 'work-title', '갑자기')
    ident = add(root, 'identification'); add(ident, 'creator', 'I.O.I', type='artist')
    add(add(ident, 'encoding'), 'software', 'drum-practice / reviewed MuseScore vector extraction')
    misc = add(ident, 'miscellaneous')
    for name, value in {
        'source-pdf-sha256': digest,
        'source-credit': 'DRUM SCORE LAB — Normal Ver.',
        'source-measure-order:v1': json.dumps(order),
        'source-layout': '79 printed measures; printed repeat/ending symbols retained in source-transcription.musicxml. Playback transcription explicitly expands 21-27 and 47-53 on second passes.',
        'source-hihat-actions': 'Open/close actions at the original event are preserved. A close action above a kick/snare event does not add an unprinted hi-hat strike.',
        'source-hihat-actions:v1': json.dumps([
            dict(sourceMeasure=b['number'], quarterOffset=e['onset'], targetInstrument='P1-hh',
                 action=action, addsAttack=False)
            for b in bars for e in b['events'] for action in e.get('techniques', [])]),
    }.items(): add(misc, 'miscellaneous-field', value, name='drum-practice:' + name)
    defs = add(root, 'defaults'); scaling = add(defs, 'scaling')
    add(scaling, 'millimeters', 7); add(scaling, 'tenths', 40)
    page = add(defs, 'page-layout'); add(page, 'page-height', 1697); add(page, 'page-width', 1201)
    margins = add(page, 'page-margins', type='both')
    for side, size in [('left', 65), ('right', 65), ('top', 45), ('bottom', 45)]: add(margins, side + '-margin', size)
    scorepart = add(add(root, 'part-list'), 'score-part', id='P1'); add(scorepart, 'part-name', 'Drum')
    used = {instrument(h) for b in bars for e in b['events'] for h in e['heads']}
    for iid, name, *_ in sorted(used): add(add(scorepart, 'score-instrument', id='P1-' + iid), 'instrument-name', name)
    for iid, _, midi, *_ in sorted(used):
        mi = add(scorepart, 'midi-instrument', id='P1-' + iid)
        add(mi, 'midi-channel', 10); add(mi, 'midi-unpitched', midi + 1)
    part = add(root, 'part', id='P1'); previous = None
    counts = Counter(); occurrences = []
    for index, number in enumerate(order, 1):
        b = bars[number - 1]; counts[number] += 1
        occurrences.append(dict(performanceMeasure=index, sourceMeasure=number, occurrence=counts[number], page=b['page']))
        measure = add(part, 'measure', number=index, width=round((b['bounds'][2] - b['bounds'][0]) * 2, 2))
        changed = previous is None or previous['system'] != b['system'] or number != previous['number'] + 1
        if changed:
            attrs = {} if previous is None else {'new_page' if b['page'] != previous['page'] else 'new_system': 'yes'}
            layout = add(add(measure, 'print', **attrs), 'system-layout')
            add(layout, 'top-system-distance' if previous is None else 'system-distance', 100 if previous is None else 70)
        if index == 1:
            attrs = add(measure, 'attributes'); add(attrs, 'divisions', 96)
            time = add(attrs, 'time'); add(time, 'beats', 4); add(time, 'beat-type', 4)
            add(add(attrs, 'clef'), 'sign', 'percussion')
            direction = add(measure, 'direction', placement='above')
            metro = add(add(direction, 'direction-type'), 'metronome')
            add(metro, 'beat-unit', 'quarter'); add(metro, 'per-minute', 117); add(direction, 'sound', tempo=117)
        if number in SECTIONS:
            label = SECTIONS[number] + (' · Closed H.H →' if number == 5 else '')
            add(add(add(measure, 'direction', placement='above'), 'direction-type'), 'rehearsal', label)
        if number in (1, 4):
            direction = add(measure, 'direction', placement='below')
            add(add(direction, 'direction-type'), 'wedge', type='crescendo' if number == 1 else 'stop', number=1)
            if number == 4: add(direction, 'offset', 96)
        for ei, event in enumerate(b['events']):
            heads = event['heads']; tech_index = next((i for i, h in enumerate(heads) if instrument(h)[0] == 'hh'), 0)
            for hi, head in enumerate(heads or [None]):
                note = add(measure, 'note', default_x=round((event['x'] - b['bounds'][0]) * 2, 2))
                if hi: add(note, 'chord')
                if head:
                    iid, _, _, step, octave, shape = instrument(head)
                    unpitched = add(note, 'unpitched'); add(unpitched, 'display-step', step); add(unpitched, 'display-octave', octave)
                else: add(note, 'rest', **({'measure': 'yes'} if event['duration'] == 4 else {}))
                add(note, 'duration', round(event['duration'] * 96))
                if head: add(note, 'instrument', id='P1-' + iid)
                add(note, 'voice', 1)
                duration = event['duration']; dots = event.get('dots', 0)
                nominal = duration / sum(0.5**i for i in range(dots + 1))
                add(note, 'type', TYPES[nominal])
                for _ in range(dots): add(note, 'dot')
                if head: add(note, 'stem', 'up'); add(note, 'notehead', shape)
                if not hi:
                    for level, beam in enumerate(sorted(event.get('beams', []), key=lambda x: x['top']), 1):
                        group = [j for j, e in enumerate(b['events']) if beam in e.get('beams', [])]
                        position = 'begin' if ei == min(group) else 'end' if ei == max(group) else 'continue'
                        if len(group) == 1: position = 'forward hook' if beam['x1'] > event['x'] + 1 else 'backward hook'
                        add(note, 'beam', position, number=level)
                if hi == tech_index and event.get('techniques'):
                    tech = add(add(note, 'notations'), 'technical')
                    for action in event['techniques']: add(tech, 'open-string' if action == 'open' else 'stopped', placement='above')
        if printed: barline(measure, number)
        elif number in DOUBLE_BARS: add(add(measure, 'barline', location='right'), 'bar-style', 'light-light')
        if index == len(order): add(add(measure, 'barline', location='right'), 'bar-style', 'light-heavy')
        previous = b
    E.indent(root); path.write_bytes(E.tostring(root, encoding='UTF-8', xml_declaration=True))
    return occurrences


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ir', type=Path, required=True); parser.add_argument('--pdf', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args(); bars = json.loads(args.ir.read_text())
    if isinstance(bars, dict): bars = bars['bars']
    require_equal(len(bars), 79, 'source measures')
    if any(b.get('issues') for b in bars): raise ValueError('Unresolved extraction issues')
    args.out.mkdir(parents=True, exist_ok=False)
    write_score(bars, list(range(1, 80)), args.out / 'source-transcription.musicxml', sha(args.pdf), printed=True)
    order = write_score(bars, ORDER, args.out / 'playback-transcription.musicxml', sha(args.pdf))
    (args.out / 'measure-order.json').write_text(json.dumps(order, ensure_ascii=False, indent=2))
    audit = {}
    for filename, count in [('source-transcription.musicxml', 79), ('playback-transcription.musicxml', 93)]:
        tree = validate_schema(args.out / filename, Path('data/reference/musicxml/schema'))
        timeline = read_timeline(tree)
        require_equal(len(timeline), count, filename + ' measures')
        require_equal([m['extent'] for m in timeline], [4] * count, filename + ' lengths')
        audit[filename] = dict(measures=count, quarters=count * 4, schema='PASS', sha256=sha(args.out / filename))
    (args.out / 'xml-audit.json').write_text(json.dumps(audit, indent=2)); print(json.dumps(audit, indent=2))


if __name__ == '__main__': main()
