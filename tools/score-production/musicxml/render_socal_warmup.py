"""preplay-warmup: reviewed score checks followed by shared sample rendering."""
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
    parser.add_argument('--xml',type=Path,required=True)
    args=parser.parse_args()
    config=profile('preplay-warmup')
    data=json.loads(args.events.read_text())
    from preplay_warmup import verify, FIXTURE, INSTRUMENTS
    bars, _ = verify(args.xml.read_bytes(), json.loads(FIXTURE.read_text()))
    expected = sorted((round((.25 + ((b['measure']-1)*4+e['offsetUnits']/4)*.75)*44100), INSTRUMENTS[e['instrument']][3]) for b in bars for e in b['events'])
    actual = [(e['frame'],e['note']) for e in data['events'] if e['on']]
    assert actual == expected and data['endFrame'] == round(290.25*44100)
    render(args.events,args.out,args.library,config,args.xml)

if __name__=='__main__':
    main()
