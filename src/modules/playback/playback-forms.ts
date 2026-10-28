import { ZOOM_TICKS, zoomFromSlider } from "../score/score-zoom";
import { fullscreenSupported } from "../../platform/browser/fullscreen";
import { setIconButton } from "../../shared/ui/icon-button";
/** Shared playback form markup. Authoring content is appended by the web host. */
import { dialogHeader } from "../../shared/ui/dialog-ui";
import { escapeHTML } from "../../shared/ui/html";
import { t } from "../../shared/i18n/i18n";
import { icon, metronomeIcon, tempoNote } from "../../shared/ui/icon-svg";
import type { Settings } from "../../model/model";
import {
  METRONOME_VOLUME_ADJUSTABLE,
  metronomeMode,
  metronomeModes,
  nextMetronomeMode,
} from "../../model/metronome";
import { playbackButton, repeatControlsHTML } from "./playback-ui";
import { settingsSwitch } from "../../shared/ui/settings-ui";
import { componentName } from "../../shared/ui/ui-standard";
export function tempoFieldsHTML(id: string) {
  return `<label class="tempo-number" title="${t("workspace.message544")}"><input id="${id}" type="text" inputmode="none" readonly role="slider" min="47" max="113" step="1" value="94" aria-label="${t("main.message208")}"><span>${t("term.BPM")}</span></label><div id="tempo-status" role="status" aria-live="polite" aria-atomic="true"></div><div class="tempo-choices"><div id="tempo-options"></div><div class="tempo-reference"><button id="tempo-reset" title="${t("workspace.message545")}">${t("tempo.original")}</button><button id="tempo-score"></button></div></div>`;
}
export function soundFieldsHTML() {
  return `<div class="playback-sound-fields">${[
    ["music-volume", "main.message129"],
    ["click-volume", "workspace.message548"],
  ]
    .map(([id, key]) => {
      const fixed = id === "click-volume" && !METRONOME_VOLUME_ADJUSTABLE;
      return `<label class="volume-channel"${fixed ? " hidden" : ""}><output for="${id}" id="${id}-value">100%</output><input id="${id}" aria-label="${t(key as "main.message129")}" type="range" min="0" max="1" step=".01"${fixed ? " disabled" : ""}><span>${t(key as "main.message129")}</span></label>`;
    })
    .join("")}</div>`;
}
export function zoomFieldHTML() {
  return `<label class="playback-zoom-row"><strong class="settings-item-title">${t("playback.message455")}</strong><span class="zoom-scale"><input id="zoom" type="range" min="0" max="100" step="0.5" value="50" list="zoom-ticks"><datalist id="zoom-ticks">${ZOOM_TICKS.map((p) => `<option value="${p}"></option>`).join("")}</datalist><span class="zoom-tick-labels" aria-hidden="true">${ZOOM_TICKS.map((p) => `<span>${Math.round(zoomFromSlider(p) * 100)}%</span>`).join("")}</span></span><output id="zoom-value" for="zoom">100%</output></label>`;
}
export function loopFieldsHTML() {
  return "";
}
export function progressFieldHTML(id: string) {
  return `<label class="progress-number" title="${t("workspace.message546")}"><input id="${id}" type="text" inputmode="none" readonly role="slider" min="1" max="1" step="1" value="1" aria-label="${t("workspace.message547")}" aria-valuemin="1" aria-valuemax="1" aria-valuenow="1"><span class="progress-separator" aria-hidden="true">/</span><span class="progress-total" aria-hidden="true">1</span></label>`;
}
export function playbackTransportRightHTML(ids: {
  progress: string;
  mark: string;
  sound: string;
}) {
  return progressFieldHTML(ids.progress);
}
export function playbackPreferenceFieldsHTML(
  restart: string,
  countoff: string,
) {
  return (
    settingsSwitch(
      restart,
      t("playback.message442"),
      t("playback.message443"),
    ) +
    settingsSwitch(
      countoff,
      t("playback.message444"),
      t("playback.message445"),
    ) +
    `<div class="settings-metronome-row"><strong class="settings-item-title" id="metronome-choices-title">${componentName("metronome")}</strong><div id="metronome-choices" class="settings-choice-buttons segmented-control" role="group" aria-labelledby="metronome-choices-title">${metronomeModes.map((mode) => `<button type="button" data-metronome-mode="${mode}" data-help-title="${componentName("metronome")}" data-help="${t(`metronome.${mode}Description`)}" aria-label="${componentName("metronome")} ${t(`metronome.${mode}`)}">${t(`metronome.${mode}`)}</button>`).join("")}</div></div>` +
    '<p id="playback-settings-status" class="subtle" role="status"></p>'
  );
}
export function titleOrderFieldsHTML() {
  return `<div class="settings-choice-row"><div class="settings-choice-buttons segmented-control" role="group" aria-label="${t("settings.titleOrder")}"><button type="button" data-title-order="title-first" title="${t("settings.titleFirst")}">${t("settings.titleFirst")}</button><button type="button" data-title-order="artist-first" title="${t("settings.artistFirst")}">${t("settings.artistFirst")}</button></div><p class="subtle">${t("settings.titleOrder")}</p></div>`;
}
export function screenSettingsHTML(
  ids: { pdf: string; highlight: string; fullscreen: string },
  compare = false,
) {
  return (
    `<div class="settings-choice-row"><div class="settings-choice-buttons segmented-control" role="group" aria-label="${t("main.message108")}">${["ribbon", "rows", ...(compare ? ["compare"] : [])].map((value, i) => `<button type="button" data-setting-control="view" data-setting-value="${value}" title="${t((["main.message109", "main.message110", "main.message111"] as const)[i])}">${t((["main.message109", "main.message110", "main.message111"] as const)[i])}</button>`).join("")}</div><p id="view-description" class="subtle"></p><span id="view-selected-text" hidden></span><select id="view" hidden><option value="ribbon">${t("main.message109")}</option><option value="rows">${t("main.message110")}</option>${compare ? `<option value="compare">${t("main.message111")}</option>` : ""}</select></div>` +
    `<div id="pdf-view-row" class="settings-choice-row"><div class="settings-choice-buttons segmented-control" role="group" aria-label="${t("settings.scoreFormat")}"><button type="button" data-setting-control="${ids.pdf}" data-setting-value="true" title="${t("settings.pdfOriginal")}">${t("settings.pdfOriginal")}</button><button type="button" data-setting-control="${ids.pdf}" data-setting-value="false" title="${t("settings.musicxml")}">${t("settings.musicxml")}</button></div><p id="pdf-view-status" class="subtle">${t("main.message227")}</p><input id="${ids.pdf}" type="checkbox" hidden disabled></div>` +
    titleOrderFieldsHTML() +
    zoomFieldHTML() +
    settingsSwitch(
      "uniform-spacing",
      t("settings.uniformSpacing"),
      t("settings.uniformSpacingDescription"),
    ) +
    settingsSwitch(
      ids.highlight,
      t("playback.message439"),
      t("main.message255"),
      true,
      { descriptionId: "note-highlight-description" },
    ) +
    `<div class="settings-group"${fullscreenSupported() ? "" : " hidden"}>${settingsSwitch(ids.fullscreen, t("playback.message441"), t("workspace.message562"))}<p id="fullscreen-status" class="subtle" role="status"></p></div>`
  );
}
export type SettingsCategory =
  "screen" | "playback" | "score" | "audio" | "info" | "metronome" | "tempo";
