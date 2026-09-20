import { preferPDF, savePreferPDF, scorePreference } from "./score-preference";
import { readPlaybackPreferences, savePlaybackPreferences } from "./playback-preferences";
import { centeredRange, loopMeasureRange, scrubTime } from "./practice-controls";
import { autoFullscreenEnabled, saveAutoFullscreen, enterFullscreen } from "./fullscreen";
import { attachScoreGestures } from "./score-gestures";
import { bindNumericDrag, installNumericInputs } from "./numeric-drag";
import { measurePageStaff, practiceStaffLayout, practicePage, type StaffPosition } from "./practice-staff-layout";
import { correctStoredRests, ensureCenteredRestCache } from "./score-rest-correction";
import { attachBundledScore } from "./bundled-score";
import { ScoreReview, reviewPair, copyReviewImage } from "./score-review";
import { displayPage, SVG_GZIP, pageExtension } from "./score-pages";
import { importedCanonical, hasDrumNotation, ensureCanonical, saveCanonical, verifyCanonicalAudio, vocalLyrics, withVocalSource, readCanonical, writeCanonical } from "./canonical-xml";
import { advanceLyricPosition, migrateLyricPositions, projectLyrics, lyricDurationBeats } from "./lyric-score";
import { activeScore, songScores, useScore } from "./song-scores";
import { scoreFormat, scoreArchivePath, applyXMLTiming, replaceWithMusicXML } from "./score-import";
import { applyListeningFeedbackM48 } from './lyric-feedback-m48';
import { applyListeningFeedbackM39 } from './lyric-feedback-m39';
import { applyBar34AcousticReview } from './lyric-bar34-review';
import { applyListeningFeedbackM36 } from './lyric-feedback-m36';
import { applyListeningFeedbackM32 } from './lyric-feedback-m32';
import { applyListeningFeedbackFollowup } from './lyric-feedback-followup';
import { applyListeningFeedbackBatch } from './lyric-feedback-batch';
import { applyTookuTailShift } from "./lyric-tail-shift";
import { lyricMeasureId, enableLyricGrid, synchronizeLyricGrid, nearestQuarterBeat, setLyricGrid } from "./lyric-grid";
import { applyListeningRevision } from "./listening-revision";
import { applyEnglishLyrics, correctBrightSpelling } from "./english-lyrics";
import { applyJapaneseReadings } from "./lyric-reading";
import { applyLyricRevision } from "./lyric-revision";
import { playbackPosition, copyPosition } from "./playback-position";
import "./style.css";
import lyricTimingRefinement from "./lyric-timing-refinement";
import { applyLyricTimingPatch, applyUserLyricAnchors } from "./lyric-timing";
import { chooseRecent, rememberScore } from "./recent-score";
import { displayRegion } from "./score-view";
import { arrangeIcons, iconButton } from "./icons";
import { arrangeWorkspace, selectEditorPane, paginateList, openSettingsChild, updateViewWidth } from "./workspace";
import { Player } from "./audio";
import {
  allRecords,
  saveRecord,
  deleteRecord,
  type RecordData,
} from "./storage";
const renderPDF: typeof import("./pdf").renderPDF = async (...args) =>
  (await import("./pdf")).renderPDF(...args);
const xmlModule = () => import('./musicxml');
async function renderScore(blob:Blob, format:Song['scoreFormat'], partId?:string):Promise<{pages:Blob[];regions:Region[];parsed?:import('./musicxml').XMLScore}> {
  return format==='musicxml' ? (await xmlModule()).renderMusicXML(blob,status,partId) : renderPDF(blob,status);
}

import {
  defaults,
  uid,
  clamp,
  locate,
  beatTime,
  reflow,
  xAtBeat,
  continuousX,
  validateSong,
  type Song,
  type Region,
  type Measure,
  type Loop,
} from "./model";
import JSZip from "jszip";
import {
  isPortable,
  packSong,
  packScores,
  unpackScores,
  unpackSong,
  makePortableHTML,
  shellFromDocument,
} from "./portable";
import { estimateTempo } from "./analysis";
import { packLabels } from "./lyric-layout";
import { mediaIdentity, verifyMedia, type MediaIdentity } from "./media";
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const esc = (x: unknown) =>
  String(x).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
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
let selected = 0,
  editorPage = 0,
  drawStart: { x: number; y: number } | undefined;
let saveTimer = 0,
  busy = false,
  rowWindow = -1;
let editingLoopId: string | undefined;
let repeatCenter: number | undefined, repeatRadius: number | undefined;
let lastPracticeLoop: Loop | undefined;
let pageRatios: number[] = [];
let practiceStaffs = new Map<string, StaffPosition>();
let trackOffsets: number[] = [],
  trackWidths: number[] = [];
