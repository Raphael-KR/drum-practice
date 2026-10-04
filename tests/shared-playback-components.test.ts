// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import {
  updateRepeatControls,
  repeatFields,
  repeatPoint,
  repeatPreset,
  fillRepeatFields,
} from "../src/repeat-ui";
import {
  timeAtScroll,
  buildScoreTrack,
  installScoreScroll,
  updateScoreFrame,
} from "../src/playback-frame";
import { seekPlaybackFreely } from "../src/playback-actions";
import { markerSlotsHTML, bindMarkerSlots } from "../src/marker-ui";
import { settingsSwitch } from "../src/settings-ui";
import { scoreStageHTML } from "../src/playback-ui";
import type { Song } from "../src/model";
const song = (): Song =>
  JSON.parse(readFileSync("public/demo/song.json", "utf8"));
it("restores a partial ending beat instead of extending to end of measure", () => {
  const s = song(),
    a = s.measures[8],
    b = s.measures[9];
  const l = {
    start: a.start + (a.end - a.start) / 4,
    end: b.start + (b.end - b.start) * 0.625,
  };
  const fields = repeatFields(s, l);
  expect(fields.precise).toBe(true);
  expect(
    repeatPoint(s, fields.startMeasure, fields.startBeat, false),
  ).toBeCloseTo(l.start, 4);
  expect(repeatPoint(s, fields.endMeasure, fields.endBeat, true)).toBeCloseTo(
    l.end,
    4,
  );
  document.body.innerHTML =
    '<div id="fields"><input id="loop-a"><input id="loop-b"><input id="loop-ab"><input id="loop-bb"></div>';
  fillRepeatFields(document.getElementById("fields")!, s, l);
  expect(
    Number((document.getElementById("loop-bb") as HTMLInputElement).value),
  ).toBeCloseTo(1 + b.beats * 0.625);
  expect(() => repeatPoint(s, 1, NaN, false)).toThrow();
});
it("presets clamp at song boundaries and roundtrip complete measures", () => {
  const s = song();
  const p = repeatPreset(s, s.measures[0].start, s.measures.at(-1)!.end, 4);
  const f = repeatFields(s, p.loop);
  expect(f.precise).toBe(false);
  expect(p.loop.start).toBe(s.measures[0].start);
});
it("rebuilt tracks retain array identity used by scroll seeking and exit loops", () => {
  const s = song();
  s.settings.view = "ribbon";
  document.body.innerHTML = '<div id="stage"><div id="ribbon"></div></div>';
  const stage = document.getElementById("stage")!,
    ribbon = document.getElementById("ribbon")!;
  const offsets: number[] = [],
    widths: number[] = [];
  const p = {
    playing: false,
    duration: s.measures.at(-1)!.end,
    position: 0,
    loop: {
      id: "l",
      name: "l",
      start: s.measures[0].start,
      end: s.measures[0].end,
    },
    current() {
      return this.position;
    },
    pause() {},
    seek(t: number) {
      this.position = t;
    },
    play: async () => {},
  };
  const exit = vi.fn();
  const position = (i: number, b: number, w: number) =>
    (b / s.measures[i].beats) * w;
  const dispose = installScoreScroll(stage, {
    enabled: () => true,
    song: () => s,
    offsets,
    widths,
    position,
    seek: (t) => seekPlaybackFreely(p, t, exit),
    selected: vi.fn(),
  });
  for (const width of [100, 200]) {
    buildScoreTrack(
      stage,
      ribbon,
      s,
      offsets,
      widths,
      () => width,
      (_, i, w) => `<div data-index="${i}" style="width:${w}px"></div>`,
    );
    stage.scrollLeft = width * 2.5;
    stage.dispatchEvent(new Event("scroll"));
    expect(p.position).toBeCloseTo(
      (s.measures[2].start + s.measures[2].end) / 2,
      4,
    );
  }
  expect(exit).toHaveBeenCalledOnce();
  expect(p.loop).toBeUndefined();
  dispose();
  expect(timeAtScroll(s, 1, [], [], position)).toBeUndefined();
});
it("frame applies shared loop boundaries, progress and native viewport rules", () => {
  const s = song();
  s.settings.view = "rows";
  document.body.innerHTML = '<div id="app">' + scoreStageHTML() + "</div>";
  const root = document.getElementById("app")!,
    stage = document.getElementById("stage")!,
    ribbon = document.getElementById("ribbon")!;
  ribbon.innerHTML = s.measures
    .slice(0, 4)
    .map(
      (_, i) =>
        `<div data-index="${i}"><span class="measure-beat"></span></div>`,
    )
    .join("");
  const h = {
    root,
    stage,
    ribbon,
    s,
    t: s.measures[1].start,
    playing: false,
    count: 0,
    loop: {
      id: "l",
      name: "l",
      start: s.measures[0].start,
      end: s.measures[2].end,
    },
    highlight: false,
    native: true,
    scrubbing: false,
    offsets: [0, 100, 200, 300],
    widths: [100, 100, 100, 100],
    position: () => 0,
    rows: vi.fn(),
  };
  expect(updateScoreFrame(h)).toBe(false);
  expect(
    ribbon.querySelector('[data-index="0"]')!.classList.contains("loop-start"),
  ).toBe(true);
  expect(
    ribbon.querySelector('[data-index="2"]')!.classList.contains("loop-end"),
  ).toBe(true);
  expect(
    ribbon.querySelector('[data-index="1"]')!.classList.contains("active"),
  ).toBe(true);
});
it("marker slots resolve the same measure from web IDs and portable indexes", () => {
  const s = song();
  s.markers = [{ id: "m", name: "test", time: s.measures[8].start + 0.1 }];
  for (const byIndex of [false, true]) {
    document.body.innerHTML = markerSlotsHTML(s, "data-slot", byIndex);
    const seek = vi.fn();
    const dispose = bindMarkerSlots(
      document.body,
      () => s,
      seek,
      "data-slot",
      byIndex,
    );
    document.querySelector<HTMLButtonElement>("button:not(:disabled)")!.click();
    expect(seek).toHaveBeenCalledWith(s.measures[8].start);
    dispose();
  }
});
it("switches share accessible description, disabled and checked state", () => {
  document.body.innerHTML = settingsSwitch("x", "Title", "Description", true, {
    disabled: true,
  });
  const input = document.querySelector("input")!;
  expect(input.checked).toBe(true);
  expect(input.disabled).toBe(true);
  expect(
    document.getElementById(input.getAttribute("aria-describedby")!)!
      .textContent,
  ).toBe("Description");
});
it("both entry points mount the single screen owner", () => {
  for (const file of ["main.ts", "playback-runtime.ts"]) {
    const source = readFileSync(`src/${file}`, "utf8");
    expect(source).toContain("createPlaybackScreen({");
    for (const call of [
      "updateScoreFrame(",
      "installScoreScroll(",
      "buildScoreTrack(",
      "attachPlaybackGestures(",
      "repeatPreset(",
      "updateRepeatControls(",
      "renderMeasure(",
      "installPlaybackKeys(",
    ])
      expect(source.includes(call), `${file} owns duplicate ${call}`).toBe(
        false,
      );
  }
});

