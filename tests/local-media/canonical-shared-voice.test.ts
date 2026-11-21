// @vitest-environment jsdom
import { beforeAll, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import JSZip from "jszip";
import type { Song } from "../../src/model/model";
import {
  readCanonical,
  writeCanonical,
  hasDrumNotation,
} from "../../src/modules/score/canonical-xml";
import { canonicalManifest } from "../../src/modules/score/canonical-metadata";
import { removeLyricVoices } from "../../src/modules/score/canonical-lyric-voice";
import { parseMusicXML } from "../../src/modules/score/musicxml-parse";
import { prepareScoreLyrics } from "../../src/modules/score/score-lyrics";

function withoutLyricVoices(xml: string) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const data = canonicalManifest(doc)!;
  const part = doc.querySelector('part[id="P1"]')!;
  removeLyricVoices(
    part,
    data.lyrics.map((lyric) => lyric.voice),
  );
  return new XMLSerializer().serializeToString(doc);
}

let source: string;
const legacySource = readFileSync(
  "data/reference/test-fixtures/ioi-suddenly-canonical-v1.musicxml",
  "utf8",
);
let song: Song;
const documentOf = (xml: string) =>
  new DOMParser().parseFromString(xml, "application/xml");
beforeAll(async () => {
  const zip = await JSZip.loadAsync(
    readFileSync("public/scores/ioi-suddenly.drumscore"),
  );
  const manifest = JSON.parse(await zip.file("manifest.json")!.async("string"));
  source = manifest.canonicalXML;
  song = manifest.song;
  readCanonical(source, song);
});

it("갑자기: reads current groups and rejects the retired canonical format", () => {
  expect(() => canonicalManifest(documentOf(legacySource))).toThrow();
  const candidate = writeCanonical(structuredClone(song), source);
  const restored = structuredClone(song);
  restored.lyrics = [];
  readCanonical(candidate, restored);
  expect(restored.lyrics).toEqual(song.lyrics);
  expect(restored.measureLyrics).toEqual(song.measureLyrics);
  expect(restored.measures).toEqual(song.measures);
  expect(canonicalManifest(documentOf(candidate))!.version).toBe(3);
  expect(hasDrumNotation(candidate)).toBe(true);
});

it("갑자기: repeated saves neither duplicate lyrics nor delete drum notation", () => {
  const once = writeCanonical(structuredClone(song), source);
  const twice = writeCanonical(structuredClone(song), once);
  expect(twice).toBe(once);
  const playback = documentOf(withoutLyricVoices(twice));
  const originalDrums = documentOf(withoutLyricVoices(source)).querySelector(
    'part[id="P1"]',
  )!;
  expect(playback.querySelector('part[id="P1"]')!.outerHTML).toBe(
    originalDrums.outerHTML,
  );
});

it("갑자기: SVG preparation retains the current canonical groups", () => {
  const { xml: prepared } = prepareScoreLyrics(source, "P1");
  const rendered = parseMusicXML(prepared, "P1");
  expect(
    rendered.document.querySelectorAll("score-partwise > part"),
  ).toHaveLength(1);
  expect(rendered.partId).toBe("P1");
  expect(rendered.lyrics).toHaveLength(song.lyrics.length);
  for (const [i, lyric] of rendered.lyrics.entries()) {
    const expected = song.lyrics[i].scorePosition!;
    expect(song.measures[lyric.measure].id).toBe(expected.measureId);
    expect(lyric.beat).toBeCloseTo(expected.quarterOffset);
    expect(lyric.duration).toBeCloseTo(expected.durationQuarters);
  }
  expect(prepared).toBe(source);
});
