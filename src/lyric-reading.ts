import type { Song } from './model';
import { lyricFingerprint } from './lyric-timing';
import data from './lyric-reading-data';
export type ReadingPatch = typeof data;
/** Keep all existing timing and listening anchors while correcting the reading. */
export function applyJapaneseReadings(song: Song, patch: ReadingPatch = data): boolean {
  if (song.id !== patch.songId || song.lyricRevision === patch.id ||
      song.lyrics.length !== patch.previousCount ||
      lyricFingerprint(song.lyrics.map(l => l.text).join('')) !== patch.previousFingerprint) return false;
  const next = song.lyrics.map(l => ({...l}));
  for (const edit of patch.edits) {
    const lyric = next.find(l => l.id === edit.id);
    if (!lyric || lyric.text !== edit.before) return false;
    lyric.text = edit.after;
  }
  const i = next.findIndex(l => l.id === patch.insertion.afterId);
  const previous = next[i], following = next[i + 1];
  if (!previous || !following || following.id !== patch.insertion.beforeId) return false;
  const {time, id, text} = patch.insertion;
  if (time > previous.time && time < following.time) {
    // Restore the former estimate; this new boundary is explicitly unconfirmed.
    if (previous.end > time) previous.end = time;
    next.splice(i+1,0,{id,text,time,end:following.time,confirmed:false});
  } else {
    // Manual timing conflicts: preserve it and show the missing sound in one token.
    previous.text += text;
  }
  song.lyricArchive = [...(song.lyricArchive || []), {
    revision: song.lyricRevision || 'original', lyrics: song.lyrics.map(l => ({...l})),
  }];
  song.lyrics = next;
  song.lyricRevision = patch.id;
  return true;
}
