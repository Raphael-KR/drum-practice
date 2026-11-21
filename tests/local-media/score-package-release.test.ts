import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import JSZip from "jszip";
import {
  readScorePackage,
  createScorePackage,
} from "../../src/modules/library/score-package";

it("keeps the current source-only package free of obsolete SVG caches", async () => {
  const input = readFileSync("public/scores/red-sunset.drumscore");
  const zip = await JSZip.loadAsync(input);
  const manifest = JSON.parse(await zip.file("manifest.json")!.async("string"));
  expect(manifest.version).toBe(2);
  expect(manifest.pages).toEqual([]);
  expect(manifest.song.regions).toEqual([]);
  const original = await readScorePackage(new Blob([input]));
  const restored = await readScorePackage(await createScorePackage(original));
  expect(restored.song).toEqual(original.song);
  expect(restored.canonicalXML).toBe(original.canonicalXML);
  expect(await restored.audio.arrayBuffer()).toEqual(
    await original.audio.arrayBuffer(),
  );
  expect(await restored.pdf.text()).toBe(original.canonicalXML);
  expect(restored.pages).toEqual([]);
}, 30000);
