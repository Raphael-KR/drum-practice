"""Source-bound MuseScore PDF extraction for the supplied YB Lv2 score.

Rhythm comes from stems/beam rectangles/flags, never horizontal spacing.
Unresolved or non-four-quarter measures are retained and block XML export.
"""
import argparse
import hashlib
import json
from pathlib import Path
from fractions import Fraction
from collections import Counter
from bisect import bisect_right
import pdfplumber
from lxml import etree as E
from xml_helpers import add

PDF_SHA = '20f9b136b03a8a547f952f1543aa57983777f702f0e09168d1cb8fb6043c9112'
HEADS = {'\ue0a4': 'normal', '\ue0a9': 'x', '\ue0b3': 'circle-x'}
RESTS = {'\ue4e4': 2, '\ue4e5': 1, '\ue4e6': .5}

def oy(p,c): return p.height-c['matrix'][5]

def geometry(pdf):
    systems=[]; number=1
    for pi,p in enumerate(pdf.pages):
        ys=sorted(set(round(l['top'],4) for l in p.lines if l['width']>15 and l['height']<.01 and abs(l['linewidth']-.34003)<.01))
        if len(ys)%5: raise ValueError('Incomplete staff')
        for i in range(0,len(ys),5):
            top=ys[i]; space=(ys[i+4]-top)/4
            if any(abs(ys[i+j]-top-j*space)>.01 for j in range(5)):raise ValueError('Staff spacing')
            lines=[l for l in p.lines if l['width']<.01 and abs(l['top']-(top-.17))<.03 and abs(l['height']-(4*space+.34))<.03]
            edges=[28.348]+sorted(set(round(l['x0'],4) for l in lines))
            # Final double bar strokes: one measure boundary.
            merged=[]
            for x in edges:
                if merged and x-merged[-1]<4:merged[-1]=x
                else:merged.append(x)
            labels=sorted([c for c in p.chars if 'MScore' not in c['fontname'] and c['text'].isdigit() and c['x0']<35 and top-25<oy(p,c)<top-5],key=lambda c:c['x0'])
            label=''.join(c['text'] for c in labels)
            if label and int(label)!=number:raise ValueError(f'Printed {label}, counted {number}')
            systems.append(dict(page=pi+1,start=number,staff=top,spacing=space,edges=merged))
            number+=len(merged)-1
    return systems

def extract_measure(p,s,left,right,number):
    top=s['staff']; space=s['spacing']
    cs=[c for c in p.chars if 'MScore' in c['fontname'] and left<=c['x0']<right-.3 and top-27<oy(p,c)<top+20]
    stems=[l for l in p.lines if abs(l['linewidth']-.5526)<.01 and l['width']<.01 and left<l['x0']<right and top-28<l['top']<top+20]
    beams=[r for r in p.rects if r['fill'] and left<r['x0']<right and top-28<r['top']<top+20 and r['width']>2 and abs(r['height']-space/2)<.03]
    events=[];issues=[]
    for c in cs:
        t=c['text'];y=oy(p,c)
        if t in RESTS:
            events.append(dict(x=c['x0'],duration=RESTS[t],rest=True,heads=[],beams=[]));continue
        if t not in HEADS:continue
        pos=round((y-top)/(space/2))
        offset=6.36 if t=='\ue0b3' else 5.322
        st=[l for l in stems if abs(l['x0']-c['x0']-offset)<.15 and l['top']-.2<y<l['bottom']+2.2]
        if len(st)!=1:
            # Slashed small grace at the end is separate, without duration.
            if number==136 and c['size']<15:
                events.append(dict(x=c['x0'],duration=0,grace=True,heads=[dict(pos=pos,glyph=t,x=c['x0'],y=y)],beams=[]));continue
            issues.append(f'Stem {t}/{pos}@{c["x0"]:.3f}: {len(st)}');continue
        stem=st[0]
        h=dict(pos=pos,glyph=t,x=c['x0'],y=y)
        ev=next((e for e in events if e.get('stem')==stem['x0']),None)
        if ev:ev['heads'].append(h);continue
        hits=[dict(x0=round(r['x0'],4),x1=round(r['x1'],4),top=round(r['top'],4)) for r in beams if r['x0']-.4<=stem['x0']<=r['x1']+.4 and -1.2<r['top']-stem['top']<9]
        flag=any(f['text']=='\ue240' and abs(f['x0']-stem['x0'])<.3 and abs(oy(p,f)-stem['top'])<1 for f in cs)
        level=len(hits) or int(flag)
        duration=1/2**level
        events.append(dict(x=stem['x0'],stem=stem['x0'],duration=duration,heads=[h],beams=hits,flag=flag))
    events.sort(key=lambda e:e['x'])
    # 131: three explicit eighth-note triplet groups, after the opening quarter.
    if number==131:
        for e in events[1:]:e.update(duration=1/3,tuplet=True)
    cursor=Fraction(0)
    for e in events:
        e['onset']=float(cursor);cursor+=Fraction(e['duration']).limit_denominator(96)
        e['heads'].sort(key=lambda h:h['pos'])
    # The source's free ending explicitly leaves repetition count open.
    # Printed m135 contains twelve eighths (six quarters) under the original
    # 4/4 signature. Keep all twelve, with a documented hidden editorial meter.
    expected=6 if number==135 else 4
    if cursor!=expected:issues.append(f'Duration {cursor} != {expected}')
    for c in cs:
        if c['text'] not in {'\ue5e7','\ue5e5','\ue4a0'}:continue
        ev=min(events,key=lambda e:abs(e['x']-c['x0']))
        if c['text']=='\ue4a0':ev['accent']=True
        else:ev.setdefault('techniques',[]).append('open' if c['text']=='\ue5e7' else 'close')
    return dict(number=number,page=s['page'],system=s['start'],staff=top,bounds=[left,top-30,right,top+25],events=events,issues=issues,
                raw=[dict(glyph=c['text'],x=c['x0'],y=oy(p,c)) for c in cs])

