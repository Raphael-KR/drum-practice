// @vitest-environment jsdom
import { getHelpAction } from "../../src/shared/ui/help-bubble";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import type { Player } from "../../src/modules/audio/audio-core";
import type { Song, Loop } from "../../src/model/model";
import { validateSong } from "../../src/model/model";
import { createPlaybackScreen } from "../../src/modules/playback/playback-screen";
import { appInfoHTML } from "../../src/shared/ui/app-info";
import {
  webPlaybackBindings,
  playerPlaybackBindings,
  transportHTML,
  scoreStageHTML,
} from "../../src/modules/playback/playback-ui";
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
} from "../../src/modules/playback/playback-forms";
import {
  audioMeasures,
  setAudioBarOne,
} from "../../src/modules/audio/audio-practice";
import { playbackPosition } from "../../src/modules/playback/playback-position";
import * as playbackLayout from "../../src/modules/playback/playback-layout";
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
function mount(
  environment: "web" | "player",
  alignPDF = false,
  canonicalXML?: string,
) {
  const ids = {
    ...(environment === "web" ? webPlaybackBindings : playerPlaybackBindings),
    rewindButton: "back",
    mark: "mark",
    sound: "sound",
    radiusAttribute: "data-radius",
  };
  const root = document.createElement("div");
  document.body.replaceChildren(root);
  root.innerHTML = `<header><div class="brand">${playbackBrandHTML(ids.title, ids.tempo)}</div>${metronomeControlHTML()}</header><section id="practice">${scoreStageHTML()}${transportHTML({ rewindId: ids.rewind, rewindButton: ids.rewindButton, positionId: ids.position, right: playbackTransportRightHTML({ progress: ids.progress, mark: ids.mark, sound: ids.sound }) })}${repeatBarHTML({ repeat: ids.repeat, adjust: ids.adjust, markers: ids.markers, radiusAttribute: ids.radiusAttribute, summaryId: ids.summary, stopId: ids.stop })}</section><dialog id="tempo-dialog">${tempoFieldsHTML(ids.tempoInput)}</dialog><dialog id="sound-dialog">${soundFieldsHTML()}</dialog><dialog id="loop-dialog">${loopFieldsHTML()}<div id="loop-slots"></div></dialog><dialog id="marker-dialog"></dialog>${screenSettingsHTML({ pdf: "pdf", highlight: "highlight", fullscreen: "fullscreen" }, true)}${playbackPreferenceFieldsHTML("restart", "countoff")}${appInfoHTML("test", { source: "test", builtAt: "2026-10-13T00:00:00Z" }, { scoreInfo: true })}`;
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
    updateMetronome: vi.fn(),
    setRate: vi.fn<
      import("../../src/modules/audio/audio-core").Player["setRate"]
    >(async (rate: number, original = rate === 1) => {
      song.settings.rate = rate;
      song.settings.tempoMode = original ? "original" : "practice";
    }),
  };
  const prefs = { restartMeasure: false, countOff: false };
  let highlight = true,
    fullscreen = false;
  const screen = createPlaybackScreen({
    root,
    environment,
    ids,
    canonicalXML: () => canonicalXML,
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
      staffs: alignPDF
        ? new Map(
            song.regions.map((r) => [
              r.id,
              { top: r.y + 0.03, gap: 0.004, frame: { above: 8, below: 10 } },
            ]),
          )
        : new Map(),
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
for (const environment of ["web", "player"] as const) {
  it(`${environment}: header cycle and settings choices share one transition and preserve playback`, () => {
    const { root, p, song, click, changed, screen } = mount(environment);
    const choices = [
      ...root.querySelectorAll<HTMLButtonElement>("#metronome-choices button"),
    ];
    const header = root.querySelector<HTMLButtonElement>("#click")!;
    expect(choices.map((b) => b.textContent)).toEqual(["4분", "8분", "끄기"]);
    expect(
      root.querySelector(
        ".settings-metronome-row p, .settings-metronome-row small",
      ),
    ).toBeNull();
    expect(
      root
        .querySelector(".settings-metronome-row")!
        .previousElementSibling!.querySelector("#countoff"),
    ).not.toBeNull();
    p.playing = true;
    p.position = 1.25;
    changed.mockClear();
    for (const [mode, division, enabled] of [
      ["eighth", 8, true],
      ["off", 8, false],
      ["quarter", 4, true],
    ] as const) {
      click("click");
      expect(song.settings).toMatchObject({
        click: enabled,
        clickDivision: division,
      });
      expect(header.dataset.metronomeMode).toBe(mode);
      expect(
        choices.find((b) => b.getAttribute("aria-pressed") === "true")!.dataset
          .metronomeMode,
      ).toBe(mode);
      expect(header.dataset.help).toContain("다음:");
      expect(header.getAttribute("aria-label")).toContain("현재:");
    }
    expect(changed).toHaveBeenCalledTimes(3);
    expect(p.updateMetronome).toHaveBeenCalledTimes(3);
    choices[0].click();
    expect(changed).toHaveBeenCalledTimes(3);
    choices[1].click();
    expect(header.dataset.metronomeMode).toBe("eighth");
    expect(changed).toHaveBeenCalledTimes(4);
    expect(p.updateMetronome).toHaveBeenCalledTimes(4);
    expect(p.position).toBe(1.25);
    expect(p.playing).toBe(true);
    expect(p.play).not.toHaveBeenCalled();
    p.playing = false;
    choices[2].click();
    expect(p.playing).toBe(false);
    screen.sync();
    expect(choices[2].getAttribute("aria-pressed")).toBe("true");
  });
  it(`${environment}: metronome keyboard activation does not invoke playback shortcuts`, () => {
    const { root, p, song } = mount(environment);
    const header = root.querySelector<HTMLButtonElement>("#click")!;
    const initial = { ...song.settings };
    for (const [key, code] of [
      [" ", "Space"],
      ["Enter", "Enter"],
    ]) {
      const event = new KeyboardEvent("keydown", {
        key,
        code,
        bubbles: true,
        cancelable: true,
      });
      header.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
      expect(p.play).not.toHaveBeenCalled();
      expect(song.settings).toEqual(initial);
      expect(header.dataset.metronomeMode).toBe("quarter");
    }
    // jsdom has no native key activation; the browser supplies this click.
    header.click();
    expect(header.dataset.metronomeMode).toBe("eighth");
    expect(p.play).not.toHaveBeenCalled();
  });
  it(`${environment}: unchanged paused row frames retain text nodes and scroll position`, () => {
    const { screen, root, input, p, song, ids } = mount(environment);
    input("view").value = "rows";
    input("view").dispatchEvent(new Event("change"));
    screen.frame();
    const stage = root.querySelector<HTMLElement>("#stage")!;
    stage.scrollTop = 125;
    const elements = [
      ...root.querySelectorAll(
        "#playhead-status > *, .measure.active .measure-beat, .progress-total",
      ),
    ];
    expect(elements).toHaveLength(5);
    const nodes = elements.map((e) => e.firstChild);
    const progressObserver = new MutationObserver(() => {});
    progressObserver.observe(input(ids.progress), { attributes: true });
    for (let i = 0; i < 3; i++) screen.frame();
    expect(progressObserver.takeRecords()).toHaveLength(0);
    elements.forEach((e, i) => expect(e.firstChild).toBe(nodes[i]));
    expect(stage.scrollTop).toBe(125);
    p.position = song.measures[1].start;
    screen.frame();
    expect(input(ids.progress).value).toBe("2");
    expect(progressObserver.takeRecords().length).toBeGreaterThan(0);
    progressObserver.disconnect();
    expect(root.querySelector("#playhead-bar")!.textContent).toContain("2");
    expect(root.querySelector('.measure[data-index="1"]')!.classList).toContain(
      "active",
    );
  });
  it(`${environment}: row geometry is reused between frames and refreshed with track layout`, () => {
    const { screen, root, song } = mount(environment, true);
    const stage = root.querySelector<HTMLElement>("#stage")!;
    Object.defineProperty(stage, "clientHeight", { value: 600 });
    song.settings.view = "rows";
    screen.renderTrack();
    expect(
      Number.parseFloat(stage.style.getPropertyValue("--two-row-stage-height")),
    ).toBe(
      Math.ceil(
        Number.parseFloat(
          stage.style.getPropertyValue("--row-content-height"),
        ) *
          2 +
          58,
      ),
    );
    screen.frame();
    const layout = vi.spyOn(playbackLayout, "scoreLayout");
    try {
      for (let i = 0; i < 3; i++) screen.frame();
      expect(layout).not.toHaveBeenCalled();
      Object.defineProperty(stage, "clientWidth", { value: 600 });
      screen.frame();
      expect(layout).toHaveBeenCalled();
      layout.mockClear();
      screen.renderTrack();
      expect(layout).toHaveBeenCalled();
    } finally {
      layout.mockRestore();
    }
  });
  it(`${environment}: same transport validates rewind, copies full quarter-beat context and reports progress`, async () => {
    const { screen, p, song, ids, input, click, fail } = mount(environment);
    p.position = song.measures[10].start + 0.3;
    screen.frame();
    expect(input(ids.position).textContent).toBe(
      playbackPosition(song, p.position).label,
    );
    expect(input(ids.progress).getAttribute("aria-valuetext")).toMatch(
      /\d+ \/ \d+ · .+ \/ /,
    );
    expect(input(ids.progress).value).toBe("11");
    expect(input(ids.progress).max).toBe(String(song.measures.length));
    expect(
      input(ids.progress).parentElement!.querySelector(".progress-separator")!
        .textContent,
    ).toBe("/");
    expect(
      input(ids.progress).parentElement!.querySelector(".progress-total")!
        .textContent,
    ).toBe(String(song.measures.length));
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
    expect(
      document.querySelectorAll("#tempo-options [data-tempo]"),
    ).toHaveLength(9);
    await screen.rate(10000);
    expect(song.settings.rate).toBe(1.2);
    await expect(screen.rate(NaN)).rejects.toThrow();
    expect(input(ids.tempoInput).value).not.toBe("NaN");
    input("music-volume").value = ".3";
    input("music-volume").dispatchEvent(new Event("input"));
    expect(song.settings.musicVolume).toBe(0.3);
    expect(document.getElementById("music-volume-value")?.textContent).toBe(
      "30%",
    );
    input("click-volume").value = ".65";
    input("click-volume").dispatchEvent(new Event("input"));
    expect(song.settings.clickVolume).toBe(0.65);
    expect(document.getElementById("click-volume-value")?.textContent).toBe(
      "65%",
    );
    input("restart").checked = true;
    input("restart").dispatchEvent(new Event("change"));
    expect(prefs.restartMeasure).toBe(true);
    expect(p.volumes).toHaveBeenCalled();
  });
  it(`${environment}: centered repeats, whole-measure endpoints, markers and seeking outside a loop agree`, () => {
    const { screen, p, song, ids, click, root } = mount(environment);
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
    expect(
      root.querySelector<HTMLElement>('[data-drawer-panel="marker"]')!.hidden,
    ).toBe(false);
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

for (const environment of ["web", "player"] as const) {
  it(`${environment}: PDF uses the shared staff layout rather than crop scaling`, () => {
    const { root, song, screen } = mount(environment, true);
    song.scoreFormat = "pdf";
    for (const view of ["ribbon", "rows"] as const) {
      song.settings.view = view;
      screen.renderTrack();
      const crops = [...root.querySelectorAll<HTMLElement>(".crop")];
      expect(crops.length).toBeGreaterThan(0);
      expect(
        crops.every(
          (c) =>
            c.style.backgroundSize.includes("px") &&
            !c.style.backgroundSize.includes("%"),
        ),
      ).toBe(true);
    }
  });
}

it("fixed control board stays visible while shortcuts and repeat presets are used", () => {
  const { root, p, song, click, ids, input } = mount("player");
  const preset = root.querySelector<HTMLButtonElement>('[data-radius="1"]')!;
  p.position = song.measures[20].start;
  preset.click();
  expect(preset.textContent).toBe("20~22");
  expect(preset.getAttribute("aria-pressed")).toBe("true");
  preset.click();
  expect(p.loop).toBeUndefined();
  expect(preset.textContent).toBe("앞뒤 1");
  expect(root.querySelector<HTMLElement>("#playback-drawer")!.hidden).toBe(
    false,
  );
  click(ids.adjust);
  expect(root.querySelector<HTMLElement>("#playback-drawer")!.hidden).toBe(
    false,
  );
  expect(
    [...root.querySelectorAll<HTMLElement>(".drawer-panel")].every(
      (panel) => !panel.hidden,
    ),
  ).toBe(true);
  root.querySelector<HTMLButtonElement>(".empty-marker-slot")!.click();
  expect(
    root.querySelector<HTMLElement>('[data-drawer-panel="marker"]')!.hidden,
  ).toBe(false);
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

for (const environment of ["web", "player"] as const) {
  for (const radius of [1, 2, 3, 4]) {
    it(`${environment}: play starts active radius ${radius} at its loop beginning`, async () => {
      const { root, p, song, click } = mount(environment);
      const middle = song.measures[20].start;
      p.position = middle;
      root
        .querySelector<HTMLButtonElement>(`[data-radius="${radius}"]`)!
        .click();
      const start = p.loop!.start;
      expect(p.position).toBe(start);
      click("play");
      await Promise.resolve();
      await Promise.resolve();
      expect(p.position).toBe(start);
      expect(p.playing).toBe(true);
      click("play");
      expect(p.playing).toBe(false);
      p.position = middle;
      click("play");
      await Promise.resolve();
      await Promise.resolve();
      expect(p.position).toBe(start);
    });
  }
  it(`${environment}: play without a quick repeat keeps its current position`, async () => {
    const { p, song, click } = mount(environment);
    p.position = song.measures[20].start + 0.2;
    const position = p.position;
    click("play");
    await Promise.resolve();
    await Promise.resolve();
    expect(p.position).toBe(position);
  });
}

for (const environment of ["web", "player"] as const) {
  for (const lower of [false, true]) {
    it(`${environment}: play preserves the selected ${lower ? "lower" : "upper"} row`, async () => {
      const { root, p, song, screen, click } = mount(environment);
      song.settings.view = "rows";
      p.position = song.measures[5].start;
      screen.renderTrack();
      screen.frame();
      const stage = root.querySelector<HTMLElement>("#stage")!;
      const cell = root.querySelector<HTMLElement>('[data-index="5"]')!;
      stage.getBoundingClientRect = () =>
        ({ top: 100, bottom: 700, height: 600 }) as DOMRect;
      cell.getBoundingClientRect = () =>
        ({ top: lower ? 430 : 130 }) as DOMRect;
      click("play");
      await Promise.resolve();
      await Promise.resolve();
      screen.frame();
      const indices = [
        ...root.querySelectorAll<HTMLElement>("#ribbon [data-index]"),
      ].map((e) => Number(e.dataset.index));
      expect(indices).toEqual(
        lower ? [8, 9, 10, 11, 4, 5, 6, 7] : [4, 5, 6, 7, 8, 9, 10, 11],
      );
      // Crossing to the next row retains the existing alternating playback rule.
      p.position = song.measures[8].start;
      screen.frame();
      const next = [
        ...root.querySelectorAll<HTMLElement>("#ribbon [data-index]"),
      ].map((e) => Number(e.dataset.index));
      expect(next).toEqual(
        lower ? [8, 9, 10, 11, 12, 13, 14, 15] : [12, 13, 14, 15, 8, 9, 10, 11],
      );
    });
  }
}

it("measure counter seeks to the selected measure start, including the last measure", () => {
  const { p, song, screen, input, ids } = mount("web");
  screen.frame();
  for (const number of [4, song.measures.length, 1]) {
    input(ids.progress).value = String(number);
    input(ids.progress).dispatchEvent(new Event("change"));
    expect(p.position).toBe(song.measures[number - 1].start);
  }
});

it("shows recording estimates in app info and resets audio to exactly 1 after manual practice rate", async () => {
  const metadata = {
    version: 1,
    scoreBpm: 136,
    bpmEstimate: 136.232,
    firstBeatEstimateSeconds: 0.193,
    audioSHA256: "a".repeat(64),
    method: "signal",
    status: "estimate",
  };
  const xml = `<score-partwise><identification><miscellaneous><miscellaneous-field name="drum-practice:recording-tempo:v1">${JSON.stringify(metadata)}</miscellaneous-field></miscellaneous></identification></score-partwise>`;
  const { screen, p, song, click, ids } = mount("player", false, xml);
  song.bpm = 136;
  click(ids.tempo);
  expect(
    document.getElementById("recording-tempo-info")!.textContent,
  ).toContain("136.232");
  expect(
    document.getElementById("recording-tempo-info")!.textContent,
  ).toContain("악보 136 BPM");
  expect(
    document.getElementById("recording-tempo-info")!.closest(".app-info"),
  ).not.toBeNull();
  expect(document.querySelector("#tempo-dialog p")).toBeNull();
  expect(
    document
      .querySelector("#tempo-dialog .tempo-number")!
      .getAttribute("title"),
  ).toContain("오른쪽·위로");
  await screen.rate(100);
  expect(song.settings.rate).toBeCloseTo(100 / 136.232);
  const parse = vi.spyOn(DOMParser.prototype, "parseFromString");
  try {
    for (let i = 0; i < 3; i++) screen.frame();
    expect(parse).not.toHaveBeenCalled();
  } finally {
    parse.mockRestore();
  }
  expect(
    document.getElementById(ids.tempoInput)!.getAttribute("aria-valuenow"),
  ).toBe("100");
  expect(
    [
      ...document.querySelectorAll<HTMLButtonElement>(
        "#tempo-options [data-tempo]",
      ),
    ].map((button) => Number(button.dataset.tempo)),
  ).toEqual([69, 82, 89, 96, 103, 109, 116, 123, 130]);
  for (const preset of document.querySelectorAll<HTMLButtonElement>(
    "#tempo-options [data-tempo]",
  )) {
    const bpm = Number(preset.dataset.tempo);
    expect(Number.isInteger(bpm)).toBe(true);
    preset.click();
    await vi.waitFor(() =>
      expect(p.setRate).toHaveBeenLastCalledWith(
        bpm / 136.232,
        false,
        expect.any(Function),
      ),
    );
    expect(
      (document.getElementById(ids.tempoInput) as HTMLInputElement).value,
    ).toBe(String(bpm));
    expect(document.getElementById("original-tempo-value")!.textContent).toBe(
      `= ${bpm}`,
    );
    expect(preset.getAttribute("aria-pressed")).toBe("true");
    expect(song.settings.rate).toBeGreaterThanOrEqual(0.5);
    expect(() => validateSong(song)).not.toThrow();
  }
  expect(
    (document.getElementById(ids.tempoInput) as HTMLInputElement).min,
  ).toBe("69");
  await screen.rate(1);
  expect(song.settings.rate).toBeCloseTo(69 / 136.232);
  expect(
    (document.getElementById(ids.tempoInput) as HTMLInputElement).value,
  ).toBe("69");
  expect(() => validateSong(song)).not.toThrow();
  expect(document.getElementById("tempo-reset")!.textContent).toBe("원곡");
  expect(document.getElementById("tempo-score")!.textContent).toBe("136 BPM");
  click("tempo-reset");
  await vi.waitFor(() =>
    expect(p.setRate).toHaveBeenLastCalledWith(1, true, expect.any(Function)),
  );
  expect(song.bpm).toBe(136);
  expect(song.settings.rate).toBe(1);
  expect(
    (document.getElementById(ids.tempoInput) as HTMLInputElement).value,
  ).toBe("136");
  expect(document.getElementById(ids.tempo)!.textContent).toContain("136");
  expect(
    document.getElementById("tempo-reset")!.getAttribute("aria-pressed"),
  ).toBe("true");
  expect(
    document.getElementById("tempo-score")!.getAttribute("aria-pressed"),
  ).toBe("false");
  click("tempo-score");
  await vi.waitFor(() =>
    expect(p.setRate).toHaveBeenLastCalledWith(
      136 / 136.232,
      false,
      expect.any(Function),
    ),
  );
  expect(
    document.getElementById("tempo-score")!.getAttribute("aria-pressed"),
  ).toBe("true");
  expect(
    (document.getElementById(ids.tempoInput) as HTMLInputElement).value,
  ).toBe("136");
  expect(
    document.getElementById("tempo-reset")!.getAttribute("aria-pressed"),
  ).toBe("false");
});
for (const environment of ["web", "player"] as const)
  it(`${environment}: vertical arrows select the same column in adjacent rows without jumping at missing cells`, () => {
    const { song, p, screen, ids } = mount(environment);
    song.settings.view = "rows";
    screen.renderTrack();
    const selected = () =>
      Number(
        (document.getElementById(ids.progress) as HTMLInputElement).value,
      ) - 1;
    const key = (key: string) => {
      const e = new KeyboardEvent("keydown", { key, cancelable: true });
      document.dispatchEvent(e);
      screen.frame();
      return e;
    };
    p.position = song.measures[1].start + 0.1;
    expect(key("ArrowDown").defaultPrevented).toBe(true);
    expect(selected()).toBe(5);
    key("ArrowDown");
    expect(selected()).toBe(9);
    key("ArrowUp");
    expect(selected()).toBe(5);
    key("ArrowUp");
    expect(selected()).toBe(1);
    key("ArrowUp");
    expect(selected()).toBe(1);
    key("ArrowRight");
    expect(selected()).toBe(2);
    key("ArrowDown");
    expect(selected()).toBe(6);
    // The fixture has 110 measures: the final row has only columns 1 and 2.
    screen.seek(song.measures[106].start);
    key("ArrowDown");
    expect(selected()).toBe(106);
    screen.seek(song.measures[109].start);
    key("ArrowDown");
    expect(selected()).toBe(109);
    screen.seek(song.measures[105].start);
    key("ArrowDown");
    expect(selected()).toBe(109);
    song.settings.view = "ribbon";
    expect(key("ArrowUp").defaultPrevented).toBe(false);
    expect(selected()).toBe(109);
  });
for (const environment of ["web", "player"] as const)
  it(`${environment}: Enter registers a range while arrow keys continue navigating between endpoints`, () => {
    const { p, song, screen, root, ids } = mount(environment);
    const selected = () =>
      Number(
        (document.getElementById(ids.progress) as HTMLInputElement).value,
      ) - 1;
    song.settings.view = "rows";
    screen.renderTrack();
    const key = (key: string) => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
      );
      screen.frame();
    };
    p.position = song.measures[1].start;
    key("Enter");
    expect(
      root.querySelector(".loop-slots")?.textContent ??
        root.querySelector("#loop-slots")!.textContent,
    ).toContain("2~?");
    key("ArrowDown");
    expect(selected()).toBe(5);
    key("ArrowRight");
    expect(selected()).toBe(6);
    key("Enter");
    expect(song.loops.at(-1)).toMatchObject({
      start: song.measures[1].start,
      end: song.measures[6].end,
    });
    expect(root.querySelector("#loop-slots")!.textContent).toContain("2~7");
  });
for (const environment of ["web", "player"] as const)
  it(`${environment}: Latin M and Korean physical M both toggle the current measure marker`, () => {
    const { p, song, screen } = mount(environment);
    song.markers = [];
    song.markerSlots = [];
    p.position = song.measures[4].start + 0.1;
    const key = (key: string, isComposing = false) => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key,
          code: "KeyM",
          isComposing,
          cancelable: true,
        }),
      );
      screen.frame();
    };
    key("m");
    expect(song.markers).toHaveLength(1);
    expect(song.markers[0].time).toBe(song.measures[4].start);
    key("M");
    expect(song.markers).toHaveLength(0);
    key("ㅡ");
    expect(song.markers).toHaveLength(1);
    key("Process", true);
    expect(song.markers).toHaveLength(0);
  });

for (const environment of ["web", "player"] as const)
  for (const view of ["ribbon", "rows"] as const)
    it(`${environment} ${view}: selection leaves paused playback and shading fixed, then Play starts selected bar`, async () => {
      const { p, song, screen, root, ids } = mount(environment);
      song.settings.view = view;
      screen.renderTrack();
      const paused = song.measures[4].start + 0.3;
      screen.seek(paused);
      screen.frame();
      const shade = () =>
        Array.from(root.querySelectorAll<HTMLElement>(".measure")).map((e) =>
          e.style.getPropertyValue("--played"),
        );
      const before = shade();
      const playhead = root
        .querySelector<HTMLElement>("#stage")!
        .style.getPropertyValue("--playhead-x");
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", cancelable: true }),
      );
      screen.frame();
      expect(p.position).toBe(paused);
      expect(shade()).toEqual(before);
      expect(
        root
          .querySelector<HTMLElement>("#stage")!
          .style.getPropertyValue("--playhead-x"),
      ).toBe(playhead);
      expect(
        Number(
          (document.getElementById(ids.progress) as HTMLInputElement).value,
        ),
      ).toBe(6);
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "M",
          code: "KeyM",
          cancelable: true,
        }),
      );
      expect(song.markers.at(-1)?.time).toBe(song.measures[5].start);
      expect(p.position).toBe(paused);
      await screen.toggle();
      expect(p.playing).toBe(true);
      expect(p.position).toBe(song.measures[5].start);
    });

