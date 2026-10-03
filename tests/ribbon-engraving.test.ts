import { expect, it } from "vitest";
import { ribbonSpacing, installRibbonEngraving } from "../src/ribbon-engraving";
function entry(q: number, left = 0, right = 16) {
  return {
    relInMeasureTimestamp: { RealValue: q / 4 },
    graphicalVoiceEntries: [
      {
        parentVoiceEntry: { IsGrace: false },
        vfStaveNote: {
          getTickContext: () => ({
            getMetrics: () => ({ extraLeftPx: left, notePx: right }),
          }),
        },
      },
    ],
  };
}
it("budgets the densest subdivision and grace modifiers across the entire song", () => {
  const osmd = {
    GraphicSheet: {
      MeasureList: [
        [
          {
            staffEntries: [entry(0), entry(1)],
            parentSourceMeasure: { Duration: { RealValue: 1 } },
          },
        ],
        [
          {
            staffEntries: [entry(0, 45), entry(3.875)],
            parentSourceMeasure: { Duration: { RealValue: 1 } },
          },
        ],
      ],
    },
  };
  const s = ribbonSpacing(osmd);
  expect(s.offset).toBeGreaterThanOrEqual(49);
  expect(s.quarter * 0.125).toBeGreaterThanOrEqual(s.offset + 16 + 4);
});
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
    { GraphicSheet: { GetCalculator: calculator } },
    { quarter: 160, offset: 24 },
  );
  (calculator.calculateMeasureXLayout as any)([g]);
  (g.formatVoices as any)(800, g);
  expect(formatCount).toBe(1);
  expect(width).toBe(80);
  expect(note.getAbsoluteX() - 50).toBe(24 + 1.5 * 160);
  // Repeated layout/skyline passes cannot accumulate offsets.
  (g.formatVoices as any)(800, g);
  expect(note.getAbsoluteX() - 50).toBe(264);
});

import { validateRibbonTimeline } from "../src/ribbon-timeline";
it("rejects malformed embedded assets before creating image resources", () => {
  const data = {
    version: 1,
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


it("does not charge an interior ornament as every measure's leading margin", () => {
  const osmd = {GraphicSheet:{MeasureList:[[{
    staffEntries:[entry(0),entry(2,45),entry(3.75)],
    parentSourceMeasure:{Duration:{RealValue:1}},
  }]]}};
  const s = ribbonSpacing(osmd);
  expect(s.offset).toBe(8);
  expect(s.quarter).toBe(112);
});

it('re-spaces a short measure into a uniform row cell before engraving, without scaling glyphs', () => {
  let x=0,width=0;
  const stave={getX:()=>0};
  const context={getX:()=>x,setX:(v:number)=>{x=v;}};
  const note={setStave:()=>{},getTickContext:()=>context,getAbsoluteX:()=>x};
  const m={parentSourceMeasure:{Duration:{RealValue:.75}},setWidth:(v:number)=>{width=v;},
    getVFStave:()=>stave,formatVoices:()=>{},staffEntries:[{relInMeasureTimestamp:{RealValue:.5},
      graphicalVoiceEntries:[{parentVoiceEntry:{IsGrace:false},vfStaveNote:note}]}]};
  const calculator={calculateMeasureXLayout:()=>1};
  installRibbonEngraving({GraphicSheet:{GetCalculator:calculator}},{quarter:100,offset:8,uniformQuarters:4});
  (calculator.calculateMeasureXLayout as any)([m]);
  (m.formatVoices as any)(400,m);
  expect(width).toBe(40);
  expect(x).toBeCloseTo(8+2*100*4/3);
});

import { rowPositions } from '../src/ribbon-engraving';
it('allocates row clearance without letting a single short duration shrink the whole score', () => {
 const e=[{q:0,left:0,right:12},{q:3.5,left:20,right:12},{q:3.833333,left:0,right:12},{q:4,left:0,right:0}];
 const p=rowPositions(e,8,320);
 expect(p[3]).toBeCloseTo(320);
 expect(p[1]-p[0]).toBeGreaterThanOrEqual(36);
 expect(p[3]-p[2]).toBeGreaterThanOrEqual(16);
});
