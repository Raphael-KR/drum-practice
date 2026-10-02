import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
import {applyListeningFeedbackM39,feedbackCorrections,feedbackBatchRevision} from '../src/lyric-feedback-m39';
import {validateSong,type Song} from '../src/model';
function fixture(){
 const s=JSON.parse(readFileSync('public/demo/song.json','utf8')) as Song;
 const archive=s.lyricArchive?.find(a=>a.revision===feedbackBatchRevision+'-before');
 if(archive)s.lyrics=structuredClone(archive.lyrics);
 s.lyricShifts=s.lyricShifts?.filter(r=>r!==feedbackBatchRevision);return s;
}
it('applies owner corrections and English split once, preserving earlier anchors and the tail',()=>{
 const s=fixture(),before=structuredClone(s.lyrics);
 const last=before.findIndex(l=>l.id==='v2-l192');
 expect(applyListeningFeedbackM39(s)).toBe(9);
 for(const [id,,measureId,tick] of feedbackCorrections)expect(s.lyrics.find(l=>l.id===id)?.grid).toEqual({measureId,tick});
 expect(s.lyrics.find(l=>l.id==='v2-l188')).toMatchObject({text:'al-',grid:{measureId:'m38',tick:12}});
 expect(s.lyrics.find(l=>l.id==='v2-l188-ways')).toMatchObject({text:'ways',grid:{measureId:'m38',tick:14}});
 expect(s.lyrics.slice(last+2)).toEqual(before.slice(last+1));
 const changed=new Set<string>([...feedbackCorrections.map(c=>c[0]),'v2-l188']);
 for(const l of before.filter(l=>!changed.has(l.id))){
  const after=s.lyrics.find(a=>a.id===l.id)!;expect(after.time).toBe(l.time);expect(after.grid).toEqual(l.grid);
 }
 expect(s.lyrics.slice(0,last+2).every(l=>l.confirmed)).toBe(true);
 expect(s.lyricArchive!.at(-1)!.lyrics).toEqual(before);
 expect(new Set(s.lyrics.map(l=>l.id)).size).toBe(s.lyrics.length);
 validateSong(s);const once=structuredClone(s);expect(applyListeningFeedbackM39(s)).toBe(0);expect(s).toEqual(once);
});
it('does not overwrite other songs or unexpected user wording',()=>{
 const s=fixture();s.id='other';expect(applyListeningFeedbackM39(s)).toBe(0);
 const t=fixture();t.lyrics.find(l=>l.id==='v2-l188')!.text='custom';const before=structuredClone(t);
 expect(applyListeningFeedbackM39(t)).toBe(0);expect(t).toEqual(before);
});
