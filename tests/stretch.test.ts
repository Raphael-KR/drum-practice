import { it, expect } from "vitest";
import { stretch } from "../src/stretch";
it("keeps pitch while changing duration and preserves stereo", () => {
  const sr = 16000,
    n = sr * 4,
    l = new Float32Array(n),
    r = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    l[i] = Math.sin((2 * Math.PI * 440 * i) / sr) * 0.4;
    r[i] = Math.sin((2 * Math.PI * 660 * i) / sr) * 0.4;
  }
  for (const rate of [0.5, 0.8, 1.2]) {
    const out = stretch(l, r, sr, rate);
    expect(out.left.length).toBe(Math.ceil(n / rate));
    for (const [samples, freq] of [
      [out.left, 440],
      [out.right, 660],
    ] as const) {
      let crossings = 0;
      for (let i = sr; i < 2 * sr; i++)
        if (samples[i - 1] < 0 && samples[i] >= 0) crossings++;
      expect(Math.abs(crossings - freq)).toBeLessThanOrEqual(3);
      expect([...samples.slice(sr, sr + 100)].every(Number.isFinite)).toBe(
        true,
      );
    }
  }
});
it("keeps transient alignment within 30 ms over a repeated pulse track", () => {
  const sr = 16000,
    n = sr * 12,
    x = new Float32Array(n);
  for (let t = 1; t < 11; t++)
    for (let j = 0; j < 320; j++)
      x[t * sr + j] =
        Math.sin((2 * Math.PI * 1000 * j) / sr) * Math.exp(-j / 60);
  for (const rate of [0.5, 0.8, 0.81, 1.2]) {
    const out = stretch(x, x, sr, rate).left;
    for (let t = 1; t < 11; t++) {
      const target = t / rate;
      let best = 0,
        at = 0;
      for (
        let i = Math.round((target - 0.08) * sr);
        i < Math.min(out.length, Math.round((target + 0.08) * sr));
        i++
      ) {
        if (Math.abs(out[i]) > best) {
          best = Math.abs(out[i]);
          at = i / sr;
        }
      }
      expect(best).toBeGreaterThan(0.05);
      expect(Math.abs(at - target)).toBeLessThan(0.03);
    }
  }
});
