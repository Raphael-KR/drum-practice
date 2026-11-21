import { beforeAll, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { readScorePackage } from "../../src/modules/library/score-package";
import { useScore } from "../../src/modules/score/song-scores";
import { preservedScoreLayout } from "./preserved-score-layout";
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
const preservedPaths = [
  "data/production/loveholic/final/Loveholic.drumscore",
  "data/production/preplay-warmup/final/preplay-warmup.drumscore",
  "data/production/tom-moving/final/tom-moving.drumscore",
  "data/production/red-sunset/final/build-03/red-sunset.drumscore",
];
const paths = ["loveholic", "preplay-warmup", "tom-moving", "red-sunset"].map(
  (id) => `public/scores/${id}.drumscore`,
);
async function load(path: string) {
  return readScorePackage(new Blob([readFileSync(path)]));
}
for (const [index, path] of paths.entries()) {
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
    const layout = await preservedScoreLayout(preservedPaths[index]);
    bindRenderedScore(song, {
      regions: layout.song.regions,
      pages: layout.pages,
    });
    expect(song.measures).toEqual(
      before.map((m, i) => ({ ...m, regionId: layout.song.regions[i].id })),
    );
  }, 30000);
}
it("detects substitution by a different real score or its pages", async () => {
  const a = await load(paths[1]);
  const b = await load(paths[2]);
  await expect(verifyPackage(a, b)).rejects.toThrow("song");
  await expect(verifyPackage(a, { ...a, audio: b.audio })).rejects.toThrow(
    "audio",
  );
  // PDF assets remain part of source-only v2 packages and must still be compared.
  const pdfSource = await load(paths[0]),
    pdfOther = await load(paths[3]);
  const pdf = useScore(pdfSource, pdfSource.otherScores![0]);
  const otherPDF = useScore(pdfOther, pdfOther.otherScores![0]);
  await expect(
    verifyPackage(pdf, { ...pdf, pages: otherPDF.pages }),
  ).rejects.toThrow("pages");
  const substitutedPages = [...pdf.pages];
  substitutedPages[substitutedPages.length - 1] = otherPDF.pages[0];
  await expect(
    verifyPackage(pdf, { ...pdf, pages: substitutedPages }),
  ).rejects.toThrow("pages[");
  expect(() =>
    bindRenderedScore(structuredClone(a.song), {
      regions: b.song.regions,
      pages: b.pages,
    }),
  ).toThrow("measure count");
});
