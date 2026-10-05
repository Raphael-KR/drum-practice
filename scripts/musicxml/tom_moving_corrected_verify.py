"""Reread corrected XML/MIDI, rendered audio, package and local inclusion evidence."""
import argparse,json,struct,subprocess,hashlib,zipfile
from pathlib import Path
import numpy as np
from tom_moving_corrected import verify,FIXTURE,INSTRUMENTS,read_events


def sha(data):return hashlib.sha256(data).hexdigest()

def read_midi(data):
    assert data[:4]==b'MThd' and struct.unpack_from('>IHHH',data,4)==(6,0,1,480)
    assert data[14:18]==b'MTrk' and struct.unpack_from('>I',data,18)[0]==len(data)-22
    cursor=22;tick=0;events=[];tempo=None
    def vlq():
        nonlocal cursor
        n=0
        while True:
            b=data[cursor];cursor+=1;n=(n<<7)|(b&127)
            if b<128:return n
    while cursor<len(data):
        tick+=vlq();status=data[cursor];cursor+=1
        if status==255:
            kind=data[cursor];cursor+=1;length=vlq();payload=data[cursor:cursor+length];cursor+=length
            if kind==81:tempo=int.from_bytes(payload,'big')
            if kind==47:break
        else:
            assert status in[0x89,0x99];key,velocity=data[cursor:cursor+2];cursor+=2
            assert velocity==(76 if status==0x99 else 0)
            events.append((tick,status==0x99,key))
    assert tempo==750000 and tick==112*480 and cursor==len(data)
    return sorted(events,key=lambda e:(e[0],e[1],e[2]))


def main():
    p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);a=p.parse_args();root=a.root
    fixture=json.loads(FIXTURE.read_text());source=(root/'corrected-01/tom-moving-source.musicxml').read_bytes();final=(root/'corrected-package-01/tom-moving-final.musicxml').read_bytes()
    bars,audit=verify(source,fixture);fbars,_=verify(final,fixture);assert bars==fbars
    expected=[]
    for i,bar in enumerate(bars):
        for e in bar:
            start=(i*16+e['offsetUnits'])*120;key=INSTRUMENTS[e['instrument']][3]
            expected.extend([(start,True,key),(start+e['durationUnits']*120,False,key)])
    assert read_midi((root/'corrected-01/tom-moving.mid').read_bytes())==sorted(expected,key=lambda e:(e[0],e[1],e[2]))
    repeat={}
    for first,second,names in [('corrected-01','corrected-reproduction-01',['tom-moving-source.musicxml','tom-moving.mid','midi-events.json','composition.json']),('portland-01','portland-reproduction-01',['tom-moving-portland.wav','tom-moving-portland.mp3'])]:
        for name in names:
            b=(root/first/name).read_bytes();assert b==(root/second/name).read_bytes();repeat[name]=sha(b)
    decoded={}
    for suffix in['wav','mp3']:
        path=root/f'portland-01/tom-moving-portland.{suffix}'
        raw=subprocess.run(['ffmpeg','-v','error','-i',str(path),'-f','f32le','-acodec','pcm_f32le','-'],capture_output=True,check=True).stdout
        x=np.frombuffer(raw,'<f4').reshape(-1,2);assert len(x)==3803625 and np.isfinite(x).all() and abs(x).max()<1
        attack=int(np.flatnonzero(abs(x).max(axis=1)>.001)[0]);assert abs(attack/44100-.25)<.001
        if suffix=='wav':assert np.count_nonzero(x[:11025])==0
        decoded[suffix]={'seconds':len(x)/44100,'peak':float(abs(x).max()),'attackSeconds':attack/44100}
    package=(root/'corrected-package-01/tom-moving.drumscore').read_bytes()
    with zipfile.ZipFile(root/'corrected-package-01/tom-moving.drumscore') as z:
        assert z.testzip() is None;manifest=json.loads(z.read('manifest.json'));song=manifest['song']
        assert song['id']=='tom-moving-video-v2' and len(song['measures'])==28
        assert z.read(manifest['source']['path'])==final
        assert z.read(manifest['audio']['path'])==(root/'portland-01/tom-moving-portland.mp3').read_bytes()
        assert [(m['start'],m['end']) for m in song['measures']]==[(.25+i*3,.25+(i+1)*3) for i in range(28)]
    project=Path(__file__).resolve().parents[2]
    assert (project/'public/scores/tom-moving.drumscore').read_bytes()==package
    assert next(s for s in json.loads((project/'src/bundled-scores.json').read_text()) if s['file']=='scores/tom-moving.drumscore')['id']==song['id']
    audit.update(midiReread='336 note-on + 336 note-off, exact XML offsets/durations',decoded=decoded,reproduction=repeat,canonicalSHA256=sha(final),packageSHA256=sha(package),ZIPCRC=True,publicBytesMatch=True)
    (root/'corrected-final-verification.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'status':audit['status'],'measures':28,'notes':336,'MIDI':'PASS','XSD':'PASS','reproduction':'PASS','audioSeconds':86.25,'package':'PASS'},ensure_ascii=False))
if __name__=='__main__':main()
