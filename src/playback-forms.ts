import { setIconButton } from "./icon-button";
/** Shared playback form markup. Authoring content is appended by the web host. */
import { dialogHeader } from "./dialog-ui";
import { escapeHTML } from "./html";
import { formatDate, t } from "./i18n";
import { icon } from "./icon-svg";
import { playbackButton, repeatControlsHTML } from "./playback-ui";
import { settingsSwitch } from "./settings-ui";
import { componentName } from "./ui-standard";
export function tempoFieldsHTML(id: string) {
  return `<label class="tempo-number"><input id="${id}" type="text" inputmode="none" readonly role="slider" min="47" max="113" step="1" value="94" aria-label="${t("main.message208")}"><span>${t("term.BPM")}</span></label><div id="tempo-options"></div><p class="subtle">${t("workspace.message544")}</p><button id="tempo-reset">${t("workspace.message545")}</button>`;
}
export function soundFieldsHTML() {
  return `<div class="playback-sound-fields">${[
    ["music-volume", "main.message129"],
    ["click-volume", "workspace.message548"],
  ]
    .map(
      ([id, key]) =>
        `<label>${t(key as "main.message129")}<input id="${id}" type="range" min="0" max="1" step=".01"></label>`,
    )
    .join("")}</div>`;
}
export function zoomFieldHTML() {
  return `<label class="playback-zoom-row"><strong class="settings-item-title">${t("portable-player.message455")}</strong><input id="zoom" type="range" min="0.5" max="2" step="0.05"></label>`;
}
export function loopFieldsHTML() {
  return `<div class="playback-loop-fields"><div class="flex"><label>${t("main.message133")}<input id="loop-a" type="number" min="1" value="1"></label><label>${t("main.message136")}<input id="loop-b" type="number" min="1" value="1"></label></div>
    <div class="loop-precision"><label><input id="loop-precise" type="checkbox">${t("workspace.message554")}</label><div id="loop-beat-controls" class="flex" hidden>
    <label>${t("workspace.message555")}<input id="loop-ab" type="number" min="1" step=".25" value="1"></label><label>${t("workspace.message556")}<input id="loop-bb" type="number" min="1" step=".25" value="5"></label></div></div>
    <p id="loop-range-help" class="subtle">${t("workspace.message552")}</p><button id="apply-loop" class="primary">${t("workspace.message559")}</button></div>`;
}
export function progressFieldHTML(id: string) {
  return `<label class="progress-number" title="${t("workspace.message546")}"><input id="${id}" type="text" inputmode="none" readonly role="slider" min="0" max="100" step="1" value="0" aria-label="${t("workspace.message547")}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span aria-hidden="true">%</span></label>`;
}
export function playbackTransportRightHTML(ids: {
  progress: string;
  mark: string;
  sound: string;
}) {
  return (
    progressFieldHTML(ids.progress) +
    playbackButton(
      ids.mark,
      "bookmark",
      t("main.message268"),
      t("icons.message069"),
    ) +
    playbackButton(
      ids.sound,
      "sliders",
      t("icons.message070"),
      t("icons.message070"),
    )
  );
}
export function playbackPreferenceFieldsHTML(
  restart: string,
  countoff: string,
) {
  return (
    settingsSwitch(
      restart,
      t("portable-player.message442"),
      t("portable-player.message443"),
    ) +
    settingsSwitch(
      countoff,
      t("portable-player.message444"),
      t("portable-player.message445"),
    ) +
    '<p id="playback-settings-status" class="subtle" role="status"></p>'
  );
}
export function screenSettingsHTML(
  ids: { pdf: string; highlight: string; fullscreen: string },
  compare = false,
) {
  return (
    `<div class="settings-control-description"><label class="view-select-row"><strong class="settings-item-title">${t("main.message108")}</strong><span class="view-select-control"><span id="view-selected-text" aria-hidden="true"></span><select id="view" aria-label="${t("main.message108")}"><option value="ribbon">${t("main.message109")}</option><option value="rows">${t("main.message110")}</option>${compare ? `<option value="compare">${t("main.message111")}</option>` : ""}</select></span></label><p id="view-description" class="subtle"></p></div>` +
    zoomFieldHTML() +
    settingsSwitch(
      ids.highlight,
      t("portable-player.message439"),
      t("main.message255"),
      true,
      { descriptionId: "note-highlight-description" },
    ) +
    `<div class="settings-group">${settingsSwitch(ids.pdf, t("portable-player.message438"), t("main.message227"), false, { rowId: "pdf-view-row", descriptionId: "pdf-view-status", disabled: true })}${settingsSwitch(ids.fullscreen, t("portable-player.message441"), t("workspace.message562"))}<p id="fullscreen-status" class="subtle" role="status"></p></div>`
  );
}
export type SettingsCategory = "screen" | "playback" | "score" | "info";
export function settingsFrameHTML() {
  return (
    dialogHeader(
      t("icons.message059"),
      "",
      "settings-dialog",
      "settings-heading",
    ) +
    `<div class="settings-layout"><nav class="settings-nav" aria-label="${t("workspace.message561")}"></nav><div class="settings-detail"><h3 id="settings-detail-heading" hidden></h3></div></div>`
  );
}
export function settingsPanel(
  root: HTMLElement,
  category: SettingsCategory,
  id: string,
  buttonId: string,
  select: (category: SettingsCategory) => void,
) {
  const section = document.createElement("section");
  section.id = id;
  section.className = "tool-body settings-panel";
  section.dataset.settingsPanel = category;
  const title = componentName(`settings.${category}`);
  section.setAttribute("aria-label", title);
  root.querySelector(".settings-detail")!.append(section);
  const button = document.createElement("button");
  button.id = buttonId;
  button.className = "icon-button";
  button.dataset.settingsCategory = category;
  setIconButton(
    button,
    icon(
      category === "playback"
        ? "play"
        : category === "score"
          ? "library"
          : category,
    ),
    title,
    title,
  );
  button.onclick = () => select(category);
  root.querySelector(".settings-nav")!.append(button);
  return section;
}
export function selectPlaybackSettings(
  root: ParentNode,
  category: SettingsCategory,
) {
  root
    .querySelectorAll<HTMLElement>("[data-settings-panel]")
    .forEach((panel) => {
      panel.hidden = panel.dataset.settingsPanel !== category;
    });
  root
    .querySelectorAll<HTMLElement>("[data-settings-category]")
    .forEach((button) => {
      const active = button.dataset.settingsCategory === category;
      button.classList.toggle("primary", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });
  const heading = root.querySelector<HTMLElement>("#settings-detail-heading")!;
  heading.textContent =
    category === "info"
      ? t("main.message097")
      : componentName(`settings.${category}`);
  heading.hidden = category !== "info";
}

export function metronomeControlHTML() {
  return `<label class="metronome-toggle" title="${t("icons.message075")}"><input id="click" type="checkbox" checked aria-label="${t("icons.message076")}">${icon("metronome")}</label>`;
}
export function playbackBrandHTML(titleId: string, tempoId: string) {
  return `<h1 id="${titleId}">${t("main.message097")}</h1><button id="${tempoId}" type="button" hidden disabled aria-haspopup="dialog" aria-label="${t("main.message211")}"><span id="original-tempo-value"></span></button>`;
}
export function repeatBarHTML(ids: {
  repeat: string;
  adjust: string;
  markers: string;
  radiusAttribute: string;
  summaryId: string;
  stopId: string;
}) {
  return `<section ${ids.repeat ? `id="${ids.repeat}"` : ""} class="repeat-controls" aria-label="${t("workspace.message549")}"><div class="repeat-actions">${playbackButton(ids.adjust, "repeat", t("icons.message067"), t("icons.message068"))}${repeatControlsHTML(ids)}</div><div id="${ids.markers}" class="marker-slots" role="group" aria-label="${t("portable-player.message452")}"></div></section>`;
}
export function appInfoHTML(
  version: string,
  build: { source: string; builtAt: string },
) {
  return `<section class="settings-group app-info"><dl><dt>${t("portable-player.message456")}</dt><dd id="app-version">${escapeHTML(version)} (${escapeHTML(build.source)})</dd><dt>${t("portable-player.message457")}</dt><dd id="app-built-at">${escapeHTML(formatDate(new Date(build.builtAt), { timeZone: "Asia/Seoul", year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }))} KST</dd></dl></section>`;
}
