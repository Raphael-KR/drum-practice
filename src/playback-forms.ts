import { ZOOM_TICKS, zoomFromSlider } from "./score-zoom";
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
  return `<label class="tempo-number"><input id="${id}" type="text" inputmode="none" readonly role="slider" min="47" max="113" step="1" value="94" aria-label="${t("main.message208")}"><span>${t("term.BPM")}</span></label><div class="tempo-choices"><div id="tempo-options"></div><button id="tempo-reset">${t("workspace.message545")}</button></div><p class="subtle">${t("workspace.message544")}</p>`;
}
export function soundFieldsHTML() {
  return `<div class="playback-sound-fields">${[
    ["music-volume", "main.message129"],
    ["click-volume", "workspace.message548"],
  ]
    .map(
      ([id, key]) =>
        `<label class="volume-channel"><output for="${id}" id="${id}-value">100%</output><input id="${id}" aria-label="${t(key as "main.message129")}" type="range" min="0" max="1" step=".01"><span>${t(key as "main.message129")}</span></label>`,
    )
    .join("")}</div>`;
}
export function zoomFieldHTML() {
  return `<label class="playback-zoom-row"><strong class="settings-item-title">${t("portable-player.message455")}</strong><span class="zoom-scale"><input id="zoom" type="range" min="0" max="100" step="1" value="50" list="zoom-ticks"><datalist id="zoom-ticks">${ZOOM_TICKS.map(p=>`<option value="${p}"></option>`).join("")}</datalist><span class="zoom-tick-labels" aria-hidden="true">${ZOOM_TICKS.map(p=>`<span>${Math.round(zoomFromSlider(p)*100)}%</span>`).join("")}</span></span><output id="zoom-value" for="zoom">100%</output></label>`;
}
export function loopFieldsHTML() {
  return "";
}
export function progressFieldHTML(id: string) {
  return `<label class="progress-number" title="${t("workspace.message546")}"><input id="${id}" type="text" inputmode="none" readonly role="slider" min="1" max="1" step="1" value="1" aria-label="${t("workspace.message547")}" aria-valuemin="1" aria-valuemax="1" aria-valuenow="1"><span aria-hidden="true">/1</span></label>`;
}
export function playbackTransportRightHTML(ids: {
  progress: string;
  mark: string;
  sound: string;
}) {
  return (
    progressFieldHTML(ids.progress)
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
    `<div class="settings-choice-row"><div class="settings-choice-buttons" role="group" aria-label="${t("main.message108")}">${["ribbon", "rows", ...(compare ? ["compare"] : [])].map((value, i) => `<button type="button" data-setting-control="view" data-setting-value="${value}">${t((["main.message109", "main.message110", "main.message111"] as const)[i])}</button>`).join("")}</div><p id="view-description" class="subtle"></p><span id="view-selected-text" hidden></span><select id="view" hidden><option value="ribbon">${t("main.message109")}</option><option value="rows">${t("main.message110")}</option>${compare ? `<option value="compare">${t("main.message111")}</option>` : ""}</select></div>` +
    `<div id="pdf-view-row" class="settings-choice-row"><div class="settings-choice-buttons" role="group" aria-label="${t("settings.scoreFormat")}"><button type="button" data-setting-control="${ids.pdf}" data-setting-value="true">${t("settings.pdfOriginal")}</button><button type="button" data-setting-control="${ids.pdf}" data-setting-value="false">${t("settings.musicxml")}</button></div><p id="pdf-view-status" class="subtle">${t("main.message227")}</p><input id="${ids.pdf}" type="checkbox" hidden disabled></div>` +
    zoomFieldHTML() +
    settingsSwitch("uniform-spacing", t("settings.uniformSpacing"), t("settings.uniformSpacingDescription")) +
    settingsSwitch(ids.highlight, t("portable-player.message439"), t("main.message255"), true, { descriptionId: "note-highlight-description" }) +
    `<div class="settings-group">${settingsSwitch(ids.fullscreen, t("portable-player.message441"), t("workspace.message562"))}<p id="fullscreen-status" class="subtle" role="status"></p></div>`
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
    `<div class="settings-layout"><aside class="settings-sidebar"><nav class="settings-nav" aria-label="${t("workspace.message561")}"></nav>${soundFieldsHTML()}</aside><div class="settings-detail"><h3 id="settings-detail-heading" hidden></h3></div></div>`
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
  const detail = root.querySelector<HTMLElement>(".settings-detail")!;
  const panels = [...detail.querySelectorAll<HTMLElement>("[data-settings-panel]")];
  const mark = (current: string) => {
    root.querySelectorAll<HTMLElement>("[data-settings-category]").forEach(button => {
      const active = button.dataset.settingsCategory === current;
      button.classList.toggle("primary", active);
      button.setAttribute("aria-current", active ? "location" : "false");
    });
  };
  panels.forEach(panel => {
    panel.hidden = false;
    if (!panel.querySelector(".settings-section-heading")) {
      const heading = document.createElement("h3");
      heading.className = "settings-section-heading";
      heading.textContent = componentName(`settings.${panel.dataset.settingsPanel}`);
      panel.prepend(heading);
    }
  });
  if (!detail.dataset.scrollNavigation) {
    detail.dataset.scrollNavigation = "true";
    detail.addEventListener("scroll", () => {
      const top = detail.getBoundingClientRect().top;
      const sections = [...detail.querySelectorAll<HTMLElement>("[data-settings-panel]")];
      const current = sections.find(panel => panel.getBoundingClientRect().bottom > top + 32);
      if (current) mark(current.dataset.settingsPanel!);
    });
  }
  const scroll = () => {
    const panel = panels.find(panel => panel.dataset.settingsPanel === category);
    if (panel) detail.scrollTop += panel.getBoundingClientRect().top - detail.getBoundingClientRect().top;
    mark(category);
  };
  scroll();
  const heading = root.querySelector<HTMLElement>("#settings-detail-heading")!;
  heading.textContent = category === "info" ? t("main.message097") : componentName(`settings.${category}`);
  heading.hidden = true;
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
  return `<section ${ids.repeat ? `id="${ids.repeat}"` : ""} class="repeat-controls" aria-label="${t("workspace.message549")}"><div class="repeat-actions">${playbackButton(ids.adjust, "repeat", t("icons.message067"))}${repeatControlsHTML(ids)}</div><div id="${ids.markers}" class="marker-slots" role="group" aria-label="${t("portable-player.message452")}"></div></section>`;
}
export function appInfoHTML(
  version: string,
  build: { source: string; builtAt: string },
) {
  return `<section class="settings-group app-info"><dl><dt>${t("portable-player.message456")}</dt><dd id="app-version">${escapeHTML(version)} (${escapeHTML(build.source)})</dd><dt>${t("portable-player.message457")}</dt><dd id="app-built-at">${escapeHTML(formatDate(new Date(build.builtAt), { timeZone: "Asia/Seoul", year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }))} KST</dd></dl></section>`;
}


/** The visible choices reuse the existing settings change handlers. */
export function syncSettingsChoices(root: ParentNode) {
  root.querySelectorAll<HTMLButtonElement>("[data-setting-control]").forEach(button => {
    const control = root.querySelector<HTMLInputElement | HTMLSelectElement>(`#${button.dataset.settingControl}`);
    if (!control) return;
    const value = control instanceof HTMLInputElement ? String(control.checked) : control.value;
    const active = value === button.dataset.settingValue;
    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("primary", active);
    const option = control instanceof HTMLSelectElement ? [...control.options].find(o => o.value === button.dataset.settingValue) : undefined;
    button.disabled = control.disabled || !!option?.disabled;
    button.onclick = () => {
      if (button.disabled || active) return;
      if (control instanceof HTMLInputElement) control.checked = button.dataset.settingValue === "true";
      else control.value = button.dataset.settingValue!;
      control.dispatchEvent(new Event("change", { bubbles: true }));
      syncSettingsChoices(root);
    };
  });
}
