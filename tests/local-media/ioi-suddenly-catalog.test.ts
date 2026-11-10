import { beforeAll, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { JSDOM } from "jsdom";
import { scoreCatalog } from "../../src/modules/library/score-catalog";
import {
  readScorePackage,
  createScorePackage,
} from "../../src/modules/library/score-package";
import { verifyPackage } from "../../tools/score-production/musicxml/common/package.mjs";
import { makeCycle, validateSong } from "../../src/model/model";
import type { RecordData } from "../../src/model/record";

let record: RecordData;
beforeAll(async () => {
  const { window } = new JSDOM();
  Object.assign(globalThis, {
    DOMParser: window.DOMParser,
    XMLSerializer: window.XMLSerializer,
  });
  const bytes = readFileSync("public/scores/ioi-suddenly.drumscore");
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(
    "487e607cdef9a7e7c36c49416d7cd1c6b158d4429c94ce6363da8990d97997b5",
  );
  record = await readScorePackage(new Blob([bytes]));
  const expectedXML =
    "4984e748a45468d91f1d5e2be0663a8ff758deb2871c3c6aaf0eea41af8dd8f4";
  expect(createHash("sha256").update(record.canonicalXML!).digest("hex")).toBe(
    expectedXML,
  );
  expect(
    createHash("sha256")
      .update(new Uint8Array(await record.pdf.arrayBuffer()))
      .digest("hex"),
  ).toBe(expectedXML);
});

it("offers the delivered score in the shared personal catalog and preserves a saved record", () => {
  const id = "ioi-suddenly-25750839";
  expect(scoreCatalog([]).find((entry) => entry.id === id)).toMatchObject({
    category: "personal",
    bundled: { file: "scores/ioi-suddenly.drumscore" },
  });
  const entries = scoreCatalog([record]).filter((entry) => entry.id === id);
  expect(entries).toHaveLength(1);
  expect(entries[0].record).toBe(record);
  expect(record.song).toMatchObject({
    id,
    title: "갑자기",
    artist: "I.O.I",
    bpm: 117,
    firstBeat: 0.391,
  });
  expect(record.song.measures).toHaveLength(93);
  validateSong(record.song);
});

it("retains lyrics, all score assets and the unchanged recording through package readback", async () => {
  const reopened = await readScorePackage(await createScorePackage(record));
  await verifyPackage(record, reopened);
  expect(
    createHash("sha256")
      .update(new Uint8Array(await reopened.audio.arrayBuffer()))
      .digest("hex"),
  ).toBe("fc06ded4e04abb219401b84caf4be6a9be6dc45607e1234b5748e7aec20e8031");
}, 30000);

it("aligns four count-off beats with the selected score beat at slow, original and fast rates", () => {
  for (const rate of [0.5, 1, 1.2]) {
    for (const index of [0, 46, 92]) {
      const measure = record.song.measures[index];
      const from = index === 0 ? 0 : measure.start;
      const on = makeCycle(10, from, measure.end, rate, measure, true);
      const off = makeCycle(10, from, measure.end, rate, measure, false);
      expect(on.count).toBe(4);
      expect(on.musicAt + (measure.start - from) / rate).toBeCloseTo(
        on.countAt + 4 * on.countBeatSeconds,
        8,
      );
      expect(off.count).toBe(0);
      expect(off.musicAt).toBe(10);
      expect(on.endAt - on.musicAt).toBeCloseTo((measure.end - from) / rate, 8);
    }
  }
});
