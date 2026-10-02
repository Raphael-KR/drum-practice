import { t as i18nText } from "./i18n";
import { clamp, locate, type Measure, type Song } from "./model";

/** Inclusive measure range for the current bar and equally many neighbours. */
export function centeredRange(
  measures: Measure[],
  center: number,
  radius: number,
  duration: number,
) {
  if (!measures.length || !Number.isInteger(radius) || radius < 1 || radius > 4)
    throw Error(i18nText("practice-controls.message477"));
  center = clamp(Math.round(center), 0, measures.length - 1);
  const first = Math.max(0, center - radius),
    last = Math.min(measures.length - 1, center + radius);
  return {
    center,
    first,
    last,
    start: measures[first].start,
    end: Math.min(duration, measures[last].end),
  };
}

/** Use a continuous musical coordinate, including when a drag crosses a meter change. */
export function scrubTime(
  song: Song,
  start: number,
  deltaX: number,
  pixelsPerMeasure: number,
  duration: number,
) {
  const at = locate(song, start);
  if (!at.measure) return 0;
  const coordinate =
    at.index +
    at.beat / at.measure.beats -
    deltaX / Math.max(1, pixelsPerMeasure);
  if (coordinate < 0) return 0;
  if (coordinate >= song.measures.length)
    return Math.min(duration, song.measures.at(-1)!.end);
  const index = Math.floor(coordinate),
    m = song.measures[index];
  return clamp(m.start + (m.end - m.start) * (coordinate - index), 0, duration);
}

export function loopMeasureRange(song: Song, start: number, end: number) {
  return {
    first: locate(song, start).index,
    last: locate(song, Math.max(start, end - 1e-6)).index,
  };
}
