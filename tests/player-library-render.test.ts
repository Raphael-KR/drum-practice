// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
vi.mock("../src/landscape-keyboard", () => ({ installLandscapeKeyboardGuard: () => () => {} }));
vi.mock("../src/help", () => ({ installHelp: vi.fn() }));
vi.mock("../src/playback-runtime", () => ({ mountPlaybackRuntime: vi.fn() }));
vi.mock("../src/score-package", () => ({ readScorePackage: vi.fn() }));
vi.mock("../src/playback-export", () => ({ playbackInitial: {} }));
vi.mock("../src/practice-library", () => ({
  listPracticeRecords: vi.fn(async () => []),
  listPracticeArchives: vi.fn(async () => []),
  removePracticeRecord: vi.fn(), loadPracticeRecord: vi.fn(),
  savePracticeState: vi.fn(), importPracticeRecord: vi.fn(), restorePracticeArchive: vi.fn(),
}));
vi.mock("../src/browser-score", () => ({ prepareBrowserScore: vi.fn(async record => record) }));
vi.mock("../src/song-scores", () => ({ songScores: () => [], useScore: vi.fn() }));
vi.mock("../src/download-score", () => ({ downloadScore: vi.fn() }));
import { downloadScore } from "../src/download-score";
import { mountPlaybackRuntime } from "../src/playback-runtime";
import { listPracticeRecords, listPracticeArchives, loadPracticeRecord } from "../src/practice-library";
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(r => { resolve = r; });
  return { promise, resolve };
}
it("ignores stale list and archive reads when focus refreshes overlap", async () => {
  document.body.innerHTML = '<div id="app"></div>';
  const { showLibrary } = await import("../src/player-app");
  await showLibrary();
  const record = { song: { id: "test-score", title: "One score", artist: "Artist" } } as any;
  const first = deferred<any[]>();
  const second = deferred<any[]>();
  vi.mocked(listPracticeRecords).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  window.dispatchEvent(new Event("focus"));
  await Promise.resolve();
  window.dispatchEvent(new Event("focus"));
  await Promise.resolve();
  second.resolve([record]);
  await vi.waitFor(() => expect(document.querySelectorAll('[data-open]')).toHaveLength(1));
  first.resolve([record]);
  await new Promise(r => setTimeout(r, 0));
  expect(document.querySelectorAll('[data-open]')).toHaveLength(1);
  const archive = deferred<any[]>();
  vi.mocked(listPracticeRecords).mockResolvedValue([record]);
  vi.mocked(listPracticeArchives).mockReturnValueOnce(archive.promise);
  const old = showLibrary();
  await vi.waitFor(() => expect(listPracticeArchives).toHaveBeenLastCalledWith("test-score"));
  await showLibrary();
  archive.resolve([]);
  await old;
  expect(document.querySelectorAll('[data-open]')).toHaveLength(1);
});

it("shows loading immediately, keeps it through mounting, and clears it on success or failure", async () => {
  const { showLibrary } = await import("../src/player-app");
  await showLibrary();
  const pending = deferred<any>();
  vi.mocked(loadPracticeRecord).mockReturnValueOnce(pending.promise);
  const mounted = deferred<any>();
  vi.mocked(mountPlaybackRuntime).mockReturnValueOnce(mounted.promise);
  document.querySelector<HTMLButtonElement>("[data-open]")!.click();
  expect(document.querySelector(".score-loading")?.textContent).toContain("악보 읽는 중");
  expect(document.querySelector("#app")?.getAttribute("aria-busy")).toBe("true");
  pending.resolve({ song: { id: "test-score", title: "One score" }, pages: [] });
  await vi.waitFor(() => expect(mountPlaybackRuntime).toHaveBeenCalled());
  const options = vi.mocked(mountPlaybackRuntime).mock.calls.at(-1)![0];
  expect(document.querySelector(".score-loading")?.textContent).toContain("화면 준비 중");
  options.onLoading?.("audio");
  expect(document.querySelector(".score-loading")?.textContent).toContain("음원 준비 중");
  options.onLoading?.("screen");
  // Runtime replaces the app content, but the loading overlay remains outside it.
  document.querySelector("#app")!.innerHTML = "<header></header>";
  expect(document.querySelector(".score-loading")).not.toBeNull();
  mounted.resolve({ flush: vi.fn(), dispose: vi.fn() });
  await vi.waitFor(() => expect(document.querySelector(".score-loading")).toBeNull());
  expect(document.querySelector<HTMLElement>("#app")!.inert).toBeFalsy();
  await showLibrary();
  vi.mocked(loadPracticeRecord).mockRejectedValueOnce(new Error("Load failed"));
  document.querySelector<HTMLButtonElement>("[data-open]")!.click();
  await vi.waitFor(() => expect(document.querySelector("#library-status")?.textContent).toBe("Load failed"));
  expect(document.querySelector(".score-loading")).toBeNull();
  expect(document.querySelector("#app")?.hasAttribute("aria-busy")).toBe(false);
});

it("shows download percentages on the bundled button and restores it after failure", async () => {
  const { showLibrary } = await import("../src/player-app");
  vi.mocked(listPracticeRecords).mockResolvedValue([]);
  await showLibrary();
  let fail!: (reason: Error) => void;
  vi.mocked(downloadScore).mockImplementationOnce((_url, progress) => {
    progress(null);
    return new Promise((_resolve, reject) => { fail = reject; });
  });
  const button = document.querySelector<HTMLButtonElement>(".practice-card button")!;
  const original = button.textContent;
  button.click();
  expect(button.textContent).toBe("불러오는 중…");
  const progress = vi.mocked(downloadScore).mock.calls.at(-1)![1];
  progress(42);
  expect(button.textContent).toBe("불러오는 중 42%");
  expect(button.disabled).toBe(true);
  window.dispatchEvent(new Event("focus"));
  await Promise.resolve();
  expect(document.body.contains(button)).toBe(true);
  fail(new Error("offline"));
  await vi.waitFor(() => expect(button.disabled).toBe(false));
  expect(button.textContent).toBe(original);
  expect(button.hasAttribute("aria-busy")).toBe(false);
});
