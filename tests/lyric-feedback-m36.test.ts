import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {applyListeningFeedbackM36,feedbackCorrections,feedbackBatchRevision} from '../src/lyric-feedback-m36';
import {validateSong} from '../src/model';
import type {Song} from '../src/model';
function fixture():Song {
 const s=JSON.parse(readFileSync('public/demo/song.json','utf8')) as Song;
 const old=s.lyricArchive?.find(a=>a.revision===feedbackBatchRevision+'-before');
 if(old) s.lyrics=structuredClone(old.lyrics);
 s.lyricShifts=s.lyricShifts?.filter(r=>r!==feedbackBatchRevision);
 return s;
}
describe('accumulated listening feedback',()=>{
 it('applies all coordinates, confirms prefix, preserves tail and raw times, runs once',()=>{
  const s=fixture(),before=structuredClone(s.lyrics),last=before.findIndex(l=>l.id==='v2-l179');
  expect(applyListeningFeedbackM36(s)).toBe(5);
  for(const [id,,measureId,tick] of feedbackCorrections) expect(s.lyrics.find(l=>l.id===id)?.grid).toEqual({measureId,tick});
  expect(s.lyrics.slice(0,last+1).every(l=>l.confirmed)).toBe(true);
  expect(s.lyrics.slice(last+1)).toEqual(before.slice(last+1));
  expect(s.lyrics.map(l=>l.originalTime)).toEqual(before.map(l=>l.originalTime));
  validateSong(s);
  const once=structuredClone(s);expect(applyListeningFeedbackM36(s)).toBe(0);expect(s).toEqual(once);
 });
 it('does not migrate unrelated songs or missing target text',()=>{
  for(const mutate of [(s:Song)=>{s.id='other';},(s:Song)=>{s.lyrics.find(l=>l.id==='v2-l179')!.text='other';}]) {
   const s=fixture();mutate(s);const before=structuredClone(s);expect(applyListeningFeedbackM36(s)).toBe(0);expect(s).toEqual(before);
  }
 });
});
