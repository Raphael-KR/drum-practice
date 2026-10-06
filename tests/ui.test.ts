// DOM interaction contract only. Does not claim browser layout/audio or iPad proof.
// @vitest-environment jsdom
import "fake-indexeddb/auto";
import { beforeAll, it, expect, vi } from "vitest";
import { webcrypto } from "node:crypto";
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
  vi.stubGlobal("crypto",webcrypto);
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
    getImageData(_x: number, _y: number, width: number, height: number) { return { data: new Uint8ClampedArray(width * height * 4) }; },
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
it("shows the app name and score library action on the home screen", async () => {
  for(const id of ["replace-score-button","export-musicxml"]) expect((document.getElementById(id) as HTMLButtonElement).disabled).toBe(true);
  for(const id of ["replace-close","vocal-close"]) {
    expect(document.querySelector(`#${id} svg`)).not.toBeNull();
    expect(document.getElementById(id)!.getAttribute("aria-label")).toBe("닫기");
  }
  expect(document.getElementById('review-help')!.hidden).toBe(true);
  expect(document.getElementById('review-add-score')!.hidden).toBe(true);
  expect(document.getElementById('view-description')!.textContent).toContain('옆으로 이어집니다');
  set('view','rows'); document.getElementById('view')!.dispatchEvent(new Event('change'));
  expect(document.getElementById('view-description')!.textContent).toContain('두 줄');
  set('view','ribbon'); document.getElementById('view')!.dispatchEvent(new Event('change'));
  expect(document.getElementById("song-title")!.textContent).toBe("악보제작기");
  expect(document.querySelector("#welcome h2")!.textContent).toBe("제작 중인 악보");
  expect(document.getElementById("original-tempo")!.hidden).toBe(true);
  expect(document.getElementById("demo-button")!.hidden).toBe(true);
  expect(document.getElementById("welcome-new")!.textContent).toContain("새 악보 만들기");
  expect(document.querySelector(".editor-player-link")!.getAttribute("href")).toBe("/player.html");
  await vi.waitFor(() => expect(document.getElementById("editor-home-list")!.textContent).toContain("아직 제작 중인 악보가 없습니다"));
  expect(document.querySelector("#welcome-library svg")!.innerHTML).toBe(document.querySelector("#library-button svg")!.innerHTML);
  click("welcome-library");
  await vi.waitFor(() => expect(document.getElementById("library-dialog")!.hasAttribute("open")).toBe(true));
  (document.getElementById("library-dialog") as HTMLDialogElement).close();
});
it("loads demo, exposes fixed range slots and applies the selected BPM", async () => {
  click("demo-button");
  await vi.waitFor(() =>
    expect(document.querySelectorAll(".measure")).toHaveLength(110),
  );
  expect(document.querySelectorAll(".measure")).toHaveLength(110);
  await vi.waitFor(async () => expect((await allRecords()).some(r => r.song.id === "real-paradis")).toBe(true));
  expect(document.getElementById("marker-name")).toBeNull();
  expect(document.querySelectorAll("#section-shortcuts button")).toHaveLength(9);
  await vi.waitFor(() => expect(document.querySelectorAll("#loop-slots button")).toHaveLength(9));
  expect(document.getElementById("loop-a")).toBeNull();
  set("rate", "89");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(() =>
    expect((document.getElementById("rate") as HTMLInputElement).value).toBe(
      "89",
    ),
  );
  await vi.waitFor(async () => {
    const r = (await allRecords()).find((r) => r.song.id === "real-paradis")!;
    expect(r.song.settings.rate).toBeCloseTo(89 / 94, 12);

  });
});
it("renders the boundary ru once in measure 11, never at the end of measure 10",()=>{
 const text=(index:number)=>[...document.querySelectorAll(`[data-index="${index}"] .syllable`)].map(e=>e.textContent);
 expect(text(9)).not.toContain('루');
 expect(text(10).filter(t=>t==='루')).toHaveLength(1);
});
it("accepts BPM input and clamps to the supported audio range", async () => {
  set("rate", "80");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(() => expect((document.getElementById("rate") as HTMLInputElement).value).toBe("80"));
  set("rate", "85");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(() => expect((document.getElementById("rate") as HTMLInputElement).value).toBe("85"));
  await vi.waitFor(async () => {
    const r = (await allRecords()).find(r => r.song.id === "real-paradis")!;
    expect(r.song.settings.rate).toBeCloseTo(85 / 94, 12);
  });
  set("rate", "999");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(() => expect((document.getElementById("rate") as HTMLInputElement).value).toBe("112.8"));
  set("rate", "94");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(() => expect((document.getElementById("rate") as HTMLInputElement).value).toBe("94"));
});
it("opens practice BPM from the heading and resets through the explicit original tempo action", async () => {
  const heading = document.getElementById("original-tempo") as HTMLButtonElement;
  expect(heading.tagName).toBe("BUTTON");
  expect(heading.disabled).toBe(false);
  set("seek", "70");
  document.getElementById("seek")!.dispatchEvent(new Event("input"));
  set("rate", "80");
  document.getElementById("rate")!.dispatchEvent(new Event("change"));
  await vi.waitFor(async () => expect((await allRecords()).find(r => r.song.id === "real-paradis")!.song.settings.rate).toBeCloseTo(80 / 94));
  click("original-tempo");
  expect((document.getElementById("tempo-dialog") as HTMLDialogElement).open).toBe(true);
  expect((document.getElementById("rate") as HTMLInputElement).value).toBe("80");
  click("tempo-reset");
  await vi.waitFor(() => expect((document.getElementById("rate") as HTMLInputElement).value).toBe("94"));
  (document.getElementById("tempo-dialog") as HTMLDialogElement).close();
  animationFrame(0);
  expect((document.getElementById("seek") as HTMLInputElement).value).toBe("70");
  click("home");
});
it("keeps direct tool access and previews the actual measure while scrubbing", async () => {
  for(const id of ["replace-score-button","export-musicxml"]) expect((document.getElementById(id) as HTMLButtonElement).disabled).toBe(false);
  expect(document.getElementById("song-title")!.textContent).toContain(
    "바람과 언덕의 발라드 - Real Paradis",
  );
  expect(document.getElementById("original-tempo-value")!.textContent).toBe("= 94");
  expect(document.querySelector(".practice-dock")).toBeNull();
  expect(document.querySelectorAll(".repeat-presets [data-loop-radius]")).toHaveLength(4);
  expect(document.getElementById("open-sound-dialog")).toBeNull();
  expect(document.getElementById("sound-dialog")).toBeNull();
  expect(document.getElementById("music-volume")!.closest(".settings-sidebar")).not.toBeNull();
  expect(document.getElementById("progress-percent")!.closest(".dock-navigation")).not.toBeNull();
  expect(document.getElementById("seek")!.closest<HTMLElement>(".seekrow")!.hidden).toBe(true);
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
  expect(document.querySelectorAll('input[name="score-view"]')).toHaveLength(0);
  expect(document.getElementById('view')!.hidden).toBe(true);
  expect((document.querySelector('#view option[value="compare"]') as HTMLOptionElement).disabled).toBe(true);
  expect((document.getElementById('prefer-pdf') as HTMLInputElement).checked).toBe(true);
  expect((document.getElementById('prefer-pdf') as HTMLInputElement).disabled).toBe(true);
  expect(document.getElementById('review-availability')!.textContent).toContain('MusicXML');

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
  expect(document.getElementById("save-metadata")).toBeNull();
  set("edit-original-title", "Original title saved from toolbar");
  set("edit-composer", "Composer saved from toolbar");
  click("edit-commit");
  await vi.waitFor(async () => {
    const s = (await allRecords()).find(
      (r) => r.song.id === "real-paradis",
    )!.song;
    expect(s.artist).toBe("Real Paradis");
    expect(s.originalTitle).toBe("Original title saved from toolbar");
    expect(s.composer).toBe("Composer saved from toolbar");
    expect(s.measures[0].start).toBe(before);
  });
});
it("groups screen, playback, score management and app info in settings", () => {
  for (const dialog of document.querySelectorAll<HTMLDialogElement>("dialog[open]")) dialog.close();
  click("open-settings-dialog");
  expect((document.getElementById("settings-dialog") as HTMLDialogElement).open).toBe(true);
  expect([...document.querySelectorAll<HTMLElement>("[data-settings-category]")].map(e=>e.dataset.settingsCategory)).toEqual(["screen","playback","score","info"]);
  expect(document.querySelectorAll("[data-settings-panel]:not([hidden])")).toHaveLength(4);
  expect(document.getElementById("auto-fullscreen")!.closest("#screen-dialog")).not.toBeNull();
  click("open-score-settings");
  expect(document.getElementById("backup-dialog")!.closest<HTMLElement>("[data-settings-panel]")!.hidden).toBe(false);
  expect(document.getElementById("screen-dialog")!.hidden).toBe(false);
  click("open-score-settings");
  expect(document.getElementById("edit-button")!.closest<HTMLElement>("[data-settings-panel]")!.hidden).toBe(false);
  expect(document.getElementById('lyrics-button')!.closest('#score-settings')).not.toBeNull();
  expect(document.getElementById('metadata-button')!.closest('#score-settings')).not.toBeNull();
  click('open-info-settings');
  expect(document.getElementById('busy')!.closest('#info-settings')).not.toBeNull();
  const buildInfo=JSON.parse(readFileSync('src/build-info.generated.json','utf8'));
  expect(Object.keys(buildInfo).sort()).toEqual(['builtAt','source']);
  expect(buildInfo.source).toMatch(/^[a-f0-9]{12}$/);
  expect(document.getElementById('app-version')!.textContent).toBe(`${JSON.parse(readFileSync('src/app-versions.json','utf8')).editor.version} (${buildInfo.source})`);
  expect(document.querySelector('.app-info h4')).toBeNull();
  expect([...document.querySelectorAll('.app-info dt')].map(e=>e.textContent)).toEqual(['버전','빌드 시각']);
  expect(document.getElementById('app-build')).toBeNull();
  expect(document.getElementById('app-source')).toBeNull();
  const kst=new Date(new Date(buildInfo.builtAt).getTime()+9*60*60*1000);
  const pad=(n:number)=>String(n).padStart(2,'0');
  expect(document.getElementById('app-built-at')!.textContent).toBe(`${kst.getUTCFullYear()}. ${kst.getUTCMonth()+1}. ${kst.getUTCDate()}. ${pad(kst.getUTCHours())}:${pad(kst.getUTCMinutes())} KST`);
  click('open-playback-settings');
  expect((document.getElementById('restart-measure') as HTMLInputElement).checked).toBe(true);
  expect((document.getElementById('count-off') as HTMLInputElement).checked).toBe(true);
  click('restart-measure'); click('count-off');
  expect(JSON.parse(localStorage.getItem('drum-practice.playback')!)).toEqual({restartMeasure:false,countOff:false});
  expect(document.querySelector('#count')).toBeNull();
  expect(document.querySelector('#count-each')).toBeNull();
  click('restart-measure'); click('count-off');
  (document.getElementById("settings-dialog") as HTMLDialogElement).close();
  (document.getElementById("editor-dialog") as HTMLDialogElement).close();
  // The unified editor keeps its session while navigating settings. Resolve
  // any pending exit explicitly before exercising playback below.
  (document.querySelector('#edit-exit-dialog [data-answer="discard"]') as HTMLButtonElement)?.click();
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
  expect(document.getElementById("open-settings-dialog")!.getAttribute("aria-label")).toBe("설정");
  expect(document.getElementById("click")!.closest("label")!.previousElementSibling!.id).toBe("original-tempo");
  expect(document.getElementById("fullscreen")).toBeNull();
  expect(document.getElementById("save-html")!.closest("#backup-dialog")).not.toBeNull();
  expect(document.getElementById("rate")!.closest("#tempo-dialog")).not.toBeNull();
  for (const id of ["tempo-presets", "slower", "faster"]) expect(document.getElementById(id)).toBeNull();
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
it("offers tempo presets and previews single-BPM dragging until release", async () => {
  click("original-tempo");
  expect(document.getElementById("tempo-dialog")!.hasAttribute("open")).toBe(true);
  expect(document.querySelectorAll("#tempo-options button")).toHaveLength(6);
  expect(document.querySelectorAll('#tempo-dialog [data-tempo="94"]')).toHaveLength(1);
  expect(document.getElementById("tempo-reset")).not.toBeNull();
  (document.querySelector('[data-tempo="75"]') as HTMLButtonElement).click();
  await vi.waitFor(async () => expect((await allRecords()).find(r => r.song.id === "real-paradis")!.song.settings.rate).toBeCloseTo(75 / 94));
  const input = document.getElementById("rate") as HTMLInputElement;
  input.setPointerCapture = () => {};
  input.hasPointerCapture = () => false;
  const pointer = (name: string, x: number) => {
    const e = new Event(name, { bubbles: true, cancelable: true });
    Object.assign(e, { pointerId: 1, pointerType: "touch", clientX: x, clientY: 100, button: 0, isPrimary: true });
    input.dispatchEvent(e);
  };
  pointer("pointerdown", 100);
  pointer("pointermove", 116);
  expect(input.value).toBe("77");
  expect((await allRecords()).find(r => r.song.id === "real-paradis")!.song.settings.rate).toBeCloseTo(75 / 94);
  pointer("pointerup", 116);
  await vi.waitFor(async () => expect((await allRecords()).find(r => r.song.id === "real-paradis")!.song.settings.rate).toBeCloseTo(77 / 94));
  pointer("pointerdown", 100);
  pointer("pointermove", 84);
  expect(input.value).toBe("75");
  pointer("pointercancel", 84);
  expect(input.value).toBe("77");
  pointer("pointerdown", 100);
  pointer("pointerup", 100);
  expect(input.value).toBe("77");
  pointer("pointerdown", 100);
  pointer("pointerup", 100);
  expect(input.value).toBe("77");
  click("tempo-reset");
  await vi.waitFor(() => expect(input.value).toBe("94"));
  (document.getElementById("tempo-dialog") as HTMLDialogElement).close();
});
it("keeps centred repeat anchored when changing radius and uses inclusive end bars", () => {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  set("seek", String(song.measures[24].start + .2));
  document.getElementById("seek")!.dispatchEvent(new Event("input"));
  (document.querySelector('[data-loop-radius="2"]') as HTMLButtonElement).click();
  expect(document.querySelector('[data-loop-radius="2"]')!.textContent).toBe('23~27');
  set('seek', String(song.measures[25].start));
  document.getElementById('seek')!.dispatchEvent(new Event('input'));
  (document.querySelector('[data-loop-radius="1"]') as HTMLButtonElement).click();
  expect(document.querySelector('[data-loop-radius="1"]')!.textContent).toBe('24~26');
  click('open-loop-dialog');
  expect(document.getElementById('open-loop-dialog')!.getAttribute('aria-pressed')).toBe('false');
  click('home');
  expect(document.querySelector('[data-loop-radius="1"]')!.textContent).toBe('24~26');
});
it("selects a measure on single tap and plays that measure on double tap", async () => {
  const view = document.getElementById('view') as HTMLSelectElement;
  const oldView = view.value;
  view.value='rows'; view.dispatchEvent(new Event('change'));
  animationFrame(0);
  const stage = document.getElementById('stage')!;
  stage.scrollTop=375;
  const measure = document.querySelector<HTMLElement>('#ribbon [data-index="6"]')!;
  expect(measure).not.toBeNull();
  const tap = () => {
    for (const type of ['pointerdown','pointerup']) {
      const e = new Event(type,{bubbles:true,cancelable:true});
      Object.assign(e,{pointerId:1,pointerType:'touch',isPrimary:true,button:0,clientX:210,clientY:100});
      measure.dispatchEvent(e);
    }
  };
  tap();
  await new Promise(ok=>setTimeout(ok,300));
  animationFrame(0);
  const song = JSON.parse(readFileSync('public/demo/song.json','utf8'));
  expect(Number((document.getElementById('seek') as HTMLInputElement).value)).toBeCloseTo(song.measures[6].start);
  expect(document.getElementById('play')!.getAttribute('aria-label')).toBe('재생');
  expect(stage.scrollTop).toBe(375);
  expect(measure.classList.contains('active')).toBe(true);
  tap(); tap();
  await new Promise(ok=>setTimeout(ok,300));
  animationFrame(0);
  expect(Number((document.getElementById('seek') as HTMLInputElement).value)).toBeCloseTo(song.measures[6].start);
  expect(document.getElementById('play')!.getAttribute('aria-label')).toBe('일시정지');
  expect([...stage.querySelectorAll<HTMLElement>('[data-index]')].slice(0,4).map(el=>Number(el.dataset.index))).toEqual([4,5,6,7]);
  click('play'); animationFrame(0);
  // Starting with the dedicated play button must also put an odd row on top.
  click('play'); animationFrame(0);
  expect([...stage.querySelectorAll<HTMLElement>('[data-index]')].slice(0,4).map(el=>Number(el.dataset.index))).toEqual([4,5,6,7]);
  click('play'); click('home');
  view.value=oldView; view.dispatchEvent(new Event('change')); animationFrame(0);
});
it("separates tap playback, percent drag, marker activation and cancelled gestures", async () => {
  const stage = document.getElementById('stage')!;
  const fire = (el: HTMLElement, name: string, x: number, y=100) => {
    const e = new Event(name,{bubbles:true,cancelable:true});
    Object.assign(e,{pointerId:1,pointerType:'touch',isPrimary:true,button:0,clientX:x,clientY:y});
    el.dispatchEvent(e);
  };
  fire(stage,'pointerdown',100); fire(stage,'pointerup',100);
  document.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',bubbles:true}));
  await new Promise(ok=>setTimeout(ok,300));
  expect(document.getElementById('play')!.getAttribute('aria-label')).toBe('일시정지');
  fire(stage,'pointerdown',100); fire(stage,'pointerup',100);
  expect(document.getElementById('play')!.getAttribute('aria-label')).toBe('재생');
  fire(stage,'pointerdown',100); fire(stage,'pointerup',100);
  await new Promise(ok=>setTimeout(ok,300));
  expect(document.getElementById('play')!.getAttribute('aria-label')).toBe('일시정지');
  click('play');
  const percent = document.getElementById('progress-percent') as HTMLInputElement;
  animationFrame(0); const initial=Number(percent.value);
  fire(percent,'pointerdown',100); fire(percent,'pointermove',180); fire(percent,'pointerup',180);
  animationFrame(0);
  expect(Number(percent.value)).toBe(initial+10);
  expect(Number((document.getElementById('seek') as HTMLInputElement).value)).toBeCloseTo(JSON.parse(readFileSync("public/demo/song.json", "utf8")).measures[initial+9].start);
  fire(percent,'pointerdown',100); fire(percent,'pointermove',100,84); fire(percent,'pointercancel',100,84);
  animationFrame(0); expect(Number(percent.value)).toBe(initial+10);
  await new Promise(ok=>setTimeout(ok,510));
  percent.click(); expect(document.querySelector('[data-drawer-panel="progress"]')).toBeNull();

  click('home');
});
it("browses all paused rows vertically without seeking, then restores playback following", async () => {
  const stage = document.getElementById("stage")!;
  // jsdom has no layout; provide a visible width for the fixed score rows.
  Object.defineProperty(stage,"clientWidth",{configurable:true,value:1000});
  const view = document.getElementById("view") as HTMLSelectElement;
  const seek = document.getElementById("seek") as HTMLInputElement;
  const oldView = view.value, oldTime = seek.value;
  view.value = "rows"; view.dispatchEvent(new Event("change"));
  seek.value = "62"; seek.dispatchEvent(new Event("input")); animationFrame(0);
  const before = seek.value;
  const count = (await allRecords()).find(r => r.song.id === "real-paradis")!.song.measures.length;
  expect(stage.classList.contains("paused-score-scroll")).toBe(true);
  expect(new Set([...stage.querySelectorAll<HTMLElement>("[data-index]")].map(el=>el.dataset.index)).size).toBe(count);
  stage.scrollTop = 400;
  const wheel = new WheelEvent("wheel", {deltaY:100,bubbles:true,cancelable:true});
  stage.dispatchEvent(wheel); animationFrame(0);
  expect(wheel.defaultPrevented).toBe(false);
  expect(stage.scrollTop).toBe(400);
  expect(seek.value).toBe(before);
  const rowsBefore = [...stage.querySelectorAll(".browse-strip")].map(row => [...row.querySelectorAll<HTMLElement>("[data-index]")].map(el=>el.dataset.index));
  expect(rowsBefore[0]).toEqual(["0", "1", "2", "3"]);
  expect(rowsBefore.every(row=>row.length<=4)).toBe(true);
  const horizontal = new WheelEvent("wheel", {deltaX:100,bubbles:true,cancelable:true});
  stage.dispatchEvent(horizontal); animationFrame(0);
  expect(horizontal.defaultPrevented).toBe(true);
  expect(seek.value).toBe(before);
  expect([...stage.querySelectorAll(".browse-strip")].map(row => [...row.querySelectorAll<HTMLElement>("[data-index]")].map(el=>el.dataset.index))).toEqual(rowsBefore);
  const resumedFrom = seek.value;
  click("play"); await vi.waitFor(() => expect(document.getElementById("play")!.getAttribute("aria-label")).toBe("일시정지"));
  animationFrame(0);
  expect(stage.classList.contains("paused-score-scroll")).toBe(false);
  expect(stage.scrollTop).toBe(0);
  expect(stage.querySelectorAll("[data-index]").length).toBeLessThanOrEqual(8);
  expect(seek.value).toBe(resumedFrom);
  click("play"); animationFrame(0);
  expect(new Set([...stage.querySelectorAll<HTMLElement>("[data-index]")].map(el=>el.dataset.index)).size).toBe(count);
  Reflect.deleteProperty(stage,"clientWidth");
  seek.value = oldTime; seek.dispatchEvent(new Event("input"));
  view.value = oldView; view.dispatchEvent(new Event("change")); animationFrame(0);
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
it("opens the last practiced score instead of the bundled song", async () => {
  await vi.waitFor(() => expect(document.getElementById("demo-button")!.textContent).toBe("독립 두 번째 곡 열기"));
  click("demo-button");
  await vi.waitFor(() => expect(document.getElementById("song-title")!.textContent).toBe("독립 두 번째 곡"));
  expect(document.querySelectorAll(".measure")).toHaveLength(1);
});
it("edits lyric starts and duration in musical units without free-time controls", async () => {
  await vi.waitFor(() => expect(document.getElementById("busy")!.textContent!.split("\n")[0]).toContain("저장"));
  click("lyrics-button");
  await vi.waitFor(()=>expect((document.getElementById("editor-dialog") as HTMLDialogElement).open).toBe(true));
  vi.stubGlobal("prompt",()=>"새로운");click("add-lyric");click("show-all");
  const select=document.querySelector<HTMLSelectElement>('#lyric-editor [data-field="grid-tick"]')!;
  expect(select).not.toBeNull();select.value='5';select.dispatchEvent(new Event('change',{bubbles:true}));
  await vi.waitFor(async()=>{
    const r=(await allRecords()).find(r=>r.song.title==='독립 두 번째 곡')!;
    expect(r.song.lyrics).toHaveLength(0);
    expect(r.editDraft!.song.lyrics[0].grid?.tick).toBe(5);
    expect(r.editDraft!.song.lyrics[0].time).toBeCloseTo(r.song.measures[0].start+(r.song.measures[0].end-r.song.measures[0].start)*1.25/4);
  });
  expect(document.querySelector('[data-field="freeTiming"]')).toBeNull();
  expect(document.querySelector('[data-field="time"]')).toBeNull();
  const duration=document.querySelector<HTMLInputElement>('#lyric-editor [data-field="duration-beats"]')!;
  duration.value='0.5';duration.dispatchEvent(new Event('change',{bubbles:true}));
  click('edit-commit');
  await vi.waitFor(async()=>{const r=(await allRecords()).find(r=>r.song.title==='독립 두 번째 곡')!;expect(r.song.lyrics[0].scorePosition!.durationQuarters).toBe(.5);expect(r.canonicalXML).toContain('DrumPracticeLyrics');});
});
it('lists one card per song and only the content types actually saved',async()=>{
  for(const d of document.querySelectorAll<HTMLDialogElement>('dialog[open]'))d.close();
  click('library-button');
  await vi.waitFor(()=>expect((document.getElementById('library-dialog') as HTMLDialogElement).open).toBe(true));
  const records=await allRecords();
  expect(document.querySelectorAll('.song-card')).toHaveLength(records.length);
  const cards=[...document.querySelectorAll('.song-card')];
  for(const [i,r] of records.entries()) {
    expect(cards[i].querySelector('.score-type-pdf')).not.toBeNull();
    expect(cards[i].querySelector('.score-type-musicxml')).toBeNull();
    expect(!!cards[i].querySelector('.score-type-lyrics')).toBe(r.song.lyrics.length>0||!!r.song.lyricText);
  }
});

it('dismisses settings only for an outside gesture and uses icon close controls', () => {
  click('open-settings-dialog');
  const dialog = document.getElementById('settings-dialog') as HTMLDialogElement;
  const rect = vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({left:100,top:100,right:800,bottom:600} as DOMRect);
  const gesture = (startX:number,endX:number) => {
    dialog.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true,clientX:startX,clientY:200}));
    dialog.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:endX,clientY:200}));
  };
  gesture(200,20); expect(dialog.open).toBe(true);
  gesture(20,20); expect(dialog.open).toBe(false);
  const close = dialog.querySelector('[data-close]')!;
  expect(close.getAttribute('aria-label')).toBe('닫기');
  expect(close.textContent).toBe('');
  expect(close.querySelector('svg')).not.toBeNull();
  rect.mockRestore();
});

