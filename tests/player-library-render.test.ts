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
import { readScorePackage } from "../src/score-package";
import { downloadScore } from "../src/download-score";
import { mountPlaybackRuntime } from "../src/playback-runtime";
import { listPracticeRecords, listPracticeArchives, loadPracticeRecord, importPracticeRecord } from "../src/practice-library";
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
  const button = document.querySelector<HTMLButtonElement>(".practice-card button:not(.library-favorite)")!;
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
  const error = document.querySelector("#library-status")!;
  expect(error.textContent).toContain("다운로드");
  expect(error.textContent).toContain("Error: offline");
  expect(error.classList.contains("is-error")).toBe(true);
  expect(error.getAttribute("role")).toBe("alert");
  expect(button.hasAttribute("aria-busy")).toBe(false);
});

it("shows the empty hint only when no saved, bundled or restorable cards exist", async () => {
  const { showLibrary } = await import("../src/player-app");
  const { default: bundled } = await import("../src/bundled-scores.json");
  vi.mocked(listPracticeRecords).mockResolvedValue([]);
  vi.mocked(listPracticeArchives).mockResolvedValue([]);
  await showLibrary();
  const hint = () => document.querySelector<HTMLElement>("#library-empty-hint")!;
  expect(hint().hidden).toBe(true);
  const saved = bundled.splice(0);
  try {
    await showLibrary();
    expect(hint().hidden).toBe(false);
    expect(hint().textContent).toBe("버튼을 눌러 악보를 추가하세요.");
    expect(hint().previousElementSibling?.id).toBe("import-package");
    expect(document.querySelector("#import-package")!.getAttribute("aria-describedby")).toBe(hint().id);
    vi.mocked(listPracticeArchives).mockResolvedValue([{ id: "archive", record: { song: { id: "restorable", title: "Old score" } } }] as any);
    await showLibrary();
    expect(hint().hidden).toBe(true);
    expect(document.querySelectorAll(".practice-card")).toHaveLength(1);
  } finally {
    bundled.push(...saved);
    vi.mocked(listPracticeArchives).mockResolvedValue([]);
  }
});


it("clears previous errors on retry, reports package/storage causes and stays silent on success", async () => {
  const { showLibrary } = await import("../src/player-app");
  vi.mocked(listPracticeRecords).mockResolvedValue([]);
  await showLibrary();
  vi.mocked(downloadScore).mockResolvedValue(new Blob(["score"]));
  const button = document.querySelector<HTMLButtonElement>(".practice-card button:not(.library-favorite)")!;
  vi.mocked(readScorePackage).mockRejectedValueOnce(new Error("<invalid package>"));
  button.click();
  await vi.waitFor(() => expect(button.disabled).toBe(false));
  const status = () => document.querySelector("#library-status")!;
  expect(status().textContent).toContain("악보 파일 읽기·검증");
  expect(status().textContent).toContain("<invalid package>");
  expect(status().children).toHaveLength(0);

  vi.mocked(readScorePackage).mockResolvedValue({ song: { id: "test" } } as any);
  vi.mocked(importPracticeRecord).mockRejectedValueOnce(new DOMException("Storage full", "QuotaExceededError"));
  button.click();
  expect(status().textContent).toBe("");
  await vi.waitFor(() => expect(button.disabled).toBe(false));
  expect(status().textContent).toContain("기기에 저장");
  expect(status().textContent).toContain("QuotaExceededError: Storage full");

  vi.mocked(importPracticeRecord).mockResolvedValueOnce({ status: "added" } as any);
  button.click();
  await vi.waitFor(() => expect(button.disabled).toBe(false));
  expect(status().textContent).toBe("");
  expect(status().classList.contains("is-error")).toBe(false);
  expect(document.body.textContent).not.toContain("저장되었습니다");
});