for (const environment of ["web", "player"] as const)
  for (const view of ["rows", "ribbon"] as const)
    it(`${environment} ${view}: saved ranges remain marked without active repeat and disappear after deletion`, () => {
      const { p, song, screen, root } = mount(environment);
      song.settings.view = view;
      song.loops = [
        {
          id: "saved-range",
          name: "2~4",
          start: song.measures[1].start,
          end: song.measures[3].end,
        },
      ];
      song.repeatSlots = ["saved-range"];
      p.loop = undefined;
      screen.renderTrack();
      screen.frame();
      const marked = () =>
        Array.from(root.querySelectorAll<HTMLElement>(".has-saved-loop")).map(
          (e) => Number(e.dataset.index),
        );
      expect(marked()).toEqual([1, 2, 3]);
      expect(root.querySelector(".in-loop")).toBeNull();
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", cancelable: true }),
      );
      screen.frame();
      expect(marked()).toEqual([1, 2, 3]);
      song.loops = [];
      song.repeatSlots = [];
      screen.frame();
      expect(marked()).toEqual([]);
    });
for (const environment of ["web", "player"] as const)
  it(`${environment}: range buttons restart from keyboard selection and delete only via the explicit action`, () => {
    const { p, song, screen, root, ids } = mount(environment);
    song.loops = [
      {
        id: "range",
        name: "6~8",
        start: song.measures[5].start,
        end: song.measures[7].end,
      },
    ];
    song.repeatSlots = ["range"];
    screen.renderLists();
    const key = (key: string) => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key, cancelable: true }),
      );
      screen.frame();
    };
    key("ArrowRight");
    root.querySelector<HTMLButtonElement>('[data-loop-slot="0"]')!.click();
    screen.frame();
    expect(p.position).toBe(song.measures[5].start);
    expect(
      Number((document.getElementById(ids.progress) as HTMLInputElement).value),
    ).toBe(6);
    expect(song.loops).toHaveLength(1);
    screen.seek(song.measures[4].start);
    key("ArrowRight");
    expect(p.position).toBe(song.measures[4].start);
    root.querySelector<HTMLButtonElement>('[data-loop-slot="0"]')!.click();
    screen.frame();
    expect(song.loops).toHaveLength(1);
    expect(p.position).toBe(song.measures[5].start);
    getHelpAction(
      root.querySelector<HTMLElement>('[data-loop-slot="0"]')!,
    )!.run();
    screen.frame();
    expect(song.loops).toHaveLength(0);
    expect(p.loop).toBeUndefined();
  });

