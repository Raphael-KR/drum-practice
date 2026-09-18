import { it, expect, vi } from "vitest";
vi.mock("pdfjs-dist", () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: {},
}));
import { detectRegions } from "../src/pdf";
it("finds bars in an independent synthetic five-line staff", () => {
  const width = 1000,
    height = 500,
    data = new Uint8ClampedArray(width * height * 4).fill(255);
  const ink = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    data[i] = data[i + 1] = data[i + 2] = 0;
  };
  for (let y = 150; y <= 190; y += 10)
    for (let x = 50; x <= 950; x++) ink(x, y);
  for (const x of [50, 275, 500, 725, 950])
    for (let y = 150; y <= 190; y++) ink(x, y);
  const r = detectRegions({ width, height, data }, 0);
  expect(r).toHaveLength(4);
  expect(r[0].x).toBeCloseTo(0.05);
  expect(r.at(-1)!.x + r.at(-1)!.w).toBeCloseTo(0.95);
});
it("accepts subpixel staff spacing and excludes stems extending above the staff", () => {
  const width = 1000,
    height = 500;
  const data = new Uint8ClampedArray(width * height * 4).fill(255);
  const ink = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    data[i] = data[i + 1] = data[i + 2] = 0;
  };
  const top = 150,
    bottom = Math.round(top + 4 * 14.4);
  for (let line = 0; line < 5; line++)
    for (let x = 50; x <= 950; x++) ink(x, Math.round(top + line * 14.4));
  for (const x of [50, 275, 500, 725, 950])
    for (let y = top; y <= bottom; y++) ink(x, y);
  for (const x of [150, 400, 600])
    for (let y = top - 20; y <= bottom; y++) ink(x, y);
  expect(detectRegions({ width, height, data }, 0)).toHaveLength(4);
});
