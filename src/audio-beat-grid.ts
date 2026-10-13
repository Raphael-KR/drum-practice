/** Shared bounded timestamp contract: source audio seconds, never playback-rate seconds. */
export const MAX_AUDIO_BEATS = 20000;
export function validBeatTimes(value: unknown, duration: number): value is number[] {
  return Array.isArray(value) && value.length >= 8 && value.length <= MAX_AUDIO_BEATS &&
    value.every((v, i) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < duration &&
      (i === 0 || (v - value[i - 1] >= .12 && v - value[i - 1] <= 4)));
}
/** Four-beat navigation groups. No assertion of a musical downbeat or meter. */
export function trackedAudioMeasures(duration: number, times: number[], barOne?: number) {
  if (!validBeatTimes(times, duration)) throw Error('Invalid audio beat timestamps');
  const start = barOne === undefined ? 0 : times.indexOf(barOne);
  if (start < 0) throw Error('Bar one must match an observed beat');
  const out = [];
  if (barOne !== undefined && barOne > 0) out.push({id:'audio-prelude',regionId:'',label:'0',
    beats:1,denominator:4,start:0,end:barOne,beatTimes:[0],audioPrelude:true});
  for (let i = start; i < times.length; i += 4) {
    const beatTimes = times.slice(i, i + 4);
    out.push({id:`audio-bar-${(i-start) / 4}`,regionId:'',label:String((i-start) / 4 + 1),
      beats:beatTimes.length,denominator:4,start:beatTimes[0],end:times[i + 4] ?? duration,beatTimes});
  }
  return out;
}
