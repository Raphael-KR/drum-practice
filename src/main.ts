import "./style.css";
import { arrangeWorkspace, selectEditorPane, paginateList } from "./workspace";
import { Player } from "./audio";
import {
  allRecords,
  saveRecord,
  deleteRecord,
  type RecordData,
} from "./storage";
const renderPDF: typeof import("./pdf").renderPDF = async (...args) =>
  (await import("./pdf")).renderPDF(...args);
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
let pageRatios: number[] = [];
let trackOffsets: number[] = [],
  trackWidths: number[] = [];
const app = $("app");
app.innerHTML = `
<header><div class="brand"><div class="logo" aria-hidden="true">♩</div><div><h1>드럼 연습실</h1><small id="song-title">악보를 따라, 나의 속도로</small></div></div><div class="actions"><button id="library-button">내 곡</button><button id="new-button">＋ 곡 추가</button><button id="save-html" hidden>HTML 한 파일로 저장</button><button id="edit-button" hidden>악보·가사 맞추기</button></div></header>
<main><section class="welcome" id="welcome"><span class="tag">PDF · 음악 · 가사</span><h2>다음 마디를 미리 보고,<br>어려운 부분은 천천히.</h2><p>움직이는 악보와 바로 아래 가사를 한눈에 보세요.<br>연습할 구간을 정하고, 나에게 맞는 속도로 반복합니다.</p><div class="actions"><button class="primary" id="demo-button">바람과 언덕의 발라드 열기</button><button id="welcome-new">내 악보로 시작</button></div><p class="subtle">파일과 연습 기록은 이 브라우저에 저장됩니다. 다른 기기로 옮기거나 보관하려면 백업을 내보내세요.</p></section>
<div id="busy" role="status" aria-live="polite"></div><p id="portable-note" class="subtle" hidden>한 곡 파일 · 변경 사항은 이 화면에서만 유지됩니다. 보관하려면 “HTML 한 파일로 저장”을 눌러 새 파일로 저장하세요.</p>
<section id="practice" hidden><div class="statusline"><div class="flex"><select id="view" aria-label="악보 표시 방식"><option value="ribbon">한 줄로 이어 보기</option><option value="rows">두 줄 고정 비교</option></select><button id="original-button">원본 보기</button></div></div>
<div class="stage" id="stage"><div class="ribbon" id="ribbon"></div><div class="playhead"></div><div id="playhead-status"><span id="playhead-bar"></span><strong id="playhead-beat"></strong><small id="playhead-signature"></small></div></div>
<div class="seekrow"><span id="elapsed">0:00</span><input id="seek" aria-label="곡 위치" type="range" min="0" max="300" step="0.01" value="0"><span id="duration">0:00</span></div>
<div class="transport"><div class="flex"><button id="home" aria-label="처음으로">↤</button><button id="play" class="primary play">▶ 재생</button><label><input id="goto" type="number" min="1" step="1" value="1" aria-label="앞으로 이동할 마디 수"> 마디</label><button id="jump">앞으로</button></div><div class="flex"><button id="slower" aria-label="1 BPM 느리게">−1</button><label><input id="rate" type="number" min="1" step="1" value="94" aria-label="재생 BPM"> BPM</label><button id="faster" aria-label="1 BPM 빠르게">+1</button></div><label><input id="click" type="checkbox" checked>클릭</label></div>
<details><summary>소리·카운트인·악보 크기</summary><div class="flex panel"><label>음악 <input id="music-volume" type="range" min="0" max="1" step="0.01"></label><label>클릭 <input id="click-volume" type="range" min="0" max="1" step="0.01"></label><label>준비 <select id="count"><option value="0">없음</option><option value="1">1마디</option><option value="2">2마디</option></select></label><label><input id="count-each" type="checkbox">반복마다 준비</label><label>악보 크기 <input id="zoom" type="range" min="0.5" max="2" step="0.05"></label></div></details>
<div class="panels"><section class="panel"><h2>구간 반복</h2><div class="flex"><label>시작 마디 <input id="loop-a" type="number" min="1" value="25"></label><label>박 <input id="loop-ab" type="number" min="1" step="0.25" value="1"></label><button id="set-a">현재 위치 A</button></div><div class="flex"><label>끝 마디 <input id="loop-b" type="number" min="1" value="29"></label><label>박 <input id="loop-bb" type="number" min="1" step="0.25" value="1"></label><button id="set-b">현재 위치 B</button></div><p class="subtle">끝 지점의 첫 음은 포함하지 않습니다. 25~28마디 반복은 끝을 29마디 1박으로 설정하세요.</p><div class="flex"><input id="loop-name" type="text" placeholder="예: 후렴 4마디" aria-label="반복 이름"><button id="save-loop">저장·반복</button><button id="new-loop">새 구간</button><button id="stop-loop">반복 끄기</button></div><div class="list" id="loops"></div></section><section class="panel"><h2>마커</h2><div class="flex"><input id="marker-name" type="text" placeholder="예: 어려운 필인" aria-label="마커 이름"><button id="add-marker">현재 위치 표시</button></div><div id="markers" class="list"></div><details><summary>백업·복원</summary><p class="subtle">백업에는 정렬·가사·연습 설정이 들어갑니다. 미디어를 포함하면 다른 기기에서도 바로 열 수 있습니다.</p><label><input id="include-media" type="checkbox" checked>PDF·음원 포함</label><div class="flex"><button id="export">백업 내보내기</button><label>가져오기 <input id="restore" type="file" accept=".zip"></label></div></details></section></div><p class="keyboard">스페이스: 재생/정지 · ←/→: 이전/다음 마디 · M: 마커 추가</p><p class="subtle" id="alignment-note">가사와 박 위치는 자동 추정 자료를 포함합니다. 어긋나는 곳은 ‘악보·가사 맞추기’에서 수정하세요.</p></section></main>
<dialog id="library-dialog"><div class="dialoghead"><h2>내 곡</h2><button data-close="library-dialog">닫기</button></div><div id="library-list"></div></dialog>
<dialog id="new-dialog"><div class="dialoghead"><h2>새 곡 준비</h2><button data-close="new-dialog">닫기</button></div><p>PDF와 음악을 골라 주세요. 마디 영역은 자동 제안 후 직접 수정할 수 있습니다.</p><form id="new-form"><p><label>가수 <input id="new-artist" type="text"></label><label>제목 <input id="new-title" required type="text" value="새 연습곡"></label></p><p><label>PDF <input id="pdf-file" required type="file" accept="application/pdf,.pdf"></label></p><p><label>음원 <input id="audio-file" required type="file" accept="audio/*,.mp3"></label></p><p><label>BPM <input id="new-bpm" type="number" min="20" max="300" value="94" required></label><label>첫 박(초) <input id="new-first" type="number" min="0" step="0.001" value="0" required></label><label>박자 <input id="new-beats" type="number" min="1" max="16" value="4" required>/ <select id="new-denominator"><option>4</option><option>8</option><option>2</option><option>16</option></select></label></p><p><label>한글 발음 가사 — 한 줄에 한 구절</label><textarea id="new-lyrics" placeholder="스베테오 테니 이레테\n스베테오 우시낫테"></textarea></p><p class="subtle">가사 초기 위치는 임시 분배입니다. 노래를 들으며 실제 시작 시각을 맞춰 주세요.</p><button type="submit" class="primary">곡 만들기</button></form></dialog>
<dialog id="editor-dialog"><div class="dialoghead"><h2>악보·가사 맞추기</h2><button data-close="editor-dialog">연습으로 돌아가기</button></div><div class="flex"><label>가수 <input id="edit-artist" type="text"></label><label>제목 <input id="edit-title" type="text"></label><label>BPM <input id="edit-bpm" type="number" min="20" max="300"></label><label>첫 박(초) <input id="edit-first" type="number" min="0" step="0.001"></label><button id="reflow">이 템포로 전체 다시 맞추기</button><button id="estimate-tempo">음원 템포 추정</button><button id="tap-tempo">박자 탭</button><span id="tap-result"></span></div><p class="subtle">전체 다시 맞추기는 기존 시간 보정을 바꿉니다. 실행 전 백업을 권합니다. 음원과 가사 원본 시각은 별도로 확인하세요.</p><div class="editor"><section><div class="flex"><label>페이지 <select id="editor-page"></select></label><label>마디 <select id="measure-select"></select></label></div><p class="subtle">원본 위를 드래그하여 마디 영역을 지정한 후 추가하거나 선택한 마디에 적용하세요.</p><div class="pagebox"><canvas id="edit-canvas"></canvas></div><div class="flex"><button id="add-region">새 마디 추가</button><button id="apply-crop">선택 마디에 영역 적용</button></div></section><section><h3>선택한 마디</h3><div class="flex"><label>이름 <input id="measure-label" type="text" style="width:95px"></label><label>박 수 <input id="measure-beats" type="number" min="1" max="16"></label><label>분모 <select id="measure-denominator"><option>4</option><option>8</option><option>2</option><option>16</option></select></label></div><div class="flex"><label>시작 초 <input id="measure-start" type="number" min="0" step="0.001"></label><label>끝 초 <input id="measure-end" type="number" min="0" step="0.001"></label><button id="apply-measure">마디 저장</button></div><label>내부 박 위치(0~1, 쉼표 구분)<input id="beat-xs" type="text" placeholder="0,0.25,0.5,0.75,1" style="width:100%"></label><p class="subtle">마디 시작부터 끝까지 박 경계의 가로 위치입니다. 비우면 균등 간격을 사용합니다.</p><div class="flex"><button id="preview-measure">이 마디 듣기</button><button id="anchor-now">현재 음악 위치를 첫 박으로</button><button id="editor-play">재생/정지</button><span id="editor-time"></span></div><div class="flex"><button id="duplicate">뒤에 복제</button><button id="split">반으로 분할</button><button id="merge">다음과 합치기</button><button id="move-left">앞으로</button><button id="move-right">뒤로</button><button id="remove-measure" class="danger">마디 삭제</button></div><h3>가사 시각</h3><p class="subtle">시작·끝은 원곡 초 단위입니다. 문장을 음절로 나누어 더 세밀하게 맞출 수 있습니다.</p><div class="flex"><button id="add-lyric">현재 위치에 가사 추가</button><button id="show-near">현재 마디 가사</button><button id="show-all">전체 가사</button></div><div class="scroll"><table><thead><tr><th>발음</th><th>시작</th><th>끝</th><th>확인</th><th></th></tr></thead><tbody id="lyric-editor"></tbody></table></div></section></div></dialog>
<dialog id="original-dialog"><div class="dialoghead"><h2>원본 악보</h2><button data-close="original-dialog">닫기</button></div><div id="page-original"></div></dialog><button id="error-notice" class="error-notice" hidden type="button"><strong>알림</strong><span id="error-message" role="alert"></span><span aria-hidden="true">×</span></button>`;
arrangeWorkspace();
function updateSongHeading() {
  const s = song();
  $("song-title").textContent = [s.artist, s.title].filter(Boolean).join(" - ");
  $("original-tempo-value").textContent = `= ${s.bpm}`;
  $("original-tempo").setAttribute("aria-label", `원곡 템포: 4분음표 = ${s.bpm} BPM`);
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
      $("play").textContent = player?.playing ? "Ⅱ 일시정지" : "▶ 재생";
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
  validateSong(r.song);
  busy = true;
  try {
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
      URL.createObjectURL(new Blob([await b.arrayBuffer()], { type: b.type })),
    ));
    pageRatios = await Promise.all(
      urls.map(async (u, index) => {
        const img = new Image();
        img.src = u;
        try {
          await img.decode();
        } catch (cause) {
          throw new Error(`악보 ${index + 1}쪽을 불러오지 못했습니다: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
        }
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
    updateSongHeading();
    val("seek").max = String(engine().duration);
    $("duration").textContent = time(engine().duration);
    syncSettings();
    renderTrack();
    renderLists();
    await persist();
    status("");
  } finally {
    busy = false;
  }
}
function syncSettings() {
  const s = song().settings;
  val("rate").value = String(Number((s.rate * song().bpm).toFixed(2)));
  val("rate").min = String(song().bpm * 0.5);
  val("rate").max = String(song().bpm * 1.2);
  val("click").checked = s.click;
  val("music-volume").value = String(s.musicVolume);
  val("click-volume").value = String(s.clickVolume);
  val("count").value = String(s.countIn);
  val("count-each").checked = s.countEach;
  val("zoom").value = String(s.zoom);
  val("view").value = s.view;
  engine().volumes();
}
function widthOf(m: Measure) {
  const r = song().regions.find((r) => r.id === m.regionId)!;
  return (
    (clamp($("stage").clientWidth * 0.245, 170, 340) *
      song().settings.zoom *
      (r.w / r.h / (pageRatios[r.page] || 1.294))) /
    2
  );
}
function measureHTML(m: Measure, i: number, width: number) {
  const s = song(),
    r = s.regions.find((r) => r.id === m.regionId)!;
  const ly = s.lyrics.filter((l) => l.time >= m.start && l.time < m.end);
  const height =
    width > 1 ? (width / r.w) * r.h * (pageRatios[r.page] || 1.294) : 165;
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
  return `<div class="measure" data-index="${i}" style="width:${width}px"><span class="label">${esc(m.label)} 마디<span class="measure-beat" aria-label="현재 박">1</span><small class="measure-signature">${m.beats}/${m.denominator}</small></span><div class="crop" style="height:${height}px;background-image:url('${urls[r.page]}');background-size:${100 / r.w}% ${100 / r.h}%;background-position:${(r.x / (1 - r.w || 1)) * 100}% ${(r.y / (1 - r.h || 1)) * 100}%"></div><div class="lyrics" style="top:${height + 6}px">${syl}</div></div>`;
}
function positionInMeasure(index: number, beat: number, width: number) {
  const s = song(),
    m = s.measures[index],
    next = s.measures[index + 1];
  const r = s.regions.find((r) => r.id === m.regionId)!;
  const nextRegion = next && s.regions.find((r) => r.id === next.regionId)!;
  const end =
    width + (next ? widthOf(next) * xAtBeat(nextRegion!, next, 0) : 0);
  return continuousX(r, m, beat, width, end);
}
function renderTrack() {
  if (!record) return;
  const s = song();
  $("practice").classList.toggle("two-rows", s.settings.view === "rows");
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
  $("ribbon").onclick = (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>("[data-index]");
    if (t) engine().seek(s.measures[Number(t.dataset.index)].start);
  };
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
    );
    const baseline = Math.max(...items.map(({ rect }) => rect.top));
    items.forEach(({ el, rect }, i) => {
      el.style.marginLeft = `${positions[i] - rect.left}px`;
      el.style.top = `${baseline - rect.top}px`;
    });
  }
}
function frame() {
  requestAnimationFrame(frame);
  if (!record || !player) return;
  const t = player.current(),
    s = song(),
    loc = locate(s, t);
  if (loc.measure) {
    const { index, measure: m, beat } = loc;
    const count = player.count();
    $("playhead-status").hidden = s.settings.view !== "ribbon";
    $("playhead-bar").textContent = `${m.label} 마디`;
    $("playhead-beat").textContent = `${count ? "준비 " : ""}${count || Math.min(m.beats, Math.floor(beat) + 1)}`;
    $("playhead-signature").textContent = `${m.beats}/${m.denominator}`;
    if (s.settings.view === "ribbon") {
      const x =
        trackOffsets[index] +
        positionInMeasure(index, beat, trackWidths[index]);
      $("ribbon").style.transform =
        `translateX(${$("stage").clientWidth / 3 - x}px)`;
    } else {
      renderRows(index);
    }
    $("ribbon").querySelectorAll<HTMLElement>("[data-index]").forEach((e) => {
      const active = Number(e.dataset.index) === index;
      e.classList.toggle("active", active);
      if (active) {
        e.querySelector(".measure-beat")!.textContent =
          `${count ? "준비 " : ""}${count || Math.min(m.beats, Math.floor(beat) + 1)}`;
      }
    });
  }
  $("elapsed").textContent = time(t);
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
    engine().pause();
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
action("play", toggle);
action("home", () => engine().seek(0));
action("jump", () => {
  const count = num("goto");
  if (!Number.isSafeInteger(count) || count < 1)
    throw Error("이동할 마디 수를 1 이상의 정수로 입력하세요.");
  const measures = song().measures;
  const index = locate(song(), engine().current()).index;
  engine().seek(measures[Math.max(index - count, 0)].start);
});
action("slower", () => rate(Number((song().settings.rate * song().bpm - 1).toFixed(2))));
action("faster", () => rate(Number((song().settings.rate * song().bpm + 1).toFixed(2))));
val("rate").onchange = () => rate(num("rate")).catch(error);
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
  engine().seek(num("seek"));
};
async function finishScrub() {
  if (!scrubbing) return;
  scrubbing = false;
  engine().seek(num("seek"));
  $("seek-position").hidden = true;
  const resume = resumeAfterScrub;
  resumeAfterScrub = false;
  if (resume) await engine().play(false, false);
  queueSave();
}
window.addEventListener("pointerup", () => finishScrub().catch(error));
window.addEventListener("pointercancel", () => finishScrub().catch(error));
// Native Safari range controls may dispatch input after pointerup.
seek.onchange = () => {
  $("seek-position").hidden = true;
  if (!scrubbing) {
    engine().seek(num("seek"));
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
  "count",
  "count-each",
  "zoom",
  "view",
])
  val(id).onchange = () => {
    if (!record) return;
    const s = song().settings;
    s.click = val("click").checked;
    s.musicVolume = num("music-volume");
    s.clickVolume = num("click-volume");
    s.countIn = num("count");
    s.countEach = val("count-each").checked;
    s.zoom = num("zoom");
    s.view = val("view").value as typeof s.view;
    engine().volumes();
    if (["view", "zoom"].includes(id)) renderTrack();
    queueSave();
  };
function loopPoint(prefix: string) {
  const s = song(),
    i = num(prefix) - 1,
    b = num(prefix === "loop-a" ? "loop-ab" : "loop-bb") - 1;
  if (i === s.measures.length && b === 0) return s.measures.at(-1)!.end;
  const m = s.measures[i];
  if (!m || b < 0 || b > m.beats)
    throw Error("반복 마디와 박 번호를 확인하세요.");
  return beatTime(m, b);
}
function useLoop(l?: Loop) {
  const p = engine(),
    was = p.playing;
  p.pause();
  p.loop = l;
  if (l) {
    p.position = l.start;
    editingLoopId = l.id;
    val("loop-name").value = l.name;
    const a = locate(song(), l.start),
      b = locate(song(), l.end);
    val("loop-a").value = String(a.index + 1);
    val("loop-ab").value = String(a.beat + 1);
    val("loop-b").value = String(b.index + 1);
    val("loop-bb").value = String(b.beat + 1);
    $("save-loop").textContent = "수정·반복";
  }
  renderLists();
  if (was) void p.play().catch(error);
}
action("save-loop", () => {
  const start = loopPoint("loop-a"),
    end = loopPoint("loop-b");
  if (end - start < 0.15 || end > engine().duration + 0.01)
    throw Error("반복 끝은 시작 뒤, 음원 끝 이전이어야 합니다.");
  const l = {
    id: editingLoopId || uid(),
    name:
      val("loop-name").value.trim() || `${num("loop-a")}~${num("loop-b")}마디`,
    start,
    end,
  };
  const at = song().loops.findIndex((x) => x.id === l.id);
  if (at < 0) song().loops.push(l);
  else song().loops[at] = l;
  useLoop(l);
  queueSave();
});
action("stop-loop", () => useLoop());
action("new-loop", () => {
  editingLoopId = undefined;
  val("loop-name").value = "";
  $("save-loop").textContent = "저장·반복";
});
for (const [id, prefix] of [
  ["set-a", "loop-a"],
  ["set-b", "loop-b"],
])
  action(id, () => {
    const l = locate(song(), engine().current());
    val(prefix).value = String(l.index + 1);
    val(prefix === "loop-a" ? "loop-ab" : "loop-bb").value = String(
      Math.floor(l.beat * 4) / 4 + 1,
    );
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
function renderLists() {
  const s = song();
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
  if (marker) engine().seek(marker.time);
};
$("markers").onclick = (e) => {
  const t = e.target as HTMLElement;
  const b = t.closest("button") as HTMLButtonElement;
  if (!b) return;
  const s = song();
  if (b.dataset.marker) {
    const m = s.markers.find((m) => m.id === b.dataset.marker)!;
    engine().seek(m.time);
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
  if (b.dataset.loop) useLoop(s.loops.find((l) => l.id === b.dataset.loop));
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
  library = await allRecords();
  $("library-list").innerHTML = library.length
    ? library
        .map(
          (r, i) =>
            `<div class="panel flex"><button data-open="${i}" class="primary">${esc(r.song.title)}</button><small>${r.song.measures.length}마디 · ${r.song.bpm} BPM</small><button data-delete="${i}" class="danger">삭제</button></div>`,
        )
        .join("")
    : "<p>아직 저장한 곡이 없습니다.</p>";
  $<HTMLDialogElement>("library-dialog").showModal();
}
action("library-button", openLibrary);
$("library-list").onclick = async (e) => {
  const b = (e.target as HTMLElement).closest("button");
  if (!b) return;
  try {
    if (b.dataset.open) {
      await activate(library[Number(b.dataset.open)]);
      $<HTMLDialogElement>("library-dialog").close();
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
        $("edit-button").hidden = true;
        document.body.classList.remove("has-song");
        $("save-html").hidden = true;
      }
      await deleteRecord(deleting);
      $<HTMLDialogElement>("library-dialog").close();
      await openLibrary();
    }
  } catch (e) {
    error(e);
  }
};
function openNew() {
  engine().pause();
  $<HTMLDialogElement>("new-dialog").showModal();
}
action("new-button", openNew);
action("welcome-new", openNew);
action("demo-button", async () => {
  status("기존 연습곡을 불러오는 중…");
  const existing = (await allRecords()).find(
    (r) => r.song.id === "real-paradis",
  );
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
$("new-form").onsubmit = async (e) => {
  e.preventDefault();
  if (busy) return;
  busy = true;
  try {
    const pdf = val("pdf-file").files?.[0],
      audio = val("audio-file").files?.[0];
    if (!pdf || !audio) throw Error("PDF와 음원을 선택하세요.");
    status("악보를 준비하고 있습니다.");
    const { pages, regions } = await renderPDF(pdf, status);
    const s: Song = {
      version: 1,
      id: uid(),
      title: val("new-title").value,
      artist: val("new-artist").value,
      bpm: num("new-bpm"),
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
      pdfName: pdf.name,
      audioName: audio.name,
    };
    reflow(s);
    const lines = val("new-lyrics")
      .value.split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    s.lyrics = lines.map((text, i) => ({
      id: uid(),
      text,
      time: s.firstBeat + (i * 4 * 60) / s.bpm,
      end: s.firstBeat + ((i + 1) * 4 * 60) / s.bpm,
      confirmed: false,
    }));
    await activate({ song: s, pdf, audio, pages });
    $<HTMLDialogElement>("new-dialog").close();
    await openEditor();
    tell(
      `${regions.length}개 마디 후보를 찾았습니다. 원본과 비교해 확인하세요.`,
    );
  } catch (e) {
    error(e);
  } finally {
    busy = false;
  }
};
async function openEditor() {
  if (!record) return;
  selected = locate(song(), engine().current()).index;
  selected = clamp(selected, 0, song().measures.length - 1);
  engine().pause();
  val("edit-title").value = song().title;
  val("edit-artist").value = song().artist || "";
  val("edit-bpm").value = String(song().bpm);
  val("edit-first").value = String(song().firstBeat);
  $("editor-page").innerHTML = urls
    .map((_, i) => `<option value="${i}">${i + 1}쪽</option>`)
    .join("");
  updateMeasureForm();
  $<HTMLDialogElement>("editor-dialog").showModal();
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
  validateSong(draft);
  engine().pause();
  record!.song = draft;
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
        `<tr data-lyric="${esc(l.id)}"><td><input data-field="text" value="${esc(l.text)}" aria-label="가사"></td><td><input data-field="time" type="number" min="0" step="0.01" value="${l.time.toFixed(2)}" aria-label="시작 초"></td><td><input data-field="end" type="number" min="0" step="0.01" value="${l.end.toFixed(2)}" aria-label="끝 초"></td><td><input data-field="confirmed" type="checkbox" ${l.confirmed ? "checked" : ""} aria-label="확인됨"></td><td><button data-split-lyric="${esc(l.id)}" title="음절로 나누기">÷</button><button data-delete-lyric="${esc(l.id)}" aria-label="가사 삭제">×</button></td></tr>`,
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
      if (field === "time") l.time = Number(input.value);
      if (field === "end") l.end = Number(input.value);
      if (field === "confirmed") l.confirmed = input.checked;
      s.lyrics.sort((a, b) => a.time - b.time);
    });
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
            time: l.time + ((l.end - l.time) * n) / letters.length,
            end: l.time + ((l.end - l.time) * (n + 1)) / letters.length,
            confirmed: false,
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
  $<HTMLDialogElement>("original-dialog").showModal();
});
action("export", async () => {
  await persist();
  const zip = new JSZip();
  zip.file("song.json", JSON.stringify(song(), null, 2));
  zip.file(
    "media-identity.json",
    JSON.stringify(await mediaIdentity(record!.pdf, record!.audio)),
  );
  zip.file(
    "README.txt",
    "드럼 연습실 백업. song.json은 원본 음원 초 단위입니다. media/가 없으면 같은 PDF·음원을 다시 선택하세요.",
  );
  if (val("include-media").checked) {
    zip.file("media/score.pdf", record!.pdf);
    zip.file("media/audio", record!.audio);
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
    const identityText = await zip.file("media-identity.json")?.async("string");
    const identity: MediaIdentity | undefined = identityText
      ? JSON.parse(identityText)
      : undefined;
    let pdf = await zip.file("media/score.pdf")?.async("blob"),
      audio = await zip.file("media/audio")?.async("blob");
    if (!pdf || !audio) {
      const saved = (await allRecords()).find((r) => r.song.id === s.id);
      if (saved) {
        pdf = saved.pdf;
        audio = saved.audio;
      } else {
        pendingRestore = s;
        pendingMedia = identity;
        $<HTMLDialogElement>("new-dialog").showModal();
        val("new-title").value = s.title;
        val("new-artist").value = s.artist || "";
        val("new-bpm").value = String(s.bpm);
        val("new-first").value = String(s.firstBeat);
        tell(
          "미디어 없는 백업입니다. 같은 PDF·음원을 선택하면 정렬을 복원합니다.",
        );
        return;
      }
    }
    await verifyMedia(identity, pdf, audio);
    const { pages } = await renderPDF(pdf, status);
    await activate({ song: s, pdf, audio, pages });
    tell("백업을 복원했습니다.");
  } catch (e) {
    error(e);
  } finally {
    val("restore").value = "";
  }
};
let pendingRestore: Song | undefined;
let pendingMedia: MediaIdentity | undefined;
$("new-dialog").addEventListener("close", () => {
  pendingRestore = undefined;
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
    if (!pdf || !audio) throw Error("동일한 원본 PDF와 음원을 선택하세요.");
    await verifyMedia(pendingMedia, pdf, audio);
    const { pages } = await renderPDF(pdf, status);
    if (pages.length !== pendingRestore.pageCount)
      throw Error("백업과 PDF 페이지 수가 다릅니다.");
    await activate({ song: pendingRestore, pdf, audio, pages });
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
    e.preventDefault();
    void toggle().catch(error);
  }
  if (e.key === "m" || e.key === "M") addMarker();
  if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
    const i =
      locate(song(), engine().current()).index +
      (e.key === "ArrowRight" ? 1 : -1);
    engine().seek(
      song().measures[clamp(i, 0, song().measures.length - 1)].start,
    );
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && player?.playing) {
    player.pause();
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
    "library-button",
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
