import type { Song, Loop } from "../../src/model/model";
// DOM interaction contract only. Does not claim browser layout/audio or iPad proof.
// @vitest-environment jsdom
import "fake-indexeddb/auto";
import { beforeAll, it, expect, vi } from "vitest";
import { webcrypto } from "node:crypto";
import { readFileSync } from "node:fs";
import { Blob as NativeBlob, File as NativeFile } from "node:buffer";
import { allRecords, saveRecord } from "../../src/platform/storage/storage";
const audioClock = vi.hoisted(() => ({ position: 0 }));
vi.mock("../../src/modules/score/pdf", () => ({
  renderPDF: async () => ({
    pages: [new Blob(["page"])],
    regions: [
      { id: "r-new", page: 0, x: 0.1, y: 0.2, w: 0.7, h: 0.1, beatXs: [] },
    ],
  }),
}));
vi.mock("../../src/apps/editor/audio", () => ({
  Player: class {
    playing = false;
    get position() {
      return audioClock.position;
    }
    set position(value: number) {
      audioClock.position = value;
    }
    duration = 300;
    song!: Song;
    loop?: Loop;
    onstate = () => {};
    onprogress = () => {};
    renderRate = 1;
    async load(_b: Blob, s: Song) {
      this.song = s;
      this.position = s.settings.position;
    }
    volumes() {}
    updateMetronome() {}
    current() {
      return this.position;
    }
    pause() {
      this.playing = false;
      this.onstate();
    }
    async play() {
      this.playing = true;
      this.onstate();
    }
    async setRate(rate: number, original = rate === 1) {
      this.song.settings.rate = rate;
      this.song.settings.tempoMode = original ? "original" : "practice";
    }
    seek(t: number) {
      this.position = t;
      this.onstate();
    }
    count() {
      return 0;
    }
  },
}));
let animationFrame: FrameRequestCallback;
const click = (id: string) => document.getElementById(id)!.click();
const set = (id: string, v: string) => {
  (document.getElementById(id) as HTMLInputElement).value = v;
};
async function openEditorPane(name: "meta" | "lyrics") {
  const settings = document.getElementById(
    "settings-dialog",
  ) as HTMLDialogElement;
  if (!settings.open) click("open-settings-dialog");
  click("open-score-settings");
  const entry = document.getElementById("score-edit-entry")!;
  expect(entry.closest("[hidden]")).toBeNull();
  entry.click();
  await vi.waitFor(() =>
    expect(
      (document.getElementById("editor-dialog") as HTMLDialogElement).open,
    ).toBe(true),
  );
  const tab = document.querySelector<HTMLButtonElement>(
    `#score-workspace-tabs [data-pane="${name}"]`,
  )!;
  tab.click();
  expect(tab.getAttribute("aria-selected")).toBe("true");
  expect(document.getElementById(`editor-${name}`)!.hidden).toBe(false);
}
function progressInput() {
  return document.getElementById("progress-percent") as HTMLInputElement;
}
function dragProgress(type: string, x: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, {
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
    button: 0,
    clientX: x,
    clientY: 100,
  });
  progressInput().dispatchEvent(event);
}
function navigateToMeasure(measure: number) {
  animationFrame(0);
  const from = Number(progressInput().value);
  dragProgress("pointerdown", 100);
  // Cross the threshold even when resetting the current measure to its start.
  if (measure === from) dragProgress("pointermove", 100 + (from > 1 ? -8 : 8));
  dragProgress("pointermove", 100 + (measure - from) * 8);
  dragProgress("pointerup", 100 + (measure - from) * 8);
  animationFrame(0);
}
async function openSavedScore(id: string) {
  click("library-button");
  const button = await vi.waitFor(() => {
    expect(document.getElementById("welcome")!.hidden).toBe(false);
    const button = document.querySelector<HTMLButtonElement>(
      `#editor-home-list [data-score-id="${id}"] [data-editor-open]`,
    )!;
    expect(button?.textContent).toBe("편집 열기");
    expect(button.disabled).toBe(false);
    return button;
  });
  button.click();
  // Catalog activation reads and persists media before opening the editor.
  // Wait for that completion under the full suite's worker/IO load.
  await vi.waitFor(
    () =>
      expect(
        (document.getElementById("editor-dialog") as HTMLDialogElement).open,
      ).toBe(true),
    { timeout: 5000 },
  );
  document
    .querySelector<HTMLButtonElement>('[data-close="editor-dialog"]')!
    .click();
  await vi.waitFor(() =>
    expect(
      (document.getElementById("editor-dialog") as HTMLDialogElement).open,
    ).toBe(false),
  );
}
beforeAll(async () => {
  vi.stubGlobal("crypto", webcrypto);
  // jsdom lacks Blob.arrayBuffer; use the standard implementation for media reads.
  vi.stubGlobal("Blob", NativeBlob);
  vi.stubGlobal("File", NativeFile);
  document.body.innerHTML = '<div id="app"></div>';
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    animationFrame = callback;
    return 0;
  });
  vi.stubGlobal(
    "Image",
    class {
      src = "";
      naturalWidth = 612;
      naturalHeight = 792;
      async decode() {}
    },
  );
  URL.createObjectURL = () => "blob:test";
  URL.revokeObjectURL = () => {};
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  HTMLCanvasElement.prototype.getContext = (() => ({
    drawImage() {},
    getImageData(_x: number, _y: number, width: number, height: number) {
      return { data: new Uint8ClampedArray(width * height * 4) };
    },
    fillRect() {},
    strokeRect() {},
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  vi.stubGlobal("confirm", () => true);
  vi.stubGlobal("fetch", async (url: string) => ({
    ok: true,
    blob: async () => new Blob([url]),
  }));
  await import("../../src/apps/editor/main");
});
it("shows the app name and score library action on the home screen", async () => {
  for (const id of ["review-add-score"])
    expect((document.getElementById(id) as HTMLButtonElement).disabled).toBe(
      true,
    );
  for (const id of ["replace-close", "vocal-close"]) {
    expect(document.querySelector(`#${id} svg`)).not.toBeNull();
    expect(document.getElementById(id)!.getAttribute("aria-label")).toBe(
      "닫기",
    );
  }
  expect(document.getElementById("review-help")!.hidden).toBe(true);
  expect(document.getElementById("review-add-score")!.hidden).toBe(true);
  expect(document.getElementById("view-description")!.textContent).toContain(
    "옆으로 이어집니다",
  );
  set("view", "rows");
  document.getElementById("view")!.dispatchEvent(new Event("change"));
  expect(document.getElementById("view-description")!.textContent).toContain(
    "두 줄",
  );
  set("view", "ribbon");
  document.getElementById("view")!.dispatchEvent(new Event("change"));
  expect(document.getElementById("song-title")!.textContent).toBe("악보제작기");
  await vi.waitFor(() =>
    expect(document.querySelector("#welcome h2")!.textContent).toBe(
      "기본 연습곡",
    ),
  );
  expect(document.getElementById("original-tempo")!.hidden).toBe(true);
  expect(document.getElementById("welcome-new")!.textContent).toContain(
    "새 악보 만들기",
  );
  expect(
    document.querySelector(".editor-player-link")!.getAttribute("href"),
  ).toBe("/player.html");
  await vi.waitFor(() =>
    expect(document.getElementById("editor-home-list")!.textContent).toContain(
      "악보 불러오기",
    ),
  );
  const libraryButton = document.getElementById("library-button")!;
  expect(libraryButton.closest("[hidden]")).toBeNull();
  expect(libraryButton.querySelector("svg")).not.toBeNull();
  libraryButton.click();
  await vi.waitFor(() =>
    expect(document.getElementById("welcome")!.hidden).toBe(false),
  );
});
it("opens the saved score through the catalog, exposes fixed range slots and applies the selected BPM", async () => {
  // Keep the existing PDF fixture and media stubs; enter through the visible saved card.
  await saveRecord({
    song: JSON.parse(readFileSync("public/demo/song.json", "utf8")),
    pdf: new Blob(["/demo/score.pdf"]),
    audio: new Blob(["/demo/audio.mp3"]),
    pages: [1, 2, 3].map((page) => new Blob([`/demo/page-${page}.png`])),
  });
  await openSavedScore("real-paradis");
  await vi.waitFor(() =>
    expect(document.querySelectorAll(".measure")).toHaveLength(110),
  );
  await vi.waitFor(async () =>
    expect((await allRecords()).some((r) => r.song.id === "real-paradis")).toBe(
      true,
    ),
  );
  expect(document.querySelectorAll("#section-shortcuts button")).toHaveLength(
    9,
  );
  await vi.waitFor(() =>
    expect(document.querySelectorAll("#loop-slots button")).toHaveLength(9),
  );
  set("rate", "89");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(() =>
    expect((document.getElementById("rate") as HTMLInputElement).value).toBe(
      "89",
    ),
  );
  // The editor debounces persistence for 400ms, then serializes the real media.
  // Allow that save to finish under the full suite's worker/IO load.
  await vi.waitFor(
    async () => {
      const r = (await allRecords()).find((r) => r.song.id === "real-paradis")!;
      expect(r.song.settings.rate).toBeCloseTo(89 / 94, 12);
    },
    { timeout: 5000 },
  );
});
it("accepts BPM input and clamps to the supported audio range", async () => {
  set("rate", "80");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(
    () => {
      expect((document.getElementById("rate") as HTMLInputElement).value).toBe(
        "80",
      );
      expect(
        (document.getElementById("original-tempo") as HTMLButtonElement)
          .disabled,
      ).toBe(false);
      expect(
        document.getElementById("original-tempo-value")!.textContent,
      ).toMatch(/^= 80(?:\.0)?$/);
    },
    { timeout: 5000 },
  );
  set("rate", "85");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(
    () => {
      expect((document.getElementById("rate") as HTMLInputElement).value).toBe(
        "85",
      );
      expect(
        (document.getElementById("original-tempo") as HTMLButtonElement)
          .disabled,
      ).toBe(false);
      expect(
        document.getElementById("original-tempo-value")!.textContent,
      ).toMatch(/^= 85(?:\.0)?$/);
    },
    { timeout: 5000 },
  );
  await vi.waitFor(async () => {
    const r = (await allRecords()).find((r) => r.song.id === "real-paradis")!;
    expect(r.song.settings.rate).toBeCloseTo(85 / 94, 12);
  });
  set("rate", "999");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(
    () => {
      expect((document.getElementById("rate") as HTMLInputElement).value).toBe(
        "112.8",
      );
      expect(
        (document.getElementById("original-tempo") as HTMLButtonElement)
          .disabled,
      ).toBe(false);
      expect(
        document.getElementById("original-tempo-value")!.textContent,
      ).toMatch(/^= 112\.8(?:\.0)?$/);
    },
    { timeout: 5000 },
  );
  set("rate", "94");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(
    () => {
      expect((document.getElementById("rate") as HTMLInputElement).value).toBe(
        "94",
      );
      expect(
        (document.getElementById("original-tempo") as HTMLButtonElement)
          .disabled,
      ).toBe(false);
      expect(
        document.getElementById("original-tempo-value")!.textContent,
      ).toMatch(/^= 94(?:\.0)?$/);
    },
    { timeout: 5000 },
  );
});
it("opens practice BPM from the heading and resets through the explicit original tempo action", async () => {
  const heading = document.getElementById(
    "original-tempo",
  ) as HTMLButtonElement;
  expect(heading.tagName).toBe("BUTTON");
  expect(heading.disabled).toBe(false);
  navigateToMeasure(25);
  const position = audioClock.position;
  set("rate", "80");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(
    async () =>
      expect(
        (await allRecords()).find((r) => r.song.id === "real-paradis")!.song
          .settings.rate,
      ).toBeCloseTo(80 / 94),
    { timeout: 5000 },
  );
  click("original-tempo");
  expect(
    (document.getElementById("tempo-dialog") as HTMLDialogElement).open,
  ).toBe(true);
  expect((document.getElementById("rate") as HTMLInputElement).value).toBe(
    "80",
  );
  click("tempo-reset");
  await vi.waitFor(
    () => {
      expect((document.getElementById("rate") as HTMLInputElement).value).toBe(
        "94",
      );
      expect(
        (document.getElementById("original-tempo") as HTMLButtonElement)
          .disabled,
      ).toBe(false);
      expect(
        document.getElementById("original-tempo-value")!.textContent,
      ).toMatch(/^= 94(?:\.0)?$/);
    },
    { timeout: 5000 },
  );
  (document.getElementById("tempo-dialog") as HTMLDialogElement).close();
  animationFrame(0);
  expect(audioClock.position).toBe(position);
  expect(progressInput().value).toBe("25");
  click("home");
});
it("keeps direct tool access and previews the actual measure while scrubbing", async () => {
  for (const id of ["review-add-score"])
    expect((document.getElementById(id) as HTMLButtonElement).disabled).toBe(
      false,
    );
  expect(document.getElementById("song-title")!.textContent).toContain(
    "바람과 언덕의 발라드 - Real Paradis",
  );
  expect(document.getElementById("original-tempo-value")!.textContent).toBe(
    "= 94.0",
  );
  expect(
    document.querySelectorAll(".repeat-presets [data-loop-radius]"),
  ).toHaveLength(4);
  expect(
    document.getElementById("music-volume")!.closest(".settings-sidebar"),
  ).not.toBeNull();
  expect(
    document.getElementById("progress-percent")!.closest(".dock-navigation"),
  ).not.toBeNull();
  expect(document.querySelectorAll("#practice details")).toHaveLength(0);
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  set("goto", "0");
  click("jump");
  const notice = document.getElementById("error-notice")!;
  expect(notice.hidden).toBe(false);
  expect(notice.closest(".statusline")).not.toBeNull();
  expect(notice.textContent).toContain(
    "이동할 마디 수를 1~10 중에서 선택하세요",
  );
  click("error-notice-close");
  expect(notice.hidden).toBe(true);
  set("goto", "1");
  errorSpy.mockRestore();
  expect(
    document.getElementById("view")!.closest("#screen-dialog"),
  ).not.toBeNull();
  expect(document.getElementById("view")!.hidden).toBe(true);
  expect(
    (
      document.querySelector(
        '#view option[value="compare"]',
      ) as HTMLOptionElement
    ).disabled,
  ).toBe(true);
  expect(
    (document.getElementById("prefer-pdf") as HTMLInputElement).checked,
  ).toBe(true);
  expect(
    (document.getElementById("prefer-pdf") as HTMLInputElement).disabled,
  ).toBe(true);
  expect(document.getElementById("review-availability")!.textContent).toContain(
    "MusicXML",
  );

  set("view", "rows");
  document.getElementById("view")!.dispatchEvent(new Event("change"));
  expect(
    document.getElementById("practice")!.classList.contains("two-rows"),
  ).toBe(true);
  expect(document.getElementById("zoom")!.closest("label")!.hidden).toBe(true);
  set("view", "ribbon");
  document.getElementById("view")!.dispatchEvent(new Event("change"));
  expect(document.getElementById("zoom")!.closest("label")!.hidden).toBe(false);
  navigateToMeasure(25);
  const progress = progressInput();
  expect(progress.getAttribute("aria-valuetext")).toMatch(/^25 \/ 110 · /);
  const position = audioClock.position;
  dragProgress("pointerdown", 100);
  dragProgress("pointermove", 108);
  animationFrame(0);
  expect(progress.getAttribute("aria-valuenow")).toBe("26");
  dragProgress("pointercancel", 108);
  animationFrame(0);
  expect(progress.value).toBe("25");
  expect(audioClock.position).toBe(position);
  click("play");
  await vi.waitFor(() =>
    expect(document.getElementById("play")!.getAttribute("aria-label")).toBe(
      "일시정지",
    ),
  );
  dragProgress("pointerdown", 100);
  dragProgress("pointermove", 108);
  expect(document.getElementById("play")!.getAttribute("aria-label")).toBe(
    "재생",
  );
  dragProgress("pointerup", 108);
  await vi.waitFor(() =>
    expect(document.getElementById("play")!.getAttribute("aria-label")).toBe(
      "일시정지",
    ),
  );
  click("play");
  click("home");
  animationFrame(0);
  expect(progress.getAttribute("aria-valuetext")).toMatch(/^1 \/ 110 · /);
  const stoppedReadouts = new MutationObserver(() => {});
  for (const id of ["editor-time", "progress-percent"])
    stoppedReadouts.observe(document.getElementById(id)!, {
      childList: true,
      attributes: true,
    });
  for (let i = 0; i < 3; i++) animationFrame(0);
  expect(stoppedReadouts.takeRecords()).toHaveLength(0);
  stoppedReadouts.disconnect();
  await openEditorPane("meta");
  const replaceScore = document.getElementById("file-xml")!;
  expect(replaceScore.closest("[hidden]")).toBeNull();
  click("file-xml");
  expect(
    (document.getElementById("replace-score-dialog") as HTMLDialogElement).open,
  ).toBe(true);
  click("replace-close");
  set("edit-artist", "Real Paradis");
  const before = (await allRecords()).find((r) => r.song.id === "real-paradis")!
    .song.measures[0].start;
  set("edit-original-title", "Original title saved from toolbar");
  set("edit-composer", "Composer saved from toolbar");
  click("edit-commit");
  await vi.waitFor(
    async () => {
      const s = (await allRecords()).find(
        (r) => r.song.id === "real-paradis",
      )!.song;
      expect(s.artist).toBe("Real Paradis");
      expect(s.originalTitle).toBe("Original title saved from toolbar");
      expect(s.composer).toBe("Composer saved from toolbar");
      expect(s.measures[0].start).toBe(before);
    },
    { timeout: 5000 },
  );
});
it("groups screen, playback, score management and app info in settings", async () => {
  for (const dialog of document.querySelectorAll<HTMLDialogElement>(
    "dialog[open]",
  ))
    dialog.close();
  click("open-settings-dialog");
  expect(
    (document.getElementById("settings-dialog") as HTMLDialogElement).open,
  ).toBe(true);
  expect(
    [
      ...document.querySelectorAll<HTMLElement>(
        "[data-settings-category]:not([hidden])",
      ),
    ].map((e) => e.dataset.settingsCategory),
  ).toEqual(["screen", "playback", "score", "info"]);
  expect(
    document.querySelectorAll("[data-settings-panel]:not([hidden])"),
  ).toHaveLength(4);
  expect(
    document.getElementById("auto-fullscreen")!.closest("#screen-dialog"),
  ).not.toBeNull();
  click("open-score-settings");
  expect(document.getElementById("score-settings")!.hidden).toBe(false);
  const libraryBackup = document.getElementById(
    "library-backup",
  ) as HTMLDetailsElement;
  libraryBackup.open = true;
  for (const id of ["library-backup-export", "library-backup-restore"]) {
    const button = document.getElementById(id)!;
    expect(button.closest("#score-settings")).not.toBeNull();
    expect(button.closest("[hidden]")).toBeNull();
  }
  libraryBackup.open = false;
  expect(document.getElementById("screen-dialog")!.hidden).toBe(false);
  click("open-score-settings");
  const editEntry = document.getElementById(
    "score-edit-entry",
  ) as HTMLButtonElement;
  expect(editEntry.closest("#score-settings")).not.toBeNull();
  expect(editEntry.closest("[hidden]")).toBeNull();
  expect(editEntry.disabled).toBe(false);
  click("open-info-settings");
  expect(
    document.getElementById("busy")!.closest("#info-settings"),
  ).not.toBeNull();
  const buildInfo = JSON.parse(
    readFileSync("src/generated/build-info.generated.json", "utf8"),
  );
  expect(Object.keys(buildInfo).sort()).toEqual(["builtAt", "source"]);
  expect(buildInfo.source).toMatch(/^[a-f0-9]{12}$/);
  expect(document.getElementById("app-version")!.textContent).toBe(
    `v${JSON.parse(readFileSync("src/app-versions.json", "utf8")).editor.version} · build ${buildInfo.source.slice(0, 8)}`,
  );
  expect(document.querySelector(".app-info h4")).toBeNull();
  expect(
    [...document.querySelectorAll(".app-info dt")].map((e) => e.textContent),
  ).toEqual(["버전", "빌드 시각"]);
  const kst = new Date(
    new Date(buildInfo.builtAt).getTime() + 9 * 60 * 60 * 1000,
  );
  // Korean date separators vary by ICU/CLDR version; the KST fields must not.
  const displayedBuildTime = document
    .getElementById("app-built-at")!
    .textContent.match(
      /^(\d{4})[./]\s*(\d{1,2})[./]\s*(\d{1,2})\.?\s+(\d{2}):(\d{2}) KST$/,
    );
  expect(displayedBuildTime?.slice(1).map(Number)).toEqual([
    kst.getUTCFullYear(),
    kst.getUTCMonth() + 1,
    kst.getUTCDate(),
    kst.getUTCHours(),
    kst.getUTCMinutes(),
  ]);
  click("open-playback-settings");
  expect(
    (document.getElementById("restart-measure") as HTMLInputElement).checked,
  ).toBe(true);
  expect(
    (document.getElementById("count-off") as HTMLInputElement).checked,
  ).toBe(true);
  click("restart-measure");
  click("count-off");
  expect(JSON.parse(localStorage.getItem("drum-practice.playback")!)).toEqual({
    restartMeasure: false,
    countOff: false,
  });
  click("restart-measure");
  click("count-off");
  (document.getElementById("settings-dialog") as HTMLDialogElement).close();
  (document.getElementById("editor-dialog") as HTMLDialogElement).close();
  // The unified editor keeps its session while navigating settings. Resolve
  // any pending exit explicitly before exercising playback below.
  const discard = document.querySelector<HTMLButtonElement>(
    '#edit-exit-dialog [data-answer="discard"]',
  )!;
  discard.click();
  await vi.waitFor(() => expect(discard.disabled).toBe(false), {
    timeout: 5000,
  });
});
it("returns to earlier measures and stops at the first measure", () => {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  navigateToMeasure(25);
  audioClock.position += 0.5;
  set("goto", "4");
  click("jump");
  animationFrame(0);
  expect(audioClock.position).toBeCloseTo(song.measures[20].start);
  expect(progressInput().value).toBe("21");
  navigateToMeasure(5);
  set("goto", "10");
  click("jump");
  animationFrame(0);
  expect(audioClock.position).toBeCloseTo(song.measures[0].start);
  expect(progressInput().value).toBe("1");
  click("home");
  set("goto", "1");
});

it("places the beat on the active measure in rows and on the fixed playhead in ribbon", () => {
  set("view", "rows");
  document.getElementById("view")!.dispatchEvent(new Event("change"));
  navigateToMeasure(25);
  audioClock.position += 0.7;
  animationFrame(0);
  expect(
    document.querySelector(".measure.active")!.getAttribute("data-index"),
  ).toBe("24");
  expect(
    document.querySelector(".measure.active .measure-beat")!.textContent,
  ).toBe("2");
  expect(document.getElementById("playhead-status")!.hidden).toBe(true);
  set("view", "ribbon");
  document.getElementById("view")!.dispatchEvent(new Event("change"));
  animationFrame(0);
  expect(document.getElementById("playhead-status")!.hidden).toBe(false);
  expect(document.getElementById("playhead-status")!.parentElement!.id).toBe(
    "stage",
  );
  expect(document.getElementById("playhead-bar")!.textContent).toBe("25 마디");
  expect(document.getElementById("playhead-beat")!.textContent).toBe("2");
  click("home");
});
it("fills played measures, advances within a measure and clears future shading after rewind", () => {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  set("view", "rows");
  document.getElementById("view")!.dispatchEvent(new Event("change"));
  navigateToMeasure(26);
  const advanceAudio = (time: number) => {
    audioClock.position = time;
    animationFrame(0);
  };
  const fill = (index: number) =>
    parseFloat(
      (
        document.querySelector(`[data-index="${index}"]`) as HTMLElement
      ).style.getPropertyValue("--played"),
    );
  const m = song.measures[25];
  advanceAudio(m.start + (m.end - m.start) * 0.25);
  expect(fill(24)).toBe(100);
  const first = fill(25);
  expect(first).toBeGreaterThan(0);
  expect(first).toBeLessThan(100);
  expect(fill(26)).toBe(0);
  advanceAudio(m.start + (m.end - m.start) * 0.75);
  expect(fill(25)).toBeGreaterThan(first);
  advanceAudio(m.end - 0.0001);
  const beforeBoundary = fill(26);
  advanceAudio(m.end);
  expect(fill(25)).toBe(100);
  expect(Math.abs(fill(26) - beforeBoundary)).toBeLessThan(0.1);
  navigateToMeasure(25);
  expect(fill(25)).toBe(0);
  expect(fill(26)).toBe(0);
  click("home");
});
it("keeps icon controls accessible and updates play and metronome states", async () => {
  expect(
    document.getElementById("open-settings-dialog")!.getAttribute("aria-label"),
  ).toBe("설정");
  expect(document.getElementById("click")!.previousElementSibling!.id).toBe(
    "original-tempo",
  );
  expect(document.getElementById("fullscreen")).toBeNull();
  expect(
    document.querySelector('#export-choices input[value="html"]'),
  ).toBeNull();
  expect(
    document.getElementById("rate")!.closest("#tempo-dialog"),
  ).not.toBeNull();
  expect(document.getElementById("jump")!.getAttribute("aria-label")).toContain(
    "되감기",
  );
  click("play");
  await vi.waitFor(() =>
    expect(document.getElementById("play")!.getAttribute("aria-label")).toBe(
      "일시정지",
    ),
  );
  click("play");
  expect(document.getElementById("play")!.getAttribute("aria-label")).toBe(
    "재생",
  );
  const metronome = document.getElementById("click") as HTMLButtonElement;
  expect(metronome.dataset.metronomeMode).toBe("quarter");
  metronome.click();
  expect(metronome.dataset.metronomeMode).toBe("eighth");
  metronome.click();
  expect(metronome.dataset.metronomeMode).toBe("off");
  metronome.click();
  expect(metronome.dataset.metronomeMode).toBe("quarter");
});
it("offers tempo presets and previews single-BPM dragging until release", async () => {
  click("original-tempo");
  expect(document.getElementById("tempo-dialog")!.hasAttribute("open")).toBe(
    true,
  );
  expect(document.querySelectorAll("#tempo-options button")).toHaveLength(9);
  expect(
    document.querySelectorAll('#tempo-dialog [data-tempo="94"]'),
  ).toHaveLength(2);
  expect(document.getElementById("tempo-score")!.textContent).toBe("94 BPM");
  expect(document.getElementById("tempo-reset")).not.toBeNull();
  (document.querySelector('[data-tempo="76"]') as HTMLButtonElement).click();
  await vi.waitFor(async () =>
    expect(
      (await allRecords()).find((r) => r.song.id === "real-paradis")!.song
        .settings.rate,
    ).toBeCloseTo(76 / 94),
  );
  const input = document.getElementById("rate") as HTMLInputElement;
  input.setPointerCapture = () => {};
  input.hasPointerCapture = () => false;
  const pointer = (name: string, x: number) => {
    const e = new Event(name, { bubbles: true, cancelable: true });
    Object.assign(e, {
      pointerId: 1,
      pointerType: "touch",
      clientX: x,
      clientY: 100,
      button: 0,
      isPrimary: true,
    });
    input.dispatchEvent(e);
  };
  pointer("pointerdown", 100);
  pointer("pointermove", 116);
  expect(input.value).toBe("78");
  expect(
    (await allRecords()).find((r) => r.song.id === "real-paradis")!.song
      .settings.rate,
  ).toBeCloseTo(76 / 94);
  pointer("pointerup", 116);
  await vi.waitFor(async () =>
    expect(
      (await allRecords()).find((r) => r.song.id === "real-paradis")!.song
        .settings.rate,
    ).toBeCloseTo(78 / 94),
  );
  pointer("pointerdown", 100);
  pointer("pointermove", 84);
  expect(input.value).toBe("76");
  pointer("pointercancel", 84);
  expect(input.value).toBe("78");
  pointer("pointerdown", 100);
  pointer("pointerup", 100);
  expect(input.value).toBe("78");
  pointer("pointerdown", 100);
  pointer("pointerup", 100);
  expect(input.value).toBe("78");
  click("tempo-reset");
  await vi.waitFor(() => expect(input.value).toBe("94"));
  (document.getElementById("tempo-dialog") as HTMLDialogElement).close();
});
it("keeps centred repeat anchored when changing radius and uses inclusive end bars", () => {
  navigateToMeasure(25);
  audioClock.position += 0.2;
  (
    document.querySelector('[data-loop-radius="2"]') as HTMLButtonElement
  ).click();
  expect(document.querySelector('[data-loop-radius="2"]')!.textContent).toBe(
    "23~27",
  );
  navigateToMeasure(26);
  (
    document.querySelector('[data-loop-radius="1"]') as HTMLButtonElement
  ).click();
  expect(document.querySelector('[data-loop-radius="1"]')!.textContent).toBe(
    "24~26",
  );
  click("open-loop-dialog");
  expect(
    document.getElementById("open-loop-dialog")!.getAttribute("aria-pressed"),
  ).toBe("false");
  click("home");
  expect(document.querySelector('[data-loop-radius="1"]')!.textContent).toBe(
    "24~26",
  );
});
it("selects a measure on single tap and starts range registration on paused double tap", async () => {
  const view = document.getElementById("view") as HTMLSelectElement;
  const oldView = view.value;
  view.value = "rows";
  view.dispatchEvent(new Event("change"));
  animationFrame(0);
  const stage = document.getElementById("stage")!;
  stage.scrollTop = 375;
  const measure = document.querySelector<HTMLElement>(
    '#ribbon [data-index="6"]',
  )!;
  expect(measure).not.toBeNull();
  const tap = () => {
    for (const type of ["pointerdown", "pointerup"]) {
      const e = new Event(type, { bubbles: true, cancelable: true });
      Object.assign(e, {
        pointerId: 1,
        pointerType: "touch",
        isPrimary: true,
        button: 0,
        clientX: 210,
        clientY: 100,
      });
      measure.dispatchEvent(e);
    }
  };
  tap();
  await new Promise((ok) => setTimeout(ok, 300));
  animationFrame(0);
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  expect(audioClock.position).toBeCloseTo(song.measures[6].start);
  expect(document.getElementById("play")!.getAttribute("aria-label")).toBe(
    "재생",
  );
  expect(stage.scrollTop).toBe(375);
  expect(measure.classList.contains("active")).toBe(true);
  tap();
  tap();
  await new Promise((ok) => setTimeout(ok, 300));
  animationFrame(0);
  expect(audioClock.position).toBeCloseTo(song.measures[6].start);
  expect(document.getElementById("play")!.getAttribute("aria-label")).toBe(
    "재생",
  );
  expect(document.querySelector("#loop-slots")!.textContent).toContain("7~?");
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  // Starting with the dedicated play button must also put an odd row on top.
  click("play");
  animationFrame(0);
  expect(
    [...stage.querySelectorAll<HTMLElement>("[data-index]")]
      .slice(0, 4)
      .map((el) => Number(el.dataset.index)),
  ).toEqual([4, 5, 6, 7]);
  click("play");
  click("home");
  view.value = oldView;
  view.dispatchEvent(new Event("change"));
  animationFrame(0);
});
it("separates tap playback, percent drag and cancelled gestures", async () => {
  const stage = document.getElementById("stage")!;
  const fire = (el: HTMLElement, name: string, x: number, y = 100) => {
    const e = new Event(name, { bubbles: true, cancelable: true });
    Object.assign(e, {
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      button: 0,
      clientX: x,
      clientY: y,
    });
    el.dispatchEvent(e);
  };
  fire(stage, "pointerdown", 100);
  fire(stage, "pointerup", 100);
  document.dispatchEvent(
    new KeyboardEvent("keydown", { code: "Space", bubbles: true }),
  );
  await new Promise((ok) => setTimeout(ok, 300));
  expect(document.getElementById("play")!.getAttribute("aria-label")).toBe(
    "일시정지",
  );
  fire(stage, "pointerdown", 100);
  fire(stage, "pointerup", 100);
  expect(document.getElementById("play")!.getAttribute("aria-label")).toBe(
    "재생",
  );
  fire(stage, "pointerdown", 100);
  fire(stage, "pointerup", 100);
  await new Promise((ok) => setTimeout(ok, 300));
  expect(document.getElementById("play")!.getAttribute("aria-label")).toBe(
    "일시정지",
  );
  click("play");
  const percent = document.getElementById(
    "progress-percent",
  ) as HTMLInputElement;
  animationFrame(0);
  const initial = Number(percent.value);
  fire(percent, "pointerdown", 100);
  fire(percent, "pointermove", 180);
  fire(percent, "pointerup", 180);
  animationFrame(0);
  expect(Number(percent.value)).toBe(initial + 10);
  expect(audioClock.position).toBeCloseTo(
    JSON.parse(readFileSync("public/demo/song.json", "utf8")).measures[
      initial + 9
    ].start,
  );
  fire(percent, "pointerdown", 100);
  fire(percent, "pointermove", 100, 84);
  fire(percent, "pointercancel", 100, 84);
  animationFrame(0);
  expect(Number(percent.value)).toBe(initial + 10);
  click("home");
});
it("browses all paused rows vertically without seeking, then restores playback following", async () => {
  const stage = document.getElementById("stage")!;
  // jsdom has no layout; provide a visible width for the fixed score rows.
  Object.defineProperty(stage, "clientWidth", {
    configurable: true,
    value: 1000,
  });
  const view = document.getElementById("view") as HTMLSelectElement;
  const progress = progressInput();
  const oldView = view.value,
    oldMeasure = Number(progress.value);
  view.value = "rows";
  view.dispatchEvent(new Event("change"));
  navigateToMeasure(25);
  animationFrame(0);
  const before = audioClock.position;
  const count = (await allRecords()).find((r) => r.song.id === "real-paradis")!
    .song.measures.length;
  expect(stage.classList.contains("paused-score-scroll")).toBe(true);
  expect(
    new Set(
      [...stage.querySelectorAll<HTMLElement>("[data-index]")].map(
        (el) => el.dataset.index,
      ),
    ).size,
  ).toBe(count);
  stage.scrollTop = 400;
  const wheel = new WheelEvent("wheel", {
    deltaY: 100,
    bubbles: true,
    cancelable: true,
  });
  stage.dispatchEvent(wheel);
  animationFrame(0);
  expect(wheel.defaultPrevented).toBe(false);
  expect(stage.scrollTop).toBe(400);
  expect(audioClock.position).toBe(before);
  expect(progress.value).toBe("25");
  const rowsBefore = [...stage.querySelectorAll(".browse-strip")].map((row) =>
    [...row.querySelectorAll<HTMLElement>("[data-index]")].map(
      (el) => el.dataset.index,
    ),
  );
  expect(rowsBefore[0]).toEqual(["0", "1", "2", "3"]);
  expect(rowsBefore.every((row) => row.length <= 4)).toBe(true);
  const horizontal = new WheelEvent("wheel", {
    deltaX: 100,
    bubbles: true,
    cancelable: true,
  });
  stage.dispatchEvent(horizontal);
  animationFrame(0);
  // Paused rows keep wheel input passive; horizontal input must still not seek.
  expect(horizontal.defaultPrevented).toBe(false);
  expect(audioClock.position).toBe(before);
  expect(progress.value).toBe("25");
  expect(
    [...stage.querySelectorAll(".browse-strip")].map((row) =>
      [...row.querySelectorAll<HTMLElement>("[data-index]")].map(
        (el) => el.dataset.index,
      ),
    ),
  ).toEqual(rowsBefore);
  const resumedFrom = audioClock.position;
  click("play");
  await vi.waitFor(() =>
    expect(document.getElementById("play")!.getAttribute("aria-label")).toBe(
      "일시정지",
    ),
  );
  animationFrame(0);
  expect(stage.classList.contains("paused-score-scroll")).toBe(false);
  expect(stage.scrollTop).toBe(0);
  expect(stage.querySelectorAll("[data-index]").length).toBeLessThanOrEqual(8);
  expect(audioClock.position).toBe(resumedFrom);
  click("play");
  animationFrame(0);
  expect(
    new Set(
      [...stage.querySelectorAll<HTMLElement>("[data-index]")].map(
        (el) => el.dataset.index,
      ),
    ).size,
  ).toBe(count);
  Reflect.deleteProperty(stage, "clientWidth");
  navigateToMeasure(oldMeasure);
  view.value = oldView;
  view.dispatchEvent(new Event("change"));
  animationFrame(0);
});
it("prepares a distinct second song through the file form without code edits", async () => {
  click("library-button");
  await vi.waitFor(() =>
    expect(document.getElementById("welcome")!.hidden).toBe(false),
  );
  expect(
    document.getElementById("library-button")!.getAttribute("aria-label"),
  ).toBe("내 악보 목록");
  expect(
    document.getElementById("welcome-new")!.closest("header"),
  ).not.toBeNull();
  click("welcome-new");
  expect(document.getElementById("new-dialog")!.hasAttribute("open")).toBe(
    true,
  );
  set("new-title", "독립 두 번째 곡");
  set("new-bpm", "100");
  set("new-lyrics", "새로운 가사");
  Object.defineProperty(document.getElementById("pdf-file"), "files", {
    value: [new File(["pdf"], "second.pdf", { type: "application/pdf" })],
    configurable: true,
  });
  Object.defineProperty(document.getElementById("audio-file"), "files", {
    value: [new File(["audio"], "second.mp3", { type: "audio/mpeg" })],
    configurable: true,
  });
  document
    .getElementById("new-form")!
    .dispatchEvent(new Event("submit", { cancelable: true }));
  await vi.waitFor(() =>
    expect(document.getElementById("song-title")!.textContent).toBe(
      "독립 두 번째 곡",
    ),
  );
  expect(document.querySelectorAll(".measure")).toHaveLength(1);
  await vi.waitFor(async () =>
    expect(
      (await allRecords()).some((r) => r.song.title === "독립 두 번째 곡"),
    ).toBe(true),
  );
});
it("reopens a newly imported score from its saved catalog card", async () => {
  await vi.waitFor(() =>
    expect(
      (document.getElementById("editor-dialog") as HTMLDialogElement).open,
    ).toBe(true),
  );
  document
    .querySelector<HTMLButtonElement>('[data-close="editor-dialog"]')!
    .click();
  const saved = (await allRecords()).find(
    (record) => record.song.title === "독립 두 번째 곡",
  )!;
  await openSavedScore(saved.song.id);
  await vi.waitFor(() =>
    expect(document.getElementById("song-title")!.textContent).toBe(
      "독립 두 번째 곡",
    ),
  );
  expect(document.querySelectorAll(".measure")).toHaveLength(1);
});
it("edits lyric starts and duration in musical units without free-time controls", async () => {
  await vi.waitFor(() =>
    expect(
      document.getElementById("busy")!.textContent!.split("\n")[0],
    ).toContain("저장"),
  );
  await openEditorPane("lyrics");
  vi.stubGlobal("prompt", () => "새로운");
  click("add-lyric");
  click("show-all");
  const select = document.querySelector<HTMLSelectElement>(
    '#lyric-editor [data-field="grid-tick"]',
  )!;
  expect(select).not.toBeNull();
  select.value = "5";
  select.dispatchEvent(new Event("change", { bubbles: true }));
  await vi.waitFor(async () => {
    const r = (await allRecords()).find(
      (r) => r.song.title === "독립 두 번째 곡",
    )!;
    expect(r.song.lyrics).toHaveLength(0);
    expect(r.editDraft!.song.lyrics[0].grid?.tick).toBe(5);
    expect(r.editDraft!.song.lyrics[0].time).toBeCloseTo(
      r.song.measures[0].start +
        ((r.song.measures[0].end - r.song.measures[0].start) * 1.25) / 4,
    );
  });
  const duration = document.querySelector<HTMLInputElement>(
    '#lyric-editor [data-field="duration-beats"]',
  )!;
  duration.value = "0.5";
  duration.dispatchEvent(new Event("change", { bubbles: true }));
  click("edit-commit");
  await vi.waitFor(async () => {
    const r = (await allRecords()).find(
      (r) => r.song.title === "독립 두 번째 곡",
    )!;
    expect(r.song.lyrics[0].scorePosition!.durationQuarters).toBe(0.5);
    expect(r.canonicalXML).toContain("DrumPracticeLyrics");
  });
});
it("returns from playback to the shared list and reopens a saved score", async () => {
  for (const d of document.querySelectorAll<HTMLDialogElement>("dialog[open]"))
    d.close();
  click("library-button");
  await vi.waitFor(() =>
    expect(document.body.classList.contains("has-song")).toBe(false),
  );
  expect(document.getElementById("practice")!.hidden).toBe(true);
  expect(document.getElementById("welcome")!.hidden).toBe(false);
  const records = await allRecords();
  await vi.waitFor(() =>
    expect(
      document.querySelectorAll("#editor-home-list [data-editor-remove]"),
    ).toHaveLength(records.length),
  );
  for (const r of records)
    expect(
      document.querySelectorAll(
        `#editor-home-list [data-score-id="${r.song.id}"]`,
      ),
    ).toHaveLength(1);
  const saved = records.find((r) => r.song.title === "독립 두 번째 곡")!;
  let exposedHomeWithPlaybackLayout = false;
  const transition = new MutationObserver(() => {
    if (
      !document.getElementById("welcome")!.hidden &&
      document.body.classList.contains("has-song")
    )
      exposedHomeWithPlaybackLayout = true;
  });
  transition.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class", "hidden"],
  });
  try {
    document
      .querySelector<HTMLButtonElement>(
        `[data-score-id="${saved.song.id}"] [data-editor-open]`,
      )!
      .click();
    await vi.waitFor(() =>
      expect(
        (document.getElementById("editor-dialog") as HTMLDialogElement).open,
      ).toBe(true),
    );
    expect(exposedHomeWithPlaybackLayout).toBe(false);
    expect(document.getElementById("welcome")!.hidden).toBe(true);
    expect(document.body.classList.contains("has-song")).toBe(true);
  } finally {
    transition.disconnect();
  }
  (document.getElementById("editor-dialog") as HTMLDialogElement).close();
});

