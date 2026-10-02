import { Player } from "./audio";
import { attachBundledScore, repairBundledMetadata } from "./bundled-score";
import {
  ensureCanonical,
  hasDrumNotation,
  importedCanonical,
  readCanonical,
  saveCanonical,
  verifyCanonicalAudio,
  vocalLyrics,
  withVocalSource,
  writeCanonical,
} from "./canonical-xml";
import { createDialog, dialogHeader } from "./dialog-ui";
import { download } from "./download";
import {
  retainRevision,
  type EditSnapshot,
  type EditorForm,
} from "./edit-history";
import { editorSession } from "./editor-session";
import { applyEnglishLyrics, correctBrightSpelling } from "./english-lyrics";
import {
  autoFullscreenEnabled,
  enterFullscreen,
  saveAutoFullscreen,
} from "./fullscreen";
import { formatTime, t as i18nText } from "./i18n";
import { arrangeIcons } from "./icons";
import { exportLibrary, importLibrary, preferenceKeys } from "./library-backup";
import { applyListeningRevision } from "./listening-revision";
import { applyBar34AcousticReview } from "./lyric-bar34-review";
import { applyListeningFeedbackBatch } from "./lyric-feedback-batch";
import { applyListeningFeedbackFollowup } from "./lyric-feedback-followup";
import { applyListeningFeedbackM32 } from "./lyric-feedback-m32";
import { applyListeningFeedbackM36 } from "./lyric-feedback-m36";
import { applyListeningFeedbackM39 } from "./lyric-feedback-m39";
import { applyListeningFeedbackM48 } from "./lyric-feedback-m48";
import {
  enableLyricGrid,
  nearestQuarterBeat,
  setLyricGrid,
  synchronizeLyricGrid,
} from "./lyric-grid";
import { applyJapaneseReadings } from "./lyric-reading";
import { applyLyricRevision } from "./lyric-revision";
import {
  advanceLyricPosition,
  lyricDurationBeats,
  migrateLyricPositions,
  projectLyrics,
} from "./lyric-score";
import { applyTookuTailShift } from "./lyric-tail-shift";
import { applyLyricTimingPatch, applyUserLyricAnchors } from "./lyric-timing";
import lyricTimingRefinement from "./lyric-timing-refinement";
import { type HighlightPage } from "./note-highlight";
import {
  readNoteHighlight,
  saveNoteHighlight,
} from "./note-highlight-preference";
import {
  preparePlaybackAssets,
  releasePlaybackAssets,
  replacePlaybackAssets,
} from "./playback-assets";
import "./playback-base.css";
import { makePlaybackHTML, packCombinedPlayback } from "./playback-export";
import {
  readPlaybackPreferences,
  savePlaybackPreferences,
} from "./playback-preferences";
import { createPlaybackScreen } from "./playback-screen";
import { scoreStageHTML, webPlaybackBindings } from "./playback-ui";
import "./playback-ui.css";
import { type StaffPosition } from "./practice-staff-layout";
import { chooseRecent, rememberScore } from "./recent-score";
import { scoreAssets } from "./score-assets";
import {
  applyXMLTiming,
  replaceWithMusicXML,
  scoreArchivePath,
  scoreFormat,
} from "./score-import";
import { setupScoreManagement } from "./score-management";
import { SVG_GZIP, displayPage, pageExtension } from "./score-pages";
import { preferPDF, savePreferPDF, scorePreference } from "./score-preference";
import {
  correctStoredRests,
  ensureCenteredRestCache,
} from "./score-rest-correction";
import { ScoreReview, copyReviewImage, reviewPair } from "./score-review";
import { activeScore, songScores, useScore } from "./song-scores";
import {
  allRecords,
  deleteRecord,
  saveRecord,
  saveRecords,
  type RecordData,
} from "./storage";
import "./style.css";
import {
  arrangeWorkspace,
  openSettingsChild,
  paginateList,
  selectEditorPane,
} from "./workspace";
const renderPDF: typeof import("./pdf").renderPDF = async (...args) =>
  (await import("./pdf")).renderPDF(...args);
const xmlModule = () => import("./musicxml");
async function renderScore(
  blob: Blob,
  format: Song["scoreFormat"],
  partId?: string,
): Promise<{
  pages: Blob[];
  regions: Region[];
  parsed?: import("./musicxml").XMLScore;
}> {
  return format === "musicxml"
    ? (await xmlModule()).renderMusicXML(blob, status, partId)
    : renderPDF(blob, status);
}

import JSZip from "jszip";
import { estimateTempo } from "./analysis";
import { escapeHTML as esc } from "./html";
import { mediaIdentity, verifyMedia, type MediaIdentity } from "./media";
import {
  beatTime,
  clamp,
  defaults,
  locate,
  reflow,
  uid,
  validateSong,
  type Loop,
  type Region,
  type Song,
} from "./model";
import {
  isPortable,
  packScores,
  shellFromDocument,
  unpackScores,
  unpackSong,
} from "./portable";
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const val = (id: string) => $(id) as HTMLInputElement;
const num = (id: string) => Number(val(id).value);
const time = (s: number) =>
  `${Math.floor(s / 60)}:${Math.floor(s % 60)
    .toString()
    .padStart(2, "0")}`;
let player: Player | undefined,
  record: RecordData | undefined,
  urls: string[] = [],
  library: RecordData[] = [];
let session: ReturnType<typeof editorSession> | undefined;
let management: ReturnType<typeof setupScoreManagement> | undefined;
let selected = 0,
  editorPage = 0,
  drawStart: { x: number; y: number } | undefined;
let saveTimer = 0,
  busy = false;
let editingLoopId: string | undefined;
let pageRatios: number[] = [];
let practiceStaffs = new Map<string, StaffPosition>();
let highlightPages: (HighlightPage | undefined)[] = [];
let noteHighlightEnabled = readNoteHighlight();