for (const environment of ["web", "player"] as const)
  it(`${environment}: entering range selection preserves the browsed two-row viewport and score DOM`, () => {
    const { song, screen, root, p } = mount(environment);
    song.settings.view = "rows";
    screen.renderTrack();
    screen.frame();
    const stage = root.querySelector<HTMLElement>("#stage")!,
      first = root.querySelector(".measure");
    stage.scrollTop = 728;
    root.querySelector<HTMLButtonElement>('[data-loop-slot="0"]')!.click();
    screen.frame();
    expect(stage.scrollTop).toBe(728);
    expect(root.querySelector(".measure")).toBe(first);
    expect(stage.classList.contains("range-selection-mode")).toBe(true);
    expect(p.position).toBe(0);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    screen.frame();
    expect(stage.scrollTop).toBe(728);
  });

for (const environment of ["web", "player"] as const)
  it(`${environment}: paused double clicks register inclusive endpoints without seeking or playing`, () => {
    vi.useFakeTimers();
    const { song, screen, root, p } = mount(environment);
    screen.renderTrack();
    screen.frame();
    const double = (index: number) => {
      for (let i = 0; i < 2; i++)
        for (const type of ["pointerdown", "pointerup"]) {
          const e = new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            button: 0,
            clientX: 100,
            clientY: 100,
          });
          Object.assign(e, {
            pointerId: 1,
            pointerType: "mouse",
            isPrimary: true,
          });
          root.querySelector(`[data-index="${index}"]`)!.dispatchEvent(e);
        }
    };
    double(5);
    expect(song.loops).toHaveLength(0);
    expect(root.querySelector("#loop-slots")!.textContent).toContain("6~?");
    expect(p.position).toBe(0);
    double(9);
    vi.advanceTimersByTime(300);
    expect(song.loops.at(-1)).toMatchObject({
      start: song.measures[5].start,
      end: song.measures[9].end,
    });
    expect(p.play).not.toHaveBeenCalled();
    expect(p.position).toBe(0);
    double(12);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", cancelable: true }),
    );
    expect(song.loops.at(-1)).toMatchObject({
      start: song.measures[12].start,
      end: song.measures[13].end,
    });
    double(15);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(song.loops).toHaveLength(2);
    vi.useRealTimers();
  });

