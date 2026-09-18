// DOM interaction contract only. Does not claim browser layout/audio or iPad proof.
// @vitest-environment jsdom
import "fake-indexeddb/auto";
import { beforeAll, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { Blob as NativeBlob, File as NativeFile } from "node:buffer";
import { allRecords } from "../src/storage";
vi.mock("../src/pdf", () => ({
  renderPDF: async () => ({
    pages: [new Blob(["page"])],
    regions: [
      { id: "r-new", page: 0, x: 0.1, y: 0.2, w: 0.7, h: 0.1, beatXs: [] },
    ],
  }),
}));
vi.mock("../src/audio", () => ({
  Player: class {
    playing = false;
    position = 0;
    duration = 300;
    song: any;
    loop: any;
    onstate = () => {};
    onprogress = () => {};
    renderRate = 1;
    async load(_b: any, s: any) {
      this.song = s;
      this.position = s.settings.position;
    }
    volumes() {}
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
    async setRate(rate: number) {
      this.song.settings.rate = rate;
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
beforeAll(async () => {
  // jsdom lacks Blob.arrayBuffer; use the standard implementation for media reads.
  vi.stubGlobal("Blob", NativeBlob);
  vi.stubGlobal("File", NativeFile);
  document.body.innerHTML = '<div id="app"></div>';
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { animationFrame = callback; return 0; });
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
    fillRect() {},
    strokeRect() {},
  })) as any;
  vi.stubGlobal("confirm", () => true);
  vi.stubGlobal("fetch", async (url: string) => ({
    ok: true,
    json: async () => JSON.parse(readFileSync("public/demo/song.json", "utf8")),
    blob: async () => new Blob([url]),
  }));
  await import("../src/main");
});
it("loads demo, saves named markers and loops and applies exact 1 BPM step", async () => {
  click("demo-button");
  await vi.waitFor(() =>
    expect(document.querySelectorAll(".measure")).toHaveLength(110),
  );
  expect(document.querySelectorAll(".measure")).toHaveLength(110);
  await vi.waitFor(async () => expect((await allRecords()).some(r => r.song.id === "real-paradis")).toBe(true));
  set("marker-name", "DOM 테스트 필인");
  click("add-marker");
  expect(document.getElementById("markers")!.textContent).toContain(
    "DOM 테스트 필인",
  );
  set("loop-a", "25");
  set("loop-b", "29");
  set("loop-name", "DOM 후렴");
  click("save-loop");
  expect(document.getElementById("loops")!.textContent).toContain("DOM 후렴");
  click("slower");
  await vi.waitFor(() =>
    expect((document.getElementById("rate") as HTMLInputElement).value).toBe(
      "93",
    ),
  );
  await vi.waitFor(async () => {
    const r = (await allRecords()).find((r) => r.song.id === "real-paradis")!;
    expect(r.song.settings.rate).toBeCloseTo(93 / 94, 12);
    expect(r.song.loops.at(-1)!.name).toBe("DOM 후렴");
  });
});
it("accepts BPM input, increments by one BPM and clamps to supported audio range", async () => {
  set("rate", "80");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(() => expect((document.getElementById("rate") as HTMLInputElement).value).toBe("80"));
  click("faster");
  await vi.waitFor(() => expect((document.getElementById("rate") as HTMLInputElement).value).toBe("81"));
  await vi.waitFor(async () => {
    const r = (await allRecords()).find(r => r.song.id === "real-paradis")!;
    expect(r.song.settings.rate).toBeCloseTo(81 / 94, 12);
  });
  set("rate", "999");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(() => expect((document.getElementById("rate") as HTMLInputElement).value).toBe("112.8"));
  set("rate", "94");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(() => expect((document.getElementById("rate") as HTMLInputElement).value).toBe("94"));
});
it("resets playback BPM through the original tempo heading without seeking", async () => {
  const heading = document.getElementById("original-tempo") as HTMLButtonElement;
  expect(heading.tagName).toBe("BUTTON");
  expect(heading.disabled).toBe(false);
  set("seek", "70");
  document.getElementById("seek")!.dispatchEvent(new Event("input"));
  set("rate", "80");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(async () => expect((await allRecords()).find(r => r.song.id === "real-paradis")!.song.settings.rate).toBeCloseTo(80 / 94));
  click("original-tempo");
  await vi.waitFor(() => expect((document.getElementById("rate") as HTMLInputElement).value).toBe("94"));
  animationFrame(0);
  expect((document.getElementById("seek") as HTMLInputElement).value).toBe("70");
  click("home");
});
it("keeps direct tool access and previews the actual measure while scrubbing", async () => {
  expect(document.getElementById("song-title")!.textContent).toContain(
    "Real Paradis -",
  );
  expect(document.getElementById("original-tempo-value")!.textContent).toBe("= 94");
  expect(document.querySelectorAll(".practice-dock > button")).toHaveLength(8);
  expect(document.querySelectorAll("#practice details")).toHaveLength(0);
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  set("goto", "0");
  click("jump");
  const notice = document.getElementById("error-notice")!;
  expect(notice.hidden).toBe(false);
  expect(notice.closest(".statusline")).not.toBeNull();
  expect(notice.textContent).toContain("이동할 마디 수를 1~10 중에서 선택하세요");
  click("error-notice");
  expect(notice.hidden).toBe(true);
  set("goto", "1");
  errorSpy.mockRestore();
  expect(document.getElementById("view")!.closest("#screen-dialog")).not.toBeNull();
  set("view", "rows");
  document.getElementById("view")!.dispatchEvent(new Event("change"));
  expect(document.getElementById("practice")!.classList.contains("two-rows")).toBe(true);
  expect(document.getElementById("zoom")!.closest("label")!.hidden).toBe(true);
  set("view", "ribbon");
  document.getElementById("view")!.dispatchEvent(new Event("change"));
  expect(document.getElementById("zoom")!.closest("label")!.hidden).toBe(false);
  const seek = document.getElementById("seek") as HTMLInputElement;
  set("seek", "62");
  seek.dispatchEvent(new Event("input"));
  expect(document.getElementById("seek-position")!.textContent).toBe("25 마디");
  expect(document.getElementById("seek-position")!.hidden).toBe(false);
  expect(seek.getAttribute("aria-valuetext")).toBe("25 마디");
  // Safari can deliver a final input after releasing the native range thumb.
  seek.dispatchEvent(new Event("pointerdown"));
  window.dispatchEvent(new Event("pointerup"));
  seek.dispatchEvent(new Event("input"));
  seek.dispatchEvent(new Event("change"));
  expect(document.getElementById("seek-position")!.hidden).toBe(true);
  click("home");
  animationFrame(0);
  expect(seek.getAttribute("aria-valuetext")).toBe("1 마디");
  click("metadata-button");
  set("edit-artist", "Real Paradis");
  const before = (await allRecords()).find((r) => r.song.id === "real-paradis")!
    .song.measures[0].start;
  click("save-metadata");
  await vi.waitFor(async () => {
    const s = (await allRecords()).find(
      (r) => r.song.id === "real-paradis",
    )!.song;
    expect(s.artist).toBe("Real Paradis");
    expect(s.measures[0].start).toBe(before);
  });
});
it("returns to earlier measures and stops at the first measure", () => {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  set("seek", String(song.measures[24].start + 0.5));
  document.getElementById("seek")!.dispatchEvent(new Event("input"));
  document.getElementById("seek")!.dispatchEvent(new Event("change"));
  set("goto", "4");
  click("jump");
  animationFrame(0);
  expect(Number((document.getElementById("seek") as HTMLInputElement).value)).toBeCloseTo(song.measures[20].start);
  set("seek", String(song.measures[4].start));
  document.getElementById("seek")!.dispatchEvent(new Event("input"));
  set("goto", "10");
  click("jump");
  animationFrame(0);
  expect(Number((document.getElementById("seek") as HTMLInputElement).value)).toBeCloseTo(song.measures[0].start);
  click("home");
  set("goto", "1");
});

it("places the beat on the active measure in rows and on the fixed playhead in ribbon", () => {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  set("view", "rows");
  document.getElementById("view")!.dispatchEvent(new Event("change"));
  set("seek", String(song.measures[24].start + 0.7));
  document.getElementById("seek")!.dispatchEvent(new Event("input"));
  animationFrame(0);
  expect(document.querySelector(".measure.active")!.getAttribute("data-index")).toBe("24");
  expect(document.querySelector(".measure.active .measure-beat")!.textContent).toBe("2");
  expect(document.getElementById("playhead-status")!.hidden).toBe(true);
  set("view", "ribbon");
  document.getElementById("view")!.dispatchEvent(new Event("change"));
  animationFrame(0);
  expect(document.getElementById("playhead-status")!.hidden).toBe(false);
  expect(document.getElementById("playhead-status")!.parentElement!.id).toBe("stage");
  expect(document.getElementById("playhead-bar")!.textContent).toBe("25 마디");
  expect(document.getElementById("playhead-beat")!.textContent).toBe("2");
  click("home");
});
it("fills played measures, advances within a measure and clears future shading after rewind", () => {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  set("view", "rows");
  document.getElementById("view")!.dispatchEvent(new Event("change"));
  const seekTo = (time: number) => {
    set("seek", String(time));
    document.getElementById("seek")!.dispatchEvent(new Event("input"));
    animationFrame(0);
  };
  const fill = (index: number) => parseFloat((document.querySelector(`[data-index="${index}"]`) as HTMLElement).style.getPropertyValue("--played"));
  const m = song.measures[25];
  seekTo(m.start + (m.end - m.start) * 0.25);
  expect(fill(24)).toBe(100);
  const first = fill(25);
  expect(first).toBeGreaterThan(0);
  expect(first).toBeLessThan(100);
  expect(fill(26)).toBe(0);
  seekTo(m.start + (m.end - m.start) * 0.75);
  expect(fill(25)).toBeGreaterThan(first);
  seekTo(m.end - 0.0001);
  const beforeBoundary = fill(26);
  seekTo(m.end);
  expect(fill(25)).toBe(100);
  expect(Math.abs(fill(26) - beforeBoundary)).toBeLessThan(0.1);
  seekTo(song.measures[24].start);
  expect(fill(25)).toBe(0);
  expect(fill(26)).toBe(0);
  click("home");
});
it("keeps icon controls accessible and updates play and metronome states", async () => {
  expect(document.querySelectorAll(".practice-dock button .ui-icon")).toHaveLength(8);
  expect(document.querySelectorAll(".practice-dock .icon-caption")).toHaveLength(8);
  expect(document.getElementById("jump")!.getAttribute("aria-label")).toContain("되감기");
  click("play");
  await vi.waitFor(() => expect(document.getElementById("play")!.getAttribute("aria-label")).toBe("일시정지"));
  click("play");
  expect(document.getElementById("play")!.getAttribute("aria-label")).toBe("재생");
  const metronome = document.getElementById("click") as HTMLInputElement;
  const initial = metronome.checked;
  metronome.closest("label")!.click();
  expect(metronome.checked).toBe(!initial);
  metronome.closest("label")!.click();
});
it("prepares a distinct second song through the file form without code edits", async () => {
  click("library-button");
  await vi.waitFor(() => expect(document.getElementById("library-dialog")!.hasAttribute("open")).toBe(true));
  expect(document.getElementById("library-button")!.getAttribute("aria-label")).toBe("내 악보 목록");
  expect(document.getElementById("new-button")!.closest("dialog")!.id).toBe("library-dialog");
  click("new-button");
  expect(document.getElementById("library-dialog")!.hasAttribute("open")).toBe(false);
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
