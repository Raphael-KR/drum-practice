// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Blob as NodeBlob } from "node:buffer";
import { installScoreReader } from "../src/score-reader";
import type { Song } from "../src/model";
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g class="vf-measure" id="9"><path d="M10 20L90 20"/></g></svg>';
beforeEach(() => {
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
    lyrics: [],
    lyricText: "<script>lyrics</script>",
  } as unknown as Song;
  const fail = vi.fn();
  const reader = installScoreReader({
    root,
    controls,
    song,
    scores: [{ song, pages: [new Blob([svg], { type: "image/svg+xml" })] }],
    fail,
  });
  return { root, reader, fail };
}
it("opens completed SVG with row-start overlays and frees image URLs on close", async () => {
  const { root, reader, fail } = setup();
  root.querySelector<HTMLButtonElement>("#runtime-full-svg")!.click();
  await vi.waitFor(() =>
    expect(root.querySelector<HTMLDialogElement>("dialog")!.open).toBe(true),
  );
  expect(root.querySelector(".score-reader-measure")!.textContent).toBe("9");
  expect(root.querySelector(".score-reader-pages svg")).toBeNull();
  expect(root.querySelector("img")).not.toBeNull();
  root.querySelector<HTMLDialogElement>("dialog")!.close();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:page");
  expect(root.querySelector("img")).toBeNull();
  expect(fail).not.toHaveBeenCalled();
  reader.dispose();
});
it("shows full lyrics as safe text and removes controls when runtime disposes", async () => {
  const { root, reader } = setup();
  root.querySelector<HTMLButtonElement>("#runtime-full-lyrics")!.click();
  await vi.waitFor(() =>
    expect(root.querySelector<HTMLDialogElement>("dialog")!.open).toBe(true),
  );
  expect(root.querySelector(".score-reader-lyrics")!.textContent).toBe(
    "<script>lyrics</script>",
  );
  expect(root.querySelector("script")).toBeNull();
  reader.dispose();
  expect(root.querySelector("dialog")).toBeNull();
  expect(root.querySelector("button")).toBeNull();
});