for (const environment of ["web", "player"] as const)
  for (const pointerType of ["mouse", "touch"])
    for (const view of ["ribbon", "rows"] as const)
      it(`${environment}/${view}: one ${pointerType} tap plays the selected measure, different measures only select`, async () => {
        vi.useFakeTimers();
        try {
          const { root, p, song, screen } = mount(environment);
          song.settings.view = view;
          screen.renderTrack();
          const tap = (index: number) => {
            for (const type of ["pointerdown", "pointerup"]) {
              const e = new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                button: 0,
                clientX: 100,
                clientY: 100,
              });
              Object.assign(e, { pointerId: 1, pointerType, isPrimary: true });
              root.querySelector(`[data-index="${index}"]`)!.dispatchEvent(e);
            }
          };
          tap(3);
          await vi.advanceTimersByTimeAsync(300);
          expect(p.play).not.toHaveBeenCalled();
          tap(3);
          await vi.advanceTimersByTimeAsync(300);
          expect(p.play).toHaveBeenCalledTimes(1);
          expect(p.position).toBe(song.measures[3].start);
          p.pause();
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
          );
          const paused = p.position;
          expect(paused).toBe(song.measures[3].start);
          tap(4);
          await vi.advanceTimersByTimeAsync(300);
          expect(p.play).toHaveBeenCalledTimes(2);
          expect(p.position).toBe(song.measures[4].start);
        } finally {
          vi.useRealTimers();
        }
      });
