// @vitest-environment jsdom
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import type { Player } from "../src/audio-core";
import type { Song, Loop } from "../src/model";
import { createPlaybackScreen } from "../src/playback-screen";
import {
  webPlaybackBindings,
  portablePlaybackBindings,
  transportHTML,
  scoreStageHTML,
} from "../src/playback-ui";
import {
  playbackTransportRightHTML,
  repeatBarHTML,
  tempoFieldsHTML,
  soundFieldsHTML,
  loopFieldsHTML,
  screenSettingsHTML,
  playbackPreferenceFieldsHTML,
  playbackBrandHTML,
  metronomeControlHTML,
} from "../src/playback-forms";
import { playbackPosition } from "../src/playback-position";
const disposers: (() => void)[] = [];
beforeEach(() => {
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 1),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});
afterEach(() => {
  disposers
    .splice(0)
    .reverse()
    .forEach((fn) => fn());
  vi.unstubAllGlobals();
});
function mount(environment: "web" | "portable", alignPDF = false) {
  const ids = {
    ...(environment === "web" ? webPlaybackBindings : portablePlaybackBindings),
    rewindButton: "back",
    mark: "mark",
    sound: "sound",
    radiusAttribute: "data-radius",
  };
  const root = document.createElement("div");
  document.body.replaceChildren(root);
  root.innerHTML = `<header><div class="brand">${playbackBrandHTML(ids.title, ids.tempo)}</div>${metronomeControlHTML()}</header><section id="practice">${scoreStageHTML()}${transportHTML({ rewindId: ids.rewind, rewindButton: ids.rewindButton, positionId: ids.position, right: playbackTransportRightHTML({ progress: ids.progress, mark: ids.mark, sound: ids.sound }) })}${repeatBarHTML({ repeat: ids.repeat, adjust: ids.adjust, markers: ids.markers, radiusAttribute: ids.radiusAttribute, summaryId: ids.summary, stopId: ids.stop })}</section><dialog id="tempo-dialog">${tempoFieldsHTML(ids.tempoInput)}</dialog><dialog id="sound-dialog">${soundFieldsHTML()}</dialog><dialog id="loop-dialog">${loopFieldsHTML()}<div id="loop-slots"></div></dialog><dialog id="marker-dialog"></dialog>${screenSettingsHTML({ pdf: "pdf", highlight: "highlight", fullscreen: "fullscreen" }, true)}${playbackPreferenceFieldsHTML("restart", "countoff")}`;
  const stage = root.querySelector<HTMLElement>("#stage")!;
  Object.defineProperty(stage, "clientWidth", {
    value: 800,
    configurable: true,
  });
  const song: Song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  song.settings.view = "ribbon";
  song.settings.position = 0;
  song.markers = [];
  let busy = false;
  const changed = vi.fn(),
    fail = vi.fn();
  const p = {
    playing: false,
    position: 0,
    duration: 300,
    loop: undefined as Loop | undefined,
    current() {
      return this.position;
    },
    count: () => 0,
    pause() {
      this.playing = false;
      screen.onState();
    },
    seek(time: number) {
      this.position = time;
      screen.onState();
    },
    play: vi.fn(async () => {
      p.playing = true;
      screen.onState();
    }),
    prepare: vi.fn(async () => {}),
    volumes: vi.fn(),
    setRate: vi.fn(async (rate: number) => {
      song.settings.rate = rate;
    }),
  };
  const prefs = { restartMeasure: false, countOff: false };
  let highlight = true,
    fullscreen = false;
  const screen = createPlaybackScreen({
    root,
    environment,
    ids,
    song: () => song,
    player: () => p as unknown as Player,
    ready: () => true,
    busy: () => busy,
    setBusy: (v) => {
      busy = v;
    },
    assets: () => ({
      urls: ["data:image/png;base64,"],
      ratios: [1.3],
      staffs: alignPDF ? new Map(song.regions.map(r => [r.id, {top:r.y + .03,gap:.004,frame:{above:8,below:10}}])) : new Map(),
      highlights: [],
    }),
    highlight: () => highlight,
    formats: () => ["pdf"],
    fail,
    changed,
    preferences: {
      restartId: "restart",
      countoffId: "countoff",
      read: () => prefs,
      write: (value) => {
        Object.assign(prefs, value);
      },
    },
    display: {
      highlightId: "highlight",
      fullscreenId: "fullscreen",
      fullscreen: () => fullscreen,
      setFullscreen: (v) => {
        fullscreen = v;
      },
      setHighlight: (v) => {
        highlight = v;
      },
      report: vi.fn(),
    },
  });
  disposers.push(screen.dispose);
  screen.sync();
  screen.renderTrack();
  const input = (id: string) => root.querySelector<HTMLInputElement>(`#${id}`)!;
  const click = (id: string) =>
    root.querySelector<HTMLButtonElement>(`#${id}`)!.click();
  return { screen, p, song, root, ids, input, click, fail, changed, prefs };
}
for (const environment of ["web", "portable"] as const) {
  it(`${environment}: same transport validates rewind, copies full quarter-beat context and reports progress`, async () => {
    const { screen, p, song, ids, input, click, fail } = mount(environment);
    p.position = song.measures[10].start + 0.3;
    screen.frame();
    expect(input(ids.position).textContent).toBe(
      playbackPosition(song, p.position).label,
    );
    expect(input(ids.progress).getAttribute("aria-valuetext")).toMatch(
      /% · .+ \/ /,
    );
    input(ids.rewind).value = "11";
    click("back");
    expect(fail).toHaveBeenCalledOnce();
    expect(p.position).toBeGreaterThan(song.measures[10].start);
    input(ids.rewind).value = "2";
    click("back");
    expect(p.position).toBe(song.measures[8].start);
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    click(ids.position);
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledWith(
      playbackPosition(song, p.position).text,
    );
    click("home");
    expect(p.position).toBe(0);
  });
  it(`${environment}: tempo uses shared presets, bounds, invalid-input recovery, sound and preferences`, async () => {
    const { screen, p, song, ids, input, click, prefs } = mount(environment);
    click(ids.tempo);
    expect(document.querySelectorAll("[data-tempo]").length).toBeGreaterThan(3);
    await screen.rate(10000);
    expect(song.settings.rate).toBe(1.2);
    await expect(screen.rate(NaN)).rejects.toThrow();
    expect(input(ids.tempoInput).value).not.toBe("NaN");
    input("music-volume").value = ".3";
    input("music-volume").dispatchEvent(new Event("input"));
    expect(song.settings.musicVolume).toBe(0.3);
    expect(document.getElementById("music-volume-value")?.textContent).toBe("30%");
    input("click-volume").value = ".65";
    input("click-volume").dispatchEvent(new Event("input"));
    expect(song.settings.clickVolume).toBe(0.65);
    expect(document.getElementById("click-volume-value")?.textContent).toBe("65%");
    input("restart").checked = true;
    input("restart").dispatchEvent(new Event("change"));
    expect(prefs.restartMeasure).toBe(true);
    expect(p.volumes).toHaveBeenCalled();
  });
  it(`${environment}: centered repeats, whole-measure endpoints, markers and seeking outside a loop agree`, () => {
    const { screen, p, song, ids, input, click, root } = mount(environment);
    p.position = song.measures[20].start;
    root.querySelector<HTMLButtonElement>('[data-radius="2"]')!.click();
    const centerLoop = p.loop!;
    expect(centerLoop.start).toBe(song.measures[18].start);
    expect(centerLoop.end).toBe(song.measures[22].end);
    click(ids.adjust);
    expect(root.querySelector("#loop-precise")).toBeNull();
    const preserved = structuredClone(centerLoop);
    expect(p.loop).toBeUndefined();
    click(ids.adjust);
    expect(p.loop?.end).toBe(preserved.end);
    screen.seek(song.measures[30].start);
    expect(p.loop).toBeUndefined();
    expect(screen.lastLoop?.end).toBe(preserved!.end);
    root.querySelector<HTMLButtonElement>(".empty-marker-slot")!.click();
    expect(root.querySelector<HTMLElement>('[data-drawer-panel="marker"]')!.hidden).toBe(false);
    expect(song.markers).toHaveLength(1);
    screen.seek(0);
    root.querySelector<HTMLButtonElement>("[data-quick-marker]")!.click();
    expect(p.position).toBe(song.measures[30].start);
  });
  it(`${environment}: two rows ignore horizontal wheel and retain vertical browsing, cleanup removes handlers`, async () => {
    const { screen, song, input, root, p, click } = mount(environment);
    input("view").value = "rows";
    input("view").dispatchEvent(new Event("change"));
    screen.frame();
    const stage = root.querySelector<HTMLElement>("#stage")!;
    const position = p.position;
    stage.dispatchEvent(
      new WheelEvent("wheel", { deltaX: 100, cancelable: true }),
    );
    expect(p.position).toBe(position);
    expect(stage.classList.contains("paused-score-scroll")).toBe(true);
    expect(root.querySelectorAll("[data-index]").length).toBe(
      song.measures.length,
    );
    click("play");
    await Promise.resolve();
    await Promise.resolve();
    expect(p.play).toHaveBeenCalledOnce();
    screen.dispose();
    click("play");
    expect(p.playing).toBe(true);
  });
}

