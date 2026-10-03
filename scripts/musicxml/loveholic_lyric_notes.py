"""Build a printed-score lyric rhythm carrier, retaining source review evidence.

Starts use the actual source note/rest timeline, never proportional PDF spacing.
Four interior positions use matching printed phrase patterns and remain marked
as inferred. Carrier durations are source note values, not measured vocal ends.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw
from loveholic import PDF_SHA256

HEAD_CENTER = {'œ': 3.3325, '¿': 2.5575, 'Y': 3.255}
# Source-read parallel passages. Last eighth position is printed inside a
# quarter-note span in these four bars; a nearest-head match would move it early.
INTERIOR = {48: ('럼', 40), 99: ('럼', 83), 107: ('럼', 91), 109: ('어', 50)}


def build(folder, output):
    if output.exists():
        raise ValueError('Use a fresh output directory')
    if hashlib.sha256((folder/'source.pdf').read_bytes()).hexdigest() != PDF_SHA256:
        raise ValueError('Source digest mismatch')
    printed = json.loads((folder/'printed-lyrics-review-20261003/printed-measure-lyrics.json').read_text())
    assert printed['status'] == 'PASS' and printed['sourcePDFSHA256'] == PDF_SHA256
    bars = json.loads((folder/'extracted.json').read_text())
    entries = []
    for unit in printed['units']:
        bar = bars[unit['measure']-1]
        center = (unit['bounds'][0]+unit['bounds'][2])/2
        candidates = []
        for event in bar['events']:
            xs = [h['x']+HEAD_CENTER[h['glyph']] for h in event['heads']] or [event['x']]
            anchor = min(xs, key=lambda x: abs(x-center))
            candidates.append(dict(distancePt=abs(anchor-center), sourceX=anchor,
                                   quarterOffset=event['onset'], durationQuarters=event['duration'],
                                   kind='rest' if event.get('rest') else 'note'))
        candidates.sort(key=lambda x: x['distancePt'])
        first = candidates[0]
        inferred = first['distancePt'] > 4
        evidence = dict(kind='source-note-underlay', candidates=candidates[:2])
        if inferred:
            text, reference = INTERIOR.get(unit['measure'], ('', 0))
            if unit['text'] != text or first['quarterOffset'] != 3 or first['durationQuarters'] != 1:
                raise ValueError(f'Unreviewed displaced lyric {unit["id"]}')
            refs = [u for u in printed['units'] if u['measure'] == reference]
            offsets = [u['noteCandidates'][0]['quarterOffset'] for u in refs]
            assert offsets == [.5, 1.5, 2.5, 3.5] and refs[-1]['text'] == text
            position = dict(measureId=unit['measureId'], quarterOffset=3.5, durationQuarters=.5)
            evidence = dict(kind='parallel-printed-phrase', referenceMeasure=reference,
                            referenceOffsets=offsets, sourceSpan=[3, 4], inference=True)
        else:
            if candidates[1]['distancePt']-first['distancePt'] < 3:
                raise ValueError(f'Ambiguous event match {unit["id"]}')
            position = dict(measureId=unit['measureId'], quarterOffset=first['quarterOffset'],
                            durationQuarters=first['durationQuarters'])
        entries.append(dict(id=unit['id'], text=unit['text'], confirmed=False,
                            scorePosition=position, sourceMeasure=unit['measure'], sourcePage=unit['page'],
                            sourceSystem=unit['system'], sourceBounds=unit['bounds'],
                            evidence=evidence, vocalTimingVerified=False))
    source = ''.join(re.sub(r'\s', '', row['sourceText']) for row in printed['rows'])
    assert ''.join(e['text'] for e in entries) == source and len(source) == 353
    assert len(entries) == 269 and len({e['id'] for e in entries}) == 269
    fixtures = {7: [1, 2, 2.5, 3.5], 8: [.5, 1.5, 2.5, 3.5],
                9: [1, 2, 2.5, 3.5], 10: [1, 1.75], 39: [1, 2, 2.5, 3.5],
                40: [.5, 1.5, 2.5, 3.5], 48: [.5, 1.5, 2.5, 3.5],
                79: [1, 2.5], 99: [.5, 1.5, 2.5, 3.5],
                107: [.5, 1.5, 2.5, 3.5], 109: [.5, 1.5, 2.5, 3.5],
                113: [0, 1, 1.5, 2.5], 116: [1, 2, 2.5, 3.5],
                117: [1, 1.5, 2.5], 118: [0]}
    for number, offsets in fixtures.items():
        actual = [e['scorePosition']['quarterOffset'] for e in entries if e['sourceMeasure'] == number]
        assert actual == offsets, (number, actual)
    for a, b in zip(entries, entries[1:]):
        pa, pb = a['scorePosition'], b['scorePosition']
        assert (a['sourceMeasure'], pa['quarterOffset']) < (b['sourceMeasure'], pb['quarterOffset'])
    output.mkdir(parents=True)
    result = dict(status='PASS', sourcePDFSHA256=PDF_SHA256, lyrics=entries,
                  sourceNonspaceCharacters=353, sourceRows=25, lyricMeasures=77,
                  directSourceEventMatches=265, inferredInteriorPositions=list(INTERIOR),
                  durationBasis='Source note/rest duration used as a notation carrier; not measured vocal length',
                  positionBasis='Source note/rest underlay; four separately disclosed parallel-phrase inferences',
                  fixtureMeasures=list(fixtures), vocalTimingVerified=False)
    (output/'printed-note-lyrics.json').write_text(json.dumps(result, ensure_ascii=False, indent=2))
    # Every source row is visible together with its selected musical offsets.
    for page in [1, 2, 3]:
        image = Image.open(folder/f'source-poppler-{page}.png').convert('RGB')
        sx, sy = image.width/596, image.height/842
        strips = []
        for row in printed['rows']:
            if row['page'] != page: continue
            bar = next(b for b in bars if b['page'] == page and b['system'] == row['system'])
            top = int((bar['staff']-43)*sy); bottom = int((bar['staff']+49)*sy)
            strip = image.crop((0, top, image.width, bottom)); draw = ImageDraw.Draw(strip)
            for e in [e for e in entries if e['sourcePage'] == page and e['sourceSystem'] == row['system']]:
                x = (e['sourceBounds'][0]+e['sourceBounds'][2])/2*sx
                y = (e['sourceBounds'][3]-top/sy)*sy+2
                q = e['scorePosition']['quarterOffset']
                inferred = e['evidence'].get('inference', False)
                color = '#bf5c00' if inferred else '#076bb3'
                draw.line([(x, 20), (x, y-17)], fill=color, width=1)
                draw.text((x-7, y), str(q)+('?' if inferred else ''), fill=color)
            strips.append(strip)
        sheet = Image.new('RGB', (image.width, sum(s.height+10 for s in strips)), 'white')
        y = 0
        for strip in strips: sheet.paste(strip, (0, y)); y += strip.height+10
        sheet.save(output/f'source-note-contact-{page}.png')
    print(json.dumps({k:v for k,v in result.items() if k != 'lyrics'}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--dir', type=Path, required=True)
    p.add_argument('--out', type=Path, required=True)
    a = p.parse_args(); build(a.dir, a.out)