INSTRUMENTS={
    ('\ue0a4',7):('kick','Right Bass / Single Kick',36,'F',4,'normal'),
    ('\ue0a4',3):('snare','Snare',38,'C',5,'normal'),
    ('\ue0a4',1):('tom1','Tom 1',50,'E',5,'normal'),
    ('\ue0a4',2):('tom2','Tom 2',47,'D',5,'normal'),
    ('\ue0a4',5):('tom4','Tom 4 / Floor Tom',43,'A',4,'normal'),
    ('\ue0a9',0):('ride','Ride',51,'F',5,'x'),
    ('\ue0a9',-1):('hh','Closed Hi-Hat',42,'G',5,'x'),
    ('\ue0b3',-2):('crash','Crash cymbal',49,'A',5,'x'),
}
SECTIONS={2:'Intro',18:'Verse 1',26:'Chorus 1',34:'Verse 2',50:'Chorus 2',58:'Interlude',66:'Verse 3',74:'Chorus 3',82:'Verse 4',98:'Chorus 4',106:'Chorus 5',114:'Chorus 6',122:'Interlude',134:'Ending'}
OPEN_RANGES=[(26,33),(50,65),(74,81),(105,121)]
OPEN_CLOSE_DISPLAY=json.loads((Path(__file__).parent/'profiles/red-sunset-open-close.json').read_text())['display']

def instrument(h,n):
    result=INSTRUMENTS[h['glyph'],h['pos']]
    if result[0]=='hh' and any(a<=n<=b for a,b in OPEN_RANGES):return ('hh-open','Open Hi-Hat',46,'G',5,'circle-x')
    return result

