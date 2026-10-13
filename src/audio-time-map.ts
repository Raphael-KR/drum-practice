import type { Song } from "./model";
export interface AudioTimeMap {
  source: number[];
  output: number[];
}
export function originalTempoMode(song: Song) {
  return song.settings.tempoMode
    ? song.settings.tempoMode === "original"
    : song.settings.rate === 1;
}
export function audioTimeMap(
  song: Song,
  duration: number,
): AudioTimeMap | undefined {
  const times = song.audioPractice?.followTempo
    ? song.audioPractice.beatTimes
    : undefined;
  if (!times || originalTempoMode(song)) return;
  const rate = song.settings.rate,
    step = 60 / (song.bpm * rate);
  const source = [...times],
    output = times.map((_, i) => times[0] / rate + i * step);
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
  const beats = song.audioPractice?.followTempo
    ? song.audioPractice.beatTimes
    : undefined;
  if (!beats || time < beats[1]) return song.bpm;
  let lo = 0,
    hi = beats.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (beats[mid] <= time) lo = mid + 1;
    else hi = mid;
  }
  const end = lo - 1,
    start = Math.max(0, end - 4);
  return (60 * (end - start)) / (beats[end] - beats[start]);
}
