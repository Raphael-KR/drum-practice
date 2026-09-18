import type { Song } from './model';
import correction from './lyric-timing-data';

export interface TimingPatch {
  songId: string;
  lyricCount: number;
  textFingerprint: string;
  entries: (string | number)[][];
}
export function lyricFingerprint(text: string): string {
  let hash = 2166136261;
  for (const char of text) hash = Math.imul(hash ^ char.codePointAt(0)!, 16777619) >>> 0;
  return String(hash);
}
/** Apply estimates only to the original, unconfirmed edition. Preserve user edits. */
export function applyLyricTimingPatch(song: Song, patch: TimingPatch = correction): number {
  const lyrics = song.lyrics;
  if (song.id !== patch.songId || lyrics.length !== patch.lyricCount ||
      lyricFingerprint(lyrics.map(l => l.text).join('')) !== patch.textFingerprint) return 0;
  const expected = new Map(patch.entries.map(e => [String(e[0]), e]));
  const eligible = new Set<number>();
  const times = lyrics.map(l => l.time);
  const near = (a: number, b: number) => Math.abs(a - b) < 1e-7;
  lyrics.forEach((l, i) => {
    const e = expected.get(l.id);
    if (e && !l.confirmed && near(l.time, Number(e[1])) && near(l.end, Number(e[2])) &&
        Number.isFinite(e[3]) && Number(e[3]) >= 0) {
      eligible.add(i);
      times[i] = Number(e[3]);
    }
  });
  // A preserved manual edit may conflict with a candidate: retain the old candidate.
  let retry = true;
  while (retry) {
    retry = false;
    for (let i = 1; i < times.length; i++) if (times[i] <= times[i - 1]) {
      for (const j of [i - 1, i]) if (eligible.delete(j)) {
        times[j] = lyrics[j].time;
        retry = true;
      }
    }
  }
  let changedStarts = 0;
  for (const i of eligible) {
    const l = lyrics[i];
    const end = i + 1 < times.length ? times[i + 1] : l.end;
    if (end <= times[i]) continue;
    if (!near(l.time, times[i])) changedStarts++;
    l.time = times[i];
    l.end = end;
    // Model agreement is not listening verification; confirmed remains false.
  }
  return changedStarts;
}

/** User listening reference: bar 15, fourth eighth note = beat offset 1.5. */
function applyBar15Anchor(song: Song): boolean {
  if (song.id !== correction.songId || song.lyrics.length !== correction.lyricCount ||
      lyricFingerprint(song.lyrics.map(l => l.text).join('')) !== correction.textFingerprint) return false;
  const i = song.lyrics.findIndex(l => l.id === 'l38' && l.text === '코');
  const m = song.measures.find(m => m.label === '15');
  if (i < 1 || !m) return false;
  const l = song.lyrics[i], previous = song.lyrics[i - 1], next = song.lyrics[i + 1];
  const time = m.start + (m.end - m.start) / m.beats * 1.5;
  // Only upgrade the known generated version; preserve later manual changes.
  if (l.confirmed || Math.abs(l.time - 36.22) > 1e-7 || Math.abs(l.end - 37.22) > 1e-7 ||
      !next || time <= previous.time || time >= next.time) return false;
  if (!previous.confirmed && Math.abs(previous.end - l.time) < 1e-7) previous.end = time;
  l.time = time;
  l.confirmed = true;
  return true;
}

/** Listening report 001: use the copied audio timestamp, without grid snapping. */
export function applyUserLyricAnchors(song: Song): boolean {
  const bar15Changed = applyBar15Anchor(song);
  if (song.id !== correction.songId || song.lyrics.length !== correction.lyricCount ||
      lyricFingerprint(song.lyrics.map(l => l.text).join('')) !== correction.textFingerprint) return bar15Changed;
  const lyric = song.lyrics[0];
  if (lyric.id !== 'l0' || lyric.text !== '아' || lyric.confirmed ||
      Math.abs(lyric.time - 20.58) > 1e-7 || Math.abs(lyric.end - 21.06) > 1e-7 ||
      song.lyrics[1].time <= 20.828) return bar15Changed;
  lyric.time = 20.828;
  lyric.confirmed = true;
  return true;
}
