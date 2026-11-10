import { installOriginalScoreView } from "./editor-original-view";
import { installEditorSections } from "./editor-sections";
import { createEditorManagementActions } from "./editor-management-actions";
import {
  readEditorRecord,
  prepareEditorScore,
} from "./editor-record-preparation";
import { installEditorImport } from "./editor-import";
import { installEditorScoreFiles } from "./editor-score-files";
import { installEditorPackages } from "./editor-file-transfer";
import { type EditSnapshot, type EditorForm } from "../../model/edit-history";
import type { RecordData } from "../../model/record";
import "../../modules/help/help.css";
import {
  preferPDF,
  savePreferPDF,
  scorePreference,
} from "../../modules/library/score-preference";
import { isPhoneLandscape } from "../../platform/browser/phone-layout";
import type { RibbonAsset } from "../../modules/playback/playback-assets";
import {
  preparePlaybackAssets,
  releasePlaybackAssets,
  replacePlaybackAssets,
} from "../../modules/playback/playback-assets";
import { syncSettingsChoices } from "../../modules/playback/playback-settings";
import {
  readPlaybackPreferences,
  savePlaybackPreferences,
} from "../../modules/playback/playback-preferences";
import { createPlaybackScreen } from "../../modules/playback/playback-screen";
import { webPlaybackBindings } from "../../modules/playback/playback-ui";
import "../../modules/playback/playback-ui.css";
import { attachPracticeManagement } from "../../modules/playback/practice-management";
import { readSectionShortcuts } from "../../modules/playback/section-shortcuts";
import {
  ensureCanonical,
  saveCanonical,
} from "../../modules/score/canonical-xml";
import { type HighlightPage } from "../../modules/score/note-highlight";
import {
  readNoteHighlight,
  saveNoteHighlight,
} from "../../modules/score/note-highlight-preference";
import { type StaffPosition } from "../../modules/score/practice-staff-layout";
import { songScores, useScore } from "../../modules/score/song-scores";
import {
  autoFullscreenEnabled,
  enterFullscreen,
  saveAutoFullscreen,
} from "../../platform/browser/fullscreen";
import { saveRecord } from "../../platform/storage/storage";
import { formatTime, t as i18nText } from "../../shared/i18n/i18n";
import "../../shared/styles/controls.css";
import { arrangeIcons } from "../../shared/ui/icons";
import { Player } from "./audio";
import { $, val } from "./editor-dom";
import { createEditorForm, editorFields } from "./editor-form";
import { createEditorLibrary } from "./editor-library";
import { createLyricEditor } from "./editor-lyrics";
import { createEditorReview } from "./editor-review";
import { createScoreEditor } from "./editor-score-controls";
import { editorSession } from "./editor-session";
import { editorHTML } from "./editor-view";
import { setupScoreManagement } from "./score-management";
import { reviewPair } from "./score-review";
import "./style.css";
import "../../modules/library/player-library.css";
import { arrangeWorkspace, selectSettingsCategory } from "./workspace";
const renderPDF: typeof import("../../modules/score/pdf").renderPDF = async (
  ...args
) => (await import("../../modules/score/pdf")).renderPDF(...args);
const xmlModule = () => import("../../modules/score/musicxml");
async function renderScore(
  blob: Blob,
  format: Song["scoreFormat"],
  partId?: string,
): Promise<{
  pages: Blob[];
  regions: Region[];
  parsed?: import("../../modules/score/musicxml").XMLScore;
}> {
  return format === "musicxml"
    ? (await xmlModule()).renderMusicXML(blob, status, partId)
    : renderPDF(blob, status);
}

import { clamp, locate, type Region, type Song } from "../../model/model";
let player: Player | undefined,
  record: RecordData | undefined,
  urls: string[] = [];

let selected = 0;
let saveTimer = 0,
  busy = false;

const pageRatios: number[] = [];
const practiceStaffs = new Map<string, StaffPosition>();
const ribbonAssets = new Map<number, RibbonAsset>();
const highlightPages: (HighlightPage | undefined)[] = [];
let noteHighlightEnabled = readNoteHighlight();

