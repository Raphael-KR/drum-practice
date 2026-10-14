/** Shared bounded timestamp contract: source audio seconds, never playback-rate seconds. */
export const MAX_AUDIO_BEATS = 20000;
export function validBeatTimes(value: unknown, duration: number): value is number[] {
  return Array.isArray(value) && value.length >= 8 && value.length <= MAX_AUDIO_BEATS &&
    value.every((v, i) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < duration &&
      (i === 0 || (v - value[i - 1] >= .12 && v - value[i - 1] <= 4)));
}
/** Group observed pulses using the selected meter; timestamps are never moved. */
export function trackedAudioMeasures(duration: number, times: number[], barOne?: number, beats = 4, denominator = 4) {
  if (!validBeatTimes(times, duration)) throw Error('Invalid audio beat timestamps');
  if (!Number.isInteger(beats) || beats < 1 || beats > 16 || ![2,4,8,16].includes(denominator))
    throw Error('Invalid audio meter');
  const start = barOne === undefined ? 0 : times.indexOf(barOne);
  if (start < 0) throw Error('Bar one must match an observed beat');
  const out = [];
  if (barOne !== undefined && barOne > 0) out.push({id:'audio-prelude',regionId:'',label:'0',
    beats:1,denominator:4,start:0,end:barOne,beatTimes:[0],audioPrelude:true});
  for (let i = start; i < times.length; i += beats) {
    const beatTimes = times.slice(i, i + beats);
    out.push({id:`audio-bar-${(i-start) / beats}`,regionId:'',label:String((i-start) / beats + 1),
      beats:beatTimes.length,denominator,start:beatTimes[0],end:times[i + beats] ?? duration,beatTimes});
  }
  return out;
}