it("dismisses settings only for an outside gesture and uses icon close controls", () => {
  click("open-settings-dialog");
  const dialog = document.getElementById(
    "settings-dialog",
  ) as HTMLDialogElement;
  const rect = vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue({
    left: 100,
    top: 100,
    right: 800,
    bottom: 600,
  } as DOMRect);
  const gesture = (startX: number, endX: number) => {
    dialog.dispatchEvent(
      new MouseEvent("pointerdown", {
        bubbles: true,
        clientX: startX,
        clientY: 200,
      }),
    );
    dialog.dispatchEvent(
      new MouseEvent("click", { bubbles: true, clientX: endX, clientY: 200 }),
    );
  };
  gesture(200, 20);
  expect(dialog.open).toBe(true);
  gesture(20, 20);
  expect(dialog.open).toBe(false);
  const close = dialog.querySelector("[data-close]")!;
  expect(close.getAttribute("aria-label")).toBe("닫기");
  expect(close.textContent).toBe("");
  expect(close.querySelector("svg")).not.toBeNull();
  rect.mockRestore();
});

it("remembers the settings category and returns from a child only when opened there", async () => {
  const { openSettings, selectSettingsCategory, openSettingsChild } =
    await import("../../src/apps/editor/workspace");
  const settings = document.getElementById(
    "settings-dialog",
  ) as HTMLDialogElement;
  const child = document.getElementById("original-dialog") as HTMLDialogElement;
  const expectCategory = (category: string, title: string) => {
    expect(settings.dataset.settingsCurrent).toBe(category);
    const button = settings.querySelector<HTMLButtonElement>(
      `[data-settings-category="${category}"]`,
    )!;
    expect(button.getAttribute("aria-current")).toBe("location");
    const panel = settings.querySelector<HTMLElement>(
      `[data-settings-panel="${category}"]`,
    )!;
    expect(panel.hidden).toBe(false);
    expect(panel.querySelector(".settings-section-heading")!.textContent).toBe(
      title,
    );
  };
  openSettings("score");
  settings.close();
  openSettings();
  expectCategory("score", "악보");
  expect(localStorage.getItem("drum-practice.settings-category")).toBe("score");
  settings.scrollTop = 50;
  openSettingsChild(child);
  expect(settings.open).toBe(false);
  expect(child.open).toBe(true);
  child.close();
  child.dispatchEvent(new Event("close"));
  expect(settings.open).toBe(true);
  expect(settings.scrollTop).toBe(50);
  expectCategory("score", "악보");
  settings.close();
  openSettingsChild(child);
  child.close();
  child.dispatchEvent(new Event("close"));
  expect(settings.open).toBe(false);
  selectSettingsCategory("info");
  expectCategory("info", "정보");
  localStorage.setItem("drum-practice.settings-category", "playback");
  openSettings();
  expectCategory("playback", "재생");
  settings.close();
});

