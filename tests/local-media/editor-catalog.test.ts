// @vitest-environment jsdom
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { Blob as NodeBlob } from "node:buffer";
import { scoreCatalog } from "../../src/modules/library/score-catalog";
import bundled from "../../src/content/bundled-scores.json";
import { readScorePackage } from "../../src/modules/library/score-package";
import {
  allRecords,
  saveRecord,
  deleteRecord,
} from "../../src/platform/storage/storage";
import { downloadScore } from "../../src/modules/library/download-score";
import { editorHTML } from "../../src/apps/editor/editor-view";
import { createEditorLibrary } from "../../src/apps/editor/editor-library";
import type { RecordData } from "../../src/model/record";
vi.mock("../../src/platform/storage/storage", () => ({
  allRecords: vi.fn(async () => []),
  saveRecord: vi.fn(),
  deleteRecord: vi.fn(),
}));
vi.mock("../../src/modules/library/download-score", () => ({
  downloadScore: vi.fn(),
}));
vi.mock("../../src/apps/editor/workspace", () => ({
  selectEditorPane: vi.fn(),
}));
let record: RecordData;
let blob: Blob;
beforeAll(async () => {
  vi.stubGlobal("Blob", NodeBlob);
  blob = new Blob([readFileSync("public/scores/loveholic.drumscore")]);
  record = await readScorePackage(blob);
});
afterEach(() => {
  vi.clearAllMocks();
  vi.mocked(allRecords).mockResolvedValue([]);
  document.body.replaceChildren();
});
function setup() {
  document.body.innerHTML = editorHTML();
  const h = {
    showHome: vi.fn(async () => {}),
    activate: vi.fn<(record: RecordData) => Promise<void>>(async () => {}),
    openEditor: vi.fn(async () => {}),
    error: vi.fn(),
    action: vi.fn(),
  };
  return { h, library: createEditorLibrary(h) };
}
function loveholicButton() {
  return document.querySelector<HTMLButtonElement>(
    `[data-score-id="${record.song.id}"] [data-editor-open]`,
  )!;
}
it("merges the real catalog once, keeps the saved record, and groups basic and personal scores from their catalog identities", () => {
  const entries = scoreCatalog([record]);
  expect(
    entries.filter((e) => e.category === "basic").map((e) => e.id),
  ).toEqual(bundled.filter((s) => s.category === "basic").map((s) => s.id));
  expect(
    entries
      .filter((e) => e.category === "personal")
      .map((e) => e.id)
      .sort(),
  ).toEqual(
    bundled
      .filter((s) => s.category !== "basic")
      .map((s) => s.id)
      .sort(),
  );
  expect(entries.filter((e) => e.id === record.song.id)).toHaveLength(1);
  expect(entries.find((e) => e.id === record.song.id)?.record).toBe(record);
});
it("returns to the common home catalog without creating a second list dialog", async () => {
  const { h, library } = setup();
  await library.refreshRecent();
  expect(document.querySelectorAll("#editor-home-basic article")).toHaveLength(
    2,
  );
  expect(
    document.querySelectorAll("#editor-home-personal article"),
  ).toHaveLength(bundled.filter((s) => s.category !== "basic").length);
  await library.open();
  expect(h.showHome).toHaveBeenCalledOnce();
  expect(document.getElementById("library-dialog")).toBeNull();
  expect(
    document.querySelectorAll("#editor-home-list [data-score-id]"),
  ).toHaveLength(bundled.length);
});
it("opens the saved edit without download or replacement", async () => {
  vi.mocked(allRecords).mockResolvedValue([record]);
  const { h, library } = setup();
  await library.refreshRecent();
  loveholicButton().click();
  await vi.waitFor(() => expect(h.openEditor).toHaveBeenCalledOnce());
  expect(h.activate).toHaveBeenCalledWith(record);
  expect(downloadScore).not.toHaveBeenCalled();
  expect(saveRecord).not.toHaveBeenCalled();
});
it("downloads a missing score, saves it, and enters the editor; repeat clicks start only once", async () => {
  const { h, library } = setup();
  vi.mocked(downloadScore).mockResolvedValue(blob);
  await library.refreshRecent();
  const button = loveholicButton();
  button.click();
  button.click();
  await vi.waitFor(() => expect(h.openEditor).toHaveBeenCalledOnce());
  expect(saveRecord).toHaveBeenCalledOnce();
  expect(h.activate.mock.calls[0][0].song.id).toBe(record.song.id);
  expect(downloadScore).toHaveBeenCalledOnce();
});
it("keeps a record saved by another tab during download", async () => {
  const { h, library } = setup();
  vi.mocked(downloadScore).mockImplementation(async () => {
    vi.mocked(allRecords).mockResolvedValue([record]);
    return blob;
  });
  await library.refreshRecent();
  loveholicButton().click();
  await vi.waitFor(() => expect(h.openEditor).toHaveBeenCalledOnce());
  expect(h.activate).toHaveBeenCalledWith(record);
  expect(saveRecord).not.toHaveBeenCalled();
});
it("restores the button after failure and permits retry", async () => {
  const { h, library } = setup();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(downloadScore)
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce(blob);
  await library.refreshRecent();
  const button = loveholicButton();
  button.click();
  await vi.waitFor(() => expect(h.error).toHaveBeenCalledOnce());
  expect(button.disabled).toBe(false);
  expect(button.hasAttribute("aria-busy")).toBe(false);
  button.click();
  await vi.waitFor(() => expect(h.openEditor).toHaveBeenCalledOnce());
  vi.restoreAllMocks();
});
it("keeps the download button and progress during a focus-triggered refresh", async () => {
  const { h, library } = setup();
  let finish!: (blob: Blob) => void;
  vi.mocked(downloadScore).mockImplementationOnce((_url, progress) => {
    progress(42);
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  await library.refreshRecent();
  const button = loveholicButton();
  button.click();
  await vi.waitFor(() => expect(button.textContent).toContain("42%"));
  await library.refreshRecent();
  expect(loveholicButton()).toBe(button);
  expect(button.disabled).toBe(true);
  finish(blob);
  await vi.waitFor(() => expect(h.openEditor).toHaveBeenCalledOnce());
});
it("rejects a package belonging to a different catalog entry before saving", async () => {
  const { h, library } = setup();
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(downloadScore).mockResolvedValueOnce(blob);
  await library.refreshRecent();
  document
    .querySelector<HTMLButtonElement>("#editor-home-basic [data-editor-open]")!
    .click();
  await vi.waitFor(() => expect(h.error).toHaveBeenCalledOnce());
  expect(saveRecord).not.toHaveBeenCalled();
  expect(h.activate).not.toHaveBeenCalled();
  expect(log).toHaveBeenCalledWith(
    "Editor catalog open failed",
    expect.objectContaining({
      id: bundled[0].id,
      stage: "decode",
      cause: expect.any(Error),
    }),
  );
  vi.restoreAllMocks();
});

it("keeps deletion on the home card, requires confirmation, and restores the bundled import action", async () => {
  vi.mocked(allRecords).mockResolvedValue([record]);
  const { library, h } = setup();
  await library.refreshRecent();
  const remove = document.querySelector<HTMLButtonElement>(
    `[data-score-id="${record.song.id}"] [data-editor-remove]`,
  )!;
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  try {
    remove.click();
    expect(deleteRecord).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    vi.mocked(deleteRecord).mockImplementationOnce(async () => {
      vi.mocked(allRecords).mockResolvedValue([]);
    });
    remove.click();
    await vi.waitFor(() =>
      expect(loveholicButton().textContent).toBe("악보 불러오기"),
    );
    expect(deleteRecord).toHaveBeenCalledExactlyOnceWith(record.song.id);
    expect(h.activate).not.toHaveBeenCalled();
  } finally {
    confirm.mockRestore();
  }
});