const app = $("app");
app.innerHTML = editorHTML();
arrangeWorkspace();
arrangeIcons();
$("song-title").textContent = i18nText("separation.editorTitle");
document.title = i18nText("separation.editorTitle");
const playback = createPlaybackScreen({
  root: app,
  environment: "web",
  preferences: {
    restartId: "restart-measure",
    countoffId: "count-off",
    read: readPlaybackPreferences,
    write: (value) => {
      const saved = savePlaybackPreferences(value);
      $("playback-settings-status").textContent = i18nText(
        saved ? "main.message256" : "main.message257",
      );
    },
  },
  display: {
    setPhoneLandscape: (active) =>
      changeScoreFormat(active ? false : preferPDF()),
    highlightId: "note-highlight",
    fullscreenId: "auto-fullscreen",
    fullscreen: autoFullscreenEnabled,
    setFullscreen: saveAutoFullscreen,
    setHighlight: (value) => {
      noteHighlightEnabled = value;
      saveNoteHighlight(value);
    },
    report: (message) => {
      $("fullscreen-status").textContent = message;
    },
  },
  afterFrame: updateEditorPlayback,
  ids: {
    ...webPlaybackBindings,
    rewindButton: "jump",
    radiusAttribute: "data-loop-radius",
    settings: "open-settings-dialog",
  },
  canonicalXML: () => record?.canonicalXML,
  song,
  player: engine,
  ready: () => !!record,
  busy: () => busy,
  setBusy: (value) => {
    busy = value;
  },
  assets: () => ({
    urls,
    ratios: pageRatios,
    staffs: practiceStaffs,
    highlights: highlightPages,
    ribbon: ribbonAssets,
  }),
  highlight: () => noteHighlightEnabled,
  formats: () => (record ? songScores(record).map((s) => s.format) : []),
  fail: error,
  changed: queueSave,
  pauseOverride: () => {
    if (song().settings.view !== "compare") return false;
    reviewController.capture();
    return true;
  },
  compare: {
    render: () => {
      $("review-tools").hidden = $("review-canvas").hidden = false;
      void prepareReview();
    },
    draw: (time) => reviewController.draw(time),
    target: (e) => {
      const bounds = $("stage").getBoundingClientRect();
      const column = Math.floor(
        clamp(
          (e.clientX - bounds.left - 12) / Math.max(1, bounds.width - 24),
          0,
          0.9999,
        ) * 4,
      );
      return Math.min(
        song().measures.length - 1,
        Math.floor(locate(song(), engine().current()).index / 4) * 4 + column,
      );
    },
  },
  trackChanged: () => {
    if (song().settings.view !== "compare") {
      $("review-tools").hidden = $("review-canvas").hidden = true;
      reviewController.dispose();
    }
  },
  listsChanged: () => practiceManagement?.render(),
  validateView: (view) => {
    if (view === "compare") {
      reviewPair(record!);
      if (song().settings.view !== "compare") engine().pause();
    }
  },
  settingsChanged: syncViewChoices,
  settingsSelected: selectSettingsCategory,
});
function songControlsAvailable(enabled: boolean) {
  $("click").hidden = !enabled;
  for (const id of [
    "click",
    "zoom",
    "original-button",
    "review-add-score",
    "file-xml",
    "file-export",
  ]) {
    const control = document.getElementById(id) as HTMLButtonElement | null;
    if (control) control.disabled = !enabled;
  }
  syncViewChoices();
}
songControlsAvailable(false);
function updateSongHeading() {
  playback.sync();
  document.title = $("song-title").textContent!;
  management?.refresh();
}
function tell(s: string) {
  status(s);
}
$("error-notice").onclick = () => {
  $("error-notice").hidden = true;
};
for (const dialog of document.querySelectorAll("dialog")) {
  dialog.addEventListener("close", () => {
    const notice = $("error-notice");
    if (dialog.contains(notice)) {
      ($("practice").hidden
        ? document.querySelector("main")!
        : document.querySelector(".statusline")!
      ).append(notice);
    }
  });
}

