import { t as i18nText } from "./i18n";
import type { Song, Lyric } from "./model";
import { lyricFingerprint } from "./lyric-timing";
import replacement from "./lyric-revision-data";
export interface LyricRevision {
  id: string;
  songId: string;
  previousCount: number;
  previousFingerprint: string;
  lyrics: Lyric[];
}
/** Explicit full replacement, with a persistent copy of the previous lyric edition. */
export function applyLyricRevision(
  song: Song,
  revision: LyricRevision = replacement,
): boolean {
  if (
    song.id !== revision.songId ||
    song.lyricRevision === revision.id ||
    song.lyrics.length !== revision.previousCount ||
    lyricFingerprint(song.lyrics.map((l) => l.text).join("")) !==
      revision.previousFingerprint
  )
    return false;
  if (
    revision.lyrics.some(
      (l, i) =>
        !Number.isFinite(l.time) ||
        !Number.isFinite(l.end) ||
        l.time < 0 ||
        l.end < l.time ||
        (i > 0 && l.time <= revision.lyrics[i - 1].time),
    )
  )
    throw Error(i18nText("lyric-revision.message091"));
  song.lyricArchive = [
    ...(song.lyricArchive || []),
    {
      revision: song.lyricRevision || "original",
      lyrics: song.lyrics.map((l) => ({ ...l })),
    },
  ];
  song.lyrics = revision.lyrics.map((l) => ({ ...l }));
  song.lyricRevision = revision.id;
  return true;
}