for (const environment of ["web", "player"] as const)
  it(`${environment}: selected taps during Enter range entry cannot start playback`, async () => {
    vi.useFakeTimers();
    try {
      const { root, p, screen } = mount(environment);
      screen.renderTrack();
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          cancelable: true,
        }),
      );
      for (const type of ["pointerdown", "pointerup"]) {
        const e = new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          button: 0,
          clientX: 100,
          clientY: 100,
        });
        Object.assign(e, {
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
        });
        root.querySelector('[data-index="1"]')!.dispatchEvent(e);
      }
      await vi.advanceTimersByTimeAsync(300);
      expect(p.play).not.toHaveBeenCalled();
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    } finally {
      vi.useRealTimers();
    }
  });

for (const environment of ["web", "player"] as const)
  it(`${environment}: double clicking the already selected measure registers a range, never plays`, () => {
    vi.useFakeTimers();
    try {
      const { root, p, song } = mount(environment);
      song.loops = [];
      song.repeatSlots = [];
      for (let i = 0; i < 2; i++)
        for (const type of ["pointerdown", "pointerup"]) {
          const e = new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            button: 0,
            clientX: 100,
            clientY: 100,
          });
          Object.assign(e, {
            pointerId: 1,
            pointerType: "mouse",
            isPrimary: true,
          });
          root.querySelector('[data-index="0"]')!.dispatchEvent(e);
        }
      vi.advanceTimersByTime(300);
      expect(p.play).not.toHaveBeenCalled();
      expect(root.querySelector("#loop-slots")!.textContent).toContain("1~?");
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      const stage = root.querySelector("#stage")!;
      for (const type of ["pointerdown", "pointerup"]) {
        const e = new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          button: 0,
          clientX: 100,
          clientY: 100,
        });
        Object.assign(e, {
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
        });
        stage.dispatchEvent(e);
      }
      vi.advanceTimersByTime(300);
      expect(p.play).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