def write_xml(bars,path):
    if any(b['issues'] for b in bars):raise ValueError('Unresolved source extraction')
    root=E.Element('score-partwise',version='4.0');add(add(root,'work'),'work-title','붉은 노을')
    ident=add(root,'identification');add(ident,'creator','YB',type='artist')
    enc=add(ident,'encoding');add(enc,'software','Source-bound MuseScore vector extraction, drum-practice')
    misc=add(ident,'miscellaneous');add(misc,'miscellaneous-field',"Yeol's Drum",name='drum-practice:source-credit')
    add(misc,'miscellaneous-field',PDF_SHA,name='drum-practice:source-pdf-sha256')
    add(misc,'miscellaneous-field','Printed m135 has twelve eighth notes under 4/4 and a free/slowing ending instruction. All notes retained; hidden editorial 6/4 at m135, restored hidden 4/4 at m136. No extra repeated bars invented.',name='drum-practice:source-editorial-notes')
    defs=add(root,'defaults');sc=add(defs,'scaling');add(sc,'millimeters',7);add(sc,'tenths',40)
    pl=add(defs,'page-layout');add(pl,'page-height',1697);add(pl,'page-width',1201)
    margins=add(pl,'page-margins',type='both')
    for k,v in [('left-margin',65),('right-margin',65),('top-margin',45),('bottom-margin',45)]:add(margins,k,v)
    sp=add(add(root,'part-list'),'score-part',id='P1');add(sp,'part-name','Drum')
    instruments={v[0]:v for v in INSTRUMENTS.values()};instruments['hh-open']=('hh-open','Open Hi-Hat',46,'G',5,'circle-x')
    for iid,name,*_ in instruments.values():add(add(sp,'score-instrument',id='P1-'+iid),'instrument-name',name)
    for iid,_,midi,*_ in instruments.values():
        mi=add(sp,'midi-instrument',id='P1-'+iid);add(mi,'midi-channel',10);add(mi,'midi-unpitched',midi+1)
    part=add(root,'part',id='P1');previous=None
    for b in bars:
        n=b['number'];m=add(part,'measure',number=n,width=round((b['bounds'][2]-b['bounds'][0])*2,2))
        if not previous or b['system']!=previous['system']:
            pr=add(m,'print',**({} if not previous else {'new_page' if b['page']!=previous['page'] else 'new_system':'yes'}));sl=add(pr,'system-layout');add(sl,'top-system-distance' if not previous else 'system-distance',180 if not previous else 80)
        if n in [1,135,136]:
            attr=add(m,'attributes')
            if n==1:add(attr,'divisions',96)
            time=add(attr,'time',**({} if n==1 else {'print_object':'no'}));add(time,'beats',6 if n==135 else 4);add(time,'beat-type',4)
            if n==1:
                add(add(attr,'clef'),'sign','percussion');d=add(m,'direction',placement='above');met=add(add(d,'direction-type'),'metronome');add(met,'beat-unit','quarter');add(met,'per-minute',134);add(d,'sound',tempo=134)
        if n in SECTIONS:add(add(add(m,'direction',placement='above'),'direction-type'),'rehearsal',SECTIONS[n])
        for text in ({26:'H.H OPEN (o) →',30:'H.H OPEN (o) →',34:'H.H CLOSE (+) →',50:'H.H OPEN (o) →',54:'H.H OPEN (o) →',58:'H.H OPEN (o) →',66:'H.H CLOSE (+) →',74:'H.H OPEN (o) →',78:'H.H OPEN (o) →',82:'H.H CLOSE (+) →',105:'H.H OPEN (o) →',106:'H.H OPEN (o) →',114:'H.H OPEN (o) →',118:'H.H OPEN (o) →',134:'손발 안맞춰도 좋으니 맘껏 후려주세요!',136:'횟수 관계 없이 점점 느려지게 연주해주시면 됩니다.'}.get(n),):
            if text:
                d=add(m,'direction',placement='above');add(add(d,'direction-type'),'words',text,font_size=10)
        # Source wedges span the noted systems; use music offsets, not pixels.
        for typ,off in ({48:[('crescendo',0)],49:[('stop',4)],96:[('crescendo',0)],97:[('stop',4)],110:[('crescendo',.5)],111:[('stop',4)],112:[('diminuendo',0),('stop',4)]}.get(n,[])):
            d=add(m,'direction',placement='above');add(add(d,'direction-type'),'wedge',type=typ,number=1);add(d,'offset',int(off*96))
        for ei,e in enumerate(b['events']):
            for hi,h in enumerate(e['heads'] or [None]):
                note=add(m,'note',default_x=round((e['x']-b['bounds'][0])*2,2))
                if e.get('grace'):add(note,'grace',slash='yes')
                if hi:add(note,'chord')
                if h:
                    iid,_,_,step,octave,head=instrument(h,n);u=add(note,'unpitched');add(u,'display-step',step);add(u,'display-octave',octave)
                else:add(note,'rest')
                if not e.get('grace'):add(note,'duration',round(e['duration']*96))
                if h:add(note,'instrument',id='P1-'+iid)
                add(note,'voice',1)
                typ='eighth' if e.get('grace') or e.get('tuplet') else {2:'half',1:'quarter',.5:'eighth',.25:'16th',.125:'32nd'}[e['duration']]
                add(note,'type',typ)
                if e.get('tuplet'):
                    tm=add(note,'time-modification');add(tm,'actual-notes',3);add(tm,'normal-notes',2);add(tm,'normal-type','eighth')
                if h:add(note,'stem','up');add(note,'notehead',head)
                if not hi:
                    for level,beam in enumerate(sorted(e['beams'],key=lambda x:x['top']),1):
                        others=[j for j,ev in enumerate(b['events']) if beam in ev['beams']]
                        value='begin' if ei==min(others) else 'end' if ei==max(others) else 'continue'
                        if len(others)==1:value='forward hook' if beam['x1']>e['x']+1 else 'backward hook'
                        add(note,'beam',value,number=level)
                tech=h and h['glyph']=='\ue0a9' and h['pos']==-1 and e.get('techniques')
                if tech or (e.get('accent') and not hi) or (e.get('tuplet') and ei in [1,3,4,6,7,9]):
                    no=add(note,'notations')
                    if e.get('accent') and not hi:add(add(no,'articulations'),'accent',placement='above')
                    if tech:
                        t=add(no,'technical')
                        if len(tech)==2 and set(tech)=={'open','close'}:
                            for name,attributes in OPEN_CLOSE_DISPLAY.items():add(t,name,**attributes)
                        else:
                            for kind in tech:add(t,'open-string' if kind=='open' else 'stopped',placement='above')
                    if e.get('tuplet') and ei in [1,3,4,6,7,9]:add(no,'tuplet',type='start' if ei in [1,4,7] else 'stop',number=1,bracket='no')
        if n==137:add(add(m,'barline',location='right'),'bar-style','light-heavy')
        previous=b
    E.indent(root);path.write_bytes(E.tostring(root,encoding='utf-8',xml_declaration=True))

