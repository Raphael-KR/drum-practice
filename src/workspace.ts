// Arrange existing controls without duplicating their state or event handlers.
export type SettingsCategory = "screen" | "score" | "lyrics" | "info" | "file";
const settingsTitles: Record<SettingsCategory, string> = {
  screen: "화면", score: "악보", lyrics: "가사", info: "곡 정보", file: "파일",
};
export function selectSettingsCategory(category: SettingsCategory) {
  for (const panel of document.querySelectorAll<HTMLElement>("[data-settings-panel]"))
    panel.hidden = panel.dataset.settingsPanel !== category;
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-settings-category]")) {
    const active = button.dataset.settingsCategory === category;
    button.classList.toggle("primary", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  }
  document.getElementById("settings-detail-heading")!.textContent = settingsTitles[category];
}
export function openSettings(category: SettingsCategory = "screen") {
  selectSettingsCategory(category);
  (document.getElementById("settings-dialog") as HTMLDialogElement).showModal();
}
export function closeSettings() {
  (document.getElementById("settings-dialog") as HTMLDialogElement).close();
}
export function arrangeWorkspace() {
  const el = (id: string) => document.getElementById(id)!;
  const practice = el("practice");
  document.getElementById("app")!.classList.add("touch-workspace");
  practice.querySelector(".statusline")!.append(el("error-notice"));
  document.querySelector(".brand")!.innerHTML =
    '<h1 id="song-title">드럼 연습실</h1><button id="original-tempo" type="button" hidden disabled title="연습 BPM 설정" aria-label="연습 BPM 설정" aria-haspopup="dialog"><svg class="tempo-note" viewBox="0 0 18 32" aria-hidden="true"><ellipse cx="6.5" cy="26" rx="6" ry="4" transform="rotate(-22 6.5 26)" fill="currentColor"/><path d="M11.5 25V2" stroke="currentColor" stroke-width="2"/></svg><span id="original-tempo-value"></span></button>';

  const panel = (id: string, title: string, host: Element, caption = title) => {
    const d = document.createElement("dialog");
    d.id = id;
    d.className = "tool-dialog";
    d.setAttribute("aria-label", title);
    d.innerHTML = `<div class="dialoghead"><h2>${title}</h2><button data-close="${id}">닫기</button></div><div class="tool-body"></div>`;
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
  rewind.id = "goto"; rewind.type = "number"; rewind.min = "1"; rewind.max = "10"; rewind.step = "1"; rewind.value = "1";
  rewind.setAttribute("aria-label", "되감을 마디 수");
  rewind.title = "드래그하여 되감을 마디 수 조절";
  oldGoto.replaceWith(rewind);

  const tempo = el("tempo-dialog");
  const tempoControl = document.createElement("label");
  tempoControl.className = "tempo-number";
  const rate = el("rate");
  rate.setAttribute("aria-label", "연습 BPM");
  rate.title = "좌우 또는 상하 드래그로 1 BPM씩 조절";
  tempoControl.append(rate);
  tempoControl.insertAdjacentHTML("beforeend", "<span>BPM</span>");
  el("tempo-options").before(tempoControl);
  tempo.querySelector("p")!.textContent = "숫자를 오른쪽·위로 드래그하면 빨라지고, 왼쪽·아래로 드래그하면 느려집니다.";
  tempo.insertAdjacentHTML("beforeend", '<button id="tempo-reset">원곡 BPM으로</button>');
  el("tempo-presets").remove(); el("slower").remove(); el("faster").remove();
  transportRight.insertAdjacentHTML("afterbegin", '<label class="progress-number" title="드래그하여 곡 위치 이동 · 탭하여 마커 열기"><input id="progress-percent" type="text" inputmode="none" readonly role="slider" min="0" max="100" step="1" value="0" aria-label="곡 진행률, 드래그하여 이동, 탭하여 마커 열기" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span aria-hidden="true">%</span></label>');
  panel("marker-dialog", "마커", transportRight).append(markers);
  const soundBody = panel("sound-dialog", "소리 · 준비", transportRight, "소리");
  soundBody.append(...sound.children);
  sound.remove();
  const oldCount = el("count");
  const count = document.createElement("input");
  count.id = "count"; count.type = "number"; count.min = "0"; count.max = "2"; count.step = "1"; count.value = "0";
  count.setAttribute("aria-label", "준비 마디 수, 0이면 없음");
  oldCount.replaceWith(count);
  count.insertAdjacentText("afterend", "마디");
  el("click-volume").closest("label")!.childNodes[0].textContent = "메트로놈 ";

  const repeat = document.createElement("section");
  repeat.id = "repeat-controls";
  repeat.setAttribute("aria-label", "현재 마디 중심 반복");
  repeat.innerHTML = '<span class="repeat-heading">현재 마디 중심</span><div class="repeat-presets">' + [1, 2, 3, 4].map(radius => `<button type="button" data-loop-radius="${radius}" aria-pressed="false">앞뒤 ${radius}</button>`).join("") + '</div><output id="loop-summary" aria-live="polite">반복 꺼짐</output><button id="recenter-loop" title="지금 연주하는 마디를 중심으로 반복">현재 마디로</button><button id="quick-stop-loop">해제</button>';
  transport.after(repeat);
  panel("loop-dialog", "반복 구간 조정", repeat, "조정").append(loops);
  loops.querySelector("h2")!.remove();
  markers.querySelector("h2")!.remove();
  const loopHelp = loops.querySelector("p")!;
  loopHelp.id = "loop-range-help";
  loopHelp.textContent = "시작 마디부터 끝 마디까지 모두 반복합니다. 예: 24–26마디는 총 3마디입니다.";
  loops.insertAdjacentHTML("afterbegin", '<p class="subtle">숫자를 좌우·상하로 드래그하여 구간을 조절하세요.</p>');
  const precise = document.createElement("div");
  precise.className = "loop-precision";
  precise.innerHTML = '<label><input id="loop-precise" type="checkbox">박 단위로 정밀 조정</label><div id="loop-beat-controls" class="flex" hidden></div>';
  loopHelp.before(precise);
  for (const [id, title] of [["loop-ab", "시작 박"], ["loop-bb", "끝 경계 박"]]) {
    const label = el(id).closest("label")!;
    label.childNodes[0].textContent = title + " ";
    precise.lastElementChild!.append(label);
  }
  precise.lastElementChild!.insertAdjacentHTML("beforeend", '<span class="subtle">정밀 모드에서는 끝 경계의 음을 포함하지 않습니다.</span>');
  el("set-a").textContent = "현재 마디부터";
  el("set-b").textContent = "현재 마디까지";
  el("save-loop").before(Object.assign(document.createElement("button"), { id: "apply-loop", className: "primary", textContent: "구간 적용" }));
  el("save-loop").textContent = "이름 붙여 저장";

  const quick = document.createElement("section");
  quick.className = "quick-section";
  quick.innerHTML = '<div class="quick-title"><strong>마커</strong><span id="active-loop" hidden>반복 꺼짐</span><button id="quick-add-marker" type="button" title="현재 위치에 마커 추가">현재 위치 표시</button></div><div id="quick-markers" class="quick-markers"></div>';
  repeat.after(quick);

  const settings = document.createElement("dialog");
  settings.id = "settings-dialog";
  settings.setAttribute("aria-labelledby", "settings-heading");
  settings.innerHTML = '<div class="dialoghead"><h2 id="settings-heading">설정</h2><button data-close="settings-dialog">닫기</button></div><div class="settings-layout"><nav class="settings-nav" aria-label="설정 분류"></nav><div class="settings-detail"><h3 id="settings-detail-heading">화면</h3></div></div>';
  el("app").append(settings);
  const gear = document.createElement("button");
  gear.id = "open-settings-dialog";
  gear.textContent = "설정";
  gear.setAttribute("aria-haspopup", "dialog");
  gear.onclick = () => openSettings();
  actions.append(gear);
  const settingsPanel = (category: SettingsCategory, id: string, buttonId: string) => {
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
  const screenBody = settingsPanel("screen", "screen-dialog", "open-screen-dialog");
  const viewChoices = document.createElement("fieldset");
  viewChoices.id = "view-choices";
  viewChoices.innerHTML = '<legend>보기</legend>' + [
    ["ribbon", "한 줄로 이어 보기"], ["rows", "두 줄 고정 비교"], ["compare", "PDF · MusicXML 검수"],
  ].map(([value, label]) => `<label><input type="radio" name="score-view" value="${value}"><span>${label}</span></label>`).join("");
  el("view").hidden = true;
  screenBody.append(viewChoices);
  viewChoices.addEventListener("change", e => {
    const radio = e.target as HTMLInputElement;
    if (radio.name !== "score-view") return;
    (el("view") as HTMLSelectElement).value = radio.value;
    el("view").dispatchEvent(new Event("change"));
  });
  const reviewHelp = document.createElement("div");
  reviewHelp.id = "review-help";
  reviewHelp.innerHTML = '<p id="review-availability"></p><button id="review-add-score">이 곡에 악보 추가</button>';
  screenBody.append(reviewHelp, el("view"), el("zoom").closest("label")!);
  screenBody.insertAdjacentHTML("beforeend", '<div class="settings-group"><label class="settings-switch"><span><strong>전체화면으로 악보 보기</strong><small>악보를 열 때 전체화면으로 전환합니다.</small></span><input id="auto-fullscreen" type="checkbox"></label><button id="fullscreen" type="button">전체화면</button><p id="fullscreen-status" class="subtle" role="status"></p></div>');
  const scoreSettings = settingsPanel("score", "score-settings", "open-score-settings");
  scoreSettings.insertAdjacentHTML("beforeend", '<p class="subtle">악보 원본을 확인하고, 마디 영역과 박 위치를 조절합니다. 다른 형식의 악보는 파일에서 추가할 수 있습니다.</p>');
  el("edit-button").textContent = "악보 편집";
  scoreSettings.append(el("original-button"), el("edit-button"));
  const lyricSettings = settingsPanel("lyrics", "lyrics-settings", "open-lyrics-settings");
  lyricSettings.innerHTML = '<p class="subtle">가사를 마디와 박에 맞추고, 발음과 음절 길이를 수정합니다.</p><button id="lyrics-button" type="button">가사 편집</button>';
  const infoSettings = settingsPanel("info", "info-settings", "open-info-settings");
  infoSettings.innerHTML = '<p class="subtle">제목·가수·작사·작곡 정보와 악보의 원곡 템포를 관리합니다.</p><button id="metadata-button" type="button">곡 정보 편집</button>';
  const backupBody = settingsPanel("file", "backup-dialog", "open-backup-dialog");
  el("save-html").textContent = "HTML 저장";
  backupBody.append(el("save-html"), ...backup.children, el("portable-note"), el("alignment-note"), practice.querySelector(".keyboard")!);
  const log = document.createElement("section");
  log.className = "work-log";
  log.innerHTML = '<h3>최근 작업 기록</h3><p class="subtle">이 화면을 연 동안의 최근 5건입니다.</p>';
  el("busy").textContent = "아직 기록이 없습니다.";
  log.append(el("busy"));
  backupBody.append(log);
  backup.remove();
  practice.querySelector(".panels")!.remove();
  selectSettingsCategory("screen");

  const seek = el("seek");
  const wrap = document.createElement("div");
  wrap.className = "seek-control";
  seek.before(wrap);
  wrap.append(seek);
  wrap.insertAdjacentHTML("beforeend", '<output id="seek-position" hidden></output>');
  (seek.closest(".seekrow") as HTMLElement).hidden = true;
  practice.insertAdjacentHTML("beforeend", '<p id="score-gesture-hint" class="subtle">악보 탭: 재생·정지 · 두 번 탭: 해당 마디로 · 드래그: 앞뒤 이동 · 정지 중 스크롤: 악보 탐색</p>');
  el("stage").setAttribute("aria-describedby", "score-gesture-hint");

  // Editing has explicit tabs; lyrics and metadata no longer sit below a PDF page.
  const editor = el("editor-dialog");
  const metadata = editor.querySelector(":scope > .flex")!;
  const metadataNote = metadata.nextElementSibling!;
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
  metaPane.append(metadata, metadataNote);
  score.id = "editor-score";
  editor.append(metaPane, lyricPane);
  const tabs = document.createElement("div");
  tabs.className = "editor-tabs";
  tabs.innerHTML =
    '<button data-pane="score">마디 · 영역</button><button data-pane="lyrics">가사</button><button data-pane="meta">곡 정보 · 템포</button>';
  editor.querySelector(".dialoghead")!.after(tabs);
  tabs
    .querySelectorAll<HTMLButtonElement>("button")
    .forEach((b) => (b.onclick = () => selectEditorPane(b.dataset.pane!)));
  metadata.insertAdjacentHTML(
    "beforeend",
    '<button id="save-metadata">곡 정보 저장</button>',
  );
  lyricPane.insertAdjacentHTML(
    "beforeend",
    '<div class="pager"><button id="lyrics-prev">이전</button><span id="lyrics-page"></span><button id="lyrics-next">다음</button></div>',
  );
  selectEditorPane("score");
}
export function selectEditorPane(name: string) {
  for (const id of ["score", "lyrics", "meta"]) {
    document.getElementById(`editor-${id}`)!.hidden = id !== name;
    const b = document.querySelector(`[data-pane="${id}"]`)!;
    b.classList.toggle("primary", id === name);
    b.setAttribute("aria-pressed", String(id === name));
  }
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
    pager!.innerHTML = `<button ${state.page === 0 ? "disabled" : ""} data-prev>이전</button><span>${state.page + 1} / ${pages}</span><button ${state.page === pages - 1 ? "disabled" : ""} data-next>다음</button>`;
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
