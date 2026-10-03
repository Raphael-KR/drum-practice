"""Source-read fixtures and mutation checks for the Loveholic transcription.

Fixtures below were read from original PDF page/crops, not generated from the
intermediate representation. This is internal review, not a blind external audit.
"""
import argparse
import json
import tempfile
import xml.etree.ElementTree as E
from pathlib import Path

from loveholic import verify_musicxml, INSTRUMENTS


def signature(bar):
    return [(e["duration"], tuple((h["glyph"], h["pos"]) for h in e["heads"])) for e in bar["events"]]


def check(folder):
    bars = json.loads((folder / "extracted.json").read_text())
    X=("¿",-1); R=("¿",0); O=("Y",-1); S=("œ",3); K=("œ",7); F=("œ",5)
    fixtures={
        1:[(1,(X,))]*4,
        2:[(.5,(("œ",5),))]+[(.25,(("œ",p),)) for p in [2,3,3,1,3,3,2,3,3,3,3,1,5,5]],
        3:[(1,(O,K)),(.5,(R,S)),(.5,(R,)),(.5,(R,K)),(.5,(R,K)),(.5,(R,S)),(.5,(R,K))],
        4:[(.5,(R,)),(.5,(R,K)),(.5,(R,S)),(.5,(R,)),(.5,(R,K)),(.5,(R,K)),(.5,(R,S)),(.5,(R,))],
        10:[(.25,(S,))]*6+[(.25,(O,K))]+[(.25,(S,))]*5+[(.25,(O,K))]+[(.25,(S,))]*3,
        20:[(.25,(O,K))]+[(.25,(S,))]*5+[(.25,(O,K))]+[(.25,(S,))]*5+[(1,(O,K))],
        36:[(.5,())]+[(.5,(S,F))]*7,
        71:[(1,(O,K)),(.5,(S,)),(.5,(O,K)),(.5,()),(.5,(K,)),(.5,(X,S)),(.5,(X,))],
        120:[(1,(O,K)),(1,()),(2,())],
        123:[(4,())],
    }
    for number, fixture in fixtures.items():
        if signature(bars[number-1]) != fixture:raise ValueError(f"Independent source fixture failed: {number}")
    # Source glyph counts across all three PDF pages, enumerated independently
    # during input inspection: 824 normal, 667 cross, 89 circle-cross heads.
    counts={glyph:sum(h['glyph']==glyph for b in bars for e in b['events'] for h in e['heads']) for glyph in ['œ','¿','Y']}
    assert counts=={'œ':824,'¿':667,'Y':89},counts
    assert [b['number'] for b in bars]==list(range(1,124))
    assert [b['number'] for b in bars if b['section']]==[1,21,37,53,63,80,96,112]
    assert [b['number'] for b in bars if b['wedges']]==[36,62,79,95,119]
    path=folder/'loveholic.musicxml'
    schema=Path('docs/experiments/musicxml/schema/musicxml.xsd')
    audit=verify_musicxml(bars,path,schema)
    assert (audit['accents'],audit['open_actions'],audit['close_actions'],audit['half_muted'])==(9,36,1,20)
    crops=json.loads((folder/'pdf-crop-systems.json').read_text())
    for bar in bars:
        crop=next(c for c in crops if c['page']==bar['page'] and c['system']==bar['system'])
        for event in bar['events']:
            for head in event['heads']:
                assert crop['top'] < head['y']-3 < head['y']+3 < crop['bottom']
            for beam in event['beams']:
                assert crop['top'] < beam['top'] < beam['top']+3.5 < crop['bottom']
    for page in [1,2,3]:
        rows=[c for c in crops if c['page']==page]
        assert all(a['bottom']==b['top'] for a,b in zip(rows,rows[1:]))
    # The own-row printed lyric at system 7 must stay before system 11.
    cues=json.loads((folder/'printed-lyric-cues.json').read_text())
    for cue in cues:
        crop=next(c for c in crops if c['page']==cue['page'] and c['system']==cue['system'])
        assert all(crop['top'] < c['top'] and c['top']+10 < crop['bottom'] for c in cue['chars'])
    mutations=[]
    with tempfile.TemporaryDirectory(dir=folder,prefix='verification-') as temp:
        for kind in ['missing_note','wrong_duration','wrong_instrument','wrong_notehead','wrong_chord']:
            root=E.parse(path)
            note=root.find('./part/measure[@number="3"]/note')
            if kind=='missing_note':root.find('./part/measure[@number="3"]').remove(note)
            if kind=='wrong_duration':note.find('duration').text='24'
            if kind=='wrong_instrument':note.find('instrument').set('id','P1-snare')
            if kind=='wrong_notehead':note.find('notehead').text='normal'
            if kind=='wrong_chord':root.find('./part/measure[@number="3"]/note[2]').remove(root.find('./part/measure[@number="3"]/note[2]/chord'))
            candidate=Path(temp)/(kind+'.musicxml');root.write(candidate,encoding='utf-8',xml_declaration=True)
            try:verify_musicxml(bars,candidate,schema)
            except (ValueError,AssertionError):mutations.append(kind)
            else:raise AssertionError('Mutation accepted: '+kind)
    result=dict(status='PASS',source_fixture_measures=list(fixtures),source_head_counts=counts,
                fixtures_origin='manual reading of source PDF; internal nonblind review',
                mutation_rejections=mutations,full_score=audit,
                pdf_crop_systems_checked=len(crops),pdf_crop_checks='heads/beams/own lyric rows contained; adjacent system crops do not overlap')
    (folder/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    print(json.dumps(result,ensure_ascii=False,indent=2))


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--dir',type=Path,required=True)
    check(p.parse_args().dir)