const workLog: { message: string; time: string }[] = [];
function status(s: string) {
  if (!s || workLog[0]?.message === s) return;
  workLog.unshift({
    message: s,
    time: formatTime(new Date(), { hour12: false }),
  });
  workLog.length = Math.min(workLog.length, 5);
  $("busy").textContent = workLog
    .map((entry) => `${entry.time}  ${entry.message}`)
    .join("\n");
}
function error(e: unknown) {
  console.error(e);
  const message = e instanceof Error ? e.message : String(e);
  status(i18nText("main.message212", { message: message }));
  const notice = $("error-notice");
  const host =
    document.querySelector<HTMLDialogElement>("dialog[open] .dialoghead") ||
    ($("practice").hidden
      ? document.querySelector("main")!
      : document.querySelector(".statusline")!);
  host.append(notice);
  $("error-message").textContent = message;
  notice.setAttribute(
    "aria-label",
    i18nText("main.message213", { message: message }),
  );
  notice.title = i18nText("main.message214", { message: message });
  notice.hidden = false;
}
function action(id: string, f: () => unknown) {
  $(id).addEventListener("click", () => {
    try {
      Promise.resolve(f()).catch(error);
    } catch (e) {
      error(e);
    }
  });
}
function engine() {
  if (!player) {
    player = new Player(readPlaybackPreferences);
    player.onprogress = status;
    player.onerror = status;
    player.onstate = () => playback.onState();
  }
  return player;
}
async function persist() {
  if (!record) return;
  await ensureCanonical(record);
  saveCanonical(record);
  await saveRecord(preferredRecordForStorage(session?.forStorage() || record));
  management?.refresh();
  status(i18nText("main.message216"));
}
function preferredRecordForStorage(value: RecordData) {
  if (value.song.audioPractice) return value;
  const format = scorePreference(value).format;
  if (value.song.scoreFormat === format) return value;
  return useScore(
    value,
    songScores(value).find((score) => score.format === format)!,
  );
}
function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(
    () =>
      persist().catch((e) => {
        status(i18nText("main.message217"));
        error(e);
      }),
    400,
  );
}
function song() {
  if (!record) throw Error(i18nText("main.message218"));
  return record.song;
}
// Activation owns the ordered save, media swap and visible-screen transition.
async function activate(r: RecordData) {
  scoreGestures.cancel();
  if (autoFullscreenEnabled() && !document.fullscreenElement)
    requestScoreFullscreen();
  playback.reset();
  await readEditorRecord(r);
  busy = true;
  try {
    r = await prepareEditorScore(r, status, renderScore);
    engine().pause();
    clearTimeout(saveTimer);
    if (record)
      await saveRecord(
        preferredRecordForStorage(session?.forStorage() || record),
      );
    session?.reset();
    record = r;

    // Materialize persisted blobs before image decoding; Safari may not load
    // an object URL backed directly by an IndexedDB blob after a reload.
    const prepared = await preparePlaybackAssets(r.pages, r.song, {
      decodeError: (cause, index) =>
        new Error(
          i18nText("main.message221", {
            value1: index + 1,
            value2: cause instanceof Error ? cause.message : String(cause),
          }),
          { cause },
        ),
    });
    replacePlaybackAssets(
      {
        urls,
        pageRatios,
        highlightPages,
        practiceStaffs,
        ribbon: ribbonAssets,
      },
      prepared,
    );
    try {
      await engine().load(r.audio, r.song);
    } catch (cause) {
      throw new Error(
        i18nText("main.message222", {
          value1: cause instanceof Error ? cause.message : String(cause),
        }),
        { cause },
      );
    }
    // Switch layout and visible screen together after asynchronous media loading.
    $("welcome").hidden = true;
    document.body.classList.add("has-song");
    $("practice").hidden = false;
    songControlsAvailable(true);
    updateSongHeading();
    syncSettings();
    renderTrack();
    renderLists();
    await persist();
    status("");
  } finally {
    busy = false;
    if (record) {
      renderLists();
      playback.syncDisplay();
    }
  }
}
function syncViewChoices() {
  syncNoteHighlightControl();
  const view = record ? song().settings.view : val("view").value;
  if (!record) {
    $("review-help").hidden = true;
    $("review-add-score").hidden = true;
    $("review-availability").textContent = "";
    ($("view") as HTMLSelectElement).querySelector<HTMLOptionElement>(
      'option[value="compare"]',
    )!.disabled = true;
    $("pdf-view-row").hidden = false;
    val("prefer-pdf").checked = preferPDF();
    val("prefer-pdf").disabled = true;
    $("pdf-view-status").textContent = i18nText("main.message227");
    val("zoom").closest("label")!.hidden = view !== "ribbon";
    syncSettingsChoices(document);
    return;
  }
  const formats = songScores(record).map((s) => s.format);
  const missing = ["pdf", "musicxml"].filter(
    (f) => !formats.includes(f as "pdf" | "musicxml"),
  );
  const compare = song().settings.view === "compare";
  ($("view") as HTMLSelectElement).querySelector<HTMLOptionElement>(
    'option[value="compare"]',
  )!.disabled = missing.length > 0;
  const preference = scorePreference(
    record,
    isPhoneLandscape() ? false : preferPDF(),
  );
  val("prefer-pdf").checked = preference.checked;
  val("prefer-pdf").disabled = preference.disabled;
  $("pdf-view-status").textContent = preference.message;
  $("pdf-view-row").hidden = compare;
  syncSettingsChoices(document);
  $("review-help").hidden = !compare;

  $("review-availability").textContent = missing.length
    ? i18nText("main.message230", {
        value1: missing
          .map((f) =>
            f === "pdf" ? i18nText("term.PDF") : i18nText("term.MusicXML"),
          )
          .join(i18nText("main.message228")),
        value2: formats
          .map((f) =>
            f === "pdf" ? i18nText("term.PDF") : i18nText("term.MusicXML"),
          )
          .join(", "),
        value3: "",
      })
    : "";
  $("review-add-score").hidden = !missing.length;
}
// Prepare geometry before swapping it, leaving audio and loop scheduling intact.
async function changeScoreFormat(wanted: boolean, persistPreference = false) {
  if (!record || busy) {
    if (record) syncViewChoices();
    return;
  }
  const original = record;
  if (original.song.scoreFormat === (wanted ? "pdf" : "musicxml")) return;
  if (scorePreference(original).disabled) {
    syncViewChoices();
    return;
  }
  busy = true;
  val("prefer-pdf").disabled = true;
  let prepared: Awaited<ReturnType<typeof preparePlaybackAssets>> | undefined;
  try {
    const target = songScores(original).find(
      (s) => s.format === (wanted ? "pdf" : "musicxml"),
    )!;
    const next = useScore(original, target);
    prepared = await preparePlaybackAssets(next.pages, next.song);
    if (record !== original) throw Error(i18nText("main.message231"));
    // Settings may have changed while the images decoded; retain the latest values.
    next.song.settings = original.song.settings;
    replacePlaybackAssets(
      {
        urls,
        pageRatios,
        highlightPages,
        practiceStaffs,
        ribbon: ribbonAssets,
      },
      prepared,
    );
    prepared = undefined;
    record = next;
    engine().song = next.song;
    if (persistPreference) savePreferPDF(wanted);
    renderTrack();
    if (persistPreference) queueSave();
  } catch (e) {
    if (prepared) releasePlaybackAssets(prepared);
    error(e);
  } finally {
    busy = false;
    syncViewChoices();
  }
}
val("prefer-pdf").onchange = () => {
  void changeScoreFormat(val("prefer-pdf").checked, true);
};
function syncSettings() {
  playback.sync();
  management?.refresh();
}
const reviewController = createEditorReview({
  record: () => record,
  song,
  engine,
  renderScore,
  action,
  error,
});
const prepareReview = () => reviewController.prepare();
function renderTrack() {
  playback.renderTrack();
}
function updateEditorPlayback(t: number) {
  const editorTime = $("editor-time"),
    label = i18nText("main.message247", {
      value1: t.toFixed(2),
    });
  if (editorTime.textContent !== label) editorTime.textContent = label;
}
const toggle = () => playback.toggle();

