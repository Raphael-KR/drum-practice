/** Shared bounded timestamp contract: source audio seconds, never playback-rate seconds. */
export const MAX_AUDIO_BEATS = 20000;
export function validBeatTimes(value: unknown, duration: number): value is number[] {
  return Array.isArray(value) && value.length >= 8 && value.length <= MAX_AUDIO_BEATS &&
    value.every((v, i) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < duration &&
      (i === 0 || (v - value[i - 1] >= .12 && v - value[i - 1] <= 4)));
}
/** Four-beat navigation groups. No assertion of a musical downbeat or meter. */
export function trackedAudioMeasures(duration: number, times: number[]) {
  if (!validBeatTimes(times, duration)) throw Error('Invalid audio beat timestamps');
  const out = [];
  for (let i = 0; i < times.length; i += 4) {
    const beatTimes = times.slice(i, i + 4);
    out.push({id:`audio-bar-${i / 4}`,regionId:'',label:String(i / 4 + 1),
      beats:beatTimes.length,denominator:4,start:beatTimes[0],end:times[i + 4] ?? duration,beatTimes});
  }
  return out;
}
