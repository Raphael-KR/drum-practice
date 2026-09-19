import type {Song} from './model';
import {setLyricGrid} from './lyric-grid';
export const feedbackBatchRevision='listening-through-m48-gat-2026-09-19';
export const feedbackCorrections = [
 ['v2-l223','카','m45',4], ['v2-l224','베','m45',10], ['v2-l225','노','m45',12],
 ['v2-l226','무','m45',14], ['v2-l227','코-','m46',0], ['v2-l231','토','m46',12],
 ['v2-l233','나','m46',14], ['v2-l234','이','m47',4], ['v2-l235','케','m47',6],
 ['v2-l242','오','m48',5], ['v2-l243','모','m48',6], ['v2-l244','이','m48',7],
 ['v2-l245','아','m48',8], ['v2-l246','갓','m48',10],
] as const;
/** Apply accumulated owner listening feedback once, preserving the unreviewed tail. */
export function applyListeningFeedbackM48(song:Song):number {
  if(song.id!=='real-paradis' || !song.lyricGridEnabled ||
    !song.lyricShifts?.includes('listening-through-m39-bright-2026-09-19') ||
    song.lyricShifts.includes(feedbackBatchRevision)) return 0;
  const last=song.lyrics.findIndex(l=>l.id==='v2-l246' && l.text==='갓');
  if(last<0 || !feedbackCorrections.every(([id,text])=>song.lyrics.slice(0,last+1).some(l=>l.id===id&&l.text===text))) return 0;
  const next=structuredClone(song.lyrics);
  let changed=0;
  for(const [id,,measureId,tick] of feedbackCorrections) {
    const lyric=next.find(l=>l.id===id)!;
    if(lyric.grid?.measureId!==measureId || lyric.grid.tick!==tick) changed++;
    setLyricGrid(song,lyric,{measureId,tick});
  }
  for(let i=0;i<=last;i++) {
    const lyric=next[i];
    if(i && lyric.time<next[i-1].time-1e-8) throw Error('교정 후 가사 순서를 확인하세요.');
    const following=next.slice(i+1).find(l=>l.time>lyric.time+1e-8);
    lyric.confirmed=true;
    if(following) lyric.end=Math.max(lyric.time,Math.min(lyric.end,following.time));
  }
  if(next[last+1] && next[last].time>next[last+1].time) throw Error('교정 경계를 확인하세요.');
  song.lyricArchive=[...(song.lyricArchive||[]),{revision:feedbackBatchRevision+'-before',lyrics:structuredClone(song.lyrics)}];
  song.lyrics=next;
  song.lyricShifts.push(feedbackBatchRevision);
  return changed;
}
