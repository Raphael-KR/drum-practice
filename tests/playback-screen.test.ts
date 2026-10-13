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
  appInfoHTML,
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
import { audioMeasures } from "../src/audio-practice";
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
function mount(environment: "web" | "portable", alignPDF = false, canonicalXML?: string) {
  const ids = {
    ...(environment === "web" ? webPlaybackBindings : portablePlaybackBindings),
    rewindButton: "back",
    mark: "mark",
    sound: "sound",
    radiusAttribute: "data-radius",
  };
  const root = document.createElement("div");
  document.body.replaceChildren(root);
  root.innerHTML = `<header><div class="brand">${playbackBrandHTML(ids.title, ids.tempo)}</div>${metronomeControlHTML()}</header><section id="practice">${scoreStageHTML()}${transportHTML({ rewindId: ids.rewind, rewindButton: ids.rewindButton, positionId: ids.position, right: playbackTransportRightHTML({ progress: ids.progress, mark: ids.mark, sound: ids.sound }) })}${repeatBarHTML({ repeat: ids.repeat, adjust: ids.adjust, markers: ids.markers, radiusAttribute: ids.radiusAttribute, summaryId: ids.summary, stopId: ids.stop })}</section><dialog id="tempo-dialog">${tempoFieldsHTML(ids.tempoInput)}</dialog><dialog id="sound-dialog">${soundFieldsHTML()}</dialog><dialog id="loop-dialog">${loopFieldsHTML()}<div id="loop-slots"></div></dialog><dialog id="marker-dialog"></dialog>${screenSettingsHTML({ pdf: "pdf", highlight: "highlight", fullscreen: "fullscreen" }, true)}${playbackPreferenceFieldsHTML("restart", "countoff")}${appInfoHTML("test", { source: "test", builtAt: "2026-10-13T00:00:00Z" })}`;
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
    setRate: vi.fn(async (rate: number, original = rate === 1) => {
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
      /\d+ \/ \d+ · .+ \/ /,
    );
    expect(input(ids.progress).value).toBe("11");
    expect(input(ids.progress).max).toBe(String(song.measures.length));
    expect(input(ids.progress).parentElement!.querySelector('.progress-separator')!.textContent).toBe('/');
    expect(input(ids.progress).parentElement!.querySelector('.progress-total')!.textContent).toBe(String(song.measures.length));
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
    expect(document.querySelectorAll("#tempo-options [data-tempo]")).toHaveLength(9);
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

for (const environment of ["web", "portable"] as const) {
  for (const radius of [1, 2, 3, 4]) {
    it(`${environment}: play starts active radius ${radius} at its loop beginning`, async () => {
      const {root, p, song, click} = mount(environment);
      const middle = song.measures[20].start;
      p.position = middle;
      root.querySelector<HTMLButtonElement>(`[data-radius="${radius}"]`)!.click();
      expect(p.position).toBe(middle);
      const start = p.loop!.start;
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
    const {p, song, click} = mount(environment);
    p.position = song.measures[20].start + .2;
    const position = p.position;
    click("play");
    await Promise.resolve();
    await Promise.resolve();
    expect(p.position).toBe(position);
  });
}

for (const environment of ["web", "portable"] as const) {
  for (const lower of [false, true]) {
    it(`${environment}: play preserves the selected ${lower ? 'lower' : 'upper'} row`, async () => {
      const {root, p, song, screen, click} = mount(environment);
      song.settings.view = 'rows';
      p.position = song.measures[5].start;
      screen.renderTrack();
      screen.frame();
      const stage = root.querySelector<HTMLElement>('#stage')!;
      const cell = root.querySelector<HTMLElement>('[data-index="5"]')!;
      stage.getBoundingClientRect = () => ({top:100,bottom:700,height:600}) as DOMRect;
      cell.getBoundingClientRect = () => ({top:lower ? 430 : 130}) as DOMRect;
      click('play');
      await Promise.resolve();
      await Promise.resolve();
      screen.frame();
      const indices=[...root.querySelectorAll<HTMLElement>('#ribbon [data-index]')].map(e=>Number(e.dataset.index));
      expect(indices).toEqual(lower ? [8,9,10,11,4,5,6,7] : [4,5,6,7,8,9,10,11]);
      // Crossing to the next row retains the existing alternating playback rule.
      p.position = song.measures[8].start;
      screen.frame();
      const next=[...root.querySelectorAll<HTMLElement>('#ribbon [data-index]')].map(e=>Number(e.dataset.index));
      expect(next).toEqual(lower ? [8,9,10,11,12,13,14,15] : [12,13,14,15,8,9,10,11]);
    });
  }
}

it('measure counter seeks to the selected measure start, including the last measure', () => {
 const {p,song,screen,input,ids}=mount('web');
 screen.frame();
 for (const number of [4,song.measures.length,1]) {
   input(ids.progress).value=String(number);
   input(ids.progress).dispatchEvent(new Event('change'));
   expect(p.position).toBe(song.measures[number-1].start);
 }
});

it("shows recording estimates in app info and resets audio to exactly 1 after manual practice rate", async () => {
  const metadata = { version: 1, scoreBpm: 136, bpmEstimate: 136.232, firstBeatEstimateSeconds: .193, audioSHA256: "a".repeat(64), method: "signal", status: "estimate" };
  const xml = `<score-partwise><identification><miscellaneous><miscellaneous-field name="drum-practice:recording-tempo:v1">${JSON.stringify(metadata)}</miscellaneous-field></miscellaneous></identification></score-partwise>`;
  const { screen, p, song, click, ids } = mount("portable", false, xml);
  song.bpm = 136;
  click(ids.tempo);
  expect(document.getElementById("recording-tempo-info")!.textContent).toContain("136.232");
  expect(document.getElementById("recording-tempo-info")!.textContent).toContain("악보 136 BPM");
  expect(document.getElementById("recording-tempo-info")!.closest(".app-info")).not.toBeNull();
  expect(document.querySelector("#tempo-dialog p")).toBeNull();
  expect(document.querySelector("#tempo-dialog .tempo-number")!.getAttribute("title")).toContain("오른쪽·위로");
  await screen.rate(100);
  expect(song.settings.rate).toBeCloseTo(100 / 136.232);
  expect(document.getElementById(ids.tempoInput)!.getAttribute("aria-valuenow")).toBe("100");
  expect(document.getElementById("tempo-reset")!.textContent).toBe("원곡136 BPM");
  expect(document.querySelector("#tempo-reset .tempo-original-bpm")!.textContent).toBe("136 BPM");
  click("tempo-reset");
  await vi.waitFor(() => expect(p.setRate).toHaveBeenLastCalledWith(1, true));
  expect(song.bpm).toBe(136);
  expect(song.settings.rate).toBe(1);
  expect((document.getElementById(ids.tempoInput) as HTMLInputElement).value).toBe("136");
  expect(document.getElementById(ids.tempo)!.textContent).toContain("136");
  expect(document.getElementById("tempo-reset")!.getAttribute("aria-pressed")).toBe("true");
  await screen.rate(136);
  expect(p.setRate).toHaveBeenLastCalledWith(136 / 136.232, false);
  expect((document.getElementById(ids.tempoInput) as HTMLInputElement).value).toBe("136");
  expect(document.getElementById("tempo-reset")!.getAttribute("aria-pressed")).toBe("false");
});
for (const environment of ['web','portable'] as const) it(`${environment}: vertical arrows select the same column in adjacent rows without jumping at missing cells`, () => {
 const {song,p,screen,ids}=mount(environment);song.settings.view='rows';screen.renderTrack();
 const selected=()=>Number((document.getElementById(ids.progress) as HTMLInputElement).value)-1;
 const key=(key:string)=>{const e=new KeyboardEvent('keydown',{key,cancelable:true});document.dispatchEvent(e);screen.frame();return e;};
 p.position=song.measures[1].start+.1;
 expect(key('ArrowDown').defaultPrevented).toBe(true);expect(selected()).toBe(5);
 key('ArrowDown');expect(selected()).toBe(9);
 key('ArrowUp');expect(selected()).toBe(5);
 key('ArrowUp');expect(selected()).toBe(1);
 key('ArrowUp');expect(selected()).toBe(1);
 key('ArrowRight');expect(selected()).toBe(2);
 key('ArrowDown');expect(selected()).toBe(6);
 // The fixture has 110 measures: the final row has only columns 1 and 2.
 screen.seek(song.measures[106].start);key('ArrowDown');expect(selected()).toBe(106);
 screen.seek(song.measures[109].start);key('ArrowDown');expect(selected()).toBe(109);
 screen.seek(song.measures[105].start);key('ArrowDown');expect(selected()).toBe(109);
 song.settings.view='ribbon';expect(key('ArrowUp').defaultPrevented).toBe(false);expect(selected()).toBe(109);
});
for (const environment of ['web','portable'] as const) it(`${environment}: Enter registers a range while arrow keys continue navigating between endpoints`,()=>{
 const {p,song,screen,root,ids}=mount(environment);
 const selected=()=>Number((document.getElementById(ids.progress) as HTMLInputElement).value)-1;song.settings.view='rows';screen.renderTrack();
 const key=(key:string)=>{document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));screen.frame();};
 p.position=song.measures[1].start;key('Enter');expect(root.querySelector('.loop-slots')?.textContent ?? root.querySelector('#loop-slots')!.textContent).toContain('2~?');
 key('ArrowDown');expect(selected()).toBe(5);key('ArrowRight');expect(selected()).toBe(6);
 key('Enter');expect(song.loops.at(-1)).toMatchObject({start:song.measures[1].start,end:song.measures[6].end});
 expect(root.querySelector('#loop-slots')!.textContent).toContain('2~7');
});
for(const environment of ['web','portable'] as const)it(`${environment}: Latin M and Korean physical M both toggle the current measure marker`,()=>{
 const {p,song,screen}=mount(environment);song.markers=[];song.markerSlots=[];p.position=song.measures[4].start+.1;
 const key=(key:string,isComposing=false)=>{document.dispatchEvent(new KeyboardEvent('keydown',{key,code:'KeyM',isComposing,cancelable:true}));screen.frame();};
 key('m');expect(song.markers).toHaveLength(1);expect(song.markers[0].time).toBe(song.measures[4].start);
 key('M');expect(song.markers).toHaveLength(0);
 key('ㅡ');expect(song.markers).toHaveLength(1);
 key('Process',true);expect(song.markers).toHaveLength(0);
});

for(const environment of ['web','portable'] as const)for(const view of ['ribbon','rows'] as const)it(`${environment} ${view}: selection leaves paused playback and shading fixed, then Play starts selected bar`,async()=>{
 const {p,song,screen,root,ids}=mount(environment);song.settings.view=view;screen.renderTrack();
 const paused=song.measures[4].start+.3;screen.seek(paused);screen.frame();
 const shade=()=>Array.from(root.querySelectorAll<HTMLElement>('.measure')).map(e=>e.style.getPropertyValue('--played'));
 const before=shade();const playhead=root.querySelector<HTMLElement>('#stage')!.style.getPropertyValue('--playhead-x');
 document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',cancelable:true}));screen.frame();
 expect(p.position).toBe(paused);expect(shade()).toEqual(before);
 expect(root.querySelector<HTMLElement>('#stage')!.style.getPropertyValue('--playhead-x')).toBe(playhead);
 expect(Number((document.getElementById(ids.progress) as HTMLInputElement).value)).toBe(6);
 document.dispatchEvent(new KeyboardEvent('keydown',{key:'M',code:'KeyM',cancelable:true}));
 expect(song.markers.at(-1)?.time).toBe(song.measures[5].start);expect(p.position).toBe(paused);
 await screen.toggle();expect(p.playing).toBe(true);expect(p.position).toBe(song.measures[5].start);
});

for(const environment of ['web','portable'] as const)for(const view of ['rows','ribbon'] as const)it(`${environment} ${view}: saved ranges remain marked without active repeat and disappear after deletion`,()=>{
 const {p,song,screen,root}=mount(environment);song.settings.view=view;
 song.loops=[{id:'saved-range',name:'2~4',start:song.measures[1].start,end:song.measures[3].end}];song.repeatSlots=['saved-range'];p.loop=undefined;
 screen.renderTrack();screen.frame();
 const marked=()=>Array.from(root.querySelectorAll<HTMLElement>('.has-saved-loop')).map(e=>Number(e.dataset.index));
 expect(marked()).toEqual([1,2,3]);expect(root.querySelector('.in-loop')).toBeNull();
 document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',cancelable:true}));screen.frame();expect(marked()).toEqual([1,2,3]);
 song.loops=[];song.repeatSlots=[];screen.frame();expect(marked()).toEqual([]);
});
for(const environment of ['web','portable'] as const)it(`${environment}: range buttons jump from keyboard selection and delete at the selected start measure`,()=>{
 const {p,song,screen,root,ids}=mount(environment);
 song.loops=[{id:'range',name:'6~8',start:song.measures[5].start,end:song.measures[7].end}];song.repeatSlots=['range'];screen.renderLists();
 const key=(key:string)=>{document.dispatchEvent(new KeyboardEvent('keydown',{key,cancelable:true}));screen.frame();};
 key('ArrowRight');root.querySelector<HTMLButtonElement>('[data-loop-slot="0"]')!.click();screen.frame();
 expect(p.position).toBe(song.measures[5].start);expect(Number((document.getElementById(ids.progress) as HTMLInputElement).value)).toBe(6);expect(song.loops).toHaveLength(1);
 screen.seek(song.measures[4].start);key('ArrowRight');expect(p.position).toBe(song.measures[4].start);
 root.querySelector<HTMLButtonElement>('[data-loop-slot="0"]')!.click();screen.frame();expect(song.loops).toHaveLength(0);expect(p.loop).toBeUndefined();
});

for(const environment of ['web','portable'] as const)it(`${environment}: entering range selection preserves the browsed two-row viewport and score DOM`,()=>{
 const {song,screen,root,p}=mount(environment);song.settings.view='rows';screen.renderTrack();screen.frame();
 const stage=root.querySelector<HTMLElement>('#stage')!,first=root.querySelector('.measure');stage.scrollTop=728;
 root.querySelector<HTMLButtonElement>('[data-loop-slot="0"]')!.click();screen.frame();
 expect(stage.scrollTop).toBe(728);expect(root.querySelector('.measure')).toBe(first);expect(stage.classList.contains('range-selection-mode')).toBe(true);expect(p.position).toBe(0);
 document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));screen.frame();expect(stage.scrollTop).toBe(728);
});

