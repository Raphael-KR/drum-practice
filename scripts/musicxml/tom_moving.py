"""Original 16-bar tom-moving exercise; no imported score or audio samples."""
import argparse
import hashlib
import json
import math
import subprocess
import wave
from pathlib import Path
from lxml import etree as E
import numpy as np

BPM, SR, FIRST, TAIL = 80, 44100, .25, .8
TOMS = {"H": ("Tom 1", "E", 5, 50, 180, -.24),
        "M": ("Tom 2", "D", 5, 47, 135, 0),
        "F": ("Tom 4 / Floor Tom", "A", 4, 43, 90, .24)}

def add(parent, tag, text=None, **attrs):
    el=E.SubElement(parent,tag,**{k.replace('_','-'):str(v) for k,v in attrs.items()})
    if text is not None:el.text=str(text)
    return el

def composition():
    # Explicit authorship input. Groups, ordering and hand assignment are intentional.
    paths=["HMFM", "FMHM", "MFHM", "HFMF"]
    bars=[]
    for i in range(16):
        section=i//4
        if section==0:
            rhythm=[(.5, "R" if i%2==0 else "L")]*2
        elif section==1:rhythm=[(.25,"R"),(.25,"L")]*2
        elif section==2:rhythm=[(.5,"R"),(.25,"R"),(.25,"L")]
        else:rhythm=[(.25,"R"),(.25,"L"),(.5,"R")]
        events=[]
        for beat,tom in enumerate(paths[i%4]):
            offset=float(beat)
            for duration,hand in rhythm:
                events.append({"quarterOffset":offset,"durationQuarters":duration,"tom":tom,
                    "hand":hand,"velocity":76,"time":FIRST+(i*4+offset)*60/BPM})
                offset+=duration
        bars.append({"measure":i+1,"section":"ABCD"[section],"events":events})
    return bars

def score(bars):
    root=E.Element("score-partwise",version="4.0")
    add(add(root,"work"),"work-title","탐탐 무빙 연습")
    ident=add(root,"identification");add(ident,"creator","Drum Practice",type="composer")
    add(ident,"rights","Original exercise and synthesized audio created for Drum Practice; no third-party score or recording embedded.")
    add(add(ident,"encoding"),"software","Drum Practice original exercise generator")
    defaults=add(root,"defaults");sc=add(defaults,"scaling");add(sc,"millimeters",7);add(sc,"tenths",40)
    part=add(add(root,"part-list"),"score-part",id="P1");add(part,"part-name","Toms");add(part,"part-abbreviation","Toms")
    for tom,(name,*_) in TOMS.items():add(add(part,"score-instrument",id="P1-"+tom),"instrument-name",name)
    for tom,data in TOMS.items():
        midi=add(part,"midi-instrument",id="P1-"+tom);add(midi,"midi-channel",10);add(midi,"midi-unpitched",data[3]+1)
    p=add(root,"part",id="P1")
    for b in bars:
        m=add(p,"measure",number=b["measure"])
        if (b["measure"]-1)%4==0:add(m,"print",new_system="yes" if b["measure"]>1 else "no")
        if b["measure"]==1:
            a=add(m,"attributes");add(a,"divisions",4);time=add(a,"time");add(time,"beats",4);add(time,"beat-type",4)
            add(add(a,"clef"),"sign","percussion")
            d=add(m,"direction",placement="above");metro=add(add(d,"direction-type"),"metronome");add(metro,"beat-unit","quarter");add(metro,"per-minute",BPM);add(d,"sound",tempo=BPM)
        if (b["measure"]-1)%4==0:
            d=add(m,"direction",placement="above");add(add(d,"direction-type"),"rehearsal",b["section"])
        for e in b["events"]:
            d=add(m,"direction",placement="above");add(add(d,"direction-type"),"words",e["hand"])
            n=add(m,"note");u=add(n,"unpitched");data=TOMS[e["tom"]];add(u,"display-step",data[1]);add(u,"display-octave",data[2]);add(n,"duration",round(e["durationQuarters"]*4));add(n,"instrument",id="P1-"+e["tom"]);add(n,"voice",1)
            dur=e["durationQuarters"];add(n,"type",{1:"quarter",.5:"eighth",.25:"16th"}[dur]);add(n,"stem","up");add(n,"notehead","normal")
            if dur<1:
                peers=[x for x in b['events'] if int(x['quarterOffset'])==int(e['quarterOffset'])]
                pos=peers.index(e)
                add(n,"beam","begin" if pos==0 else "end" if pos==len(peers)-1 else "continue",number=1)
                if dur==.25:
                    short=[x for x in peers if x['durationQuarters']==.25]
                    add(n,"beam","begin" if short.index(e)==0 else "end" if short.index(e)==len(short)-1 else "continue",number=2)
        if b["measure"]==16:add(add(m,"barline",location="right"),"bar-style","light-heavy")
    return E.tostring(root,xml_declaration=True,encoding="UTF-8",pretty_print=True)