it('remembers the settings category and returns from a child only when opened there', async () => {
  const {openSettings,selectSettingsCategory,openSettingsChild}=await import('../src/workspace');
  const settings=document.getElementById('settings-dialog') as HTMLDialogElement;
  const child=document.getElementById('original-dialog') as HTMLDialogElement;
  openSettings('score'); settings.close(); openSettings();
  expect(document.getElementById('settings-detail-heading')!.textContent).toBe('악보');
  expect(localStorage.getItem('drum-practice.settings-category')).toBe('score');
  settings.scrollTop=50;
  openSettingsChild(child);
  expect(settings.open).toBe(false); expect(child.open).toBe(true);
  child.close(); child.dispatchEvent(new Event('close'));
  expect(settings.open).toBe(true); expect(settings.scrollTop).toBe(50);
  expect(document.getElementById('settings-detail-heading')!.textContent).toBe('악보');
  settings.close(); openSettingsChild(child); child.close(); child.dispatchEvent(new Event('close'));
  expect(settings.open).toBe(false);
  selectSettingsCategory('info');
  expect(document.getElementById('settings-detail-heading')!.textContent).toBe('드럼 연습실');
  localStorage.setItem('drum-practice.settings-category','playback'); openSettings();
  expect(document.getElementById('settings-detail-heading')!.textContent).toBe('재생');
  expect(document.getElementById('playback-settings')!.textContent).not.toContain('모든 곡에 공통으로 적용하며');
  settings.close();
});