for(const environment of ['web','portable'] as const)it(`${environment}: paused double clicks register inclusive endpoints without seeking or playing`,()=>{
 vi.useFakeTimers();const {song,screen,root,p}=mount(environment);screen.renderTrack();screen.frame();
 const double=(index:number)=>{for(let i=0;i<2;i++)for(const type of ['pointerdown','pointerup']){const e=new MouseEvent(type,{bubbles:true,cancelable:true,button:0,clientX:100,clientY:100});Object.assign(e,{pointerId:1,pointerType:'mouse',isPrimary:true});root.querySelector(`[data-index="${index}"]`)!.dispatchEvent(e);}};
 double(5);expect(song.loops).toHaveLength(0);expect(root.querySelector('#loop-slots')!.textContent).toContain('6~?');expect(p.position).toBe(0);
 double(9);vi.advanceTimersByTime(300);expect(song.loops.at(-1)).toMatchObject({start:song.measures[5].start,end:song.measures[9].end});expect(p.play).not.toHaveBeenCalled();expect(p.position).toBe(0);
 double(12);document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight'}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',cancelable:true}));expect(song.loops.at(-1)).toMatchObject({start:song.measures[12].start,end:song.measures[13].end});
 double(15);document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));expect(song.loops).toHaveLength(2);vi.useRealTimers();
});

