"""Source PDF display regions for the reviewed, expanded I.O.I measure order.

Display interpolation is not a source of musical rhythm. Lyric display anchors
use reviewed glyph/note coordinates separately from the fixed playback clock.
"""
import argparse
import json
from bisect import bisect_right
from pathlib import Path
from common.artifacts import require_equal
from ioi_suddenly_xml import ORDER

CENTERS = {'\ue0a4': 2.977865, '\ue0a9': 2.977865, '\ue0b3': 3.540755}


def build(bars, lyrics):
    output = []
    for index, source_number in enumerate(ORDER, 1):
        bar = bars[source_number - 1]
        left, _, right, _ = bar['bounds']
        events = bar['events']
        if bar['number'] == bar['system'] and events[0]['heads']:
            left = min(h['x'] for h in events[0]['heads']) - 3
        anchors = []
        for lyric in lyrics:
            if lyric['scorePosition']['measureId'] != f'ioi-suddenly-m{index}': continue
            x = lyric.get('targetSourceX', lyric['sourceX'])
            anchors.append(dict(lyricId=lyric['id'], quarterOffset=lyric['scorePosition']['quarterOffset'], x=(x-left)/(right-left)))
        if len(events) == 1 and events[0].get('measureRest'):
            beat_xs = [.10, .325, .55, .775]
        else:
            positions = [(event['onset'], min(h['x'] + CENTERS[h['glyph']] for h in event['heads'])
                          if event['heads'] else event['x'] + 2.5) for event in events]
            positions.append((4, right-1))
            qs = [p[0] for p in positions]; beat_xs = []
            for beat in range(4):
                j = max(0, min(len(positions)-2, bisect_right(qs, beat)-1))
                q0, x0 = positions[j]; q1, x1 = positions[j+1]
                x = x0 + (x1-x0)*(beat-q0)/(q1-q0)
                beat_xs.append((x-left)/(right-left))
        top = bar['staff']-32
        bottom = bar['staff'] + (51 if bar['system'] in (21,25,47,51) else 42)
        region = dict(id=f'ioi-suddenly-pdf-r{index}', page=bar['page']-1,
                      x=left/595, y=top/842, w=(right-left)/595, h=(bottom-top)/842,
                      beatXs=beat_xs, lyricAnchors=anchors)
        assert all(0 <= a['x'] <= 1 for a in anchors), (source_number, anchors)
        assert all(0 <= x <= 1 for x in beat_xs), (source_number, beat_xs)
        assert all(a < b for a,b in zip(beat_xs,beat_xs[1:])), source_number
        output.append(region)
    require_equal(sum(len(r['lyricAnchors']) for r in output), len(lyrics), 'PDF lyric anchors')
    return output


if __name__ == '__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--ir',type=Path,required=True); p.add_argument('--lyrics',type=Path,required=True); p.add_argument('--out',type=Path,required=True)
    a=p.parse_args()
    if a.out.exists(): raise ValueError('Use a fresh output path')
    bars=json.loads(a.ir.read_text()); review=json.loads(a.lyrics.read_text())
    regions=build(bars,review['lyrics']); a.out.write_text(json.dumps(regions,ensure_ascii=False,indent=2))
    print(json.dumps(dict(regions=len(regions),lyricAnchors=sum(len(r['lyricAnchors']) for r in regions))))