const app = $("app");
app.innerHTML = `
<header><div class="brand"><div class="logo" aria-hidden="true">♩</div><div><h1>드럼 연습실</h1><small id="song-title">악보를 따라, 나의 속도로</small></div></div><div class="actions"><button id="library-button">내 악보 목록</button><button id="save-html" hidden>HTML 한 파일로 저장</button><button id="edit-button" hidden>악보·가사 맞추기</button></div></header>
<main><section class="welcome" id="welcome"><span class="tag">PDF / MusicXML · 음악 · 가사</span><h2>드럼 연습실</h2><p class="welcome-lead">다음 마디를 미리 보고, 어려운 부분은 천천히.</p><p>움직이는 악보와 바로 아래 가사를 한눈에 보세요.<br>연습할 구간을 정하고, 나에게 맞는 속도로 반복합니다.</p><div class="actions"><button class="primary" id="demo-button">바람과 언덕의 발라드 열기</button><button id="welcome-library">내 악보 목록</button><button id="welcome-new">＋ 악보 추가</button></div><p class="subtle">파일과 연습 기록은 이 브라우저에 저장됩니다. 다른 기기로 옮기거나 보관하려면 백업을 내보내세요.</p></section>
<div id="busy" role="status" aria-live="polite"></div><p id="portable-note" class="subtle" hidden>한 곡 파일 · 변경 사항은 이 화면에서만 유지됩니다. 보관하려면 “HTML 한 파일로 저장”을 눌러 새 파일로 저장하세요.</p>
<section id="practice" hidden><div class="statusline"><div class="flex"><select id="view" aria-label="악보 표시 방식"><option value="ribbon">한 줄로 이어 보기</option><option value="rows">두줄로 고정 보기</option><option value="compare">PDF · MusicXML 검수</option></select><button id="original-button">원본 보기</button></div></div>
<div id="review-tools" hidden><span id="review-message">스페이스: 정지·캡처 복사 / 다시 누르면 재생</span><button id="review-copy">정지·캡처 복사</button><button id="review-save" hidden>캡처 저장</button></div><div class="stage" id="stage"><canvas id="review-canvas" hidden aria-label="위 PDF, 아래 MusicXML 같은 마디 비교"></canvas><div class="ribbon" id="ribbon"></div><div class="playhead"></div><div id="playhead-status"><span id="playhead-bar"></span><strong id="playhead-beat"></strong><small id="playhead-signature"></small></div></div>
<div class="seekrow"><span id="elapsed">0:00</span><input id="seek" aria-label="곡 위치" type="range" min="0" max="300" step="0.01" value="0"><span id="duration">0:00</span></div>
<div class="transport"><div class="flex transport-left"><button id="home" aria-label="처음으로">↤</button><label><select id="goto" aria-label="되감을 마디 수">${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("")}</select></label><button id="jump">앞으로</button><button id="copy-position" title="현재 마디와 위치 복사" aria-label="현재 마디와 위치 복사">위치 복사</button></div><button id="play" class="primary play">▶ 재생</button><div class="flex transport-right"><button id="tempo-presets" aria-haspopup="dialog">BPM</button><button id="slower" aria-label="5 BPM 느리게">−5</button><input id="rate" type="text" inputmode="none" readonly value="94" role="slider" aria-label="재생 BPM: 좌우 드래그로 조절, 두 번 탭하면 원곡 BPM" aria-orientation="horizontal" title="좌우 드래그: 1 BPM씩 조절 · 두 번 탭: 원곡 BPM"><button id="faster" aria-label="5 BPM 빠르게">+5</button><label><input id="click" type="checkbox" checked>클릭</label></div></div>
<details><summary>소리·악보 크기</summary><div class="flex panel"><label>음악 <input id="music-volume" type="range" min="0" max="1" step="0.01"></label><label>클릭 <input id="click-volume" type="range" min="0" max="1" step="0.01"></label><label>악보 크기 <input id="zoom" type="range" min="0.5" max="2" step="0.05"></label></div></details>
<div class="panels"><section class="panel"><h2>구간 반복</h2><div class="flex"><label>시작 마디 <input id="loop-a" type="number" min="1" value="25"></label><label>박 <input id="loop-ab" type="number" min="1" step="0.25" value="1"></label><button id="set-a">현재 위치 A</button></div><div class="flex"><label>끝 마디 <input id="loop-b" type="number" min="1" value="29"></label><label>박 <input id="loop-bb" type="number" min="1" step="0.25" value="1"></label><button id="set-b">현재 위치 B</button></div><p class="subtle">끝 지점의 첫 음은 포함하지 않습니다. 25~28마디 반복은 끝을 29마디 1박으로 설정하세요.</p><div class="flex"><input id="loop-name" type="text" placeholder="예: 후렴 4마디" aria-label="반복 이름"><button id="save-loop">저장·반복</button><button id="new-loop">새 구간</button><button id="stop-loop">반복 끄기</button></div><div class="list" id="loops"></div></section><section class="panel"><h2>마커</h2><div class="flex"><input id="marker-name" type="text" placeholder="예: 어려운 필인" aria-label="마커 이름"><button id="add-marker">현재 위치 표시</button></div><div id="markers" class="list"></div><details><summary>백업·복원</summary><p class="subtle">백업에는 정렬·가사·연습 설정이 들어갑니다. 미디어를 포함하면 다른 기기에서도 바로 열 수 있습니다.</p><label><input id="include-media" type="checkbox" checked>악보·음원 포함</label><div class="flex"><button id="export">백업 내보내기</button><label>가져오기 <input id="restore" type="file" accept=".zip"></label></div></details></section></div><p class="keyboard">스페이스: 재생/정지 · ←/→: 이전/다음 마디 · M: 마커 추가</p><p class="subtle" id="alignment-note">가사와 박 위치는 자동 추정 자료를 포함합니다. 어긋나는 곳은 ‘악보·가사 맞추기’에서 수정하세요.</p></section></main>
<dialog id="library-dialog"><div class="dialoghead"><h2>내 악보 목록</h2><button id="new-button">＋ 곡 추가</button><button data-close="library-dialog">닫기</button></div><div id="library-list"></div></dialog>
<dialog id="new-dialog"><div class="dialoghead"><h2>새 곡 준비</h2><button data-close="new-dialog">닫기</button></div><p>PDF 또는 MusicXML과 음악을 골라 주세요. MusicXML은 마디·박자·템포를 자동으로 읽습니다.</p><form id="new-form"><p><label>가수 <input id="new-artist" type="text"></label><label>제목 <input id="new-title" required type="text" value="새 연습곡"></label></p><p><label>악보 <input id="pdf-file" required type="file" accept="application/pdf,.pdf,.musicxml,.xml,.mxl"></label></p><p id="xml-part-row" hidden><label>악기 파트 <select id="xml-part"></select></label><span class="subtle">박자표는 MusicXML 값을 사용합니다. 선택한 단일 오선 파트를 가져옵니다.</span></p><p><label>음원 <input id="audio-file" required type="file" accept="audio/*,.mp3"></label></p><p><label>BPM <input id="new-bpm" type="number" min="20" max="300" value="94" required></label><label>첫 박(초) <input id="new-first" type="number" min="0" step="0.001" value="0" required></label><label>박자 <input id="new-beats" type="number" min="1" max="16" value="4" required>/ <select id="new-denominator"><option>4</option><option>8</option><option>2</option><option>16</option></select></label></p><p><label>한글 발음 가사 — 한 줄에 한 구절</label><textarea id="new-lyrics" placeholder="스베테오 테니 이레테\n스베테오 우시낫테"></textarea></p><p class="subtle">가사 초기 위치는 임시 분배입니다. 노래를 들으며 실제 시작 마디·박을 맞춰 주세요.</p><button type="submit" class="primary">곡 만들기</button></form></dialog>
<dialog id="editor-dialog"><div class="dialoghead"><h2>악보·가사 맞추기</h2><button data-close="editor-dialog">연습으로 돌아가기</button></div><div class="flex"><label>가수 <input id="edit-artist" type="text"></label><label>표시 제목 <input id="edit-title" type="text"></label><label>원제 <input id="edit-original-title" type="text"></label><label>작사 <input id="edit-lyricist" type="text"></label><label>작곡 <input id="edit-composer" type="text"></label><label>BPM <input id="edit-bpm" type="number" min="20" max="300"></label><label>첫 박(초) <input id="edit-first" type="number" min="0" step="0.001"></label><button id="reflow">이 템포로 전체 다시 맞추기</button><button id="estimate-tempo">음원 템포 추정</button><button id="tap-tempo">박자 탭</button><span id="tap-result"></span></div><p class="subtle">전체 다시 맞추기는 기존 시간 보정을 바꿉니다. 실행 전 백업을 권합니다. 가사는 악보 위치를 유지하며 음원과의 연결만 바뀝니다.</p><div class="editor"><section><div class="flex"><label>페이지 <select id="editor-page"></select></label><label>마디 <select id="measure-select"></select></label></div><p class="subtle">원본 위를 드래그하여 마디 영역을 지정한 후 추가하거나 선택한 마디에 적용하세요.</p><div class="pagebox"><canvas id="edit-canvas"></canvas></div><div class="flex"><button id="add-region">새 마디 추가</button><button id="apply-crop">선택 마디에 영역 적용</button></div></section><section><h3>선택한 마디</h3><div class="flex"><label>이름 <input id="measure-label" type="text" style="width:95px"></label><label>박 수 <input id="measure-beats" type="number" min="1" max="16"></label><label>분모 <select id="measure-denominator"><option>4</option><option>8</option><option>2</option><option>16</option></select></label></div><div class="flex"><label>시작 초 <input id="measure-start" type="number" min="0" step="0.001"></label><label>끝 초 <input id="measure-end" type="number" min="0" step="0.001"></label><button id="apply-measure">마디 저장</button></div><label>내부 박 위치(0~1, 쉼표 구분)<input id="beat-xs" type="text" placeholder="0,0.25,0.5,0.75,1" style="width:100%"></label><p class="subtle">마디 시작부터 끝까지 박 경계의 가로 위치입니다. 비우면 균등 간격을 사용합니다.</p><div class="flex"><button id="preview-measure">이 마디 듣기</button><button id="anchor-now">현재 음악 위치를 첫 박으로</button><button id="editor-play">재생/정지</button><span id="editor-time"></span></div><div class="flex"><button id="duplicate">뒤에 복제</button><button id="split">반으로 분할</button><button id="merge">다음과 합치기</button><button id="move-left">앞으로</button><button id="move-right">뒤로</button><button id="remove-measure" class="danger">마디 삭제</button></div><h3>가사 리듬</h3><p class="subtle">시작 마디·박과 길이를 지정합니다. 보컬 악보의 세부 음가도 보존합니다. 가사 위치는 음원 시각과 독립적으로 MusicXML에 저장됩니다.</p><div class="flex"><button id="add-lyric">현재 위치에 가사 추가</button><button id="show-near">현재 마디 가사</button><button id="show-all">전체 가사</button></div><div class="scroll"><table><thead><tr><th>발음</th><th>시작 · ¼박</th><th>길이(박)</th><th>확인</th><th></th></tr></thead><tbody id="lyric-editor"></tbody></table></div></section></div></dialog>
<dialog id="original-dialog"><div class="dialoghead"><h2>원본 악보</h2><button data-close="original-dialog">닫기</button></div><div id="page-original"></div></dialog><button id="error-notice" class="error-notice" hidden type="button"><strong>알림</strong><span id="error-message" role="alert"></span><span aria-hidden="true">×</span></button>`;
document.getElementById("app")!.insertAdjacentHTML("beforeend", '<dialog id="tempo-dialog" aria-labelledby="tempo-heading"><div class="dialoghead"><h2 id="tempo-heading">연습 BPM</h2><button data-close="tempo-dialog">닫기</button></div><div id="tempo-options"></div><p class="subtle">숫자를 좌우로 드래그하면 1 BPM씩 조절하고, 두 번 탭하면 원곡 BPM으로 돌아갑니다.</p></dialog>');
arrangeWorkspace();
arrangeIcons();
function songControlsAvailable(enabled: boolean) {
  val("click").closest("label")!.hidden = !enabled;
  for (const id of ['click','zoom','original-button','edit-button','lyrics-button','metadata-button','export','save-html','review-add-score'])
    ($<HTMLButtonElement>(id)).disabled = !enabled;
  syncViewChoices();
}
songControlsAvailable(false);
function updateSongHeading() {
  const s = song();
  $("song-title").textContent = [s.artist, s.title].filter(Boolean).join(" - ");
  $("original-tempo").hidden = false;
  $("original-tempo-value").textContent = `= ${Number((s.bpm * s.settings.rate).toFixed(2))}`;
  $("original-tempo").setAttribute("aria-label", `연습 BPM ${Number((s.bpm * s.settings.rate).toFixed(2))} 설정`);
  $("original-tempo").title = "연습 BPM 설정";
  ($("original-tempo") as HTMLButtonElement).disabled = false;
  document.title = $("song-title").textContent!;
}
function tell(s: string) {
  status(s);
}
$("error-notice").onclick = () => { $("error-notice").hidden = true; };
for (const dialog of document.querySelectorAll("dialog")) {
  dialog.addEventListener("close", () => {
    const notice = $("error-notice");
    if (dialog.contains(notice)) {
      ($("practice").hidden ? document.querySelector("main")! : document.querySelector(".statusline")!).append(notice);
    }
  });
}

