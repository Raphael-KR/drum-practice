"""Verify authored source, independent fixtures, deterministic rerun and package."""
import argparse
import hashlib
import json
import wave
import zipfile
from pathlib import Path
from lxml import etree as E
import numpy as np
from tom_moving import composition, validate
from verify import Resolver

def verify(root):
    schema=Path(__file__).resolve().parents[2]/'docs/experiments/musicxml/schema'
    parser=E.XMLParser();parser.resolvers.add(Resolver(schema))
    xsd=E.XMLSchema(E.parse(str(schema/'musicxml.xsd'),parser))
    source=(root/'source-02/tom-moving-source.musicxml').read_bytes()
    final=(root/'final-02/tom-moving-final.musicxml').read_bytes()
    for xml in [source,final]:xsd.assertValid(E.fromstring(xml))
    validate(source,composition());validate(final,composition())
    # The canonical helper adds a separate empty lyric part. Fixtures check P1 only.
    def signature(xml):
        doc=E.fromstring(xml)
        return [[(n.findtext('duration'),n.find('instrument').get('id'),n.findtext('unpitched/display-step'),n.findtext('unpitched/display-octave'),n.findtext('type'),[(b.get('number'),b.text) for b in n.findall('beam')]) for n in m.findall('note')] for m in doc.findall('part[@id="P1"]/measure')]
    assert signature(source)==signature(final)
    rejected=[]
    for name,xpath,text,attr in [('duration','.//note/duration','3',None),('instrument','.//note/instrument','P1-F','id'),('hand','.//direction-type/words','L',None),('staff','.//note/unpitched/display-step','A',None)]:
        doc=E.fromstring(source);n=doc.find(xpath)
        if attr:n.set(attr,text)
        else:n.text=text
        try:validate(E.tostring(doc),composition())
        except AssertionError:rejected.append(name)
        else:raise AssertionError('Mutation accepted: '+name)
    checks={}
    for name in ['tom-moving-source.musicxml','tom-moving.wav','tom-moving.mp3','composition.json']:
        a=(root/'source-02'/name).read_bytes();b=(root/'reproduction-02'/name).read_bytes();assert a==b
        checks[name]=hashlib.sha256(a).hexdigest()
    with wave.open(str(root/'source-02/tom-moving.wav')) as w:
        assert (w.getnchannels(),w.getsampwidth(),w.getframerate(),w.getnframes())==(2,2,44100,2163105)
        samples=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,2)
        assert np.count_nonzero(samples[:11025])==0 and np.count_nonzero(samples[11025:11050])>0
        assert np.max(np.abs(samples.astype('i4')))<32767
    package=root/'final-02/tom-moving.drumscore'
    with zipfile.ZipFile(package) as z:
        assert z.testzip() is None
        manifest=json.loads(z.read('manifest.json'))
        assert manifest['song']['id']=='tom-moving-original-v1'
        assert z.read(manifest['source']['path'])==final
        assert z.read(manifest['audio']['path'])==(root/'source-02/tom-moving.wav').read_bytes()
    result={'status':'PASS','MusicXML4XSD':['source','canonical'],'P1MusicalSignaturePreserved':True,'measures':16,'drumNotes':192,'rejectedMutations':rejected,'deterministicFiles':checks,'waveFirstAttackSeconds':.25,'waveClipping':False,'ZIPCRC':True,'canonicalSHA256':hashlib.sha256(final).hexdigest(),'packageSHA256':hashlib.sha256(package.read_bytes()).hexdigest()}
    return result

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--dir',type=Path,required=True);a=p.parse_args();print(json.dumps(verify(a.dir),indent=2))
