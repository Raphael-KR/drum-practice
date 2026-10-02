import { createDialog } from "./dialog-ui";
import { hasLyrics, scoreAssets } from "./score-assets";
export { hasLyrics } from "./score-assets";
import { bindNumericDrag } from "./numeric-drag";
import { installScoreEditorLayout } from "./score-editor-layout";
import { t as i18nText } from "./i18n";
import { installUIStandard, uiNameForId } from "./ui-standard";
import { fullScoreLabels } from "./full-score-labels";
import { displayPage } from "./score-pages";
import { icon } from "./icons";
import { songScores } from "./song-scores";
import { openSettingsChild, selectEditorPane } from "./workspace";
import { isPortable } from "./portable";
import type { RecordData } from "./storage";
import { escapeHTML } from "./html";
export { escapeHTML } from "./html";
export function lyricDocument(r: RecordData) {
  if (r.song.lyricText) return r.song.lyricText;
  // Display only: preserve canonical order and explicit MusicXML line/word boundaries.
  const doc = r.canonicalXML
    ? new DOMParser().parseFromString(r.canonicalXML, "application/xml")
    : undefined;
  const parts = [...(doc?.querySelectorAll("part") || [])];
  const nodes = parts
    .map((p) =>
      [...p.querySelectorAll("note > lyric")].filter((n) =>
        n.querySelector("text"),
      ),
    )
    .find(
      (ns) =>
        ns.length === r.song.lyrics.length &&
        ns.every(
          (n, i) =>
            n.querySelector("text")?.textContent === r.song.lyrics[i].text,
        ),
    );
  const measureIndex = new Map(r.song.measures.map((m, i) => [m.id, i]));
  const sectionStarts = new Set<number>();
  parts.forEach((part) =>
    [...part.querySelectorAll(":scope > measure")].forEach((m, i) => {
      const mark = m.querySelector("rehearsal")?.textContent?.trim();
      if (mark && !/^(intro|interlude|ending|outro)$/i.test(mark))
        sectionStarts.add(i);
    }),
  );
  let result = "",
    previous = "",
    previousSyllabic = "",
    previousMeasure = -1;
  r.song.lyrics.forEach((l, i) => {
    const t = l.text.trim(),
      n = nodes?.[i];
    const syllabic = n?.querySelector("syllabic")?.textContent || "single";
    if (!t) return;
    const continuation =
      (/-$/.test(previous) && /^[a-z]/i.test(t)) ||
      ["begin", "middle"].includes(previousSyllabic);
    const cjk =
      /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]$/u.test(previous) &&
      /^[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/u.test(t);
    const measure = l.scorePosition
      ? measureIndex.get(l.scorePosition.measureId)
      : undefined;
    // Rehearsal marks are real score structure, not inferred verse labels.
    const newSection =
      measure !== undefined &&
      [...sectionStarts].some((i) => i > previousMeasure && i <= measure);
    if (result && newSection && !continuation)
      result = result.trimEnd() + "\n\n";
    if (measure !== undefined) previousMeasure = measure;
    if (continuation) result = result.replace(/-$/, "");
    else if (result && !result.endsWith("\n") && !cjk) result += " ";
    result += t;
    if (n?.querySelector("end-paragraph")) result += "\n\n";
    else if (n?.querySelector("end-line")) result += "\n";
    previous = t;
    previousSyllabic = syllabic;
  });
  return result.trim();
}
export function scoreChips(r?: RecordData) {
  const assets = scoreAssets(r);
  return [
    ["musicxml", i18nText("term.MusicXML"), assets.musicxml],
    ["pdf", i18nText("term.PDF"), assets.pdf],
    ["lyrics", i18nText("main.message279"), assets.lyrics],
    ["audio", i18nText("main.message282"), assets.audio],
  ]
    .map(
      ([key, label, has]) =>
        `<span class="asset-chip asset-${key} ${has ? "" : "asset-missing"}" aria-label="${label} ${has ? i18nText("score-management.message482") : i18nText("score-management.message483")}">${label}${has ? "" : i18nText("score-management.message484")}</span>`,
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
    return createDialog(id, title, "management-dialog");
  };
  const files = dialog(
      "song-files-dialog",
      i18nText("score-management.message485"),
    ),
    out = dialog("song-export-dialog", i18nText("score-management.message486")),
    lyrics = dialog(
      "full-lyrics-dialog",
      i18nText("score-management.message487"),
    ),
    upload = dialog(
      "lyric-upload-dialog",
      i18nText("score-management.message488"),
    );
  const run = (f: () => unknown) => () => {
    try {
      Promise.resolve(f()).catch(h.error);
    } catch (e) {
      h.error(e);
    }
  };
  const row = (label: string, sub: string, name: string, id: string) =>
    `<button id="${id}" class="management-row">${icon(name)}<span><strong>${uiNameForId(id, label)}</strong>${sub ? `<small>${sub}</small>` : ""}</span></button>`;
  // Keep old handler targets, but expose one editing entry point.
  $("score-edit-actions").hidden = true;
  $("backup-dialog").hidden = true;
  const summary = document.createElement("section");
  summary.id = "score-summary";
  summary.className = "asset-chips score-header-chips";
  const overview = document.createElement("section");
  overview.id = "score-overview";
  const editEntry = document.createElement("button");
  editEntry.id = "score-edit-entry";
  editEntry.className = "score-edit-entry";
  editEntry.innerHTML =
    icon("pencil") + `<span>${i18nText("score.editEntry")}</span>`;
  editEntry.onclick = () =>
    document.dispatchEvent(new Event("open-score-editor"));
  const libraryActions = document.createElement("div");
  libraryActions.className = "score-library-actions";
  libraryActions.append(editEntry);
  for (const [id, target, label, glyph] of [
    ["score-open-library", "welcome-library", "icons.message054", "library"],
    ["score-add-new", "welcome-new", "icons.message055", "plus"],
  ] as const) {
    const button = document.createElement("button");
    button.id = id;
    button.innerHTML = icon(glyph) + `<span>${i18nText(label)}</span>`;
    button.onclick = () => {
      ($("settings-dialog") as HTMLDialogElement).close();
      $(target).click();
    };
    libraryActions.append(button);
  }
  $("score-settings").prepend(overview, libraryActions);
  const editor = $("editor-dialog") as HTMLDialogElement;
  editor.classList.add("score-workspace-dialog");
  const measureCount = document.createElement("input");
  measureCount.id = "edit-measure-count";
  measureCount.readOnly = true;
  measureCount.dataset.numericDrag = "off";
  const measureCountLabel = document.createElement("label");
  measureCountLabel.textContent = i18nText("score.measureCountLabel");
  measureCountLabel.append(measureCount);
  const filePane = document.createElement("div");
  filePane.className = "connection-file-actions";
  const metaTab = editor.querySelector('[data-pane="meta"]')!;
  editor.querySelector(".editor-tabs")!.prepend(metaTab);
  const tabs = editor.querySelector<HTMLElement>(".editor-tabs")!;
  tabs.id = "score-workspace-tabs";
  tabs.setAttribute("role", "tablist");
  editor.querySelector(".dialoghead h2")!.after(summary, tabs);
  const head = editor.querySelector<HTMLElement>(".dialoghead")!;
  const tools = editor.querySelector<HTMLElement>(".editor-history-tools")!;
  head.insertBefore(tools, head.querySelector('[data-close="editor-dialog"]'));
  const fields = $("editor-meta").querySelector(".metadata-fields")!;
  fields.prepend($("edit-title").closest("label")!);
  $("edit-title")
    .closest("label")!
    .after(
      $("edit-original-title").closest("label")!,
      $("edit-artist").closest("label")!,
    );
  const metadataCard = document.createElement("section");
  metadataCard.className = "metadata-card";
  fields.before(metadataCard);
  metadataCard.append(fields);
  const timing =
    $("editor-meta").querySelector<HTMLElement>(".metadata-timing")!;
  const metrics = document.createElement("div");
  metrics.className = "timing-metrics";
  const bpmField = $("edit-bpm").closest("label")!;
  bpmField.before(metrics);
  metrics.append(measureCountLabel, bpmField);
  $("edit-bpm").closest("label")!.firstChild!.textContent =
    i18nText("editor.baseBpm");
  bindNumericDrag($("edit-bpm") as HTMLInputElement, { wheel: true });
  selectEditorPane("meta");
  files.insertAdjacentHTML(
    "beforeend",
    row(
      i18nText("term.MusicXML"),
      i18nText("score-management.message490"),
      "library",
      "file-xml",
    ) +
      row(i18nText("score-management.message492"), "", "screen", "file-pdf") +
      row(
        i18nText("score-management.message494"),
        "",
        "sliders",
        "file-audio",
      ) +
      row(i18nText("score-management.message486"), "", "export", "file-export"),
  );
  $("file-pdf").remove();
  $("file-xml").querySelector("strong")!.textContent = i18nText(
    "score.files.replace",
  );
  $("file-xml").onclick = () => $("replace-score-button").click();

  $("file-export").onclick = () => {
    refresh();
    out.showModal();
  };
  while (files.children.length > 1) filePane.append(files.children[1]);
  files.remove();
  timing.querySelector(".timing-fields")!.before(filePane);
  const exportTools = document.createElement("div");
  exportTools.className = "connection-export";
  const exportButton = $("file-export");
  exportButton.setAttribute(
    "aria-label",
    i18nText("score-management.message486"),
  );
  exportButton.title = i18nText("score-management.message486");
  exportButton.innerHTML = icon("export");
  exportTools.append($("reflow"), exportButton);
  timing.append(exportTools);
  $("file-audio").querySelector("strong")!.textContent = i18nText(
    "score.files.replaceAudio",
  );
  $("file-xml").querySelector("small")?.remove();
  const audio = document.createElement("input");
  audio.type = "file";
  audio.accept = "audio/*";
  audio.hidden = true;
  filePane.append(audio);
  $("file-audio").onclick = () => audio.click();
  audio.onchange = run(async () => {
    if (audio.files?.[0]) await h.replaceAudio(audio.files[0]);
    audio.value = "";
    refresh();
  });
  out.insertAdjacentHTML(
    "beforeend",
    '<p id="export-song-name"></p><div id="export-choices">' +
      String(
        [
          [
            "xml",
            i18nText("term.MusicXML"),
            i18nText("score-management.message490"),
          ],
          [
            "pdf",
            i18nText("score-management.message492"),
            i18nText("score-management.message495"),
          ],
          [
            "audio",
            i18nText("score-management.message494"),
            i18nText("score-management.message496"),
          ],
          [
            "html",
            i18nText("score-management.message497"),
            i18nText("score-management.message498"),
          ],
        ]
          .map(
            ([v, l, s]) =>
              `<label class="management-row"><input type="checkbox" value="${v}" ${v === "xml" ? "checked" : ""}><span><strong>${l}</strong><small>${s}</small></span></label>`,
          )
          .join(""),
      ) +
      '</div><p id="html-export-note" class="subtle"></p><div class="management-footer"><span id="export-selection" role="status"></span><button id="export-selected" class="icon-button primary" aria-label="' +
      i18nText("score-management.message499") +
      '">' +
      String(icon("export")) +
      "</button></div>",
  );
  const selected = () =>
    Array.from(
      out.querySelectorAll<HTMLInputElement>("input:checked:not(:disabled)"),
    ).map((i) => i.value);
  function selection() {
    const n = selected().length;
    $("export-selection").textContent = n
      ? i18nText("score-management.message501", {
          n: n,
          value2: n > 1 ? i18nText("score-management.message500") : "",
        })
      : i18nText("score-management.message502");
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
  full.innerHTML =
    icon("lyrics") +
    ("<strong>" + i18nText("score-management.message487") + "</strong>");
  const uploadButton = document.createElement("button");
  uploadButton.id = "editor-lyric-upload";
  uploadButton.className = "management-row";
  uploadButton.innerHTML =
    icon("lyrics") +
    "<strong>" +
    i18nText("score-management.message488") +
    "</strong>";
  const emptyLyrics = document.createElement("p");
  emptyLyrics.textContent = i18nText("lyrics.empty");
  const replaceButton = document.createElement("button");
  replaceButton.id = "editor-lyric-replace";
  replaceButton.className = "management-row";
  replaceButton.innerHTML =
    icon("lyrics") + "<strong>" + i18nText("lyrics.replace") + "</strong>";
  const openUpload = () => {
    upload.querySelector("h2")!.textContent = i18nText(
      hasLyrics(h.get()) ? "lyrics.replace" : "score-management.message488",
    );
    upload.showModal();
  };
  uploadButton.onclick = replaceButton.onclick = openUpload;
  const lyricPane = $("editor-lyrics");
  const lyricPanel = document.createElement("section");
  lyricPanel.className = "lyric-edit-panel";
  while (lyricPane.firstChild) lyricPanel.append(lyricPane.firstChild);
  lyricPane.append(lyricPanel);
  const lyricTools = document.createElement("nav");
  lyricTools.className = "lyric-screen-actions";
  lyricTools.setAttribute("aria-label", i18nText("lyrics.screenActions"));
  lyricTools.append(uploadButton, full, replaceButton, $("import-vocal"));
  const controls = $("show-all").parentElement!;
  controls.className = "lyric-list-toolbar";
  const filterGroup = document.createElement("div");
  filterGroup.className = "lyric-list-filter";
  filterGroup.setAttribute("role", "group");
  filterGroup.setAttribute("aria-label", i18nText("lyrics.displayRange"));
  const filterLabel = document.createElement("span");
  filterLabel.textContent = i18nText("lyrics.displayRange");
  filterGroup.append(filterLabel, $("show-all"), $("show-near"));
  controls.prepend(filterGroup);
  lyricPane.append(lyricTools, emptyLyrics, lyricPanel);
  full.onclick = () => {
    refresh();
    lyrics.showModal();
  };
  const original = $("original-button");
  original.textContent = i18nText("main.message206");
  original.className = "management-row";
  const originalTools = document.createElement("div");
  originalTools.className = "score-source-tools";
  const svgButton = document.createElement("button");
  svgButton.id = "svg-full-button";
  svgButton.className = "management-row";
  svgButton.textContent = i18nText("score-management.message503");
  const svgDialog = dialog(
    "svg-full-dialog",
    i18nText("score-management.message503"),
  );
  const svgPages = document.createElement("div");
  svgPages.className = "full-svg-pages";
  svgDialog.append(svgPages);
  let svgURLs: string[] = [];
  const releaseSVG = () => {
    svgPages.replaceChildren();
    svgURLs.forEach(URL.revokeObjectURL);
    svgURLs = [];
  };
  svgDialog.addEventListener("close", releaseSVG);
  svgButton.onclick = run(async () => {
    const score =
      h.get() && songScores(h.get()!).find((s) => s.format === "musicxml");
    if (!score?.pages.length)
      throw Error(i18nText("score-management.message504"));
    svgButton.disabled = true;
    releaseSVG();
    try {
      for (const [i, page] of score.pages.entries()) {
        const decoded = await displayPage(page);
        const labels = fullScoreLabels(await decoded.text());
        const url = URL.createObjectURL(decoded);
        svgURLs.push(url);
        const figure = document.createElement("figure");
        const caption = document.createElement("figcaption");
        caption.textContent = i18nText("score-management.message505", {
          value1: i + 1,
          value2: score.pages.length,
        });
        const img = document.createElement("img");
        img.src = url;
        img.alt = i18nText("score-management.message506", { value1: i + 1 });
        const surface = document.createElement("div");
        surface.className = "full-svg-surface";
        surface.append(img);
        for (const position of labels) {
          const label = document.createElement("span");
          label.className = "full-svg-measure-label";
          label.textContent = position.label;
          label.setAttribute(
            "aria-label",
            i18nText("marker-slots.message378", { value1: position.label }),
          );
          label.style.left = `${position.left}%`;
          label.style.top = `${position.top}%`;
          surface.append(label);
        }
        figure.append(caption, surface);
        svgPages.append(figure);
      }
      svgDialog.showModal();
      svgDialog.scrollTop = 0;
    } catch (e) {
      releaseSVG();
      throw e;
    } finally {
      svgButton.disabled = false;
    }
  });
  originalTools.append(original, svgButton);
  $("editor-score").prepend(originalTools);
  installScoreEditorLayout();
  $("editor-dialog").querySelector("h2")!.textContent = i18nText(
    "score-management.message489",
  );
  $("apply-measure").textContent = i18nText("score-management.message508");
  document.querySelector('[data-pane="score"]')!.textContent =
    i18nText("score.tab.edit");
  document.querySelector('[data-pane="meta"]')!.textContent = i18nText(
    "score-management.message509",
  );
  for (const pane of ["meta", "score", "lyrics"]) {
    const tab = tabs.querySelector<HTMLButtonElement>(`[data-pane="${pane}"]`)!;
    const label = tab.textContent || "";
    tab.title = label;
    tab.setAttribute("aria-label", label);
    tab.textContent = label;
  }
  $("lyrics-button").hidden = $("metadata-button").hidden = true;
  upload.insertAdjacentHTML(
    "beforeend",
    '<label class="form-field">' +
      i18nText("score-management.message510") +
      '<input id="lyric-text-file" type="file" accept=".txt,.lrc,text/plain"></label><label class="form-field" for="lyric-text-upload">' +
      i18nText("score-management.message511") +
      '</label><textarea id="lyric-text-upload" rows="10" placeholder="' +
      i18nText("score-management.message512") +
      '"></textarea><p class="subtle">' +
      i18nText("score-management.message513") +
      '</p><div class="form-footer"><button id="lyric-upload-apply" class="icon-button primary" aria-label="' +
      i18nText("score-management.message514") +
      '">✓</button></div>',
  );
  ($("lyric-text-file") as HTMLInputElement).onchange = run(async () => {
    const f = ($("lyric-text-file") as HTMLInputElement).files?.[0];
    if (f)
      ($("lyric-text-upload") as HTMLTextAreaElement).value = await f.text();
  });
  $("lyric-upload-apply").onclick = run(async () => {
    const text = ($("lyric-text-upload") as HTMLTextAreaElement).value.trim();
    if (!text) throw Error(i18nText("score-management.message515"));
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
    "<summary>" +
    i18nText("score-management.message516") +
    "</summary>" +
    row(
      i18nText("score-management.message517"),
      i18nText("score-management.message518"),
      "export",
      "library-backup-export",
    ) +
    row(
      i18nText("score-management.message519"),
      i18nText("score-management.message520"),
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
    overview.innerHTML = r
      ? `<h3>${escapeHTML(r.song.title)}</h3><p class="subtle">${i18nText("score-management.message521", { value2: escapeHTML(r.song.artist || ""), value3: r.song.measures.length, value4: r.song.bpm })}</p><div class="asset-chips">${scoreChips(r)}</div>`
      : "";
    overview.hidden = !r;
    editEntry.disabled = !r;
    editEntry.hidden = !r;
    libraryActions.classList.toggle("empty-score-actions", !r);
    summary.innerHTML = r ? scoreChips(r) : "";
    measureCount.value = r ? String(r.song.measures.length) : "";
    editor.hidden = !r;
    const present = hasLyrics(r);
    emptyLyrics.hidden = uploadButton.hidden = present;
    full.hidden = replaceButton.hidden = !present;
    if (!r) return;
    $("export-song-name").textContent = r.song.title;
    const html = out.querySelector<HTMLInputElement>('input[value="html"]')!;
    html.disabled = !r.audio.size;
    $("html-export-note").textContent = r.audio.size
      ? i18nText("score-management.message523", {
          value1: songScores(r)
            .map((s) =>
              s.format === "musicxml"
                ? i18nText("term.MusicXML")
                : i18nText("term.PDF"),
            )
            .join(" + "),
        })
      : i18nText("score-management.message524");
    const pdf = songScores(r).some((s) => s.format === "pdf");
    (out.querySelector('input[value="pdf"]') as HTMLInputElement).disabled =
      !pdf;
    (out.querySelector('input[value="audio"]') as HTMLInputElement).disabled =
      !r.audio.size;
    selection();
    original.hidden = !pdf;
    svgButton.hidden = !songScores(r).some(
      (s) => s.format === "musicxml" && s.pages.length > 0,
    );
    body.replaceChildren();
    const text = lyricDocument(r);
    if (!text) {
      body.textContent = i18nText("score-management.message525");
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
  installUIStandard("web", $("app"));
  return { refresh };
}