const app = $("app");
app.innerHTML =
  '\n<header><div class="brand"></div><div class="actions"><button id="library-button">' +
  i18nText("icons.message054") +
  '</button><button id="save-html" hidden>' +
  i18nText("icons.message057") +
  '</button><button id="edit-button" hidden>' +
  i18nText("main.message099") +
  '</button></div></header>\n<main><section class="welcome" id="welcome"><span class="tag">' +
  i18nText("main.message100") +
  "</span><h2>" +
  i18nText("main.message097") +
  '</h2><p class="welcome-lead">' +
  i18nText("main.message101") +
  "</p><p>" +
  i18nText("main.message102") +
  "<br>" +
  i18nText("main.message103") +
  '</p><div class="actions"><button class="primary" id="demo-button">' +
  i18nText("main.message104") +
  '</button><button id="welcome-library">' +
  i18nText("icons.message054") +
  '</button><button id="welcome-new">' +
  i18nText("main.message105") +
  '</button></div><p class="subtle">' +
  i18nText("main.message106") +
  '</p></section>\n<div id="busy" role="status" aria-live="polite"></div><p id="portable-note" class="subtle" hidden>' +
  i18nText("main.message107") +
  '</p>\n<section id="practice" hidden><div class="statusline"><div class="flex"><button id="original-button">' +
  i18nText("main.message112") +
  '</button></div></div>\n<div id="review-tools" hidden><span id="review-message">' +
  i18nText("main.message113") +
  '</span><button id="review-copy">' +
  i18nText("main.message114") +
  '</button><button id="review-save" hidden>' +
  i18nText("main.message115") +
  "</button></div>" +
  scoreStageHTML(
    '<canvas id="review-canvas" hidden aria-label="' +
      i18nText("main.message116") +
      '"></canvas>',
  ) +
  '\n<div class="seekrow"><span id="elapsed">0:00</span><input id="seek" aria-label="' +
  i18nText("main.message117") +
  '" type="range" min="0" max="300" step="0.01" value="0"><span id="duration">0:00</span></div>\n' +
  '<div class="panels"><section class="panel"><h2>' +
  i18nText("main.message132") +
  "</h2>" +
  '<div class="flex"><button id="set-a">' +
  i18nText("workspace.message557") +
  '</button><button id="set-b">' +
  i18nText("workspace.message558") +
  "</button></div>" +
  '<div class="flex"><input id="loop-name" type="text" placeholder="' +
  i18nText("main.message139") +
  '" aria-label="' +
  i18nText("main.message140") +
  '"><button id="save-loop">' +
  i18nText("main.message141") +
  '</button><button id="new-loop">' +
  i18nText("main.message142") +
  '</button><button id="stop-loop">' +
  i18nText("main.message143") +
  '</button></div><div class="list" id="loops"></div></section><section class="panel"><h2>' +
  i18nText("icons.message069") +
  '</h2><div class="flex"><input id="marker-name" type="text" placeholder="' +
  i18nText("main.message144") +
  '" aria-label="' +
  i18nText("main.message145") +
  '"><button id="add-marker">' +
  i18nText("icons.message061") +
  '</button></div><div id="markers" class="list"></div><details><summary>' +
  i18nText("main.message146") +
  '</summary><p class="subtle">' +
  i18nText("main.message147") +
  '</p><label><input id="include-media" type="checkbox" checked>' +
  i18nText("main.message148") +
  '</label><div class="flex"><button id="export">' +
  i18nText("main.message149") +
  "</button><label>" +
  i18nText("main.message150") +
  '<input id="restore" type="file" accept=".zip"></label></div></details></section></div><p class="keyboard">' +
  i18nText("main.message151") +
  '</p><p class="subtle" id="alignment-note">' +
  i18nText("main.message152") +
  '</p></section></main>\n<dialog id="library-dialog">' +
  dialogHeader(
    i18nText("icons.message054"),
    "",
    "library-dialog",
    "",
    '<button id="new-button">' + i18nText("main.message153") + "</button>",
  ) +
  '<div id="library-list"></div></dialog>\n<dialog id="new-dialog">' +
  dialogHeader(i18nText("main.message154"), "", "new-dialog", "") +
  "<p>" +
  i18nText("main.message155") +
  '</p><form id="new-form"><p><label>' +
  i18nText("main.message156") +
  '<input id="new-artist" type="text"></label><label>' +
  i18nText("main.message157") +
  ('<input id="new-title" required type="text" value="' +
    i18nText("song.newTitle") +
    '"></label></p><p><label>') +
  i18nText("main.message158") +
  '<input id="pdf-file" required type="file" accept="application/pdf,.pdf,.musicxml,.xml,.mxl"></label></p><p id="xml-part-row" hidden><label>' +
  i18nText("main.message159") +
  '<select id="xml-part"></select></label><span class="subtle">' +
  i18nText("main.message160") +
  "</span></p><p><label>" +
  i18nText("main.message161") +
  '<input id="audio-file" required type="file" accept="audio/*,.mp3"></label></p><p><label>BPM <input id="new-bpm" type="number" min="20" max="300" value="94" required></label><label>' +
  i18nText("main.message162") +
  '<input id="new-first" type="number" min="0" step="0.001" value="0" required></label><label>' +
  i18nText("main.message163") +
  '<input id="new-beats" type="number" min="1" max="16" value="4" required></label><label>' +
  i18nText("main.message164") +
  '<select id="new-denominator"><option>4</option><option>8</option><option>2</option><option>16</option></select></label></p><p><label>' +
  i18nText("main.message165") +
  ('</label><textarea id="new-lyrics" placeholder="' +
    i18nText("lyrics.uploadExample") +
    '"></textarea></p><p class="subtle">') +
  i18nText("main.message166") +
  '</p><button type="submit" class="primary">' +
  i18nText("main.message167") +
  '</button></form></dialog>\n<dialog id="editor-dialog">' +
  dialogHeader(i18nText("main.message099"), "", "editor-dialog", "") +
  '<div class="flex"><label>' +
  i18nText("main.message156") +
  '<input id="edit-artist" type="text"></label><label>' +
  i18nText("main.message169") +
  '<input id="edit-title" type="text"></label><label>' +
  i18nText("main.message170") +
  '<input id="edit-original-title" type="text"></label><label>' +
  i18nText("main.message171") +
  '<input id="edit-lyricist" type="text"></label><label>' +
  i18nText("main.message172") +
  '<input id="edit-composer" type="text"></label><label>BPM <input id="edit-bpm" type="number" min="20" max="300"></label><label>' +
  i18nText("main.message162") +
  '<input id="edit-first" data-numeric-drag="off" type="number" min="0" step="0.001"></label><button id="reflow">' +
  i18nText("main.message173") +
  '</button><button id="estimate-tempo">' +
  i18nText("main.message174") +
  '</button><button id="tap-tempo">' +
  i18nText("main.message175") +
  '</button><span id="tap-result"></span></div><div class="editor"><section><div class="flex"><label>' +
  i18nText("main.message177") +
  '<select id="editor-page"></select></label><label>' +
  i18nText("main.message178") +
  '<select id="measure-select"></select></label></div><p class="subtle">' +
  i18nText("main.message179") +
  '</p><div class="pagebox"><canvas id="edit-canvas"></canvas></div><div class="flex"><button id="add-region">' +
  i18nText("main.message180") +
  '</button><button id="apply-crop">' +
  i18nText("main.message181") +
  "</button></div></section><section><h3>" +
  i18nText("main.message182") +
  '</h3><div class="flex"><label>' +
  i18nText("main.message183") +
  '<input id="measure-label" type="text" style="width:95px"></label><label>' +
  i18nText("main.message184") +
  '<input id="measure-beats" type="number" min="1" max="16"></label><label>' +
  i18nText("main.message164") +
  '<input id="measure-denominator" type="number" min="2" max="16" value="4"></label></div><div class="flex"><label>' +
  i18nText("main.message185") +
  '<input id="measure-start" data-numeric-drag="off" type="number" min="0" step="0.001"></label><label>' +
  i18nText("main.message186") +
  '<input id="measure-end" data-numeric-drag="off" type="number" min="0" step="0.001"></label><button id="apply-measure">' +
  i18nText("main.message187") +
  "</button></div><label>" +
  i18nText("main.message188") +
  '<input id="beat-xs" type="text" placeholder="0,0.25,0.5,0.75,1" style="width:100%"></label><p class="subtle">' +
  i18nText("main.message189") +
  '</p><div class="flex"><button id="preview-measure">' +
  i18nText("main.message190") +
  '</button><button id="anchor-now">' +
  i18nText("main.message191") +
  '</button><button id="editor-play">' +
  i18nText("main.message192") +
  '</button><span id="editor-time"></span></div><div class="flex"><button id="duplicate">' +
  i18nText("main.message193") +
  '</button><button id="split">' +
  i18nText("main.message194") +
  '</button><button id="merge">' +
  i18nText("main.message195") +
  '</button><button id="move-left">' +
  i18nText("main.message119") +
  '</button><button id="move-right">' +
  i18nText("main.message196") +
  '</button><button id="remove-measure" class="danger">' +
  i18nText("main.message197") +
  "</button></div><h3>" +
  i18nText("canonical-xml.message014") +
  '</h3><p class="subtle">' +
  i18nText("main.message198") +
  '</p><div class="flex"><button id="add-lyric">' +
  i18nText("main.message199") +
  '</button><button id="show-near">' +
  i18nText("main.message200") +
  '</button><button id="show-all">' +
  i18nText("main.message201") +
  '</button></div><div class="scroll"><table><thead><tr><th>' +
  i18nText("main.message202") +
  "</th><th>" +
  i18nText("main.message203") +
  "</th><th>" +
  i18nText("main.message204") +
  "</th><th>" +
  i18nText("main.message205") +
  '</th><th></th></tr></thead><tbody id="lyric-editor"></tbody></table></div></section></div></dialog>\n<dialog id="original-dialog">' +
  dialogHeader(i18nText("main.message206"), "", "original-dialog", "") +
  '<div id="page-original"></div></dialog><button id="error-notice" class="error-notice" hidden type="button"><strong>' +
  i18nText("main.message207") +
  '</strong><span id="error-message" role="alert"></span><span aria-hidden="true">×</span></button>';
