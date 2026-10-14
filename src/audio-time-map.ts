import { beatTime, type Song } from "./model";
export interface AudioTimeMap {
  source: number[];
  output: number[];
}
export function originalTempoMode(song: Song) {
  return song.settings.tempoMode
    ? song.settings.tempoMode === "original"
    : song.settings.rate === 1;
}
/** Explicit recording grids opt scores into tempo normalization; legacy scores stay unchanged. */
export function recordingBeatGrid(song: Song) {
  if (song.audioPractice) {
    const times = song.audioPractice.followTempo ? song.audioPractice.beatTimes : undefined;
    return times ? {source: times, quarters: times.map((_, i) => i * 4 / song.audioPractice!.denominator)} : undefined;
  }
  if (!song.measures.some(m => m.beatTimes)) return;
  const source: number[] = [], quarters: number[] = [];
  let quarter = 0, end = song.measures[0].start;
  for (const m of song.measures) {
    quarter += Math.max(0, m.start - end) * song.bpm / 60;
    for (let b = 0; b <= m.beats; b++) {
      const time = beatTime(m, b);
      if (time <= (source.at(-1) ?? -1)) continue;
      source.push(time);
      quarters.push(quarter + b * 4 / m.denominator);
    }
    quarter += m.beats * 4 / m.denominator;
    end = m.end;
  }
  return {source, quarters};
}
export function audioTimeMap(
  song: Song,
  duration: number,
): AudioTimeMap | undefined {
  if (originalTempoMode(song)) return;
  const grid = recordingBeatGrid(song);
  if (!grid) return;
  const times = grid.source;
  const rate = song.settings.rate,
    step = 60 / (song.bpm * rate);
  const source = [...times],
    output = grid.quarters.map(q => times[0] / rate + q * step);
  if (source[0] > 0) {
    source.unshift(0);
    output.unshift(0);
  }
  if (source.at(-1)! < duration) {
    output.push(output.at(-1)! + (duration - source.at(-1)!) / rate);
    source.push(duration);
  }
  return { source, output };
}
export function mapTime(time: number, from: number[], to: number[]) {
  if (time <= from[0]) return to[0];
  if (time >= from.at(-1)!) return to.at(-1)!;
  let lo = 0,
    hi = from.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (from[mid] <= time) lo = mid;
    else hi = mid;
  }
  return (
    to[lo] + ((time - from[lo]) / (from[hi] - from[lo])) * (to[hi] - to[lo])
  );
}
/** Completed intervals only: one display update at each beat, without future tempo leakage. */
export function currentAudioBpm(song: Song, time: number) {
  const grid = recordingBeatGrid(song);
  if (!grid || time < grid.source[1]) return song.bpm;
  const beats = grid.source;
  let lo = 0,
    hi = beats.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (beats[mid] <= time) lo = mid + 1;
    else hi = mid;
  }
  const end = lo - 1,
    start = Math.max(0, end - 4);
  return (60 * (grid.quarters[end] - grid.quarters[start])) / (beats[end] - beats[start]);
}