it("portable switch visibility uses the shared component selector", () => {
  const source = readFileSync("src/portable-player.ts", "utf8");
  expect(source).not.toContain('closest<HTMLElement>(".setting")');
  document.body.innerHTML = settingsSwitch(
    "highlight",
    "Highlight",
    "Description",
  );
  expect(
    document.getElementById("highlight")!.closest(".settings-switch"),
  ).not.toBeNull();
});


it("does not turn automatic end-of-track alignment into a seek", () => {
  const stage = document.createElement("div");
  const s = song();
  const seek = vi.fn();
  const selected = vi.fn();
  const dispose = installScoreScroll(stage, {
    enabled: () => true, song: () => s,
    offsets: s.measures.map((_, i) => i * 100),
    widths: s.measures.map(() => 100),
    position: (i, beat, width) => beat / s.measures[i].beats * width,
    seek, selected,
  });
  stage.scrollLeft = s.measures.length * 100;
  stage.style.setProperty("--scroll-x", `${stage.scrollLeft}px`);
  stage.dispatchEvent(new Event("scroll"));
  expect(seek).not.toHaveBeenCalled();
  expect(selected).not.toHaveBeenCalled();
  stage.scrollLeft -= 50;
  stage.dispatchEvent(new Event("scroll"));
  expect(seek).toHaveBeenCalledOnce();
  expect(selected).toHaveBeenCalledOnce();
  dispose();
});

