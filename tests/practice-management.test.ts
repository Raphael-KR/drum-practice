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
      management.loopChanged(loop);
      management.render();
    },
    mark: () => {
      markMeasure(song, player.current(), "marker", management.markerName());
      management.render();
      changed();
    },
    renderLists: () => management.render(),
  };
  management = attachPracticeManagement({
    root,
    song: () => song,
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
it("saves, reopens, renames and deletes a named loop through shared controls", () => {
  const c = setup();
  c.value("loop-name", "Verse");
  c.click("#save-loop");
  expect(c.song.loops).toHaveLength(1);
  expect(c.management.draft()).toEqual({ id: "new", name: "Verse" });
  c.click("#new-loop");
  expect(c.management.draft().id).toBeUndefined();
  c.click('[data-loop="new"]');
  expect(c.player.loop?.name).toBe("Verse");
  vi.spyOn(window, "prompt").mockReturnValue("Chorus");
  c.click('[data-rename-loop="new"]');
  expect(c.song.loops[0].name).toBe("Chorus");
  expect(c.player.loop?.name).toBe("Chorus");
  c.click('[data-delete-loop="new"]');
  expect(c.song.loops).toHaveLength(0);
  expect(c.player.loop).toBeUndefined();
  expect(c.management.draft().id).toBeUndefined();
  expect(c.changed).toHaveBeenCalled();
  expect(c.fail).not.toHaveBeenCalled();
});
it("adds named markers, escapes names, seeks, renames and deletes", () => {
  const c = setup();
  c.value("marker-name", "<img onerror=x>");
  c.click("#add-marker");
  expect(c.song.markers[0].name).toBe("<img onerror=x>");
  expect(c.root.querySelector("img")).toBeNull();
  c.click('[data-marker="marker"]');
  expect(c.playback.seek).toHaveBeenCalledWith(c.song.measures[8].start);
  vi.spyOn(window, "prompt").mockReturnValue("Practice");
  c.click('[data-rename-marker="marker"]');
  expect(c.song.markers[0].name).toBe("Practice");
  c.click('[data-delete-marker="marker"]');
  expect(c.song.markers).toHaveLength(0);
});
it("disposes handlers and captures current musical position for loop endpoints", () => {
  const c = setup();
  c.click("#set-a");
  expect((c.root.querySelector("#loop-a") as HTMLInputElement).value).toBe("9");
  expect(c.playback.updateLoopBeatBounds).toHaveBeenCalledOnce();
  c.management.dispose();
  c.click("#add-marker");
  expect(c.song.markers).toHaveLength(0);
});