it("audio uses common waveform navigation, rows and playback frame without score assets", () => {
  const { screen, song, p, root, fail } = mount("player");
  Object.assign(song, {
    bpm: 120,
    firstBeat: 0.2,
    pageCount: 0,
    pdfName: "",
    regions: [],
    scoreFormat: undefined,
    audioPractice: {
      duration: 12,
      beats: 4,
      denominator: 4,
      peaks: [0.2, 0.6, 1],
    },
    measures: audioMeasures(12, 120, 0.2, 4, 4),
  });
  screen.renderTrack();
  screen.sync();
  expect(root.querySelectorAll(".audio-measure").length).toBe(6);
  expect(root.querySelector("#stage")?.getAttribute("aria-label")).toBe(
    "음원 파형과 마디",
  );
  p.position = 3.2;
  screen.frame();
  song.settings.view = "rows";
  screen.renderTrack();
  screen.frame();
  expect(root.querySelectorAll(".audio-measure").length).toBeGreaterThan(0);
  expect(root.querySelector(".audio-measure .crop img")).toBeNull();
  expect(fail).not.toHaveBeenCalled();
});

it("keeps prelude labels beat-free and numbers the first actual bar as one", () => {
  const { screen, song, p, root, ids } = mount("web");
  Object.assign(song, {
    bpm: 120,
    firstBeat: 0,
    pageCount: 0,
    pdfName: "",
    regions: [],
    scoreFormat: undefined,
    audioPractice: { duration: 12, beats: 4, denominator: 4, peaks: [1] },
    measures: audioMeasures(12, 120, 0, 4, 4),
  });
  Object.assign(song, setAudioBarOne(song, 4));
  screen.renderTrack();
  screen.sync();
  p.position = 0;
  screen.frame();
  expect(root.querySelector(".audio-measure .label")!.textContent).toBe(
    "연주 전",
  );
  expect(root.querySelector("#playhead-bar")!.textContent).toBe("연주 전");
  const progress = root.querySelector<HTMLInputElement>(`#${ids.progress}`)!;
  expect([
    progress.value,
    progress.min,
    progress.max,
    progress.getAttribute("aria-valuemin"),
  ]).toEqual(["0", "0", "4", "0"]);
  screen.seek(4);
  screen.frame();
  expect(progress.value).toBe("1");
  expect(root.querySelector(".audio-measure .measure-beat")!.textContent).toBe(
    "",
  );
});

