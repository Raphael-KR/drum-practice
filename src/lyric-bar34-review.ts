import type {Song} from './model';
import {setLyricGrid} from './lyric-grid';
export const feedbackBatchRevision='bar34-acoustic-review-2026-09-19';
export const feedbackCorrections = [
 ['v2-l157','스','m34',2], ['v2-l158','베','m34',3], ['v2-l159','테','m34',4],
 ['v2-l160','오','m34',6], ['v2-l161','우','m34',8], ['v2-l162','시','m34',10], ['v2-l163','낫','m34',11],
] as const;
/** Apply accumulated owner listening feedback once, preserving the unreviewed tail. */
export function applyBar34AcousticReview(song:Song):number {
  if(song.id!=='real-paradis' || !song.lyricGridEnabled ||
    !song.lyricShifts?.includes('listening-through-m36-ko-2026-09-19') ||
    song.lyricShifts.includes(feedbackBatchRevision)) return 0;
  const last=song.lyrics.findIndex(l=>l.id==='v2-l179' && l.text==='코');
  if(last<0 || !feedbackCorrections.every(([id,text])=>song.lyrics.slice(0,last+1).some(l=>l.id===id&&l.text===text))) return 0;
  const next=structuredClone(song.lyrics);
  let changed=0;
  for(const [id,,measureId,tick] of feedbackCorrections) {
    const lyric=next.find(l=>l.id===id)!;
    if(lyric.grid?.measureId!==measureId || lyric.grid.tick!==tick) changed++;
    setLyricGrid(song,lyric,{measureId,tick});
  }
  for(const [id] of feedbackCorrections) {
    const i=next.findIndex(l=>l.id===id),lyric=next[i];
    if(i && lyric.time<next[i-1].time-1e-8) throw Error('교정 후 가사 순서를 확인하세요.');
    const following=next.slice(i+1).find(l=>l.time>lyric.time+1e-8);
    if(following) lyric.end=Math.max(lyric.time,Math.min(lyric.end,following.time));
    lyric.confirmed=!['v2-l158','v2-l162','v2-l163'].includes(id);
  }
  song.lyricArchive=[...(song.lyricArchive||[]),{revision:feedbackBatchRevision+'-before',lyrics:structuredClone(song.lyrics)}];
  song.lyrics=next;
  song.lyricShifts.push(feedbackBatchRevision);
  return changed;
}
