import { beforeAll, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { readScorePackage } from "../../src/modules/library/score-package";
import { metadataFromXML } from "../../src/modules/score/canonical-xml";
import { canonicalManifest } from "../../src/modules/score/canonical-metadata";
// Production helpers are shared with browser entrypoints; real saved assets only.
import {
  sha,
  createVerifiedPackage,
  verifyPackage,
  prepareCanonical,
  bindRenderedScore,
} from "../../tools/score-production/musicxml/common/package.mjs";

beforeAll(() => {
  const window = new JSDOM().window;
  globalThis.DOMParser = window.DOMParser;
  globalThis.XMLSerializer = window.XMLSerializer;
});
const paths = [
  "data/production/loveholic/final/Loveholic.drumscore",
  "data/production/preplay-warmup/final/preplay-warmup.drumscore",
  "data/production/tom-moving/final/tom-moving.drumscore",
  "data/production/red-sunset/final/build-03/red-sunset.drumscore",
];
async function load(path: string) {
  return readScorePackage(new Blob([readFileSync(path)]));
}
for (const path of paths) {
  it(`preserves every source, page, alternate, lyric and timing: ${path}`, async () => {
    const original = await load(path);
    const current = await readScorePackage(
      await createVerifiedPackage(original),
    );
    await verifyPackage(original, current);
    const song = structuredClone(original.song);
    const source = original.canonicalXML!;
    const audioHash = await sha(original.audio);
    const result = prepareCanonical(song, source, audioHash);
    expect(metadataFromXML(result.canonicalXML)).toEqual({
      title: song.title,
      originalTitle: song.originalTitle || song.title,
      artist: song.artist || "",
      composer: song.composer || "",
      lyricist: song.lyricist || "",
    });
    expect(result.restored.measures).toEqual(song.measures);
    expect(result.restored.lyrics).toEqual(song.lyrics);
    expect(result.restored.measureLyrics).toEqual(song.measureLyrics);
    expect(
      canonicalManifest(
        new DOMParser().parseFromString(result.canonicalXML, "application/xml"),
      )!.audioSHA256,
    ).toBe(audioHash);
    const before = structuredClone(song.measures);
    bindRenderedScore(song, {
      regions: original.song.regions,
      pages: original.pages,
    });
    expect(song.measures).toEqual(before);
  }, 30000);
}
it("detects substitution by a different real score or its pages", async () => {
  const a = await load(paths[1]);
  const b = await load(paths[2]);
  await expect(verifyPackage(a, b)).rejects.toThrow("song");
  await expect(verifyPackage(a, { ...a, audio: b.audio })).rejects.toThrow(
    "audio",
  );
  await expect(verifyPackage(a, { ...a, pages: b.pages })).rejects.toThrow(
    "pages",
  );
  const substitutedPages = [...a.pages];
  substitutedPages[substitutedPages.length - 1] = b.pages[0];
  await expect(
    verifyPackage(a, { ...a, pages: substitutedPages }),
  ).rejects.toThrow("pages[");
  expect(() =>
    bindRenderedScore(structuredClone(a.song), {
      regions: b.song.regions,
      pages: b.pages,
    }),
  ).toThrow("measure count");
});
