// @vitest-environment jsdom
import { it, expect, vi } from "vitest";
import { webcrypto } from "node:crypto";
import { Blob as NativeBlob } from "node:buffer";
import { readFileSync } from "node:fs";
import {
  writeCanonical,
  readCanonical,
  ensureCanonical,
  verifyCanonicalAudio,
  vocalLyrics,
} from "../src/canonical-xml";
import { migrateLyricPositions, projectLyrics } from "../src/lyric-score";
import { parseMusicXML } from "../src/musicxml";
const song = () => JSON.parse(readFileSync("public/demo/song.json", "utf8"));
it("migrates all lyric starts and restores from XML, disregarding poisoned cache values", () => {
  const s = song();
  migrateLyricPositions(s);
  const positions = s.lyrics.map((l: any) => ({ ...l.scorePosition }));
  const xml = writeCanonical(s);
  expect(xml).toContain("가사 리듬");
  expect(xml).not.toContain('"time":');
  const copy = structuredClone(s);
  copy.lyrics = [];
  copy.title = "wrong";
  readCanonical(xml, copy);
  expect(copy.lyrics.map((l: any) => l.scorePosition)).toEqual(positions);
  expect(copy.title).toBe(s.title);
  expect(copy.lyrics.map((l: any) => l.text)).toEqual(
    s.lyrics.map((l: any) => l.text),
  );
});
it("keeps musical positions independent of audio alignment and handles mixed meter", () => {
  const s = song();
  migrateLyricPositions(s);
  const p = structuredClone(s.lyrics[0].scorePosition),
    before = s.lyrics[0].time;
  s.measures.forEach((m: any) => {
    m.start += 5;
    m.end += 5;
  });
  projectLyrics(s);
  expect(s.lyrics[0].scorePosition).toEqual(p);
  expect(s.lyrics[0].time).toBeCloseTo(before + 5);
  const copy = structuredClone(s);
  readCanonical(writeCanonical(s), copy);
  expect(copy.measures).toEqual(s.measures);
});
it("preserves source notation and unknown extensions while replacing owned lyric part", () => {
  const s = song();
  s.originalTitle = "原題";
  s.title = "표시";
  s.composer = "작곡";
  s.lyricist = "작사";
  const base =
    '<score-partwise version="4.0"><identification><miscellaneous><miscellaneous-field name="foreign">keep me</miscellaneous-field></miscellaneous></identification><part-list><score-part id="P1"><part-name>Drums</part-name></score-part></part-list><part id="P1"><measure number="1"><note><rest/><duration>4</duration></note></measure></part></score-partwise>';
  const out = writeCanonical(s, base),
    again = writeCanonical(s, out),
    d = new DOMParser().parseFromString(again, "application/xml");
  expect(d.querySelectorAll("part#DrumPracticeLyrics")).toHaveLength(1);
  expect(d.querySelector("part#P1")!.outerHTML).toContain(
    "<duration>4</duration>",
  );
  expect(again).toContain("keep me");
  const c = structuredClone(s);
  readCanonical(again, c);
  expect(c.composer).toBe("작곡");
  expect(c.originalTitle).toBe("原題");
});
it("preserves overlapping syllables and a duration crossing a barline", () => {
  const s = song();
  s.lyrics = [
    {
      id: "a",
      text: "al-",
      confirmed: true,
      time: 0,
      end: 0,
      scorePosition: {
        measureId: s.measures[0].id,
        quarterOffset: 3.5,
        durationQuarters: 1,
      },
    },
    {
      id: "b",
      text: "ways",
      confirmed: false,
      time: 0,
      end: 0,
      scorePosition: {
        measureId: s.measures[0].id,
        quarterOffset: 3.5,
        durationQuarters: 0.25,
      },
    },
  ];
  projectLyrics(s);
  const xml = writeCanonical(s),
    copy = structuredClone(s);
  readCanonical(xml, copy);
  expect(copy.lyrics).toEqual(s.lyrics);
});
it("imports exact vocal triplet rhythm without snapping it to a quarter-beat grid", () => {
  const s = song();
  const parsed = {
    measures: s.measures,
    lyrics: [{ measure: 0, beat: 1 / 3, duration: 2 / 3, text: "나" }],
  } as any;
  s.lyrics = vocalLyrics(s, parsed);
  projectLyrics(s);
  expect(s.lyrics[0].scorePosition.quarterOffset).toBeCloseTo(1 / 3);
  const c = structuredClone(s);
  readCanonical(writeCanonical(s), c);
  expect(c.lyrics[0].scorePosition).toEqual(s.lyrics[0].scorePosition);
  expect(() => vocalLyrics(s, { ...parsed, measures: [] })).toThrow("마디");
});
it("uses the independently timed lyric part as valid importable MusicXML", () => {
  const s = song(),
    parsed = parseMusicXML(writeCanonical(s), "DrumPracticeLyrics");
  expect(parsed.measures).toHaveLength(s.measures.length);
  expect(parsed.lyrics).toHaveLength(s.lyrics.length);
});
it("binds audio anchors to audio bytes", async () => {
  vi.stubGlobal("crypto", webcrypto);
  const s = song(),
    r = {
      song: s,
      pdf: new NativeBlob(["pdf"]),
      audio: new NativeBlob(["audio"]),
      pages: [],
      canonicalXML: undefined,
    } as any;
  await ensureCanonical(r);
  await verifyCanonicalAudio(r);
  r.audio = new NativeBlob(["other"]);
  await expect(verifyCanonicalAudio(r)).rejects.toThrow("음원");
});
it('preserves canonical XML through format switching, storage and portable packing',async()=>{
 vi.stubGlobal('Blob',NativeBlob);
 const {saveRecord,allRecords,deleteRecord}=await import('../src/storage');
 const {packSong,unpackSong}=await import('../src/portable');
 const {activeScore,useScore}=await import('../src/song-scores');
 const {indexedDB}=await import('fake-indexeddb');vi.stubGlobal('indexedDB',indexedDB);
 const s=song();s.id='canonical-storage-qa';const r={song:s,pdf:new NativeBlob(['pdf']),audio:new NativeBlob(['audio']),pages:Array.from({length:s.pageCount},()=>new NativeBlob(['page'])),canonicalXML:writeCanonical(s)} as any;
 await saveRecord(r);const restored=(await allRecords()).find(r=>r.song.id===s.id)!;
 expect(restored.canonicalXML).toBe(r.canonicalXML);expect(unpackSong(await packSong(restored)).canonicalXML).toBe(r.canonicalXML);expect(useScore(restored,activeScore(restored)).canonicalXML).toBe(r.canonicalXML);await deleteRecord(s.id);
});
it('reimports the app MusicXML into new geometry while keeping its musical IDs',async()=>{
 const {importedCanonical}=await import('../src/canonical-xml');const s=song(),xml=writeCanonical(s),fresh=structuredClone(s);fresh.measures.forEach((m:any,i:number)=>m.id='new-'+i);fresh.lyrics=[];const canonical=importedCanonical(xml,fresh)!;readCanonical(canonical,fresh);expect(fresh.lyrics.map((l:any)=>l.scorePosition)).toEqual(s.lyrics.map((l:any)=>l.scorePosition));
});
