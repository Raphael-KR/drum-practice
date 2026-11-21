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
import type { RibbonAsset } from "../../modules/playback/playback-assets";
import {
  preparePlaybackAssets,
  releasePlaybackAssets,
  replacePlaybackAssets,
} from "../../modules/playback/playback-assets";
import { createPlaybackScreen } from "../../modules/playback/playback-screen";
import { webPlaybackBindings } from "../../modules/playback/playback-ui";
import "../../modules/playback/playback-ui.css";
import { type HighlightPage } from "../../modules/score/note-highlight";
import { type StaffPosition } from "../../modules/score/practice-staff-layout";
import { songScores } from "../../modules/score/song-scores";
import { formatTime, t as i18nText } from "../../shared/i18n/i18n";
import "../../shared/styles/controls.css";
import { showCopyableError } from "../../shared/ui/error-notice";
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
import { arrangeWorkspace } from "./workspace";
import { openProject, writeProject } from "./score-project-client";
import { installProjectWorkflow } from "./project-workflow";
import { installLyricStage } from "./lyric-stage";
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
  busy = false,
  loadingRecord = false;

const pageRatios: number[] = [];
const practiceStaffs = new Map<string, StaffPosition>();
const ribbonAssets = new Map<number, RibbonAsset>();
const highlightPages: (HighlightPage | undefined)[] = [];
const reviewPreferences = () => ({ restartMeasure: false, countOff: false });

const app = $("app");
app.innerHTML = editorHTML();
arrangeWorkspace();
$("song-title").textContent = i18nText("separation.editorTitle");
document.title = i18nText("separation.editorTitle");
const playback = createPlaybackScreen({
  root: app,
  environment: "web",
  authoring: true,
  preferences: {
    restartId: "",
    countoffId: "",
    read: reviewPreferences,
    write: () => {},
  },
  display: {
    setPhoneLandscape: async () => {},
    highlightId: "",
    fullscreenId: "",
    fullscreen: () => false,
    setFullscreen: () => {},
    setHighlight: () => {},
    report: status,
  },
  selectionChanged: (index) => {
    if (record && !busy && session?.active()) flushEditorForm(false);
    selected = index;
    if (record) lyricEditor.render();
  },
  afterFrame: updateEditorPlayback,
  ids: {
    ...webPlaybackBindings,
    rewindButton: "jump",
    radiusAttribute: "data-loop-radius",
    settings: undefined,
  },
  canonicalXML: () => record?.canonicalXML,
  song,
  player: engine,
  ready: () => !!record && !loadingRecord,
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
  highlight: () => false,
  formats: () => (record ? songScores(record).map((s) => s.format) : []),
  fail: error,
  changed: queueSave,
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
  listsChanged: () => {},
  validateView: (view) => {
    if (view === "compare") {
      reviewPair(record!);
      if (song().settings.view !== "compare") engine().pause();
    }
  },
  settingsChanged: syncViewChoices,
});
function songControlsAvailable(enabled: boolean) {
  for (const id of ["zoom", "original-button", "file-xml", "file-export"]) {
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
$("error-notice-close").onclick = () => {
  $("error-notice").hidden = true;
};
$("error-notice").onclick = (event) => {
  if (!(event.target as Element).closest("button"))
    $("error-message").querySelector("button")?.click();
};
$("error-notice").onkeydown = (event) => event.stopPropagation();
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
  showCopyableError($("error-message"), message);
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
    player = new Player(reviewPreferences);
    player.onprogress = status;
    player.onerror = status;
    player.onstate = () => playback.onState();
  }
  return player;
}
let pendingPersistence: Promise<void> = Promise.resolve();
const projectBindings = new Map<
  string,
  Pick<RecordData, "localProject" | "localDraft">
