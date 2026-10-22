"""tom-moving: reviewed score checks followed by shared sample rendering."""
import argparse
import json
from pathlib import Path
from common.artifacts import profile
from common.drum_audio import render, LIBRARY_ROOT


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--events',type=Path,required=True)
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--library',type=Path,default=LIBRARY_ROOT)
    args=parser.parse_args()
    config=profile('tom-moving')
    data=json.loads(args.events.read_text())
    # Refuse the old independent score, even if a modified event file has 336 hits.
    from tom_moving_corrected import verify, FIXTURE, INSTRUMENTS, FIRST, BPM
    bars, _ = verify(args.events.with_name('tom-moving-source.musicxml').read_bytes(), json.loads(FIXTURE.read_text()))
    expected = sorted((round((FIRST+(i*4+e['offsetUnits']/4)*60/BPM)*44100), INSTRUMENTS[e['instrument']][3]) for i,b in enumerate(bars) for e in b)
    assert sorted((e['frame'],e['note']) for e in data['events'] if e['on']) == expected
    render(args.events,args.out,args.library,config,args.events.with_name('tom-moving-source.musicxml'))

if __name__=='__main__':
    main()