for (const environment of ['web','portable'] as const) for (const pointerType of ['mouse','touch']) for (const view of ['ribbon','rows'] as const)
it(`${environment}/${view}: one ${pointerType} tap plays the selected measure, different measures only select`, async () => {
  vi.useFakeTimers();
  try {
    const {root,p,song,screen}=mount(environment);song.settings.view=view;screen.renderTrack();
    const tap=(index:number)=>{for(const type of ['pointerdown','pointerup']){const e=new MouseEvent(type,{bubbles:true,cancelable:true,button:0,clientX:100,clientY:100});Object.assign(e,{pointerId:1,pointerType,isPrimary:true});root.querySelector(`[data-index="${index}"]`)!.dispatchEvent(e);}};
    tap(3);await vi.advanceTimersByTimeAsync(300);expect(p.play).not.toHaveBeenCalled();
    tap(3);await vi.advanceTimersByTimeAsync(300);expect(p.play).toHaveBeenCalledTimes(1);expect(p.position).toBe(song.measures[3].start);
    p.pause();document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
    const paused=p.position;expect(paused).toBe(song.measures[3].start);
    tap(4);await vi.advanceTimersByTimeAsync(300);expect(p.play).toHaveBeenCalledTimes(2);expect(p.position).toBe(song.measures[4].start);
  } finally { vi.useRealTimers(); }
});
for(const environment of ['web','portable'] as const) it(`${environment}: selected taps during Enter range entry cannot start playback`, async()=>{
  vi.useFakeTimers();
  try {
    const {root,p,screen}=mount(environment);screen.renderTrack();
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
    for(const type of ['pointerdown','pointerup']){const e=new MouseEvent(type,{bubbles:true,cancelable:true,button:0,clientX:100,clientY:100});Object.assign(e,{pointerId:1,pointerType:'mouse',isPrimary:true});root.querySelector('[data-index="1"]')!.dispatchEvent(e);}
    await vi.advanceTimersByTimeAsync(300);expect(p.play).not.toHaveBeenCalled();
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  } finally { vi.useRealTimers(); }
});

