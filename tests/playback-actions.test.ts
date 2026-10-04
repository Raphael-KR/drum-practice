// @vitest-environment jsdom
import { it, expect, vi } from "vitest";
import {
  beginPlaybackScrub,
  finishPlaybackScrub,
  validLoop,
  changePlaybackLoop,
  installPlaybackKeys,
  installPlaybackWheel,
} from "../src/playback-actions";
import { createDialog, closeDialogOnBackdrop } from "../src/dialog-ui";
import { renderScoreRows } from "../src/playback-layout";
import type { Song } from "../src/model";
const player = () => ({
  playing: true,
  duration: 100,
  position: 5,
  loop: { id: "l", name: "loop", start: 2, end: 8 },
  current() {
    return this.position;
  },
  pause() {
    this.playing = false;
  },
  seek(t: number) {
    this.position = t;
  },
  play: vi.fn(async () => {}),
});
it("cancel restores time, loop and repeat selection without resuming", () => {
  const p = player(),
    snapshot = beginPlaybackScrub(p, { center: 3, radius: 2 }),
    restore = vi.fn();
  p.position = 40;
  p.loop = { id: "x", name: "x", start: 30, end: 50 };
  finishPlaybackScrub(p, snapshot, true, restore, vi.fn());
  expect(p.position).toBe(5);
  expect(p.loop.id).toBe("l");
  expect(p.playing).toBe(false);
  expect(restore).toHaveBeenCalledWith({ center: 3, radius: 2 });
  expect(p.play).not.toHaveBeenCalled();
});
it("loop transition preserves an in-range position and resumes once", () => {
  const p = player(),
    update = vi.fn();
  changePlaybackLoop(
    p,
    { id: "n", name: "n", start: 4, end: 9 },
    true,
    update,
    vi.fn(),
  );
  expect(p.position).toBe(5);
  expect(update).toHaveBeenCalledOnce();
  expect(p.play).toHaveBeenCalledOnce();
  expect(validLoop(1, 1.1, 10)).toBe(false);
  expect(validLoop(NaN, 3, 10)).toBe(false);
  expect(validLoop(1, 10.005, 10)).toBe(true);
});
it("keyboard ignores held Space and editing fields on every host", () => {
  document.body.innerHTML = "<input />";
  const toggle = vi.fn();
  const dispose = installPlaybackKeys({
    ready: () => true,
    cancel: vi.fn(),
    toggle,
    mark: vi.fn(),
    step: vi.fn(),
  });
  document.dispatchEvent(
    new KeyboardEvent("keydown", { code: "Space", key: " ", repeat: true }),
  );
  document
    .querySelector("input")!
    .dispatchEvent(
      new KeyboardEvent("keydown", { code: "Space", key: " ", bubbles: true }),
    );
  expect(toggle).not.toHaveBeenCalled();
  document.dispatchEvent(
    new KeyboardEvent("keydown", { code: "Space", key: " " }),
  );
  expect(toggle).toHaveBeenCalledOnce();
  dispose();
});
it("wheel normalizes line units and preserves paused rows native scrolling", () => {
  document.body.innerHTML = '<div id="stage"></div>';
  const stage = document.querySelector<HTMLElement>("div")!;
  let view = "ribbon";
  const dispose = installPlaybackWheel(stage, {
    ready: () => true,
    playing: () => false,
    view: () => view,
    cancel: vi.fn(),
    browse: vi.fn(),
    scrub: vi.fn(),
  });
  stage.dispatchEvent(
    new WheelEvent("wheel", { deltaY: 2, deltaMode: 1, cancelable: true }),
  );
  expect(stage.scrollLeft).toBe(32);
  view = "rows";
  const event = new WheelEvent("wheel", { deltaY: 10, cancelable: true });
  stage.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  dispose();
});
it("dialog does not close when a drag starts inside and ends outside", () => {
  document.body.innerHTML = "";
  const d = createDialog("test", "Title", "tool-dialog");
  d.close = vi.fn();
  d.getBoundingClientRect = () =>
    ({ left: 10, right: 100, top: 10, bottom: 100 }) as DOMRect;
  closeDialogOnBackdrop(d);
  d.dispatchEvent(new MouseEvent("pointerdown", { clientX: 30, clientY: 30 }));
  d.dispatchEvent(new MouseEvent("click", { clientX: 120, clientY: 120 }));
  expect(d.close).not.toHaveBeenCalled();
  d.dispatchEvent(
    new MouseEvent("pointerdown", { clientX: 120, clientY: 120 }),
  );
  d.dispatchEvent(new MouseEvent("click", { clientX: 120, clientY: 120 }));
  expect(d.close).toHaveBeenCalledOnce();
  d.remove();
});
it("paused row frames preserve browsing and resize rebuilds all measures", () => {
  document.body.innerHTML = '<div id="stage"><div id="ribbon"></div></div>';
  const stage = document.getElementById("stage")!,
    ribbon = document.getElementById("ribbon")!;
  Object.defineProperty(stage, "clientWidth", {
    value: 800,
    configurable: true,
  });
  const state = {
    rowWindow: -1,
    pausedBrowseIndex: -1,
    renderedBrowseWidth: NaN,
    playbackRowOrigin: 0,
  };
  const h = {
    stage,
    ribbon,
    song: () => ({ measures: Array.from({ length: 9 }, () => ({})) }) as Song,
    playing: false,
    scrubbing: false,
    resume: false,
    measureHTML: (_: unknown, i: number, w: number) =>
      `<div data-index="${i}" style="width:${w}px"></div>`,
    layoutLyrics: vi.fn(),
  };
  renderScoreRows(h, state, 0);
  expect(ribbon.querySelectorAll(".browse-row")).toHaveLength(3);
  stage.scrollTop = 400;
  renderScoreRows(h, state, 0);
  expect(stage.scrollTop).toBe(400);
  expect(h.layoutLyrics).toHaveBeenCalledOnce();
  Object.defineProperty(stage, "clientWidth", { value: 400 });
  renderScoreRows(h, state, 0);
  expect(h.layoutLyrics).toHaveBeenCalledTimes(2);
});
it.each([8, 9, 12, 123])('keeps the last row below the preceding row for %i measures', length => {
 const stage=document.createElement('div'), ribbon=document.createElement('div');stage.append(ribbon);
 const state={rowWindow:-1,pausedBrowseIndex:-1,renderedBrowseWidth:NaN,playbackRowOrigin:0};
 const h={stage,ribbon,song:()=>({measures:Array.from({length},()=>({}))}) as Song,playing:true,scrubbing:false,resume:false,cellWidth:100,
 measureHTML:(_:unknown,i:number)=>`<div data-index="${i}"></div>`,layoutLyrics:vi.fn()};
 renderScoreRows(h,state,length-1);
 const first=(Math.ceil(length/4)-2)*4;
 expect([...ribbon.children].map(e=>Number((e as HTMLElement).dataset.index))).toEqual(Array.from({length:length-first},(_,i)=>first+i));
 h.playing=false;
 renderScoreRows(h,state,length-1);
 const rows=[...ribbon.querySelectorAll<HTMLElement>('.browse-row')];
 rows.forEach((row,i)=>Object.defineProperty(row,'offsetTop',{value:28+i*200}));
 state.pausedBrowseIndex=-1;
 renderScoreRows(h,state,length-1);
 expect(stage.scrollTop).toBe((rows.length-2)*200);
});