it("groups view and format choices above the existing switches", async () => {
  const { selectSettingsCategory } =
    await import("../../src/apps/editor/workspace");
  selectSettingsCategory("screen");
  const pdf = document.getElementById("pdf-view-row")!;
  expect(pdf.classList.contains("settings-choice-row")).toBe(true);
  expect([...pdf.querySelectorAll("button")].map((b) => b.textContent)).toEqual(
    ["PDF 원본 악보", "MusicXML 악보"],
  );
  const viewButtons = [
    ...document.querySelectorAll<HTMLButtonElement>(
      '[data-setting-control="view"]',
    ),
  ];
  expect(viewButtons.map((b) => b.textContent)).toEqual([
    "한 줄로 이어 보기",
    "두줄로 고정 보기",
    "PDF · MusicXML 검수",
  ]);
  viewButtons[1].click();
  expect((document.getElementById("view") as HTMLSelectElement).value).toBe(
    "rows",
  );
  expect(viewButtons[1].getAttribute("aria-pressed")).toBe("true");
  viewButtons[0].click();
  expect((document.getElementById("view") as HTMLSelectElement).value).toBe(
    "ribbon",
  );
  expect(
    document.getElementById("zoom")!.closest("label")!.querySelector("strong")!
      .textContent,
  ).toBe("악보 크기");
});

