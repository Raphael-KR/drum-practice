import MusicTempo from "music-tempo";
import { validBeatTimes } from "../../model/audio-beat-grid";
/** Whole-file beat tracking. The existing estimator supplies the pulse-level prior. */
export function trackAudioBeats(
  samples: Float32Array,
  sampleRate: number,
  bpm: number,
): number[] | undefined {
  const duration = samples.length / sampleRate;
  if (
    duration < 4 ||
    duration > 1800 ||
    !Number.isFinite(bpm) ||
    bpm < 20 ||
    bpm > 300
  )
    return;
  let peak = 0;
  for (const x of samples) peak = Math.max(peak, Math.abs(x));
  if (peak < 1e-5) return;
  const hopSize = Math.round(sampleRate / 100);
  const result = new MusicTempo(samples, {
    hopSize,
    timeStep: hopSize / sampleRate,
    bufferSize: 1024,
    minBeatInterval: (60 / bpm) * 0.8,
    maxBeatInterval: (60 / bpm) * 1.2,
    correctionFactor: 20,
    maxChange: 0.5,
  });
  const times = result.beats
    .map((t) => Math.round(t * 1000) / 1000)
    .filter((t) => t >= 0 && t < duration);
  if (!validBeatTimes(times, duration)) return;
  // Reject paths with too few supported attacks; interpolation alone is not evidence.
  let supported = 0,
    event = 0;
  for (const time of times) {
    while (event < result.events.length && result.events[event] < time - 0.07)
      event++;
    if (
      event < result.events.length &&
      Math.abs(result.events[event] - time) <= 0.07
    )
      supported++;
  }
  if (
    supported / times.length < 0.5 ||
    times.at(-1)! - times[0] < Math.min(10, duration * 0.5)
  )
    return;
  return times;
}
