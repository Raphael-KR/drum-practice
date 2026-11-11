// @vitest-environment jsdom
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  writeCanonical,
  readCanonical,
} from "../../src/modules/score/canonical-xml";
import { validateSong, type Song } from "../../src/model/model";
import { projectLyrics } from "../../src/modules/lyrics/lyric-score";
import { prepareScoreLyrics } from "../../src/modules/score/score-lyrics";
const song = (): Song => {
  const s = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  s.lyrics = [];
  s.measureLyrics = [
    {
      id: "printed-1",
      measureId: s.measures[0].id,
      text: "가사 <원문>",
      placement: "measure-center",
    },
  ];
  return s;
};
it("restores measure-only lyrics from XML without creating timed lyric notes", () => {
  const s = song();
  const xml = writeCanonical(s);
  expect(
    new DOMParser()
      .parseFromString(xml, "application/xml")
      .querySelectorAll("note > lyric"),
  ).toHaveLength(0);
  const copy = structuredClone(s);
  copy.measureLyrics = [];
  readCanonical(xml, copy);
  expect(copy.measureLyrics).toEqual(s.measureLyrics);
  expect(copy.lyrics).toEqual([]);
  copy.measures.forEach((m) => {
    m.start += 5;
    m.end += 5;
  });
  projectLyrics(copy);
  expect(copy.measureLyrics).toEqual(s.measureLyrics);
  readCanonical(writeCanonical(copy, xml), copy);
  expect(copy.measureLyrics).toEqual(s.measureLyrics);
});
it("rejects invalid measure references and duplicate measure assignments", () => {
  const s = song();
  expect(() => validateSong(s)).not.toThrow();
  s.measureLyrics![0].measureId = "missing";
  expect(() => validateSong(s)).toThrow();
  expect(() => writeCanonical(s)).toThrow();
  const duplicate = song();
  duplicate.measureLyrics!.push({
    ...duplicate.measureLyrics![0],
    id: "different",
  });
  expect(() => validateSong(duplicate)).toThrow();
});
it("passes measure text from the canonical manifest to the shared SVG engraver", () => {
  const s = song();
  const xml = writeCanonical(s);
  const partId = new DOMParser()
    .parseFromString(xml, "application/xml")
    .querySelector("part")!.id;
  const prepared = prepareScoreLyrics(xml, partId);
  expect(prepared.xml).toBe(xml);
  expect([...prepared.texts]).toEqual([[0, "가사 <원문>"]]);
});