it('marker slot seeks first and deletes only when its measure is already selected',()=>{
 const s=song();s.markers=[{id:'m',name:'test',time:s.measures[8].start}];
 document.body.innerHTML=markerSlotsHTML(s,'data-slot');
 let current=s.measures[0].start;
 const remove=vi.fn(), seek=vi.fn((time:number)=>{current=time;});
 const dispose=bindMarkerSlots(document.body,()=>s,seek,'data-slot',false,{current:()=>current,remove});
 const button=document.querySelector<HTMLButtonElement>('button:not(:disabled)')!;
 button.click(); expect(seek).toHaveBeenCalledOnce();expect(remove).not.toHaveBeenCalled();
 current+=0.1;button.click();expect(remove).toHaveBeenCalledWith('m');expect(seek).toHaveBeenCalledOnce();
 dispose();
});

it('places the shared uniform spacing switch immediately before note following', async()=>{
 const {screenSettingsHTML}=await import('../src/playback-forms');
 const node=document.createElement('div');
 node.innerHTML=screenSettingsHTML({pdf:'pdf',highlight:'highlight',fullscreen:'fullscreen'});
 const row=node.querySelector('#uniform-spacing')!.closest('label')!;
 expect(row.nextElementSibling?.querySelector('#highlight')).not.toBeNull();
 expect((node.querySelector('#uniform-spacing') as HTMLInputElement).checked).toBe(false);
});

it("keeps configured ranges visible while the master repeat is off", () => {
 const s = song();
 const root = document.createElement("div");
 root.innerHTML = '<button id="master"></button><button data-radius="1"></button><button data-radius="2"></button>';
 const a=repeatPreset(s,s.measures[3].start,s.measures.at(-1)!.end,1).loop;
 const b=repeatPreset(s,s.measures[8].start,s.measures.at(-1)!.end,2).loop;
 const presets=new Map([[1,a],[2,b]]);
 const bindings={summary:"",stop:"",adjust:"master",attribute:"data-radius"};
 updateRepeatControls(root,s,b,2,bindings,presets);
 const labels=[...root.querySelectorAll("[data-radius]")].map(e=>e.textContent);
 expect(root.querySelector('#master')!.getAttribute('aria-pressed')).toBe('true');
 expect(root.querySelector('[data-radius="2"]')!.getAttribute('aria-pressed')).toBe('true');
 updateRepeatControls(root,s,undefined,undefined,bindings,presets);
 expect([...root.querySelectorAll("[data-radius]")].map(e=>e.textContent)).toEqual(labels);
 expect([...root.querySelectorAll('button')].every(e=>e.getAttribute('aria-pressed')==='false')).toBe(true);
 updateRepeatControls(root,s,b,2,bindings,presets);
 expect(root.querySelector('[data-radius="2"]')!.classList.contains('primary')).toBe(true);
});

it('empty bookmark buttons invoke the existing current-measure toggle',()=>{
 const s=song();s.markers=[];delete s.markerSlots;
 document.body.innerHTML=markerSlotsHTML(s,'data-slot');
 const toggleCurrent=vi.fn();
 const dispose=bindMarkerSlots(document.body,()=>s,vi.fn(),'data-slot',false,{current:()=>0,remove:vi.fn(),toggleCurrent});
 const buttons=[...document.querySelectorAll<HTMLButtonElement>('.empty-marker-slot')];
 expect(buttons).toHaveLength(5);
 for(const button of buttons) {
  expect(button.disabled).toBe(false);
  expect(button.getAttribute('aria-label')).toBe('현재 마디에 마커 표기');
  button.querySelector('path')!.dispatchEvent(new MouseEvent('click',{bubbles:true}));
 }
 expect(toggleCurrent).toHaveBeenCalledTimes(5);
 s.markers=[{id:'current',name:'current',time:s.measures[0].start}];
 buttons[0].click();
 expect(toggleCurrent).toHaveBeenCalledTimes(5);
 dispose();
});
