import { t as i18nText } from "./i18n";
import type { Song } from "./model";
import { setLyricGrid } from "./lyric-grid";
export const feedbackBatchRevision = "listening-through-m24-yo-2026-09-19";
export const feedbackCorrections = [
  ["v2-l17", "케-", "m11", 14],
  ["v2-l18", "스", "m12", 4],
  ["v2-l43", "쿄-", "m16", 6],
  ["v2-l72", "이", "m21", 0],
  ["v2-l85", "우", "m23", 14],
  ["v2-l88", "노", "m24", 8],
  ["v2-l91", "요", "m24", 15],
] as const;
/** Apply accumulated owner listening feedback once, preserving the unreviewed tail. */
export function applyListeningFeedbackFollowup(song: Song): number {
  if (
    song.id !== "real-paradis" ||
    !song.lyricGridEnabled ||
    !song.lyricShifts?.includes("listening-through-m24-no-2026-09-19") ||
    song.lyricShifts.includes(feedbackBatchRevision)
  )
    return 0;
  const last = song.lyrics.findIndex(
    (l) => l.id === "v2-l91" && l.text === "요",
  );
  if (
    last < 0 ||
    !feedbackCorrections.every(([id, text]) =>
      song.lyrics
        .slice(0, last + 1)
        .some((l) => l.id === id && l.text === text),
    )
  )
    return 0;
  const next = structuredClone(song.lyrics);
  let changed = 0;
  for (const [id, , measureId, tick] of feedbackCorrections) {
    const lyric = next.find((l) => l.id === id)!;
    if (lyric.grid?.measureId !== measureId || lyric.grid.tick !== tick)
      changed++;
    setLyricGrid(song, lyric, { measureId, tick });
  }
  for (let i = 0; i <= last; i++) {
    const lyric = next[i];
    if (i && lyric.time < next[i - 1].time - 1e-8)
      throw Error(i18nText("lyrics.validation573"));
    const following = next.slice(i + 1).find((l) => l.time > lyric.time + 1e-8);
    lyric.confirmed = true;
    if (following)
      lyric.end = Math.max(lyric.time, Math.min(lyric.end, following.time));
  }
  if (next[last + 1] && next[last].time > next[last + 1].time)
    throw Error(i18nText("lyrics.validation574"));
  song.lyricArchive = [
    ...(song.lyricArchive || []),
    {
      revision: feedbackBatchRevision + "-before",
      lyrics: structuredClone(song.lyrics),
    },
  ];
  song.lyrics = next;
  song.lyricShifts.push(feedbackBatchRevision);
  return changed;
}
