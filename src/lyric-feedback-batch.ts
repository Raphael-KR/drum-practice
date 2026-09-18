import type {Song} from './model';
import {setLyricGrid} from './lyric-grid';
export const feedbackBatchRevision='listening-through-m24-no-2026-09-19';
export const feedbackCorrections = [
  ['v2-l2','다','m9',10], ['v2-l3','라','m9',12],
  ['v2-l19','후','m12',6], ['v2-l36','코','m15',6],
  ['v2-l55','코-','m18',6], ['v2-l61','소-','m19',6],
  ['v2-l67','카','m20',8], ['v2-l73','아','m21',6],
  ['v2-l80','무','m22',14], ['v2-l86','마','m24',0],
  ['v2-l87','쿠','m24',4], ['v2-l88','노','m24',9],
] as const;
/** Apply accumulated owner listening feedback once, preserving the unreviewed tail. */
export function applyListeningFeedbackBatch(song:Song):number {
  if(song.id!=='real-paradis' || !song.lyricGridEnabled ||
    !song.lyricShifts?.includes('tooku-tail-plus-quarter-2026-09-19') ||
    song.lyricShifts.includes(feedbackBatchRevision)) return 0;
  const last=song.lyrics.findIndex(l=>l.id==='v2-l88' && l.text==='노');
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
