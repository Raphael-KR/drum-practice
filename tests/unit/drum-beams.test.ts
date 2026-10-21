import { describe, it, expect } from "vitest";
import { drumBeamSlope } from "../../src/modules/score/drum-beams";
describe("drum beam contour", () => {
  it("flattens equal heights and reversals including measure 87 beat 2", () => {
    expect(drumBeamSlope([20, 20, 20, 20], 90, 10)).toBe(0);
    expect(drumBeamSlope([20, 20, 0, 20], 90, 10)).toBe(0);
    expect(drumBeamSlope([0, 20, 0, 20], 90, 10)).toBe(0);
  });
  it("gently slopes monotonic groups including measure 87 beat 4", () => {
    expect(drumBeamSlope([0, 20, 20, 20], 90, 10)).toBeCloseTo(5 / 90);
    expect(drumBeamSlope([20, 20, 10, 0], 90, 10)).toBeCloseTo(-5 / 90);
    expect(drumBeamSlope([0, 20], 10, 10)).toBe(0.08);
  });
});

import { installDrumBeams } from "../../src/modules/score/drum-beams";
it("adapts the native note.beam before drawing and preserves minimum stem clearance", () => {
  const notes = [0, 20, 20, 20].map((y, i) => ({
    getYs: () => [y, y + 40],
    getStemX: () => i * 30,
    getStemExtents: () => ({ topY: y - 35 }),
    getStave: () => ({ getSpacingBetweenLines: () => 10 }),
  }));
  const beam = {
    notes,
    stem_direction: 1,
    slope: 0,
    y_shift: 0,
    calculateSlope() {},
  };
  let slope: number | undefined;
  const m = {
    staffEntries: [
      {
        graphicalVoiceEntries: notes.map((n) => ({
          vfStaveNote: { ...n, beam },
        })),
      },
    ],
    draw() {
      beam.calculateSlope();
      slope = beam.slope;
    },
  };
  const calculator = { calculateMeasureXLayout: () => 1 };
  installDrumBeams({
    GraphicSheet: { GetCalculator: calculator },
  } as unknown as Parameters<typeof installDrumBeams>[0]);
  (calculator.calculateMeasureXLayout as (row: (typeof m)[]) => number)([m]);
  m.draw();
  expect(slope).toBeCloseTo(5 / 90);
  expect(beam.y_shift).toBe(0);
});
