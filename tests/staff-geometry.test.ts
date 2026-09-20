import { describe, expect, it } from "vitest";
import { detectStaff } from "../src/staff-geometry";
function pixels(lines: number[], gray = 0) {
  const data = new Uint8ClampedArray(200 * 160 * 4).fill(255);
  for (const y of lines)
    for (let x = 0; x < 200; x++) {
      const i = (y * 200 + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
  return data;
}
describe("staff geometry", () => {
  it("finds gray PDF staff lines despite a separate beam", () => {
    expect(
      detectStaff(pixels([10, 60, 70, 80, 90, 100], 200), 200, 160),
    ).toEqual({ top: 60, gap: 10 });
  });
  it("merges antialiased line thickness", () => {
    expect(
      detectStaff(pixels([60, 61, 70, 71, 80, 81, 90, 91, 100, 101]), 200, 160),
    ).toEqual({ top: 60.5, gap: 10 });
  });
  it("recognizes a staff with one obscured inner line", () => {
    expect(detectStaff(pixels([60, 70, 90, 100]), 200, 160)).toEqual({
      top: 60,
      gap: 10,
    });
  });
  it("rejects empty or nonstaff content", () => {
    expect(detectStaff(pixels([12, 32, 65]), 200, 160)).toBeUndefined();
  });
});
