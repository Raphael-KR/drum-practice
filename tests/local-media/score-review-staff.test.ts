import { readFileSync } from "node:fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { expect, it, vi } from "vitest";
import { ScoreReview, reviewPair } from "../../src/apps/editor/score-review";
import { readScorePackage } from "../../src/modules/library/score-package";

// Decode the existing package's real pages; no generated score or database.
function canvasEnvironment() {
  const crops: number[][] = [];
  vi.stubGlobal(
    "Image",
    class {
      src = "";
      native!: Awaited<ReturnType<typeof loadImage>>;
      async decode() {
        this.native = await loadImage(
          Buffer.from(await (await fetch(this.src)).arrayBuffer()),
        );
      }
      get naturalWidth() {
        return this.native.width;
      }
      get naturalHeight() {
        return this.native.height;
      }
    },
  );
  vi.stubGlobal("document", {
    createElement() {
      const canvas = createCanvas(1, 1);
      const ctx = canvas.getContext("2d");
      const draw = ctx.drawImage.bind(ctx);
      ctx.drawImage = ((image: { native: unknown }, ...coords: number[]) => {
        crops.push(coords);
        (draw as (...args: unknown[]) => void)(image.native, ...coords);
      }) as unknown as typeof ctx.drawImage;
      return canvas;
    },
  });
  return crops;
}

it("loads all Loveholic PDF/SVG measures and measures dense PDF bars with their printed system", async () => {
  const record = await readScorePackage(
    new Blob([readFileSync("public/scores/loveholic.drumscore")]),
  );
  const pair = reviewPair(record);
  const original = JSON.stringify(
    pair.map((s) => ({ regions: s.regions, measures: s.measures })),
  );
  const crops = canvasEnvironment();
  const review = new ScoreReview(
    createCanvas(1, 1) as unknown as HTMLCanvasElement,
    record.song,
    pair,
  );
  try {
    await review.load();
    const staffs = (
      review as unknown as { staffs: { top: number; gap: number }[][] }
    ).staffs;
    expect(staffs.map((s) => s.length)).toEqual([123, 123]);
    for (const staff of staffs.flat()) {
      expect(staff.gap).toBeGreaterThan(0);
      expect(Number.isFinite(staff.top)).toBe(true);
    }
    // 100–103 share a system. The dense 103rd bar must not be detected alone.
    for (const staff of staffs[0].slice(99, 103))
      expect(staff).toEqual(staffs[0][99]);
    const r = pair[0].regions.find(
      (r) => r.id === pair[0].measures[102].regionId,
    )!;
    const sourceWidth = (
      await loadImage(Buffer.from(await pair[0].pages[r.page].arrayBuffer()))
    ).width;
    expect(
      crops.some(
        (c) =>
          Math.abs(c[2] - r.w * sourceWidth) < 0.001 &&
          Math.abs(c[0] - r.x * sourceWidth) < 0.001,
      ),
    ).toBe(false);
    expect(
      JSON.stringify(
        pair.map((s) => ({ regions: s.regions, measures: s.measures })),
      ),
    ).toBe(original);
  } finally {
    review.dispose();
    vi.unstubAllGlobals();
  }
}, 20000);

it.each([false, true])(
  "rejects a PDF crop without staff lines even when diagnostic logging fails=%s",
  async (logFails) => {
    const record = await readScorePackage(
      new Blob([readFileSync("public/scores/loveholic.drumscore")]),
    );
    const pair = reviewPair(record);
    const r = pair[0].regions.find(
      (r) => r.id === pair[0].measures[102].regionId,
    )!;
    // Read the real PDF page's blank margin instead of fabricating raster pixels.
    Object.assign(r, { x: 0, y: 0, w: 0.005, h: 0.005 });
    canvasEnvironment();
    const diagnostic = vi.spyOn(console, "error").mockImplementation(() => {
      if (logFails) throw Error("log unavailable");
    });
    const review = new ScoreReview(
      createCanvas(1, 1) as unknown as HTMLCanvasElement,
      record.song,
      pair,
    );
    try {
      await expect(review.load()).rejects.toThrow("PDF loveholic-m103");
      expect(diagnostic).toHaveBeenCalledWith(
        expect.stringContaining("loveholic-m103"),
        expect.objectContaining({
          format: "pdf",
          measureId: "loveholic-m103",
          page: 3,
          crop: { x: 0, y: 0, w: 0.005, h: 0.005 },
          regionCount: 1,
          expectedGap: null,
          detectedStaff: null,
        }),
      );
    } finally {
      review.dispose();
      diagnostic.mockRestore();
      vi.unstubAllGlobals();
    }
  },
  20000,
);