for (const environment of ["web", "portable"] as const) {
  it(`${environment}: PDF uses the shared staff layout rather than crop scaling`, () => {
    const {root,song,screen} = mount(environment,true);
    song.scoreFormat="pdf";
    for (const view of ["ribbon","rows"] as const) {
      song.settings.view=view; screen.renderTrack();
      const crops=[...root.querySelectorAll<HTMLElement>(".crop")];
      expect(crops.length).toBeGreaterThan(0);
      expect(crops.every(c=>c.style.backgroundSize.includes("px") && !c.style.backgroundSize.includes("%"))).toBe(true);
    }
  });
}

it("fixed control board stays visible while shortcuts and repeat presets are used", () => {
  const {root,p,song,click,ids,input,screen} = mount("portable");
  const preset = root.querySelector<HTMLButtonElement>('[data-radius="1"]')!;
  p.position = song.measures[20].start;
  preset.click();
  expect(preset.textContent).toBe("20~22");
  expect(preset.getAttribute("aria-pressed")).toBe("true");
  preset.click();
  expect(p.loop).toBeUndefined();
  expect(preset.textContent).toBe("앞뒤 1");
  expect(root.querySelector<HTMLElement>("#playback-drawer")!.hidden).toBe(false);
  click(ids.adjust);
  expect(root.querySelector<HTMLElement>("#playback-drawer")!.hidden).toBe(false);
  expect([...root.querySelectorAll<HTMLElement>(".drawer-panel")].every(panel => !panel.hidden)).toBe(true);
  root.querySelector<HTMLButtonElement>(".empty-marker-slot")!.click();
  expect(root.querySelector<HTMLElement>('[data-drawer-panel="marker"]')!.hidden).toBe(false);
  expect(song.markers).toHaveLength(1);
  expect(root.querySelector("#add-marker")).toBeNull();
  expect(root.querySelector("#" + ids.mark)).toBeNull();
  root.querySelector<HTMLButtonElement>("[data-quick-marker]")!.click();
  expect(song.markers).toHaveLength(0);
  expect(root.querySelectorAll(".empty-marker-slot")).toHaveLength(5);
  expect(root.querySelector('[data-drawer-panel="rewind"]')).toBeNull();
  expect(root.querySelector("#drawer-progress")).toBeNull();
  expect(input(ids.rewind).closest(".transport")).not.toBeNull();
  expect(input(ids.rewind).dataset.numericDragBound).toBe("true");
  input(ids.rewind).value = "3";
  input(ids.rewind).dispatchEvent(new Event("input"));
  expect(input(ids.rewind).value).toBe("3");
  expect(root.querySelector("#loop-dialog")).toBeNull();
});
