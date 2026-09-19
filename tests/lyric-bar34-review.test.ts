import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
import {applyBar34AcousticReview,feedbackCorrections,feedbackBatchRevision} from '../src/lyric-bar34-review';
import {validateSong,type Song} from '../src/model';
it('preserves listening anchors, separates estimates, limits changes to phrase, applies once',()=>{
 const s=JSON.parse(readFileSync('public/demo/song.json','utf8')) as Song;
 const archive=s.lyricArchive?.find(a=>a.revision===feedbackBatchRevision+'-before');if(archive)s.lyrics=structuredClone(archive.lyrics);
 s.lyricShifts=s.lyricShifts?.filter(r=>r!==feedbackBatchRevision);
 const before=structuredClone(s.lyrics),ids=new Set<string>(feedbackCorrections.map(r=>r[0]));
 expect(applyBar34AcousticReview(s)).toBe(5);
 for(const [id,,measureId,tick] of feedbackCorrections)expect(s.lyrics.find(l=>l.id===id)?.grid).toEqual({measureId,tick});
 expect(s.lyrics.filter(l=>!ids.has(l.id))).toEqual(before.filter(l=>!ids.has(l.id)));
 expect(s.lyrics.find(l=>l.id==='v2-l162')?.confirmed).toBe(false);
 expect(s.lyrics.find(l=>l.id==='v2-l157')?.confirmed).toBe(true);
 validateSong(s);const once=structuredClone(s);expect(applyBar34AcousticReview(s)).toBe(0);expect(s).toEqual(once);
});
