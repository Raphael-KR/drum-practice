"""Patch only the six approved O+ notations, preserving all musical XML."""
import argparse
import copy
import hashlib
import json
from pathlib import Path

from lxml import etree as E
from common.musicxml import read_timeline, validate_schema

PROFILE = Path(__file__).parent / 'profiles/red-sunset-open-close.json'


def patch(source, target, profile=PROFILE, schema='data/reference/musicxml/schema'):
    source, target = Path(source), Path(target)
    if source.resolve() == target.resolve():
        raise ValueError(f'Input must be preserved: source={source}, target={target}')
    settings = json.loads(Path(profile).read_text())
    expected = [str(n) for n in settings['measures']]
    display = settings['display']
    if list(display) != ['harmonic', 'stopped']:
        raise ValueError(f'Technique order: expected=harmonic,stopped actual={list(display)}')
    if display['harmonic']['default-y'] != display['stopped']['default-y']:
        raise ValueError(f'Same baseline required: display={display}')
    if float(display['stopped']['default-x']) <= float(display['harmonic']['default-x']):
        raise ValueError(f'Closed symbol must be to the right: display={display}')
    parser = E.XMLParser(remove_blank_text=True, no_network=True, resolve_entities=False)
    original = E.parse(str(source), parser).getroot()
    result = copy.deepcopy(original)
    changes = []
    for measure in result.findall("part[@id='P1']/measure"):
        for index, note in enumerate(measure.findall('note')):
            technical = note.find('notations/technical')
            if technical is None:
                continue
            openings = [e for e in technical if e.tag in ('open-string', 'open', 'harmonic')]
            if not openings or technical.find('stopped') is None:
                continue
            number = measure.get('number')
            if number not in expected or len(technical) != 2 or len(openings) != 1:
                raise ValueError(f'Unexpected O+ pair: measure={number}, note={index}, tags={[e.tag for e in technical]}')
            instrument = note.find('instrument')
            if (instrument is None or instrument.get('id') != 'P1-hh'
                    or note.findtext('unpitched/display-step') != 'G'
                    or note.findtext('unpitched/display-octave') != '5'
                    or note.findtext('notehead') != 'x'):
                raise ValueError(f'O+ is not the approved G5 hi-hat: measure={number}, note={E.tostring(note, encoding="unicode")}')
            for child in list(technical):
                technical.remove(child)
            for name, attributes in display.items():
                E.SubElement(technical, name, **attributes)
            changes.append(dict(measure=number, noteIndex=index,
                                duration=note.findtext('duration'), type=note.findtext('type'),
                                voice=note.findtext('voice'), instrument=instrument.get('id'),
                                **{name: dict(attributes) for name, attributes in display.items()}))
    if [c['measure'] for c in changes] != expected:
        raise ValueError(f'O+ coverage: expected={expected}, actual={[c["measure"] for c in changes]}')
    E.indent(result)
    target.write_bytes(E.tostring(result, encoding='utf-8', xml_declaration=True))
    validated = validate_schema(target, schema)
    before_timeline, after_timeline = read_timeline(original), read_timeline(validated)
    if before_timeline != after_timeline:
        raise ValueError(f'Note timeline changed: source={source}, target={target}')
    clean_before = copy.deepcopy(original)
    clean_after = E.fromstring(E.tostring(validated), parser)
    for root in (clean_before, clean_after):
        for change in changes:
            measure = root.find(f"part[@id='P1']/measure[@number='{change['measure']}']")
            note = measure.findall('note')[change['noteIndex']]
            technical = note.find('notations/technical')
            technical.getparent().remove(technical)
    if E.tostring(clean_before, method='c14n') != E.tostring(clean_after, method='c14n'):
        raise ValueError(f'XML outside approved technical pairs changed: source={source}, target={target}')
    return dict(status='PASS', scope='Schema, complete rational note timeline, all XML except six technical pairs; indentation normalized',
                source=str(source.resolve()), sourceSHA256=hashlib.sha256(source.read_bytes()).hexdigest(),
                xml=str(target.resolve()), xmlSHA256=hashlib.sha256(target.read_bytes()).hexdigest(),
                profile=str(Path(profile).resolve()), profileSHA256=hashlib.sha256(Path(profile).read_bytes()).hexdigest(),
                measures=len(after_timeline), quarters=str(sum(m['meter'] for m in after_timeline)),
                changes=changes, schema='PASS', timeline='unchanged', otherXML='unchanged', rendering='pending')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    parser.add_argument('--profile', type=Path, default=PROFILE)
    parser.add_argument('--schema', type=Path, default=Path('data/reference/musicxml/schema'))
    args = parser.parse_args()
    result = patch(args.input, args.out, args.profile, args.schema)
    args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2))
    print(json.dumps({key: result[key] for key in ('status', 'xmlSHA256', 'measures', 'quarters', 'timeline', 'otherXML', 'rendering')}))


if __name__ == '__main__':
    main()
