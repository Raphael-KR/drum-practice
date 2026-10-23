import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { wedgeAnchor } from "../../src/modules/score/wedge-endpoints";

interface NativeCapture {
  pass: number;
  duration: number;
  measureX: number;
  right: number;
  staffX: number;
  entries: { time: number; x: number; headEnd: number }[];
}
// Actual Safari/OSMD 2.2.1 geometry from the user's unchanged 113-bar correction.
// This exercises the native coordinate contract; it does not emulate engraving.
const captures: NativeCapture[] = JSON.parse(
  readFileSync(
    "data/reference/test-fixtures/red-sunset-wedge-native-20261024.json",
    "utf8",
  ),
);
for (const capture of captures) {
  const measure = {
    parentSourceMeasure: { Duration: { RealValue: capture.duration } },
    PositionAndShape: { RelativePosition: { x: capture.measureX } },
    staffEntries: capture.entries.map((entry) => ({
      relInMeasureTimestamp: { RealValue: entry.time },
      PositionAndShape: { RelativePosition: { x: entry.x } },
      graphicalVoiceEntries: [{ parentVoiceEntry: { IsGrace: false } }],
    })),
  } as unknown as Parameters<typeof wedgeAnchor>[0];
  it(`anchors real 113/2.5 to its head rather than the preceding beat (native pass ${capture.pass})`, () => {
    const point = wedgeAnchor(measure, 0.375, capture.right);
    const actualSVG = (point + capture.staffX) * 10;
    const target = capture.entries.find((entry) => entry.time === 0.375)!;
    const previous = capture.entries.find((entry) => entry.time === 0.25)!;
    expect(Math.abs(actualSVG - target.headEnd)).toBeLessThan(0.5);
    expect(actualSVG).toBeGreaterThan(previous.headEnd + 10);
    // Fractional positions between actual entries interpolate in native space.
    const mid = wedgeAnchor(measure, 0.3125, capture.right);
    expect(mid).toBeCloseTo(
      (point + wedgeAnchor(measure, 0.25, capture.right)) / 2,
      10,
    );
    // Preserve the separate barline contract used by 110–111.
    expect(wedgeAnchor(measure, capture.duration, capture.right)).toBe(
      capture.right,
    );
  });
}
