/** Short, dry stick-on-stick synthesis; identical strokes without a pitched beep. */
export function stickClickSamples(sampleRate: number): Float32Array<ArrayBuffer> {
  const samples = new Float32Array(Math.ceil(sampleRate * 0.035));
  let seed = 73421, previousNoise = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    const noise = (seed >>> 0) / 2147483648 - 1;
    const attack = Math.min(1, t / 0.0004);
    const transient = (noise - previousNoise) * 0.3 * Math.exp(-t * 850);
    const wood = (Math.sin(2 * Math.PI * 1900 * t) + 0.45 * Math.sin(2 * Math.PI * 3170 * t)) * 0.35 * Math.exp(-t * 260);
    samples[i] = (transient + wood) * attack * Math.max(0, 1 - t / 0.035);
    previousNoise = noise;
  }
  return samples;
}
