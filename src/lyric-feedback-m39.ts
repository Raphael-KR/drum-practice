import type {Song} from './model';
import {setLyricGrid} from './lyric-grid';
export const feedbackBatchRevision='listening-through-m39-bright-2026-09-19';
export const feedbackCorrections = [
 ['v2-l163','낫','m34',12], ['v2-l165','시','m35',2], ['v2-l166','로','m35',3],
 ['v2-l167','이','m35',4], ['v2-l173','노','m36',2], ['v2-l181','무','m37',6],
 ['v2-l185','노','m38',4], ['v2-l186','히','m38',8], ['v2-l187','와','m38',9],
 ['v2-l192','bright','m39',0],
] as const;
/** Apply accumulated owner listening feedback once, preserving the unreviewed tail. */
export function applyListeningFeedbackM39(song:Song):number {
  if(song.id!=='real-paradis' || !song.lyricGridEnabled ||
    !song.lyricShifts?.includes('bar34-acoustic-review-2026-09-19') ||
    song.lyricShifts.includes(feedbackBatchRevision)) return 0;
  let last=song.lyrics.findIndex(l=>l.id==='v2-l192' && l.text==='bright');
  if(last<0 || !feedbackCorrections.every(([id,text])=>song.lyrics.slice(0,last+1).some(l=>l.id===id&&l.text===text))) return 0;
  const alwaysIndex=song.lyrics.findIndex(l=>l.id==='v2-l188' && l.text==='always');
  const waysId='v2-l188-ways';
  if(alwaysIndex<0 || alwaysIndex>=last || song.lyrics.some(l=>l.id===waysId)) return 0;
  const next=structuredClone(song.lyrics);
  let changed=0;
  for(const [id,,measureId,tick] of feedbackCorrections) {
    const lyric=next.find(l=>l.id===id)!;
    if(lyric.grid?.measureId!==measureId || lyric.grid.tick!==tick) changed++;
    setLyricGrid(song,lyric,{measureId,tick});
  }
  const always=next[alwaysIndex];
  const ways={...structuredClone(always),id:waysId,text:'ways'};
  always.text='al-';
  setLyricGrid(song,always,{measureId:'m38',tick:12});
  setLyricGrid(song,ways,{measureId:'m38',tick:14});
  next.splice(alwaysIndex+1,0,ways);
  last++;
  changed++; // Original always onset moved; ways is a newly split display unit.
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
