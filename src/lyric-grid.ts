import { t as i18nText } from "./i18n";
import { beatTime, locate, type Song, type Lyric, type Measure } from "./model";
export interface GridPoint {
  measureId: string;
  tick: number;
}
export function nearestQuarterBeat(song: Song, time: number) {
  if (!Number.isFinite(time) || !song.measures.length)
    throw Error(i18nText("lyric-grid.message087"));
  let best:
    | { measure: Measure; tick: number; time: number; distance: number }
    | undefined;
  for (const measure of song.measures) {
    const raw =
      ((time - measure.start) / (measure.end - measure.start)) *
      measure.beats *
      4;
    const tick = Math.max(0, Math.min(measure.beats * 4, Math.round(raw)));
    const candidate = beatTime(measure, tick / 4),
      distance = Math.abs(time - candidate);
    // A shared barline belongs to the following measure.
    if (
      !best ||
      distance < best.distance - 1e-9 ||
      (Math.abs(distance - best.distance) < 1e-9 && tick === 0)
    )
      best = { measure, tick, time: candidate, distance };
  }
  return best!;
}
export function gridLabel(measure: Measure, tick: number) {
  if (tick === measure.beats * 4)
    return i18nText("lyric-grid.message088", { value1: measure.label });
  return i18nText("lyric-grid.message089", {
    value1: measure.label,
    value2: Math.floor(tick / 4) + 1,
    value3: ["", " + ¼", " + ½", " + ¾"][tick % 4],
  });
}
export function setLyricGrid(song: Song, lyric: Lyric, point: GridPoint) {
  const m = song.measures.find((m) => m.id === point.measureId);
  if (
    !m ||
    !Number.isFinite(point.tick) ||
    (!lyric.scorePosition && !Number.isInteger(point.tick)) ||
    point.tick < 0 ||
    point.tick > m.beats * 4
  )
    throw Error(i18nText("lyric-grid.message090"));
  lyric.originalTime ??= lyric.time;
  const nextTime = beatTime(m, point.tick / 4),
    delta = nextTime - lyric.time;
  lyric.grid = { ...point };
  lyric.freeTiming = false;
  if (lyric.scorePosition) {
    lyric.scorePosition.measureId = m.id;
    lyric.scorePosition.quarterOffset = point.tick / m.denominator;
  }
  lyric.time = nextTime;
  lyric.end = Math.max(nextTime, lyric.end + delta);
}
export function synchronizeLyricGrid(song: Song) {
  for (const l of song.lyrics) {
    if (l.scorePosition) continue;
    if (l.freeTiming) {
      delete l.grid;
      continue;
    }
    let point = l.grid;
    const m = point && song.measures.find((m) => m.id === point!.measureId);
    if (!m || !point || point.tick > m.beats * 4) {
      const nearest = nearestQuarterBeat(song, l.time);
      point = { measureId: nearest.measure.id, tick: nearest.tick };
    }
    setLyricGrid(song, l, point);
  }
  song.lyrics.sort((a, b) => a.time - b.time);
  // Multiple fast syllables may share a point. Do not push them to invented later beats.
  for (let i = 0; i < song.lyrics.length; i++) {
    const l = song.lyrics[i],
      next = song.lyrics.slice(i + 1).find((n) => n.time > l.time + 1e-8);
    if (next && !l.freeTiming && !l.scorePosition)
      l.end = Math.max(l.time, Math.min(l.end, next.time));
  }
}
export function enableLyricGrid(song: Song) {
  if (!song.measures.length) return;
  if (!song.lyricGridEnabled) {
    song.lyricArchive = [
      ...(song.lyricArchive || []),
      {
        revision: (song.lyricRevision || "original") + "-before-quarter-grid",
        lyrics: song.lyrics.map((l) => structuredClone(l)),
      },
    ];
    song.lyricGridEnabled = true;
  }
  synchronizeLyricGrid(song);
}

/** Assign each lyric to exactly one bar; floating-point overlap is not dual ownership. */
export function lyricMeasureId(song: Song, lyric: Lyric): string | undefined {
  if (lyric.grid && !lyric.freeTiming) {
    const index = song.measures.findIndex(
      (m) => m.id === lyric.grid!.measureId,
    );
    if (index >= 0) {
      const m = song.measures[index],
        next = song.measures[index + 1];
      if (
        lyric.grid.tick === m.beats * 4 &&
        next &&
        Math.abs(m.end - next.start) < 1e-8
      )
        return next.id;
      return m.id;
    }
  }
  return locate(song, lyric.time).measure?.id;
}
