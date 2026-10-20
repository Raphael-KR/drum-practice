"""Preserve notated Loveholic tempo; attach verified recording estimates separately."""
import argparse,copy,hashlib,json,shutil,zipfile
from pathlib import Path
from lxml import etree as E
from verify import Resolver
FIELD='drum-practice:recording-tempo:v1'

def sha(data):return hashlib.sha256(data).hexdigest()

def update(source,alignment_path,output):
    output.mkdir(parents=True,exist_ok=False)
    shutil.copyfile(source,output/'Loveholic-before.drumscore')
    alignment=json.loads(alignment_path.read_text())
    with zipfile.ZipFile(source) as z:
        assert z.testzip() is None
        original=json.loads(z.read('manifest.json'));s=original['song'];oldxml=original['canonicalXML']
        assert s['id']=='loveholic-003e2b2a' and s['bpm']==136 and s['settings']['rate']==1
        assert alignment['printed_bpm']==136 and abs(alignment['first_beat_estimate_seconds']-s['firstBeat'])<1e-12
        assert sha(z.read(original['audio']['path']))==alignment['audio_sha256']
        root=E.fromstring(oldxml.encode());assert all(n.get('tempo')=='136' for n in root.findall('.//sound[@tempo]'))
        assert root.find(f'identification/miscellaneous/miscellaneous-field[@name="{FIELD}"]') is None
        data={'version':1,'scoreBpm':136,'bpmEstimate':round(alignment['bpm_estimate'],3),'firstBeatEstimateSeconds':round(alignment['first_beat_estimate_seconds'],6),'audioSHA256':alignment['audio_sha256'],'method':alignment['method'],'status':'signal-estimate; not listening-confirmed'}
        assert data['bpmEstimate']==136.232 and data['firstBeatEstimateSeconds']==.193
        field=E.Element('miscellaneous-field',name=FIELD);field.text=json.dumps(data,ensure_ascii=False,separators=(',',':'))
        insertion=E.tostring(field,encoding='unicode')
        xml=oldxml.replace('</miscellaneous>',insertion+'</miscellaneous>',1)
        assert xml!=oldxml and xml.replace(insertion,'',1)==oldxml
        modified=copy.deepcopy(original);modified['canonicalXML']=xml;modified['source']['size']=len(xml.encode())
        replacements={modified['source']['path']:xml.encode(),'manifest.json':json.dumps(modified,ensure_ascii=False,separators=(',',':')).encode()}
        target=output/'Loveholic.drumscore'
        with zipfile.ZipFile(target,'w') as dst:
            for info in z.infolist():dst.writestr(copy.copy(info),replacements.get(info.filename,z.read(info.filename)))
        with zipfile.ZipFile(target) as dst:
            assert dst.testzip() is None
            m=json.loads(dst.read('manifest.json'));assert m['song']==s and m['canonicalXML']==xml
            assert dst.read(m['source']['path']).decode()==xml
            unchanged=[n for n in z.namelist() if n not in replacements]
            assert all(dst.read(n)==z.read(n) for n in unchanged)
        after=E.fromstring(xml.encode());saved=after.find(f'identification/miscellaneous/miscellaneous-field[@name="{FIELD}"]')
        assert json.loads(saved.text)==data;saved.getparent().remove(saved)
        assert E.tostring(after)==E.tostring(root)
        schema=Path(__file__).resolve().parents[3]/'data/reference/musicxml/schema';parser=E.XMLParser();parser.resolvers.add(Resolver(schema))
        E.XMLSchema(E.parse(str(schema/'musicxml.xsd'),parser)).assertValid(E.fromstring(xml.encode()))
        (output/'Loveholic-final.musicxml').write_text(xml)
        audit={'status':'PASS','scoreBpm':136,'recordingTempo':data,'inputSHA256':sha(source.read_bytes()),'packageSHA256':sha(target.read_bytes()),'canonicalSHA256':sha(xml.encode()),'SongAllFieldsUnchanged':True,'canonicalOnlyAddedRecordingTempoField':True,'notesLyricsAnchorsAudioSVGVariantsUnchanged':True,'MusicXML4XSD':True,'zipCRC':True,'sourceCanonicalEqualAfter':True,'legacySourceCanonicalEqualBefore':z.read(original['source']['path']).decode()==oldxml,'sourceConsistencyResolution':'primary XML asset synchronized to authoritative canonical; canonical drum/lyric notation preserved','unchangedZIPEntries':unchanged,'originalRate':1,'appIntegration':'pending developer'}
        (output/'verification.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
        print(json.dumps(audit,ensure_ascii=False))
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--input',type=Path,required=True);p.add_argument('--alignment',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args();update(a.input,a.alignment,a.out)
