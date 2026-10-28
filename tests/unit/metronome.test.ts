import { describe, expect, it } from "vitest";
import { defaults, type Song } from "../../src/model/model";
import {
  metronomeEvents,
  metronomeMode,
  metronomeQuarterAt,
  nextMetronomeMode,
  normalizeMetronomeSettings,
  setMetronomeMode,
} from "../../src/model/metronome";

function song(signatures: [number, number][]): Song {
  let time = 0;
  return {
    version: 1,
    id: "metronome",
    title: "test",
    bpm: 120,
    firstBeat: 0,
    audioName: "",
    pdfName: "",
    pageCount: 0,
    regions: [],
    lyrics: [],
    markers: [],
    loops: [],
    settings: defaults(),
    measures: signatures.map(([beats, denominator], index) => {
      const start = time;
      time += ((beats * 4) / denominator) * 0.5;
      return {
        id: String(index),
        regionId: "",
        label: String(index + 1),
        beats,
        denominator,
        start,
        end: time,
      };
    }),
  };
}

describe("metronome musical grid", () => {
  it.each([
    [4, 4, 4],
    [3, 4, 3],
    [6, 8, 3],
    [2, 2, 4],
  ])(
    "%s/%s uses literal quarter/eighth intervals",
    (beats, denominator, quarters) => {
      const s = song([[beats, denominator]]);
      expect(metronomeEvents(s, 0, 10)).toEqual(
        Array.from({ length: quarters }, (_, i) => ({
          time: i * 0.5,
          accent: i === 0,
        })),
      );
      s.settings.clickDivision = 8;
      expect(metronomeEvents(s, 0, 10)).toEqual(
        Array.from({ length: quarters * 2 }, (_, i) => ({
          time: i * 0.25,
          accent: i % 2 === 0,
        })),
      );
    },
  );
  it("continues the grid and alternating sounds across odd/mixed bars", () => {
    const s = song([
      [3, 8],
      [5, 16],
      [3, 4],
    ]);
    expect(metronomeEvents(s, 0, 10).map((e) => e.time)).toEqual([
      0, 0.5, 1, 1.5, 2, 2.5,
    ]);
    expect(metronomeEvents(s, 0, 10).filter((e) => e.accent)).toEqual([
      { time: 0, accent: true },
    ]);
    s.settings.clickDivision = 8;
    expect(metronomeEvents(s, 0, 10).map((e) => e.accent)).toEqual(
      Array.from({ length: 12 }, (_, i) => i % 2 === 0),
    );
  });
  it.each([
    [3, 8],
    [5, 16],
  ])(
    "keeps phase over repeated %s/%s source intervals",
    (beats, denominator) => {
      const s = song([[beats, denominator]]),
        end = s.measures[0].end;
      const quarters = metronomeQuarterAt(s, end);
      for (const division of [4, 8] as const) {
        s.settings.clickDivision = division;
        const clicks = Array.from({ length: 4 }, (_, cycle) =>
          metronomeEvents(s, 0, end, cycle * quarters).map((e) => ({
            ...e,
            time: e.time + cycle * end,
          })),
        ).flat();
        expect(clicks.map((e) => e.time)).toEqual(
          Array.from(
            { length: Math.ceil((4 * quarters * division) / 4) },
            (_, i) => (i * 2) / division,
          ),
        );
        if (division === 8)
          expect(clicks.map((e) => e.accent)).toEqual(
            clicks.map((_, i) => i % 2 === 0),
          );
      }
    },
  );
  it("interpolates recorded beats, skips the prelude, and excludes the interval end", () => {
    const s = song([[4, 4]]);
    Object.assign(s.measures[0], {
      start: 1,
      end: 3.4,
      beatTimes: [1, 1.4, 2, 2.8],
    });
    s.measures.unshift({
      ...s.measures[0],
      id: "prelude",
      start: 0,
      end: 1,
      beatTimes: undefined,
      audioPrelude: true,
    });
    s.settings.clickDivision = 8;
    const events = metronomeEvents(s, 0, 2);
    expect(events.map((e) => e.time)).toEqual([1, 1.2, 1.4, 1.7]);
    expect(metronomeQuarterAt(s, 1.7)).toBeCloseTo(1.5);
    expect(metronomeEvents(s, 1.5, 2).map((e) => e.time)).toEqual([1.7]);
  });
});

describe("metronome modes and compatible settings", () => {
  it("cycles via one setter, preserving the stored subdivision when turned off", () => {
    const settings = defaults();
    expect(setMetronomeMode(settings, "quarter")).toBe(false);
    for (const mode of ["eighth", "off", "quarter"] as const) {
      expect(nextMetronomeMode(settings)).toBe(mode);
      expect(setMetronomeMode(settings, mode)).toBe(true);
      expect(metronomeMode(settings)).toBe(mode);
      expect(setMetronomeMode(settings, mode)).toBe(false);
    }
  });
  it.each([undefined, 4, 8])(
    "preserves compatible division %s without reporting",
    (division) => {
      const s = { settings: { click: false, clickDivision: division } };
      expect(normalizeMetronomeSettings(s)).toEqual({
        song: s,
        corrections: [],
      });
      expect(normalizeMetronomeSettings(s).song).toBe(s);
    },
  );
  it.each([null, "8", 16, {}, []])(
    "corrects only invalid division %s on a copy",
    (division) => {
      const source = {
        id: "legacy",
        settings: {
          click: false,
          clickDivision: division,
          rate: 0.75,
          clickVolume: 0.6,
        },
      };
      const result = normalizeMetronomeSettings(source);
      expect(result.song).toEqual({
        ...source,
        settings: { ...source.settings, clickDivision: 4 },
      });
      expect(source.settings.clickDivision).toBe(division);
      expect(result.corrections).toHaveLength(1);
      expect(result.corrections[0]).toMatchObject({
        songId: "legacy",
        field: "settings.clickDivision",
        expected: "4 | 8",
        applied: 4,
      });
    },
  );
});
