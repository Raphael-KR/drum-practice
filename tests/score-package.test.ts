import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import JSZip from "jszip";
import {
  createScorePackage,
  readScorePackage,
  scoreStructureSignature,
} from "../src/score-package";
import type { RecordData } from "../src/storage";
function fixture(): RecordData {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  song.scoreFormat = "pdf";
  return {
    song,
    canonicalXML: "<score-partwise/>",
    pdf: new Blob(["pdf"], { type: "application/pdf" }),
    audio: new Blob(["audio"], { type: "audio/mpeg" }),
    pages: Array.from(
      { length: song.pageCount },
      () => new Blob(["page"], { type: "image/png" }),
    ),
  };
}
async function changed(change: (zip: JSZip, m: any) => void) {
  const zip = await JSZip.loadAsync(
    await (await createScorePackage(fixture())).arrayBuffer(),
  );
  const m = JSON.parse(await zip.file("manifest.json")!.async("string"));
  change(zip, m);
  zip.file("manifest.json", JSON.stringify(m));
  return new Blob([
    new Uint8Array(await zip.generateAsync({ type: "uint8array" })),
  ]);
}
it("round trips complete song, binary media, canonical source and alternate geometry", async () => {
  const r = fixture();
  r.otherScores = [
    {
      format: "musicxml",
      name: "score.musicxml",
      source: new Blob(["xml"], { type: "application/xml" }),
      pages: r.pages.map(() => new Blob(["svg"], { type: "image/svg+xml" })),
      regions: structuredClone(r.song.regions),
      measures: r.song.measures.map(({ id, regionId, beats, denominator }) => ({
        id,
        regionId,
        beats,
        denominator,
      })),
    },
  ];
  const loaded = await readScorePackage(await createScorePackage(r));
  expect(loaded.song).toEqual(r.song);
  expect(loaded.canonicalXML).toBe(r.canonicalXML);
  expect(await loaded.audio.text()).toBe("audio");
  expect(await loaded.otherScores![0].source.text()).toBe("xml");
  expect(loaded.otherScores![0].measures).toEqual(r.otherScores[0].measures);
  expect(loaded.pages).toHaveLength(r.pages.length);
});
it("signature ignores timing and title but detects changed meter/order/id", () => {
  const s = fixture().song,
    copy = structuredClone(s);
  copy.title = "edited";
  copy.measures[0].start += 0.1;
  expect(scoreStructureSignature(copy)).toBe(scoreStructureSignature(s));
  copy.measures[0].beats++;
  expect(scoreStructureSignature(copy)).not.toBe(scoreStructureSignature(s));
});
it.each([
  "version",
  "count",
  "mime",
  "missing",
  "extra",
  "size",
  "song",
  "traversal",
])("rejects malformed %s", async (kind) => {
  const blob = await changed((z, m) => {
    if (kind === "version") m.version = 2;
    if (kind === "count") m.pages = [];
    if (kind === "mime") m.audio.type = "text/html";
    if (kind === "missing") z.remove(m.audio.path);
    if (kind === "extra") z.file("unexpected", "extra");
    if (kind === "size") m.audio.size++;
    if (kind === "song") m.song.bpm = 0;
    if (kind === "traversal")
      z.file("../escape", "bad", { createFolders: false });
  });
  await expect(readScorePackage(blob)).rejects.toThrow();
});
it("rejects declared oversized ZIP entries before decompression", async () => {
  const data = new Uint8Array(
    await (await createScorePackage(fixture())).arrayBuffer(),
  );
  const v = new DataView(data.buffer);
  for (let i = 0; i < data.length - 46; i++)
    if (v.getUint32(i, true) === 0x02014b50) {
      v.setUint32(i + 24, 0x70000000, true);
      break;
    }
  await expect(readScorePackage(new Blob([data]))).rejects.toThrow();
});
it("rejects non ZIP and empty sources", async () => {
  await expect(readScorePackage(new Blob(["no"]))).rejects.toThrow();
  const r = fixture();
  r.audio = new Blob([], { type: "audio/mpeg" });
  await expect(createScorePackage(r)).rejects.toThrow();
});
it("rejects forged smaller inflated size, duplicate paths and unsupported compression", async () => {
  const original = new Uint8Array(
    await (await createScorePackage(fixture())).arrayBuffer(),
  );
  for (const mode of ["size", "duplicate", "method"]) {
    const data = original.slice(),
      v = new DataView(data.buffer);
    const offsets: number[] = [];
    for (let i = 0; i < data.length - 46; i++)
      if (v.getUint32(i, true) === 0x02014b50) offsets.push(i);
    if (mode === "size") v.setUint32(offsets[offsets.length - 1] + 24, 1, true);
    if (mode === "method") v.setUint16(offsets[0] + 10, 99, true);
    if (mode === "duplicate") {
      const a = offsets.find(
        (i) =>
          new TextDecoder().decode(
            data.subarray(i + 46, i + 46 + v.getUint16(i + 28, true)),
          ) === "score/pages/0",
      )!;
      const b = offsets.find(
        (i) =>
          new TextDecoder().decode(
            data.subarray(i + 46, i + 46 + v.getUint16(i + 28, true)),
          ) === "score/pages/1",
      )!;
      data.set(
        data.subarray(a + 46, a + 46 + v.getUint16(a + 28, true)),
        b + 46,
      );
    }
    await expect(readScorePackage(new Blob([data]))).rejects.toThrow();
  }
});
it.each(["", "application/zip", "application/vnd.recordare.musicxml"])(
  "normalizes verified MXL bytes (%s) without modifying original bytes or canonical XML",
  async (type) => {
    const record = fixture();
    const mxl = new JSZip();
    mxl.file(
      "META-INF/container.xml",
      '<container><rootfiles><rootfile full-path="score.musicxml"/></rootfiles></container>',
    );
    mxl.file(
      "score.musicxml",
      '<?xml version="1.0"?><score-partwise version="4.0"><part-list/></score-partwise>',
    );
    const bytes = await mxl.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
    });
    record.pdf = new Blob([new Uint8Array(bytes)], { type });
    record.song.scoreFormat = "musicxml";
    record.song.pdfName = "score.mxl";
    record.pages = record.pages.map(
      () =>
        new Blob(['<svg xmlns="http://www.w3.org/2000/svg"/>'], {
          type: "image/svg+xml",
        }),
    );
    const result = await readScorePackage(await createScorePackage(record));
    expect(result.pdf.type).toBe("application/vnd.recordare.musicxml");
    expect(new Uint8Array(await result.pdf.arrayBuffer())).toEqual(bytes);
    expect(result.canonicalXML).toBe(record.canonicalXML);
  },
);
it("infers blank PDF and WAV MIME from signatures, preserves exact bytes", async () => {
  const record = fixture();
  record.pdf = new Blob(["%PDF-1.7\n%fixture"]);
  const wav = new Uint8Array(44);
  const dv = new DataView(wav.buffer);
  wav.set(new TextEncoder().encode("RIFF"));
  dv.setUint32(4, 36, true);
  wav.set(new TextEncoder().encode("WAVEfmt "), 8);
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true);
  dv.setUint32(24, 44100, true);
  dv.setUint32(28, 88200, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  wav.set(new TextEncoder().encode("data"), 36);
  record.audio = new Blob([wav]);
  const result = await readScorePackage(await createScorePackage(record));
  expect(result.pdf.type).toBe("application/pdf");
  expect(result.audio.type).toBe("audio/wav");
  expect(new Uint8Array(await result.audio.arrayBuffer())).toEqual(wav);
});
it("does not infer audio MIME just from filename or accept arbitrary MXL zip", async () => {
  const record = fixture();
  record.audio = new Blob(["not audio"]);
  record.song.audioName = "fake.mp3";
  await expect(createScorePackage(record)).rejects.toThrow();
  record.audio = fixture().audio;
  record.song.scoreFormat = "musicxml";
  const zip = new JSZip();
  zip.file("wrong.xml", "<html/>");
  record.pdf = new Blob(
    [new Uint8Array(await zip.generateAsync({ type: "uint8array" }))],
    { type: "application/zip" },
  );
  await expect(createScorePackage(record)).rejects.toThrow();
});
