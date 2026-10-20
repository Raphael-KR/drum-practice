"""Independent source-specific XML/schema reread; only real supplied score."""
import argparse,hashlib,json,sys
from pathlib import Path
from fractions import Fraction as F
from lxml import etree as E
from verify import Resolver
from red_sunset import instrument

def run(path,bars,schema):
    parser=E.XMLParser(no_network=True,resolve_entities=False);parser.resolvers.add(Resolver(schema))
    xsd=E.XMLSchema(E.parse(str(schema/'musicxml.xsd'),parser));doc=E.parse(str(path),parser);xsd.assertValid(doc)
    ms=doc.findall("part[@id='P1']/measure")
    if len(ms)!=137:raise ValueError('Measure count')
    total=0;headcount=0
    for b,m in zip(bars,ms):
        if int(m.get('number'))!=b['number']:raise ValueError('Measure label')
        cursor=0;last=0;heads=[];durations=[]
        for n in m.findall('note'):
            duration=int(n.findtext('duration','0'));grace=n.find('grace') is not None
            chord=n.find('chord') is not None
            if not chord:last=cursor;cursor+=duration
            if not grace:
                nominal={'half':F(2),'quarter':F(1),'eighth':F(1,2),'16th':F(1,4),'32nd':F(1,8)}[n.findtext('type')]
                tm=n.find('time-modification')
                if tm is not None:nominal*=F(int(tm.findtext('normal-notes')),int(tm.findtext('actual-notes')))
                if nominal*96!=duration:raise ValueError('Declared type/duration '+str(b['number']))
            if not chord:durations.append(duration)
            if n.find('rest') is None:heads.append((round(last/96,8),duration,grace,n.find('instrument').get('id'),n.findtext('unpitched/display-step'),n.findtext('unpitched/display-octave'),n.findtext('notehead')))
        expected=[]
        for ev in b['events']:
            for h in ev['heads']:
                iid,_,_,st,oct,head=instrument(h,b['number']);expected.append((round(ev['onset'],8),round(ev['duration']*96),bool(ev.get('grace')),'P1-'+iid,st,str(oct),head))
        if heads!=expected:raise ValueError('Source head reread '+str(b['number']))
        if cursor!=96*(6 if b['number']==135 else 4):raise ValueError('Duration '+str(b['number']))
        # Independently read representative printed rhythms, not generated fixtures.
        representatives={7:[96,96,48,48,48,24,24],9:[96]+[24]*12,131:[96]+[32]*9,135:[48]*12,136:[12]*4+[24]*10+[0,96]}
        if b['number'] in representatives and durations!=representatives[b['number']]:raise ValueError('Manual representative '+str(b['number']))
        headcount+=len(heads);total+=cursor/96
    if len(doc.findall('.//time-modification'))!=9 or len(doc.findall('.//tuplet'))!=6:raise ValueError('Tuplet ratio/edges')
    if len(doc.findall('.//accent'))!=1:raise ValueError('Source accent')
    return dict(file=str(path),sha256=hashlib.sha256(path.read_bytes()).hexdigest(),schema='MusicXML4.0 PASS',sourceMeasureReread='all137 PASS',manualRepresentativeRhythms=[7,9,131,135,136],measures=137,quarters=int(total),noteheads=headcount,graceNotes=1,tuplets=9,sourceEditorialMeasure135=6,limits=['This is structural validation, not listening verification.','Current OSMD suppresses the third consecutive tuplet number; source XML retains three groups.'])

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--xml',type=Path,required=True);ap.add_argument('--root',type=Path,default=Path('data/production/red-sunset'));ap.add_argument('--out',type=Path,required=True);a=ap.parse_args()
    report=run(a.xml,json.loads((a.root/'source/extracted.json').read_text()),Path('data/reference/musicxml/schema'))
    a.out.write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False))
if __name__=='__main__':main()
