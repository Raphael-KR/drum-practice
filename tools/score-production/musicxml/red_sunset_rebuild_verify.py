"""Source-bound audit of the XML-only Red Sunset engraving rebuild."""
import argparse
import copy
import hashlib
import json
import zipfile
from bisect import bisect_right
from pathlib import Path
from xml.etree import ElementTree as ET

import pdfplumber
from lxml import etree as E
from common.musicxml import read_timeline
from red_sunset_verify import run as verify_source


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def printed_word_positions(profile):
    output = Path(profile['out'])
    systems = json.loads((output/'source-check/geometry.json').read_text())
    text_pages = json.loads((output/'source-text.json').read_text())
    positions = {}
    with pdfplumber.open(profile['sourcePDF']) as pdf:
        for text_page in text_pages:
            page = pdf.pages[text_page['page']-1]
            for word in text_page['text']:
                if word['text'] not in ('H.H','손발','횟수'):
                    continue
                chars = [c for c in page.chars if word['x0']-.1 <= c['x0'] < word['x1']
                         and abs(c['top']-word['top']) < 1]
                if not chars:
                    raise ValueError(f'Printed instruction baseline missing: page={text_page["page"]} word={word}')
                char = min(chars,key=lambda c:c['x0'])
                baseline = page.height-char['matrix'][5]
                candidates = [s for s in systems if s['page']==text_page['page']
                              and 0 < s['staff']-baseline < 45]
                if not candidates:
                    raise ValueError(f'Printed instruction staff missing: page={text_page["page"]} baseline={baseline}')
                system = min(candidates,key=lambda s:s['staff']-baseline)
                number = system['start']+bisect_right(system['edges'],(word['x0']+word['x1'])/2)-1
                positions[str(number)] = dict(page=text_page['page'],baseline=baseline,
                    staff=system['staff'],spacing=system['spacing'],
                    defaultY=round((system['staff']-baseline)/system['spacing']*10,6))
    if set(positions) != set(profile['directionAppliedQuarters']):
        raise ValueError(f'Printed instruction coverage: expected={list(profile["directionAppliedQuarters"])} actual={list(positions)}')
    return positions


def prepare(profile):
    tree = ET.parse(profile['notationBaseline'])
    with zipfile.ZipFile(profile['performanceMetadataPackage']) as archive:
        package = json.loads(archive.read('manifest.json'))
    current = ET.fromstring(package['canonicalXML'])
    field_name = 'drum-practice:score:v1'
    find_field = lambda root:next(f for f in root.findall('identification/miscellaneous/miscellaneous-field') if f.get('name') == field_name)
    old_field = find_field(tree.getroot())
    current_field = find_field(current)
    previous_meta = json.loads(old_field.text)
    stripped = json.loads(current_field.text)
    for measure in stripped['measures']:
        measure.pop('beatTimes',None)
    if stripped != previous_meta:
        raise ValueError('Current package metadata differs beyond the approved beatTimes map')
    old_field.text = current_field.text
    baseline_bytes = ET.tostring(tree.getroot(),encoding='utf-8',xml_declaration=True)
    baseline = Path(profile['baseline'])
    if baseline.exists() and baseline.read_bytes() != baseline_bytes:
        raise ValueError(f'Existing merged baseline differs: path={baseline} actualSHA256={sha(baseline)}')
    baseline.write_bytes(baseline_bytes)
    removed = []
    for measure in tree.findall("part[@id='P1']/measure"):
        for direction in list(measure.findall('direction')):
            section = direction.find('direction-type/rehearsal')
            if section is not None and section.text == '기보된 카운트':
                removed.append(measure.get('number'))
                measure.remove(direction)
    if removed != ['1']:
        raise ValueError(f'Editorial section removal: expected=[1] actual={removed}')
    positions = printed_word_positions(profile)
    for number, position in positions.items():
        words = tree.find(f"part[@id='P1']/measure[@number='{number}']/direction/direction-type/words")
        words.set('default-y',str(position['defaultY']))
    (Path(profile['out'])/'source-word-positions.json').write_text(json.dumps(positions,ensure_ascii=False,indent=2)+'\n')
    data = ET.tostring(tree.getroot(), encoding='utf-8', xml_declaration=True)
    target = Path(profile['input'])
    if target.exists() and target.read_bytes() != data:
        raise ValueError(f'Existing input differs: path={target} actualSHA256={sha(target)}')
    target.write_bytes(data)


