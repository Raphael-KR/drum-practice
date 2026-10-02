import { it, expect, beforeAll } from "vitest";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import JSZip from "jszip";
import { parseMusicXML, readMusicXML, interpolateX } from "../src/musicxml";
import {
  applyXMLTiming,
  replaceWithMusicXML,
  scoreArchivePath,
  scoreFormat,
} from "../src/score-import";
import { validateSong, type Song } from "../src/model";
import { packSong, unpackSong } from "../src/portable";
beforeAll(() => {
  globalThis.DOMParser = new JSDOM().window.DOMParser;
});
const xml = readFileSync("tests/fixtures/drums.musicxml", "utf8");
it("reads title, explicit/inherited meter and tempo changes", () => {
  const s = parseMusicXML(xml);
  expect(s.title).toBe("드럼 XML 테스트");
  expect(s.bpm).toBe(94);
  expect(s.measures.map((m) => [m.beats, m.denominator, m.bpm])).toEqual([
    [4, 4, 94],
    [5, 4, undefined],
    [6, 8, 120],
  ]);
  const song = {
    firstBeat: 2,
    bpm: 94,
    measures: s.measures.map(() => ({})),
  } as Song;
  applyXMLTiming(song, s);
  expect(song.measures[0].start).toBe(2);
  expect(song.measures[1].end).toBeCloseTo(2 + (9 * 60) / 94);
  expect(song.measures[2].end - song.measures[2].start).toBeCloseTo(1.5);
});
it("detects file extensions and reads standard compressed MXL", async () => {
  expect(scoreFormat("score.MXL")).toBe("musicxml");
  expect(scoreFormat("score.pdf")).toBe("pdf");
  const zip = new JSZip();
  zip.file(
    "META-INF/container.xml",
    '<container><rootfiles><rootfile full-path="music/score.xml"/></rootfiles></container>',
  );
  zip.file("music/score.xml", xml);
  expect(
    await readMusicXML(
      new Blob([await zip.generateAsync({ type: "arraybuffer" })]),
    ),
  ).toBe(xml);
  expect(await readMusicXML(new Blob([xml]))).toBe(xml);
  await expect(
    readMusicXML(
      new Blob([await new JSZip().generateAsync({ type: "arraybuffer" })]),
    ),
  ).rejects.toThrow("container");
});
it("rejects malformed, foreign or active XML, unsupported pickup and multi-staff", () => {
  for (const text of [
    "<no/>",
    "<score-partwise>",
    '<!DOCTYPE x [<!ENTITY e SYSTEM "file:///a">]>' + xml,
  ])
    expect(() => parseMusicXML(text)).toThrow();
  expect(() =>
    parseMusicXML(xml.replace('number="1"', 'number="1" implicit="yes"')),
  ).toThrow("못갖춘");
  expect(() =>
    parseMusicXML(
      xml.replace(
        "<divisions>4</divisions>",
        "<divisions>4</divisions><staves>2</staves>",
      ),
    ),
  ).toThrow("단일 오선");
  const unsafe = xml.replace(
    "<work>",
    '<script>bad()</script><image source="http://external"/><work>',
  );
  expect(
    parseMusicXML(unsafe).document.querySelector("script,image"),
  ).toBeNull();
});
it("selects a single part, removes unused definitions and reports repeat policy", () => {
  const multi = xml
    .replace(
      "</part-list>",
      '<score-part id="other"><part-name>Other</part-name></score-part></part-list>',
    )
    .replace(
      "</score-partwise>",
      '<part id="other"><measure number="1"><attributes><time><beats>3</beats><beat-type>4</beat-type></time></attributes><note><rest measure="yes"/><duration>3</duration></note><barline><repeat direction="backward"/></barline></measure></part></score-partwise>',
    );
  const s = parseMusicXML(multi, "other");
  expect(s.parts).toHaveLength(2);
  expect(s.document.querySelectorAll("part")).toHaveLength(1);
  expect(s.measures[0].beats).toBe(3);
  expect(s.warnings).toHaveLength(1);
  expect(() => parseMusicXML(multi, "missing")).toThrow("파트");
});
it("preserves timeline, lyrics, loops, marker and old song on geometry replacement and portable roundtrip", async () => {
  const song = JSON.parse(
      readFileSync("public/demo/song.json", "utf8"),
    ) as Song,
    before = structuredClone(song);
  const parsed = {
    partId: "drums",
    measures: song.measures.map((m) => ({
      label: m.label,
      beats: m.beats,
      denominator: m.denominator,
    })),
  } as ReturnType<typeof parseMusicXML>;
  const regions = song.regions.map((r, i) => ({ ...r, id: `xml-${i}` }));
  const next = replaceWithMusicXML(
    song,
    { regions, pages: Array(song.pageCount).fill(new Blob(["png"])), parsed },
    "score.mxl",
  );
  expect(song).toEqual(before);
  expect(next.lyrics).toEqual(before.lyrics);
  expect(next.loops).toEqual(before.loops);
  expect(next.markers).toEqual(before.markers);
  expect(next.settings).toEqual(before.settings);
  expect(next.measures.map(({ regionId, ...m }) => m)).toEqual(
    before.measures.map(({ regionId, ...m }) => m),
  );
  validateSong(next);
  expect(scoreArchivePath(next)).toBe("media/score.musicxml");
  expect(scoreArchivePath(before)).toBe("media/score.pdf");
  const record = {
    song: next,
    pdf: new Blob([xml]),
    audio: new Blob(["audio"]),
    pages: Array(next.pageCount).fill(new Blob(["png"])),
  };
  const roundtrip = unpackSong(await packSong(record));
  expect(roundtrip.song).toEqual(next);
  expect(await roundtrip.pdf.text()).toBe(xml);
  parsed.measures[0].beats = 3;
  expect(() =>
    replaceWithMusicXML(song, { regions, pages: [], parsed }, "x.xml"),
  ).toThrow("박자표");
  parsed.measures.pop();
  expect(() =>
    replaceWithMusicXML(song, { regions, pages: [], parsed }, "x.xml"),
  ).toThrow("마디 수");
});
it("interpolates real engraving positions instead of equal-width beat assumptions", () => {
  expect(
    interpolateX(
      [
        { beat: 0, x: 0.1 },
        { beat: 1, x: 0.3 },
        { beat: 4, x: 1 },
      ],
      0.5,
    ),
  ).toBeCloseTo(0.2);
  expect(
    interpolateX(
      [
        { beat: 0, x: 0.1 },
        { beat: 1, x: 0.3 },
        { beat: 4, x: 1 },
      ],
      4,
    ),
  ).toBe(1);
});
it("extracts lyric onsets using durations rather than printed x coordinates", () => {
  const sung = xml
    .replace(
      "<type>quarter</type><stem>down</stem>",
      "<type>quarter</type><stem>down</stem><lyric><text>가</text></lyric>",
    )
    .replace(
      "<rest/><duration>4</duration><type>quarter</type>",
      "<rest/><duration>4</duration><type>quarter</type><lyric><text>나</text></lyric>",
    );
  expect(parseMusicXML(sung).lyrics).toEqual([
    { measure: 0, beat: 0, duration: 1, text: "가" },
    { measure: 0, beat: 1, duration: 1, text: "나" },
  ]);
});
it('rejects an incomplete bar and a tempo direction after the first beat',()=>{
 expect(()=>parseMusicXML(xml.replace('<duration>20</duration>','<duration>16</duration>'))).toThrow('음가 합계');
 const changed=xml.replace('</note><note><rest/>','</note><direction><sound tempo="100"/></direction><note><rest/>');
 expect(()=>parseMusicXML(changed)).toThrow('마디 중간');
});
