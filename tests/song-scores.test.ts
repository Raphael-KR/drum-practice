import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { activeScore, songScores, useScore } from "../src/song-scores";
import {
  saveRecord,
  allRecords,
  deleteRecord,
  type RecordData,
} from "../src/storage";
import {
  packSong,
  unpackSong,
  packScores,
  unpackScores,
} from "../src/portable";
function fixture(): RecordData {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  song.id = "song-variants-test";
  return {
    song,
    pdf: new Blob(["original PDF"]),
    audio: new Blob(["audio"]),
    pages: Array.from({ length: song.pageCount }, () => new Blob(["image"])),
  };
}
function attach(r: RecordData) {
  const xml = activeScore(r);
  xml.format = "musicxml";
  xml.name = "score.musicxml";
  xml.source = new Blob(["XML"]);
  xml.regions = xml.regions.map((r) => ({ ...r, x: r.x + 0.001 }));
  return useScore(r, xml);
}
it("keeps one song with two real formats and shares the timeline, lyrics and practice state", () => {
  const original = fixture(),
    xml = attach(original);
  expect(songScores(original).map((s) => s.format)).toEqual(["pdf"]);
  expect(songScores(xml).map((s) => s.format)).toEqual(["pdf", "musicxml"]);
  expect(xml.song.id).toBe(original.song.id);
  expect(xml.song.lyrics).toEqual(original.song.lyrics);
  expect(xml.song.measures).toEqual(original.song.measures);
  xml.song.settings.rate = 0.8;
  xml.song.lyrics[0].text = "edited";
  const pdf = useScore(xml, songScores(xml)[0]);
  expect(pdf.song.regions).toEqual(original.song.regions);
  expect(pdf.song.lyrics[0].text).toBe("edited");
  expect(pdf.song.settings.rate).toBe(0.8);
  expect(songScores(attach(pdf))).toHaveLength(2);
});
it("preserves edits to active geometry and blocks incompatible measure structures", () => {
  const r = attach(fixture());
  r.song.regions[0].x += 0.002;
  const pdf = useScore(r, songScores(r)[0]);
  const xml = useScore(pdf, songScores(pdf)[1]);
  expect(xml.song.regions).toEqual(r.song.regions);
  pdf.song.measures[0].beats = 3;
  expect(() => useScore(pdf, songScores(pdf)[1])).toThrow("마디 구성");
});
it("round trips both formats in IndexedDB, HTML and backup encoding", async () => {
  const r = attach(fixture());
  await saveRecord(r);
  const saved = (await allRecords()).find((s) => s.song.id === r.song.id)!;
  expect(await saved.otherScores![0].source.text()).toBe("original PDF");
  expect(await saved.pdf.text()).toBe("XML");
  const html = unpackSong(JSON.parse(JSON.stringify(await packSong(saved))));
  expect(await html.otherScores![0].source.text()).toBe("original PDF");
  expect(html.otherScores![0].regions).toEqual(r.otherScores![0].regions);
  const backup = unpackScores(
    JSON.parse(JSON.stringify(await packScores(saved.otherScores))),
  );
  expect(await backup[0].pages[0].text()).toBe("image");
  await deleteRecord(r.song.id);
});
