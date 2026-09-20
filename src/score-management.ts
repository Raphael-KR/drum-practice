import { icon } from "./icons";
import { songScores } from "./song-scores";
import { openSettingsChild } from "./workspace";
import { isPortable } from "./portable";
import type { RecordData } from "./storage";
export const escapeHTML = (s: unknown) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function lyricDocument(r: RecordData) {
  if (r.song.lyricText) return r.song.lyricText;
  // Existing rhythm lyrics preserve their sequence; do not invent verse boundaries.
  return r.song.lyrics
    .map((l) => l.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
export function scoreChips(r?: RecordData) {
  const formats = r ? songScores(r).map((s) => s.format) : [];
  return [
    ["musicxml", "MusicXML", !!r?.canonicalXML || formats.includes("musicxml")],
    ["pdf", "PDF", formats.includes("pdf")],
    [
      "lyrics",
      "가사",
      !!r && (!!r.song.lyricText?.trim() || r.song.lyrics.length > 0),
    ],
    ["audio", "음원", !!r?.audio.size],
  ]
    .map(
      ([key, label, has]) =>
        `<span class="asset-chip asset-${key} ${has ? "" : "asset-missing"}" aria-label="${label} ${has ? "있음" : "없음"}">${label}${has ? "" : " 없음"}</span>`,
    )
    .join("");
}
interface Host {
  get: () => RecordData | undefined;
  uploadLyrics: (s: string) => Promise<void>;
  exportFiles: (k: string[]) => Promise<void>;
  exportAll: () => Promise<void>;
  restoreAll: (f: File) => Promise<void>;
  replaceAudio: (f: File) => Promise<void>;
  error: (e: unknown) => void;
}
export function setupScoreManagement(h: Host) {
  const $ = (id: string) => document.getElementById(id)!;
  const dialog = (id: string, title: string) => {
    const d = document.createElement("dialog");
    d.id = id;
    d.className = "management-dialog";
    d.innerHTML = `<div class="dialoghead"><h2>${title}</h2><button class="icon-button close-button" aria-label="닫기">${icon("close")}</button></div>`;
    d.querySelector("button")!.onclick = () => d.close();
    document.body.append(d);
    return d;
  };
  const files = dialog("song-files-dialog", "파일"),
    out = dialog("song-export-dialog", "내보내기"),
    lyrics = dialog("full-lyrics-dialog", "전체 가사 보기"),
    upload = dialog("lyric-upload-dialog", "가사 업로드");
  const run = (f: () => unknown) => () => {
    try {
      Promise.resolve(f()).catch(h.error);
    } catch (e) {
      h.error(e);
    }
  };
  const row = (label: string, sub: string, name: string, id: string) =>
    `<button id="${id}" class="management-row">${icon(name)}<span><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ""}</span></button>`;
  // Keep old handler targets, but expose one editing entry point.
  $("score-edit-actions").hidden = true;
  $("backup-dialog").hidden = true;
  const summary = document.createElement("section");
  summary.id = "score-summary";
  const open = document.createElement("div");
  open.className = "management-actions";
  open.innerHTML =
    row("편집", "악보 · 가사 · 곡 정보", "pencil", "manage-edit") +
    row("파일", "추가 · 교체 · 내보내기", "folder", "manage-files");
  $("score-settings").prepend(summary, open);
  $("manage-edit").onclick = () => $("edit-button").click();
  $("manage-files").onclick = () => {
    refresh();
    openSettingsChild(files);
  };
  files.insertAdjacentHTML(
    "beforeend",
    row("MusicXML", "악보 · 가사 · 곡 정보", "library", "file-xml") +
      row("원본 PDF 악보", "", "screen", "file-pdf") +
      row("가사 업로드", "텍스트를 MusicXML에 저장", "lyrics", "file-lyrics") +
      row("원본 음원", "", "sliders", "file-audio") +
      row("내보내기", "", "export", "file-export"),
  );
  $("file-xml").onclick = $("file-pdf").onclick = () =>
    $("replace-score-button").click();
  $("file-lyrics").onclick = () => upload.showModal();
  $("file-export").onclick = () => {
    refresh();
    out.showModal();
  };
  const audio = document.createElement("input");
  audio.type = "file";
  audio.accept = "audio/*";
  audio.hidden = true;
  files.append(audio);
  $("file-audio").onclick = () => audio.click();
  audio.onchange = run(async () => {
    if (audio.files?.[0]) await h.replaceAudio(audio.files[0]);
    audio.value = "";
    refresh();
  });
  out.insertAdjacentHTML(
    "beforeend",
    `<p id="export-song-name"></p><div id="export-choices">${[
      ["xml", "MusicXML", "악보 · 가사 · 곡 정보"],
      ["pdf", "원본 PDF 악보", "저장된 원본 악보"],
      ["audio", "원본 음원", "저장된 음원"],
      [
        "html",
        "연습용 HTML",
        "이 곡 재생 전용 · 곡 선택·악보 관리·편집 이력 제외",
      ],
    ]
      .map(
        ([v, l, s]) =>
          `<label class="management-row"><input type="checkbox" value="${v}" ${v === "xml" ? "checked" : ""}><span><strong>${l}</strong><small>${s}</small></span></label>`,
      )
      .join(
        "",
      )}</div><div class="management-footer"><span id="export-selection" role="status"></span><button id="export-selected" class="icon-button primary" aria-label="선택한 파일 내보내기">${icon("export")}</button></div>`,
  );
  const selected = () =>
    Array.from(
      out.querySelectorAll<HTMLInputElement>("input:checked:not(:disabled)"),
    ).map((i) => i.value);
  function selection() {
    const n = selected().length;
    $("export-selection").textContent = n
      ? `${n}개 선택${n > 1 ? " · ZIP으로 묶어 저장" : ""}`
      : "내보낼 파일을 선택하세요";
    ($("export-selected") as HTMLButtonElement).disabled = !n;
  }
  out.onchange = selection;
  $("export-selected").onclick = run(async () => {
    const b = $("export-selected") as HTMLButtonElement;
    b.disabled = true;
    try {
      await h.exportFiles(selected());
    } finally {
      selection();
    }
  });
  const full = document.createElement("button");
  full.id = "full-lyrics-button";
  full.className = "management-row";
  full.innerHTML = icon("lyrics") + "<strong>전체 가사 보기</strong>";
  $("editor-lyrics").prepend(full);
  full.onclick = () => {
    refresh();
    lyrics.showModal();
  };
  const original = $("original-button");
  original.textContent = "원본 악보 보기";
  original.className = "management-row";
  $("editor-score").prepend(original);
  $("editor-dialog").querySelector("h2")!.textContent = "편집";
  $("save-metadata").textContent = "곡 정보 적용";
  $("apply-measure").textContent = "마디 적용";
  document.querySelector('[data-pane="score"]')!.textContent = "악보";
  document.querySelector('[data-pane="meta"]')!.textContent = "곡 정보";
  $("lyrics-button").hidden = $("metadata-button").hidden = true;
  upload.insertAdjacentHTML(
    "beforeend",
    '<label>텍스트 파일 <input id="lyric-text-file" type="file" accept=".txt,text/plain"></label><label for="lyric-text-upload">가사 텍스트</label><textarea id="lyric-text-upload" rows="10" placeholder="가사를 붙여넣으세요. 1절·후렴 등의 섹션과 줄바꿈을 유지합니다."></textarea><p class="subtle">가사 텍스트를 저장합니다. 마디·박 위치는 별도로 교정합니다.</p><button id="lyric-upload-apply" class="icon-button primary" aria-label="가사 업로드 적용">✓</button>',
  );
  ($("lyric-text-file") as HTMLInputElement).onchange = run(async () => {
    const f = ($("lyric-text-file") as HTMLInputElement).files?.[0];
    if (f)
      ($("lyric-text-upload") as HTMLTextAreaElement).value = await f.text();
  });
  $("lyric-upload-apply").onclick = run(async () => {
    const text = ($("lyric-text-upload") as HTMLTextAreaElement).value.trim();
    if (!text) throw Error("가사를 입력하세요.");
    await h.uploadLyrics(text);
    refresh();
    upload.close();
  });
  const body = document.createElement("article");
  body.id = "full-lyrics-content";
  body.className = "lyric-reading";
  lyrics.append(body);
  const backup = document.createElement("details");
  backup.id = "library-backup";
  backup.innerHTML =
    "<summary>백업 관리</summary>" +
    row(
      "전체 곡 백업",
      "보관 중인 모든 곡",
      "export",
      "library-backup-export",
    ) +
    row(
      "전체 곡 복원",
      "전체 백업 ZIP 불러오기",
      "folder",
      "library-backup-restore",
    );
  $("library-dialog").append(backup);
  const restore = document.createElement("input");
  restore.type = "file";
  restore.accept = ".zip";
  restore.hidden = true;
  backup.append(restore);
  $("library-backup-export").onclick = run(h.exportAll);
  $("library-backup-restore").onclick = () => restore.click();
  restore.onchange = run(async () => {
    try {
      if (restore.files?.[0]) await h.restoreAll(restore.files[0]);
    } finally {
      restore.value = "";
    }
  });
  function refresh() {
    const r = h.get();
    summary.innerHTML = r
      ? `<h3>${escapeHTML(r.song.title)}</h3><p class="subtle">${escapeHTML(r.song.artist || "")} · ${r.song.measures.length}마디 · ♩ ${r.song.bpm}</p><div class="asset-chips">${scoreChips(r)}</div>`
      : "<p>곡을 열면 악보를 관리할 수 있습니다.</p>";
    for (const id of ["manage-edit", "manage-files"])
      ($(id) as HTMLButtonElement).disabled = !r;
    if (!r) return;
    $("export-song-name").textContent = r.song.title;
    const pdf = songScores(r).some((s) => s.format === "pdf");
    (out.querySelector('input[value="pdf"]') as HTMLInputElement).disabled =
      !pdf;
    (out.querySelector('input[value="audio"]') as HTMLInputElement).disabled =
      !r.audio.size;
    selection();
    original.hidden = !pdf;
    body.replaceChildren();
    const text = lyricDocument(r);
    if (!text) {
      body.textContent = "등록된 가사가 없습니다.";
      return;
    }
    for (const line of text.split("\n")) {
      const section =
        /^(?:\[.*\]|\d+절|후렴|브리지|인트로|아웃트로|Verse\s*\d*|Chorus|Bridge)$/i.test(
          line.trim(),
        );
      const e = document.createElement(section ? "h3" : "p");
      e.textContent = line || "\u00a0";
      body.append(e);
    }
  }
  if (isPortable) {
    $("open-score-settings").hidden = true;
    $("score-settings").hidden = true;
    for (const id of [
      "library-button",
      "welcome",
      "library-dialog",
      "new-dialog",
      "editor-dialog",
      "song-files-dialog",
      "song-export-dialog",
      "lyric-upload-dialog",
      "full-lyrics-dialog",
    ])
      $(id).hidden = true;
  }
  refresh();
  return { refresh };
}
