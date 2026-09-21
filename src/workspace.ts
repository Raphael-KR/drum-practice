import { t as i18nText, formatDate, formatTime } from "./i18n";
import { componentName } from "./ui-standard";
import { installScreenControls } from "./fullscreen";
import { isPortable } from "./portable";
import { licenseSection } from "./licenses";
import buildInfo from "./build-info.generated.json";
import packageInfo from "../package.json";
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
  for (const panel of document.querySelectorAll<HTMLElement>(
    "[data-settings-panel]",
  ))
    panel.hidden = panel.dataset.settingsPanel !== category;
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-settings-category]",
  )) {
    const active = button.dataset.settingsCategory === category;
    button.classList.toggle("primary", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  }
  const heading = document.getElementById("settings-detail-heading")!;
  heading.textContent =
    category === "info"
      ? i18nText("main.message097")
      : settingsTitles[category];
  heading.hidden = category !== "info";
}
export function openSettings(
  category: SettingsCategory = rememberedCategory(),
) {
  selectSettingsCategory(category);
  (document.getElementById("settings-dialog") as HTMLDialogElement).showModal();
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
  document.querySelector(".brand")!.innerHTML =
    '<h1 id="song-title">' +
    i18nText("main.message097") +
    '</h1><button id="original-tempo" type="button" hidden disabled title="' +
    i18nText("main.message211") +
    '" aria-label="' +
    i18nText("main.message211") +
    '" aria-haspopup="dialog"><svg class="tempo-note" viewBox="0 0 18 32" aria-hidden="true"><ellipse cx="6.5" cy="26" rx="6" ry="4" transform="rotate(-22 6.5 26)" fill="currentColor"/><path d="M11.5 25V2" stroke="currentColor" stroke-width="2"/></svg><span id="original-tempo-value"></span></button>';

  const panel = (id: string, title: string, host: Element, caption = title) => {
    const d = document.createElement("dialog");
    d.id = id;
    d.className = "tool-dialog";
    d.setAttribute("aria-label", title);
    d.innerHTML =
      '<div class="dialoghead"><h2>' +
      String(title) +
      '</h2><button data-close="' +
      String(id) +
      '">' +
      i18nText("editor-session.message042") +
      '</button></div><div class="tool-body"></div>';
    el("app").append(d);
    const b = document.createElement("button");
    b.textContent = caption;
    b.id = `open-${id}`;
    b.setAttribute("aria-haspopup", "dialog");
    b.onclick = () => d.showModal();
    host.append(b);
    return d.querySelector(".tool-body")!;
  };
  const loops = el("loops").closest(".panel")!;
  const markers = el("markers").closest(".panel")!;
  const backup = markers.querySelector("details")!;
  backup.querySelector("summary")!.remove();
  const sound = practice.querySelector("details")!;
  sound.querySelector("summary")!.remove();
  const transport = practice.querySelector(".transport")!;
  const transportRight = transport.querySelector(".transport-right")!;
  const metronome = el("click").closest("label")!;
  const actions = document.querySelector("header .actions")!;
  actions.prepend(metronome);
  const oldGoto = el("goto");
  const rewind = document.createElement("input");
  rewind.id = "goto";
  rewind.type = "number";
  rewind.min = "1";
  rewind.max = "10";
  rewind.step = "1";
  rewind.value = "1";
  rewind.setAttribute("aria-label", i18nText("main.message118"));
  rewind.title = i18nText("workspace.message542");
  oldGoto.replaceWith(rewind);

  const tempo = el("tempo-dialog");
  const tempoControl = document.createElement("label");
  tempoControl.className = "tempo-number";
  const rate = el("rate");
  rate.setAttribute("aria-label", i18nText("main.message208"));
  rate.title = i18nText("workspace.message543");
  tempoControl.append(rate);
  tempoControl.insertAdjacentHTML(
    "beforeend",
    "<span>" + i18nText("term.BPM") + "</span>",
  );
  el("tempo-options").before(tempoControl);
  tempo.querySelector("p")!.textContent = i18nText("workspace.message544");
  tempo.insertAdjacentHTML(
    "beforeend",
    '<button id="tempo-reset">' +
      i18nText("workspace.message545") +
      "</button>",
  );
  el("tempo-presets").remove();
  el("slower").remove();
  el("faster").remove();
  transportRight.insertAdjacentHTML(
    "afterbegin",
    '<label class="progress-number" title="' +
      i18nText("workspace.message546") +
      '"><input id="progress-percent" type="text" inputmode="none" readonly role="slider" min="0" max="100" step="1" value="0" aria-label="' +
      i18nText("workspace.message547") +
      '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span aria-hidden="true">%</span></label>',
  );
  panel("marker-dialog", i18nText("icons.message069"), transportRight).append(
    markers,
  );
  const soundBody = panel(
    "sound-dialog",
    i18nText("icons.message070"),
    transportRight,
    i18nText("icons.message070"),
  );
  soundBody.append(...sound.children);
  sound.remove();
  el("click-volume").closest("label")!.childNodes[0].textContent = i18nText(
    "workspace.message548",
  );

  const repeat = document.createElement("section");
  repeat.id = "repeat-controls";
  repeat.setAttribute("aria-label", i18nText("workspace.message549"));
  repeat.innerHTML =
    '<span class="repeat-heading">' +
    i18nText("portable-player.message449") +
    '</span><div class="repeat-presets">' +
    [1, 2, 3, 4]
      .map(
        (radius) =>
          '<button type="button" data-loop-radius="' +
          String(radius) +
          '" aria-pressed="false">' +
          i18nText("workspace.message550", { radius: radius }) +
          "</button>",
      )
      .join("") +
    ('</div><output id="loop-summary" aria-live="polite">' +
      i18nText("main.message270") +
      '</output><button id="recenter-loop" title="' +
      i18nText("workspace.message551") +
      '">' +
      i18nText("portable-player.message450") +
      '</button><button id="quick-stop-loop">' +
      i18nText("portable-player.message451") +
      "</button>");
  transport.after(repeat);
  panel(
    "loop-dialog",
    i18nText("icons.message067"),
    repeat,
    i18nText("icons.message068"),
  ).append(loops);
  loops.querySelector("h2")!.remove();
  markers.querySelector("h2")!.remove();
  const loopHelp = loops.querySelector("p")!;
  loopHelp.id = "loop-range-help";
  loopHelp.textContent = i18nText("workspace.message552");
  loops.insertAdjacentHTML(
    "afterbegin",
    '<p class="subtle">' + i18nText("workspace.message553") + "</p>",
  );
  const precise = document.createElement("div");
  precise.className = "loop-precision";
  precise.innerHTML =
    '<label><input id="loop-precise" type="checkbox">' +
    i18nText("workspace.message554") +
    '</label><div id="loop-beat-controls" class="flex" hidden></div>';
  loopHelp.before(precise);
  for (const [id, title] of [
    ["loop-ab", i18nText("workspace.message555")],
    ["loop-bb", i18nText("workspace.message556")],
  ]) {
    const label = el(id).closest("label")!;
    label.childNodes[0].textContent = title + " ";
    precise.lastElementChild!.append(label);
  }

  el("set-a").textContent = i18nText("workspace.message557");
  el("set-b").textContent = i18nText("workspace.message558");
  el("save-loop").before(
    Object.assign(document.createElement("button"), {
      id: "apply-loop",
      className: "primary",
      textContent: i18nText("workspace.message559"),
    }),
  );
  el("save-loop").textContent = i18nText("workspace.message560");

  const repeatActions = document.createElement("div");
  repeatActions.className = "repeat-actions";
  repeatActions.append(...repeat.childNodes);
  repeatActions.prepend(repeatActions.querySelector("#open-loop-dialog")!);
  repeat.append(repeatActions);
  const slots = document.createElement("div");
  slots.id = "quick-markers";
  slots.className = "marker-slots";
  slots.setAttribute("role", "group");
  slots.setAttribute("aria-label", i18nText("portable-player.message452"));
  repeat.append(slots);
  // The progress percentage still opens full marker management.
  markers.insertAdjacentHTML(
    "beforeend",
    '<span id="active-loop" hidden></span><button id="quick-add-marker" hidden></button>',
  );

  const settings = document.createElement("dialog");
  settings.id = "settings-dialog";
  settings.setAttribute("aria-labelledby", "settings-heading");
  settings.innerHTML =
    '<div class="dialoghead"><h2 id="settings-heading">' +
    i18nText("icons.message059") +
    '</h2><button data-close="settings-dialog">' +
    i18nText("editor-session.message042") +
    '</button></div><div class="settings-layout"><nav class="settings-nav" aria-label="' +
    i18nText("workspace.message561") +
    '"></nav><div class="settings-detail"><h3 id="settings-detail-heading">' +
    i18nText("icons.message071") +
    "</h3></div></div>";
  el("app").append(settings);
  // Require both ends of the gesture outside; dragging a slider out must not dismiss.
  let outsideStart = false;
  const outside = (e: MouseEvent) => {
    const r = settings.getBoundingClientRect();
    return (
      e.target === settings &&
      (e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom)
    );
  };
  settings.addEventListener("pointerdown", (e) => {
    outsideStart = outside(e);
  });
  settings.addEventListener("click", (e) => {
    if (outsideStart && outside(e)) {
      e.preventDefault();
      e.stopPropagation();
      settings.close();
    }
    outsideStart = false;
  });
  const gear = document.createElement("button");
  gear.id = "open-settings-dialog";
  gear.textContent = i18nText("icons.message059");
  gear.setAttribute("aria-haspopup", "dialog");
  gear.onclick = () => openSettings();
  actions.append(gear);
  installScreenControls(gear, (message) => {
    el("fullscreen-status").textContent = message;
  });
  const settingsPanel = (
    category: SettingsCategory,
    id: string,
    buttonId: string,
  ) => {
    const section = document.createElement("section");
    section.id = id;
    section.className = "tool-body settings-panel";
    section.dataset.settingsPanel = category;
    section.setAttribute("aria-label", settingsTitles[category]);
    settings.querySelector(".settings-detail")!.append(section);
    const button = document.createElement("button");
    button.id = buttonId;
    button.dataset.settingsCategory = category;
    button.textContent = settingsTitles[category];
    button.onclick = () => selectSettingsCategory(category);
    settings.querySelector(".settings-nav")!.append(button);
    return section;
  };
  const screenBody = settingsPanel(
    "screen",
    "screen-dialog",
    "open-screen-dialog",
  );
  const viewRow = document.createElement("label");
  viewRow.className = "view-select-row";
  viewRow.innerHTML =
    '<strong class="settings-item-title">' +
    i18nText("main.message108") +
    "</strong>";
  el("view").hidden = false;
  const viewControl = document.createElement("span");
  viewControl.className = "view-select-control";
  viewControl.innerHTML =
    '<span id="view-selected-text" aria-hidden="true"></span>';
  viewControl.append(el("view"));
  viewRow.append(viewControl);
  screenBody.append(viewRow);
  el("view").addEventListener("change", updateViewWidth);
  updateViewWidth();
  screenBody.insertAdjacentHTML(
    "beforeend",
    '<p id="view-description" class="subtle"></p><label id="pdf-view-row" class="settings-switch"><span><strong>' +
      i18nText("portable-player.message438") +
      '</strong><small id="pdf-view-status">' +
      i18nText("main.message227") +
      '</small></span><input id="prefer-pdf" type="checkbox" role="switch" disabled></label>',
  );
  const viewSetting = document.createElement("div");
  viewSetting.className = "settings-control-description";
  viewRow.before(viewSetting);
  viewSetting.append(viewRow, el("view-description"));
  const reviewHelp = document.createElement("div");
  reviewHelp.id = "review-help";
  reviewHelp.innerHTML =
    '<p id="review-availability"></p><button id="review-add-score">' +
    i18nText("main.message346") +
    "</button>";
  const zoomLabel = el("zoom").closest("label")!;
  const zoomTitle = document.createElement("strong");
  zoomTitle.className = "settings-item-title";
  zoomTitle.textContent = i18nText("portable-player.message455");
  zoomLabel.childNodes[0].replaceWith(zoomTitle);
  screenBody.append(reviewHelp, zoomLabel);
  screenBody.insertAdjacentHTML(
    "beforeend",
    '<label class="settings-switch"><span><strong>' +
      i18nText("portable-player.message439") +
      '</strong><small id="note-highlight-description">' +
      i18nText("main.message255") +
      '</small></span><input id="note-highlight" type="checkbox" role="switch" checked></label>',
  );
  screenBody.insertAdjacentHTML(
    "beforeend",
    '<div class="settings-group"><label class="settings-switch"><span><strong>' +
      i18nText("portable-player.message441") +
      "</strong><small>" +
      i18nText("workspace.message562") +
      '</small></span><input id="auto-fullscreen" type="checkbox"></label><p id="fullscreen-status" class="subtle" role="status"></p></div>',
  );
  el("auto-fullscreen").closest(".settings-group")!.prepend(el("pdf-view-row"));
  el("auto-fullscreen")
    .closest("label")!
    .querySelector("span")!
    .append(el("fullscreen-status"));
  const playback = settingsPanel(
    "playback",
    "playback-settings",
    "open-playback-settings",
  );
  playback.innerHTML =
    '<label class="settings-switch"><span><strong>' +
    i18nText("portable-player.message442") +
    "</strong><small>" +
    i18nText("portable-player.message443") +
    '</small></span><input id="restart-measure" type="checkbox" role="switch"></label><label class="settings-switch"><span><strong>' +
    i18nText("portable-player.message444") +
    "</strong><small>" +
    i18nText("portable-player.message445") +
    '</small></span><input id="count-off" type="checkbox" role="switch"></label><p id="playback-settings-status" class="subtle" role="status"></p>';
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
  info.innerHTML =
    '<section class="settings-group app-info"><dl><dt>' +
    i18nText("portable-player.message456") +
    '</dt><dd id="app-version"></dd><dt>' +
    i18nText("portable-player.message457") +
    '</dt><dd id="app-built-at"></dd></dl></section>';
  el("app-version").textContent =
    `${packageInfo.version} (${buildInfo.source})`;
  el("app-built-at").textContent =
    formatDate(new Date(buildInfo.builtAt), {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }) + " KST";
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
  practice.insertAdjacentHTML(
    "beforeend",
    '<p id="score-gesture-hint" class="subtle">' +
      i18nText("workspace.message567") +
      "</p>",
  );
  el("stage").setAttribute("aria-describedby", "score-gesture-hint");

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
  const scroller = document.querySelector<HTMLElement>("#editor-dialog .editor-body");
  if (scroller) editorScroll.set(currentEditorPane, scroller.scrollTop);
  currentEditorPane = name;
  const editor = document.getElementById("editor-dialog");
  if (editor) editor.dataset.activePane = name;
  for (const id of ["score", "lyrics", "meta", "files"]) {
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