it("opens marker management and renders sorted fixed slots on the score", async () => {
  click("home");
  navigateToMeasure(1);
  document
    .querySelector<HTMLButtonElement>("#quick-markers .empty-marker-slot")!
    .click();
  expect(
    (document.querySelector('[data-drawer-panel="marker"]') as HTMLElement)
      .hidden,
  ).toBe(false);

  expect(document.querySelectorAll("#quick-markers button")).toHaveLength(5);
  expect(document.querySelector(".dock-repeat > :first-child")!.id).toBe(
    "open-loop-dialog",
  );
  expect(
    document.querySelector("#quick-markers")!.parentElement!.className,
  ).toBe("dock-navigation");
  expect(
    document.querySelectorAll(".measure-marker:not([hidden])").length,
  ).toBeGreaterThan(0);
  const ids = [
    ...document.querySelectorAll<HTMLElement>(
      "#quick-markers [data-quick-marker]",
    ),
  ].map((e) => e.textContent!);
  expect(ids.map(Number)).toEqual(ids.map(Number).sort((a, b) => a - b));
});
it("shows note-follow as unavailable for the active PDF-only score without erasing preference", () => {
  const toggle = document.getElementById("note-highlight") as HTMLInputElement;
  expect(toggle.closest("#screen-dialog")).not.toBeNull();
  expect(toggle.getAttribute("role")).toBe("switch");
  expect(toggle.closest("label")!.textContent).toContain("음표 빛나기");
  expect(toggle.disabled).toBe(true);
  expect(toggle.checked).toBe(false);
  expect(
    document.getElementById("note-highlight-description")!.textContent,
  ).toContain("MusicXML");
  const stored = localStorage.getItem("drum-practice.note-highlight");
  toggle.checked = true;
  toggle.dispatchEvent(new Event("change"));
  expect(toggle.checked).toBe(false);
  expect(localStorage.getItem("drum-practice.note-highlight")).toBe(stored);
});
