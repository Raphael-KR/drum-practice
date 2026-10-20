export function estimateTempo(samples: Float32Array, sampleRate: number) {
  const hop = Math.round(sampleRate / 100),
    env: number[] = [];
  let last = 0;
  for (let p = 0; p + hop < samples.length; p += hop) {
    let e = 0;
    for (let j = 0; j < hop; j++) e += samples[p + j] ** 2;
    e = Math.sqrt(e / hop);
    env.push(Math.max(0, e - last));
    last = e;
  }
  const mean = env.reduce((a, b) => a + b, 0) / env.length;
  const a = env.map((v) => Math.max(0, v - mean));
  let best = 0,
    lag = 64;
  const correlations: { lag: number; score: number }[] = [];
  for (let l = 30; l <= 150; l++) {
    let sum = 0;
    for (let i = l; i < a.length; i++) sum += a[i] * a[i - l];
    sum /= Math.max(1, a.length - l);
    correlations.push({ lag: l, score: sum });
    if (sum > best) {
      best = sum;
      lag = l;
    }
  }
  lag = correlations.find((c) => c.score >= best * 0.97)?.lag ?? lag;
  let phase = 0,
    score = -1;
  for (let p = 0; p < lag; p++) {
    let s = 0;
    for (let i = p; i < a.length; i += lag) s += a[i];
    if (s > score) {
      score = s;
      phase = p;
    }
  }
  const energy = a.reduce((s, v) => s + v * v, 0) / Math.max(1, a.length);
  return {
    bpm: Math.round(6000 / lag),
    firstBeat: phase / 100,
    confidence: energy ? Math.min(1, best / energy) : 0,
  };
}