arrangeWorkspace();
arrangeIcons();
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
  }),
  highlight: () => noteHighlightEnabled,
  formats: () => (record ? songScores(record).map((s) => s.format) : []),
  fail: error,
  changed: queueSave,
  pauseOverride: () => {
    if (song().settings.view !== "compare") return false;
    captureReview();
    return true;
  },
  compare: {
    render: () => {
      $("review-tools").hidden = $("review-canvas").hidden = false;
      void prepareReview();
    },
    draw: (time) => review?.draw(time),
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
      reviewGeneration++;
      review?.dispose();
      review = undefined;
    }
  },
  listsChanged: renderManagedLists,
  loopDraft: () => ({ id: editingLoopId, name: val("loop-name").value }),
  loopChanged: (loop) => {
    if (loop) {
      editingLoopId = song().loops.some((saved) => saved.id === loop.id)
        ? loop.id
        : undefined;
      val("loop-name").value = loop.name;
      $("save-loop").textContent = i18nText(
        editingLoopId ? "main.message263" : "main.message264",
      );
    }
  },
  markerName: () => {
    const name = val("marker-name").value.trim();
    val("marker-name").value = "";
    return name;
  },
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
    "save-html",
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
    isPortable ? i18nText("main.message215") : i18nText("main.message216"),
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
    if (!isPortable) {
      if (await repairBundledMetadata(r)) await saveRecord(r);
      r = await attachBundledScore(r, status);
      r = await correctStoredRests(r, status);
      r = await ensureCenteredRestCache(r, status);
    }
    const preferred = scorePreference(r).format;
    if (preferred !== (r.song.scoreFormat ?? "pdf"))
      r = useScore(
        r,
        songScores(r).find((s) => s.format === preferred)!,
      );
    if (
      !isPortable &&
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
    editingLoopId = undefined;
    $("save-loop").textContent = i18nText("main.message141");
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
      { urls, pageRatios, highlightPages, practiceStaffs },
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
    $("save-html").hidden = false;
    songControlsAvailable(true);
    updateSongHeading();
    val("seek").max = String(engine().duration);
    $("duration").textContent = time(engine().duration);
    syncSettings();
    for (const id of ["loop-a", "loop-b"])
      val(id).max = String(song().measures.length);
    renderTrack();
    renderLists();
    await persist();
    if (!isPortable) {
      rememberScore(r.song.id);
      $("demo-button").textContent = i18nText("main.message223", {
        value1: r.song.title,
      });
    }
    status("");
  } finally {
    busy = false;
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
        value3: isPortable ? i18nText("main.message229") : "",
      })
    : "";
  $("review-add-score").hidden = isPortable || !missing.length;
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
      { urls, pageRatios, highlightPages, practiceStaffs },
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
let review: ScoreReview | undefined;
let reviewGeneration = 0;
let reviewPNG: Promise<Blob> | undefined;
async function prepareReview() {
  const generation = ++reviewGeneration;
  review?.dispose();
  review = undefined;
  $("review-copy").setAttribute("disabled", "");
  try {
    const sourceRecord = record!;
    const pair = reviewPair(sourceRecord);
    if (
      pair[1].pages.some(
        (p) => p.type !== SVG_GZIP && p.type !== "image/svg+xml",
      )
    ) {
      if (isPortable) throw Error(i18nText("main.message237"));
      const rendered = await renderScore(
        pair[1].source,
        "musicxml",
        pair[1].partId,
      );
      if (!rendered.parsed) throw Error(i18nText("main.message219"));
      replaceWithMusicXML(
        sourceRecord.song,
        { ...rendered, parsed: rendered.parsed },
        pair[1].name,
      );
      if (rendered.pages.length !== pair[1].pages.length)
        throw Error(i18nText("main.message238"));
      if (generation !== reviewGeneration) return;
      pair[1] = { ...pair[1], pages: rendered.pages };
      if (sourceRecord.song.scoreFormat === "musicxml")
        sourceRecord.pages = rendered.pages;
      else
        sourceRecord.otherScores = sourceRecord.otherScores?.map((s) =>
          s.format === "musicxml" ? pair[1] : s,
        );
      await saveRecord(sourceRecord);
    }
    if (generation !== reviewGeneration) return;
    const candidate = new ScoreReview(
      $<HTMLCanvasElement>("review-canvas"),
      song(),
      pair,
    );
    try {
      await candidate.load();
    } catch (e) {
      candidate.dispose();
      throw e;
    }
    if (generation !== reviewGeneration) {
      candidate.dispose();
      return;
    }
    review = candidate;
    review.draw(engine().current());
    $("review-copy").removeAttribute("disabled");
  } catch (e) {
    if (generation === reviewGeneration) {
      $("review-message").textContent = String(e);
      error(e);
    }
  }
}
function captureReview() {
  engine().pause();
  if (!review) {
    $("review-message").textContent = i18nText("main.message239");
    return;
  }
  const time = engine().current();
  reviewPNG = review.snapshot(time);
  $("review-save").hidden = false;
  void copyReviewImage(reviewPNG).then(
    () => {
      $("review-message").textContent = i18nText("main.message240");
    },
    () => {
      $("review-message").textContent = i18nText("main.message241");
    },
  );
  void reviewPNG.catch(error);
}
action("review-copy", captureReview);
action("review-save", async () => {
  if (!reviewPNG) return;
  download(await reviewPNG, i18nText("main.message242"));
});
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
function useLoop(l?: Loop, preservePosition = false) {
  playback.useLoop(l, preservePosition);
}
function loopFromForm(): Loop {
  return playback.loopFromForm(editingLoopId, val("loop-name").value);
}
action("save-loop", () => {
  const l = loopFromForm();
  const at = song().loops.findIndex((x) => x.id === l.id);
  if (at < 0) song().loops.push(l);
  else song().loops[at] = l;
  playback.clearPreset();
  useLoop(l, true);
  queueSave();
});
action("stop-loop", () => playback.stopLoop());
action("new-loop", () => {
  editingLoopId = undefined;
  val("loop-name").value = "";
  $("save-loop").textContent = i18nText("main.message264");
});
for (const [id, prefix] of [
  ["set-a", "loop-a"],
  ["set-b", "loop-b"],
])
  action(id, () => {
    const loc = locate(song(), engine().current());
    val(prefix).value = String(loc.index + 1);
    val(prefix === "loop-a" ? "loop-ab" : "loop-bb").value = String(
      Math.floor(loc.beat * 4) / 4 + 1,
    );
    playback.updateLoopBeatBounds();
  });