def normalized(root):
    root = copy.deepcopy(root)
    for direction in root.xpath("./part[@id='P1']/measure/direction[direction-type/rehearsal='기보된 카운트']"):
        direction.getparent().remove(direction)
    for direction in root.xpath("./part[@id='P1']/measure/direction[direction-type/words]"):
        for offset in direction.findall('offset'):
            if offset.get('sound') != 'no':
                raise ValueError(f'Unexpected musical offset: text={offset.text} attributes={dict(offset.attrib)}')
            direction.remove(offset)
        for words in direction.findall('direction-type/words'):
            words.attrib.pop('relative-y', None)
            words.attrib.pop('default-y', None)
    return E.tostring(root, method='c14n')


def printed_sections(output):
    geometry = json.loads((output / 'source-check/geometry.json').read_text())
    pages = json.loads((output / 'source-text.json').read_text())
    found = {}
    for page in pages:
        for word in page['text']:
            if word['text'] not in ('Intro', 'Verse', 'Chorus', 'Interlude', 'Ending'):
                continue
            text = word['text']
            right = word['x1']
            if text in ('Verse', 'Chorus'):
                suffix = [w for w in page['text'] if w['text'].isdigit()
                          and abs(w['top'] - word['top']) < 1
                          and 0 <= w['x0'] - word['x1'] < 12]
                if len(suffix) != 1:
                    raise ValueError(f'Section suffix: expected=1 actual={suffix} word={word}')
                text += ' ' + suffix[0]['text']
                right = suffix[0]['x1']
            systems = [s for s in geometry if s['page'] == page['page']
                       and 0 < s['staff'] - word['bottom'] < 45]
            if not systems:
                raise ValueError(f'Source section staff missing: page={page["page"]} word={word}')
            system = min(systems, key=lambda s:s['staff'] - word['bottom'])
            center = (word['x0'] + right) / 2
            number = system['start'] + bisect_right(system['edges'], center) - 1
            found[str(number)] = text
    return found


