import { expect, it } from "vitest";
import { defaults, type Song } from "../../src/model/model";
import {
  lyricAxis,
  mergeLyrics,
  moveLyric,
  splitLyrics,
} from "../../src/apps/editor/lyric-editing";
import { projectLyrics } from "../../src/modules/lyrics/lyric-score";

function song(): Song {
  const s: Song = {
    version: 1,
    id: "lyric-edit",
    title: "Edit",
    bpm: 60,
    firstBeat: 0,
    measures: [
      {
        id: "m1",
        label: "1",
        regionId: "r1",
        beats: 4,
        denominator: 4,
        start: 0,
        end: 4,
      },
      {
        id: "m2",
        label: "2",
        regionId: "r2",
        beats: 5,
        denominator: 4,
        start: 4,
        end: 9,
      },
    ],
    regions: [],
    lyrics: [
      {
        id: "a",
        text: "once",
        time: 0,
        end: 0,
        confirmed: true,
        scorePosition: {
          measureId: "m1",
          quarterOffset: 3.5,
          durationQuarters: 0.25,
        },
      },
      {
        id: "b",
        text: "again",
        time: 0,
        end: 0,
        confirmed: true,
        scorePosition: {
          measureId: "m2",
          quarterOffset: 0,
          durationQuarters: 0.25,
        },
      },
      {
        id: "c",
        text: "bright",
        time: 0,
        end: 0,
        confirmed: false,
        scorePosition: {
          measureId: "m2",
          quarterOffset: 1,
          durationQuarters: 0.25,
        },
      },
    ],
    markers: [],
    loops: [],
    settings: defaults(),
    audioName: "",
    pdfName: "",
    pageCount: 0,
  };
  projectLyrics(s);
  return s;
}
it("merges across a barline and restores exact component timing after a group move", () => {
  const source = song(),
    before = structuredClone(source);
  const merged = mergeLyrics(source, ["a", "b"]);
  expect(merged.lyrics[0].text).toBe("once again");
  const grouped = { ...source, lyrics: merged.lyrics };
  grouped.lyrics = moveLyric(grouped, "a", 4, 64, merged.groups);
  const result = splitLyrics(grouped, ["a"], merged.groups);
  expect(result.lyrics.map((l) => lyricAxis(source).at(l))).toEqual([
    4, 4.5, 5,
  ]);
  expect(result.lyrics.map((l) => l.text)).toEqual(["once", "again", "bright"]);
  expect(result.groups).toEqual({});
  expect(source).toEqual(before);
});
it("moves subsequent collisions on the chosen grid and fails atomically at song end", () => {
  const source = song(),
    before = structuredClone(source);
  const moved = moveLyric(source, "a", 5, 64);
  expect(moved.map((l) => lyricAxis(source).at(l))).toEqual([5, 5.0625, 5.125]);
  expect(moved.map((l) => l.time)).toEqual([5, 5.0625, 5.125]);
  expect(() => moveLyric(source, "a", 8.75, 64)).toThrow();
  expect(source).toEqual(before);
  expect(() => mergeLyrics(source, ["a", "c"])).toThrow();
});
