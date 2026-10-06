// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
it("defaults to title first and persists an artist-first preference", async () => {
  localStorage.removeItem("drum-practice.title-order");
  vi.resetModules();
  let titles = await import("../src/song-title");
  const song = { title: "Song", artist: "Artist" };
  expect(titles.formatSongTitle(song)).toBe("Song - Artist");
  titles.saveTitleOrder("artist-first");
  vi.resetModules();
  titles = await import("../src/song-title");
  expect(titles.formatSongTitle(song)).toBe("Artist - Song");
  expect(titles.formatSongTitle({ title: "Song" })).toBe("Song");
  titles.saveTitleOrder("title-first");
  expect(titles.formatSongTitle(song)).toBe("Song - Artist");
  localStorage.removeItem("drum-practice.title-order");
});
