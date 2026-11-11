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

it("갑자기: upgrades the real v1 score without changing its lyric identities or timing", () => {
  expect(canonicalManifest(documentOf(legacySource))!.version).toBe(1);
  const candidate = writeCanonical(structuredClone(song), legacySource);
  const restored = structuredClone(song);
  restored.lyrics = [];
  readCanonical(candidate, restored);
  expect(restored.lyrics).toEqual(song.lyrics);
  expect(restored.measureLyrics).toEqual(song.measureLyrics);
  expect(restored.measures).toEqual(song.measures);
  const doc = documentOf(candidate);
  const before = canonicalManifest(documentOf(legacySource))!;
  const after = canonicalManifest(doc)!;
  expect(after.version).toBe(2);
  expect(after.partId).toBe("P1");
  expect(after.audioSHA256).toBe(before.audioSHA256);
  expect(new Set(after.lyrics.map((l) => l.voice)).size).toBe(1);
  expect(doc.querySelectorAll("part")).toHaveLength(1);
  expect(doc.querySelectorAll("part#P1 note > lyric > text")).toHaveLength(
    song.lyrics.length,
  );
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

it("갑자기: legacy SVG preparation uses the shared voice writer in a copy", () => {
  const { xml: prepared } = prepareScoreLyrics(legacySource, "P1");
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
  expect(canonicalManifest(documentOf(legacySource))!.version).toBe(1);
});