def pdf_regions(bars):
    """Source image crop/beat geometry; not used to infer note duration."""
    regions=[]
    for b in bars:
        left,_,right,_=b['bounds']
        if b['number']==b['system']:left=max(left,min(e['x'] for e in b['events'])-6)
        beats=6 if b['number']==135 else 4
        events=[e for e in b['events'] if not e.get('grace')]
        onsets=[e['onset'] for e in events]+[beats]
        xs=[e['x']-2.5 if e['heads'] else e['x'] for e in events]+[right-1]
        positions=[]
        for beat in range(beats):
            i=max(0,min(len(onsets)-2,bisect_right(onsets,beat)-1))
            u=(beat-onsets[i])/(onsets[i+1]-onsets[i]);x=xs[i]+u*(xs[i+1]-xs[i])
            positions.append((x-left)/(right-left))
        regions.append(dict(id='red-sunset-pdf-r'+str(b['number']),page=b['page']-1,x=left/595,y=(b['staff']-32)/842,w=(right-left)/595,h=58/842,beatXs=positions))
    return regions

def main():
    a=argparse.ArgumentParser();a.add_argument('--pdf',type=Path,required=True);a.add_argument('--out',type=Path,required=True);args=a.parse_args()
    if hashlib.sha256(args.pdf.read_bytes()).hexdigest()!=PDF_SHA:raise ValueError('Wrong source PDF')
    with pdfplumber.open(args.pdf) as pdf:
        ss=geometry(pdf);bars=[]
        for s in ss:
            for i,(l,r) in enumerate(zip(s['edges'],s['edges'][1:])):bars.append(extract_measure(pdf.pages[s['page']-1],s,l,r,s['start']+i))
    args.out.mkdir(parents=True,exist_ok=True)
    (args.out/'geometry.json').write_text(json.dumps(ss,indent=2))
    (args.out/'extracted.json').write_text(json.dumps(bars,ensure_ascii=False,indent=2))
    (args.out/'pdf-regions.json').write_text(json.dumps(pdf_regions(bars),indent=2))
    print('Systems',len(ss),'Measures',len(bars),'Heads',Counter((h['glyph'],h['pos']) for b in bars for e in b['events'] for h in e['heads']))
    for b in bars:
        if b['issues']:print(b['number'],b['issues'])
    if not any(b['issues'] for b in bars):write_xml(bars,args.out/'red-sunset-source.musicxml')

if __name__=='__main__':main()
