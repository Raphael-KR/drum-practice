"""Original one-pass hand warmup. Fixture is the explicit composition authority."""
import argparse, json, struct
from collections import Counter
from pathlib import Path
from lxml import etree as E
from tom_moving import add
from tom_moving_corrected import INSTRUMENTS, midi
from verify import Resolver

FIXTURE=Path(__file__).with_name('fixtures')/'preplay_warmup.json'
BPM,FIRST,SR,TAIL=80,.25,44100,2

def verify(xml,fixture):
    schema=Path(__file__).resolve().parents[2]/'docs/experiments/musicxml/schema'
    p=E.XMLParser();p.resolvers.add(Resolver(schema))
    E.XMLSchema(E.parse(str(schema/'musicxml.xsd'),p)).assertValid(E.fromstring(xml))
    root=E.fromstring(xml);bars=root.findall('part[@id="P1"]/measure')
    assert len(bars)==96 and root.findtext('work/work-title')==fixture['title']
    assert [r.text for r in root.findall('.//rehearsal')]==[s['label'] for s in fixture['sections']]
    assert float(root.find('.//sound').get('tempo'))==BPM
    assert root.findtext('.//divisions')=='4'
    for k in 'SHMF':
        mi=root.find(f'part-list/score-part/midi-instrument[@id="P1-{k}"]')
        assert mi.findtext('midi-channel')=='10' and int(mi.findtext('midi-unpitched'))==INSTRUMENTS[k][3]+1
    parsed=[];counts=Counter();rhythms=Counter()
    for index,(m,expected) in enumerate(zip(bars,fixture['bars'])):
        assert m.get('number')==str(index+1)
        hand=None;offset=0;events=[]
        for c in m:
            if c.tag=='direction' and c.findtext('direction-type/words') in ['R','L']:hand=c.findtext('direction-type/words')
            elif c.tag=='note':
                key=c.find('instrument').get('id')[3:];duration=int(c.findtext('duration'))
                assert hand in ['R','L'] and c.findtext('type')=={1:'16th',2:'eighth',4:'quarter'}[duration]
                assert (c.findtext('unpitched/display-step'),int(c.findtext('unpitched/display-octave')))==INSTRUMENTS[key][1:3]
                assert c.findtext('stem')=='up' and c.findtext('notehead')=='normal'
                events.append({'instrument':key,'hand':hand,'durationUnits':duration,'offsetUnits':offset})
                counts[(key,hand)]+=1;rhythms[duration]+=1;offset+=duration;hand=None
        assert offset==16
        assert ''.join(e['instrument'] for e in events)==expected['instruments']
        assert ''.join(e['hand'] for e in events)==expected['hands']
        assert [e['durationUnits'] for e in events]==expected['units']
        parsed.append({'measure':index+1,'section':expected['section'],'events':events})
    assert sum(counts.values())==880
    assert {k:counts[(k,'R')] for k in 'SHMF'}==fixture['expected']['rightByInstrument']
    assert all(counts[(k,'R')]==counts[(k,'L')] for k in 'SHMF')
    for start in range(0,96,16):
        hs=Counter(e['hand'] for b in parsed[start:start+16] for e in b['events']);assert hs['R']==hs['L']
    return parsed,{'status':'PASS','MusicXML4XSD':True,'measures':96,'quarters':384,'hits':880,'hands':{'R':440,'L':440},'instrumentHands':{k:{h:counts[(k,h)] for h in 'RL'} for k in 'SHMF'},'noteDurations':dict(rhythms)}

