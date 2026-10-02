// @vitest-environment jsdom
import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  arrangePlaybackUI,
  transportHTML,
  repeatControlsHTML,
  webPlaybackBindings,
  portablePlaybackBindings,
} from "../src/playback-ui";
import { renderMeasure } from "../src/playback-measure";
import { installUIStandard } from "../src/ui-standard";
import type { Song } from "../src/model";

for (const [surface, bindings] of [
  ["web", webPlaybackBindings],
  ["portable", portablePlaybackBindings],
] as const) {
  it(`shares transport hierarchy and preserves handlers and state: ${surface}`, () => {
    document.body.innerHTML = `<div id="app"><h1 id="${bindings.title}"></h1><button id="${bindings.tempo}"></button>
      ${transportHTML({
        rewindId: bindings.rewind,
        rewindButton: surface === "web" ? "jump" : "rewind",
        positionId: bindings.position,
        right: `<input id="${bindings.progress}" value="42">`,
      })}
      <section class="repeat-controls" ${bindings.repeat ? `id="${bindings.repeat}"` : ""}>
        <button id="${bindings.adjust}"></button>
        ${repeatControlsHTML({ radiusAttribute: surface === "web" ? "data-loop-radius" : "data-radius", summaryId: bindings.summary, stopId: bindings.stop })}
        <div id="${bindings.markers}" class="marker-slots"></div>
      </section></div>`;
    const root = document.getElementById("app")!;
    const play = document.getElementById("play")!;
    let clicks = 0;
    play.onclick = () => clicks++;
    arrangePlaybackUI(root, bindings);
    installUIStandard(surface, root);
    arrangePlaybackUI(root, bindings);
    installUIStandard(surface, root);
    play.click();
    expect(clicks).toBe(1);
    expect(root.querySelector(".playback-progress")).toHaveProperty(
      "value",
      "42",
    );
    expect(root.querySelectorAll(".playback-group")).toHaveLength(1);
    expect(
      [...root.querySelector(".transport")!.children].map((e) => e.className),
    ).toEqual(["flex transport-left", "icon-button", "flex transport-right"]);
    expect(root.querySelectorAll(".repeat-presets button")).toHaveLength(4);
    expect(root.querySelector(".repeat-actions")!.firstElementChild).toBe(
      document.getElementById(bindings.adjust),
    );
    expect(root.querySelector(".repeat-controls")!.lastElementChild).toBe(
      document.getElementById(bindings.markers),
    );
  });
}
it("renders safe lyrics and a correctly hidden marker from a single measure component", () => {
  const s = JSON.parse(readFileSync("public/demo/song.json", "utf8")) as Song;
  s.markers = [];
  const m = s.measures[0],
    r = s.regions.find((r) => r.id === m.regionId)!;
  const props = {
    s,
    m,
    i: 0,
    width: 300,
    r,
    ly: [
      {
        ...s.lyrics[0],
        text: '<img src=x onerror="boom">',
        time: m.start,
        confirmed: true,
      },
    ],
    pageURL: "blob:score",
    pageRatio: 1.294,
    isSVG: false,
    positionInMeasure: () => 150,
  };
  document.body.innerHTML = renderMeasure(props);
  expect(document.querySelector(".measure-marker")).toHaveProperty(
    "hidden",
    true,
  );
  expect(document.querySelector("img")).toBeNull();
  expect(document.querySelector(".syllable")!.textContent).toBe(
    props.ly[0].text,
  );
  s.markers = [{ id: "test", name: "test", time: m.start }];
  document.body.innerHTML = renderMeasure(props);
  expect(document.querySelector(".measure-marker")).toHaveProperty(
    "hidden",
    false,
  );
  expect(
    document.querySelector(".score-marker-icon path")!.getAttribute("fill"),
  ).toBe("#f52d35");
});

import { icon } from "../src/icon-svg";
it("renders every portable action icon without authoring definitions", () => {
  for (const name of ["screen", "info", "close", "settings", "metronome", "bookmark", "sliders", "start", "repeat", "rewind", "check", "play", "pause"]) {
    const svg=icon(name);
    expect(svg).not.toContain("undefined");
    expect(svg).toMatch(/<(path|circle|rect)/);
  }
});