for(const environment of ['web','portable'] as const) it(`${environment}: double clicking the already selected measure registers a range, never plays`,()=>{
  vi.useFakeTimers();
  try {
    const {root,p,song}=mount(environment);song.loops=[];song.repeatSlots=[];
    for(let i=0;i<2;i++)for(const type of ['pointerdown','pointerup']){const e=new MouseEvent(type,{bubbles:true,cancelable:true,button:0,clientX:100,clientY:100});Object.assign(e,{pointerId:1,pointerType:'mouse',isPrimary:true});root.querySelector('[data-index="0"]')!.dispatchEvent(e);}
    vi.advanceTimersByTime(300);expect(p.play).not.toHaveBeenCalled();expect(root.querySelector('#loop-slots')!.textContent).toContain('1~?');
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    const stage=root.querySelector('#stage')!;
    for(const type of ['pointerdown','pointerup']){const e=new MouseEvent(type,{bubbles:true,cancelable:true,button:0,clientX:100,clientY:100});Object.assign(e,{pointerId:1,pointerType:'mouse',isPrimary:true});stage.dispatchEvent(e);}
    vi.advanceTimersByTime(300);expect(p.play).not.toHaveBeenCalled();
  } finally {vi.useRealTimers();}
});

it("audio uses common waveform navigation, rows and playback frame without score assets", () => {
  const {screen,song,p,root,fail}=mount("portable");
  Object.assign(song,{bpm:120,firstBeat:.2,pageCount:0,pdfName:"",regions:[],scoreFormat:undefined,audioPractice:{duration:12,beats:4,denominator:4,peaks:[.2,.6,1]},measures:audioMeasures(12,120,.2,4,4)});
  screen.renderTrack();screen.sync();
  expect(root.querySelectorAll('.audio-measure').length).toBe(6);
  expect(root.querySelector('#stage')?.getAttribute('aria-label')).toBe('음원 파형과 마디');
  p.position=3.2;screen.frame();
  song.settings.view='rows';screen.renderTrack();screen.frame();
  expect(root.querySelectorAll('.audio-measure').length).toBeGreaterThan(0);
  expect(root.querySelector('.audio-measure .crop img')).toBeNull();
  expect(fail).not.toHaveBeenCalled();
});

it('shows live original BPM to one decimal, holds when stopped, and separates practice at the same BPM', async()=>{
 const {screen,p,song,ids,click}=mount('web');
 click(ids.tempo);
 song.bpm=120;song.settings.rate=1;song.settings.tempoMode='original';
 song.audioPractice={duration:20,beats:4,denominator:4,peaks:[1],beatTimes:[.2,.7,1.18,1.64,2.08,2.5,2.9],followTempo:true};
 p.playing=true;p.position=2.08;screen.frame();
 expect(document.getElementById('original-tempo-value')!.textContent).toBe('= 127.7');
 p.playing=false;p.position=0;screen.onState();screen.frame();
 expect(document.getElementById('original-tempo-value')!.textContent).toBe('= 127.7');
 await screen.rate(120);
 expect(p.setRate).toHaveBeenLastCalledWith(1,false);
 expect(document.getElementById('original-tempo-value')!.textContent).toBe('= 120');
 expect(document.getElementById('tempo-reset')!.getAttribute('aria-pressed')).toBe('false');
 await screen.rate(120,true);
 expect(document.getElementById(ids.tempo)!.textContent).toContain('120.0');
});