function syncNoteHighlightControl() {
  playback.syncDisplay();
}
syncNoteHighlightControl();
const scoreGestures = {
  cancel: () => playback.cancel(),
  dispose: () => playback.dispose(),
};
if (import.meta.hot) import.meta.hot.dispose(() => playback.dispose());

let fullscreenRequest: Promise<boolean> | undefined;
const fullscreenReport = (message: string) => {
  $("fullscreen-status").textContent = message;
};
function requestScoreFullscreen() {
  if (
    !autoFullscreenEnabled() ||
    document.fullscreenElement ||
    fullscreenRequest
  )
    return;
  fullscreenRequest = enterFullscreen(fullscreenReport);
  void fullscreenRequest.finally(() => {
    fullscreenRequest = undefined;
  });
}
// Request before asynchronous file/IndexedDB work consumes transient activation.
document.addEventListener(
  "click",
  (e) => {
    if ((e.target as Element).closest("#editor-home-list [data-editor-open]"))
      requestScoreFullscreen();
  },
  true,
);
document.addEventListener(
  "submit",
  (e) => {
    if ((e.target as HTMLElement).id === "new-form") requestScoreFullscreen();
  },
  true,
);

const practiceManagement: ReturnType<typeof attachPracticeManagement> =
  attachPracticeManagement({
    canonicalXML: () => record?.canonicalXML,
    root: $("app"),
    song,
    playback: () => playback,
    player: engine,
    fail: error,
  });