it("shows live original BPM to one decimal, holds when stopped, and separates practice at the same BPM", async () => {
  const { screen, p, song, ids, click } = mount("web");
  click(ids.tempo);
  song.bpm = 120;
  song.settings.rate = 1;
  song.settings.tempoMode = "original";
  song.audioPractice = {
    duration: 20,
    beats: 4,
    denominator: 4,
    peaks: [1],
    beatTimes: [0.2, 0.7, 1.18, 1.64, 2.08, 2.5, 2.9],
    followTempo: true,
  };
  p.playing = true;
  p.position = 2.08;
  screen.frame();
  expect(document.getElementById("original-tempo-value")!.textContent).toBe(
    "= 127.7",
  );
  p.playing = false;
  p.position = 0;
  screen.onState();
  screen.frame();
  expect(document.getElementById("original-tempo-value")!.textContent).toBe(
    "= 127.7",
  );
  await screen.rate(120);
  expect(p.setRate).toHaveBeenLastCalledWith(1, false, expect.any(Function));
  expect(document.getElementById("original-tempo-value")!.textContent).toBe(
    "= 120",
  );
  expect(
    document.getElementById("tempo-reset")!.getAttribute("aria-pressed"),
  ).toBe("false");
  await screen.rate(120, true);
  expect(document.getElementById(ids.tempo)!.textContent).toContain("120.0");
});

it("waveform native touch scrolling and inertia preserve playback position and selected measure", () => {
  const { screen, song, p, root } = mount("web");
  Object.assign(song, {
    bpm: 120,
    firstBeat: 0.2,
    pageCount: 0,
    pdfName: "",
    regions: [],
    scoreFormat: undefined,
    audioPractice: {
      duration: 12,
      beats: 4,
      denominator: 4,
      peaks: [0.2, 0.6, 1],
    },
    measures: audioMeasures(12, 120, 0.2, 4, 4),
  });
  screen.renderTrack();
  screen.sync();
  p.position = 3.2;
  screen.frame();
  const stage = root.querySelector<HTMLElement>("#stage")!;
  const seek = vi.spyOn(p, "seek");
  for (const x of [350, 500, 530]) {
    stage.scrollLeft = x;
    stage.dispatchEvent(new Event("scroll"));
    screen.frame();
    expect(stage.scrollLeft).toBe(x);
  }
  expect(p.position).toBe(3.2);
  expect(seek).not.toHaveBeenCalled();
});

