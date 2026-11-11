// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Blob as NodeBlob } from "node:buffer";
import { readFileSync } from "node:fs";
import { installScoreReader } from "../../src/modules/score/score-reader";
import { renderFullScore } from "../../src/modules/score/musicxml";
import type { Song } from "../../src/model/model";
// Test the viewer lifecycle without running the browser-only engraver in jsdom.
vi.mock("../../src/modules/score/musicxml", () => ({
  renderFullScore: vi.fn(),
}));
const canonicalXML = readFileSync("tests/fixtures/drums.musicxml", "utf8");
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g class="vf-measure" id="9"><path d="M10 20L90 20"/></g></svg>';
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("Blob", NodeBlob);
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:page"),
    revokeObjectURL: vi.fn(),
  });
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
});
afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});
function setup() {
  const root = document.createElement("main"),
    controls = document.createElement("section");
  root.append(controls);
  document.body.append(root);
  const song = {
    scoreFormat: "musicxml",
    scorePartId: "drums",
    lyrics: [],
    lyricText: "<script>lyrics</script>",
  } as unknown as Song;
  const pages = [new Blob([svg], { type: "image/svg+xml" })];
  vi.mocked(renderFullScore).mockResolvedValue({
    pages,
  } as Awaited<ReturnType<typeof renderFullScore>>);
  const fail = vi.fn();
  const reader = installScoreReader({
    root,
    controls,
    song,
    canonicalXML,
    scores: [{ song, pages }],
    fail,
  });
  return { root, reader, fail, song };
}
it("opens shared full-score SVG without HTML numbers and frees image URLs on close", async () => {
  const { root, reader, fail, song } = setup();
  root.querySelector<HTMLButtonElement>("#runtime-full-svg")!.click();
  await vi.waitFor(() =>
    expect(root.querySelector<HTMLDialogElement>("dialog")!.open).toBe(true),
  );
  expect(renderFullScore).toHaveBeenCalledExactlyOnceWith(
    canonicalXML,
    song,
    "drums",
  );
  const surface = root.querySelector(".full-score-page")!;
  expect(surface.children).toHaveLength(1);
  expect(surface.firstElementChild!.tagName).toBe("IMG");
  root.querySelector<HTMLDialogElement>("dialog")!.close();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:page");
  expect(root.querySelector("img")).toBeNull();
  expect(fail).not.toHaveBeenCalled();
  reader.dispose();
});
it("omits the full-lyrics action and removes controls when runtime disposes", () => {
  const { root, reader, song } = setup();
  expect(
    root.querySelector("#runtime-full-lyrics, .score-reader-lyrics"),
  ).toBeNull();
  expect(song.lyricText).toBe("<script>lyrics</script>");
  reader.dispose();
  expect(root.querySelector("dialog")).toBeNull();
  expect(root.querySelector("button")).toBeNull();
});