function renderLists() {
  playback.renderLists();
}
for (const b of document.querySelectorAll<HTMLElement>("[data-close]"))
  if (
    ![
      "settings-dialog",
      "tempo-dialog",
      "loop-dialog",
      "marker-dialog",
    ].includes(b.dataset.close!)
  )
    b.onclick = () => $<HTMLDialogElement>(b.dataset.close!).close();
async function showEditorHome() {
  engine().pause();
  clearTimeout(saveTimer);
  await persist();
  scoreGestures.cancel();
  playback.reset();
  session?.reset();
  record = undefined;
  releasePlaybackAssets({ urls, ribbon: ribbonAssets });
  ribbonAssets.clear();
  urls = [];
  for (const dialog of document.querySelectorAll<HTMLDialogElement>(
    "dialog[open]",
  ))
    dialog.close();
  $("practice").hidden = true;
  $("welcome").hidden = false;
  $("song-title").textContent = i18nText("separation.editorTitle");
  document.title = i18nText("separation.editorTitle");
  $("original-tempo").hidden = true;
  document.body.classList.remove("has-song");
  songControlsAvailable(false);
  management?.refresh();
  status("");
}
const editorLibrary = createEditorLibrary({
  showHome: showEditorHome,
  activate,
  openEditor,
  error,
  tell,
  action,
});
const openLibrary = () => editorLibrary.open();
const refreshCatalog = () => editorLibrary.refreshCatalog();
function openNew() {
  engine().pause();
  $<HTMLDialogElement>("new-dialog").showModal();
}
action("welcome-new", openNew);
installEditorImport({
  get busy() {
    return busy;
  },
  set busy(value) {
    busy = value;
  },
  status,
  tell,
  error,
  activate,
  openEditor,
  renderScore,
});
document.addEventListener("open-score-editor", () => {
  if (!$<HTMLDialogElement>("editor-dialog").open)
    void openEditor().catch(error);
});
const scoreEditor = createScoreEditor({
  cancelGestures: () => scoreGestures.cancel(),
  get selected() {
    return selected;
  },
  set selected(value) {
    selected = value;
  },
  get record() {
    return record;
  },
  get urls() {
    return urls;
  },
  get session() {
    return session;
  },
  song,
  engine,
  renderLyricEditor,
  renderCurrentLyrics: () => renderLyricEditor(lyricEditor.near),
  flushEditorForm: () => flushEditorForm(),
  renderTrack,
  renderLists,
  queueSave,
  updateSongHeading,
  action,
  error,
  tell,
  toggle,
});
function openEditor() {
  return scoreEditor.openEditor();
}
function updateMeasureForm() {
  scoreEditor.updateMeasureForm();
}
function drawPage() {
  return scoreEditor.drawPage();
}
function edit(mut: (song: Song) => void) {
  scoreEditor.edit(mut);
}
const lyricEditor = createLyricEditor({
  song,
  selected: () => selected,
  edit,
  current: () => engine().current(),
  action,
  error,
});
function renderLyricEditor(near: boolean, keepPage = false) {
  lyricEditor.render(near, keepPage);
}
installOriginalScoreView({
  get record() {
    return record;
  },
  get selected() {
    return selected;
  },
  engine,
  song,
  action,
});
const fileTransfer = {
  get record() {
    return record;
  },
  action,
  persist,
  activate,
  tell,
  error,
  flushBeforeExport() {
    if (session?.active()) flushEditorForm();
  },
};
void refreshCatalog().catch(error);
window.addEventListener("focus", () => {
  if (!$("welcome").hidden) void refreshCatalog().catch(error);
});