for (const environment of ["web", "player"] as const) {
  for (const source of ["preset", "score", "original", "input"] as const) {
    it(`${environment}: ${source} updates the dialog BPM before conversion and the header after conversion`, async () => {
      const { screen, p, song, root, ids, input, click } = mount(environment);
      await screen.rate(song.bpm * 0.8);
      click(ids.tempo);
      const header = () =>
        root.querySelector("#original-tempo-value")!.textContent;
      const previousHeader = header();
      const previousRate = song.settings.rate;
      const commitRate = p.setRate.getMockImplementation()!;
      let finish!: () => void;
      const pending = new Promise<void>((resolve) => {
        finish = resolve;
      });
      p.setRate.mockImplementationOnce(async (...args) => {
        await pending;
        await commitRate(...args);
      });
      const preset = root.querySelector<HTMLButtonElement>(
        "#tempo-options [data-tempo]",
      )!;
      const target =
        source === "preset"
          ? Number(preset.dataset.tempo)
          : source === "input"
            ? song.bpm * 0.7
            : song.bpm;
      if (source === "preset") preset.click();
      else if (source === "input") {
        input(ids.tempoInput).value = String(target);
        input(ids.tempoInput).dispatchEvent(new Event("change"));
      } else click(source === "score" ? "tempo-score" : "tempo-reset");
      expect(input(ids.tempoInput).value).toBe(String(target));
      expect(input(ids.tempoInput).getAttribute("aria-valuenow")).toBe(
        String(target),
      );
      expect(header()).toBe(previousHeader);
      expect(song.settings.rate).toBe(previousRate);
      expect(p.setRate).toHaveBeenLastCalledWith(
        target / song.bpm,
        source === "original",
        expect.any(Function),
      );
      finish();
      await vi.waitFor(() =>
        expect(header()).toBe(
          `= ${source === "original" ? target.toFixed(1) : target}`,
        ),
      );
      expect(input(ids.tempoInput).value).toBe(String(target));
    });
  }
}

for (const environment of ["web", "player"] as const)
  it(`${environment}: BPM conversion reports inside the tempo dialog and recovers after failure`, async () => {
    const { screen, p, root, ids, input, click } = mount(environment);
    const notice = root.querySelector<HTMLElement>("#tempo-status")!;
    p.setRate.mockImplementationOnce(async (_rate, _original, report) => {
      report!("BPM 변환 42%");
      expect(notice.textContent).toBe("BPM 변환 42%");
      expect(notice.previousElementSibling?.className).toBe("tempo-number");
      expect(notice.nextElementSibling?.className).toBe("tempo-choices");
      throw Error("변환 실패");
    });
    await expect(screen.rate(80)).rejects.toThrow("변환 실패");
    expect(notice.textContent).toBe("변환 실패");
    expect(notice.classList.contains("error")).toBe(true);
    p.setRate.mockImplementationOnce(async (_rate, _original, report) =>
      report!("준비되었습니다."),
    );
    await screen.rate(90);
    expect(notice.classList.contains("error")).toBe(false);
    expect(notice.textContent).toBe("준비되었습니다.");
    click(ids.tempo);
    const previousBpm = input(ids.tempoInput).value;
    const previousHeader = root.querySelector(
      "#original-tempo-value",
    )!.textContent;
    p.setRate.mockRejectedValueOnce(Error("변환 실패"));
    const preset = root.querySelector<HTMLButtonElement>(
      "#tempo-options [data-tempo]",
    )!;
    preset.click();
    expect(input(ids.tempoInput).value).toBe(preset.dataset.tempo);
    await vi.waitFor(() =>
      expect(notice.classList.contains("error")).toBe(true),
    );
    expect(input(ids.tempoInput).value).toBe(previousBpm);
    expect(root.querySelector("#original-tempo-value")!.textContent).toBe(
      previousHeader,
    );
  });

for (const environment of ["web", "player"] as const) {
  it.each([true, false])(
    `${environment}: navigation buttons request count-off and preserve playing=%s`,
    (playing) => {
      const { screen, p, song, root, ids, click } = mount(environment);
      p.position = song.measures[20].start;
      p.playing = playing;
      root.querySelector<HTMLButtonElement>('[data-radius="2"]')!.click();
      expect(p.position).toBe(song.measures[18].start);
      expect(p.playing).toBe(playing);
      expect(p.play).toHaveBeenCalledTimes(playing ? 1 : 0);
      if (playing) expect(p.play).toHaveBeenLastCalledWith(true, false);
      click(ids.adjust);
      if (playing) expect(p.play).toHaveBeenLastCalledWith(false, false);
      p.play.mockClear();
      screen.mark();
      p.position = song.measures[30].start;
      const seek = vi.spyOn(p, "seek");
      root.querySelector<HTMLButtonElement>("[data-quick-marker]")!.click();
      expect(seek).toHaveBeenLastCalledWith(song.measures[18].start, true);
      const calls = seek.mock.calls.length;
      root.querySelector<HTMLButtonElement>("[data-quick-marker]")!.click();
      expect(song.markers).toHaveLength(0);
      expect(seek).toHaveBeenCalledTimes(calls);
      const loop = {
        id: "saved",
        name: "saved",
        start: song.measures[4].start,
        end: song.measures[6].end,
      };
      song.loops = [loop];
      song.repeatSlots = [loop.id];
      screen.renderLists();
      root.querySelector<HTMLButtonElement>("#loop-slots button")!.click();
      expect(p.position).toBe(loop.start);
      expect(p.playing).toBe(playing);
      if (playing) expect(p.play).toHaveBeenLastCalledWith(true, false);
      else expect(p.play).not.toHaveBeenCalled();
      getHelpAction(
        root.querySelector<HTMLElement>("#loop-slots button")!,
      )!.run();
      expect(p.loop).toBeUndefined();
      if (playing) expect(p.play).toHaveBeenLastCalledWith(false, false);
    },
  );
}