def verify(profile):
    output = Path(profile['out'])
    payload = json.loads((output / 'evidence/osmd-render/render.json').read_text())
    xml = payload.pop('xml').encode()
    target = output / 'score.musicxml'
    target.write_bytes(xml)
    if sha(target) != payload['xmlSHA256']:
        raise ValueError(f'Candidate digest: expected={payload["xmlSHA256"]} actual={sha(target)}')
    parser = E.XMLParser(remove_blank_text=True)
    baseline = E.parse(profile['baseline'], parser).getroot()
    actual = E.fromstring(xml, parser)
    if normalized(baseline) != normalized(actual):
        raise ValueError('XML preservation: expected=only editorial section removal and display offsets/relative-y actual=other content differs')
    if read_timeline(baseline) != read_timeline(actual):
        raise ValueError('Musical timeline changed')
    source = json.loads((output / 'source-check/extracted.json').read_text())
    source_report = verify_source(target, source, Path('data/reference/musicxml/schema'))
    source_sections = printed_sections(output)
    positions = printed_word_positions(profile)
    for number, position in positions.items():
        words = actual.find(f"part[@id='P1']/measure[@number='{number}']/direction/direction-type/words")
        if float(words.get('default-y','nan')) != position['defaultY']:
            raise ValueError(f'Instruction source height: measure={number} expected={position["defaultY"]} actual={words.get("default-y")}')
    sections = {m.get('number'):m.findtext('direction/direction-type/rehearsal')
                for m in actual.findall("part[@id='P1']/measure")
                if m.find('direction/direction-type/rehearsal') is not None}
    if sections != profile['sections'] or sections != source_sections:
        raise ValueError(f'Section source mismatch: expected={source_sections} profile={profile["sections"]} actual={sections}')
    if len(payload['directions']) != len(profile['directionAppliedQuarters']):
        raise ValueError(f'Direction coverage: expected={len(profile["directionAppliedQuarters"])} actual={len(payload["directions"])}')
    for direction in payload['directions']:
        expected = profile['directionAppliedQuarters'][str(direction['measure'])]
        if (direction['appliedQuarter'] != expected or direction['collisions']
                or not direction['withinSystem'] or not direction['withinPage']):
            raise ValueError(f'Direction placement: expectedQuarter={expected} actual={direction}')
        if direction['verticalTenths'] and direction['offsetQuarter']:
            raise ValueError(f'Vertical fallback must reset horizontal offset: actual={direction}')
    selected = {d['index']:d for d in payload['directions']}
    for index, direction in selected.items():
        proof = [p['step'] for p in payload['minimumProof'] if p['index'] == index]
        if proof != list(range(direction['steps'])):
            raise ValueError(f'Minimum grid proof: measure={direction["measure"]} expected={list(range(direction["steps"]))} actual={proof}')
    svg_ns = '{http://www.w3.org/2000/svg}'
    combined = E.Element(svg_ns+'svg',nsmap={None:svg_ns[1:-1]})
    y = 0
    width = 0
    systems = 0
    tuplets = 0
    for i in range(payload['pageCount']):
        source_svg = output / f'evidence/osmd-render/page-{i+1}.svg'
        data = source_svg.read_bytes()
        (output / f'page-{i+1}.svg').write_bytes(data)
        svg = E.fromstring(data)
        systems += len(svg.xpath('.//*[@class="staffline"]'))
        # This native renderer draws the three numeral glyphs as direct paths,
        # without a vf-tuplet wrapper; inspect their source measure explicitly.
        for note in svg.xpath('.//*[@data-note-measure="130"]')[:1]:
            measure_group = note
            while 'vf-measure' not in measure_group.get('class',''):
                measure_group = measure_group.getparent()
            tuplets += len(measure_group.xpath('./*[local-name()="path" and contains(@d,"C") and @fill="#000000"]'))
        if svg.find('.//'+svg_ns+'style[@data-score-font="Pretendard-1.3.9"]') is None:
            raise ValueError(f'Embedded score font missing: page={i+1}')
        dims = [float(v) for v in svg.get('viewBox').split()]
        width = max(width,dims[2])
        svg.set('x','0');svg.set('y',str(y))
        combined.append(svg);y += dims[3]+24
    combined.set('width',str(width));combined.set('height',str(y-24))
    combined.set('viewBox',f'0 0 {width} {y-24}')
    (output/'full-score.svg').write_bytes(E.tostring(combined,encoding='UTF-8',xml_declaration=True))
    if systems != profile['sourceSystems']:
        raise ValueError(f'System count: expected={profile["sourceSystems"]} actual={systems}')
    if tuplets != 3:
        raise ValueError(f'Native tuplet numeral paths at measure131: expected=3 actual={tuplets}')
    payload.update(status='PASS',schema='PASS',sourceMeasureReread='all137 PASS',
                   timeline='unchanged',otherXML='unchanged except editorial section removal and words display offset/source default-y/relative-y',
                   sourceSections=source_sections,systems=systems,tupletNumeralPaths=tuplets,
                   sourceReport=source_report,sourceAudioLink='unchanged')
    (output/'verification.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:payload[k] for k in ('status','xmlSHA256','pageCount','measures','systems','schema','timeline','tupletNumeralPaths')},ensure_ascii=False))


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--profile',type=Path,default=Path('tools/score-production/musicxml/profiles/red-sunset-rebuild.json'))
    ap.add_argument('--prepare',action='store_true')
    args = ap.parse_args()
    config = json.loads(args.profile.read_text())
    prepare(config) if args.prepare else verify(config)