export function settingsFrameHTML() {
  return (
    dialogHeader(
      t("icons.message059"),
      "",
      "settings-dialog",
      "settings-heading",
    ) + settingsLayoutHTML()
  );
}
export function settingsLayoutHTML({ sound = true, navigation = true } = {}) {
  const sidebar =
    navigation || sound
      ? `<aside class="settings-sidebar">${navigation ? `<nav class="settings-nav" aria-label="${t("workspace.message561")}"></nav>` : ""}${sound ? soundFieldsHTML() : ""}</aside>`
      : "";
  return `<div class="settings-layout">${sidebar}<div class="settings-detail"><h3 id="settings-detail-heading" hidden></h3></div></div>`;
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
  const detail = root.querySelector(".settings-detail")!;
  detail.insertBefore(
    section,
    category === "info"
      ? null
      : detail.querySelector('[data-settings-panel="info"]'),
  );
  const nav = root.querySelector(".settings-nav");
  if (!nav) return section;
  const button = document.createElement("button");
  button.id = buttonId;
  button.className = "icon-button";
  button.dataset.settingsCategory = category;
  setIconButton(
    button,
    category === "tempo"
      ? tempoNote
      : icon(
          category === "playback"
            ? "play"
            : category === "score" || category === "audio"
              ? "library"
              : category,
        ),
    title,
    title,
  );
  button.dataset.help = t("help.tipSettingsTabs");
  button.onclick = () => select(category);
  nav.insertBefore(
    button,
    category === "info"
      ? null
      : nav.querySelector('[data-settings-category="info"]'),
  );
  return section;
}
export function selectPlaybackSettings(
  root: ParentNode,
  category: SettingsCategory,
) {
  const detail = root.querySelector<HTMLElement>(".settings-detail")!;
  const dialog = detail.closest<HTMLElement>("#settings-dialog")!;
  const phone = dialog.classList.contains("settings-phone-landscape");
  const available = (name: string) =>
    dialog.classList.contains("settings-phone-landscape")
      ? ["screen", "playback", "metronome", "tempo"].includes(name)
      : !["metronome", "tempo"].includes(name);
  const panels = [
    ...detail.querySelectorAll<HTMLElement>("[data-settings-panel]"),
  ];
  const mark = (current: string) => {
    dialog.dataset.settingsCurrent = current;
    root
      .querySelectorAll<HTMLElement>("[data-settings-category]")
      .forEach((button) => {
        button.hidden = !available(button.dataset.settingsCategory!);
        const active = button.dataset.settingsCategory === current;
        button.classList.toggle("primary", active);
        button.setAttribute("aria-current", active ? "location" : "false");
      });
  };
  if (
    !available(category) ||
    !panels.some((panel) => panel.dataset.settingsPanel === category)
  )
    category = "screen";
  panels.forEach((panel) => {
    panel.hidden =
      !available(panel.dataset.settingsPanel!) ||
      (phone && panel.dataset.settingsPanel !== category);
    if (!panel.querySelector(".settings-section-heading")) {
      const heading = document.createElement("h3");
      heading.className = "settings-section-heading";
      heading.textContent = componentName(
        `settings.${panel.dataset.settingsPanel}`,
      );
      panel.prepend(heading);
    }
  });
  if (!root.querySelector(".settings-nav")) return category;
  if (!detail.dataset.scrollNavigation) {
    detail.dataset.scrollNavigation = "true";
    detail.addEventListener("scroll", () => {
      if (dialog.classList.contains("settings-phone-landscape")) return;
      const top = detail.getBoundingClientRect().top;
      const sections = [
        ...detail.querySelectorAll<HTMLElement>("[data-settings-panel]"),
      ];
      const current = sections.find(
        (panel) =>
          !panel.hidden && panel.getBoundingClientRect().bottom > top + 32,
      );
      if (current) mark(current.dataset.settingsPanel!);
    });
  }
  const scroll = () => {
    const panel = panels.find(
      (panel) => panel.dataset.settingsPanel === category,
    );
    if (phone) detail.scrollTop = 0;
    else if (panel)
      detail.scrollTop +=
        panel.getBoundingClientRect().top - detail.getBoundingClientRect().top;
    mark(category);
  };
  scroll();
  const heading = root.querySelector<HTMLElement>("#settings-detail-heading")!;
  heading.textContent =
    category === "info"
      ? t("main.message097")
      : componentName(`settings.${category}`);
  heading.hidden = true;
  return category;
}

