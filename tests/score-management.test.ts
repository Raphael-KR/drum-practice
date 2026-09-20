// @vitest-environment jsdom
import { it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { Blob as NativeBlob } from "node:buffer";
import { EditHistory, retainRevision } from "../src/edit-history";
import { writeCanonical, readCanonical } from "../src/canonical-xml";
import { exportLibrary, importLibrary } from "../src/library-backup";
import { scoreChips, lyricDocument } from "../src/score-management";
vi.stubGlobal("Blob", NativeBlob);
const make = () => {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  return {
    song,
    pdf: new Blob(["PDF"], { type: "application/pdf" }),
    audio: new Blob(["audio"], { type: "audio/mpeg" }),
    pages: Array.from({ length: song.pageCount }, () => new Blob(["page"])),
  };
};
it("stores untimed text and sections in XML without manufacturing timing", () => {
  const r = make();
  r.song.lyrics = [];
  r.song.lyricText = "1절\nhello & <world>\n\n후렴\nagain";
  const xml = writeCanonical(r.song);
  const copy = structuredClone(r.song);
  delete copy.lyricText;
  readCanonical(xml, copy);
  expect(copy.lyricText).toBe(r.song.lyricText);
  expect(copy.lyrics).toEqual([]);
  expect(lyricDocument(r)).toContain("후렴");
  expect(scoreChips(r)).toContain("가사 있음");
});
it("undo/redo and saved revisions preserve old state and cap at ten", () => {
  const r = make(),
    h = new EditHistory(r);
  h.push(r);
  r.song.title = "changed";
  expect(h.changed(r)).toBe(true);
  const old = h.undo(r)!;
  expect(old.song.title).not.toBe("changed");
  expect(h.redo(old)!.song.title).toBe("changed");
  let versions: any[] = [];
  for (let i = 0; i < 12; i++) {
    r.song.title = String(i);
    versions = retainRevision(versions, r);
  }
  expect(versions).toHaveLength(10);
  expect(versions[0].song.title).toBe("2");
});
it("round trips all songs, media, XML, drafts and histories in a library archive", async () => {
  const a = make(),
    b = make();
  a.song.id = "one";
  b.song.id = "two";
  const r = {
    ...a,
    canonicalXML: writeCanonical(a.song),
    editDraft: { song: { ...a.song, title: "draft" }, savedAt: "today" },
    revisions: retainRevision([], a),
  };
  const bytes = await exportLibrary([r, b], {
    "drum-practice.playback": '{"countOff":false}',
  });
  const loaded = await importLibrary(new Uint8Array(bytes).buffer);
  expect(loaded.records.map((r) => r.song.id)).toEqual(["one", "two"]);
  expect(loaded.records[0].editDraft!.song.title).toBe("draft");
  expect(loaded.records[0].canonicalXML).toBe(r.canonicalXML);
  expect(await loaded.records[0].audio.text()).toBe("audio");
  expect(loaded.preferences["drum-practice.playback"]).toContain("false");
});

it("renders syllables for reading without changing stored lyric text or positions", () => {
  const r = make();
  r.song.lyricText = undefined;
  const words = ["나", "다", "라", "카", "나", "once", "a-", "gain"];
  r.song.lyrics = words.map((text, i) => ({ id: String(i), text, time: i, end: i+1, confirmed: false }));
  const before = JSON.stringify(r.song);
  expect(lyricDocument(r)).toBe("나다라카나 once again");
  expect(JSON.stringify(r.song)).toBe(before);
});
it("honors matching MusicXML word and line boundaries", () => {
  const r = make();
  r.song.lyricText = undefined;
  r.song.lyrics = ["hel", "lo", "world"].map((text, i) => ({ id: String(i), text, time: i, end:i+1, confirmed:false }));
  const canonicalXML = '<score-partwise><part><measure><note><lyric><syllabic>begin</syllabic><text>hel</text></lyric></note><note><lyric><syllabic>end</syllabic><text>lo</text><end-line/></lyric></note><note><lyric><text>world</text></lyric></note></measure></part></score-partwise>';
  expect(lyricDocument({...r, canonicalXML})).toBe("hello\nworld");
});

it("separates actual rehearsal sections without inventing lyric section names", () => {
  const r = make(); r.song.lyricText = undefined;
  r.song.measures = [{id:"a"}, {id:"b"}];
  r.song.lyrics = ["나", "다"].map((text,i) => ({text,scorePosition:{measureId:i ? "b" : "a",quarterOffset:0,durationQuarters:1}}));
  const canonicalXML = '<score-partwise><part><measure/><measure><direction><direction-type><rehearsal>B</rehearsal></direction-type></direction></measure></part></score-partwise>';
  expect(lyricDocument({...r,canonicalXML})).toBe("나\n\n다");
  expect(lyricDocument({...r,canonicalXML:canonicalXML.replace(">B<", ">Interlude<")})).toBe("나다");
});