it("keeps basic exercises in their own section before and after import, including restore actions", async () => {
  const { showLibrary } = await import("../src/player-app");
  const { default: bundled } = await import("../src/bundled-scores.json");
  const basic = bundled.find(s => "category" in s && s.category === "basic")!;
  vi.mocked(listPracticeRecords).mockResolvedValue([]);
  vi.mocked(listPracticeArchives).mockResolvedValue([]);
  await showLibrary();
  expect([...document.querySelectorAll(".library-section h2")].map(h => h.textContent)).toEqual(["기본 연습곡", "내 악보 목록"]);
  const basicList = () => document.querySelector("#basic-practice-records")!;
  const personalList = () => document.querySelector("#personal-practice-records")!;
  expect(basicList().querySelector("h3")?.textContent).toBe(basic.title);
  expect(personalList().textContent).not.toContain(basic.title);
  expect(document.querySelector("#import-package")!.closest("header")).not.toBeNull();

  const basicRecord = { song: { id: basic.id, title: "Saved basic", artist: "Teacher" } } as any;
  const personalRecord = { song: { id: "my-own-score", title: "My own score" } } as any;
  vi.mocked(listPracticeRecords).mockResolvedValue([basicRecord, personalRecord]);
  vi.mocked(listPracticeArchives).mockImplementation(async id => id === basic.id ? [{ id: "previous", record: basicRecord }] as any : []);
  await showLibrary();
  expect(basicList().querySelectorAll(".practice-card")).toHaveLength(bundled.filter(s => "category" in s && s.category === "basic").length);
  expect(basicList().textContent).toContain("Saved basic");
  expect(basicList().querySelector('button[aria-label="이전 악보 복원"] svg')).not.toBeNull();
  expect(basicList().querySelector("[data-open]")).not.toBeNull();
  expect(personalList().textContent).toContain("My own score");
  expect(personalList().textContent).not.toContain("Saved basic");

  const savedCatalog = [...bundled];
  try {
    bundled.splice(0, bundled.length, basic);
    vi.mocked(listPracticeRecords).mockResolvedValue([basicRecord]);
    vi.mocked(listPracticeArchives).mockResolvedValue([]);
    await showLibrary();
    expect(document.querySelector<HTMLElement>("#library-empty-hint")!.hidden).toBe(false);
    expect(basicList().querySelectorAll(".practice-card")).toHaveLength(1);
    expect(personalList().children).toHaveLength(0);
  } finally {
    bundled.splice(0, bundled.length, ...savedCatalog);
    vi.mocked(listPracticeRecords).mockResolvedValue([]);
    vi.mocked(listPracticeArchives).mockResolvedValue([]);
  }
});

it("classifies legacy basic editions and their archives by ID without moving unrelated same-title scores", async () => {
  const { showLibrary } = await import("../src/player-app");
  const { default: bundled } = await import("../src/bundled-scores.json");
  const basic = bundled.find(s => s.id === "tom-moving-video-v2")!;
  const legacy = { song: { id: "tom-moving-original-v1", title: basic.title } } as any;
  const unrelated = { song: { id: "personal-tom-study", title: basic.title } } as any;
  vi.mocked(listPracticeRecords).mockResolvedValue([legacy, unrelated]);
  vi.mocked(listPracticeArchives).mockResolvedValue([]);
  await showLibrary();
  expect(document.querySelector("#basic-practice-records")!.querySelectorAll(".practice-card")).toHaveLength(bundled.filter(s => "category" in s && s.category === "basic").length + 1);
  expect(document.querySelector("#personal-practice-records")!.querySelectorAll("[data-open]")).toHaveLength(1);

  vi.mocked(listPracticeRecords).mockResolvedValue([]);
  vi.mocked(listPracticeArchives).mockResolvedValue([{ id: "legacy-backup", record: legacy }] as any);
  await showLibrary();
  expect(document.querySelector("#basic-practice-records")!.textContent).toContain("삭제한 악보 복원");
  expect(document.querySelector("#personal-practice-records")!.textContent).not.toContain(basic.title);
});

it("keeps the warmup first with saved scores and archives and offers no old 16-bar download", async () => {
  const { showLibrary } = await import("../src/player-app");
  const record = (id: string, title: string) => ({ song: { id, title } }) as any;
  vi.mocked(listPracticeRecords).mockResolvedValue([record("tom-moving-video-v2", "Tom"), record("preplay-hand-warmup-v1", "시작전 손플기")]);
  vi.mocked(listPracticeArchives).mockResolvedValue([]);
  await showLibrary();
  const ids = () => [...document.querySelectorAll<HTMLElement>("#basic-practice-records .practice-card")].map(c => c.dataset.scoreId);
  expect(ids()).toEqual(["preplay-hand-warmup-v1", "tom-moving-video-v2"]);
  vi.mocked(listPracticeRecords).mockResolvedValue([record("tom-moving-video-v2", "Tom")]);
  await showLibrary();
  expect(ids()).toEqual(["preplay-hand-warmup-v1", "tom-moving-video-v2"]);
  expect(document.querySelector("#basic-practice-records")!.textContent).not.toContain("(16마디)");
});