export function metronomeControlHTML(
  options: {
    id?: string;
    name?: string;
    label?: string;
    preview?: boolean;
  } = {},
) {
  if (!options.preview)
    return `<button id="click" type="button" class="metronome-toggle" data-metronome-mode="quarter" aria-label="${componentName("metronome")}">${metronomeIcon("quarter")}</button>`;
  return `<label class="metronome-toggle" title="${t("icons.message075")}"><input id="${escapeHTML(options.id ?? "click")}" ${options.name ? `name="${escapeHTML(options.name)}"` : ""} type="checkbox" checked aria-label="${escapeHTML(options.label ?? t("icons.message076"))}">${icon("metronome")}</label>`;
}
export function syncMetronomeControls(root: ParentNode, settings: Settings) {
  const mode = metronomeMode(settings);
  const button = root.querySelector<HTMLButtonElement>("#click");
  if (button) {
    if (button.dataset.metronomeMode !== mode) {
      button.dataset.metronomeMode = mode;
      button.innerHTML = metronomeIcon(mode);
    }
    button.setAttribute(
      "aria-label",
      t("metronome.current", { mode: t(`metronome.${mode}`) }),
    );
    button.dataset.help = `${t(`metronome.${mode}Description`)} ${t("metronome.cycle", { next: t(`metronome.${nextMetronomeMode(settings)}`) })}`;
    button.title = button.dataset.help;
  }
  root
    .querySelectorAll<HTMLButtonElement>(
      "#metronome-choices [data-metronome-mode]",
    )
    .forEach((choice) => {
      const selected = choice.dataset.metronomeMode === mode;
      choice.setAttribute("aria-pressed", String(selected));
    });
}
export function playbackBrandHTML(titleId: string, tempoId: string) {
  return `<h1><span id="${titleId}">${t("main.message097")}</span></h1><button id="${tempoId}" type="button" hidden disabled aria-haspopup="dialog" aria-label="${t("main.message211")}"><span id="original-tempo-value"></span></button>`;
}
export function repeatBarHTML(ids: {
  repeat: string;
  adjust: string;
  markers: string;
  radiusAttribute: string;
  summaryId: string;
  stopId: string;
}) {
  return `<section ${ids.repeat ? `id="${ids.repeat}"` : ""} class="repeat-controls" aria-label="${t("workspace.message549")}"><div class="repeat-actions">${playbackButton(ids.adjust, "repeat", t("icons.message067"))}${repeatControlsHTML(ids)}</div><div id="${ids.markers}" class="marker-slots" role="group" aria-label="${t("playback.message452")}"></div></section>`;
}
/** The visible choices reuse the existing settings change handlers. */
export function syncSettingsChoices(root: ParentNode) {
  root
    .querySelectorAll<HTMLButtonElement>("[data-setting-control]")
    .forEach((button) => {
      const control = root.querySelector<HTMLInputElement | HTMLSelectElement>(
        `#${button.dataset.settingControl}`,
      );
      if (!control) return;
      const value =
        control instanceof HTMLInputElement
          ? String(control.checked)
          : control.value;
      const active = value === button.dataset.settingValue;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("primary", active);
      const option =
        control instanceof HTMLSelectElement
          ? [...control.options].find(
              (o) => o.value === button.dataset.settingValue,
            )
          : undefined;
      button.disabled = control.disabled || !!option?.disabled;
      button.onclick = () => {
        if (button.disabled || active) return;
        if (control instanceof HTMLInputElement)
          control.checked = button.dataset.settingValue === "true";
        else control.value = button.dataset.settingValue!;
        control.dispatchEvent(new Event("change", { bubbles: true }));
        syncSettingsChoices(root);
      };
    });
  root.querySelectorAll<HTMLElement>(".settings-choice-row").forEach((row) => {
    const choices = row.querySelectorAll<HTMLButtonElement>(
      "[data-setting-control]",
    );
    if (choices.length)
      row.hidden = [...choices].filter((button) => !button.disabled).length < 2;
  });
}
