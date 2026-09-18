// @vitest-environment jsdom
import { it, expect, vi } from "vitest";
import { playbackPosition, copyPosition } from "../src/playback-position";
import type { Song } from "../src/model";
const song = { title: "테스트", artist: "가수", measures: [
  { label: "15", start: 10, end: 14, beats: 4, denominator: 4 },
  { label: "16", start: 14, end: 19, beats: 5, denominator: 4 },
] } as Song;
it("reports the fourth eighth-note slot with exact time", () => {
  const p = playbackPosition(song, 11.501);
  expect(p.label).toBe("15마디 · 2박 + ½");
  expect(p.text).toContain("가장 가까운 ¼박 격자 기준");
  expect(p.text).toContain("11.501초");
});
it("handles measure changes, pre-roll, and the last beat in 5/4", () => {
  expect(playbackPosition(song, 0).label).toBe("15마디 · 1박");
  expect(playbackPosition(song, 14).label).toBe("16마디 · 1박");
  expect(playbackPosition(song, 19).label).toBe("16마디 · 끝");
});
it("writes the supplied snapshot to Clipboard API", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  await copyPosition("15마디");
  expect(writeText).toHaveBeenCalledWith("15마디");
});
it("falls back when clipboard access is denied and cleans up on failure", async () => {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(Error()) } });
  const exec = vi.fn(() => true);
  Object.defineProperty(document, "execCommand", { configurable: true, value: exec });
  await copyPosition("위치");
  expect(exec).toHaveBeenCalledWith("copy");
  expect(document.querySelector("textarea")).toBeNull();
  exec.mockReturnValue(false);
  await expect(copyPosition("위치")).rejects.toThrow("복사하지 못했습니다");
  expect(document.querySelector("textarea")).toBeNull();
});
