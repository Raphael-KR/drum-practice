import { expect, it } from "vitest";
import { restCenterShift } from "../src/whole-rest-layout";

it("keeps Loveholic's full-bar rest inside the fixed grid crop", () => {
  // Safari/OSMD 2.1.2, bars 121–123: native rest is left of the 50..370 crop.
  const left = 50, right = 370, glyphX = 34, glyphWidth = 12.55176;
  expect(glyphX + glyphWidth).toBeLessThan(left);
  const placedX = glyphX + restCenterShift(left, right, glyphX, glyphWidth);
  expect(placedX).toBeGreaterThan(left);
  expect(placedX + glyphWidth).toBeLessThan(right);
  expect(placedX + glyphWidth / 2).toBeCloseTo((left + right) / 2);
});
