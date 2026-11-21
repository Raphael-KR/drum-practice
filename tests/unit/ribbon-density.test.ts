import { expect, it } from "vitest";
import {
  measureWidth,
  scoreLayout,
} from "../../src/modules/playback/playback-layout";
import type { Song, Region } from "../../src/model/model";
it("shows 16 quarters at 100%, scales uniformly, and ignores BPM", () => {
  const r = {
    w: 0.4,
    h: 0.2,
    x: 0,
    y: 0,
    page: 0,
    id: "r",
    beatXs: [0, 1],
  } as Region;
  const staff = { gap: 0.01, top: 0.1, ribbonQuarterInGaps: 10 };
  // Native page 1000x1000, 4 quarters x 100 units = 400 units.
  for (const W of [600, 1000, 1400])
    for (const zoom of [0.5, 1, 2]) {
      const s = {
        settings: { zoom, view: "ribbon" },
        bpm: 180,
      } as unknown as Song;
      const width = measureWidth(s, r, W, 1, staff);
      expect(width).toBeCloseTo((W / 4) * zoom);
      const layout = scoreLayout(s, r, width, W, staff)!;
      const [x, y] = layout.size.split(" ").map(parseFloat);
      expect(x).toBeCloseTo(y);
      expect(measureWidth({ ...s, bpm: 60 }, r, W, 1, staff)).toBe(width);
    }
});
it("uses identical glyph scale on both axes for the shared row artwork", () => {
  const region = {
    id: "r",
    page: 0,
    x: 0,
    y: 0,
    w: 0.4,
    h: 0.2,
    beatXs: [0, 1],
  } as Region;
  const staff = { gap: 0.012, top: 0.1, nativePageRatio: 2 };
  for (const width of [744, 1133, 1400])
    for (const zoom of [0.5, 1, 2]) {
      const song = { settings: { zoom, view: "rows" } } as unknown as Song;
      const row = scoreLayout(song, region, width / 4, width, staff)!;
      song.settings.view = "ribbon";
      const ribbon = scoreLayout(
        song,
        region,
        (width / 4) * zoom,
        width,
        staff,
      )!;
      const [rx, ry] = row.size.split(" ").map(parseFloat);
      const [x, y] = ribbon.size.split(" ").map(parseFloat);
      expect(x).toBeCloseTo(rx * zoom);
      expect(y).toBeCloseTo(ry * zoom);
      expect(y / x).toBeCloseTo(staff.nativePageRatio);
    }
});

it("uses duration-proportional widths and scales only overflowing rows", async () => {
  const { timeMeasureWidth, timePosition, rowScale } =
    await import("../../src/modules/score/time-spacing");
  const width = timeMeasureWidth(4);
  expect(timeMeasureWidth(3) - timePosition(0)).toBe(
    ((width - timePosition(0)) * 3) / 4,
  );
  expect(rowScale([width, width, width], width * 4)).toBe(1);
  const mixed = [width, width, width, timeMeasureWidth(5)];
  const scale = rowScale(mixed, width * 4);
  expect(scale).toBeLessThan(1);
  expect(mixed.reduce((sum, w) => sum + w * scale, 0)).toBeCloseTo(width * 4);
});

it("retains the shared inset and preserves finer grid intervals", async () => {
  const { gridPhase } = await import("../../src/modules/score/ribbon-timeline");
  for (const width of [320, 480, 900]) {
    const start = 12 / width,
      step = (width - 12) / 64;
    expect(width * gridPhase(0, 4, start)).toBeCloseTo(12);
    expect(width * gridPhase(63 / 16, 4, start)).toBeCloseTo(width - step);
    expect(
      width +
        width * gridPhase(0, 4, start) -
        width * gridPhase(63 / 16, 4, start),
    ).toBeCloseTo(12 + step);
    for (let q = 0; q < 4; q += 1 / 64) {
      expect(
        width * (gridPhase(q + 1 / 64, 4, start) - gridPhase(q, 4, start)),
      ).toBeCloseTo(step / 4);
    }
    expect(width * gridPhase(4, 4, start)).toBeCloseTo(width);
  }
});
