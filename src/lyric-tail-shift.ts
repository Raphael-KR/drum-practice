import { t as i18nText } from "./i18n";
import type { Song } from "./model";
import { nearestQuarterBeat, setLyricGrid } from "./lyric-grid";
const revision = "tooku-tail-plus-quarter-2026-09-19";
/** Explicit user batch edit: shift the reported onset and every following lyric once. */
export function applyTookuTailShift(song: Song): number {
  if (
    song.id !== "real-paradis" ||
    song.lyricShifts?.includes(revision) ||
    song.lyricRevision !== "listening-anchors-2026-09-19-v5" ||
    !song.lyricGridEnabled
  )
    return 0;
  const from = song.lyrics.findIndex(
    (l) => l.id === "v2-l25" && l.text === "토",
  );
  if (from < 0) return 0;
  const anchor = song.lyrics[from];
  if (anchor.grid?.measureId !== "m13" || anchor.grid.tick !== 3) return 0;
  const next = structuredClone(song.lyrics);
  for (let i = from; i < next.length; i++) {
    const l = next[i],
      point =
        l.grid ||
        (() => {
          const p = nearestQuarterBeat(song, l.time);
          return { measureId: p.measure.id, tick: p.tick };
        })();
    let index = song.measures.findIndex((m) => m.id === point.measureId),
      tick = point.tick + 1;
    if (index < 0) throw Error(i18nText("lyrics.validation575"));
    while (
      tick >= song.measures[index].beats * 4 &&
      index + 1 < song.measures.length
    ) {
      tick -= song.measures[index].beats * 4;
      index++;
    }
    if (tick > song.measures[index].beats * 4)
      throw Error(i18nText("lyrics.validation576"));
    setLyricGrid(song, l, { measureId: song.measures[index].id, tick });
    l.confirmed = i === from;
  }
  song.lyricArchive = [
    ...(song.lyricArchive || []),
    { revision: revision + "-before", lyrics: structuredClone(song.lyrics) },
  ];
  song.lyrics = next;
  song.lyricShifts = [...(song.lyricShifts || []), revision];
  return next.length - from;
}
