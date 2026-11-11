import { t as i18nText } from "../../shared/i18n/i18n";
import { NOTATION_STEPS_PER_QUARTER } from "../../model/notation-grid";
import {
  beatTime,
  measureBeatAt,
  locate,
  type Song,
  type Lyric,
  type Measure,
} from "../../model/model";
export interface GridPoint {
  measureId: string;
  /** Retain the stored quarter-beat unit; do not reinterpret old integer ticks. */
  tick: number;
}
/** One 64th in the existing tick unit, including meters whose beat is not a quarter. */
export function lyricGridStep(measure: Pick<Measure, "denominator">) {
  return measure.denominator / NOTATION_STEPS_PER_QUARTER;
}
/** Clamp only when moving beyond a shorter bar; preserve finer values inside it. */
export function lyricGridTickForMeasure(measure: Measure, tick: number) {
  const end = measure.beats * 4;
  return tick > end ? end - lyricGridStep(measure) : tick;
}
/** Read musical position first; playback seconds and legacy grid are projections. */
export function lyricGridPoint(song: Song, lyric: Lyric): GridPoint {
  const position = lyric.scorePosition;
  const measure = song.measures.find((m) => m.id === position?.measureId);
  if (position && measure)
    return {
      measureId: measure.id,
      tick: position.quarterOffset * measure.denominator,
    };
  if (lyric.grid) return { ...lyric.grid };
  const nearest = nearestQuarterBeat(song, lyric.time);
  return { measureId: nearest.measure.id, tick: nearest.tick };
}
/** Add the exact source value to the choices when it is a tuplet or a bar boundary. */
export function lyricGridTicks(measure: Measure, current: number) {
  const step = lyricGridStep(measure);
  const ticks = Array.from(
    { length: Math.ceil((measure.beats * 4) / step) },
    (_, i) => i * step,
  );
  if (!ticks.includes(current)) ticks.push(current);
  return ticks.sort((a, b) => a - b);
}
/** Kept for quick position copying and legacy time-only migration, not score precision. */
export function nearestQuarterBeat(song: Song, time: number) {
  if (!Number.isFinite(time) || !song.measures.length)
    throw Error(i18nText("lyric-grid.message087"));
  let best:
    | { measure: Measure; tick: number; time: number; distance: number }
    | undefined;
  for (const measure of song.measures) {
    const raw = measureBeatAt(measure, time) * 4;
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
    value3: Number.isInteger(tick)
      ? ["", " + ¼", " + ½", " + ¾"][tick % 4]
      : " + " + String((tick % 4) / 4),
  });
}
export function setLyricGrid(song: Song, lyric: Lyric, point: GridPoint) {
  const m = song.measures.find((m) => m.id === point.measureId);
  if (
    !m ||
    !Number.isFinite(point.tick) ||
    (!lyric.scorePosition &&
      !Number.isInteger(point.tick / lyricGridStep(m))) ||
    point.tick < 0 ||
    point.tick > m.beats * 4
  )
    throw Error(
      `${i18nText("lyric-grid.message090")} measure=${point.measureId}, tick=${point.tick}, range=0..${m ? m.beats * 4 : "missing"}`,
    );
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
