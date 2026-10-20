// Reserve input range for summing full-volume music and the metronome. The
// waveshaper restores unity gain below the ceiling and rounds only loud peaks.
export const MIX_INPUT_GAIN = 0.25;
export const MIX_LINEAR_LIMIT = 0.9;
export const METRONOME_MAX_GAIN = 1.5;

export function limitMixedSample(sample: number): number {
  const magnitude = Math.abs(sample);
  if (magnitude <= MIX_LINEAR_LIMIT) return sample;
  return Math.sign(sample) * (
    MIX_LINEAR_LIMIT + (1 - MIX_LINEAR_LIMIT) *
      Math.tanh((magnitude - MIX_LINEAR_LIMIT) / (1 - MIX_LINEAR_LIMIT))
  );
}

export function createMixLimiterCurve() {
  const curve = new Float32Array(16385);
  for (let i = 0; i < curve.length; i++) {
    const input = (2 * i) / (curve.length - 1) - 1;
    curve[i] = limitMixedSample(input / MIX_INPUT_GAIN);
  }
  return curve;
}
