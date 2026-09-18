import { it, expect } from "vitest";
import { packLabels } from "../src/lyric-layout";
it("preserves separated anchors and centers a crowded cluster without overlap", () => {
  const items = [
    { left: 0, width: 15 },
    { left: 50, width: 15 },
    { left: 58, width: 15 },
    { left: 120, width: 15 },
  ];
  const p = packLabels(items);
  expect(p[0]).toBe(0);
  expect(p[3]).toBe(120);
  expect(p[1] - 50).toBeCloseTo(-(p[2] - 58));
  for (let i = 1; i < p.length; i++)
    expect(p[i] - p[i - 1]).toBeGreaterThanOrEqual(items[i - 1].width + 2);
});
