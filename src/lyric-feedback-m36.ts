import type {Song} from './model';
import {setLyricGrid} from './lyric-grid';
export const feedbackBatchRevision='listening-through-m36-ko-2026-09-19';
export const feedbackCorrections = [
 ['v2-l169','지','m35',10], ['v2-l171','케','m35',14], ['v2-l172','가','m35',15],
 ['v2-l178','모','m36',8], ['v2-l179','코','m36',14],
] as const;
/** Apply accumulated owner listening feedback once, preserving the unreviewed tail. */
export function applyListeningFeedbackM36(song:Song):number {
  if(song.id!=='real-paradis' || !song.lyricGridEnabled ||
    !song.lyricShifts?.includes('listening-through-m32-yo-2026-09-19') ||
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
