import { expect, it } from "vitest";
import { createMixLimiterCurve, MIX_INPUT_GAIN } from "../src/audio-levels";

// Web Audio linearly interpolates a WaveShaper curve and clamps its input to
// [-1, 1]. Include the preceding gain to exercise the complete output mapping.
function mixOutput(input: number, curve: Float32Array) {
  const bounded = Math.max(-1, Math.min(1, input * MIX_INPUT_GAIN));
  const index = ((bounded + 1) / 2) * (curve.length - 1);
  const lower = Math.floor(index);
  const fraction = index - lower;
  return curve[lower] * (1 - fraction) + curve[Math.min(lower + 1, curve.length - 1)] * fraction;
}

it("preserves quiet music and silence and bounds both polarities of an overloaded mix", () => {
  const curve = createMixLimiterCurve();
  expect(mixOutput(0, curve)).toBe(0);
  for (const input of [-0.8, -0.3, 0.3, 0.8]) {
    expect(mixOutput(input, curve)).toBeCloseTo(input, 6);
  }
  for (const input of [-8, -2, -1.5, 1.5, 2, 8]) {
    const output = mixOutput(input, curve);
    expect(Math.abs(output)).toBeLessThanOrEqual(1);
    expect(Math.abs(output)).toBeGreaterThan(0.9);
    expect(Math.sign(output)).toBe(Math.sign(input));
  }
  for (let i = 1; i < curve.length; i++) {
    expect(curve[i]).toBeGreaterThanOrEqual(curve[i - 1]);
    expect(Number.isFinite(curve[i])).toBe(true);
  }
});
