"""Read I.O.I printed lyric underlay with explicit unresolved measure ownership.

No vocal timing is inferred. Repeated staves select their printed verse row.
The source character sequence and original physical units are retained.
"""
import argparse
from collections import Counter, defaultdict
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import re

import pdfplumber

from common.artifacts import PROFILES
from common.lyrics import underlay_candidates

PROFILE = PROFILES / 'ioi-suddenly-lyrics.json'
ORDER = list(range(1, 29)) + list(range(21, 28)) + list(range(29, 55)) + list(range(47, 54)) + list(range(55, 80))


def group_chars(chars):
    """Respect explicit source spaces and independent Latin printed fragments."""
    groups, current = [], []
    for char in chars:
        if char['text'].isspace():
            if current:
                groups.append(current)
                current = []
            continue
        if current and char['x0'] - current[-1]['x1'] > .5:
            groups.append(current)
            current = []
        current.append(char)
    if current:
        groups.append(current)
    return groups


def build(folder, out):
    cfg = json.loads(PROFILE.read_text())
    pdf_path = folder / 'input/source.pdf'
    digest = hashlib.sha256(pdf_path.read_bytes()).hexdigest()
    if cfg['sourcePDFSHA256'] != digest:
        raise ValueError('Reviewed source digest mismatch')
    if out.exists():
        raise ValueError('Use a fresh output directory')
    bars = json.loads((folder / 'extraction/extracted.json').read_text())
    rows, units = [], []
    with pdfplumber.open(pdf_path) as pdf:
        for page, start, y, verse in cfg['rows']:
            first = bars[start - 1]
            owned_bars = [b for b in bars if b['page'] == page and b['system'] == first['system']]
            chars = sorted([c for c in pdf.pages[page - 1].chars
                            if cfg['font'] in c['fontname'] and abs(c['top'] - y) < .12],
                           key=lambda c: c['x0'])
            # Rehearsal labels sit on a different baseline and are not lyrics.
            chars = [c for c in chars if abs(c['size'] - 9.12) < .1]
            row_units = []
            groups = []
            for original_group in group_chars(chars):
                text = ''.join(c['text'] for c in original_group)
                split = cfg.get('printedWordSplits', {}).get(text)
                if split:
                    offset = 0
                    for piece in split:
                        groups.append(original_group[offset:offset + len(piece)])
                        offset += len(piece)
                    assert offset == len(original_group)
                else:
                    groups.append(original_group)
            for index, group in enumerate(groups):
                bounds = [group[0]['x0'], min(c['top'] for c in group),
                          group[-1]['x1'], max(c['bottom'] for c in group)]
                center = (bounds[0] + bounds[2]) / 2
                owners = [b for b in owned_bars if b['bounds'][0] <= center < b['bounds'][2]]
                if len(owners) != 1:
                    raise ValueError(('Ambiguous measure ownership', page, y, bounds))
                bar = owners[0]
                candidate_bar = deepcopy(bar)
                for event in candidate_bar['events']:
                    if event.get('rest'):
                        event['x'] += cfg['restCenters'].get(event.get('restGlyph'), 0)
                candidates = underlay_candidates({'bounds': bounds}, candidate_bar, cfg['headCenters'])
                unit = dict(id=f'ioi-source-m{bar["number"]}-v{verse}-u{index}',
                            text=''.join(c['text'] for c in group), measure=bar['number'],
                            verse=verse, page=page, system=bar['system'], bounds=bounds,
                            sourceX=center, candidates=candidates[:2])
                row_units.append(unit)
            source = ''.join(c['text'] for c in chars)
            assert re.sub(r'\s', '', source) == ''.join(u['text'] for u in row_units)
            rows.append(dict(page=page, firstMeasure=start, verse=verse, top=y, sourceText=source,
                             sourceNonspaceCharacters=len(re.sub(r'\s', '', source))))
            units.extend(row_units)

    for merge in cfg.get('sourceUnitMerges', []):
        indices = [i for i, unit in enumerate(units)
                   if unit['measure'] == merge['measure'] and unit['verse'] == merge['verse']]
        start = next(i for i in indices if units[i]['text'] == merge['texts'][0])
        pieces = units[start:start + len(merge['texts'])]
        assert [u['text'] for u in pieces] == merge['texts']
        merged = deepcopy(pieces[0])
        merged['text'] = ''.join(u['text'] for u in pieces)
        merged['bounds'] = [pieces[0]['bounds'][0], min(u['bounds'][1] for u in pieces),
                            pieces[-1]['bounds'][2], max(u['bounds'][3] for u in pieces)]
        merged['sourceX'] = (merged['bounds'][0] + merged['bounds'][2]) / 2
        merged['sourceParts'] = [{k: u[k] for k in ['id', 'text', 'bounds']} for u in pieces]
        merged['groupingEvidence'] = merge['evidence']
        merged['candidates'] = underlay_candidates(merged, bars[merged['measure'] - 1], cfg['headCenters'])[:2]
        assert merged['candidates'][0]['distancePt'] < .05
        units[start:start + len(pieces)] = [merged]

    by_measure = defaultdict(list)
    for unit in units:
        by_measure[(unit['measure'], unit['verse'])].append(unit)
    occurrences = Counter()
    lyrics, measure_lyrics, unresolved, review = [], [], [], []
    for number, source_number in enumerate(ORDER, 1):
        occurrences[source_number] += 1
        occurrence = occurrences[source_number]
        source_units = by_measure[(source_number, occurrence)]
        chosen = []
        for unit in source_units:
            candidate = unit['candidates'][0]
            second_distance = unit['candidates'][1]['distancePt'] if len(unit['candidates']) > 1 else float('inf')
            tolerance = cfg.get('directToleranceOverrides', {}).get(
                f'{source_number}:{occurrence}:{unit["text"]}', 3.8)
            clear = candidate['distancePt'] <= tolerance and second_distance - candidate['distancePt'] > 3
            override = cfg['overrides'].get(unit['id'])
            if override:
                candidate = override
                clear = True
            review.append({**unit, 'directMatch': clear and not override, 'override': override})
            if not clear and not cfg['measureOnly'].get(f'{source_number}:{occurrence}'):
                unresolved.append(unit)
            chosen.append((unit, candidate, clear, override, tolerance))
        measure_key = f'{source_number}:{occurrence}'
        measure_reason = cfg['measureOnly'].get(measure_key)
        if measure_reason:
            measure_lyrics.append(dict(id=f'ioi-suddenly-measure-lyric-{number}', measureId=f'ioi-suddenly-m{number}',
                text=measure_reason.get('text', ' '.join(u['text'] for u in source_units)), placement='measure-center', sourceMeasure=source_number,
                sourceOccurrence=occurrence, evidence=measure_reason))
            continue
        for unit, candidate, clear, override, tolerance in chosen:
            if not clear:
                continue
            lyrics.append(dict(id=f'ioi-suddenly-lyric-{number}-{unit["id"].split("-")[-1]}', text=unit['text'],
                confirmed=False, scorePosition=dict(measureId=f'ioi-suddenly-m{number}',
                quarterOffset=candidate['quarterOffset'], durationQuarters=candidate['durationQuarters']),
                sourceMeasure=source_number, sourceOccurrence=occurrence, sourcePage=unit['page'],
                sourceSystem=unit['system'], sourceBounds=unit['bounds'], sourceX=unit['sourceX'],
                targetSourceX=candidate.get('sourceX', unit['sourceX']),
                evidence=override.get('evidence') if override else dict(kind='source-event-underlay', candidates=unit['candidates'],
                    grouping=unit.get('groupingEvidence'), sourceParts=unit.get('sourceParts'),
                    manuallyReviewedDisplacement=tolerance > 3.8),
                vocalTimingVerified=False))
    # Verify every selected printed character survives exactly once in playback order.
    expected_by_measure, actual_by_measure = {}, {}
    occurrences.clear()
    for number, source_number in enumerate(ORDER, 1):
        occurrences[source_number] += 1
        expected_by_measure[f'ioi-suddenly-m{number}'] = ''.join(
            u['text'] for u in by_measure[(source_number, occurrences[source_number])])
    for item in lyrics:
        key = item['scorePosition']['measureId']
        actual_by_measure[key] = actual_by_measure.get(key, '') + item['text']
    for item in measure_lyrics:
        assert item['measureId'] not in actual_by_measure
        actual_by_measure[item['measureId']] = re.sub(r'\s', '', item['text'])
    for key, expected in expected_by_measure.items():
        assert expected == actual_by_measure.get(key, ''), (key, expected, actual_by_measure.get(key))
    positions = [(l['scorePosition']['measureId'], l['scorePosition']['quarterOffset']) for l in lyrics]
    assert len(positions) == len(set(positions)), 'Two lyric units share a carrier onset'
    for item in lyrics:
        pos = item['scorePosition']
        assert 0 <= pos['quarterOffset'] < 4
        assert 0 < pos['durationQuarters'] <= 4 - pos['quarterOffset']
    for key, expected in cfg.get('fixtures', {}).items():
        measure, occurrence = map(int, key.split(':'))
        actual = [[item['text'], item['scorePosition']['quarterOffset']] for item in lyrics
                  if item['sourceMeasure'] == measure and item['sourceOccurrence'] == occurrence]
        assert actual == expected, ('Independent printed fixture mismatch', key, actual)
    out.mkdir(parents=True)
    result = dict(status='REVIEW_REQUIRED' if unresolved else 'PASS', sourcePDFSHA256=digest,
                  lyrics=lyrics, measureLyrics=measure_lyrics, sourceUnits=units, rows=rows,
                  review=review, unresolved=unresolved, playOrder=ORDER,
                  sourceNonspaceCharacters=sum(r['sourceNonspaceCharacters'] for r in rows),
                  selectedNonspaceCharacters=sum(len(v) for v in expected_by_measure.values()),
                  sourceCharactersPreserved=True, duplicateCarrierOnsets=0,
                  fixtureKeys=list(cfg.get('fixtures', {})),
                  rhythmicCoverage=f'{len(lyrics)} units under source note/rest starts; {len(measure_lyrics)} measures retain text without syllable rhythm',
                  measureOnlySourceNumbers=[item['sourceMeasure'] for item in measure_lyrics],
                  durationBasis='Source note/rest duration; not sung duration', vocalTimingVerified=False)
    (out / 'printed-note-lyrics.json').write_text(json.dumps(result, ensure_ascii=False, indent=2))
    print(json.dumps(dict(status=result['status'], lyrics=len(lyrics), measureLyrics=len(measure_lyrics),
                         units=len(units), unresolved=len(unresolved), sourceChars=result['sourceNonspaceCharacters']), ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dir', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    build(args.dir, args.out)