const workLog: { message: string; time: string }[] = [];
function status(s: string) {
  if (!s || workLog[0]?.message === s) return;
  workLog.unshift({ message: s, time: new Date().toLocaleTimeString("ko-KR", { hour12: false }) });
  workLog.length = Math.min(workLog.length, 5);
  $("busy").textContent = workLog.map(entry => `${entry.time}  ${entry.message}`).join("\n");
}
function error(e: unknown) {
  console.error(e);
  const message = e instanceof Error ? e.message : String(e);
  status(`오류: ${message}`);
  const notice = $("error-notice");
  const host = document.querySelector<HTMLDialogElement>("dialog[open] .dialoghead") ||
    ($("practice").hidden ? document.querySelector("main")! : document.querySelector(".statusline")!);
  host.append(notice);
  $("error-message").textContent = message;
  notice.setAttribute("aria-label", `알림: ${message}. 누르면 닫기`);
  notice.title = `${message} · 누르면 닫기`;
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
    player = new Player();
    player.onprogress = status;
    player.onstate = () => {
      $("stage").classList.toggle("is-playing", !!player?.playing);
      iconButton("play", player?.playing ? "pause" : "play", player?.playing ? "일시정지" : "재생");
      if (!player?.playing && record) {
        record.song.settings.position = player?.position || 0;
        queueSave();
      }
    };
  }
  return player;
}
async function persist() {
  if (!record) return;
  await ensureCanonical(record);
  saveCanonical(record);
  await saveRecord(record);
  status(
    isPortable
      ? "변경 내용을 보관하려면 HTML을 다시 저장하세요."
      : "기기에 저장됨",
  );
}
function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(
    () =>
      persist().catch((e) => {
        status("저장 실패 — 백업을 내보내세요.");
        error(e);
      }),
    400,
  );
}
function song() {
  if (!record) throw Error("곡을 먼저 여세요.");
  return record.song;
}
async function activate(r: RecordData) {
  scoreGestures.cancel();
  if (autoFullscreenEnabled() && !document.fullscreenElement) requestScoreFullscreen();
  repeatCenter = repeatRadius = undefined;
  lastPracticeLoop = undefined;
  validateSong(r.song);
  if (r.canonicalXML) {await verifyCanonicalAudio(r);readCanonical(r.canonicalXML,r.song);}
  else {
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
    if(!isPortable){r=await attachBundledScore(r,status);r=await correctStoredRests(r,status);r=await ensureCenteredRestCache(r,status);}
    const preferred = scorePreference(r).format;
    if (preferred !== (r.song.scoreFormat ?? 'pdf')) r = useScore(r, songScores(r).find(s => s.format === preferred)!);
    if (!isPortable && r.song.scoreFormat === 'musicxml' && r.pages.some(p => p.type !== SVG_GZIP)) {
      const rendered = await renderScore(r.pdf, 'musicxml', r.song.scorePartId);
      if (!rendered.parsed) throw Error('MusicXML 렌더링 결과가 없습니다.');
      replaceWithMusicXML(r.song, { ...rendered, parsed: rendered.parsed }, r.song.pdfName);
      if (rendered.pages.length !== r.song.pageCount) throw Error('기존 악보와 페이지 수가 달라 자동 갱신할 수 없습니다.');
      // Same OSMD layout: keep normalized crops and any user beat-position edits.
      r = { ...r, pages: rendered.pages };
    }
    engine().pause();
    clearTimeout(saveTimer);
    if (record) await saveRecord(record);
    for (const u of urls) URL.revokeObjectURL(u);
    record = r;
    if (r.song.id === "real-paradis" && !r.song.artist)
      r.song.artist = "Real Paradis";
    document.body.classList.add("has-song");
    editingLoopId = undefined;
    $("save-loop").textContent = "저장·반복";
    // Materialize persisted blobs before image decoding; Safari may not load
    // an object URL backed directly by an IndexedDB blob after a reload.
    urls = await Promise.all(r.pages.map(async (b) =>
      URL.createObjectURL(await practicePage(b)),
    ));
    practiceStaffs.clear();
    pageRatios = await Promise.all(
      urls.map(async (u, index) => {
        const img = new Image();
        img.src = u;
        try {
          await img.decode();
        } catch (cause) {
          throw new Error(`악보 ${index + 1}쪽을 불러오지 못했습니다: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
        }
        if (r.song.scoreFormat === "musicxml")
          for (const [id, staff] of measurePageStaff(img, r.song.regions.filter(region => region.page === index))) practiceStaffs.set(id, staff);
        return img.naturalHeight / img.naturalWidth;
      }),
    );
    try {
      await engine().load(r.audio, r.song);
    } catch (cause) {
      throw new Error(`음원을 불러오지 못했습니다: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
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
    for (const id of ["loop-a", "loop-b"]) val(id).max = String(song().measures.length);
    renderTrack();
    renderLists();
    await persist();
    if (!isPortable) {
      rememberScore(r.song.id);
      $("demo-button").textContent = `${r.song.title} 열기`;
    }
    status("");
  } finally {
    busy = false;
  }
}
function syncViewChoices() {
  updateViewWidth();
  const view=record ? song().settings.view : val('view').value;
  $('view-description').textContent = view === 'compare' ? '위쪽 PDF · 아래쪽 SVG로 같은 마디를 비교합니다.' : view === 'rows' ? '두 줄의 악보를 고정하고 재생 위치를 표시합니다.' : '진행선에 맞춰 악보가 옆으로 이어집니다.';
  if(!record){
    $('review-help').hidden=true;
    $('review-add-score').hidden=true;
    $('review-availability').textContent='';
    ($('view') as HTMLSelectElement).querySelector<HTMLOptionElement>('option[value="compare"]')!.disabled=true;
    $('pdf-view-row').hidden=false;
    val('prefer-pdf').checked=preferPDF(); val('prefer-pdf').disabled=true;
    $('pdf-view-status').textContent='모든 곡에 공통으로 적용합니다.';
    val('zoom').closest('label')!.hidden=view!=='ribbon';
    return;
  }
  const formats=songScores(record).map(s=>s.format);
  const missing=['pdf','musicxml'].filter(f=>!formats.includes(f as 'pdf'|'musicxml'));
  const compare = song().settings.view === 'compare';
  ($('view') as HTMLSelectElement).querySelector<HTMLOptionElement>('option[value="compare"]')!.disabled = missing.length > 0;
  const preference = scorePreference(record);
  val('prefer-pdf').checked = preference.checked;
  val('prefer-pdf').disabled = preference.disabled;
  $('pdf-view-status').textContent = preference.message;
  $('pdf-view-row').hidden = compare;
  $('review-help').hidden = !compare;

  $('review-availability').textContent=missing.length
    ? `검수하려면 이 곡에 ${missing.map(f=>f==='pdf'?'PDF':'MusicXML').join('와 ')} 악보를 추가해 주세요. 현재 저장된 악보: ${formats.map(f=>f==='pdf'?'PDF':'MusicXML').join(', ')}.${isPortable?' 웹앱에서 추가한 뒤 HTML을 다시 저장하세요.':''}`
    : '';
  $('review-add-score').hidden=isPortable || !missing.length;
}
// Prepare geometry before swapping it, leaving audio and loop scheduling intact.
val('prefer-pdf').onchange = async () => {
  if (!record || busy) { if (record) syncViewChoices(); return; }
  const original = record;
  const wanted = val('prefer-pdf').checked;
  if (scorePreference(original).disabled) { syncViewChoices(); return; }
  busy = true;
  val('prefer-pdf').disabled = true;
  const nextUrls: string[] = [];
  try {
    const target = songScores(original).find(s => s.format === (wanted ? 'pdf' : 'musicxml'))!;
    const next = useScore(original, target);
    const staffs = new Map<string, StaffPosition>();
    const ratios: number[] = [];
    for (const [index, page] of next.pages.entries()) {
      const url = URL.createObjectURL(await practicePage(page)); nextUrls.push(url);
      const img = new Image(); img.src = url; await img.decode();
      ratios.push(img.naturalHeight / img.naturalWidth);
      if (target.format === 'musicxml')
        for (const [id, staff] of measurePageStaff(img, next.song.regions.filter(r => r.page === index))) staffs.set(id, staff);
    }
    if (record !== original) throw Error('곡이 바뀌었습니다. 다시 선택해 주세요.');
    // Settings may have changed while the images decoded; retain the latest values.
    next.song.settings = original.song.settings;
    for (const url of urls) URL.revokeObjectURL(url);
    urls = nextUrls; pageRatios = ratios;
    practiceStaffs.clear(); for (const [id, staff] of staffs) practiceStaffs.set(id, staff);
    record = next; engine().song = next.song;
    savePreferPDF(wanted);
    renderTrack(); queueSave();
  } catch (e) { for (const url of nextUrls) if (!urls.includes(url)) URL.revokeObjectURL(url); error(e); }
  finally { busy = false; syncViewChoices(); }
};
function syncSettings() {
  syncViewChoices();
  const s = song().settings;
  updateSongHeading();
  val("rate").value = String(Number((s.rate * song().bpm).toFixed(2)));
  val("rate").min = String(Math.ceil(song().bpm * 0.5));
  val("rate").max = String(Math.floor(song().bpm * 1.2));
  val("rate").setAttribute("aria-valuenow", val("rate").value);
  val("rate").setAttribute("aria-valuemin", val("rate").min);
  val("rate").setAttribute("aria-valuemax", val("rate").max);
  val("click").checked = s.click;
  val("music-volume").value = String(s.musicVolume);
  val("click-volume").value = String(s.clickVolume);
  val("zoom").value = String(s.zoom);
  val("view").value = s.view;
  updateViewWidth();
  document.querySelectorAll<HTMLButtonElement>('[data-tempo]').forEach(b => {
    const selected = Math.abs(Number(b.dataset.tempo) - s.rate * song().bpm) < .01;
    b.classList.toggle('primary', selected); b.setAttribute('aria-pressed', String(selected));
  });
  engine().volumes();
}
function practiceRegion(s:Song,region:Region) {
  return displayRegion(s,region);
}
function xmlPracticeLayout(s: Song, r: Region, width: number) {
  const staff = practiceStaffs.get(r.id);
  if (s.scoreFormat !== 'musicxml' || s.settings.view !== 'rows' || !staff) return undefined;
  const style = getComputedStyle($('ribbon'));
  const budget = ($('stage').clientHeight - (parseFloat(style.top) || 24) - (parseFloat(style.rowGap) || 54) - 24) / 2 - 24;
  return practiceStaffLayout(r, staff, width, budget);
}
function widthOf(m: Measure) {
  const r = practiceRegion(song(), song().regions.find((r) => r.id === m.regionId)!);
  return (
    (clamp($("stage").clientWidth * 0.245, 170, 340) *
      song().settings.zoom *
      (r.w / r.h / (pageRatios[r.page] || 1.294))) /
    2
  );
}
function measureHTML(m: Measure, i: number, width: number) {
  const s = song(),
    r = practiceRegion(s, s.regions.find((r) => r.id === m.regionId)!);
  const ly = s.lyrics.filter((l) => lyricMeasureId(s, l) === m.id);
  const layout=xmlPracticeLayout(s,r,width);
  const height =
    layout?.height ?? (width > 1 ? (width / r.w) * r.h * (pageRatios[r.page] || 1.294) : 165);
  const syl = ly
    .map((l) => {
      const b = ((l.time - m.start) / (m.end - m.start)) * m.beats;
      const x =
        s.settings.view === "ribbon"
          ? positionInMeasure(i, b, width) / width
          : xAtBeat(r, m, b);
      return `<span class="syllable" title="${l.confirmed ? "확인됨" : "추정"}" style="left:${x * 100}%;${l.text.length > 4 ? "font-size:14px;white-space:normal;max-width:95%;transform:none;" : ""}">${esc(l.text)}</span>`;
    })
    .join("");
  return `<div class="measure" data-index="${i}" style="width:${width}px"><span class="label">${esc(m.label)} 마디<span class="measure-beat" aria-label="현재 박">1</span><small class="measure-signature">${m.beats}/${m.denominator}</small></span><div class="crop" style="width:${width}px;height:${height}px;background-image:url('${urls[r.page]}');background-size:${layout?.size ?? `${100 / r.w}% ${100 / r.h}%`};background-position:${layout?.position ?? `${(r.x / (1 - r.w || 1)) * 100}% ${(r.y / (1 - r.h || 1)) * 100}%`}"></div><div class="lyrics" style="top:${height + 6}px">${syl}</div></div>`;
}
function positionInMeasure(index: number, beat: number, width: number) {
  const s = song(),
    m = s.measures[index],
    next = s.measures[index + 1];
  const r = practiceRegion(s, s.regions.find((r) => r.id === m.regionId)!);
  const nextRegion = next && practiceRegion(s, s.regions.find((r) => r.id === next.regionId)!);
  const end =
    width + (next ? widthOf(next) * xAtBeat(nextRegion!, next, 0) : 0);
  return continuousX(r, m, beat, width, end);
}
let review: ScoreReview | undefined;
let reviewGeneration = 0;
let reviewPNG: Promise<Blob> | undefined;
async function prepareReview() {
  const generation=++reviewGeneration;
  review?.dispose();review=undefined;
  $('review-copy').setAttribute('disabled','');
  try {
    const sourceRecord=record!;
    const pair=reviewPair(sourceRecord);
    if(pair[1].pages.some(p=>p.type!==SVG_GZIP && p.type!=='image/svg+xml')){
      if(isPortable)throw Error('SVG 캐시가 없는 과거 HTML입니다. 웹앱에서 검수 모드를 연 뒤 HTML을 다시 저장해 주세요.');
      const rendered=await renderScore(pair[1].source,'musicxml',pair[1].partId);
      if(!rendered.parsed)throw Error('MusicXML 렌더링 결과가 없습니다.');
      replaceWithMusicXML(sourceRecord.song,{...rendered,parsed:rendered.parsed},pair[1].name);
      if(rendered.pages.length!==pair[1].pages.length)throw Error('악보 페이지 수가 달라 자동 갱신할 수 없습니다.');
      if(generation!==reviewGeneration)return;
      pair[1]={...pair[1],pages:rendered.pages};
      if(sourceRecord.song.scoreFormat==='musicxml')sourceRecord.pages=rendered.pages;
      else sourceRecord.otherScores=sourceRecord.otherScores?.map(s=>s.format==='musicxml'?pair[1]:s);
      await saveRecord(sourceRecord);
    }
    if(generation!==reviewGeneration)return;
    const candidate=new ScoreReview($<HTMLCanvasElement>('review-canvas'),song(),pair);
    try { await candidate.load(); } catch(e) {candidate.dispose();throw e;}
    if(generation!==reviewGeneration){candidate.dispose();return;}
    review=candidate;review.draw(engine().current());$('review-copy').removeAttribute('disabled');
  } catch(e){if(generation===reviewGeneration){$('review-message').textContent=String(e);error(e);}}
}
function captureReview() {
  engine().pause();
  if(!review){$('review-message').textContent='악보를 준비 중입니다. 준비 후 캡처 버튼을 눌러 주세요.';return;}
  const time=engine().current();
  reviewPNG=review.snapshot(time);
  $('review-save').hidden=false;
  void copyReviewImage(reviewPNG).then(()=>{$('review-message').textContent='캡처 복사됨 — 대화에 붙여넣으세요.';},()=>{$('review-message').textContent='클립보드 복사가 차단되었습니다. 캡처 저장을 눌러 주세요.';});
  void reviewPNG.catch(error);
}
action('review-copy',captureReview);
action('review-save',async()=>{if(!reviewPNG)return;const url=URL.createObjectURL(await reviewPNG),a=document.createElement('a');a.href=url;a.download='악보-검수.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
function renderTrack() {
  if (!record) return;
  scoreGestures.cancel();
  const s = song();
  const comparing=s.settings.view==='compare';
  $('practice').classList.toggle('score-review',comparing);
  $('review-tools').hidden=$('review-canvas').hidden=!comparing;
  $("practice").classList.toggle("two-rows", s.settings.view !== "ribbon");
  val('zoom').closest('label')!.hidden=s.settings.view!=='ribbon';
  if(comparing){$('stage').style.removeProperty('height');void prepareReview();return;}
  reviewGeneration++;review?.dispose();review=undefined;
  val("zoom").closest("label")!.hidden = s.settings.view !== "ribbon";
  rowWindow = -1;
  trackOffsets = [];
  trackWidths = [];
  let x = 0;
  const html = s.measures.map((m, i) => {
    trackOffsets.push(x);
    const w = widthOf(m);
    trackWidths.push(w);
    x += w;
    return measureHTML(m, i, w);
  });
  $("ribbon").innerHTML = html.join("");
  if (s.settings.view === "ribbon")
    $("stage").style.height =
      `${(clamp($("stage").clientWidth * 0.245, 170, 340) * s.settings.zoom) / 2 + 94}px`;
  else $("stage").style.removeProperty("height");
  layoutLyrics();
  if (!s.measures.length)
    $("ribbon").innerHTML =
      "<p>악보·가사 맞추기에서 마디 영역을 추가하세요.</p>";

}
function renderRows(index: number) {
  const windowIndex = Math.floor(index / 4);
  if (windowIndex === rowWindow) return;
  rowWindow = windowIndex;
  const s = song();
  const upper = windowIndex % 2 === 0 ? windowIndex : windowIndex + 1,
    lower = windowIndex % 2 === 0 ? windowIndex + 1 : windowIndex;
  const indices = [
    ...Array.from({ length: 4 }, (_, j) => upper * 4 + j),
    ...Array.from({ length: 4 }, (_, j) => lower * 4 + j),
  ];
  $("ribbon").innerHTML = indices
    .filter((i) => i < s.measures.length)
    .map((i) => measureHTML(s.measures[i], i, $("stage").clientWidth / 4))
    .join("");
  layoutLyrics();
}
// One lyric baseline per score row; preserve time anchors in the song data.
function layoutLyrics() {
  const rows = new Map<number, { el: HTMLElement; rect: DOMRect }[]>();
  $("ribbon")
    .querySelectorAll<HTMLElement>(".syllable")
    .forEach((el) => {
      el.style.top = "0px";
      el.style.marginLeft = "0px";
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const row = el.closest<HTMLElement>(".measure")!.offsetTop;
      if (!rows.has(row)) rows.set(row, []);
      rows.get(row)!.push({ el, rect });
    });
  for (const items of rows.values()) {
    const positions = packLabels(
      items.map(({ rect }) => ({ left: rect.left, width: rect.width })),
      2,
      // Clamp to the row content edge, not the moving viewport in ribbon mode.
      song().settings.view === "rows"
        ? $("stage").getBoundingClientRect().left + 4
        : $("ribbon").getBoundingClientRect().left + 4,
    );
    const baseline = Math.max(...items.map(({ rect }) => rect.top));
    items.forEach(({ el, rect }, i) => {
      el.style.marginLeft = `${positions[i] - rect.left}px`;
      el.style.top = `${baseline - rect.top}px`;
    });
  }
}
let positionCopiedUntil = 0;
function frame() {
  requestAnimationFrame(frame);
  if (!record || !player) return;
  const t = player.current(),
    s = song(),
    loc = locate(s, t);
  if (loc.measure) {
    const { index, measure: m, beat } = loc;
    const count = player.count();
    const positionLabel = performance.now() < positionCopiedUntil ? "복사됨 ✓" : playbackPosition(s, t).label;
    if ($("copy-position").textContent !== positionLabel) $("copy-position").textContent = positionLabel;
    $("playhead-status").hidden = s.settings.view !== "ribbon";
    $("playhead-bar").textContent = `${m.label} 마디`;
    $("playhead-beat").textContent = `${count ? "준비 " : ""}${count || Math.min(m.beats, Math.floor(beat) + 1)}`;
    $("playhead-signature").textContent = `${m.beats}/${m.denominator}`;
    if (s.settings.view === "compare") {
      review?.draw(t);
    } else if (s.settings.view === "ribbon") {
      const x =
        trackOffsets[index] +
        positionInMeasure(index, beat, trackWidths[index]);
      $("ribbon").style.transform =
        `translateX(${$("stage").clientWidth / 3 - x}px)`;
    } else {
      renderRows(index);
    }
    const region = practiceRegion(s, s.regions.find(r => r.id === m.regionId)!);
    const next = s.measures[index + 1];
    const nextRegion = next && practiceRegion(s, s.regions.find(r => r.id === next.regionId)!);
    // Cross printed bar margins continuously, but never bridge two screen rows.
    const nextStart = next && index % 4 !== 3 ? 1 + xAtBeat(nextRegion!, next, 0) : 1;
    const playedThrough = index + continuousX(region, m, beat, 1, nextStart);
    $("ribbon").querySelectorAll<HTMLElement>("[data-index]").forEach((e) => {
      const measureIndex = Number(e.dataset.index);
      const active = measureIndex === index;
      if (s.settings.view === "rows") {
        const progress = clamp(playedThrough - measureIndex, 0, 1);
        e.style.setProperty("--played", `${progress * 100}%`);
        e.classList.toggle("progress-edge", playedThrough >= measureIndex && playedThrough < measureIndex + 1);
      }
      const loop = player!.loop, bar = s.measures[measureIndex];
      e.classList.toggle('in-loop',!!loop && bar.end>loop.start && bar.start<loop.end);
      e.classList.toggle('loop-start',!!loop && loop.start>=bar.start && loop.start<bar.end);
      e.classList.toggle('loop-end',!!loop && loop.end>bar.start && loop.end<=bar.end);
      e.classList.toggle("active", active);
      if (active) {
        e.querySelector(".measure-beat")!.textContent =
          `${count ? "준비 " : ""}${count || Math.min(m.beats, Math.floor(beat) + 1)}`;
      }
    });
  }
  $("elapsed").textContent = time(t);
  if (!gestureScrub) {
    val("progress-percent").value = String(Math.round(clamp(t / (player.duration || 1), 0, 1) * 100));
    val("progress-percent").setAttribute("aria-valuenow", val("progress-percent").value);
  }
  val("progress-percent").setAttribute("aria-valuetext", `${val("progress-percent").value}% · ${time(t)} / ${time(player.duration)}`);
  if (!scrubbing) {
    val("seek").value = String(t);
    val("seek").setAttribute("aria-valuetext", `${loc.measure?.label || "1"} 마디`);
  }
  $("editor-time").textContent = `${t.toFixed(2)}초`;
}
requestAnimationFrame(frame);
async function toggle() {
  if (busy) return;
  if (engine().playing) {
    if(song().settings.view==='compare')captureReview();else engine().pause();
    return;
  }
  busy = true;
  try {
    await engine().play();
  } finally {
    busy = false;
  }
}
async function rate(bpm: number) {
  if (busy) return;
  busy = true;
  try {
    if (!Number.isFinite(bpm) || bpm <= 0) {
      syncSettings();
      throw Error("올바른 BPM을 입력하세요.");
    }
    await engine().setRate(clamp(bpm / song().bpm, 0.5, 1.2));
    syncSettings();
    queueSave();
  } finally {
    busy = false;
  }
}
action("original-tempo", openTempo);
action("tempo-reset", () => rate(song().bpm));
action("copy-position", async () => {
  const snapshot = playbackPosition(song(), engine().current());
  await copyPosition(snapshot.text);
  positionCopiedUntil = performance.now() + 1400;
  $("copy-position").textContent = "복사됨 ✓";
});
action("play", toggle);
action("home", () => seekFreely(0));
action("jump", () => {
  const count = num("goto");
  if (!Number.isSafeInteger(count) || count < 1 || count > 10)
    throw Error("이동할 마디 수를 1~10 중에서 선택하세요.");
  const measures = song().measures;
  const index = locate(song(), engine().current()).index;
  seekFreely(measures[Math.max(index - count, 0)].start);
});
val("rate").onchange = () => rate(num("rate")).catch(error);
function openTempo() {
  if (!record) return;
  const original = song().bpm;
  const presets = [...new Set([0.5, 0.6, 0.7, 0.8, 0.9].map(f => Math.round(original * f))), original];
  $("tempo-options").innerHTML = presets.map(bpm => `<button data-tempo="${bpm}" class="${Math.abs(bpm - original * song().settings.rate) < 0.01 ? "primary" : ""}">${bpm} BPM${bpm === original ? " · 원곡" : ""}</button>`).join("");
  $("tempo-reset").textContent = `원곡 ${original} BPM`;
  $<HTMLDialogElement>("tempo-dialog").showModal();
}
$("tempo-options").onclick = e => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-tempo]");
  if (!b) return;
  void rate(Number(b.dataset.tempo)).catch(error);
};
bindNumericDrag(val("rate"));

const playbackPreferences = readPlaybackPreferences();
val('restart-measure').checked = playbackPreferences.restartMeasure;
val('count-off').checked = playbackPreferences.countOff;
for (const id of ['restart-measure','count-off']) val(id).onchange = () => {
  const saved = savePlaybackPreferences({restartMeasure:val('restart-measure').checked, countOff:val('count-off').checked});
  $('playback-settings-status').textContent = saved ? '이 브라우저에 저장했습니다.' : '이 화면을 열어 둔 동안에만 적용됩니다.';
};

// Score and percentage scrubbing share one preview/commit/cancel lifecycle.
let gestureScrub: { start: number; resume: boolean; loop?: Loop; center?: number; radius?: number } | undefined;
function prepareGestureAudio() { if (record && !busy) void engine().prepare?.().catch(error); }
function seekFreely(t: number) {
  const p = engine();
  if (p.loop && (t < p.loop.start || t >= p.loop.end)) {
    lastPracticeLoop = p.loop;
    p.loop = undefined;
    repeatCenter = repeatRadius = undefined;
    renderLists();
    status("반복 구간 밖으로 이동해 반복을 껐습니다.");
  }
  p.seek(t);
}
function beginGestureScrub() {
  if (!record || busy) return;
  const p = engine();
  gestureScrub = { start:p.current(), resume:p.playing, loop:p.loop, center:repeatCenter, radius:repeatRadius };
  p.pause();
}
function previewGestureScrub(t: number) {
  if (!gestureScrub) return;
  seekFreely(t);
  val("progress-percent").value = String(Math.round(clamp(t / (engine().duration || 1), 0, 1) * 100));
}
function endGestureScrub(cancel = false) {
  const state = gestureScrub;
  gestureScrub = undefined;
  if (!state) return;
  if (cancel) {
    engine().pause();
    engine().loop = state.loop;
    repeatCenter = state.center; repeatRadius = state.radius;
    engine().seek(state.start);
    renderLists();
  } else if (state.resume && engine().current() < engine().duration) {
    void engine().play(false, false).catch(error);
  }
  queueSave();
}
const scoreGestures = attachScoreGestures<number>($("stage"), {
  isPlaying: () => !!player?.playing,
  getTarget: e => {
    if (!record || busy || document.querySelector('dialog[open]')) return null;
    const measure = (e.target as HTMLElement).closest?.<HTMLElement>('[data-index]');
    if (measure) return Number(measure.dataset.index);
    if (song().settings.view === 'compare') {
      const bounds = $('stage').getBoundingClientRect();
      const column = Math.floor(clamp((e.clientX - bounds.left - 12) / Math.max(1, bounds.width - 24), 0, .9999) * 4);
      return Math.min(song().measures.length - 1, Math.floor(locate(song(), engine().current()).index / 4) * 4 + column);
    }
    return locate(song(), engine().current()).index;
  },
  prepareAudio: prepareGestureAudio,
  pause: () => { if (record && !busy) { if (song().settings.view === 'compare') captureReview(); else engine().pause(); } },
  play: () => { if (record) void toggle().catch(error); },
  seek: (index, resume) => {
    if (!record || busy) return;
    engine().pause();
    seekFreely(song().measures[index].start);
    if (resume) void engine().play(false, false).catch(error);
  },
  scrubStart: beginGestureScrub,
  scrubMove: delta => {
    if (!gestureScrub) return;
    const width = song().settings.view === 'ribbon' ? trackWidths[locate(song(), gestureScrub.start).index] : $('stage').clientWidth / 4;
    previewGestureScrub(scrubTime(song(), gestureScrub.start, delta, width, engine().duration));
  },
  scrubEnd: () => endGestureScrub(),
  scrubCancel: () => endGestureScrub(true),
});
$('stage').addEventListener('wheel', e => {
  if (!record || busy || document.querySelector('dialog[open]') || e.ctrlKey) return;
  e.preventDefault();
  if (engine().playing) return;
  scoreGestures.cancel();
  const delta = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? $('stage').clientHeight : 1);
  seekFreely(scrubTime(song(), engine().current(), -delta, Math.max(150, $('stage').clientWidth / 4), engine().duration));
}, { passive: false });
// Keyboard and assistive-technology activation remains available without pointer gestures.
$('stage').tabIndex = 0;
$('stage').setAttribute('aria-label', '악보. 한 번 탭 재생·정지, 두 번 탭 마디 이동, 좌우 드래그 탐색. 정지 중 휠로 탐색');
$('stage').addEventListener('click', e => { if (e.detail === 0 && record) void toggle().catch(error); });
bindNumericDrag(val('progress-percent'), {
  onStart: beginGestureScrub,
  onPreview: percent => previewGestureScrub(engine().duration * percent / 100),
  onCommit: percent => { if (gestureScrub) endGestureScrub(); else if (record) seekFreely(engine().duration * percent / 100); },
  onCancel: () => endGestureScrub(true),
  onTap: () => { if (record) $<HTMLDialogElement>('marker-dialog').showModal(); },
});
const disposeNumericInputs = installNumericInputs(document);
if (import.meta.hot) import.meta.hot.dispose(() => { disposeNumericInputs(); scoreGestures.dispose(); });
document.addEventListener('pointerdown', e => {
  if (!(e.target instanceof Element) || $('stage').contains(e.target)) return;
  scoreGestures.cancel();
}, true);

let fullscreenRequest: Promise<boolean> | undefined;
const fullscreenReport = (message: string) => { $('fullscreen-status').textContent = message; };
function requestScoreFullscreen() {
  if (!autoFullscreenEnabled() || document.fullscreenElement || fullscreenRequest) return;
  fullscreenRequest = enterFullscreen(fullscreenReport);
  void fullscreenRequest.finally(() => { fullscreenRequest = undefined; });
}
val('auto-fullscreen').checked = autoFullscreenEnabled();
val('auto-fullscreen').onchange = async () => {
  const enabled = val('auto-fullscreen').checked;
  saveAutoFullscreen(enabled);
  try {
    if (enabled && record) await enterFullscreen(fullscreenReport);
    else if (!enabled) {
      if (document.fullscreenElement) await document.exitFullscreen();
      fullscreenReport('');
    }
  } catch (e) { error(e); }
};
// Request before asynchronous file/IndexedDB work consumes transient activation.
document.addEventListener('click', e => {
  if ((e.target as Element).closest('#demo-button, #library-list [data-open]')) requestScoreFullscreen();
}, true);
document.addEventListener('submit', e => { if ((e.target as HTMLElement).id === 'new-form') requestScoreFullscreen(); }, true);

let scrubbing = false,
  resumeAfterScrub = false;
const seek = val("seek");
function showSeekPosition() {
  const bubble = $("seek-position");
  bubble.textContent = `${locate(song(), num("seek")).measure?.label || "1"} 마디`;
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
window.addEventListener("pointercancel", () => { scrubbing = false; resumeAfterScrub = false; $("seek-position").hidden = true; });
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
for (const id of [
  "click",
  "music-volume",
  "click-volume",
  "zoom",
  "view",
])
  val(id).onchange = () => {
    if (!record) { syncViewChoices(); return; }
    const s = song().settings;
    s.click = val("click").checked;
    s.musicVolume = num("music-volume");
    s.clickVolume = num("click-volume");
    s.zoom = num("zoom");
    if(val('view').value==='compare'){
      try{reviewPair(record);}catch(e){val('view').value=s.view;syncViewChoices();error(e);return;}
      if(s.view!=='compare')engine().pause();
    }
    s.view = val("view").value as typeof s.view;
    syncViewChoices();
    engine().volumes();
    if (["view", "zoom"].includes(id)) renderTrack();
    queueSave();
  };
val('loop-precise').onchange = () => {
  $('loop-beat-controls').hidden = !val('loop-precise').checked;
  $('loop-range-help').textContent = val('loop-precise').checked ? '시작 박부터 끝 경계 직전까지 반복합니다.' : '시작 마디부터 끝 마디까지 모두 반복합니다.';
};
function loopPoint(prefix: string) {
  const s = song(), i = num(prefix) - 1;
  const precise = val('loop-precise').checked;
  const m = s.measures[i];
  if (!Number.isInteger(i) || !m) throw Error("반복 마디를 확인하세요.");
  if (!precise) return prefix === 'loop-a' ? m.start : m.end;
  const beat = num(prefix === 'loop-a' ? 'loop-ab' : 'loop-bb') - 1;
  if (!Number.isFinite(beat) || beat < 0 || beat > m.beats) throw Error('반복 박 번호를 확인하세요.');
  return beatTime(m, beat);
}
function fillLoop(l: Loop) {
  const a = locate(song(), l.start), range = loopMeasureRange(song(), l.start, l.end);
  const last = song().measures[range.last];
  const endBeat = (l.end - last.start) / (last.end - last.start) * last.beats;
  const precise = Math.abs(l.start - a.measure.start) > 1e-5 || Math.abs(l.end - last.end) > 1e-5;
  val('loop-precise').checked = precise;
  val('loop-precise').dispatchEvent(new Event('change'));
  val('loop-a').value = String(a.index + 1);
  val('loop-ab').value = String(Number((a.beat + 1).toFixed(4)));
  val('loop-b').value = String(range.last + 1);
  val('loop-bb').value = String(Number((endBeat + 1).toFixed(4)));
  val('loop-name').value = l.name;
  updateLoopBeatBounds();
}
function updateLoopBeatBounds() {
  for (const [bar,beat] of [['loop-a','loop-ab'],['loop-b','loop-bb']]) {
    const m = record && song().measures[num(bar)-1];
    if (!m) continue;
    val(beat).max = String(m.beats + (bar === 'loop-b' ? 1 : 0));
    val(beat).value = String(clamp(num(beat),1,Number(val(beat).max)));
  }
}
for (const id of ['loop-a','loop-b']) val(id).addEventListener('change',updateLoopBeatBounds);
function useLoop(l?: Loop, preservePosition = false) {
  scoreGestures.cancel();
  const p = engine(), was = p.playing;
  p.pause();
  if (p.loop) lastPracticeLoop = p.loop;
  p.loop = l;
  if (l) {
    lastPracticeLoop = l;
    if (!preservePosition || p.position < l.start || p.position >= l.end) p.position = l.start;
    editingLoopId = song().loops.some(saved=>saved.id===l.id) ? l.id : undefined;
    fillLoop(l);
    $('save-loop').textContent = editingLoopId ? '이름·구간 저장' : '구간 저장';
  }
  renderLists();
  if (was) void p.play(false, false).catch(error);
}
function loopFromForm(): Loop {
  const start = loopPoint('loop-a'), end = loopPoint('loop-b');
  if (end - start < .15 || end > engine().duration + .01) throw Error('반복 끝은 시작 뒤, 음원 끝 이전이어야 합니다.');
  return {id:editingLoopId || uid(),name:val('loop-name').value.trim() || `${num('loop-a')}–${num('loop-b')}마디`,start,end};
}
action('apply-loop',()=> {
  const l = loopFromForm();
  repeatCenter = repeatRadius = undefined;
  useLoop(l,true);
  $<HTMLDialogElement>('loop-dialog').close();
});
action('save-loop',()=> {
  const l = loopFromForm();
  const at = song().loops.findIndex(x=>x.id===l.id);
  if (at < 0) song().loops.push(l); else song().loops[at] = l;
  repeatCenter = repeatRadius = undefined;
  useLoop(l,true); queueSave();
});
function stopPracticeLoop() { repeatCenter = repeatRadius = undefined; useLoop(); }
action('stop-loop',stopPracticeLoop);
action('quick-stop-loop',stopPracticeLoop);
function quickRepeat(radius: number, recenter = false) {
  if (!record || busy) return;
  const center = recenter || repeatCenter === undefined || !engine().loop ? locate(song(),engine().current()).index : repeatCenter;
  const range = centeredRange(song().measures,center,radius,engine().duration);
  if (range.end <= range.start) throw Error('이 위치에서는 반복할 음원이 없습니다.');
  repeatCenter = range.center; repeatRadius = radius;
  useLoop({id:uid(),name:`${range.first+1}–${range.last+1}마디`,start:range.start,end:range.end},true);
}
$('repeat-controls').addEventListener('click',e=> {
  const b = (e.target as Element).closest<HTMLElement>('[data-loop-radius]');
  if (b) quickRepeat(Number(b.dataset.loopRadius));
});
action('recenter-loop',()=>quickRepeat(repeatRadius || 1,true));
action('new-loop',()=> {
  editingLoopId = undefined;
  val('loop-name').value='';
  $('save-loop').textContent='구간 저장';
});
$('open-loop-dialog').addEventListener('click',()=> {
  if (!record) return;
  if (engine().loop || lastPracticeLoop) fillLoop((engine().loop || lastPracticeLoop)!);
  else {
    const range = centeredRange(song().measures,locate(song(),engine().current()).index,1,engine().duration);
    fillLoop({id:'',name:'',start:range.start,end:range.end});
  }
});
for (const [id,prefix] of [['set-a','loop-a'],['set-b','loop-b']]) action(id,()=>{
  const loc = locate(song(),engine().current());
  val(prefix).value=String(loc.index+1);
  val(prefix === 'loop-a' ? 'loop-ab' : 'loop-bb').value=String(Math.floor(loc.beat*4)/4+1);
  updateLoopBeatBounds();
});
function addMarker() {
  const name =
    val("marker-name").value.trim() ||
    `${locate(song(), engine().current()).measure?.label}마디`;
  song().markers.push({ id: uid(), name, time: engine().current() });
  val("marker-name").value = "";
  renderLists();
  queueSave();
}
action("add-marker", addMarker);
action("quick-add-marker", addMarker);
function renderLists() {
  const s = song();
  $("open-loop-dialog").classList.toggle("is-on", !!player?.loop);
  const loop = player?.loop;
  const range = loop && loopMeasureRange(s,loop.start,loop.end);
  $('loop-summary').textContent = range ? `${range.first+1}–${range.last+1}마디 · ${range.last-range.first+1}마디 반복` : '반복 꺼짐';
  $('quick-stop-loop').hidden = !loop;
  $('recenter-loop').hidden = !loop;
  document.querySelectorAll<HTMLButtonElement>('[data-loop-radius]').forEach(b=> {
    const active = !!loop && Number(b.dataset.loopRadius) === repeatRadius;
    b.classList.toggle('primary',active); b.setAttribute('aria-pressed',String(active));
  });
  $("active-loop").textContent = player?.loop
    ? `반복 중 · ${player.loop.name}`
    : "반복 꺼짐";
  $("quick-markers").innerHTML =
    s.markers
      .slice(0, 6)
      .map(
        (m) =>
          `<button data-quick-marker="${esc(m.id)}">${esc(m.name)} <small>${locate(s, m.time).measure?.label} 마디</small></button>`,
      )
      .join("") || "마커를 추가하면 여기에서 바로 이동할 수 있습니다.";
  $("markers").innerHTML = s.markers
    .map(
      (m) =>
        `<span class="listitem"><button data-marker="${esc(m.id)}">${esc(m.name)} <small>${time(m.time)}</small></button><button data-rename-marker="${esc(m.id)}" aria-label="마커 이름 수정">✎</button><button data-delete-marker="${esc(m.id)}" aria-label="마커 삭제">×</button></span>`,
    )
    .join("");
  $("loops").innerHTML = s.loops
    .map(
      (l) =>
        `<span class="listitem ${player?.loop?.id === l.id ? "active" : ""}"><button data-loop="${esc(l.id)}">${esc(l.name)}</button><button data-rename-loop="${esc(l.id)}" aria-label="반복 이름 수정">✎</button><button data-delete-loop="${esc(l.id)}" aria-label="반복 삭제">×</button></span>`,
    )
    .join("");
  paginateList("markers");
  paginateList("loops");
}
$("quick-markers").onclick = (e) => {
  const id = (e.target as HTMLElement).closest<HTMLElement>(
    "[data-quick-marker]",
  )?.dataset.quickMarker;
  const marker = song().markers.find((m) => m.id === id);
  if (marker) seekFreely(marker.time);
};
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
    const n = prompt("마커 이름", m.name);
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
  if (b.dataset.loop) { repeatCenter = repeatRadius = undefined; useLoop(s.loops.find((l) => l.id === b.dataset.loop)); }
  if (b.dataset.renameLoop) {
    const l = s.loops.find((l) => l.id === b.dataset.renameLoop)!;
    const n = prompt("반복 이름", l.name);
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
  b.onclick = () => $<HTMLDialogElement>(b.dataset.close!).close();
async function openLibrary() {
  if (record) await persist();
  library = await allRecords();
  $("library-list").innerHTML = library.length
    ? library
        .map(
          (r, i) =>
            `<div class="panel song-card"><div class="song-card-heading"><button data-open="${i}" class="song-card-title">${esc(r.song.title)}</button><small>${r.song.artist ? esc(r.song.artist)+' · ' : ''}${r.song.measures.length}마디 · ${r.song.bpm} BPM</small></div><div class="song-card-types" aria-label="저장된 악보 유형">${songScores(r).map(score => `<button class="score-type score-type-${score.format}" data-open="${i}" data-score="${score.format}" aria-label="${esc(r.song.title)} ${score.format==='pdf'?'PDF':'MusicXML'} 열기">${score.format==='pdf'?'PDF':'MusicXML'}</button>`).join('')}${r.song.lyrics.length ? `<button class="score-type score-type-lyrics" data-open="${i}" data-lyrics="true">가사</button>` : ''}</div><div class="song-card-actions" ${isPortable ? 'hidden' : ''}><button data-attach="${i}" aria-label="${esc(r.song.title)}에 악보 추가">+ 악보 추가</button><button data-delete="${i}" class="danger">삭제</button></div></div>`,
        )
        .join("")
    : "<p>아직 저장한 곡이 없습니다.</p>";
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
      const target = b.dataset.score && songScores(selected).find(s => s.format === b.dataset.score);
      if (target && songScores(selected).length > 1) savePreferPDF(target.format === "pdf");
      await activate(target ? useScore(selected,target) : selected);
      $<HTMLDialogElement>("library-dialog").close();
      if (b.dataset.lyrics) { selectEditorPane("lyrics"); await openEditor(); }
    }
    if (b.dataset.attach) {
      await activate(library[Number(b.dataset.attach)]);
      $<HTMLDialogElement>("library-dialog").close();
      replaceDialog.showModal();
    }
    if (
      b.dataset.delete &&
      confirm("이 브라우저에 저장한 곡과 연습 기록을 삭제할까요?")
    ) {
      const deleting = library[Number(b.dataset.delete)].song.id;
      if (record?.song.id === deleting) {
        engine().pause();
        clearTimeout(saveTimer);
        record = undefined;
        for (const url of urls) URL.revokeObjectURL(url);
        urls = [];
        $("practice").hidden = true;
        $("welcome").hidden = false;
        $("song-title").textContent = "드럼 연습실";
        document.title = "드럼 연습실";
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
  $("demo-button").textContent = recent ? `${recent.song.title} 열기` : "기본 악보 열기";
}
action("demo-button", async () => {
  status("최근 연습 악보를 불러오는 중…");
  const existing = chooseRecent(await allRecords());
  if (existing) {
    await activate(existing);
    return;
  }
  const fetchBlob = async (url: string) => {
    const r = await fetch(url);
    if (!r.ok)
      throw Error("예제 파일이 없습니다. README의 준비 명령을 실행하세요.");
    return r.blob();
  };
  const response = await fetch("/demo/song.json");
  if (!response.ok) throw Error("예제 자료를 먼저 준비하세요.");
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

let inspectGeneration=0;
val('pdf-file').onchange=async()=>{
  const generation=++inspectGeneration, file=val('pdf-file').files?.[0];
  $('xml-part-row').hidden=true; $('xml-part').innerHTML='';
  const isXML=!!file && scoreFormat(file.name)==='musicxml';
  val('new-beats').disabled=isXML;val('new-denominator').disabled=isXML;
  if(!file || scoreFormat(file.name)!=='musicxml')return;
  try {
    const xml=await xmlModule(),text=await xml.readMusicXML(file),info=xml.parseMusicXML(text,undefined,true);
    if(generation!==inspectGeneration)return;
    $('xml-part').innerHTML=info.parts.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
    $('xml-part-row').hidden=false;
    if(!pendingRestore){if(info.title)val('new-title').value=info.title;if(info.bpm)val('new-bpm').value=String(info.bpm);}
  }catch(e){if(generation===inspectGeneration)error(e);}
};
val('xml-part').onchange=async()=>{
  const file=val('pdf-file').files?.[0];if(!file)return;
  try{const xml=await xmlModule(),info=xml.parseMusicXML(await xml.readMusicXML(file),val('xml-part').value);if(info.bpm&&!pendingRestore)val('new-bpm').value=String(info.bpm);}catch(e){error(e);}
};
$("new-form").onsubmit = async (e) => {
  e.preventDefault();
  if (busy) return;
  busy = true;
  try {
    const pdf = val("pdf-file").files?.[0],
      audio = val("audio-file").files?.[0];
    if (!pdf || !audio) throw Error("악보와 음원을 선택하세요.");
    status("악보를 준비하고 있습니다.");
    const format=scoreFormat(pdf.name);
    const result=await renderScore(pdf,format,val("xml-part").value||undefined);
    const {pages,regions}=result;
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
    if (result.parsed) applyXMLTiming(s,result.parsed); else reflow(s);
    const lines = val("new-lyrics")
      .value.split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    s.lyrics = lines.map((text, i) => ({
      id: uid(),
      text,
      time: 0, end: 0, confirmed: false,
      scorePosition: {measureId:s.measures[Math.min(i,s.measures.length-1)].id,quarterOffset:0,durationQuarters:s.measures[Math.min(i,s.measures.length-1)].beats*4/s.measures[Math.min(i,s.measures.length-1)].denominator},
    }));
    if(!lines.length && result.parsed) s.lyrics=result.parsed.lyrics.map(l=>{
      const m=s.measures[l.measure],beat=clamp(l.beat,0,m.beats);
      return {id:uid(),text:l.text,time:beatTime(m,beat),end:beatTime(m,Math.min(m.beats,beat+l.duration)),confirmed:false,scorePosition:{measureId:m.id,quarterOffset:l.beat*4/m.denominator,durationQuarters:Math.max(0.0001,l.duration*4/m.denominator)}};
    }).sort((a,b)=>a.time-b.time);
    const canonicalXML = format==='musicxml' ? importedCanonical(await(await xmlModule()).readMusicXML(pdf),s) : undefined;
    await activate({ song: s, pdf, audio, pages, canonicalXML });
    $<HTMLDialogElement>("new-dialog").close();
    await openEditor();
    tell(
      result.parsed ? `${regions.length}개 마디를 가져왔습니다. ${result.parsed.warnings.join(" ")} 첫 박과 음원 싱크를 확인하세요.` : `${regions.length}개 마디 후보를 찾았습니다. 원본과 비교해 확인하세요.`,
    );
  } catch (e) {
    error(e);
  } finally {
    busy = false;
  }
};
async function openEditor() {
  if (!record) return;
  scoreGestures.cancel();
  selected = locate(song(), engine().current()).index;
  selected = clamp(selected, 0, song().measures.length - 1);
  engine().pause();
  val("edit-title").value = song().title;
  val("edit-original-title").value = song().originalTitle || song().title;
  val("edit-lyricist").value = song().lyricist || "";
  val("edit-composer").value = song().composer || "";
  val("edit-artist").value = song().artist || "";
  val("edit-bpm").value = String(song().bpm);
  val("edit-first").value = String(song().firstBeat);
  $("editor-page").innerHTML = urls
    .map((_, i) => `<option value="${i}">${i + 1}쪽</option>`)
    .join("");
  updateMeasureForm();
  openSettingsChild($<HTMLDialogElement>("editor-dialog"));
  await drawPage();
  renderLyricEditor(true);
}
action("edit-button", () => {
  selectEditorPane("score");
  return openEditor();
});
action("metadata-button", () => {
  selectEditorPane("meta");
  return openEditor();
});
action("save-metadata", () => {
  edit((s) => {
    s.artist = val("edit-artist").value.trim();
    s.title = val("edit-title").value.trim() || s.title;
    s.originalTitle=val("edit-original-title").value.trim();s.lyricist=val("edit-lyricist").value.trim();s.composer=val("edit-composer").value.trim();
  });
  updateSongHeading();
  tell("곡 정보를 저장했습니다.");
});
action("lyrics-button", () => {
  selectEditorPane("lyrics");
  return openEditor();
});
function updateMeasureForm() {
  const s = song();
  $("measure-select").innerHTML = s.measures
    .map(
      (m, i) => `<option value="${i}">${i + 1}. ${esc(m.label)} 마디</option>`,
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
  selected = num("measure-select");
  crop = undefined;
  updateMeasureForm();
  void drawPage();
  renderLyricEditor(true);
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
  const topology = (s:Song) => JSON.stringify(s.measures.map(m=>[m.id,m.beats,m.denominator]));
  if(topology(draft)!==topology(song())) {
    if(record!.canonicalXML && hasDrumNotation(record!.canonicalXML)) throw Error("MusicXML의 마디 구성은 원본 악보에서 수정한 뒤 다시 가져오세요. 음원 연결과 영역은 여기서 보정할 수 있습니다.");
    for(const l of draft.lyrics) delete l.grid;
  }
  if(draft.lyricGridEnabled) synchronizeLyricGrid(draft);
  migrateLyricPositions(draft);
  projectLyrics(draft);
  validateSong(draft);
  engine().pause();
  const canonicalXML=writeCanonical(draft,record!.canonicalXML);
  record!.song = draft;
  record!.canonicalXML=canonicalXML;
  engine().song = draft;
  engine().loop = undefined;
  selected = clamp(selected, 0, Math.max(0, draft.measures.length - 1));
  updateMeasureForm();
  renderTrack();
  renderLists();
  queueSave();
  void drawPage();
}
action("add-region", () => {
  if (!crop) throw Error("원본에서 영역을 드래그하세요.");
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
  if (!crop) throw Error("적용할 영역을 드래그하세요.");
  const c = crop;
  edit((s) => {
    const m = s.measures[selected];
    if (!m) throw Error("마디를 먼저 추가하세요.");
    const r = s.regions.find((r) => r.id === m.regionId)!;
    Object.assign(r, c);
  });
  crop = undefined;
});
action("apply-measure", () =>
  edit((s) => {
    const m = s.measures[selected];
    if (!m) throw Error("마디가 없습니다.");
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
      throw Error(`박 위치를 ${m.beats + 1}개 입력하세요.`);
  }),
);
action("reflow", () => {
  if (
    !confirm(
      "전체 마디 시간을 새 BPM과 첫 박으로 다시 계산할까요? 기존 개별 시각 보정은 바뀝니다.",
    )
  )
    return;
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
      throw Error("앞 마디보다 뒤의 시각이어야 합니다.");
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
      label: m.label + " 반복",
    });
    reflow(s);
    selected++;
  }),
);
action("split", () =>
  edit((s) => {
    const m = s.measures[selected],
      r = s.regions.find((r) => r.id === m.regionId)!;
    if (m.beats % 2) throw Error("짝수 박 마디만 반으로 나눌 수 있습니다.");
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
    if (!b) throw Error("다음 마디가 없습니다.");
    const r = s.regions.find((r) => r.id === a.regionId)!,
      z = s.regions.find((r) => r.id === b.regionId)!;
    if (
      r.page !== z.page ||
      Math.abs(r.y - z.y) > 0.025 ||
      a.denominator !== b.denominator
    )
      throw Error("같은 줄과 박자 분모의 마디만 합칠 수 있습니다.");
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
  if (confirm("선택한 재생 마디를 삭제할까요? 원본 PDF는 유지됩니다."))
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
    tell("박이 불분명합니다. 박자 탭이나 직접 입력을 사용하세요.");
    return;
  }
  val("edit-bpm").value = String(a.bpm);
  val("edit-first").value = String(a.firstBeat);
  $("tap-result").textContent =
    `${a.bpm} BPM 후보 · 첫 박은 ${a.firstBeat}초 후보 · 들어 보고 보정하세요`;
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
    $("tap-result").textContent =
      `${Math.round(bpm)} BPM 추정 · 전체 다시 맞추기로 적용`;
  }
});
let lyricPage = 0,
  lyricNear = true;
action("lyrics-prev", () => {
  lyricPage = Math.max(0, lyricPage - 1);
  renderLyricEditor(lyricNear, true);
});
action("lyrics-next", () => {
  lyricPage++;
  renderLyricEditor(lyricNear, true);
});
function lyricGridEditor(l: Song["lyrics"][number]) {
  const p=nearestQuarterBeat(song(),l.time), point=l.grid || {measureId:p.measure.id,tick:p.tick};
  const m=song().measures.find(m=>m.id===point.measureId)!;
  const measures=song().measures.map(x=>`<option value="${esc(x.id)}" ${x.id===m.id ? "selected" : ""}>${esc(x.label)}마디</option>`).join("");
  const exact=Number.isInteger(point.tick)?"":`<option selected value="${point.tick}">${(point.tick/4+1).toFixed(4)}박 (악보 음가)</option>`;
  const ticks=exact+Array.from({length:m.beats*4},(_,tick)=>`<option value="${tick}" ${tick===point.tick ? "selected" : ""}>${Math.floor(tick/4)+1}박${[""," + ¼"," + ½"," + ¾"][tick%4]}</option>`).join("");
  return `<div class="lyric-grid-controls"><select data-field="grid-measure" aria-label="가사 시작 마디">${measures}</select><select data-field="grid-tick" aria-label="가사 시작 박">${ticks}</select></div>`;
}
function renderLyricEditor(near: boolean, keepPage = false) {
  if (!keepPage) lyricPage = 0;
  lyricNear = near;
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
  $("lyrics-page").textContent =
    `${lyricPage + 1} / ${pages} · ${list.length}개`;
  $<HTMLButtonElement>("lyrics-prev").disabled = lyricPage === 0;
  $<HTMLButtonElement>("lyrics-next").disabled = lyricPage === pages - 1;
  $("lyric-editor").innerHTML = list
    .slice(lyricPage * perPage, (lyricPage + 1) * perPage)
    .map(
      (l) =>
        `<tr data-lyric="${esc(l.id)}"><td><input data-field="text" value="${esc(l.text)}" aria-label="가사"></td><td>${lyricGridEditor(l)}</td><td><input data-field="duration-beats" type="number" min="0.0001" step="0.25" value="${lyricDurationBeats(song(),l)}" aria-label="가사 길이 박"></td><td><input data-field="confirmed" type="checkbox" ${l.confirmed ? "checked" : ""} aria-label="확인됨"></td><td><button data-split-lyric="${esc(l.id)}" title="음절로 나누기">÷</button><button data-delete-lyric="${esc(l.id)}" aria-label="가사 삭제">×</button></td></tr>`,
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
        const point=l.grid || {measureId:nearestQuarterBeat(s,l.time).measure.id,tick:nearestQuarterBeat(s,l.time).tick};
        const measureId=field==="grid-measure" ? input.value : point.measureId;
        const measure=s.measures.find(m=>m.id===measureId)!;
        setLyricGrid(s,l,{measureId,tick:Math.min(measure.beats*4-1,field==="grid-tick" ? Number(input.value) : point.tick)});
      }
      if (field === "duration-beats") {const m=s.measures.find(m=>m.id===l.scorePosition!.measureId)!;l.scorePosition!.durationQuarters=Number(input.value)*4/m.denominator;}
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
            time: 0, end: 0, confirmed: false,
            scorePosition: {...advanceLyricPosition(s,l.scorePosition!,l.scorePosition!.durationQuarters*n/letters.length),durationQuarters:l.scorePosition!.durationQuarters/letters.length},
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
  const text = prompt("한글 발음 가사");
  if (!text) return;
  edit((s) => {
    const t = engine().current();
    s.lyrics.push({ id: uid(), text, time: t, end: t + 1, confirmed: false });
    s.lyrics.sort((a, b) => a.time - b.time);
  });
  renderLyricEditor(false);
});
let originalPage = 0;
function showOriginalPage() {
  $("page-original").innerHTML =
    `<img src="${urls[originalPage]}" alt="원본 악보 ${originalPage + 1}쪽"><div class="pager"><button id="original-prev" ${originalPage === 0 ? "disabled" : ""}>이전 쪽</button><span>${originalPage + 1} / ${urls.length}</span><button id="original-next" ${originalPage === urls.length - 1 ? "disabled" : ""}>다음 쪽</button></div>`;
  $("original-prev").onclick = () => {
    originalPage--;
    showOriginalPage();
  };
  $("original-next").onclick = () => {
    originalPage++;
    showOriginalPage();
  };
}
action("original-button", () => {
  originalPage = 0;
  showOriginalPage();
  openSettingsChild($<HTMLDialogElement>("original-dialog"));
});
action("export", async () => {
  await persist();
  const zip = new JSZip();
  zip.file("song.json", JSON.stringify(song(), null, 2));
  zip.file("canonical.musicxml",record!.canonicalXML!);
  zip.file(
    "media-identity.json",
    JSON.stringify(await mediaIdentity(record!.pdf, record!.audio)),
  );
  zip.file(
    "README.txt",
    "드럼 연습실 백업. song.json은 원본 음원 초 단위입니다. media/가 없으면 같은 악보·음원을 다시 선택하세요.",
  );
  if (val("include-media").checked) {
    zip.file(scoreArchivePath(song()), record!.pdf);
    zip.file("pages/manifest.json", JSON.stringify(record!.pages.map((page,i)=>({path:`pages/${i}.${pageExtension(page)}`,type:page.type}))));
    record!.pages.forEach((page,i)=>zip.file(`pages/${i}.${pageExtension(page)}`,page));
    zip.file("media/audio", record!.audio);
    zip.file("other-scores.json", JSON.stringify(await packScores(record!.otherScores)));
  }
  const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
  const u = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = u;
  a.download = `${song().title}-연습백업.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
  tell("백업을 내보냈습니다.");
});
val("restore").onchange = async () => {
  try {
    const f = val("restore").files?.[0];
    if (!f) return;
    const zip = await JSZip.loadAsync(f);
    const text = await zip.file("song.json")?.async("string");
    if (!text) throw Error("곡 데이터가 없는 백업입니다.");
    const s = JSON.parse(text);
    validateSong(s);
    const canonicalXML=await zip.file("canonical.musicxml")?.async("string");
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
        tell(
          "미디어 없는 백업입니다. 같은 악보·음원을 선택하면 정렬을 복원합니다.",
        );
        return;
      }
    }
    await verifyMedia(identity, pdf, audio);
    const manifestText = await zip.file("pages/manifest.json")?.async("string");
    const manifest: {path:string;type:string}[] = manifestText ? JSON.parse(manifestText) : Array.from({length:s.pageCount},(_,i)=>({path:`pages/${i}.png`,type:'image/png'}));
    if(manifest.length!==s.pageCount)throw Error("백업 페이지 목록이 올바르지 않습니다.");
    const savedPages=await Promise.all(manifest.map(async p=>{const bytes=await zip.file(p.path)?.async("arraybuffer");return bytes ? new Blob([bytes],{type:p.type}) : undefined;}));
    const pages=savedPages.every(Boolean)?savedPages as Blob[]:(await renderScore(pdf,s.scoreFormat,s.scorePartId)).pages;
    if(pages.length!==s.pageCount)throw Error("백업과 악보 페이지 수가 다릅니다.");
    const otherText = await zip.file("other-scores.json")?.async("string");
    const otherScores = otherText ? unpackScores(JSON.parse(otherText)) : (await allRecords()).find(r => r.song.id===s.id)?.otherScores;
    await activate({ song: s, pdf, audio, pages, otherScores, canonicalXML });
    tell("백업을 복원했습니다.");
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
    if (!pdf || !audio) throw Error("동일한 원본 악보와 음원을 선택하세요.");
    await verifyMedia(pendingMedia, pdf, audio);
    const { pages } = await renderScore(pdf,pendingRestore.scoreFormat,pendingRestore.scorePartId);
    if (pages.length !== pendingRestore.pageCount)
      throw Error("백업과 악보 페이지 수가 다릅니다.");
    await activate({ song: pendingRestore, pdf, audio, pages, canonicalXML:pendingCanonical });
    pendingRestore = undefined;
    $<HTMLDialogElement>("new-dialog").close();
  } catch (e) {
    error(e);
  }
};
document.addEventListener("keydown", (e) => {
  if (
    !record ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(
      (e.target as HTMLElement).tagName,
    ) ||
    document.querySelector("dialog[open]")
  )
    return;
  if (e.code === "Space") {
    scoreGestures.cancel();
    e.preventDefault();
    if(e.repeat)return;
    void toggle().catch(error);
  }
  if (e.key === "m" || e.key === "M") { scoreGestures.cancel(); addMarker(); }
  if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
    scoreGestures.cancel();
    e.preventDefault();
    const i =
      locate(song(), engine().current()).index +
      (e.key === "ArrowRight" ? 1 : -1);
    seekFreely(song().measures[clamp(i, 0, song().measures.length - 1)].start);
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    scoreGestures.cancel();
    if (gestureScrub) endGestureScrub(true);
    player?.pause();
    status("화면을 떠나 일시정지했습니다.");
  }
});
window.addEventListener("resize", () => {
  if (record) renderTrack();
});

// Each exported file boots its embedded song without a server or storage origin.
action("save-html", async () => {
  if (!record || busy) return;
  busy = true;
  const button = $<HTMLButtonElement>("save-html");
  button.disabled = true;
  try {
    engine().pause();
    song().settings.position = engine().current();
    status("음원·악보를 HTML 한 파일로 담는 중…");
    let doc = document;
    if (!isPortable) {
      const response = await fetch(
        `${import.meta.env.BASE_URL}portable-template.html`,
      );
      if (!response.ok)
        throw Error("HTML 저장용 실행 코드를 준비하지 못했습니다.");
      doc = new DOMParser().parseFromString(await response.text(), "text/html");
    }
    await persist();
    const html = makePortableHTML(
      shellFromDocument(doc),
      await packSong(record),
    );
    const url = URL.createObjectURL(
      new Blob([html], { type: "text/html;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${song().title.replace(/[\\/:*?"<>|]/g, "_")}-드럼연습.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    status(
      "HTML 파일을 저장했습니다. 수정한 내용은 새로 저장한 파일에 포함됩니다.",
    );
  } finally {
    busy = false;
    button.disabled = false;
  }
});
if (isPortable) {
  for (const id of [
    "new-button",
    "welcome-new",
    "demo-button",
  ])
    $(id).hidden = true;
  // New PDF input and ZIP restoration belong to the authoring web app.
  val("restore").closest("label")!.hidden = true;
  $("portable-note").hidden = false;
  document.title = "드럼 연습 — 곡 불러오는 중";
  void (async () => {
    const packed = JSON.parse(
      document.getElementById("portable-data")!.textContent!,
    );
    if (!packed)
      throw Error(
        "곡이 없는 HTML 템플릿입니다. 웹앱에서 곡을 열고 HTML로 저장하세요.",
      );
    const r = unpackSong(packed);
    await activate(r);
    document.title = r.song.title + " — 드럼 연습";
    status("파일에서 불러왔습니다. 재생을 눌러 시작하세요.");
  })().catch(error);
}

if (!isPortable) void refreshRecentScore().catch(error);


const replaceDialog=document.createElement('dialog');
replaceDialog.id='replace-score-dialog';
replaceDialog.innerHTML='<div class="dialoghead"><h2>이 곡에 악보 추가</h2><button id="replace-close">닫기</button></div><p>PDF와 MusicXML을 곡 안에 함께 보관합니다. 같은 유형을 다시 넣으면 해당 유형만 갱신합니다. 마디 수와 순서는 현재 곡과 같아야 합니다.</p><label>악보 <input type="file" id="replace-score-file" accept=".pdf,.musicxml,.xml,.mxl"></label><p><label>파트 <select id="replace-score-part"></select></label></p><p id="replace-score-note" class="subtle"></p><button id="replace-score-apply" class="primary" disabled>추가</button>';
document.body.append(replaceDialog);
const replaceButton=document.createElement('button');replaceButton.id='replace-score-button';replaceButton.textContent='이 곡에 악보 추가';
$('backup-dialog').append(replaceButton);
replaceButton.hidden=isPortable;
replaceButton.onclick=()=>{if(!record)return;engine().pause();openSettingsChild(replaceDialog);};
$('review-add-score').onclick=()=>{replaceButton.click();};
$('replace-close').onclick=()=>replaceDialog.close();
let replaceGeneration=0;
val('replace-score-file').onchange=async()=>{
  const gen=++replaceGeneration;val('replace-score-apply').disabled=true;$('replace-score-part').innerHTML='';
  const file=val('replace-score-file').files?.[0];if(!file)return;
  try{if(scoreFormat(file.name)==='pdf'){$('replace-score-note').textContent='PDF에서 감지한 마디 수가 현재 곡과 같은지 확인한 뒤 추가합니다.';val('replace-score-apply').disabled=false;return;}const xml=await xmlModule(),info=xml.parseMusicXML(await xml.readMusicXML(file),undefined,true);if(gen!==replaceGeneration)return;
    $('replace-score-part').innerHTML=info.parts.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
    $('replace-score-note').textContent=info.warnings.join(' ');val('replace-score-apply').disabled=false;
  }catch(e){error(e);}
};
$('replace-score-apply').onclick=async()=>{
  const file=val('replace-score-file').files?.[0];if(!file||!record)return;
  const original=record;val('replace-score-apply').disabled=true;
  try{
    const format=scoreFormat(file.name);
    if(songScores(original).some(s=>s.format===format) && !confirm(`이 곡의 기존 ${format==='pdf'?'PDF':'MusicXML'} 악보를 새 파일로 갱신할까요? 다른 유형과 가사는 유지됩니다.`)) return;
    const r=await renderScore(file,format,val('replace-score-part').value);
    if(record!==original)throw Error('연습곡이 바뀌었습니다. 다시 선택하세요.');
    let updated: Song;
    if(r.parsed) updated=replaceWithMusicXML(original.song,{...r,parsed:r.parsed},file.name);
    else {
      if(r.regions.length!==original.song.measures.length) throw Error(`PDF에서 감지한 마디 수가 다릅니다 (현재 ${original.song.measures.length}, PDF ${r.regions.length}). 마디 구성을 확인하세요.`);
      updated=structuredClone(original.song);updated.regions=r.regions;updated.pageCount=r.pages.length;
      updated.measures.forEach((m,i)=>{m.regionId=r.regions[i].id;});
      updated.scoreFormat='pdf';updated.scorePartId=undefined;updated.pdfName=file.name;
    }
    const target=activeScore({song:updated,pdf:file,audio:original.audio,pages:r.pages});
    const next=useScore(original,target);
    if(format==='musicxml') next.canonicalXML=writeCanonical(next.song,await(await xmlModule()).readMusicXML(file));
    await activate(next);
    replaceDialog.close();tell(`${format==='pdf'?'PDF':'MusicXML'}를 이 곡에 저장했습니다. 가사와 음원 시간은 유지했습니다. ${r.parsed?.warnings.join(' ') ?? ''}`);
  }catch(e){error(e);}finally{val('replace-score-apply').disabled=false;}
};

const xmlExport=document.createElement('button');xmlExport.id='export-musicxml';xmlExport.textContent='MusicXML 저장';$('backup-dialog').append(xmlExport);
xmlExport.onclick=async()=>{try{if(!record)return;await persist();const url=URL.createObjectURL(new Blob([record.canonicalXML!],{type:'application/vnd.recordare.musicxml+xml'})),a=document.createElement('a');a.href=url;a.download=`${song().title}.musicxml`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){error(e);}};
const vocalDialog=document.createElement('dialog');vocalDialog.id='vocal-dialog';vocalDialog.innerHTML='<div class="dialoghead"><h2>보컬 악보에서 가사 가져오기</h2><button id="vocal-close">닫기</button></div><p>마디 수·박자표·반복 순서가 같은 보컬 MusicXML을 선택하세요. 기존 가사를 보컬 악보의 리듬으로 바꿉니다.</p><input id="vocal-file" type="file" accept=".musicxml,.xml,.mxl"><label>보컬 파트 <select id="vocal-part"></select></label><button id="vocal-apply" disabled>가사 가져오기</button>';document.body.append(vocalDialog);
const vocalButton=document.createElement('button');vocalButton.id='import-vocal';vocalButton.textContent='보컬 MusicXML 가져오기';vocalButton.hidden=isPortable;$('show-all').after(vocalButton);vocalButton.onclick=()=>{engine().pause();vocalDialog.showModal();};$('vocal-close').onclick=()=>vocalDialog.close();
let vocalGeneration=0;
val('vocal-file').onchange=async()=>{const generation=++vocalGeneration;val('vocal-apply').disabled=true;try{const f=val('vocal-file').files?.[0];if(!f)return;const xml=await xmlModule(),info=xml.parseMusicXML(await xml.readMusicXML(f),undefined,true);if(generation!==vocalGeneration)return;$('vocal-part').innerHTML=info.parts.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');val('vocal-apply').disabled=false;}catch(e){error(e);}};
$('vocal-apply').onclick=async()=>{try{if(!record)return;const original=record,f=val('vocal-file').files?.[0];if(!f)return;const xml=await xmlModule(),parsed=xml.parseMusicXML(await xml.readMusicXML(f),val('vocal-part').value);const lyrics=vocalLyrics(original.song,parsed);if(!confirm('기존 가사를 보컬 악보의 가사와 리듬으로 바꿀까요? 기존 교정 내용은 이 곡의 이력에 보존합니다.'))return;if(record!==original)throw Error('현재 곡이 바뀌었습니다.');const base=withVocalSource(original.canonicalXML!,parsed.document);const previous=original.canonicalXML;original.canonicalXML=base;try{edit(s=>{s.lyricArchive=[...(s.lyricArchive||[]),{revision:'before-vocal-import',lyrics:structuredClone(s.lyrics)}];s.lyrics=lyrics;});}catch(e){original.canonicalXML=previous;throw e;}await persist();renderLyricEditor(false);vocalDialog.close();tell('보컬 악보의 마디·박 위치로 가사를 가져왔습니다.');}catch(e){error(e);}};
