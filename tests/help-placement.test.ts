import { expect, it } from "vitest";
import { placeHelpBubble, overlaps } from "../src/help-placement";
const viewport = { x: 12, y: 12, width: 1156, height: 720 };
it("keeps edge callouts inside the viewport and outside their target", () => {
  for (const target of [
    { x: 12, y: 12, width: 60, height: 44 },
    { x: 1100, y: 12, width: 60, height: 44 },
    { x: 12, y: 680, width: 60, height: 44 },
    { x: 1100, y: 680, width: 60, height: 44 },
  ]) {
    const p = placeHelpBubble(target, 280, 110, viewport, [target])!;
    expect(p).toBeDefined();
    expect(overlaps(p, target)).toBe(false);
    expect(p.x).toBeGreaterThanOrEqual(viewport.x);
    expect(p.y).toBeGreaterThanOrEqual(viewport.y);
    expect(p.x + p.width).toBeLessThanOrEqual(1168);
    expect(p.y + p.height).toBeLessThanOrEqual(732);
  }
});
it("uses another side when space is occupied and requests a new page when no side fits", () => {
  const target = { x: 400, y: 300, width: 80, height: 44 };
  const first = placeHelpBubble(target, 280, 110, viewport, [target])!;
  const second = placeHelpBubble(target, 280, 110, viewport, [target, first])!;
  expect(overlaps(first, second)).toBe(false);
  expect(
    placeHelpBubble(target, 280, 110, viewport, [viewport]),
  ).toBeUndefined();
});
it("fits a phone bubble below a header button without clipping", () => {
  const target = { x: 220, y: 35, width: 130, height: 44 };
  const p = placeHelpBubble(
    target,
    280,
    120,
    { x: 12, y: 12, width: 366, height: 744 },
    [target],
  )!;
  expect(p.side).toBe("top");
  expect(p.x).toBe(98);
  expect(p.y).toBe(97);
});
