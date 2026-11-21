import { expect, it } from "vitest";
import { installRibbonEngraving } from "../../src/modules/score/ribbon-engraving";
it("moves shared native tick contexts once, preserves grace association and uses 5/4 duration", () => {
  let x = 200,
    width = 0,
    formatCount = 0;
  const context = {
    getX: () => x,
    setX: (v: number) => {
      x = v;
    },
  };
  const stave = { getX: () => 50 };
  const note = {
    setStave: () => {},
    getTickContext: () => context,
    getAbsoluteX: () => x + 62,
  };
  const voice = { parentVoiceEntry: { IsGrace: false }, vfStaveNote: note };
  const g = {
    parentSourceMeasure: { Duration: { RealValue: 1.25 } },
    setWidth: (v: number) => {
      width = v;
    },
    getVFStave: () => stave,
    staffEntries: [
      {
        LyricsEntries: [],
        relInMeasureTimestamp: { RealValue: 0.375 },
        graphicalVoiceEntries: [
          voice,
          voice,
          { parentVoiceEntry: { IsGrace: true } },
        ],
      },
    ],
    formatVoices: () => {
      formatCount++;
    },
  };
  const calculator = { calculateMeasureXLayout: () => 1 };
  installRibbonEngraving(
    {
      Sheet: { SourceMeasures: [g.parentSourceMeasure] },
      GraphicSheet: { GetCalculator: calculator },
    } as unknown as Parameters<typeof installRibbonEngraving>[0],
    { quarter: 160, offset: 24 },
  );
  (calculator.calculateMeasureXLayout as (row: (typeof g)[]) => number)([g]);
  (g.formatVoices as (width: number, parent: typeof g) => void)(800, g);
  expect(formatCount).toBe(1);
  expect(width).toBe(83);
  expect(note.getAbsoluteX() - 50).toBe(24 + 1.5 * 160);
  // Repeated layout/skyline passes cannot accumulate offsets.
  (g.formatVoices as (width: number, parent: typeof g) => void)(800, g);
  expect(note.getAbsoluteX() - 50).toBe(264);
});

import { validateRibbonTimeline } from "../../src/modules/score/ribbon-timeline";
it("rejects malformed embedded assets before creating image resources", () => {
  const data = {
    version: 2,
    quarter: 160,
    offset: 24,
    pages: ["<svg/>"],
    regions: [{ id: "r", page: 0, x: 0, y: 0, w: 1, h: 1, beatXs: [0, 1] }],
    staffs: [{ top: 0.2, gap: 0.05 }],
  };
  expect(() => validateRibbonTimeline(data, 1)).not.toThrow();
  for (const change of [
    { quarter: Infinity },
    { offset: NaN },
    { pages: [4] },
    { staffs: [{ top: 0, gap: 0 }] },
    { regions: [{ ...data.regions[0], page: 3 }] },
  ])
    expect(() => validateRibbonTimeline({ ...data, ...change }, 1)).toThrow();
});

it("preserves short measure duration without scaling glyphs", () => {
  let x = 0,
    width = 0;
  const stave = { getX: () => 0 };
  const context = {
    getX: () => x,
    setX: (v: number) => {
      x = v;
    },
  };
  const note = {
    setStave: () => {},
    getTickContext: () => context,
    getAbsoluteX: () => x,
  };
  const m = {
    parentSourceMeasure: { Duration: { RealValue: 0.75 } },
    setWidth: (v: number) => {
      width = v;
    },
    getVFStave: () => stave,
    formatVoices: () => {},
    staffEntries: [
      {
        LyricsEntries: [],
        relInMeasureTimestamp: { RealValue: 0.5 },
        graphicalVoiceEntries: [
          { parentVoiceEntry: { IsGrace: false }, vfStaveNote: note },
        ],
      },
    ],
  };
  const calculator = { calculateMeasureXLayout: () => 1 };
  installRibbonEngraving(
    {
      Sheet: { SourceMeasures: [m.parentSourceMeasure] },
      GraphicSheet: { GetCalculator: calculator },
    } as unknown as Parameters<typeof installRibbonEngraving>[0],
    { quarter: 100, offset: 8 },
  );
  (calculator.calculateMeasureXLayout as (row: (typeof m)[]) => number)([m]);
  (m.formatVoices as (width: number, parent: typeof m) => void)(400, m);
  expect(width).toBe(31.4);
  expect(x).toBeCloseTo(8 + 2 * 100);
});

it("uses the normal inset instead of native system prefixes for sparse and dense grid bars", () => {
  function bar(qs: number[]) {
    const xs = qs.map(() => 200);
    const entries = qs.map((q, i) => ({
      LyricsEntries: [],
      relInMeasureTimestamp: { RealValue: q / 4 },
      graphicalVoiceEntries: [
        {
          parentVoiceEntry: { IsGrace: false },
          vfStaveNote: {
            setStave: () => {},
            getAbsoluteX: () => xs[i],
            getTickContext: () => ({
              getMetrics: () => ({ notePx: 12 }),
              getX: () => xs[i],
              setX: (x: number) => (xs[i] = x),
            }),
          },
        },
      ],
    }));
    let width = 0;
    return {
      xs,
      get width() {
        return width;
      },
      g: {
        parentSourceMeasure: { Duration: { RealValue: 1 } },
        staffEntries: entries,
        setWidth: (w: number) => (width = w),
        getVFStave: () => ({ getX: () => 0 }),
        formatVoices: () => {},
      },
    };
  }
  const sparse = bar([0, 1, 2, 3]),
    dense = bar(Array.from({ length: 64 }, (_, i) => i / 16));
  const calc = { calculateMeasureXLayout: () => 0 };
  installRibbonEngraving(
    {
      Sheet: {
        SourceMeasures: [
          sparse.g.parentSourceMeasure,
          dense.g.parentSourceMeasure,
        ],
      },
      GraphicSheet: { GetCalculator: calc },
    } as unknown as Parameters<typeof installRibbonEngraving>[0],
    {
      quarter: 200,
      offset: 8,
    },
  );
  for (const b of [sparse, dense]) {
    (calc.calculateMeasureXLayout as (row: (typeof b.g)[]) => number)([b.g]);
    (b.g.formatVoices as (width: number, parent: typeof b.g) => void)(320, b.g);
    expect(b.width).toBe(81.4);
    expect(b.xs[0]).toBe(8);
  }
  expect(sparse.xs).toEqual([
    dense.xs[0],
    dense.xs[16],
    dense.xs[32],
    dense.xs[48],
  ]);
  // The common inset is 8, and the unchanged notehead centre is 6 units further.
  expect(dense.xs[0] + 6).toBeCloseTo(14);
  expect(dense.xs[63] + 6).toBeCloseTo(814 - 800 / 64);
  expect(814 + dense.xs[0] - dense.xs[63]).toBeCloseTo(14 + 800 / 64);
});
