import type {Song} from './model';
import {setLyricGrid} from './lyric-grid';
export const feedbackBatchRevision='listening-through-m32-yo-2026-09-19';
export const feedbackCorrections = [
 ['v2-l27','쿠','m13',10], ['v2-l28','히','m13',12], ['v2-l29','카','m13',14],
 ['v2-l31','아','m14',8], ['v2-l68','제','m20',9], ['v2-l69','노','m20',12],
 ['v2-l70','츠','m20',14], ['v2-l72','이','m21',4], ['v2-l75','가','m21',12],
 ['v2-l82','이','m23',4], ['v2-l128','라','m29',8], ['v2-l129','코','m29',14],
 ['v2-l131','니','m30',2], ['v2-l135','소','m30',12], ['v2-l136','시','m30',13],
 ['v2-l137','테','m30',14], ['v2-l138','once','m31',2],
 ['v2-l142','아','m32',4], ['v2-l144','키','m32',8], ['v2-l145','다','m32',10],
 ['v2-l147','요','m32',14],
] as const;
/** Apply accumulated owner listening feedback once, preserving the unreviewed tail. */
export function applyListeningFeedbackM32(song:Song):number {
  if(song.id!=='real-paradis' || !song.lyricGridEnabled ||
    !song.lyricShifts?.includes('listening-through-m24-yo-2026-09-19') ||
    song.lyricShifts.includes(feedbackBatchRevision)) return 0;
  let last=song.lyrics.findIndex(l=>l.id==='v2-l147' && l.text==='요');
  if(last<0 || !feedbackCorrections.every(([id,text])=>song.lyrics.slice(0,last+1).some(l=>l.id===id&&l.text===text))) return 0;
  const againIndex=song.lyrics.findIndex(l=>l.id==='v2-l140' && l.text==='again');
  const gainId='v2-l140-gain';
  if(againIndex<0 || againIndex>=last || song.lyrics.some(l=>l.id===gainId)) return 0;
  const next=structuredClone(song.lyrics);
  let changed=0;
  for(const [id,,measureId,tick] of feedbackCorrections) {
    const lyric=next.find(l=>l.id===id)!;
    if(lyric.grid?.measureId!==measureId || lyric.grid.tick!==tick) changed++;
    setLyricGrid(song,lyric,{measureId,tick});
  }
  const again=next[againIndex];
  const gain={...structuredClone(again),id:gainId,text:'gain'};
  again.text='a-';
  setLyricGrid(song,again,{measureId:'m31',tick:5});
  setLyricGrid(song,gain,{measureId:'m31',tick:8});
  next.splice(againIndex+1,0,gain);
  last++;
  changed++; // Original again onset moved; gain is a newly split display unit.
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
