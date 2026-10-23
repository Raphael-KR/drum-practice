import { beforeAll, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import JSZip from "jszip";
import { JSDOM } from "jsdom";
import { compactScorePackage } from "../../scripts/release/compact-score-packages.mjs";
import { readScorePackage } from "../../src/modules/library/score-package";

interface PackageAsset {
  path: string;
  type: string;
  size: number;
}
interface PackageManifest {
  pages: PackageAsset[];
  otherScores: { pages: PackageAsset[] }[];
}

beforeAll(() => {
  const { window } = new JSDOM();
  Object.assign(globalThis, {
    DOMParser: window.DOMParser,
    XMLSerializer: window.XMLSerializer,
  });
});

it("removes only the disposable timeline from the preserved actual score package", async () => {
  const input = readFileSync(
    "data/production/red-sunset/final/build-03/red-sunset.drumscore",
  );
  const result = await compactScorePackage(input);
  expect(result.changes.length).toBeGreaterThan(0);
  expect(result.bytes.length).toBeLessThan(input.length);
  const before = await JSZip.loadAsync(input);
  const after = await JSZip.loadAsync(result.bytes);
  expect(Object.keys(after.files)).toEqual(Object.keys(before.files));
  const a = JSON.parse(
    await before.file("manifest.json")!.async("string"),
  ) as PackageManifest;
  const b = JSON.parse(
    await after.file("manifest.json")!.async("string"),
  ) as PackageManifest;
  for (const change of result.changes) {
    const descriptor = [
      ...a.pages,
      ...a.otherScores.flatMap((s) => s.pages),
    ].find((p) => p.path === change.path)!;
    const decode = (bytes: Uint8Array) =>
      descriptor.type.endsWith("svg+gzip")
        ? gunzipSync(bytes).toString("utf8")
        : new TextDecoder().decode(bytes);
    const old = new DOMParser().parseFromString(
      decode(await before.file(change.path)!.async("uint8array")),
      "image/svg+xml",
    );
    const current = new DOMParser().parseFromString(
      decode(await after.file(change.path)!.async("uint8array")),
      "image/svg+xml",
    );
    const caches = old.querySelectorAll('metadata[data-ribbon-timeline="1"]');
    expect(caches.length).toBe(change.removed);
    caches.forEach((e) => e.remove());
    expect(new XMLSerializer().serializeToString(current)).toBe(
      new XMLSerializer().serializeToString(old),
    );
  }
  for (const entry of Object.keys(before.files)) {
    if (
      entry === "manifest.json" ||
      result.changes.some((c: { path: string }) => c.path === entry)
    )
      continue;
    expect(await after.file(entry)!.async("uint8array")).toEqual(
      await before.file(entry)!.async("uint8array"),
    );
  }
  for (const change of result.changes) {
    const groups = [b.pages, ...b.otherScores.map((s) => s.pages)];
    groups.flat().find((p) => p.path === change.path)!.size = change.before;
  }
  expect(b).toEqual(a);
  const original = await readScorePackage(new Blob([input]));
  const restored = await readScorePackage(
    new Blob([new Uint8Array(result.bytes)]),
  );
  expect(restored.song).toEqual(original.song);
  expect(restored.canonicalXML).toBe(original.canonicalXML);
  const repeated = await compactScorePackage(result.bytes);
  expect(repeated.changes).toEqual([]);
  expect(repeated.bytes).toBe(result.bytes);
}, 30000);
