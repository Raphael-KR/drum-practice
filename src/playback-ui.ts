import { iconButtonHTML } from "./icon-button";
import { t } from "./i18n";

export interface RepeatControls {
  radiusAttribute: string;
  summaryId: string;
  stopId: string;
}
/** Same visible content; only event-routing identifiers belong to each host. */
export function repeatControlsHTML(ids: RepeatControls) {
  return `<div class="repeat-presets">${[1, 2, 3, 4]
    .map(radius => `<button type="button" title="${t("tooltip.repeat", {radius})}" ${ids.radiusAttribute}="${radius}" aria-pressed="false">${t("workspace.message550", {radius})}</button>`).join("")}</div>`;
}

export interface PlaybackBindings {
  rewind: string;
  position: string;
  progress: string;
  repeat: string;
  summary: string;
  stop: string;
  adjust: string;
  markers: string;
  title: string;
  tempo: string;
  tempoInput: string;
}
export const webPlaybackBindings: PlaybackBindings = {
  rewind: "goto",
  position: "copy-position",
  progress: "progress-percent",
  repeat: "repeat-controls",
  summary: "loop-summary",
  stop: "quick-stop-loop",
  adjust: "open-loop-dialog",
  markers: "quick-markers",
  title: "song-title",
  tempo: "original-tempo",
  tempoInput: "rate",
};
export const portablePlaybackBindings: PlaybackBindings = {
  rewind: "rewind-bars",
  position: "position",
  progress: "percent",
  repeat: "",
  summary: "loop-state",
  stop: "loop-off",
  adjust: "adjust",
  markers: "markers",
  title: "title",
  tempo: "bpm",
  tempoInput: "tempo",
};
/** Reuse live controls so host handlers/state survive. Layout and styling are shared. */
export function arrangePlaybackUI(root: HTMLElement, ids: PlaybackBindings) {
  root.classList.add("playback-ui");
  const settings = root.querySelector(".settings-grid");
  if (settings) {
    settings.classList.add("settings-layout");
    settings.querySelector("nav")?.classList.add("settings-nav");
    settings.querySelector(":scope > div")?.classList.add("settings-detail");
  }
  const get = (id: string) => root.querySelector<HTMLElement>(`#${id}`)!;
  root.querySelector("#" + ids.tempoInput)?.classList.add("playback-tempo-input");
  const roles: Record<string, string> = {
    "playback-rewind": ids.rewind,
    "playback-position": ids.position,
    "playback-progress": ids.progress,
    "playback-summary": ids.summary,
    "playback-stop": ids.stop,
    "playback-adjust": ids.adjust,
    "playback-markers": ids.markers,
    "playback-title": ids.title,
    "playback-tempo": ids.tempo,
  };
  for (const [role, id] of Object.entries(roles)) get(id)?.classList.add(role);
  const transport = root.querySelector<HTMLElement>(".transport")!;
  const left = transport.querySelector<HTMLElement>(".transport-left")!;
  const right = transport.querySelector<HTMLElement>(".transport-right")!;
  transport.replaceChildren(left, get("play"), right);
  const repeat = ids.repeat
    ? get(ids.repeat)
    : root.querySelector<HTMLElement>(".repeat-controls")!;
  repeat.classList.add("repeat-controls");
  let actions = repeat.querySelector<HTMLElement>(".repeat-actions");
  if (!actions) {
    actions = document.createElement("div");
    actions.className = "repeat-actions";
  }
  actions.append(
    get(ids.adjust),
    repeat.querySelector(".repeat-presets")!,
  );
  repeat.replaceChildren(actions, get(ids.markers));
}

import { icon } from "./icon-svg";
export function playbackButton(
  id: string,
  symbol: string,
  label: string,
  caption = "",
) {
  return iconButtonHTML(id, icon(symbol), label, caption);
}
/** Host-specific controls are slots; the visible transport hierarchy has one definition. */
export function transportHTML(options: {
  rewindId: string;
  rewindButton: string;
  positionId: string;
  showPosition?: boolean;
  right: string;
}) {
  return `<div class="transport">
    <div class="flex transport-left">
      ${playbackButton("home", "start", t("icons.message051"))}
      <label title="${t("workspace.message542")}"><input id="${options.rewindId}" type="number" min="1" max="10" step="1" value="4" aria-label="${t("main.message118")}"></label>
      ${playbackButton(options.rewindButton, "rewind", t("icons.message053"))}
      ${options.showPosition === false ? "" : `<button id="${options.positionId}" title="${t("main.message120")}" aria-label="${t("main.message120")}"></button>`}
    </div>
    ${playbackButton("play", "play", t("icons.message052"))}
    <div class="flex transport-right">${options.right}</div>
  </div>`;
}

import type { Measure } from "./model";
export function scoreStageHTML(extra = "") {
  return `<div class="stage" id="stage" tabindex="0">${extra}<div class="ribbon" id="ribbon"></div><div class="playhead"></div><div id="playhead-status"><span id="playhead-bar"></span><strong id="playhead-beat"></strong><small id="playhead-signature"></small></div></div>`;
}
export function updatePlayhead(
  root: HTMLElement,
  measure: Measure,
  beat: number,
  count: number,
  ribbon: boolean,
) {
  root.querySelector<HTMLElement>("#playhead-status")!.hidden = !ribbon;
  root.querySelector("#playhead-bar")!.textContent = t("main.message245", {
    value1: measure.label,
  });
  root.querySelector("#playhead-beat")!.textContent =
    `${count ? t("main.message246") : ""}${count || Math.min(measure.beats, Math.floor(beat) + 1)}`;
  root.querySelector("#playhead-signature")!.textContent =
    `${measure.beats}/${measure.denominator}`;
  const stage = root.querySelector<HTMLElement>("#stage")!;
  stage.style.setProperty(
    "--scroll-x",
    `${stage.classList.contains("paused-ribbon-scroll") ? stage.scrollLeft : 0}px`,
  );
}