it("restores the update pictogram after a failed download", async () => {
  const { showLibrary } = await import("../src/player-app");
  vi.mocked(listPracticeRecords).mockResolvedValue([{ song: { id: "preplay-hand-warmup-v1", title: "Warmup" } }] as any);
  vi.mocked(listPracticeArchives).mockResolvedValue([]);
  await showLibrary();
  const button = document.querySelector<HTMLButtonElement>('button[aria-label="악보 업데이트"]')!;
  expect(button.querySelector("svg")).not.toBeNull();
  expect(button.title).toContain("업데이트");
  vi.mocked(downloadScore).mockRejectedValueOnce(new Error("Offline"));
  button.click();
  await vi.waitFor(() => expect(button.disabled).toBe(false));
  expect(button.querySelector("svg")).not.toBeNull();
  expect(button.getAttribute("aria-label")).toBe("악보 업데이트");
});

it("persists favorites and restores the original order when unstarred", async () => {
  localStorage.removeItem("drum-practice:favorite-scores");
  vi.mocked(listPracticeRecords).mockResolvedValue([
    { song: { id: "favorite-a", title: "A", artist: "Artist" } },
    { song: { id: "favorite-b", title: "B", artist: "Artist" } },
  ] as any);
  vi.mocked(listPracticeArchives).mockResolvedValue([]);
  const { showLibrary } = await import("../src/player-app");
  await showLibrary();
  const button = () => document.querySelector<HTMLButtonElement>('[data-score-id="favorite-b"] .library-favorite')!;
  const first = () => document.querySelector("#personal-practice-records > article")?.getAttribute("data-score-id");
  button().click();
  expect(document.querySelector("#favorite-practice-records > article")?.getAttribute("data-score-id")).toBe("favorite-b");
  expect(button().getAttribute("aria-pressed")).toBe("true");
  await showLibrary();
  expect(document.querySelector("#favorite-practice-records > article")?.getAttribute("data-score-id")).toBe("favorite-b");
  const basicStar = document.querySelector<HTMLButtonElement>('#basic-practice-records .library-favorite')!;
  basicStar.click();
  expect(document.querySelectorAll("#favorite-practice-records > article")).toHaveLength(2);
  expect(document.querySelector("#favorite-practice-records h2")).toBeNull();
  basicStar.click();
  button().click();
  expect(document.querySelector("#favorite-practice-records")!.hasAttribute("hidden")).toBe(true);
  expect(first()).toBe("favorite-a");
  expect(JSON.parse(localStorage.getItem("drum-practice:favorite-scores")!)).toEqual([]);
  localStorage.removeItem("drum-practice:favorite-scores");
});

it("uses the shared title order for library metadata", async () => {
  const { saveTitleOrder } = await import("../src/song-title");
  const { showLibrary } = await import("../src/player-app");
  vi.mocked(listPracticeRecords).mockResolvedValue([{ song: { id: "title-order", title: "Song", artist: "Artist" } }] as any);
  vi.mocked(listPracticeArchives).mockResolvedValue([]);
  try {
    saveTitleOrder("artist-first");
    await showLibrary();
    expect(document.querySelector('[data-score-id="title-order"] .practice-card-title')?.firstElementChild?.textContent).toBe("Artist");
    saveTitleOrder("title-first");
    await showLibrary();
    expect(document.querySelector('[data-score-id="title-order"] .practice-card-title')?.firstElementChild?.textContent).toBe("Song");
  } finally { saveTitleOrder("title-first"); }
});

it("changes the shared title preference from library settings without rebuilding the list", async () => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new Event("close")); };
  const { saveTitleOrder, readTitleOrder } = await import("../src/song-title");
  saveTitleOrder("title-first");
  const { showLibrary } = await import("../src/player-app");
  vi.mocked(listPracticeRecords).mockResolvedValue([{ song: { id: "settings-score", title: "Song", artist: "Artist" } }] as any);
  vi.mocked(listPracticeArchives).mockResolvedValue([]);
  await showLibrary();
  const card = document.querySelector('[data-score-id="settings-score"]')!;
  document.querySelector<HTMLButtonElement>("#library-settings")!.click();
  document.querySelector<HTMLButtonElement>('#settings-dialog [data-title-order="artist-first"]')!.click();
  expect(readTitleOrder()).toBe("artist-first");
  expect(card.querySelector(".practice-card-title")!.firstElementChild!.textContent).toBe("Artist");
  document.querySelector<HTMLDialogElement>("#settings-dialog")!.close();
  expect(document.activeElement?.id).toBe("library-settings");
  saveTitleOrder("title-first");
});
