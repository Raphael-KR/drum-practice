import appVersions from "./app-versions.json";
import buildInfo from "./build-info.generated.json";
import { t as i18nText } from "./i18n";
import { licenseSection } from "./licenses";
import { appInfoHTML, selectPlaybackSettings } from "./playback-forms";
import { mountPlaybackShell } from "./playback-shell";
import { webPlaybackBindings } from "./playback-ui";
import { isPortable } from "./portable";
import { componentName } from "./ui-standard";
// Arrange existing controls without duplicating their state or event handlers.
export type SettingsCategory = "screen" | "playback" | "score" | "info";
const settingsTitles: Record<SettingsCategory, string> = {
  screen: componentName("settings.screen"),
  playback: componentName("settings.playback"),
  score: componentName("settings.score"),
  info: componentName("settings.info"),
};
const SETTINGS_KEY = "drum-practice.settings-category";
let lastCategory: SettingsCategory = "screen";
function rememberedCategory(): SettingsCategory {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved && Object.hasOwn(settingsTitles, saved))
      return saved as SettingsCategory;
  } catch {
    /* Session fallback. */
  }
  return lastCategory;
}
export function updateViewWidth() {
  const select = document.getElementById("view") as HTMLSelectElement;
  const mirror = document.getElementById("view-selected-text");
  if (mirror) mirror.textContent = select.selectedOptions[0]?.textContent || "";
}
export function selectSettingsCategory(category: SettingsCategory) {
  if (isPortable && category === "score") category = "screen";
  lastCategory = category;
  try {
    localStorage.setItem(SETTINGS_KEY, category);
  } catch {
    /* Session fallback. */
  }
  selectPlaybackSettings(document, category);
}
export function openSettings(
  category: SettingsCategory = rememberedCategory(),
) {
  (document.getElementById("settings-dialog") as HTMLDialogElement).showModal();
  selectSettingsCategory(category);
}
export function closeSettings() {
  (document.getElementById("settings-dialog") as HTMLDialogElement).close();
}
/** Restore settings only for dialogs opened from settings, including native Escape. */
export function openSettingsChild(child: HTMLDialogElement) {
  const settings = document.getElementById(
    "settings-dialog",
  ) as HTMLDialogElement;
  if (settings.open) {
    const category = lastCategory;
    const scroll = settings.scrollTop;
    const detail = settings.querySelector<HTMLElement>(".settings-detail")!;
    const detailScroll = detail.scrollTop;
    const origin = document.activeElement as HTMLElement | null;
    child.addEventListener(
      "close",
      () => {
        openSettings(category);
        settings.scrollTop = scroll;
        detail.scrollTop = detailScroll;
        origin?.focus({ preventScroll: true });
      },
      { once: true },
    );
    settings.close();
  }
  child.showModal();
}
export function arrangeWorkspace() {
  const el = (id: string) => document.getElementById(id)!;
  const practice = el("practice");
  document.getElementById("app")!.classList.add("touch-workspace");
  practice.querySelector(".statusline")!.append(el("error-notice"));
  const loops = el("loop-slots").closest(".panel")!;
  const markers = el("section-shortcuts").closest(".panel")!;
  const backup = markers.querySelector("details")!;
  backup.querySelector("summary")!.remove();
  loops.querySelector("h2")?.remove();
  markers.querySelector("h2")!.remove();
  markers.insertAdjacentHTML(
    "beforeend",
    '<span id="active-loop" hidden></span><button id="quick-add-marker" hidden></button>',
  );
  const { screen: screenBody, addSettings: settingsPanel } = mountPlaybackShell(
    el("app"),
    {
      ids: {
        ...webPlaybackBindings,
        rewindButton: "jump",
        mark: "open-marker-dialog",
        sound: "open-sound-dialog",
        settings: "open-settings-dialog",
        radiusAttribute: "data-loop-radius",
      },
      screen: {
        pdf: "prefer-pdf",
        highlight: "note-highlight",
        fullscreen: "auto-fullscreen",
      },
      preferences: { restart: "restart-measure", countoff: "count-off" },
      select: selectSettingsCategory,
      openSettings: () => openSettings(),
      compare: true,
      loopExtra: loops as HTMLElement,
      markerContent: markers as HTMLElement,
    },
  );
  screenBody.insertAdjacentHTML(
    "beforeend",
    '<div id="review-help"><p id="review-availability"></p><button id="review-add-score">' +
      i18nText("main.message346") +
      "</button></div>",
  );
  updateViewWidth();
  const scoreSettings = settingsPanel(
    "score",
    "score-settings",
    "open-score-settings",
  );
  const group = (title: string, id: string) => {
    const section = document.createElement("section");
    section.id = id;
    section.className = "settings-group score-management-group";
    const heading = document.createElement("h4");
    heading.textContent = title;
    section.append(heading);
    scoreSettings.append(section);
    return section;
  };
  const edit = group(
    i18nText("score-management.message489"),
    "score-edit-actions",
  );
  el("edit-button").textContent = i18nText("icons.message072");
  edit.append(el("original-button"), el("edit-button"));
  edit.insertAdjacentHTML(
    "beforeend",
    '<button id="lyrics-button" type="button">' +
      i18nText("icons.message073") +
      '</button><button id="metadata-button" type="button">' +
      i18nText("icons.message074") +
      "</button>",
  );
  const backupBody = group(i18nText("workspace.message563"), "backup-dialog");
  el("save-html").textContent = i18nText("icons.message058");
  backupBody.append(
    el("save-html"),
    ...backup.children,
    el("portable-note"),
    el("alignment-note"),
  );
  const info = settingsPanel("info", "info-settings", "open-info-settings");
  info.innerHTML = appInfoHTML(appVersions.editor.version, buildInfo);
  info.append(licenseSection());
  info.append(practice.querySelector(".keyboard")!);
  const log = document.createElement("section");
  log.className = "work-log";
  log.innerHTML =
    "<h4>" +
    i18nText("workspace.message564") +
    '</h4><p class="subtle">' +
    i18nText("workspace.message565") +
    "</p>";
  el("busy").textContent = i18nText("workspace.message566");
  log.append(el("busy"));
  info.append(log);
  backup.remove();
  practice.querySelector(".panels")!.remove();
  selectSettingsCategory(rememberedCategory());

  const seek = el("seek");
  const wrap = document.createElement("div");
  wrap.className = "seek-control";
  seek.before(wrap);
  wrap.append(seek);
  wrap.insertAdjacentHTML(
    "beforeend",
    '<output id="seek-position" hidden></output>',
  );
  (seek.closest(".seekrow") as HTMLElement).hidden = true;

  // Editing has explicit tabs; lyrics and metadata no longer sit below a PDF page.
  const editor = el("editor-dialog");
  const metadata = editor.querySelector(":scope > .flex")!;
  const score = editor.querySelector(".editor")!;
  const right = score.children[1];
  const lyricHeading = right.querySelectorAll("h3")[1];
  const lyricPane = document.createElement("section");
  lyricPane.id = "editor-lyrics";
  let node: Element | null = lyricHeading;
  while (node) {
    const next: Element | null = node.nextElementSibling;
    lyricPane.append(node);
    node = next;
  }
  const metaPane = document.createElement("section");
  metaPane.id = "editor-meta";
  metadata.className = "metadata-fields";
  const timing = document.createElement("section");
  timing.className = "metadata-timing";
  timing.innerHTML =
    "<h3>" +
    i18nText("workspace.message568") +
    "</h3><div class='timing-fields'></div><div class='timing-actions'></div>";
  for (const id of ["edit-bpm", "edit-first"])
    timing.querySelector(".timing-fields")!.append(el(id).closest("label")!);
  for (const id of ["reflow", "estimate-tempo", "tap-tempo", "tap-result"])
    timing.querySelector(".timing-actions")!.append(el(id));
  metaPane.append(metadata, timing);
  score.id = "editor-score";
  editor.append(metaPane, lyricPane);
  const tabs = document.createElement("div");
  tabs.className = "editor-tabs";
  tabs.innerHTML =
    '<button data-pane="score">' +
    i18nText("workspace.message569") +
    '</button><button data-pane="lyrics">' +
    i18nText("main.message279") +
    '</button><button data-pane="meta">' +
    i18nText("workspace.message570") +
    "</button>";
  editor.querySelector(".dialoghead")!.after(tabs);
  tabs
    .querySelectorAll<HTMLButtonElement>("button")
    .forEach((b) => (b.onclick = () => selectEditorPane(b.dataset.pane!)));
  lyricPane.insertAdjacentHTML(
    "beforeend",
    '<div class="pager"><button id="lyrics-prev">' +
      i18nText("workspace.message572") +
      '</button><span id="lyrics-page"></span><button id="lyrics-next">' +
      i18nText("workspace.message573") +
      "</button></div>",
  );
  const scrollBody = document.createElement("div");
  scrollBody.className = "editor-body";
  scrollBody.append(score, lyricPane, metaPane);
  editor.append(scrollBody);
  selectEditorPane("score");
}
const editorScroll = new Map<string, number>();
let currentEditorPane = "meta";
export function selectEditorPane(name: string) {
  const scroller = document.querySelector<HTMLElement>(
    "#editor-dialog .editor-body",
  );
  if (scroller) editorScroll.set(currentEditorPane, scroller.scrollTop);
  currentEditorPane = name;
  const editor = document.getElementById("editor-dialog");
  if (editor) editor.dataset.activePane = name;
  for (const id of ["score", "lyrics", "meta", "files", "sections"]) {
    if (!document.getElementById(`editor-${id}`)) continue;
    document.getElementById(`editor-${id}`)!.hidden = id !== name;
    const b = document.querySelector(`[data-pane="${id}"]`)!;
    b.classList.toggle("primary", id === name);
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", String(id === name));
    b.setAttribute("aria-controls", `editor-${id}`);
    b.setAttribute("aria-pressed", String(id === name));
    document.getElementById(`editor-${id}`)!.setAttribute("role", "tabpanel");
  }
  if (scroller) scroller.scrollTop = editorScroll.get(name) || 0;
}