const { openScoreReplacement } = installEditorScoreFiles({
  get record() {
    return record;
  },
  engine,
  edit,
  persist,
  activate,
  renderScore,
  renderLyricEditor,
  tell,
  error,
});

// Approved score-management workflow. The session preserves drafts independently
// from the confirmed record; input fields are included even before Apply.
const { editorForm, fillMetadata, pendingEditorValues, flushEditorForm } =
  createEditorForm({
    song,
    selected: () => selected,
    edit,
    renderLyricEditor,
    updateSongHeading,
  });
function applySnapshot(s: EditSnapshot) {
  if (!record) return;
  const sectionsChanged =
    JSON.stringify(readSectionShortcuts(record.canonicalXML ?? "")) !==
    JSON.stringify(readSectionShortcuts(s.canonicalXML ?? ""));
  record.song = structuredClone(s.song);
  record.canonicalXML = s.canonicalXML;
  if (sectionsChanged) void refreshSectionGeometry(record).catch(error);
  engine().song = record.song;
  engine().loop = undefined;
  selected = clamp(selected, 0, s.song.measures.length - 1);
  fillMetadata();
  updateMeasureForm();
  renderLyricEditor(lyricEditor.near);
  renderTrack();
  renderLists();
  updateSongHeading();
  void drawPage();
}
function restoreEditorForm(form: EditorForm) {
  selected = clamp(form.selected, 0, song().measures.length - 1);
  updateMeasureForm();
  renderLyricEditor(lyricEditor.near);
  for (const id of editorFields)
    if (form.fields[id] !== undefined) val(id).value = form.fields[id];
  document
    .querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      "#lyric-editor [data-field]",
    )
    .forEach((el) => {
      const key = `lyric:${el.closest<HTMLElement>("[data-lyric]")!.dataset.lyric}:${el.dataset.field}`,
        v = form.fields[key];
      if (v === undefined) return;
      if (el instanceof HTMLInputElement && el.type === "checkbox")
        el.checked = v === "true";
      else el.value = v;
    });
}
const session: ReturnType<typeof editorSession> = editorSession({
  get: () => record,
  pending: () => {
    const p = pendingEditorValues();
    return (
      p.metaChanged || p.measureChanged || p.tempoChanged || !!p.lyrics.length
    );
  },
  form: editorForm,
  restoreForm: restoreEditorForm,
  apply: applySnapshot,
  flush: flushEditorForm,
  persist,
  error,
});
const management: ReturnType<typeof setupScoreManagement> =
  setupScoreManagement(
    createEditorManagementActions({
      get record() {
        return record;
      },
      set record(value) {
        record = value;
      },
      song,
      persist,
      activate,
      openLibrary,
      tell,
      error,
      beforeRestore() {
        player?.pause();
        clearTimeout(saveTimer);
        session?.reset();
      },
    }),
    openScoreReplacement,
  );

installEditorPackages(fileTransfer);

const { refreshSectionGeometry } = installEditorSections({
  get record() {
    return record;
  },
  get busy() {
    return busy;
  },
  set busy(value) {
    busy = value;
  },
  get session() {
    return session;
  },
  assets: () => ({
    urls,
    pageRatios,
    highlightPages,
    practiceStaffs,
    ribbon: ribbonAssets,
  }),
  engine,
  status,
  flushEditorForm,
  renderTrack,
  renderLists,
  drawPage,
  queueSave,
});
