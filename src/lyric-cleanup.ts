import type {Song} from './model';
import {nearestQuarterBeat} from './lyric-grid';
const revision='remove-ru-m10-tick15-2026-09-19';
/** User deletion: keep the following bar's ru; never delete a lone occurrence. */
export function removeReportedDuplicateRu(song:Song): number {
  if(song.id!=='real-paradis' || song.lyricCleanups?.includes(revision)) return 0;
  const index=song.measures.findIndex(m=>m.label==='10');
  const measure=song.measures[index],next=song.measures[index+1];
  if(!measure || !next || measure.beats!==4 || measure.denominator!==4 || next.label!=='11') return 0;
  const matches=(l:Song['lyrics'][number],measureId:string,tick:number)=>{
    if(l.text!=='루') return false;
    const p=nearestQuarterBeat(song,l.time);
    return p.measure.id===measureId && p.tick===tick;
  };
  if(!song.lyrics.some(l=>matches(l,next.id,0))) return 0;
  const remove=new Set(song.lyrics.filter(l=>matches(l,measure.id,15)).map(l=>l.id));
  if(remove.size) {
    song.lyricArchive=[...(song.lyricArchive||[]),{revision:revision+'-before',lyrics:structuredClone(song.lyrics)}];
    song.lyrics=song.lyrics.filter(l=>!remove.has(l.id));
  }
  // Also mark already-correct scores so future intentional user edits are preserved.
  song.lyricCleanups=[...(song.lyricCleanups||[]),revision];
  return remove.size;
}