def score(fixture):
    root=E.Element('score-partwise',version='4.0');add(add(root,'work'),'work-title',fixture['title'])
    ident=add(root,'identification');add(ident,'creator','Drum Practice',type='composer')
    add(ident,'rights','Original warmup composed for Drum Practice. Audio: preserved SoCal samples, dry offline render.')
    add(add(ident,'encoding'),'software','Drum Practice original preplay warmup generator')
    d=add(root,'defaults');sc=add(d,'scaling');add(sc,'millimeters',7);add(sc,'tenths',40)
    page=add(d,'page-layout');add(page,'page-height',1683);add(page,'page-width',1190)
    sp=add(add(root,'part-list'),'score-part',id='P1');add(sp,'part-name','Drums')
    for key in 'SHMF':add(add(sp,'score-instrument',id='P1-'+key),'instrument-name',INSTRUMENTS[key][0])
    for key in 'SHMF':
        mi=add(sp,'midi-instrument',id='P1-'+key);add(mi,'midi-channel',10);add(mi,'midi-unpitched',INSTRUMENTS[key][3]+1)
    part=add(root,'part',id='P1')
    for i,b in enumerate(fixture['bars']):
        m=add(part,'measure',number=i+1)
        if i%16==0 and i>0:add(m,'print',new_page='yes')
        elif i%4==0 and i>0:add(m,'print',new_system='yes')
        if i==0:
            a=add(m,'attributes');add(a,'divisions',4);t=add(a,'time');add(t,'beats',4);add(t,'beat-type',4);add(add(a,'clef'),'sign','percussion')
            d=add(m,'direction',placement='above');mt=add(add(d,'direction-type'),'metronome');add(mt,'beat-unit','quarter');add(mt,'per-minute',80);add(d,'sound',tempo=80)
        if i%16==0:
            d=add(m,'direction',placement='above');add(add(d,'direction-type'),'rehearsal',fixture['sections'][i//16]['label'])
        offset=0
        for j,(key,hand,units) in enumerate(zip(b['instruments'],b['hands'],b['units'])):
            d=add(m,'direction',placement='above');add(add(d,'direction-type'),'words',hand)
            n=add(m,'note');u=add(n,'unpitched');add(u,'display-step',INSTRUMENTS[key][1]);add(u,'display-octave',INSTRUMENTS[key][2]);add(n,'duration',units);add(n,'instrument',id='P1-'+key);add(n,'voice',1);add(n,'type',{1:'16th',2:'eighth',4:'quarter'}[units]);add(n,'stem','up');add(n,'notehead','normal')
            for beam in [1,2]:
                if units>(2 if beam==1 else 1):continue
                indices=[x for x in range(len(b['units'])) if sum(b['units'][:x])//4==offset//4 and b['units'][x]<=(2 if beam==1 else 1)]
                if len(indices)>1:add(n,'beam','begin' if j==indices[0] else 'end' if j==indices[-1] else 'continue',number=beam)
            offset+=units
    add(add(m,'barline',location='right'),'bar-style','light-heavy')
    return E.tostring(root,xml_declaration=True,encoding='UTF-8',pretty_print=True)

def read_midi(data):
    assert data[:4]==b'MThd' and struct.unpack_from('>HHH',data,8)==(0,1,480)
    assert data[14:18]==b'MTrk';assert struct.unpack_from('>I',data,18)[0]==len(data)-22
    pos=22;tick=0;out=[]
    def variable():
        nonlocal pos
        v=0
        while True:
            c=data[pos];pos+=1;v=(v<<7)|(c&127)
            if c<128:return v
    while pos<len(data):
        tick+=variable();status=data[pos];pos+=1
        if status==255:
            kind=data[pos];pos+=1;n=variable();payload=data[pos:pos+n];pos+=n
            if kind==81:assert int.from_bytes(payload,'big')==750000
            if kind==47:assert tick==384*480
        else:
            assert status in [0x99,0x89];key,vel=data[pos:pos+2];pos+=2;assert vel==(76 if status==0x99 else 0)
            out.append((tick,status==0x99,key))
    return out

def main():
    p=argparse.ArgumentParser();p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.out.mkdir(parents=True,exist_ok=False)
    f=json.loads(FIXTURE.read_text());xml=score(f);bars,audit=verify(xml,f)
    es=[];ms=[]
    for i,b in enumerate(bars):
        for e in b['events']:
            start=i*16+e['offsetUnits'];key=INSTRUMENTS[e['instrument']][3]
            for on,u in [(True,start),(False,start+e['durationUnits'])]:
                ms.append((u*120,on,key));es.append({'on':on,'note':key,'velocity':76 if on else 0,'channel':9,'frame':round((FIRST+u/4*60/BPM)*SR),'measure':i+1})
    es.sort(key=lambda e:(e['frame'],e['on'],e['note']));mid=midi(ms,384)
    assert read_midi(mid)==sorted(ms,key=lambda e:(e[0],e[1],e[2]))
    (a.out/'preplay-warmup-source.musicxml').write_bytes(xml);(a.out/'preplay-warmup.mid').write_bytes(mid)
    (a.out/'composition.json').write_text(json.dumps({'bpm':BPM,'firstBeat':FIRST,'bars':bars},ensure_ascii=False,indent=2))
    (a.out/'midi-events.json').write_text(json.dumps({'sampleRate':SR,'endFrame':round((FIRST+288+TAIL)*SR),'events':es},indent=2))
    rejected=[]
    for path,value,attr in [('.//note/duration','1',None),('.//note/instrument','P1-H','id'),('.//direction-type/words[.="R"]','L',None),('.//note/unpitched/display-step','A',None),('.//sound','81','tempo'),('.//midi-unpitched','40',None)]:
        d=E.fromstring(xml);n=d.find(path)
        if attr:n.set(attr,value)
        else:n.text=value
        try:verify(E.tostring(d),f)
        except (AssertionError,E.DocumentInvalid,KeyError):rejected.append(path)
        else:raise AssertionError('Corruption undetected '+path)
    audit.update(bpm=BPM,firstBeat=FIRST,musicalSeconds=288,audioSeconds=290.25,midiRoundtrip=True,rejectedMutations=rejected)
    (a.out/'generation-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2));print(json.dumps(audit,ensure_ascii=False))
if __name__=='__main__':main()