it('groups view and format choices above the existing switches', async () => {
  const {selectSettingsCategory}=await import('../src/workspace');
  for(const category of ['screen','playback','score'] as const){
    selectSettingsCategory(category);
    expect(document.getElementById('settings-detail-heading')!.hidden).toBe(true);
  }
  selectSettingsCategory('info'); expect(document.getElementById('settings-detail-heading')!.hidden).toBe(true);
  const pdf=document.getElementById('pdf-view-row')!;
  expect(pdf.classList.contains('settings-choice-row')).toBe(true);
  expect([...pdf.querySelectorAll('button')].map(b => b.textContent)).toEqual(['PDF 원본 악보', 'MusicXML 악보']);
  const viewButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-setting-control="view"]')];
  expect(viewButtons.map(b => b.textContent)).toEqual(['한 줄로 이어 보기', '두줄로 고정 보기', 'PDF · MusicXML 검수']);
  viewButtons[1].click();
  expect((document.getElementById('view') as HTMLSelectElement).value).toBe('rows');
  expect(viewButtons[1].getAttribute('aria-pressed')).toBe('true');
  viewButtons[0].click();
  expect((document.getElementById('view') as HTMLSelectElement).value).toBe('ribbon');
  expect(document.getElementById('zoom')!.closest('label')!.querySelector('strong')!.textContent).toBe('악보 크기');
});

