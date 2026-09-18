// Arrange existing controls without duplicating their state or event handlers.
export function arrangeWorkspace() {
  const el = (id: string) => document.getElementById(id)!;
  const practice = el("practice");
  practice.querySelector(".statusline")!.append(el("error-notice"));
  document.querySelector(".brand")!.innerHTML =
    '<h1 id="song-title">드럼 연습실</h1><button id="original-tempo" type="button" hidden disabled title="원곡 BPM으로 돌아가기" aria-label="원곡 BPM으로 돌아가기"><svg class="tempo-note" viewBox="0 0 18 32" aria-hidden="true"><ellipse cx="6.5" cy="26" rx="6" ry="4" transform="rotate(-22 6.5 26)" fill="currentColor"/><path d="M11.5 25V2" stroke="currentColor" stroke-width="2"/></svg><span id="original-tempo-value"></span></button>';
  const dock = document.createElement("nav");
  dock.className = "practice-dock";
  dock.setAttribute("aria-label", "연습 도구");
  practice.append(dock);
  dock.insertAdjacentHTML(
    "beforebegin",
    '<section class="quick-section"><div class="quick-title"><strong>연습 지점</strong><span id="active-loop">반복 꺼짐</span></div><div id="quick-markers" class="quick-markers"></div></section>',
  );
  const panel = (id: string, title: string) => {
    const d = document.createElement("dialog");
    d.id = id;
    d.className = "tool-dialog";
    d.innerHTML = `<div class="dialoghead"><h2>${title}</h2><button data-close="${id}">닫기</button></div><div class="tool-body"></div>`;
    document.getElementById("app")!.append(d);
    const b = document.createElement("button");
    b.textContent = title;
    b.id = `open-${id}`;
    b.onclick = () => d.showModal();
    dock.append(b);
    return d.querySelector(".tool-body")!;
  };
  const loops = el("loops").closest(".panel")!;
  const markers = el("markers").closest(".panel")!;
  const backup = markers.querySelector("details")!;
  backup.querySelector("summary")!.remove();
  const sound = practice.querySelector("details")!;
  sound.querySelector("summary")!.remove();
  panel("loop-dialog", "구간 반복").append(loops);
  panel("marker-dialog", "마커").append(markers);
  const soundBody = panel("sound-dialog", "소리 · 준비");
  soundBody.append(...sound.children);
  sound.remove();
  const screenBody = panel("screen-dialog", "화면");
  screenBody.append(
    el("view"),
    el("zoom").closest("label")!,
    el("original-button"),
  );
  const full = document.createElement("button");
  full.id = "fullscreen";
  full.textContent = "전체화면";
  full.onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen)
        await document.documentElement.requestFullscreen();
      else {
        full.textContent = "이 브라우저에서는 전체화면을 지원하지 않습니다";
      }
    } catch {
      full.textContent = "브라우저의 전체화면 기능을 사용하세요";
    }
  };
  document.querySelector("header .actions")!.append(full);
  el("edit-button").textContent = "악보 편집";
  dock.append(el("edit-button"));
  const lyricButton = document.createElement("button");
  lyricButton.id = "lyrics-button";
  lyricButton.textContent = "가사 편집";
  dock.append(lyricButton);
  const metaButton = document.createElement("button");
  metaButton.id = "metadata-button";
  metaButton.textContent = "곡 정보";
  dock.append(metaButton);
  const backupBody = panel("backup-dialog", "파일 · 안내");
  backupBody.append(
    ...backup.children,
    el("portable-note"),
    el("alignment-note"),
    practice.querySelector(".keyboard")!,
  );
  const log = document.createElement("section");
  log.className = "work-log";
  log.innerHTML = '<h3>최근 작업 기록</h3><p class="subtle">이 화면을 연 동안의 최근 5건입니다.</p>';
  el("busy").textContent = "아직 기록이 없습니다.";
  log.append(el("busy"));
  backupBody.append(log);
  backup.remove();
  practice.querySelector(".panels")!.remove();
  loops.querySelector("h2")!.remove();
  markers.querySelector("h2")!.remove();
  const seek = el("seek");
  const wrap = document.createElement("div");
  wrap.className = "seek-control";
  seek.before(wrap);
  wrap.append(seek);
  wrap.insertAdjacentHTML(
    "beforeend",
    '<output id="seek-position" hidden></output>',
  );
  el("save-html").textContent = "HTML 저장";

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
    '<button id="save-metadata">가수 · 제목 저장</button>',
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
