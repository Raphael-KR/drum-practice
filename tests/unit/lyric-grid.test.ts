import { it, expect } from "vitest";
import {
  lyricMeasureId,
  enableLyricGrid,
  nearestQuarterBeat,
  synchronizeLyricGrid,
  setLyricGrid,
  lyricGridPoint,
  lyricGridStep,
  lyricGridTicks,
  lyricGridTickForMeasure,
} from "../../src/modules/lyrics/lyric-grid";
import type { Song } from "../../src/model/model";
const fixture = () =>
  ({
    measures: [
      { id: "a", label: "1", start: 0, end: 4, beats: 4, denominator: 4 },
      { id: "b", label: "2", start: 4, end: 9, beats: 5, denominator: 4 },
    ],
    lyrics: [
      { id: "x", text: "가", time: 1.14, end: 1.8, confirmed: true },
      { id: "y", text: "나", time: 1.18, end: 2, confirmed: false },
      { id: "z", text: "다", time: 3.94, end: 4.5, confirmed: false },
    ],
  }) as Song;
it("rounds to nearest quarter beat and carries to the following bar", () => {
  const s = fixture();
  expect(nearestQuarterBeat(s, 1.14).tick).toBe(5);
  expect(nearestQuarterBeat(s, 1.124).tick).toBe(4);
  expect(nearestQuarterBeat(s, 1.125).tick).toBe(5);
  expect(nearestQuarterBeat(s, 3.94)).toMatchObject({
    measure: { id: "b" },
    tick: 0,
    time: 4,
  });
  expect(nearestQuarterBeat(s, 8.8)).toMatchObject({
    measure: { id: "b" },
    tick: 19,
    time: 8.75,
  });
});
it("preserves source timing, co-located syllables and one archive across reloads", () => {
  const s = fixture();
  enableLyricGrid(s);
  expect(s.lyrics.map((l) => l.time)).toEqual([1.25, 1.25, 4]);
  expect(s.lyrics[0].originalTime).toBe(1.14);
  expect(s.lyrics[0].confirmed).toBe(true);
  expect(s.lyricArchive![0].lyrics[0].time).toBe(1.14);
  const first = JSON.stringify(s);
  enableLyricGrid(s);
  expect(JSON.stringify(s)).toBe(first);
});
it("keeps musical coordinates after a tempo/grid change and respects free timing", () => {
  const s = fixture();
  enableLyricGrid(s);
  s.lyrics[1].freeTiming = true;
  s.lyrics[1].time = 1.18;
  s.measures[0].end = 8;
  s.measures[1].start = 8;
  s.measures[1].end = 18;
  synchronizeLyricGrid(s);
  expect(s.lyrics.find((l) => l.id === "x")!.time).toBe(2.5);
  expect(s.lyrics.find((l) => l.id === "y")!.time).toBe(1.18);
  expect(s.lyrics.find((l) => l.id === "z")!.time).toBe(8);
});
it("rejects invalid grid selections", () => {
  const s = fixture();
  expect(() =>
    setLyricGrid(s, s.lyrics[0], { measureId: "a", tick: 1.2 }),
  ).toThrow();
  expect(() =>
    setLyricGrid(s, s.lyrics[0], { measureId: "missing", tick: 0 }),
  ).toThrow();
});

it("assigns a shared boundary once despite floating-point bar overlap", () => {
  const s = fixture();
  s.measures[0].end = 4.000000000000001;
  const l = { id: "ru", text: "루", time: 4, end: 4.5, confirmed: false };
  expect(
    s.measures.filter((m) => l.time >= m.start && l.time < m.end),
  ).toHaveLength(2);
  expect(lyricMeasureId(s, l)).toBe("b");
  expect(lyricMeasureId(s, { ...l, grid: { measureId: "b", tick: 0 } })).toBe(
    "b",
  );
  expect(lyricMeasureId(s, { ...l, grid: { measureId: "a", tick: 16 } })).toBe(
    "b",
  );
});

it.each([
  { beats: 4, denominator: 4, step: 0.25, count: 64, last: 15.75 },
  { beats: 6, denominator: 8, step: 0.5, count: 48, last: 23.5 },
])("offers exact 64th-note positions in $beats/$denominator", (meter) => {
  const s = fixture();
  const m = Object.assign(s.measures[0], {
    beats: meter.beats,
    denominator: meter.denominator,
  });
  const ticks = lyricGridTicks(m, 0);
  expect(lyricGridStep(m)).toBe(meter.step);
  expect(ticks).toHaveLength(meter.count);
  expect(ticks[1]).toBe(meter.step);
  expect(ticks.at(-1)).toBe(meter.last);

  const l = s.lyrics[0];
  l.scorePosition = {
    measureId: m.id,
    quarterOffset: 0,
    durationQuarters: 1 / 16,
  };
  setLyricGrid(s, l, { measureId: m.id, tick: meter.step });
  expect(l.scorePosition).toEqual({
    measureId: m.id,
    quarterOffset: 1 / 16,
    durationQuarters: 1 / 16,
  });
});

it("uses exact score positions over stale grid/time and retains triplet options", () => {
  const s = fixture();
  const l = s.lyrics[0];
  l.grid = { measureId: "b", tick: 0 };
  l.scorePosition = {
    measureId: "a",
    quarterOffset: 1 / 3,
    durationQuarters: 2 / 3,
  };
  expect(lyricGridPoint(s, l)).toEqual({ measureId: "a", tick: 4 / 3 });
  expect(lyricGridTicks(s.measures[0], 4 / 3)).toContain(4 / 3);
  setLyricGrid(s, l, { measureId: "a", tick: 8 / 3 });
  expect(l.scorePosition).toEqual({
    measureId: "a",
    quarterOffset: 2 / 3,
    durationQuarters: 2 / 3,
  });
});

it("keeps in-range final and fractional ticks when changing measures", () => {
  const m = fixture().measures[0];
  expect(lyricGridTickForMeasure(m, 15.75)).toBe(15.75);
  expect(lyricGridTickForMeasure(m, 4 / 3)).toBe(4 / 3);
  expect(lyricGridTickForMeasure(m, 20)).toBe(15.75);
});