it("opens marker management and renders sorted fixed slots on the score", async () => {
  click("home");
  set("seek","25"); document.getElementById("seek")!.dispatchEvent(new Event("input"));
  document.querySelector<HTMLButtonElement>("#quick-markers .empty-marker-slot")!.click();
  expect((document.querySelector('[data-drawer-panel="marker"]') as HTMLElement).hidden).toBe(false);

  expect(document.querySelectorAll("#quick-markers button")).toHaveLength(5);
  expect(document.querySelector(".dock-repeat > :first-child")!.id).toBe("open-loop-dialog");
  expect(document.querySelector('#quick-markers')!.parentElement!.className).toBe('dock-navigation');
  expect(document.querySelectorAll('.measure-marker:not([hidden])').length).toBeGreaterThan(0);
  const ids=[...document.querySelectorAll<HTMLElement>('#quick-markers [data-quick-marker]')].map(e=>e.textContent!);
  expect(ids.map(Number)).toEqual(ids.map(Number).sort((a,b)=>a-b));
});
it('shows note-follow as unavailable for the active PDF-only score without erasing preference',()=>{
 const toggle=document.getElementById('note-highlight') as HTMLInputElement;
 expect(toggle.closest('#screen-dialog')).not.toBeNull();
 expect(toggle.getAttribute('role')).toBe('switch');
 expect(toggle.closest('label')!.textContent).toContain('음표 따라가기');
 expect(toggle.disabled).toBe(true);
 expect(toggle.checked).toBe(false);
 expect(document.getElementById('note-highlight-description')!.textContent).toContain('MusicXML');
 const stored=localStorage.getItem('drum-practice.note-highlight');
 toggle.checked=true;toggle.dispatchEvent(new Event('change'));
 expect(toggle.checked).toBe(false);
 expect(localStorage.getItem('drum-practice.note-highlight')).toBe(stored);
});
