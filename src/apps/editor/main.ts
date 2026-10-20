import { applyEnglishLyrics,correctBrightSpelling } from "../../content/english-lyrics";
import { applyListeningRevision } from "../../content/listening-revision";
import { applyBar34AcousticReview } from "../../content/lyric-bar34-review";
import { applyListeningFeedbackBatch } from "../../content/lyric-feedback-batch";
import { applyListeningFeedbackFollowup } from "../../content/lyric-feedback-followup";
import { applyListeningFeedbackM32 } from "../../content/lyric-feedback-m32";
import { applyListeningFeedbackM36 } from "../../content/lyric-feedback-m36";
import { applyListeningFeedbackM39 } from "../../content/lyric-feedback-m39";
import { applyListeningFeedbackM48 } from "../../content/lyric-feedback-m48";
import { applyTookuTailShift } from "../../content/lyric-tail-shift";
import lyricTimingRefinement from "../../content/lyric-timing-refinement";
import {
retainRevision,
type EditSnapshot,
type EditorForm,
} from "../../model/edit-history";
import type { RecordData } from "../../model/record";
import "../../modules/help/help.css";
import { attachBundledScore,repairBundledMetadata } from "../../modules/library/bundled-score";
import { exportLibrary,importLibrary,preferenceKeys } from "../../modules/library/library-backup";
import "../../modules/library/player-library.css";
import { chooseRecent,rememberScore } from "../../modules/library/recent-score";
import { createScorePackage,readScorePackage } from "../../modules/library/score-package";
import { preferPDF,savePreferPDF,scorePreference } from "../../modules/library/score-preference";
import {
enableLyricGrid
} from "../../modules/lyrics/lyric-grid";
import { applyJapaneseReadings } from "../../modules/lyrics/lyric-reading";
import { applyLyricRevision } from "../../modules/lyrics/lyric-revision";
import {
migrateLyricPositions
} from "../../modules/lyrics/lyric-score";
import { applyLyricTimingPatch,applyUserLyricAnchors } from "../../modules/lyrics/lyric-timing";
import type { RibbonAsset } from "../../modules/playback/playback-assets";
import {
preparePlaybackAssets,
releasePlaybackAssets,
replacePlaybackAssets,
} from "../../modules/playback/playback-assets";
import { syncSettingsChoices } from "../../modules/playback/playback-forms";
import {
readPlaybackPreferences,
savePlaybackPreferences,
} from "../../modules/playback/playback-preferences";
import { createPlaybackScreen } from "../../modules/playback/playback-screen";
import { webPlaybackBindings } from "../../modules/playback/playback-ui";
import "../../modules/playback/playback-ui.css";
import {
attachPracticeManagement
} from "../../modules/playback/practice-management";
import { readSectionShortcuts,type SectionShortcut } from "../../modules/playback/section-shortcuts";
import {
ensureCanonical,
importedCanonical,
readCanonical,
saveCanonical,
verifyCanonicalAudio,
vocalLyrics,
withVocalSource,
writeCanonical
} from "../../modules/score/canonical-xml";
import { type HighlightPage } from "../../modules/score/note-highlight";
import {
readNoteHighlight,
saveNoteHighlight,
} from "../../modules/score/note-highlight-preference";
import { type StaffPosition } from "../../modules/score/practice-staff-layout";
import {
applyXMLTiming,
replaceWithMusicXML,
scoreArchivePath,
scoreFormat,
} from "../../modules/score/score-import";
import { SVG_GZIP,displayPage,pageExtension } from "../../modules/score/score-pages";
import {
correctStoredRests,
} from "../../modules/score/score-rest-correction";
import { activeScore,songScores,useScore } from "../../modules/score/song-scores";
import { download } from "../../platform/browser/download";
import {
autoFullscreenEnabled,
enterFullscreen,
saveAutoFullscreen,
} from "../../platform/browser/fullscreen";
import { allRecords,saveRecord,saveRecords } from "../../platform/storage/storage";
import { formatTime,t as i18nText } from "../../shared/i18n/i18n";
import "../../shared/styles/controls.css";
import { createDialog } from "../../shared/ui/dialog-ui";
import { arrangeIcons } from "../../shared/ui/icons";
import { Player } from "./audio";
import { $,num,val } from "./editor-dom";
import { createEditorForm,editorFields } from "./editor-form";
import { createEditorLibrary } from "./editor-library";
import { createLyricEditor } from "./editor-lyrics";
import { createEditorReview } from "./editor-review";
import { createScoreEditor } from "./editor-score-controls";
import { editorSession } from "./editor-session";
import { editorHTML } from "./editor-view";
import { setupScoreManagement } from "./score-management";
import { reviewPair } from "./score-review";
import { mountSectionEditor,writeSections } from "./section-editor";
import "./style.css";
import {
arrangeWorkspace,
openSettingsChild,
paginateList,
selectEditorPane,
} from "./workspace";
const renderPDF: typeof import("../../modules/score/pdf").renderPDF = async (...args) =>
  (await import("../../modules/score/pdf")).renderPDF(...args);
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

import JSZip from "jszip";
import {
beatTime,
clamp,
defaults,
locate,
reflow,
uid,
validateSong,
type Region,
type Song
} from "../../model/model";
import { mediaIdentity,verifyMedia,type MediaIdentity } from "../../modules/audio/media";
import { packScores,unpackScores } from "../../platform/storage/record-serialization";
import { escapeHTML as esc } from "../../shared/ui/html";
const time = (s: number) =>
  `${Math.floor(s / 60)}:${Math.floor(s % 60)
    .toString()
    .padStart(2, "0")}`;