const listPages = new Map<string, { page: number; count: number }>();
export function paginateList(id: string) {
  const list = document.getElementById(id)!;
  const items = [...list.children] as HTMLElement[];
  let state = listPages.get(id) || { page: 0, count: items.length };
  const pages = Math.max(1, Math.ceil(items.length / 6));
  if (items.length > state.count) state.page = pages - 1;
  state = { page: Math.min(state.page, pages - 1), count: items.length };
  listPages.set(id, state);
  let pager = document.getElementById(`${id}-pager`);
  if (!pager) {
    pager = document.createElement("div");
    pager.id = `${id}-pager`;
    pager.className = "pager";
    list.after(pager);
  }
  const render = () => {
    items.forEach(
      (item, i) => (item.hidden = Math.floor(i / 6) !== state.page),
    );
    pager!.hidden = pages === 1;
    pager!.innerHTML =
      "<button " +
      String(state.page === 0 ? "disabled" : "") +
      " data-prev>" +
      i18nText("workspace.message572") +
      "</button><span>" +
      String(state.page + 1) +
      " / " +
      String(pages) +
      "</span><button " +
      String(state.page === pages - 1 ? "disabled" : "") +
      " data-next>" +
      i18nText("workspace.message573") +
      "</button>";
    (pager!.querySelector("[data-prev]") as HTMLButtonElement).onclick = () => {
      state.page--;
      render();
    };
    (pager!.querySelector("[data-next]") as HTMLButtonElement).onclick = () => {
      state.page++;
      render();
    };
  };
  render();
}
