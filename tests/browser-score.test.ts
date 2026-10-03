vi.mock("../src/drum-legend", () => ({normalizeDrumScore: (s:string)=>s}));
import { expect, it, vi } from "vitest";
const render = vi.hoisted(() => vi.fn());
vi.mock("../src/musicxml", () => ({ renderMusicXML: render, readMusicXML: (b:Blob)=>b.text() }));
import { prepareBrowserScore } from "../src/browser-score";
import type { RecordData } from "../src/storage";
function record(): RecordData {
  return {
    canonicalXML: "canonical",
    pdf: new Blob(["original"]),
    audio: new Blob(["audio"]),
    pages: [new Blob(["old"])],
    song: {
      scoreFormat: "musicxml",
      scorePartId: "P1",
      measures: [
        {
          id: "m1",
          regionId: "old",
          beats: 4,
          denominator: 4,
          start: 2,
          end: 4,
        },
      ],
      settings: { view: "ribbon" },
      loops: [{ id: "loop" }],
      markers: [{ id: "marker" }],
      lyrics: [{ text: "lyric" }],
    },
  } as unknown as RecordData;
}
it("uses canonical XML and replaces only derived geometry, preserving input", async () => {
  const r = record(),
    before = structuredClone(r.song);
  render.mockResolvedValue({
    parsed: { measures: [{ beats: 4, denominator: 4 }] },
    pages: [new Blob(["new"])],
    regions: [{ id: "new" }],
  });
  const result = await prepareBrowserScore(r);
  expect(await render.mock.calls.at(-1)![0].text()).toBe("canonical");
  expect(r.song).toEqual(before);
  expect(result.pdf).toBe(r.pdf);
  expect(result.audio).toBe(r.audio);
  expect(result.song.settings).toEqual(before.settings);
  expect(result.song.loops).toEqual(before.loops);
  expect(result.song.markers).toEqual(before.markers);
  expect(result.song.lyrics).toEqual(before.lyrics);
  expect(result.song.measures[0]).toEqual({
    ...before.measures[0],
    regionId: "new",
  });
});
it("rejects incompatible XML before state replacement", async () => {
  render.mockResolvedValue({
    parsed: { measures: [] },
    pages: [],
    regions: [],
  });
  await expect(prepareBrowserScore(record())).rejects.toThrow("마디");
});
it("leaves PDF-only records untouched", async () => {
  const r = record();
  r.song.scoreFormat = "pdf";
  expect(await prepareBrowserScore(r)).toBe(r);
});