const addMarker = () => playback.mark();
action("add-marker", addMarker);
action("quick-add-marker", addMarker);
$("open-marker-dialog").onclick = null;
$("open-marker-dialog").removeAttribute("aria-haspopup");
function renderLists() {
  playback.renderLists();
}
function renderManagedLists() {
  const s = song();
  $("active-loop").textContent = player?.loop
    ? i18nText("main.message271", { value1: player.loop.name })
    : i18nText("main.message270");

  $("markers").innerHTML = s.markers
    .map(
      (m) =>
        '<span class="listitem"><button data-marker="' +
        String(esc(m.id)) +
        '">' +
        String(esc(m.name)) +
        " <small>" +
        String(time(m.time)) +
        '</small></button><button data-rename-marker="' +
        String(esc(m.id)) +
        '" aria-label="' +
        i18nText("main.message274") +
        '">✎</button><button data-delete-marker="' +
        String(esc(m.id)) +
        '" aria-label="' +
        i18nText("main.message275") +
        '">×</button></span>',
    )
    .join("");
  $("loops").innerHTML = s.loops
    .map(
      (l) =>
        '<span class="listitem ' +
        String(player?.loop?.id === l.id ? "active" : "") +
        '"><button data-loop="' +
        String(esc(l.id)) +
        '">' +
        String(esc(l.name)) +
        '</button><button data-rename-loop="' +
        String(esc(l.id)) +
        '" aria-label="' +
        i18nText("main.message276") +
        '">✎</button><button data-delete-loop="' +
        String(esc(l.id)) +
        '" aria-label="' +
        i18nText("main.message277") +
        '">×</button></span>',
    )
    .join("");
  paginateList("markers");
  paginateList("loops");
}

