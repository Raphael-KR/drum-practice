"""Generate user-corrected S-H-M-F exercises; preserve rhythm, sticking and kick."""
import argparse,json
from pathlib import Path
from collections import Counter
from lxml import etree as E
from xml_helpers import add
from common.musicxml import validate_schema, read_timeline

from common.instruments import INSTRUMENTS
from common.artifacts import profile
from common.midi import midi as write_midi, schedule
FIXTURE=Path(__file__).with_name('fixtures')/'tom_moving_video.json'
CONFIG=profile('tom-moving')
BPM,FIRST,SR,TAIL=(CONFIG[k] for k in ('bpm','firstBeat','sampleRate','tailSeconds'))

def midi(events,total_quarters):
    return write_midi(events,total_quarters,bpm=BPM,velocity=CONFIG['velocity'],channel=CONFIG['channel'])

def write_score(fixture):
    root=E.Element('score-partwise',version='4.0')
    meta=next(v for v in json.loads(Path(__file__).with_name('tom-moving-versions.json').read_text())['versions'] if v['id']=='tom-moving-video-v2')
    add(add(root,'work'),'work-title',meta['title'])
    ident=add(root,'identification');add(ident,'creator','영상 기본 패턴 · 연습용 정리',type='composer')
    add(ident,'creator',meta['artist'],type='artist')
    add(ident,'rights','Video lesson https://www.youtube.com/watch?v=ZUTH2p9C-YM; tom order corrected by user 2026-10-13; steady practice tempo/repetitions arranged for Drum Practice. Audio: preserved Portland Kit recordings, offline EXS sample render.')
    add(add(ident,'encoding'),'software','Drum Practice reviewed video exercise generator')
    sc=add(add(root,'defaults'),'scaling');add(sc,'millimeters',7);add(sc,'tenths',40)
    sp=add(add(root,'part-list'),'score-part',id='P1');add(sp,'part-name','Drums')
    for key,(name,*_) in INSTRUMENTS.items():add(add(sp,'score-instrument',id='P1-'+key),'instrument-name',name)
    for key,data in INSTRUMENTS.items():
        mi=add(sp,'midi-instrument',id='P1-'+key);add(mi,'midi-channel',10);add(mi,'midi-unpitched',data[3]+1)
    part=add(root,'part',id='P1');bars=[]
    for section in fixture['sections']:
        for j,pattern in enumerate(section['patterns']):
            number=len(bars)+1; m=add(part,'measure',number=number)
            if j==0:add(m,'print',new_system='yes' if number>1 else 'no')
            if number==1:
                a=add(m,'attributes');add(a,'divisions',4);t=add(a,'time');add(t,'beats',4);add(t,'beat-type',4);add(add(a,'clef'),'sign','percussion')
                d=add(m,'direction',placement='above');metro=add(add(d,'direction-type'),'metronome');add(metro,'beat-unit','quarter');add(metro,'per-minute',BPM);add(d,'sound',tempo=BPM)
            if j==0:
                d=add(m,'direction',placement='above');add(add(d,'direction-type'),'rehearsal',section['name'])
            source=fixture['evidence'][pattern];events=[];offset=0
            for i,(key,hand,units) in enumerate(zip(source['instruments'],source['hands'],source['durationUnits'])):
                d=add(m,'direction',placement='above');add(add(d,'direction-type'),'words',hand)
                note(m,key,units,1)
                n=m[-1];peers=[k for k in range(len(source['durationUnits'])) if sum(source['durationUnits'][:k])//4==offset//4]
                add(n,'beam','begin' if i==peers[0] else 'end' if i==peers[-1] else 'continue',number=1)
                shorts=[k for k in peers if source['durationUnits'][k]==1]
                if units==1:add(n,'beam','begin' if i==shorts[0] else 'end' if i==shorts[-1] else 'continue',number=2)
                events.append({'offsetUnits':offset,'durationUnits':units,'instrument':key,'hand':hand});offset+=units
            if section['kick']:
                add(add(m,'backup'),'duration',16)
                for offset in range(0,16,4):
                    note(m,'K',4,2);events.append({'offsetUnits':offset,'durationUnits':4,'instrument':'K','hand':None})
            bars.append({'measure':number,'section':section['name'],'pattern':pattern,'events':events})
    add(add(m,'barline',location='right'),'bar-style','light-heavy')
    return E.tostring(root,xml_declaration=True,encoding='UTF-8',pretty_print=True),bars

def note(m,key,units,voice):
    n=add(m,'note');u=add(n,'unpitched');data=INSTRUMENTS[key];add(u,'display-step',data[1]);add(u,'display-octave',data[2]);add(n,'duration',units);add(n,'instrument',id='P1-'+key);add(n,'voice',voice);add(n,'type',{1:'16th',2:'eighth',4:'quarter'}[units]);add(n,'stem','up' if voice==1 else 'down');add(n,'notehead','normal')

def read_events(xml):
    root=E.fromstring(xml);out=[];hands=[]
    for i,m in enumerate(root.findall('part[@id="P1"]/measure')):
        cursor=0;hand=None;bar=[]
        for child in m:
            if child.tag=='backup':cursor-=int(child.findtext('duration'))
            elif child.tag=='direction' and child.find('direction-type/words') is not None:hand=child.findtext('direction-type/words')
            elif child.tag=='note':
                key=child.find('instrument').get('id').removeprefix('P1-');units=int(child.findtext('duration'))
                assert (child.findtext('unpitched/display-step'),int(child.findtext('unpitched/display-octave')))==INSTRUMENTS[key][1:3]
                assert child.findtext('type')=={1:'16th',2:'eighth',4:'quarter'}[units]
                bar.append({'offsetUnits':cursor,'durationUnits':units,'instrument':key,'hand':hand if key!='K' else None});cursor+=units;hand=None
        assert cursor==16
        out.append(bar)
    return out

def verify(xml,fixture):
    schema=Path(__file__).resolve().parents[3]/'data/reference/musicxml/schema';read_timeline(validate_schema(xml,schema))
    bars=read_events(xml);assert len(bars)==fixture['expected']['measures'];counts=Counter();hands=Counter();index=0
    for s in fixture['sections']:
        for pattern in s['patterns']:
            bar=bars[index];base=fixture['evidence'][pattern];hand=[e for e in bar if e['instrument']!='K'];kick=[e for e in bar if e['instrument']=='K']
            assert ''.join(e['instrument'] for e in hand)==base['instruments']
            assert ''.join(e['hand'] for e in hand)==base['hands']
            assert [e['durationUnits'] for e in hand]==base['durationUnits']
            assert [e['offsetUnits'] for e in hand]==[sum(base['durationUnits'][:i]) for i in range(len(hand))]
            assert [e['offsetUnits'] for e in kick]==([0,4,8,12] if s['kick'] else [])
            assert all(e['durationUnits']==4 and e['hand'] is None for e in kick)
            counts.update(e['instrument'] for e in bar);hands.update(e['hand'] for e in hand);index+=1
    assert dict(counts)==fixture['expected']['instrumentHits']
    assert (hands['R'],hands['L'])==(208,80)
    return bars,{'status':'PASS','MusicXML4XSD':True,**fixture['expected'],'instrumentHits':dict(counts)}

def main():
    p=argparse.ArgumentParser();p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.out.mkdir(parents=True,exist_ok=False)
    fixture=json.loads(FIXTURE.read_text());xml,bars=write_score(fixture);_,audit=verify(xml,fixture)
    (a.out/'tom-moving-source.musicxml').write_bytes(xml);(a.out/'composition.json').write_text(json.dumps({'bpm':BPM,'firstBeat':FIRST,'bars':bars},ensure_ascii=False,indent=2))
    es,ms=schedule(bars,INSTRUMENTS,bpm=BPM,first=FIRST,sample_rate=SR,velocity=CONFIG['velocity'],channel=CONFIG['channel'])
    (a.out/'midi-events.json').write_text(json.dumps({'sampleRate':SR,'endFrame':round((FIRST+112*60/BPM+TAIL)*SR),'events':es},indent=2))
    (a.out/'tom-moving.mid').write_bytes(midi(ms,CONFIG['quarters']))
    mutations=[]
    for path,value,attr in [('.//note/duration','1',None),('.//note/instrument','P1-H','id'),('.//direction-type/words','L',None),('.//note/unpitched/display-step','A',None),('.//backup/duration','12',None)]:
        d=E.fromstring(xml);n=d.find(path)
        if attr:n.set(attr,value)
        else:n.text=value
        try:verify(E.tostring(d),fixture)
        except (AssertionError,E.DocumentInvalid,KeyError,ValueError):mutations.append(path)
        else:raise AssertionError('Corruption undetected')
    audit.update(bpm=BPM,firstBeat=FIRST,musicalSeconds=84,audioSeconds=86.25,rejectedMutations=mutations)
    (a.out/'generation-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2));print(json.dumps(audit,ensure_ascii=False))
if __name__=='__main__':main()