def synth(e):
    data=TOMS[e["tom"]];f,pan=data[4:];t=np.arange(round(.72*SR))/SR
    rng=np.random.default_rng(20261006+round(e['time']*SR))
    phase=2*math.pi*(f*t+f*.48*.025*(1-np.exp(-t/.025)))
    body=(np.sin(phase)+.27*np.sin(phase*1.47)+.15*np.sin(phase*2.13))*np.exp(-t/(.19 if f>100 else .26))
    # A short attack at exactly the event sample; deterministic procedural noise.
    noise=rng.uniform(-1,1,len(t))*.30*np.exp(-t/.012)
    env=1-np.exp(-(t+1/SR)/.0006)
    mono=(body*env+noise)*(e['velocity']/127)
    return np.stack([mono*math.sqrt((1-pan)/2),mono*math.sqrt((1+pan)/2)],axis=1)

def validate(xml,bars):
    doc=E.fromstring(xml);measures=doc.findall('part[@id="P1"]/measure')
    assert len(measures)==16
    notes=doc.findall('part[@id="P1"]/measure/note');assert len(notes)==192
    expected={"P1-H":("E","5"),"P1-M":("D","5"),"P1-F":("A","4")}
    for m,b in zip(measures,bars):
        assert sum(int(n.findtext('duration')) for n in m.findall('note'))==16
        assert len(m.findall('direction/direction-type/words'))==len(b['events'])
        assert [w.text for w in m.findall('direction/direction-type/words')]==[e['hand'] for e in b['events']]
        for n,e in zip(m.findall('note'),b['events']):
            assert int(n.findtext('duration'))==round(e['durationQuarters']*4)
            assert n.find('instrument').get('id')=='P1-'+e['tom']
            assert (n.findtext('unpitched/display-step'),n.findtext('unpitched/display-octave'))==expected['P1-'+e['tom']]
    # Independent expected progression and a nontrivial late-bar fixture.
    assert [len(m.findall('note')) for m in measures]==[8]*4+[16]*4+[12]*8
    assert [n.find('instrument').get('id') for n in measures[12].findall('note')][:6]==['P1-H']*3+['P1-M']*3
    assert [int(n.findtext('duration')) for n in measures[8].findall('note')][:3]==[2,1,1]
    assert [int(n.findtext('duration')) for n in measures[12].findall('note')][:3]==[1,1,2]
    hands=[w.text for w in doc.findall('.//direction-type/words')]
    assert (hands.count('R'),hands.count('L'))==(112,80)
    return {'measures':16,'quarters':64,'notes':192,'R':hands.count('R'),'L':hands.count('L'),'schema':'pending separate XSD validation'}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--out',type=Path,required=True);args=ap.parse_args()
    if args.out.exists():ap.error('Use a fresh output folder; existing output is preserved')
    args.out.mkdir(parents=True)
    bars=composition();xml=score(bars);(args.out/'tom-moving-source.musicxml').write_bytes(xml)
    events=[e for b in bars for e in b['events']];audio=np.zeros((round((FIRST+48+TAIL)*SR),2))
    for e in events:
        at=round(e['time']*SR);tone=synth(e);audio[at:at+len(tone)]+=tone
    peak=float(np.max(np.abs(audio)));audio*=.78/peak
    pcm=np.round(audio*32767).astype('<i2')
    with wave.open(str(args.out/'tom-moving.wav'),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
    subprocess.run(['ffmpeg','-v','error','-n','-i',str(args.out/'tom-moving.wav'),'-codec:a','libmp3lame','-b:a','192k',str(args.out/'tom-moving.mp3')],check=True)
    audit=validate(xml,bars)
    audit.update(status='PASS',bpm=BPM,firstBeat=FIRST,sampleRate=SR,audioDuration=len(audio)/SR,
                 musicalEnd=FIRST+48,audioPeak=float(np.max(np.abs(pcm.astype(float)/32768))),
                 eventSampleRoundingMaxSeconds=max(abs(round(e['time']*SR)/SR-e['time']) for e in events),
                 leadingNonzeroSamples=int(np.count_nonzero(pcm[:round(FIRST*SR)])),
                 finalTailNonzeroSamples=int(np.count_nonzero(pcm[round((FIRST+48)*SR):])),
                 audioContent='procedural synthesis; no downloaded sample or video audio')
    assert audit['leadingNonzeroSamples']==0
    (args.out/'composition.json').write_text(json.dumps({'bpm':BPM,'firstBeat':FIRST,'bars':bars,'toms':TOMS},ensure_ascii=False,indent=2))
    (args.out/'generation-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
    (args.out/'provenance.json').write_text(json.dumps({'referenceURL':'https://www.youtube.com/watch?v=ZUTH2p9C-YM',
      'referenceVerification':'Safari page description, Korean auto-generated transcript and representative playback frames reviewed; original paths composed independently',
      'source':'original event composition and deterministic procedural audio synthesis',
      'files':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in args.out.iterdir() if p.is_file()}},ensure_ascii=False,indent=2))
    print(json.dumps(audit,ensure_ascii=False))

if __name__=='__main__':main()
