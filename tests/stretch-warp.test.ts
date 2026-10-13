import { expect, it } from "vitest";
import { stretchWarp } from "../src/stretch-warp";
import { mapTime } from "../src/audio-time-map";
it.each([0.5, 1, 1.2])(
  "normalizes variable beat attacks without losing stereo pitch at rate %s",
  (rate) => {
    const sr = 16000,
      duration = 12,
      source = [
        0, 0.5, 1.1, 1.65, 2.12, 2.55, 3.05, 3.65, 4.15, 4.7, 5.2, 5.68, 6.15,
        6.7, 7.28, 7.8, 8.3, 8.78, 9.28, 9.84, 10.4, 11, 12,
      ];
    const output = source.map((_, i) => (i * 0.5) / rate);
    const l = new Float32Array(sr * duration),
      r = new Float32Array(l.length);
    for (let i = 0; i < l.length; i++) {
      l[i] = 0.1 * Math.sin((i * 2 * Math.PI * 440) / sr);
      r[i] = 0.1 * Math.sin((i * 2 * Math.PI * 660) / sr);
    }
    for (const t of source.slice(1, -1))
      for (let j = 0; j < sr * 0.015; j++) {
        const at = Math.round(t * sr) + j;
        l[at] +=
          0.8 * Math.cos((j * 2 * Math.PI * 1000) / sr) * Math.exp(-j / 45);
        r[at] += l[at] - 0.1 * Math.sin((at * 2 * Math.PI * 440) / sr);
      }
    const out = stretchWarp(l, r, sr, { source, output });
    expect(out.left.length).toBe(Math.round((11 * sr) / rate));
    for (let n = 1; n < source.length - 1; n++) {
      const target = (n * 0.5) / rate;
      let peak = 0,
        at = 0;
      for (
        let i = Math.round((target - 0.08) * sr);
        i < Math.round((target + 0.08) * sr);
        i++
      )
        if (Math.abs(out.left[i]) > peak) {
          peak = Math.abs(out.left[i]);
          at = i / sr;
        }
      expect(peak).toBeGreaterThan(0.25);
      expect(Math.abs(at - target)).toBeLessThan(0.03);
    }
    for (const [samples, freq] of [
      [out.left, 440],
      [out.right, 660],
    ] as const) {
      let crossings = 0;
      for (let i = Math.ceil((sr * 2.1) / rate); i < (sr * 2.4) / rate; i++)
        if (samples[i - 1] < 0 && samples[i] >= 0) crossings++;
      expect(Math.abs(crossings / (0.3 / rate) - freq)).toBeLessThan(12);
    }
    for (const t of [0, 0.8, 4.99, 11.7, 12])
      expect(mapTime(mapTime(t, source, output), output, source)).toBeCloseTo(
        t,
        6,
      );
  },
);

it("keeps identical intervals sample-exact and rejects a reversed map", () => {
  const l = Float32Array.from({ length: 16000 }, (_, i) => Math.sin(i / 7)),
    r = l.map((v) => -v);
  const map = { source: [0, 0.5, 1], output: [0, 0.5, 1] };
  const out = stretchWarp(l, r, 16000, map);
  expect(out.left).toEqual(l);
  expect(out.right).toEqual(r);
  expect(() =>
    stretchWarp(l, r, 16000, { source: [0, 1, 0.5], output: [0, 0.5, 1] }),
  ).toThrow("Invalid audio time map");
});
