import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  beatEvents,
  makeCycle,
  cyclePosition,
  locate,
  reflow,
  validateSong,
  continuousX,
  xAtBeat,
  type Song,
} from "../src/model";
import { estimateTempo } from "../src/analysis";
const fixture = (): Song =>
  JSON.parse(readFileSync("public/demo/song.json", "utf8"));
describe("actual score timeline", () => {
  it("aligns count-in with the first musical beat after leading audio or a fractional seek", () => {
    const m = fixture().measures[0];
    for (const from of [0, m.start, m.start + 0.2]) {
      for (const rate of [0.8, 1]) {
        const c = makeCycle(1, from, m.end, rate, 2, m);
        const bs = (m.end - m.start) / m.beats;
        const next =
          m.start + Math.max(0, Math.ceil((from - m.start) / bs - 1e-8)) * bs;
        const firstMusicClick = c.musicAt + (next - from) / rate;
        const lastCount = c.countAt + (c.count - 1) * c.countBeatSeconds;
        expect(firstMusicClick - lastCount).toBeCloseTo(bs / rate, 8);
      }
    }
  });
  it("crosses printed bar margins without a position jump", () => {
    const s = fixture();
    for (let i = 0; i < s.measures.length - 1; i++) {
      const m = s.measures[i],
        next = s.measures[i + 1];
      const r = s.regions.find((r) => r.id === m.regionId)!;
      const nr = s.regions.find((r) => r.id === next.regionId)!;
      const endpoint = 300 + 280 * xAtBeat(nr, next, 0);
      expect(continuousX(r, m, m.beats, 300, endpoint)).toBeCloseTo(
        endpoint,
        8,
      );
      expect(
        endpoint - continuousX(r, m, m.beats - 0.00001, 300, endpoint),
      ).toBeLessThan(0.01);
    }
  });
  it("preserves 110 measures and the 441 beat count including 5/4", () => {
    const s = fixture();
    validateSong(s);
    expect(s.measures).toHaveLength(110);
    expect(beatEvents(s, 0, 999)).toHaveLength(441);
    expect(s.measures[83].beats).toBe(5);
    expect(locate(s, s.measures[84].start).index).toBe(84);
  });
  it("uses half-open loop bounds without a double downbeat", () => {
    const s = fixture(),
      start = s.measures[82].start,
      end = s.measures[86].start;
    const beats = beatEvents(s, start, end);
    expect(beats).toHaveLength(17);
    expect(beats.filter((b) => b.accent)).toHaveLength(4);
    expect(beats.at(-1)!.time).toBeLessThan(end);
  });
  it("schedules 20 repetitions without drift across tempo changes", () => {
    const s = fixture(),
      m = s.measures[83],
      end = s.measures[87].start;
    for (const rate of [0.5, 0.8, 0.81, 1, 1.2]) {
      let at = 10;
      for (let i = 0; i < 20; i++) {
        const c = makeCycle(at, m.start, end, rate, 0, m);
        expect(cyclePosition(c, c.musicAt)).toBe(m.start);
        expect(cyclePosition(c, c.endAt)).toBeCloseTo(end, 9);
        at = c.endAt;
      }
      expect(at).toBeCloseTo(10 + (20 * (end - m.start)) / rate, 8);
    }
  });
  it("counts two bars of five and connects at the original position", () => {
    const s = fixture(),
      m = s.measures[83],
      c = makeCycle(1, m.start, m.end, 0.8, 2, m);
    expect(c.count).toBe(10);
    expect(c.musicAt - 1).toBeCloseTo((10 * (m.end - m.start)) / 5 / 0.8, 9);
    expect(cyclePosition(c, c.musicAt - 1)).toBe(m.start);
  });
  it("reflow respects eighth-note denominator", () => {
    const s = fixture();
    s.measures = s.measures.slice(0, 2);
    s.measures[0].beats = 6;
    s.measures[0].denominator = 8;
    reflow(s);
    expect(s.measures[0].end - s.firstBeat).toBeCloseTo((3 * 60) / 94);
    expect(s.measures[1].start).toBe(s.measures[0].end);
  });
  it("rejects malformed imports and overlapping timing", () => {
    for (const change of [
      (s: Song) => (s.settings.rate = NaN),
      (s: Song) => (s.regions[0].x = -1),
      (s: Song) => (s.measures[1].start = 0),
      (s: Song) => (s.lyrics[0].end = -1),
    ]) {
      const s = fixture();
      change(s);
      expect(() => validateSong(s)).toThrow();
    }
  });
});
it("suggests tempo for a known pulse signal and identifies silence as uncertain", () => {
  const sr = 1000,
    x = new Float32Array(30 * sr);
  for (let t = 0.1; t < 30; t += 0.6)
    for (let j = 0; j < 20; j++) x[Math.round(t * sr) + j] = 0.8;
  expect(estimateTempo(x, sr).bpm).toBe(100);
  expect(estimateTempo(new Float32Array(sr), sr).confidence).toBe(0);
});
it("matches independent snare observations, not just the BPM formula", () => {
  const s = fixture();
  const g = JSON.parse(
    readFileSync("data/reference/grid_verified.json", "utf8"),
  );
  expect(g.references.length).toBeGreaterThan(40);
  expect(s.measures[84].start).toBeCloseTo(g.t0 + 337 * g.seconds_per_beat, 9);
});

it('schedules exactly four quarter-note count-off strokes in any meter and playback rate',()=>{
  for(const [beats,denominator] of [[4,4],[5,4],[6,8]]) for(const rate of [.5,1,1.2]) {
    const m={id:'m',regionId:'r',label:'1',beats,denominator,start:0,end:beats*60/94*4/denominator};
    const c=makeCycle(10,.23,m.end,rate,0,m,true);
    expect(c.count).toBe(4);expect(c.beats).toBe(4);
    expect(c.countAt).toBe(10);
    expect(c.countBeatSeconds).toBeCloseTo(60/94/rate);
    expect(c.musicAt).toBeCloseTo(10+4*60/94/rate);
    expect(cyclePosition(c,c.musicAt)).toBe(.23);
  }
});
