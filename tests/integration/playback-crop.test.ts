import { JSDOM } from "jsdom";
import { expect, it } from "vitest";
import type { Song } from "../../src/model/model";
import { scoreLayout } from "../../src/modules/playback/playback-layout";
import { renderMeasure } from "../../src/modules/playback/playback-measure";
import { createPlaybackTrack } from "../../src/modules/playback/playback-track";
import type { PlaybackScreenHost } from "../../src/modules/playback/playback-screen";

// Native coordinates measured from the real-paradis candidate's 17th bar.
const region = {
  id: "r",
  page: 0,
  x: 50 / 1565,
  y: 610 / 2118,
  w: 369 / 1565,
  h: 210 / 2118,
  beatXs: [1 / 128, 1],
};
const staff = {
  top: 680 / 2118,
  gap: 10 / 2118,
  nativePageRatio: 2118 / 1565,
};
function song() {
  return {
    scoreFormat: "musicxml",
    regions: [region],
    measures: [
      { id: "m", label: "17", regionId: "r", beats: 4, denominator: 4 },
    ],
    markers: [],
    settings: { view: "rows", uniformSpacing: true, zoom: 1 },
  } as unknown as Song;
}

it.each(["rows", "ribbon"] as const)(
  "reveals grid ink at the side edges in %s without moving the engraving or vertical mask",
  (view) => {
    const s = song();
    s.settings.view = view;
    const layout = scoreLayout(s, region, 300, 1200, staff)!;
    const render = (uniform: boolean, isSVG = true) => {
      s.settings.uniformSpacing = uniform;
      return new JSDOM(
        renderMeasure({
          s,
          m: s.measures[0],
          i: 0,
          width: 300,
          r: region,
          layout,
          pageURL: "blob:score",
          pageRatio: staff.nativePageRatio,
          isSVG,
        }),
      ).window.document;
    };
    const normal = render(false),
      grid = render(true);
    expect(grid.querySelector(".score-engraving")!.outerHTML).toBe(
      normal.querySelector(".score-engraving")!.outerHTML,
    );
    const crop = grid.querySelector<HTMLElement>(".crop")!;
    const clip = (el: HTMLElement) =>
      el
        .getAttribute("style")!
        .match(/clip-path:inset\(([^)]+)\)/)![1]
        .split(" ")
        .map(parseFloat);
    const [top, right, bottom, left] = clip(crop);
    const normalClip = clip(normal.querySelector<HTMLElement>(".crop")!);
    expect([top, bottom]).toEqual([normalClip[0], normalClip[2]]);
    expect([left, right]).toEqual([-layout.gap, -layout.gap]);
    const headLeft = (46.88 - 50) * (300 / 369);
    expect(headLeft).toBeLessThan(0);
    expect(headLeft).toBeGreaterThan(left);
    expect(crop.classList.contains("has-ink-overhang")).toBe(true);
    expect(normal.querySelector(".has-ink-overhang")).toBeNull();
    expect(render(true, false).querySelector(".has-ink-overhang")).toBeNull();
  },
);

it("fits equal grid cells and their outside ink inside the stage while retaining the half-cell onset", () => {
  const { document } = new JSDOM(
    '<div id="stage"><div id="ribbon"></div></div>',
  ).window;
  const stage = document.querySelector<HTMLElement>("#stage")!;
  Object.defineProperties(stage, {
    clientWidth: { value: 1200 },
    clientHeight: { value: 500 },
  });
  const s = song();
  const asset = {
    region,
    staff,
    ratio: staff.nativePageRatio,
    phase: 1 / 128,
    url: "blob:score",
  };
  const track = createPlaybackTrack(
    {
      song: () => s,
      player: () =>
        ({ playing: false }) as ReturnType<PlaybackScreenHost["player"]>,
      assets: () => ({
        urls: [asset.url],
        ratios: [asset.ratio],
        highlights: [],
        staffs: new Map([[region.id, staff]]),
        ribbon: new Map([[0, { ...asset, grid: asset }]]),
      }),
    },
    {
      stage,
      ribbon: document.querySelector<HTMLElement>("#ribbon")!,
      scrubbing: () => false,
      resuming: () => false,
    },
  );
  const width = track.rowCellWidth();
  const layout = scoreLayout(s, region, width, 1200, staff)!;
  expect(width * 4 + layout.gap * 2).toBeCloseTo(1200);
  expect(
    parseFloat(stage.style.getPropertyValue("--fitted-row-width")),
  ).toBeCloseTo(width * 4);
  expect(track.position(0, 0, width)).toBeCloseTo(width / 128);
  s.settings.uniformSpacing = false;
  track.invalidate();
  expect(track.rowCellWidth()).toBe(300);
});
