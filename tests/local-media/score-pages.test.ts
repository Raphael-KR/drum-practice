import { it, expect } from "vitest";
import {
  compressSVG,
  displayPage,
  SVG_GZIP,
} from "../../src/modules/score/score-pages";
import {
  packSong,
  unpackSong,
} from "../../src/platform/storage/record-serialization";
import { readFileSync } from "node:fs";
import { saveRecord, allRecords } from "../../src/platform/storage/storage";
import "fake-indexeddb/auto";
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text>가사</text></svg>';
it("compresses SVG losslessly through storage and backup serialization", async () => {
  const page = await compressSVG(svg);
  expect(page.type).toBe(SVG_GZIP);
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  song.id = "svg-roundtrip";
  const record = {
    song,
    pdf: new Blob(["xml"]),
    audio: new Blob(["audio"]),
    pages: Array.from({ length: song.pageCount }, () => page),
  };
  await saveRecord(record);
  const saved = (await allRecords()).find((r) => r.song.id === song.id)!;
  const restored = unpackSong(await packSong(saved));
  for (const p of restored.pages) {
    const image = await displayPage(p);
    expect(image.type).toBe("image/svg+xml");
    expect(await image.text()).toBe(svg);
    expect(await displayPage(image)).toBe(image);
  }
});
it("keeps legacy PNG bytes and rejects broken compressed data", async () => {
  const png = new Blob([new Uint8Array([137, 80, 78, 71])], {
    type: "image/png",
  });
  const materialized = await displayPage(png);
  expect(materialized).not.toBe(png);
  expect(new Uint8Array(await materialized.arrayBuffer())).toEqual(
    new Uint8Array([137, 80, 78, 71]),
  );
  await expect(
    displayPage(new Blob(["broken"], { type: SVG_GZIP })),
  ).rejects.toThrow();
});
