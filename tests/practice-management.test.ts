// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import {
  attachPracticeManagement,
  practiceLoopHTML,
  practiceMarkerHTML,
} from "../src/practice-management";
import { markMeasure } from "../src/marker-slots";
import type { Song, Loop } from "../src/model";
afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});
function setup() {
  const song: Song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  song.loops = [];
  song.markers = [];
  document.body.innerHTML = `<main>${practiceLoopHTML()}${practiceMarkerHTML()}<input id="loop-a"><input id="loop-ab"><input id="loop-b"><input id="loop-bb"></main>`;
  const root = document.querySelector("main")!;
  const player = {
    current: () => song.measures[8].start,
    loop: undefined as Loop | undefined,
  };
  const changed = vi.fn(),
    fail = vi.fn();
  let management: ReturnType<typeof attachPracticeManagement>;
  const playback = {
    loopFromForm: (id?: string, name = "") => ({
      id: id ?? "new",
      name,
      start: 10,
      end: 20,
    }),
    clearPreset: vi.fn(),
    stopLoop: vi.fn(),
    updateLoopBeatBounds: vi.fn(),
    seek: vi.fn(),
    useLoop: (loop?: Loop) => {
      player.loop = loop;
      management.render();
    },
    mark: () => {
      markMeasure(song, player.current(), "marker", undefined);
      management.render();
      changed();
    },
    renderLists: () => management.render(),
  };
  management = attachPracticeManagement({
    root,
    song: () => song,
    canonicalXML: () => '<score-partwise><part><measure><direction><direction-type><rehearsal>전주</rehearsal></direction-type></direction></measure></part></score-partwise>',
    playback: () => playback,
    player: () => player,
    changed,
    fail,
  });
  const click = (selector: string) =>
    root.querySelector<HTMLButtonElement>(selector)!.click();
  const value = (id: string, v: string) =>
    ((root.querySelector(`#${id}`) as HTMLInputElement).value = v);
  return {
    song,
    player,
    changed,
    fail,
    playback,
    management,
    click,
    value,
    root,
  };
}
it("renders independent automatic section shortcuts and seeks their starting measure", () => {
  const c = setup();
  c.management.render();
  expect(c.root.querySelectorAll("#section-shortcuts button")).toHaveLength(9);
  expect(c.root.querySelector("#section-shortcuts")!.textContent).toContain("전주");
  const before = c.root.querySelector("#section-shortcuts")!.innerHTML;
  c.playback.mark();
  expect(c.root.querySelector("#section-shortcuts")!.innerHTML).toBe(before);
  c.click('[data-section-measure="0"]');
  expect(c.playback.seek).toHaveBeenCalledWith(c.song.measures[0].start);
  expect(c.song.markers).toHaveLength(1);
});
it("disposes section navigation handlers", () => {
 const c = setup(); c.management.render(); c.management.dispose();
 c.click('[data-section-measure="0"]'); expect(c.playback.seek).not.toHaveBeenCalled();
});
