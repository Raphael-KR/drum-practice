// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import {
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
