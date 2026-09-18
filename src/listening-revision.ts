import type {Song} from './model';
import {alignBetweenAnchors, type ListeningAnchor} from './listening-alignment';
import {lyricFingerprint} from './lyric-timing';
import original from './lyric-reading-data';
export const newListeningAnchors: ListeningAnchor[] = [
  {id:'v2-l0',time:20.828,confirmed:true},
  {id:'v2-l1',time:22.103,confirmed:true},
  {id:'v2-l5',time:23.367,confirmed:true},
  {id:'v2-l6',time:24.268,confirmed:true},
  {id:'v2-l9',time:25.339,confirmed:true},
  {id:'v2-l12',time:26.872,confirmed:false},
  {id:'v2-l36',time:37.090228,confirmed:true},
];
export function applyListeningRevision(song: Song): boolean {
  if(song.id!==original.songId || song.lyricRevision!=='japanese-canonical-english-2026-09-19-v4' ||
      song.lyrics.length!==513 || lyricFingerprint(song.lyrics.map(l=>l.text).join(''))!=='1600450058') return false;
  const anchors = new Map<string,ListeningAnchor>();
  // Preserve user-verified points beyond the requested replacements.
  for(const l of song.lyrics) if(l.confirmed) anchors.set(l.id,{id:l.id,time:l.time,confirmed:true});
  const last=song.lyrics.at(-1)!;
  anchors.set(last.id,{id:last.id,time:last.time,confirmed:last.confirmed});
  for(const a of newListeningAnchors) anchors.set(a.id,a);
  const next=alignBetweenAnchors(song.lyrics,[...anchors.values()]);
  song.lyricArchive=[...(song.lyricArchive||[]),{revision:song.lyricRevision,lyrics:song.lyrics.map(l=>({...l}))}];
  song.lyrics=next;
  song.lyricRevision='listening-anchors-2026-09-19-v5';
  return true;
}