>();
function persist(confirmed?: RecordData): Promise<void> {
  if (!record) return Promise.resolve();
  if (confirmed) clearTimeout(saveTimer);
  const source = confirmed || session?.forStorage() || record;
  const value = {
    ...source,
    song: structuredClone(source.song),
    editDraft: structuredClone(source.editDraft),
    lyricWork: structuredClone(source.lyricWork),
  };
  const result = pendingPersistence.then(async () => {
    Object.assign(value, projectBindings.get(value.song.id));
    const result = await writeProject(value, !!confirmed);
    const binding = {
      localProject: result.head ?? value.localProject,
      localDraft: result.draft,
    };
    projectBindings.set(value.song.id, binding);
    if (record?.song.id === value.song.id) Object.assign(record, binding);
    if (confirmed) Object.assign(confirmed, binding);
    management?.refresh();
  });
  pendingPersistence = result.catch(() => {});
  return result;
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
async function activate(r: RecordData, alreadySaved = false) {
  scoreGestures.cancel();
  playback.reset();
  busy = true;
  loadingRecord = true;
  try {
    engine().pause();
    clearTimeout(saveTimer);
    if (record && !alreadySaved) await persist();
    await pendingPersistence;
    if (!alreadySaved && r.song.id === record?.song.id)
      Object.assign(r, projectBindings.get(r.song.id));
    await readEditorRecord(r);
    if (!r.localProject) r = await openProject(r);
    r = await prepareEditorScore(r, status, renderScore);
    Object.assign(r.song.settings, {
      click: false,
      countIn: 0,
      rate: 1,
      tempoMode: "original",
      practiceBpm: undefined,
      musicVolume: 1,
      clickVolume: 1,
    });
    session?.reset();

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
    // Publish the record only when its matching geometry is ready for frames.
    record = r;
    projectBindings.set(r.song.id, {
      localProject: r.localProject,
      localDraft: r.localDraft,
    });
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
    loadingRecord = false;
    songControlsAvailable(true);
    updateSongHeading();
    syncSettings();
    renderTrack();
    renderLists();
    await openEditor();
    sections.refresh();
    projectWorkflow.open(r);
    lyricStage.load(r);
    status("");
  } finally {
    loadingRecord = false;
    busy = false;
    if (record) {
      renderLists();
      playback.syncDisplay();
    }
  }
}
function syncViewChoices() {
  if (!record) return;
  const formats = songScores(record).map((s) => s.format);
  const available = formats.includes("pdf") && formats.includes("musicxml");
  const button = document.querySelector<HTMLButtonElement>(
    '[data-row-view="compare"]',
  );
  if (button) button.disabled = !available || busy;
  $("copy-position").hidden = true;
}
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
function updateEditorPlayback(time: number) {
  if (!record) return;
  if (engine().playing) {
    const index = locate(song(), time).index;
    if (selected !== index) {
      selected = index;
      lyricEditor.render();
    }
  }
  lyricStage?.refresh();
}
playback.syncDisplay();
const scoreGestures = {
  cancel: () => playback.cancel(),
  dispose: () => playback.dispose(),
};

function renderLists() {
  playback.renderLists();
}
for (const b of document.querySelectorAll<HTMLElement>("[data-close]"))
  b.onclick = () => $<HTMLDialogElement>(b.dataset.close!).close();
async function showEditorHome() {
  if (busy || session.saving()) return;
  engine().pause();
  clearTimeout(saveTimer);
  await persist();
  scoreGestures.cancel();
  playback.reset();
  session?.reset();
  projectWorkflow.close();
  lyricStage.clear();
  $("editor-dialog").hidden = true;
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
  get session() {
    return session;
  },
  song,
  engine,
  renderCurrentLyrics: renderLyricEditor,
  renderLists,
  queueSave,
  updateSongHeading,
  action,
  tell,
  refreshGeometry,
  error,
});
function openEditor() {
  return scoreEditor.openEditor();
}
function updateMeasureForm() {
  scoreEditor.updateMeasureForm();
}
function edit(mut: (song: Song) => void, work?: RecordData["lyricWork"]) {
  scoreEditor.edit(mut, work);
}
const lyricEditor = createLyricEditor({
  song,
  selected: () => selected,
  edit,
  record: () => record!,
  selectMeasure: (index) => {
    selected = index;
    playback.selectMeasure(index, false);
  },
  flush: () => flushEditorForm(false),
  selectionChanged: () => lyricStage?.refresh(true),
  error,
});
function renderLyricEditor() {
  lyricEditor.render();
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
  flush: () => flushEditorForm(),
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
  record.song = structuredClone(s.song);
  record.canonicalXML = s.canonicalXML;
  record.lyricWork = structuredClone(s.lyricWork);
  void refreshGeometry().catch(error);
  engine().song = record.song;
  engine().loop = undefined;
  selected = clamp(selected, 0, s.song.measures.length - 1);
  fillMetadata();
  updateMeasureForm();
  renderLyricEditor();
  renderTrack();
  renderLists();
  updateSongHeading();
}
function restoreEditorForm(form: EditorForm) {
  selected = clamp(form.selected, 0, song().measures.length - 1);
  updateMeasureForm();
  renderLyricEditor();
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
    return p.metaChanged || p.tempoChanged || !!p.lyrics.length;
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
      edit,
      flush: () => flushEditorForm(),
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

const sections = installEditorSections({
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
  geometryChanged: () => {
    if (record) lyricStage.load(record);
  },
  queueSave,
});

let geometryQueue: Promise<void> = Promise.resolve();
function refreshGeometry() {
  const target = record;
  const xml = target?.canonicalXML;
  const job = geometryQueue
    .catch(() => {})
    .then(async () => {
      if (!target || record !== target || target.canonicalXML !== xml) return;
      const scroll = $("stage").scrollTop;
      await sections.refreshSectionGeometry(target);
      if (record === target && target.canonicalXML === xml) {
        $("stage").scrollTop = scroll;
        lyricStage.load(target);
      }
    });
  geometryQueue = job;
  return job;
}
const lyricStage = installLyricStage({
  record: () => record,
  editor: lyricEditor,
  engine,
  error,
  editable: () => !busy && !session.saving(),
  position: playback.position,
  review: () => reviewController.layout(),
});
const projectWorkflow = installProjectWorkflow({
  record: () => record,
  persist,
  activate,
  dirty: () => session.dirty(),
  blocked: () => busy || session.saving() || lyricStage.dragging(),
  error,
});
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    clearTimeout(saveTimer);
    playback.dispose();
    lyricEditor.dispose();
    lyricStage.dispose();
    projectWorkflow.close();
    session.reset();
  });
for (const id of [
  "edit-title",
  "edit-original-title",
  "edit-artist",
  "edit-lyricist",
  "edit-composer",
])
  val(id).addEventListener("change", () => {
    try {
      flushEditorForm();
    } catch (e) {
      error(e);
    }
  });