$("markers").onclick = (e) => {
  const t = e.target as HTMLElement;
  const b = t.closest("button") as HTMLButtonElement;
  if (!b) return;
  const s = song();
  if (b.dataset.marker) {
    const m = s.markers.find((m) => m.id === b.dataset.marker)!;
    seekFreely(m.time);
  }
  if (b.dataset.renameMarker) {
    const m = s.markers.find((m) => m.id === b.dataset.renameMarker)!;
    const n = prompt(i18nText("main.message145"), m.name);
    if (n?.trim()) m.name = n.trim();
  }
  if (b.dataset.deleteMarker)
    s.markers = s.markers.filter((m) => m.id !== b.dataset.deleteMarker);
  renderLists();
  queueSave();
};
$("loops").onclick = (e) => {
  const b = (e.target as HTMLElement).closest("button");
  if (!b) return;
  const s = song();
  if (b.dataset.loop) {
    playback.clearPreset();
    useLoop(s.loops.find((l) => l.id === b.dataset.loop));
  }
  if (b.dataset.renameLoop) {
    const l = s.loops.find((l) => l.id === b.dataset.renameLoop)!;
    const n = prompt(i18nText("main.message140"), l.name);
    if (n?.trim()) l.name = n.trim();
  }
  if (b.dataset.deleteLoop) {
    if (player?.loop?.id === b.dataset.deleteLoop) useLoop();
    s.loops = s.loops.filter((l) => l.id !== b.dataset.deleteLoop);
  }
  renderLists();
  queueSave();
};
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
async function openLibrary() {
  if (record) await persist();
  library = await allRecords();
  $("library-list").innerHTML = library.length
    ? library
        .map(
          (r, i) =>
            '<div class="panel song-card"><div class="song-card-heading"><button data-open="' +
            String(i) +
            '" class="song-card-title">' +
            String(esc(r.song.title)) +
            "</button><small>" +
            i18nText("main.message280", {
              value3: r.song.artist ? esc(r.song.artist) + " · " : "",
              value4: r.song.measures.length,
              value5: r.song.bpm,
            }) +
            '</small></div><div class="song-card-types" aria-label="' +
            i18nText("main.message281") +
            '">' +
            String(
              songScores(r)
                .map(
                  (score) =>
                    '<button class="score-type score-type-' +
                    String(score.format) +
                    '" data-open="' +
                    String(i) +
                    '" data-score="' +
                    String(score.format) +
                    '" aria-label="' +
                    i18nText("main.message278", {
                      value4: esc(r.song.title),
                      value5:
                        score.format === "pdf"
                          ? i18nText("term.PDF")
                          : i18nText("term.MusicXML"),
                    }) +
                    '">' +
                    String(
                      score.format === "pdf"
                        ? i18nText("term.PDF")
                        : i18nText("term.MusicXML"),
                    ) +
                    "</button>",
                )
                .join(""),
            ) +
            String(
              scoreAssets(r).lyrics
                ? '<button class="score-type score-type-lyrics" data-open="' +
                    String(i) +
                    '" data-lyrics="true">' +
                    i18nText("main.message279") +
                    "</button>"
                : "",
            ) +
            '<span class="asset-chip asset-audio' +
            (scoreAssets(r).audio ? "" : " asset-missing") +
            '">' +
            i18nText("main.message282") +
            '</span></div><div class="song-card-actions" ' +
            String(isPortable ? "hidden" : "") +
            '><button data-attach="' +
            String(i) +
            '" aria-label="' +
            i18nText("main.message283", { value10: esc(r.song.title) }) +
            '">' +
            i18nText("main.message284") +
            '</button><button data-delete="' +
            String(i) +
            '" class="danger">' +
            i18nText("main.message285") +
            "</button></div></div>",
        )
        .join("")
    : "<p>" + i18nText("main.message286") + "</p>";
  const backupLabel = document.querySelector("#library-backup-export small");
  if (backupLabel)
    backupLabel.textContent = i18nText("main.message287", {
      value1: library.length,
    });
  $<HTMLDialogElement>("library-dialog").showModal();
}
action("library-button", openLibrary);
action("welcome-library", openLibrary);
$("library-list").onclick = async (e) => {
  const b = (e.target as HTMLElement).closest("button");
  if (!b) return;
  try {
    if (b.dataset.open) {
      const selected = library[Number(b.dataset.open)];
      const target =
        b.dataset.score &&
        songScores(selected).find((s) => s.format === b.dataset.score);
      if (target && songScores(selected).length > 1)
        savePreferPDF(target.format === "pdf");
      await activate(target ? useScore(selected, target) : selected);
      $<HTMLDialogElement>("library-dialog").close();
      if (b.dataset.lyrics) {
        selectEditorPane("lyrics");
        await openEditor();
      }
    }
    if (b.dataset.attach) {
      await activate(library[Number(b.dataset.attach)]);
      $<HTMLDialogElement>("library-dialog").close();
      replaceDialog.showModal();
    }
    if (b.dataset.delete && confirm(i18nText("main.message288"))) {
      const deleting = library[Number(b.dataset.delete)].song.id;
      if (record?.song.id === deleting) {
        engine().pause();
        clearTimeout(saveTimer);
        record = undefined;
        for (const url of urls) URL.revokeObjectURL(url);
        urls = [];
        $("practice").hidden = true;
        $("welcome").hidden = false;
        $("song-title").textContent = i18nText("main.message097");
        document.title = i18nText("main.message097");
        $("original-tempo").hidden = true;
        $("edit-button").hidden = true;
        document.body.classList.remove("has-song");
        $("save-html").hidden = true;
        songControlsAvailable(false);
      }
      await deleteRecord(deleting);
      await refreshRecentScore();
      $<HTMLDialogElement>("library-dialog").close();
      await openLibrary();
    }
  } catch (e) {
    error(e);
  }
};
function openNew() {
  engine().pause();
  $<HTMLDialogElement>("library-dialog").close();
  $<HTMLDialogElement>("new-dialog").showModal();
}
action("new-button", openNew);
action("welcome-new", openNew);
async function refreshRecentScore() {
  if (isPortable) return;
  const recent = chooseRecent(await allRecords());
  $("demo-button").textContent = recent
    ? i18nText("main.message223", { value1: recent.song.title })
    : i18nText("main.message289");
}
action("demo-button", async () => {
  status(i18nText("main.message290"));
  const existing = chooseRecent(await allRecords());
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
async function openEditor() {
  if (!record || isPortable) return;
  scoreGestures.cancel();
  selected = locate(song(), engine().current()).index;
  selected = clamp(selected, 0, song().measures.length - 1);
  engine().pause();
  val("edit-title").value = song().title;
  val("edit-original-title").value = song().originalTitle || "";
  val("edit-lyricist").value = song().lyricist || "";
  val("edit-composer").value = song().composer || "";
  val("edit-artist").value = song().artist || "";
  val("edit-bpm").value = String(song().bpm);
  val("edit-first").value = String(song().firstBeat);
  $("editor-page").innerHTML = urls
    .map(
      (_, i) =>
        '<option value="' +
        String(i) +
        '">' +
        i18nText("main.message297", { value2: i + 1 }) +
        "</option>",
    )
    .join("");
  updateMeasureForm();
  renderLyricEditor(false);
  session?.begin();
  const editor = $<HTMLDialogElement>("editor-dialog");
  if (!editor.open) editor.showModal();
  await drawPage();
}
action("edit-button", () => {
  selectEditorPane("score");
  return openEditor();
});
action("metadata-button", () => {
  selectEditorPane("meta");
  return openEditor();
});
action("lyrics-button", () => {
  selectEditorPane("lyrics");
  return openEditor();
});
function updateMeasureForm() {
  const s = song();
  $("measure-select").innerHTML = s.measures
    .map(
      (m, i) =>
        '<option value="' +
        String(i) +
        '">' +
        i18nText("main.message299", { value2: i + 1, value3: esc(m.label) }) +
        "</option>",
    )
    .join("");
  val("measure-select").value = String(selected);
  const m = s.measures[selected];
  if (!m) return;
  const r = s.regions.find((r) => r.id === m.regionId)!;
  editorPage = r.page;
  val("editor-page").value = String(editorPage);
  val("measure-label").value = m.label;
  val("measure-beats").value = String(m.beats);
  val("measure-denominator").value = String(m.denominator);
  val("measure-start").value = m.start.toFixed(3);
  val("measure-end").value = m.end.toFixed(3);
  val("beat-xs").value = r.beatXs.join(",");
}
let crop: Omit<Region, "id" | "beatXs"> | undefined;
async function drawPage() {
  const c = $<HTMLCanvasElement>("edit-canvas");
  const img = new Image();
  img.src = urls[editorPage];
  await img.decode();
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const m = song().measures[selected],
    r =
      crop || (m ? song().regions.find((r) => r.id === m.regionId) : undefined);
  if (r && r.page === editorPage) {
    ctx.fillStyle = "#3f74d428";
    ctx.strokeStyle = "#3f74d4";
    ctx.lineWidth = 3;
    ctx.fillRect(r.x * c.width, r.y * c.height, r.w * c.width, r.h * c.height);
    ctx.strokeRect(
      r.x * c.width,
      r.y * c.height,
      r.w * c.width,
      r.h * c.height,
    );
  }
}
val("editor-page").onchange = () => {
  editorPage = num("editor-page");
  crop = undefined;
  void drawPage();
};
val("measure-select").onchange = () => {
  if (session?.active()) {
    try {
      flushEditorForm();
    } catch (e) {
      val("measure-select").value = String(selected);
      error(e);
      return;
    }
  }
  selected = num("measure-select");
  crop = undefined;
  updateMeasureForm();
  void drawPage();
  renderLyricEditor(lyricNear);
};
const canvas = $<HTMLCanvasElement>("edit-canvas");
const pointer = (e: PointerEvent) => {
  const r = canvas.getBoundingClientRect();
  return {
    x: clamp((e.clientX - r.left) / r.width, 0, 1),
    y: clamp((e.clientY - r.top) / r.height, 0, 1),
  };
};
canvas.onpointerdown = (e) => {
  drawStart = pointer(e);
  canvas.setPointerCapture(e.pointerId);
};
canvas.onpointerup = (e) => {
  if (!drawStart) return;
  const p = pointer(e);
  crop = {
    page: editorPage,
    x: Math.min(p.x, drawStart.x),
    y: Math.min(p.y, drawStart.y),
    w: Math.abs(p.x - drawStart.x),
    h: Math.abs(p.y - drawStart.y),
  };
  drawStart = undefined;
  if (crop.w < 0.01 || crop.h < 0.01) {
    crop = undefined;
    return;
  }
  void drawPage();
};
canvas.onpointercancel = () => (drawStart = undefined);
function edit(mut: (s: Song) => void) {
  const draft = structuredClone(song());
  mut(draft);
  const topology = (s: Song) =>
    JSON.stringify(s.measures.map((m) => [m.id, m.beats, m.denominator]));
  if (topology(draft) !== topology(song())) {
    if (record!.canonicalXML && hasDrumNotation(record!.canonicalXML))
      throw Error(i18nText("main.message300"));
    for (const l of draft.lyrics) delete l.grid;
  }
  if (draft.lyricGridEnabled) synchronizeLyricGrid(draft);
  migrateLyricPositions(draft);
  projectLyrics(draft);
  validateSong(draft);
  engine().pause();
  const canonicalXML = writeCanonical(draft, record!.canonicalXML);
  session?.before();
  record!.song = draft;
  record!.canonicalXML = canonicalXML;
  engine().song = draft;
  engine().loop = undefined;
  selected = clamp(selected, 0, Math.max(0, draft.measures.length - 1));
  updateMeasureForm();
  renderTrack();
  renderLists();
  queueSave();
  session?.changed();
  void drawPage();
}
action("add-region", () => {
  if (!crop) throw Error(i18nText("main.message301"));
  const c = crop;
  edit((s) => {
    const r = { ...c, id: uid(), beatXs: [] };
    s.regions.push(r);
    const start = s.measures.at(-1)?.end ?? s.firstBeat;
    s.measures.push({
      id: uid(),
      regionId: r.id,
      label: String(s.measures.length + 1),
      beats: 4,
      denominator: 4,
      start,
      end: start + 240 / s.bpm,
    });
    selected = s.measures.length - 1;
  });
  crop = undefined;
});
action("apply-crop", () => {
  if (!crop) throw Error(i18nText("main.message302"));
  const c = crop;
  edit((s) => {
    const m = s.measures[selected];
    if (!m) throw Error(i18nText("main.message303"));
    const r = s.regions.find((r) => r.id === m.regionId)!;
    Object.assign(r, c);
  });
  crop = undefined;
});
action("apply-measure", () =>
  edit((s) => {
    const m = s.measures[selected];
    if (!m) throw Error(i18nText("main.message304"));
    Object.assign(m, {
      label: val("measure-label").value,
      beats: num("measure-beats"),
      denominator: num("measure-denominator"),
      start: num("measure-start"),
      end: num("measure-end"),
    });
    const r = s.regions.find((r) => r.id === m.regionId)!;
    r.beatXs = val("beat-xs").value.trim()
      ? val("beat-xs").value.split(",").map(Number)
      : [];
    if (r.beatXs.length && r.beatXs.length !== m.beats + 1)
      throw Error(i18nText("main.message305", { value1: m.beats + 1 }));
  }),
);
action("reflow", () => {
  if (!confirm(i18nText("main.message176"))) return;
  edit((s) => {
    s.title = val("edit-title").value;
    s.artist = val("edit-artist").value;
    s.bpm = num("edit-bpm");
    s.firstBeat = num("edit-first");
    reflow(s);
  });
  updateSongHeading();
});
action("anchor-now", () => {
  const t = engine().current();
  edit((s) => {
    const m = s.measures[selected];
    const delta = t - m.start;
    if (selected && t <= s.measures[selected - 1].start)
      throw Error(i18nText("main.message307"));
    if (selected) s.measures[selected - 1].end = t;
    else s.firstBeat = t;
    for (let i = selected; i < s.measures.length; i++) {
      s.measures[i].start += delta;
      s.measures[i].end += delta;
    }
  });
});
action("preview-measure", async () => {
  engine().pause();
  engine().position = song().measures[selected].start;
  await engine().play(false);
});
action("editor-play", toggle);
action("duplicate", () =>
  edit((s) => {
    const m = s.measures[selected],
      r = s.regions.find((r) => r.id === m.regionId)!;
    const copy = { ...r, id: uid(), beatXs: [...r.beatXs] };
    s.regions.push(copy);
    s.measures.splice(selected + 1, 0, {
      ...m,
      id: uid(),
      regionId: copy.id,
      label: m.label + i18nText("main.message308"),
    });
    reflow(s);
    selected++;
  }),
);
action("split", () =>
  edit((s) => {
    const m = s.measures[selected],
      r = s.regions.find((r) => r.id === m.regionId)!;
    if (m.beats % 2) throw Error(i18nText("main.message309"));
    const right = { ...r, id: uid(), x: r.x + r.w / 2, w: r.w / 2, beatXs: [] };
    r.w /= 2;
    r.beatXs = [];
    s.regions.push(right);
    const end = m.end;
    m.end = (m.start + end) / 2;
    m.beats /= 2;
    s.measures.splice(selected + 1, 0, {
      ...m,
      id: uid(),
      regionId: right.id,
      label: m.label + "b",
      start: m.end,
      end,
    });
  }),
);
action("merge", () =>
  edit((s) => {
    const a = s.measures[selected],
      b = s.measures[selected + 1];
    if (!b) throw Error(i18nText("main.message310"));
    const r = s.regions.find((r) => r.id === a.regionId)!,
      z = s.regions.find((r) => r.id === b.regionId)!;
    if (
      r.page !== z.page ||
      Math.abs(r.y - z.y) > 0.025 ||
      a.denominator !== b.denominator
    )
      throw Error(i18nText("main.message311"));
    r.w = Math.max(r.x + r.w, z.x + z.w) - Math.min(r.x, z.x);
    r.x = Math.min(r.x, z.x);
    r.beatXs = [];
    a.beats += b.beats;
    a.end = b.end;
    s.measures.splice(selected + 1, 1);
  }),
);
for (const [id, d] of [
  ["move-left", -1],
  ["move-right", 1],
] as const)
  action(id, () =>
    edit((s) => {
      const j = selected + d;
      if (j < 0 || j >= s.measures.length) return;
      [s.measures[j], s.measures[selected]] = [
        s.measures[selected],
        s.measures[j],
      ];
      selected = j;
      reflow(s);
    }),
  );
action("remove-measure", () => {
  if (confirm(i18nText("main.message312")))
    edit((s) => {
      s.measures.splice(selected, 1);
      reflow(s);
    });
});
action("estimate-tempo", () => {
  const p = engine();
  if (!p.original) return;
  const a = estimateTempo(p.original.getChannelData(0), p.original.sampleRate);
  if (a.confidence < 0.08) {
    tell(i18nText("main.message313"));
    return;
  }
  val("edit-bpm").value = String(a.bpm);
  val("edit-first").value = String(a.firstBeat);
  $("tap-result").textContent = i18nText("main.message314", {
    value1: a.bpm,
    value2: a.firstBeat,
  });
});
let taps: number[] = [];
action("tap-tempo", () => {
  const now = performance.now();
  if (taps.length && now - taps.at(-1)! > 2500) taps = [];
  taps.push(now);
  taps = taps.slice(-9);
  if (taps.length > 2) {
    const bpm = 60_000 / ((taps.at(-1)! - taps[0]) / (taps.length - 1));
    val("edit-bpm").value = String(Math.round(clamp(bpm, 20, 300)));
    $("tap-result").textContent = i18nText("main.message315", {
      value1: Math.round(bpm),
    });
  }
});
let lyricPage = 0,
  lyricNear = false;
action("lyrics-prev", () => {
  lyricPage = Math.max(0, lyricPage - 1);
  renderLyricEditor(lyricNear, true);
});
action("lyrics-next", () => {
  lyricPage++;
  renderLyricEditor(lyricNear, true);
});
function lyricGridEditor(l: Song["lyrics"][number]) {
  const p = nearestQuarterBeat(song(), l.time),
    point = l.grid || { measureId: p.measure.id, tick: p.tick };
  const m = song().measures.find((m) => m.id === point.measureId)!;
  const measures = song()
    .measures.map(
      (x) =>
        '<option value="' +
        String(esc(x.id)) +
        '" ' +
        String(x.id === m.id ? "selected" : "") +
        ">" +
        i18nText("main.message316", { value3: esc(x.label) }) +
        "</option>",
    )
    .join("");
  const exact = Number.isInteger(point.tick)
    ? ""
    : '<option selected value="' +
      String(point.tick) +
      '">' +
      i18nText("main.message317", { value2: (point.tick / 4 + 1).toFixed(4) }) +
      "</option>";
  const ticks =
    exact +
    Array.from(
      { length: m.beats * 4 },
      (_, tick) =>
        '<option value="' +
        String(tick) +
        '" ' +
        String(tick === point.tick ? "selected" : "") +
        ">" +
        i18nText("main.message318", {
          value3: Math.floor(tick / 4) + 1,
          value4: ["", " + ¼", " + ½", " + ¾"][tick % 4],
        }) +
        "</option>",
    ).join("");
  return (
    '<div class="lyric-grid-controls"><select data-field="grid-measure" aria-label="' +
    i18nText("main.message319") +
    '">' +
    String(measures) +
    '</select><select data-field="grid-tick" aria-label="' +
    i18nText("main.message320") +
    '">' +
    String(ticks) +
    "</select></div>"
  );
}
function renderLyricEditor(near: boolean, keepPage = false) {
  if (!keepPage) lyricPage = 0;
  lyricNear = near;
  $("show-near").setAttribute("aria-pressed", String(near));
  $("show-all").setAttribute("aria-pressed", String(!near));
  const m = song().measures[selected];
  const list = song().lyrics.filter(
    (l) => !near || !m || (l.time >= m.start - 1 && l.time < m.end + 1),
  );
  const perPage = Math.max(
    2,
    Math.min(6, Math.floor((window.innerHeight - 370) / 62)),
  );
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  lyricPage = Math.min(lyricPage, pages - 1);
  $("lyrics-page").textContent = i18nText("main.message321", {
    value1: lyricPage + 1,
    pages: pages,
    value3: list.length,
  });
  $<HTMLButtonElement>("lyrics-prev").disabled = lyricPage === 0;
  $<HTMLButtonElement>("lyrics-next").disabled = lyricPage === pages - 1;
  $("lyric-editor").innerHTML = list
    .slice(lyricPage * perPage, (lyricPage + 1) * perPage)
    .map(
      (l) =>
        '<tr data-lyric="' +
        String(esc(l.id)) +
        '"><td><input data-field="text" value="' +
        String(esc(l.text)) +
        '" aria-label="' +
        i18nText("main.message279") +
        '"></td><td>' +
        String(lyricGridEditor(l)) +
        '</td><td><input data-field="duration-beats" type="number" min="0.0001" step="0.25" value="' +
        String(lyricDurationBeats(song(), l)) +
        '" aria-label="' +
        i18nText("main.message322") +
        '"></td><td><input data-field="confirmed" type="checkbox" ' +
        String(l.confirmed ? "checked" : "") +
        ' aria-label="' +
        i18nText("main.message232") +
        '"></td><td><button data-split-lyric="' +
        String(esc(l.id)) +
        '" title="' +
        i18nText("main.message323") +
        '">÷</button><button data-delete-lyric="' +
        String(esc(l.id)) +
        '" aria-label="' +
        i18nText("main.message324") +
        '">×</button></td></tr>',
    )
    .join("");
}
$("lyric-editor").onchange = (e) => {
  const input = e.target as HTMLInputElement;
  const id = input.closest<HTMLElement>("[data-lyric]")?.dataset.lyric;
  const field = input.dataset.field;
  if (!id || !field) return;
  try {
    edit((s) => {
      const l = s.lyrics.find((l) => l.id === id)!;
      if (field === "text") l.text = input.value;
      if (field === "grid-measure" || field === "grid-tick") {
        const point = l.grid || {
          measureId: nearestQuarterBeat(s, l.time).measure.id,
          tick: nearestQuarterBeat(s, l.time).tick,
        };
        const measureId =
          field === "grid-measure" ? input.value : point.measureId;
        const measure = s.measures.find((m) => m.id === measureId)!;
        setLyricGrid(s, l, {
          measureId,
          tick: Math.min(
            measure.beats * 4 - 1,
            field === "grid-tick" ? Number(input.value) : point.tick,
          ),
        });
      }
      if (field === "duration-beats") {
        const m = s.measures.find((m) => m.id === l.scorePosition!.measureId)!;
        l.scorePosition!.durationQuarters =
          (Number(input.value) * 4) / m.denominator;
      }
      if (field === "confirmed") l.confirmed = input.checked;
      s.lyrics.sort((a, b) => a.time - b.time);
    });
    renderLyricEditor(false);
  } catch (e) {
    error(e);
    renderLyricEditor(false);
  }
};
$("lyric-editor").onclick = (e) => {
  const b = (e.target as HTMLElement).closest("button");
  if (!b) return;
  try {
    edit((s) => {
      if (b.dataset.deleteLyric)
        s.lyrics = s.lyrics.filter((l) => l.id !== b.dataset.deleteLyric);
      if (b.dataset.splitLyric) {
        const i = s.lyrics.findIndex((l) => l.id === b.dataset.splitLyric),
          l = s.lyrics[i],
          letters = [...l.text.replace(/\s/g, "")];
        s.lyrics.splice(
          i,
          1,
          ...letters.map((text, n) => ({
            id: uid(),
            text,
            time: 0,
            end: 0,
            confirmed: false,
            scorePosition: {
              ...advanceLyricPosition(
                s,
                l.scorePosition!,
                (l.scorePosition!.durationQuarters * n) / letters.length,
              ),
              durationQuarters:
                l.scorePosition!.durationQuarters / letters.length,
            },
          })),
        );
      }
    });
    renderLyricEditor(false);
  } catch (e) {
    error(e);
  }
};
action("show-near", () => renderLyricEditor(true));
action("show-all", () => renderLyricEditor(false));
action("add-lyric", () => {
  const text = prompt(i18nText("main.message325"));
  if (!text) return;
  edit((s) => {
    const t = engine().current();
    s.lyrics.push({ id: uid(), text, time: t, end: t + 1, confirmed: false });
    s.lyrics.sort((a, b) => a.time - b.time);
  });
  renderLyricEditor(false);
});
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
// Each exported file boots its embedded song without a server or storage origin.
action("save-html", async () => {
  if (!record || busy) return;
  const button = $<HTMLButtonElement>("save-html");
  button.disabled = true;
  try {
    await persist();
    download(await portableBlob(), song().title + i18nText("main.message340"));
    status(i18nText("main.message341"));
  } finally {
    button.disabled = false;
  }
});

if (isPortable) {
  for (const id of ["new-button", "welcome-new", "demo-button"])
    $(id).hidden = true;
  // New PDF input and ZIP restoration belong to the authoring web app.
  val("restore").closest("label")!.hidden = true;
  $("portable-note").hidden = false;
  document.title = i18nText("main.message342");
  void (async () => {
    const packed = JSON.parse(
      document.getElementById("portable-data")!.textContent!,
    );
    if (!packed) throw Error(i18nText("main.message343"));
    const r = unpackSong(packed);
    await activate(r);
    document.title = r.song.title + i18nText("main.message344");
    status(i18nText("main.message345"));
  })().catch(error);
}

if (!isPortable) void refreshRecentScore().catch(error);

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
replaceButton.hidden = isPortable;
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
vocalButton.hidden = isPortable;
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
const editorFields = [
  "edit-artist",
  "edit-title",
  "edit-original-title",
  "edit-lyricist",
  "edit-composer",
  "edit-bpm",
  "edit-first",
  "measure-label",
  "measure-beats",
  "measure-denominator",
  "measure-start",
  "measure-end",
  "beat-xs",
];
function editorForm(): EditorForm {
  const fields = Object.fromEntries(
    editorFields.map((id) => [id, val(id).value]),
  );
  document
    .querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      "#lyric-editor [data-field]",
    )
    .forEach((el) => {
      const key = `lyric:${el.closest<HTMLElement>("[data-lyric]")!.dataset.lyric}:${el.dataset.field}`;
      fields[key] =
        el instanceof HTMLInputElement && el.type === "checkbox"
          ? String(el.checked)
          : el.value;
    });
  return { selected, fields };
}
function fillMetadata() {
  for (const [id, key] of [
    ["edit-title", "title"],
    ["edit-original-title", "originalTitle"],
    ["edit-artist", "artist"],
    ["edit-composer", "composer"],
    ["edit-lyricist", "lyricist"],
    ["edit-bpm", "bpm"],
    ["edit-first", "firstBeat"],
  ] as const)
    val(id).value = String(song()[key] ?? "");
}
function applySnapshot(s: EditSnapshot) {
  if (!record) return;
  record.song = structuredClone(s.song);
  record.canonicalXML = s.canonicalXML;
  engine().song = record.song;
  engine().loop = undefined;
  selected = clamp(selected, 0, s.song.measures.length - 1);
  fillMetadata();
  updateMeasureForm();
  renderLyricEditor(lyricNear);
  renderTrack();
  renderLists();
  updateSongHeading();
  void drawPage();
}
function restoreEditorForm(form: EditorForm) {
  selected = clamp(form.selected, 0, song().measures.length - 1);
  updateMeasureForm();
  renderLyricEditor(lyricNear);
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
function pendingEditorValues() {
  const current = editorForm(),
    m = song().measures[selected],
    region = song().regions.find((r) => r.id === m.regionId)!;
  const metadata = {
    title: current.fields["edit-title"].trim() || song().title,
    artist: current.fields["edit-artist"].trim(),
    originalTitle: current.fields["edit-original-title"].trim(),
    lyricist: current.fields["edit-lyricist"].trim(),
    composer: current.fields["edit-composer"].trim(),
  };
  const metaChanged = Object.entries(metadata).some(
    ([k, v]) => v !== String(song()[k as keyof Song] ?? ""),
  );
  const measureChanged =
    current.fields["measure-label"] !== m.label ||
    Number(current.fields["measure-beats"]) !== m.beats ||
    Number(current.fields["measure-denominator"]) !== m.denominator ||
    current.fields["measure-start"] !== m.start.toFixed(3) ||
    current.fields["measure-end"] !== m.end.toFixed(3) ||
    current.fields["beat-xs"] !== region.beatXs.join(",");
  const lyrics = song().lyrics.flatMap((l) => {
    const f = (key: string) => current.fields[`lyric:${l.id}:${key}`];
    if (f("text") === undefined) return [];
    const point = l.grid || {
      measureId: nearestQuarterBeat(song(), l.time).measure.id,
      tick: nearestQuarterBeat(song(), l.time).tick,
    };
    const values = {
      id: l.id,
      text: f("text"),
      measureId: f("grid-measure"),
      tick: Number(f("grid-tick")),
      duration: Number(f("duration-beats")),
      confirmed: f("confirmed") === "true",
    };
    return values.text !== l.text ||
      values.measureId !== point.measureId ||
      values.tick !== point.tick ||
      values.duration !== lyricDurationBeats(song(), l) ||
      values.confirmed !== !!l.confirmed
      ? [values]
      : [];
  });
  const tempoChanged =
    Number(current.fields["edit-bpm"]) !== song().bpm ||
    Number(current.fields["edit-first"]) !== song().firstBeat;
  return {
    current,
    metadata,
    metaChanged,
    measureChanged,
    lyrics,
    tempoChanged,
  };
}
function flushEditorForm() {
  const {
    current,
    metadata,
    metaChanged,
    measureChanged,
    lyrics,
    tempoChanged,
  } = pendingEditorValues();
  if (tempoChanged) throw Error(i18nText("main.message366"));
  if (!metaChanged && !measureChanged && !lyrics.length) return;
  edit((s) => {
    Object.assign(s, metadata);
    if (measureChanged) {
      Object.assign(s.measures[selected], {
        label: current.fields["measure-label"],
        beats: Number(current.fields["measure-beats"]),
        denominator: Number(current.fields["measure-denominator"]),
        start: Number(current.fields["measure-start"]),
        end: Number(current.fields["measure-end"]),
      });
      const r = s.regions.find((r) => r.id === s.measures[selected].regionId)!;
      r.beatXs = current.fields["beat-xs"].trim()
        ? current.fields["beat-xs"].split(",").map(Number)
        : [];
      if (r.beatXs.length && r.beatXs.length !== s.measures[selected].beats + 1)
        throw Error(i18nText("main.message367"));
    }
    for (const v of lyrics) {
      const l = s.lyrics.find((l) => l.id === v.id)!;
      l.text = v.text;
      l.confirmed = v.confirmed;
      const m = s.measures.find((m) => m.id === v.measureId);
      if (!m) throw Error(i18nText("main.message368"));
      setLyricGrid(s, l, {
        measureId: m.id,
        tick: Math.min(m.beats * 4 - 1, v.tick),
      });
      l.scorePosition!.durationQuarters = (v.duration * 4) / m.denominator;
    }
  });
  renderLyricEditor(false);
  updateSongHeading();
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
let playbackExportPending = false;
async function portableBlob() {
  if (!record) throw Error(i18nText("main.message218"));
  if (playbackExportPending) throw Error(i18nText("main.message369"));
  playbackExportPending = true;
  try {
    const snapshot = {
      ...record,
      song: {
        ...record.song,
        loops:
          engine().loop || playback.lastLoop
            ? [(engine().loop || playback.lastLoop)!]
            : record.song.loops,
      },
    };
    const data = await packCombinedPlayback(snapshot, {
      ...readPlaybackPreferences(),
      fullscreen: autoFullscreenEnabled(),
      highlight: readNoteHighlight(),
    });
    const response = await fetch(
      `${import.meta.env.BASE_URL}portable-template.html`,
    );
    if (!response.ok) throw Error(i18nText("main.message370"));
    const doc = new DOMParser().parseFromString(
      await response.text(),
      "text/html",
    );
    return new Blob([makePlaybackHTML(shellFromDocument(doc), data)], {
      type: "text/html;charset=utf-8",
    });
  } finally {
    playbackExportPending = false;
  }
}
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
      if (k === "html")
        files.push({ name: title + ".html", blob: await portableBlob() });
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
