import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  packPlayback,
  decodePlaybackAsset,
  makePlaybackHTML,
  validatePlayback,
} from "../src/playback-export";
function fixture() {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  return {
    song,
    pdf: new Blob(["private source"]),
    canonicalXML: "private xml",
    audio: new Blob([Uint8Array.from([8, 0, 255])], { type: "audio/mpeg" }),
    pages: [1, 2, 3].map(
      () => new Blob([Uint8Array.from([0, 255, 17])], { type: "image/png" }),
    ),
  };
}
it("exports an allowlisted snapshot without source, alternate scores, or nested editing data", async () => {
  const r = fixture();
  r.song.lyricArchive = [{ secret: "removed" }];
  r.song.measures[0].privateEditorField = "removed";
  r.song.settings.position = 99;
  r.song.settings.view = "compare";
  r.song.lyrics[0].originalTime = 12;
  const p = await packPlayback(r);
  r.song.title = "changed later";
  expect(p.version).toBe(2);
  expect(p.song.title).not.toBe(r.song.title);
  expect(p.song.settings.position).toBe(p.song.measures[0].start);
  expect(p.song.settings.view).toBe("ribbon");
  expect(JSON.stringify(p)).not.toMatch(
    /private xml|privateEditorField|lyricArchive|originalTime|canonicalXML|otherScores/,
  );
  expect(Object.keys(p).sort()).toEqual([
    "audio",
    "initial",
    "pages",
    "song",
    "version",
  ]);
  expect([
    ...new Uint8Array(await decodePlaybackAsset(p.audio).arrayBuffer()),
  ]).toEqual([8, 0, 255]);
  expect([
    ...new Uint8Array(await decodePlaybackAsset(p.pages[0]).arrayBuffer()),
  ]).toEqual([0, 255, 17]);
});
it("keeps user strings inert across script and HTML boundaries", async () => {
  const r = fixture();
  r.song.title = "</script><script>globalThis.bad=1</script> & 한글";
  const p = await packPlayback(r);
  const html = makePlaybackHTML(
    { runtime: "void 0", css: "", worker: "", licenses: "</script>" },
    p,
  );
  expect(html).not.toContain("<script>globalThis.bad");
  const encoded = html.match(/id="portable-data">([^<]*)<\/script>/)![1];
  expect(JSON.parse(encoded).song.title).toBe(r.song.title);
});
it("rejects missing audio, wrong page format, missing pages and future versions", async () => {
  const r = fixture();
  await expect(packPlayback({ ...r, audio: new Blob([]) })).rejects.toThrow(
    "음원",
  );
  await expect(packPlayback({ ...r, pages: [] })).rejects.toThrow("페이지");
  const p = await packPlayback(r);
  expect(() => validatePlayback({ ...p, version: 999 })).toThrow("버전");
  expect(() =>
    validatePlayback({
      ...p,
      pages: p.pages.map((a) => ({ ...a, type: "application/pdf" })),
    }),
  ).toThrow("형식");
});
it("rejects invalid musical coordinates and preferences", async () => {
  const r = fixture();
  r.song.regions[0].x = Infinity;
  await expect(packPlayback(r)).rejects.toThrow();
  const p = await packPlayback(fixture());
  expect(() => validatePlayback({ ...p, initial: {} })).toThrow("설정");
});

it('round-trips two rendered formats with only one audio asset', async () => {
  const { packCombinedPlayback, readPlaybackData } = await import('../src/playback-export');
  const r = fixture();
  const song = r.song;
  const other = { format: 'musicxml' as const, name: 'xml', source: new Blob(['SECRET']), pages: [1,2,3].map(()=>new Blob(['<svg/>'],{type:'image/svg+xml'})), regions: structuredClone(song.regions), measures: song.measures.map(({id,regionId,beats,denominator}:any)=>({id,regionId,beats,denominator})) };
  const data = await packCombinedPlayback({...r,otherScores:[other]});
  expect(data.scores?.map(s=>s.song.scoreFormat)).toEqual(['musicxml']);
  expect(JSON.stringify(data)).not.toContain('SECRET');
  const html = makePlaybackHTML({runtime:'void 0',css:'',worker:'',licenses:''},data);
  const payload = html.match(/id="portable-data">([^<]*)<\/script>/)![1];
  expect(await readPlaybackData(payload)).toEqual(data);
  expect(data.scores?.every(s=>!('audio' in s))).toBe(true);
});