let player: Player | undefined,
  record: RecordData | undefined,
  urls: string[] = [];
let session: ReturnType<typeof editorSession> | undefined;
let management: ReturnType<typeof setupScoreManagement> | undefined;
let selected = 0;
let saveTimer = 0,
  busy = false;
let practiceManagement: ReturnType<typeof attachPracticeManagement> | undefined;
let pageRatios: number[] = [];
let practiceStaffs = new Map<string, StaffPosition>();
const ribbonAssets = new Map<number, RibbonAsset>();
let highlightPages: (HighlightPage | undefined)[] = [];
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
    mark: "open-marker-dialog",
    sound: "open-sound-dialog",
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
});
function songControlsAvailable(enabled: boolean) {
  val("click").closest("label")!.hidden = !enabled;
  for (const id of [
    "click",
    "zoom",
    "original-button",
    "edit-button",
    "lyrics-button",
    "metadata-button",
    "export",
    "review-add-score",
    "replace-score-button",
    "export-musicxml",
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
  await saveRecord(session?.forStorage() || record);
  management?.refresh();
  status(
    i18nText("main.message216"),
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
async function activate(r: RecordData) {
  scoreGestures.cancel();
  if (autoFullscreenEnabled() && !document.fullscreenElement)
    requestScoreFullscreen();
  playback.reset();
  validateSong(r.song);
  if (r.canonicalXML) {
    await verifyCanonicalAudio(r);
    readCanonical(r.canonicalXML, r.song);
  } else {
    applyLyricTimingPatch(r.song);
    applyUserLyricAnchors(r.song);
    applyLyricTimingPatch(r.song, lyricTimingRefinement);
    applyLyricRevision(r.song);
    applyJapaneseReadings(r.song);
    applyEnglishLyrics(r.song);
    applyListeningRevision(r.song);
    enableLyricGrid(r.song);
    applyTookuTailShift(r.song);
    applyListeningFeedbackBatch(r.song);
    applyListeningFeedbackFollowup(r.song);
    applyListeningFeedbackM32(r.song);
    applyListeningFeedbackM36(r.song);
    applyBar34AcousticReview(r.song);
    correctBrightSpelling(r.song);
    applyListeningFeedbackM39(r.song);
    applyListeningFeedbackM48(r.song);
    migrateLyricPositions(r.song);
    await ensureCanonical(r);
  }
  validateSong(r.song);
  busy = true;
  try {
    if (await repairBundledMetadata(r)) await saveRecord(r);
    r = await attachBundledScore(r, status);
    r = await correctStoredRests(r, status);
    r = await (await import("../../modules/score/browser-score")).prepareBrowserScore(r, status);
    const preferred = scorePreference(r).format;
    if (preferred !== (r.song.scoreFormat ?? "pdf"))
      r = useScore(
        r,
        songScores(r).find((s) => s.format === preferred)!,
      );
    if (
      r.song.scoreFormat === "musicxml" &&
      r.pages.some((p) => p.type !== SVG_GZIP)
    ) {
      const rendered = await renderScore(r.pdf, "musicxml", r.song.scorePartId);
      if (!rendered.parsed) throw Error(i18nText("main.message219"));
      replaceWithMusicXML(
        r.song,
        { ...rendered, parsed: rendered.parsed },
        r.song.pdfName,
      );
      if (rendered.pages.length !== r.song.pageCount)
        throw Error(i18nText("main.message220"));
      // Same OSMD layout: keep normalized crops and any user beat-position edits.
      r = { ...r, pages: rendered.pages };
    }
    engine().pause();
    clearTimeout(saveTimer);
    if (record) await saveRecord(session?.forStorage() || record);
    session?.reset();
    record = r;
    document.body.classList.add("has-song");

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
      { urls, pageRatios, highlightPages, practiceStaffs, ribbon: ribbonAssets },
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
    $("welcome").hidden = true;
    $("practice").hidden = false;
    $("edit-button").hidden = false;
    songControlsAvailable(true);
    updateSongHeading();
    val("seek").max = String(engine().duration);
    $("duration").textContent = time(engine().duration);
    syncSettings();
    renderTrack();
    renderLists();
    await persist();
    rememberScore(r.song.id);
    $("demo-button").textContent = i18nText("main.message223", {
      value1: r.song.title,
    });
    status("");
  } finally {
    busy = false;
    if (record) renderLists();
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
  const preference = scorePreference(record);
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
val("prefer-pdf").onchange = async () => {
  if (!record || busy) {
    if (record) syncViewChoices();
    return;
  }
  const original = record;
  const wanted = val("prefer-pdf").checked;
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
      { urls, pageRatios, highlightPages, practiceStaffs, ribbon: ribbonAssets },
      prepared,
    );
    prepared = undefined;
    record = next;
    engine().song = next.song;
    savePreferPDF(wanted);
    renderTrack();
    queueSave();
  } catch (e) {
    if (prepared) releasePlaybackAssets(prepared);
    error(e);
  } finally {
    busy = false;
    syncViewChoices();
  }
};
function syncSettings() {
  playback.sync();
  management?.refresh();
}
const reviewController = createEditorReview({record: () => record, song, engine, renderScore, action, error});
const prepareReview = () => reviewController.prepare();
function renderTrack() {
  playback.renderTrack();
}
function updateEditorPlayback(t: number) {
  const loc = locate(song(), t);
  $("elapsed").textContent = time(t);
  if (!scrubbing) {
    val("seek").value = String(t);
    val("seek").setAttribute(
      "aria-valuetext",
      i18nText("main.message245", { value1: loc.measure?.label || "1" }),
    );
  }
  $("editor-time").textContent = i18nText("main.message247", {
    value1: t.toFixed(2),
  });
}
const toggle = () => playback.toggle();

function syncNoteHighlightControl() {
  playback.syncDisplay();
}
syncNoteHighlightControl();
const seekFreely = (time: number) => playback.seek(time);
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
    if (
      (e.target as Element).closest("#demo-button, #library-list [data-open]")
    )
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

let scrubbing = false,
  resumeAfterScrub = false;
const seek = val("seek");
function showSeekPosition() {
  const bubble = $("seek-position");
  bubble.textContent = i18nText("main.message245", {
    value1: locate(song(), num("seek")).measure?.label || "1",
  });
  bubble.hidden = false;
  const fraction = num("seek") / Number(seek.max);
  bubble.style.left = `${14 + fraction * Math.max(0, seek.clientWidth - 28)}px`;
  seek.setAttribute("aria-valuetext", bubble.textContent);
}
seek.onpointerdown = () => {
  if (!record) return;
  scrubbing = true;
  resumeAfterScrub = engine().playing;
  engine().pause();
  showSeekPosition();
};
seek.oninput = () => {
  if (!record) return;
  showSeekPosition();
  seekFreely(num("seek"));
};
async function finishScrub() {
  if (!scrubbing) return;
  scrubbing = false;
  seekFreely(num("seek"));
  $("seek-position").hidden = true;
  const resume = resumeAfterScrub;
  resumeAfterScrub = false;
  if (resume) await engine().play(false, false);
  queueSave();
}
window.addEventListener("pointerup", () => finishScrub().catch(error));
window.addEventListener("pointercancel", () => {
  scrubbing = false;
  resumeAfterScrub = false;
  $("seek-position").hidden = true;
});
// Native Safari range controls may dispatch input after pointerup.
seek.onchange = () => {
  $("seek-position").hidden = true;
  if (!scrubbing) {
    seekFreely(num("seek"));
    queueSave();
  }
};
seek.onblur = () => {
  $("seek-position").hidden = true;
};
practiceManagement = attachPracticeManagement({
  canonicalXML: () => record?.canonicalXML,
  root: $("app"),
  song,
  playback: () => playback,
  player: engine,
  changed: queueSave,
  fail: error,
  paginate: paginateList,
});
function renderLists() {
  playback.renderLists();
}
for (const b of document.querySelectorAll<HTMLElement>("[data-close]"))
  if (
    ![
      "settings-dialog",
      "tempo-dialog",
      "sound-dialog",
      "loop-dialog",
      "marker-dialog",
    ].includes(b.dataset.close!)
  )
    b.onclick = () => $<HTMLDialogElement>(b.dataset.close!).close();
const editorLibrary = createEditorLibrary({persist, activate, openEditor, error, action, hasRecord: () => !!record,
 openReplace: () => replaceDialog.showModal(),
 clearActive(deleting) {
      if (record?.song.id === deleting) {
        engine().pause();
        clearTimeout(saveTimer);
        record = undefined;
        releasePlaybackAssets({urls, ribbon:ribbonAssets});
        ribbonAssets.clear();
        urls = [];
        $("practice").hidden = true;
        $("welcome").hidden = false;
        $("song-title").textContent = i18nText("separation.editorTitle");
        document.title = i18nText("separation.editorTitle");
        $("original-tempo").hidden = true;
        $("edit-button").hidden = true;
        document.body.classList.remove("has-song");
        songControlsAvailable(false);
      }
 }
});
const openLibrary = () => editorLibrary.open();
const refreshRecentScore = () => editorLibrary.refreshRecent();
function openNew() {
  engine().pause();
  $<HTMLDialogElement>("library-dialog").close();
  $<HTMLDialogElement>("new-dialog").showModal();
}
action("new-button", openNew);
action("welcome-new", openNew);
action("demo-button", async () => {
  status(i18nText("main.message290"));
  const existing = chooseRecent((await allRecords()).filter(r => !r.song.audioPractice));
  if (existing) {
    await activate(existing);
    return;
  }
  const fetchBlob = async (url: string) => {
    const r = await fetch(url);
    if (!r.ok) throw Error(i18nText("main.message291"));
    return r.blob();
  };
  const response = await fetch("/demo/song.json");
  if (!response.ok) throw Error(i18nText("main.message292"));
  const s = (await response.json()) as Song;
  const [pdf, audio, ...pages] = await Promise.all(
    [
      "/demo/score.pdf",
      "/demo/audio.mp3",
      "/demo/page-1.png",
      "/demo/page-2.png",
      "/demo/page-3.png",
    ].map(fetchBlob),
  );
  await activate({ song: s, pdf, audio, pages });
});

let inspectGeneration = 0;
val("pdf-file").onchange = async () => {
  const generation = ++inspectGeneration,
    file = val("pdf-file").files?.[0];
  $("xml-part-row").hidden = true;
  $("xml-part").innerHTML = "";
  const isXML = !!file && scoreFormat(file.name) === "musicxml";
  val("new-beats").disabled = isXML;
  val("new-denominator").disabled = isXML;
  if (!file || scoreFormat(file.name) !== "musicxml") return;
  try {
    const xml = await xmlModule(),
      text = await xml.readMusicXML(file),
      info = xml.parseMusicXML(text, undefined, true);
    if (generation !== inspectGeneration) return;
    $("xml-part").innerHTML = info.parts
      .map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`)
      .join("");
    $("xml-part-row").hidden = false;
    if (!pendingRestore) {
      if (info.title) val("new-title").value = info.title;
      if (info.bpm) val("new-bpm").value = String(info.bpm);
    }
  } catch (e) {
    if (generation === inspectGeneration) error(e);
  }
};
val("xml-part").onchange = async () => {
  const file = val("pdf-file").files?.[0];
  if (!file) return;
  try {
    const xml = await xmlModule(),
      info = xml.parseMusicXML(
        await xml.readMusicXML(file),
        val("xml-part").value,
      );
    if (info.bpm && !pendingRestore) val("new-bpm").value = String(info.bpm);
  } catch (e) {
    error(e);
  }
};
$("new-form").onsubmit = async (e) => {
  e.preventDefault();
  if (busy) return;
  busy = true;
  try {
    const pdf = val("pdf-file").files?.[0],
      audio = val("audio-file").files?.[0];
    if (!pdf || !audio) throw Error(i18nText("main.message293"));
    status(i18nText("main.message294"));
    const format = scoreFormat(pdf.name);
    const result = await renderScore(
      pdf,
      format,
      val("xml-part").value || undefined,
    );
    const { pages, regions } = result;
    const s: Song = {
      version: 1,
      id: uid(),
      title: val("new-title").value,
      artist: val("new-artist").value,
      bpm: result.parsed?.bpm ?? num("new-bpm"),
      firstBeat: num("new-first"),
      pageCount: pages.length,
      regions,
      measures: regions.map((r, i) => ({
        id: uid(),
        regionId: r.id,
        label: String(i + 1),
        beats: num("new-beats"),
        denominator: num("new-denominator"),
        start: 0,
        end: 1,
      })),
      lyrics: [],
      markers: [],
      loops: [],
      settings: defaults(),
      scoreFormat: format,
      scorePartId: result.parsed ? result.parsed.partId : undefined,
      pdfName: pdf.name,
      audioName: audio.name,
    };
    if (result.parsed) applyXMLTiming(s, result.parsed);
    else reflow(s);
    s.lyricText = val("new-lyrics").value.trim() || undefined;
    if (result.parsed)
      s.lyrics = result.parsed.lyrics
        .map((l) => {
          const m = s.measures[l.measure],
            beat = clamp(l.beat, 0, m.beats);
          return {
            id: uid(),
            text: l.text,
            time: beatTime(m, beat),
            end: beatTime(m, Math.min(m.beats, beat + l.duration)),
            confirmed: false,
            scorePosition: {
              measureId: m.id,
              quarterOffset: (l.beat * 4) / m.denominator,
              durationQuarters: Math.max(
                0.0001,
                (l.duration * 4) / m.denominator,
              ),
            },
          };
        })
        .sort((a, b) => a.time - b.time);
    const canonicalXML =
      format === "musicxml"
        ? importedCanonical(await (await xmlModule()).readMusicXML(pdf), s)
        : undefined;
    await activate({ song: s, pdf, audio, pages, canonicalXML });
    $<HTMLDialogElement>("new-dialog").close();
    await openEditor();
    tell(
      result.parsed
        ? i18nText("main.message295", {
            value1: regions.length,
            value2: result.parsed.warnings.join(" "),
          })
        : i18nText("main.message296", { value1: regions.length }),
    );
  } catch (e) {
    error(e);
  } finally {
    busy = false;
  }
};
document.addEventListener("open-score-editor", () => {
  if (!$<HTMLDialogElement>("editor-dialog").open)
    void openEditor().catch(error);
});
const scoreEditor = createScoreEditor({cancelGestures: () => scoreGestures.cancel(),
 get selected() {return selected;}, set selected(value) {selected=value;},
 get record() {return record;}, get urls() {return urls;}, get session() {return session;},
 song,engine,renderLyricEditor,renderCurrentLyrics: () => renderLyricEditor(lyricEditor.near),
 flushEditorForm: () => flushEditorForm(),renderTrack,renderLists,queueSave,updateSongHeading,action,error,tell,toggle,
});
function openEditor() {return scoreEditor.openEditor();}
function updateMeasureForm() {scoreEditor.updateMeasureForm();}
function drawPage() {return scoreEditor.drawPage();}
function edit(mut: (song: Song) => void) {scoreEditor.edit(mut);}
const lyricEditor = createLyricEditor({song, selected: () => selected, edit, current: () => engine().current(), action, error});
function renderLyricEditor(near: boolean, keepPage = false) { lyricEditor.render(near, keepPage); }
let originalPage = 0;
let originalURLs: string[] = [];
function showOriginalPage() {
  $("page-original").innerHTML =
    '<img src="' +
    String(originalURLs[originalPage]) +
    '" alt="' +
    i18nText("main.message326", { value2: originalPage + 1 }) +
    '"><div class="pager"><button id="original-prev" ' +
    String(originalPage === 0 ? "disabled" : "") +
    ">" +
    i18nText("main.message327") +
    "</button><span>" +
    String(originalPage + 1) +
    " / " +
    String(originalURLs.length) +
    '</span><button id="original-next" ' +
    String(originalPage === originalURLs.length - 1 ? "disabled" : "") +
    ">" +
    i18nText("main.message328") +
    "</button></div>";
  $("original-prev").onclick = () => {
    originalPage--;
    showOriginalPage();
  };
  $("original-next").onclick = () => {
    originalPage++;
    showOriginalPage();
  };
}
action("original-button", async () => {
  if (!record) return;
  const pdf = songScores(record).find((s) => s.format === "pdf");
  if (!pdf) throw Error(i18nText("main.message329"));
  originalURLs.forEach(URL.revokeObjectURL);
  originalURLs = await Promise.all(
    pdf.pages.map(async (p) => URL.createObjectURL(await displayPage(p))),
  );
  const index = $<HTMLDialogElement>("editor-dialog").open
    ? selected
    : locate(song(), engine().current()).index;
  originalPage =
    pdf.regions.find((r) => r.id === pdf.measures[index]?.regionId)?.page || 0;
  showOriginalPage();
  openSettingsChild($<HTMLDialogElement>("original-dialog"));
});
action("export", async () => {
  await persist();
  const zip = new JSZip();
  zip.file("song.json", JSON.stringify(song(), null, 2));
  zip.file("canonical.musicxml", record!.canonicalXML!);
  zip.file(
    "media-identity.json",
    JSON.stringify(await mediaIdentity(record!.pdf, record!.audio)),
  );
  zip.file("README.txt", i18nText("main.message330"));
  if (val("include-media").checked) {
    zip.file(scoreArchivePath(song()), record!.pdf);
    zip.file(
      "pages/manifest.json",
      JSON.stringify(
        record!.pages.map((page, i) => ({
          path: `pages/${i}.${pageExtension(page)}`,
          type: page.type,
        })),
      ),
    );
    record!.pages.forEach((page, i) =>
      zip.file(`pages/${i}.${pageExtension(page)}`, page),
    );
    zip.file("media/audio", record!.audio);
    zip.file(
      "other-scores.json",
      JSON.stringify(await packScores(record!.otherScores)),
    );
  }
  const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
  download(blob, i18nText("main.message331", { value1: song().title }));
  tell(i18nText("main.message332"));
});
val("restore").onchange = async () => {
  try {
    const f = val("restore").files?.[0];
    if (!f) return;
    const zip = await JSZip.loadAsync(f);
    const text = await zip.file("song.json")?.async("string");
    if (!text) throw Error(i18nText("main.message333"));
    const s = JSON.parse(text);
    validateSong(s);
    const canonicalXML = await zip.file("canonical.musicxml")?.async("string");
    const identityText = await zip.file("media-identity.json")?.async("string");
    const identity: MediaIdentity | undefined = identityText
      ? JSON.parse(identityText)
      : undefined;
    let pdf = await zip.file(scoreArchivePath(s))?.async("blob"),
      audio = await zip.file("media/audio")?.async("blob");
    if (!pdf || !audio) {
      const saved = (await allRecords()).find((r) => r.song.id === s.id);
      if (saved) {
        pdf = saved.pdf;
        audio = saved.audio;
      } else {
        pendingRestore = s;
        pendingCanonical = canonicalXML;
        pendingMedia = identity;
        $<HTMLDialogElement>("new-dialog").showModal();
        val("new-title").value = s.title;
        val("new-artist").value = s.artist || "";
        val("new-bpm").value = String(s.bpm);
        val("new-first").value = String(s.firstBeat);
        tell(i18nText("main.message334"));
        return;
      }
    }
    await verifyMedia(identity, pdf, audio);
    const manifestText = await zip.file("pages/manifest.json")?.async("string");
    const manifest: { path: string; type: string }[] = manifestText
      ? JSON.parse(manifestText)
      : Array.from({ length: s.pageCount }, (_, i) => ({
          path: `pages/${i}.png`,
          type: "image/png",
        }));
    if (manifest.length !== s.pageCount)
      throw Error(i18nText("main.message335"));
    const savedPages = await Promise.all(
      manifest.map(async (p) => {
        const bytes = await zip.file(p.path)?.async("arraybuffer");
        return bytes ? new Blob([bytes], { type: p.type }) : undefined;
      }),
    );
    const pages = savedPages.every(Boolean)
      ? (savedPages as Blob[])
      : (await renderScore(pdf, s.scoreFormat, s.scorePartId)).pages;
    if (pages.length !== s.pageCount) throw Error(i18nText("main.message336"));
    const otherText = await zip.file("other-scores.json")?.async("string");
    const otherScores = otherText
      ? unpackScores(JSON.parse(otherText))
      : (await allRecords()).find((r) => r.song.id === s.id)?.otherScores;
    await activate({ song: s, pdf, audio, pages, otherScores, canonicalXML });
    tell(i18nText("main.message337"));
  } catch (e) {
    error(e);
  } finally {
    val("restore").value = "";
  }
};
let pendingRestore: Song | undefined;
let pendingCanonical: string | undefined;
let pendingMedia: MediaIdentity | undefined;
$("new-dialog").addEventListener("close", () => {
  pendingRestore = undefined;
  pendingCanonical = undefined;
  pendingMedia = undefined;
});
// Use the same file picker for explicit reconnection; imported timing is preserved.
const newHandler = $("new-form").onsubmit!;
$("new-form").onsubmit = async (e) => {
  if (!pendingRestore) {
    return newHandler.call($("new-form"), e);
  }
  e.preventDefault();
  try {
    const pdf = val("pdf-file").files?.[0],
      audio = val("audio-file").files?.[0];
    if (!pdf || !audio) throw Error(i18nText("main.message338"));
    await verifyMedia(pendingMedia, pdf, audio);
    const { pages } = await renderScore(
      pdf,
      pendingRestore.scoreFormat,
      pendingRestore.scorePartId,
    );
    if (pages.length !== pendingRestore.pageCount)
      throw Error(i18nText("main.message336"));
    await activate({
      song: pendingRestore,
      pdf,
      audio,
      pages,
      canonicalXML: pendingCanonical,
    });
    pendingRestore = undefined;
    $<HTMLDialogElement>("new-dialog").close();
  } catch (e) {
    error(e);
  }
};
void refreshRecentScore().catch(error);
window.addEventListener("focus", () => {
  if (!$("welcome").hidden) void refreshRecentScore().catch(error);
});

const replaceDialog = createDialog(
  "replace-score-dialog",
  i18nText("main.message346"),
  "",
  document.body,
  "replace-close",
);
replaceDialog.insertAdjacentHTML(
  "beforeend",
  "<p>" +
    i18nText("main.message347") +
    "</p><label>" +
    i18nText("main.message158") +
    '<input type="file" id="replace-score-file" accept=".pdf,.musicxml,.xml,.mxl"></label><p><label>' +
    i18nText("main.message348") +
    '<select id="replace-score-part" disabled><option>' +
    i18nText("main.message349") +
    '</option></select></label></p><p id="replace-score-note" class="subtle"></p><button id="replace-score-apply" class="primary" disabled>' +
    i18nText("main.message350") +
    "</button>",
);

const replaceButton = document.createElement("button");
replaceButton.id = "replace-score-button";
replaceButton.textContent = i18nText("main.message346");
$("backup-dialog").append(replaceButton);
replaceButton.disabled = !record;
replaceButton.onclick = () => {
  if (!record) return;
  engine().pause();
  openSettingsChild(replaceDialog);
};
$("review-add-score").onclick = () => {
  replaceButton.click();
};
let replaceGeneration = 0;
val("replace-score-file").onchange = async () => {
  const gen = ++replaceGeneration;
  val("replace-score-apply").disabled = true;
  $("replace-score-part").innerHTML =
    "<option>" + i18nText("main.message349") + "</option>";
  val("replace-score-part").disabled = true;
  const file = val("replace-score-file").files?.[0];
  if (!file) return;
  try {
    if (scoreFormat(file.name) === "pdf") {
      $("replace-score-part").innerHTML =
        "<option>" + i18nText("main.message351") + "</option>";
      $("replace-score-note").textContent = i18nText("main.message352");
      val("replace-score-apply").disabled = false;
      return;
    }
    const xml = await xmlModule(),
      info = xml.parseMusicXML(await xml.readMusicXML(file), undefined, true);
    if (gen !== replaceGeneration) return;
    $("replace-score-part").innerHTML = info.parts
      .map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`)
      .join("");
    val("replace-score-part").disabled = false;
    $("replace-score-note").textContent = info.warnings.join(" ");
    val("replace-score-apply").disabled = false;
  } catch (e) {
    error(e);
  }
};
$("replace-score-apply").onclick = async () => {
  const file = val("replace-score-file").files?.[0];
  if (!file || !record) return;
  const original = record;
  val("replace-score-apply").disabled = true;
  try {
    const format = scoreFormat(file.name);
    if (
      songScores(original).some((s) => s.format === format) &&
      !confirm(
        i18nText("main.message353", {
          value1:
            format === "pdf" ? i18nText("term.PDF") : i18nText("term.MusicXML"),
        }),
      )
    )
      return;
    const r = await renderScore(file, format, val("replace-score-part").value);
    if (record !== original) throw Error(i18nText("main.message354"));
    let updated: Song;
    if (r.parsed)
      updated = replaceWithMusicXML(
        original.song,
        { ...r, parsed: r.parsed },
        file.name,
      );
    else {
      if (r.regions.length !== original.song.measures.length)
        throw Error(
          i18nText("main.message355", {
            value1: original.song.measures.length,
            value2: r.regions.length,
          }),
        );
      updated = structuredClone(original.song);
      updated.regions = r.regions;
      updated.pageCount = r.pages.length;
      updated.measures.forEach((m, i) => {
        m.regionId = r.regions[i].id;
      });
      updated.scoreFormat = "pdf";
      updated.scorePartId = undefined;
      updated.pdfName = file.name;
    }
    const target = activeScore({
      song: updated,
      pdf: file,
      audio: original.audio,
      pages: r.pages,
    });
    const next = useScore(original, target);
    if (format === "musicxml")
      next.canonicalXML = writeCanonical(
        next.song,
        await (await xmlModule()).readMusicXML(file),
      );
    await activate(next);
    replaceDialog.close();
    tell(
      i18nText("main.message356", {
        value1:
          format === "pdf" ? i18nText("term.PDF") : i18nText("term.MusicXML"),
        value2: r.parsed?.warnings.join(" ") ?? "",
      }),
    );
  } catch (e) {
    error(e);
  } finally {
    val("replace-score-apply").disabled = false;
  }
};

const xmlExport = document.createElement("button");
xmlExport.id = "export-musicxml";
xmlExport.textContent = i18nText("main.message357");
$("backup-dialog").append(xmlExport);
xmlExport.disabled = !record;
xmlExport.onclick = async () => {
  try {
    if (!record) return;
    await persist();
    download(
      new Blob([record.canonicalXML!], {
        type: "application/vnd.recordare.musicxml+xml",
      }),
      `${song().title}.musicxml`,
    );
  } catch (e) {
    error(e);
  }
};
const vocalDialog = createDialog(
  "vocal-dialog",
  i18nText("main.message358"),
  "",
  document.body,
  "vocal-close",
);
vocalDialog.insertAdjacentHTML(
  "beforeend",
  "<p>" +
    i18nText("main.message359") +
    '</p><input id="vocal-file" type="file" accept=".musicxml,.xml,.mxl"><label class="form-field">' +
    i18nText("main.message360") +
    '<select id="vocal-part" disabled><option>' +
    i18nText("main.message349") +
    '</option></select></label><button id="vocal-apply" disabled>' +
    i18nText("main.message361") +
    "</button>",
);

const vocalButton = document.createElement("button");
vocalButton.id = "import-vocal";
vocalButton.textContent = i18nText("main.message362");
$("show-all").after(vocalButton);
vocalButton.onclick = () => {
  engine().pause();
  vocalDialog.showModal();
};
let vocalGeneration = 0;
val("vocal-file").onchange = async () => {
  const generation = ++vocalGeneration;
  val("vocal-apply").disabled = true;
  val("vocal-part").disabled = true;
  $("vocal-part").innerHTML =
    "<option>" + i18nText("main.message349") + "</option>";
  try {
    const f = val("vocal-file").files?.[0];
    if (!f) return;
    const xml = await xmlModule(),
      info = xml.parseMusicXML(await xml.readMusicXML(f), undefined, true);
    if (generation !== vocalGeneration) return;
    $("vocal-part").innerHTML = info.parts
      .map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`)
      .join("");
    val("vocal-part").disabled = false;
    val("vocal-apply").disabled = false;
  } catch (e) {
    error(e);
  }
};
$("vocal-apply").onclick = async () => {
  try {
    if (!record) return;
    const original = record,
      f = val("vocal-file").files?.[0];
    if (!f) return;
    const xml = await xmlModule(),
      parsed = xml.parseMusicXML(
        await xml.readMusicXML(f),
        val("vocal-part").value,
      );
    const lyrics = vocalLyrics(original.song, parsed);
    if (!confirm(i18nText("main.message363"))) return;
    if (record !== original) throw Error(i18nText("main.message364"));
    const base = withVocalSource(original.canonicalXML!, parsed.document);
    const previous = original.canonicalXML;
    original.canonicalXML = base;
    try {
      edit((s) => {
        s.lyricArchive = [
          ...(s.lyricArchive || []),
          {
            revision: "before-vocal-import",
            lyrics: structuredClone(s.lyrics),
          },
        ];
        s.lyrics = lyrics;
      });
    } catch (e) {
      original.canonicalXML = previous;
      throw e;
    }
    await persist();
    renderLyricEditor(false);
    vocalDialog.close();
    tell(i18nText("main.message365"));
  } catch (e) {
    error(e);
  }
};

// Approved score-management workflow. The session preserves drafts independently
// from the confirmed record; input fields are included even before Apply.
const {editorForm, fillMetadata, pendingEditorValues, flushEditorForm} = createEditorForm({song, selected: () => selected, edit, renderLyricEditor, updateSongHeading});
function applySnapshot(s: EditSnapshot) {
  if (!record) return;
  const sectionsChanged = JSON.stringify(readSectionShortcuts(record.canonicalXML ?? "")) !== JSON.stringify(readSectionShortcuts(s.canonicalXML ?? ""));
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
session = editorSession({
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
management = setupScoreManagement({
  get: () => record,
  error,
  uploadLyrics: async (text) => {
    if (!record) return;
    if (
      (song().lyricText || song().lyrics.length) &&
      !confirm(i18nText("main.message371"))
    )
      return;
    record.revisions = retainRevision(record.revisions, record);
    song().lyricText = text;
    await persist();
  },
  exportFiles: async (kinds) => {
    if (!record || !kinds.length) return;
    await persist();
    const title = song().title.replace(/[\\/:*?"<>|]/g, "_"),
      files: { name: string; blob: Blob }[] = [];
    for (const k of kinds) {
      if (k === "xml")
        files.push({
          name: title + ".musicxml",
          blob: new Blob([record.canonicalXML!], {
            type: "application/vnd.recordare.musicxml+xml",
          }),
        });
      if (k === "pdf") {
        const pdf = songScores(record).find((s) => s.format === "pdf");
        if (pdf) files.push({ name: title + ".pdf", blob: pdf.source });
      }
      if (k === "audio")
        files.push({
          name:
            song().audioName.replace(/[\\/:*?"<>|]/g, "_") || title + ".audio",
          blob: record.audio,
        });
    }
    if (files.length === 1) download(files[0].blob, files[0].name);
    else {
      const zip = new JSZip();
      for (const f of files) zip.file(f.name, await f.blob.arrayBuffer());
      download(
        new Blob([
          new Uint8Array(await zip.generateAsync({ type: "uint8array" })),
        ]),
        title + ".zip",
      );
    }
  },
  exportAll: async () => {
    await persist();
    const records = await allRecords();
    if (!records.length) throw Error(i18nText("main.message372"));
    const prefs = Object.fromEntries(
      preferenceKeys
        .map((k) => [k, localStorage.getItem(k)])
        .filter((p): p is [string, string] => p[1] !== null),
    );
    download(
      new Blob([new Uint8Array(await exportLibrary(records, prefs))]),
      i18nText("main.message373", { value1: records.length }),
    );
    tell(i18nText("main.message374", { value1: records.length }));
  },
  restoreAll: async (f) => {
    const parsed = await importLibrary(await f.arrayBuffer());
    for (const r of parsed.records) {
      if (r.canonicalXML) readCanonical(r.canonicalXML, r.song);
    }
    const existing = await allRecords(),
      overlap = parsed.records.filter((r) =>
        existing.some((x) => x.song.id === r.song.id),
      );
    if (
      !confirm(
        i18nText("main.message375", {
          value1: parsed.records.length,
          value2: overlap.length,
        }),
      )
    )
      return;
    player?.pause();
    clearTimeout(saveTimer);
    session?.reset();
    await saveRecords(parsed.records);
    for (const [k, v] of Object.entries(parsed.preferences))
      localStorage.setItem(k, v);
    const replacement = parsed.records.find(
      (r) => r.song.id === record?.song.id,
    );
    if (replacement) {
      record = undefined;
      await activate(replacement);
    }
    await openLibrary();
    tell(i18nText("main.message376", { value1: parsed.records.length }));
  },
  replaceAudio: async (f) => {
    if (!record) return;
    if (!confirm(i18nText("main.message377"))) return;
    const old = record;
    const next = {
      ...old,
      audio: f,
      song: { ...structuredClone(old.song), audioName: f.name },
    };
    next.canonicalXML = writeCanonical(
      next.song,
      old.canonicalXML,
      (await mediaIdentity(next.pdf, next.audio)).audio,
    );
    await ensureCanonical(next);
    await activate(next);
    await persist();
  },
});

// Both entry points share one package-import path. The authoring database remains
// the existing library; an existing identity is never silently overwritten.
const packageInput = document.createElement("input");
packageInput.type = "file";
packageInput.accept = ".drumscore";
packageInput.hidden = true;
packageInput.id = "authoring-package-file";
document.body.append(packageInput);
for (const [host, id] of [
  ["library-dialog", "library-package-import"],
  ["new-dialog", "new-package-import"],
]) {
  const button = document.createElement("button");
  button.id = id;
  button.type = "button";
  button.textContent = i18nText("separation.packageImport");
  button.onclick = () => packageInput.click();
  $(host).querySelector(".dialoghead")?.after(button);
  if (!button.isConnected) $(host).prepend(button);
}
packageInput.onchange = async () => {
  const file = packageInput.files?.[0];
  if (!file) return;
  packageInput.disabled = true;
  try {
    const imported = await readScorePackage(file);
    if ((await allRecords()).some((r) => r.song.id === imported.song.id)) {
      if (!confirm(i18nText("separation.importCopy"))) return;
      imported.song.id = crypto.randomUUID();
      imported.song.title = i18nText("separation.copyTitle", {
        title: imported.song.title,
      });
      saveCanonical(imported);
    }
    await saveRecord(imported);
    await activate(imported);
    for (const id of ["new-dialog", "library-dialog"])
      $<HTMLDialogElement>(id).close();
    tell(i18nText("separation.saved"));
  } catch (e) {
    error(e);
  } finally {
    packageInput.value = "";
    packageInput.disabled = false;
  }
};
const packageExport = document.createElement("button");
packageExport.id = "export-score-package";
packageExport.type = "button";
packageExport.className = "management-row";
packageExport.textContent = i18nText("separation.packageExport");
packageExport.title = i18nText("separation.packageDetail");
const exportDialog = $("song-export-dialog");
exportDialog.firstElementChild?.after(packageExport);
action("export-score-package", async () => {
  if (!record || packageExport.disabled) return;
  packageExport.disabled = true;
  try {
    // Apply the currently visible authoring values before capturing the package.
    // Existing edit-session persistence still owns saved state and drafts.
    if (session?.active()) flushEditorForm();
    await persist();
    const blob = await createScorePackage(record);
    download(blob, `${record.song.title}.drumscore`);
    tell(i18nText("separation.exportReady"));
  } finally {
    packageExport.disabled = false;
  }
});

// Desktop authoring tab; section edits use the existing draft/history workflow.
const sectionPane = document.createElement("section");
sectionPane.id = "editor-sections";
sectionPane.hidden = true;
sectionPane.className = "section-editor";
$("editor-dialog").querySelector(".editor-body")!.append(sectionPane);
const sectionTab = document.createElement("button");
sectionTab.type = "button";
sectionTab.dataset.pane = "sections";
sectionTab.textContent = i18nText("sectionEditor.title");
$("editor-dialog").querySelector(".editor-tabs")!.append(sectionTab);
const sectionEditor = mountSectionEditor(sectionPane, {
  song: () => record?.song,
  xml: () => record?.canonicalXML,
  apply: async (sections: SectionShortcut[]) => {
    if (!record || busy) throw Error(i18nText("sectionEditor.busy"));
    flushEditorForm();
    const original = record;
    const xml = writeSections(original.canonicalXML!, sections, original.song.measures.length, original.song.scorePartId);
    busy = true;
    try {
      const next = await (await import("../../modules/score/browser-score")).prepareBrowserScore({...original, canonicalXML: xml}, status);
      const prepared = await preparePlaybackAssets(next.pages, next.song);
      if (record !== original) { releasePlaybackAssets(prepared); throw Error(i18nText("sectionEditor.changed")); }
      engine().pause();
      session?.before();
      Object.assign(original, next);
      engine().song = original.song;
      replacePlaybackAssets({urls, pageRatios, highlightPages, practiceStaffs, ribbon:ribbonAssets}, prepared);
      renderTrack(); renderLists();
      await drawPage();
      session?.changed();
      queueSave();
    } finally { busy = false; }
  },
});
sectionTab.onclick = () => {
  sectionEditor.refresh();
  selectEditorPane("sections");
};

async function refreshSectionGeometry(original: RecordData) {
  const expectedXML = original.canonicalXML;
  const next = await (await import("../../modules/score/browser-score")).prepareBrowserScore(original, status);
  const prepared = await preparePlaybackAssets(next.pages, next.song);
  if (record !== original || original.canonicalXML !== expectedXML) {
    releasePlaybackAssets(prepared); return;
  }
  original.pages = next.pages;
  original.otherScores = next.otherScores;
  original.song.regions = next.song.regions;
  original.song.pageCount = next.song.pageCount;
  original.song.measures.forEach((m,i) => m.regionId = next.song.measures[i].regionId);
  replacePlaybackAssets({urls, pageRatios, highlightPages, practiceStaffs, ribbon:ribbonAssets}, prepared);
  sectionEditor.refresh();
  renderTrack(); renderLists();
  await drawPage();
}
