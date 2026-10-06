import { titleOrderFieldsHTML } from "./playback-forms";
import { readTitleOrder, saveTitleOrder, type TitleOrder } from "./song-title";
import { downloadScore } from "./download-score";
import { beginLoadTiming, recordLoadTiming } from "./load-timing";
import { icon } from "./icon-svg";
import { setIconButton } from "./icon-button";
import { installLandscapeKeyboardGuard } from "./landscape-keyboard";
import { renderKeepingTopHeader } from "./top-edge-header";
import "./help.css";
import { installHelp } from "./help";
import "./playback-base.css";
import "./playback-ui.css";
import "./portable-player.css";
import "./player-library.css";
import { t } from "./i18n";
import appVersions from "./app-versions.json";
import buildInfo from "./build-info.generated.json";
import bundledScores from "./bundled-scores.json";
import notices from "./third-party.generated.json";
import { escapeHTML } from "./html";
import { readScorePackage } from "./score-package";
import {
  listPracticeRecords,
  removePracticeRecord,
  loadPracticeRecord,
  savePracticeState,
  importPracticeRecord,
  listPracticeArchives,
  restorePracticeArchive,
} from "./practice-library";
import { mountPlaybackRuntime } from "./playback-runtime";
import { playbackInitial, type PlaybackInitial } from "./playback-export";
import { songScores, useScore } from "./song-scores";
import { createDialog } from "./dialog-ui";
import type { RecordData } from "./storage";

const root = document.getElementById("app")!;
const removeKeyboardGuard = installLandscapeKeyboardGuard();
if (import.meta.hot) import.meta.hot.dispose(removeKeyboardGuard);
let session: Awaited<ReturnType<typeof mountPlaybackRuntime>> | undefined;
function showBuildLabel() {
  const title = root.querySelector<HTMLElement>("header h1");
  if (title) title.dataset.playerBuild = `v${appVersions.player.version} · build ${buildInfo.source.slice(0, 8)}`;
}
let working = false;
let importEpoch = 0;
let libraryEpoch = 0;
function report(error: unknown) {
  const target = document.getElementById("library-status");
  if (target) {
    target.classList.add("is-error");
    target.setAttribute("role", "alert");
    target.textContent = error instanceof Error ? error.message : String(error);
  }
}
function clearLibraryError() {
  const target = document.getElementById("library-status");
  if (target) {
    target.textContent = "";
    target.classList.remove("is-error");
    target.setAttribute("role", "status");
  }
}
function reportImportError(error: unknown, stage: string) {
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  report(t("library.importError", { stage, detail }));
}
async function closePlayback() {
  if (!session) return;
  await session.flush();
  session.dispose();
  await session.flush();
  session = undefined;
}
function preferences(): PlaybackInitial {
  try {
    return {
      ...playbackInitial,
      ...JSON.parse(localStorage.getItem("drum-player-preferences") || "{}"),
    };
  } catch {
    return { ...playbackInitial };
  }
}
async function openRecord(id: string) {
  if (working) return;
  ++libraryEpoch;
  working = true;
  const timing = beginLoadTiming(buildInfo.source);
  let loadSucceeded = false;
  let measured: ReturnType<typeof timing.finish> | undefined;
  const loading = document.createElement("div");
  loading.className = "score-loading";
  loading.setAttribute("role", "status");
  loading.innerHTML = `<div class="score-loading-card"><span class="score-loading-spinner" aria-hidden="true"></span><span class="score-loading-message"></span></div>`;
  const message = loading.querySelector<HTMLElement>(".score-loading-message")!;
  message.textContent = t("library.loadingRead");
  document.body.append(loading);
  const wasInert = root.inert;
  root.inert = true;
  root.setAttribute("aria-busy", "true");
  try {
    // Let the loading indicator paint before score parsing/rendering starts.
    await new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
    timing.stage("read");
    let record = await loadPracticeRecord(id);
    timing.stage("opening");
    if (!record) throw Error(t("separation.missing"));
    await closePlayback();
    timing.stage("conversion");
    message.textContent = t("library.loadingConvert");
    const { prepareBrowserScore } = await import('./browser-score');
    record = await prepareBrowserScore(record, detail => {
      const status = document.getElementById('library-status');
      if (status) status.textContent = detail;
    }, phase => {
      timing.stage(phase);
      message.textContent = t(phase === "rendering" ? "library.loadingRender" : "library.loadingConvert");
    });
    timing.stage("screen");
    message.textContent = t("library.loadingScreen");
    const variants = songScores(record);
    session = await mountPlaybackRuntime({
      onLoading: phase => {
        timing.stage(phase);
        message.textContent = t(phase === "audio" ? "library.loadingAudio" : "library.loadingScreen");
      },
      canonicalXML: record.canonicalXML,
      root,
      song: structuredClone(record.song),
      audio: record.audio,
      pages: record.pages,
      scores: variants
        .filter((v) => v.format !== (record.song.scoreFormat ?? "pdf"))
        .map((v) => ({ song: useScore(record, v).song, pages: v.pages })),
      initial: preferences(),
      licenses: notices.entries
        .map((e) => `${e.name} ${e.version} · ${e.license}\n${e.text}`)
        .join("\n\n"),
      changed: async (song, initial) => {
        await savePracticeState(id, structuredClone(song));
        localStorage.setItem(
          "drum-player-preferences",
          JSON.stringify(initial),
        );
      },
      onLibrary: () => {
        void showLibrary().catch(report);
      },
    });
    loadSucceeded = document.body.dataset.ready === "true";
    showBuildLabel();
  } catch (e) {
    measured = timing.finish("error");
    try {
      await showLibrary();
    } catch (closeError) {
      report(closeError);
    }
    report(e);
  } finally {
    recordLoadTiming(measured ?? timing.finish(loadSucceeded ? "success" : "error"));
    loading.remove();
    root.inert = wasInert;
    root.removeAttribute("aria-busy");
    working = false;
  }
}
function resolveConflict(): Promise<"replace" | "keep-existing"> {
  return new Promise((resolve) => {
    const dialog = createDialog(
      "package-conflict",
      t("separation.conflictTitle"),
      "tool-dialog",
      root,
    );
    const body = document.createElement("div");
    body.className = "tool-body";
    body.innerHTML = `<p>${escapeHTML(t("separation.conflictBody"))}</p><div class="package-choice"><button id="keep-package" title="${escapeHTML(t("separation.keep"))}">${escapeHTML(t("separation.keep"))}</button><button id="replace-package" title="${escapeHTML(t("separation.replace"))}">${escapeHTML(t("separation.replace"))}</button></div>`;
    dialog.append(body);
    let choice: "replace" | "keep-existing" = "keep-existing";
    body
      .querySelector("#keep-package")!
      .addEventListener("click", () => dialog.close());
    body.querySelector("#replace-package")!.addEventListener("click", () => {
      choice = "replace";
      dialog.close();
    });
    dialog.addEventListener(
      "close",
      () => {
        dialog.remove();
        resolve(choice);
      },
      { once: true },
    );
    dialog.showModal();
  });
}
async function importFile(file: File, ownsLock = false) {
  if (working && !ownsLock) return;
  working = true;
  const epoch = ++importEpoch;
  const input = document.querySelector<HTMLInputElement>("#package-file");
  if (input) input.disabled = true;
  clearLibraryError();
  let stage = t("library.stagePackage");
  try {
    const record = await readScorePackage(file);
    stage = t("library.stageSave");
    let result = await importPracticeRecord(record);
    if (result.status === "conflict")
      result = await importPracticeRecord(record, await resolveConflict());
    if (epoch !== importEpoch) return;
    stage = t("library.stageList");
    await showLibrary();
  } catch (e) {
    reportImportError(e, stage);
  } finally {
    working = false;
    if (input) input.disabled = false;
  }
}
async function restore(id: string) {
  if (working) return;
  const archives = await listPracticeArchives(id);
  if (!archives.length) return;
  if (!window.confirm(t("separation.restoreConfirm"))) return;
  working = true;
  try {
    await restorePracticeArchive(archives[0].id);
    await showLibrary();
  } catch (e) {
    report(e);
  } finally {
    working = false;
  }
}
function bundledButton(score: (typeof bundledScores)[number], update = false) {
  const button = document.createElement("button");
  button.textContent = t(
    update ? "separation.updateBundled" : "separation.loadBundled",
  );
  if (update) setIconButton(button, icon("reload"), t("separation.updateBundled"));
  button.title = t(update ? "library.tipUpdate" : "library.tipDownload");
  button.onclick = async () => {
    if (working || button.disabled) return;
    working = true;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    const label = button.innerHTML;
    clearLibraryError();
    try {
      const blob = await downloadScore(`${import.meta.env.BASE_URL}${score.file}`, percent => {
        button.textContent = percent === null
          ? t("library.downloading")
          : t("library.downloadPercent", { percent });
      });
      button.textContent = t("library.savingScore");
      await importFile(new File([blob], score.file, { type: "application/zip" }), true);
    } catch (error) {
      reportImportError(error, t("library.stageDownload"));
    } finally {
      working = false;
      button.disabled = false;
      button.removeAttribute("aria-busy");
      button.innerHTML = label;
    }
  };
  return button;
}
export async function showLibrary() {
  const epoch = ++libraryEpoch;
  await closePlayback();
  if (epoch !== libraryEpoch) return;
  document.body.classList.remove("has-song");
  delete document.body.dataset.ready;
  root.className = "player-library";
  renderKeepingTopHeader(root, `<header class="library-header"><h1>${escapeHTML(t("separation.appTitle"))}</h1><div class="library-header-actions"><div class="library-import"><button id="import-package" class="primary" title="${escapeHTML(t("library.tipImport"))}">${escapeHTML(t("separation.add"))}</button><p id="library-empty-hint" class="library-empty-hint" hidden>${escapeHTML(t("separation.empty"))}</p></div><a title="${escapeHTML(t("library.tipBooking"))}" class="library-booking" href="https://m.booking.naver.com/booking/6/bizes/1512990?theme=place&amp;entry=pll&amp;lang=ko&amp;area=pll" target="_blank" rel="noopener noreferrer">${escapeHTML(t("library.booking"))}</a>${import.meta.env.DEV ? `<a class="library-booking" title="${escapeHTML(t("separation.openEditor"))}" href="./editor.html">${escapeHTML(t("separation.openEditor"))}</a>` : ""}<div class="actions library-common-actions"><button id="library-refresh" type="button" aria-label="${escapeHTML(t("library.refresh"))}" title="${escapeHTML(t("library.refresh"))}">${icon("reload")}</button><button id="library-settings" class="icon-button" type="button" title="${escapeHTML(t("icons.message059"))}" aria-label="${escapeHTML(t("icons.message059"))}">${icon("settings")}</button></div></div></header><main class="library-main" aria-label="${escapeHTML(t("library.screenName"))}"><input type="file" id="package-file" accept=".drumscore,application/zip" hidden><p id="library-status" role="status"></p><div id="practice-records" class="library-sections"><div id="favorite-practice-records" class="practice-records" hidden></div><section class="library-section" aria-labelledby="basic-library-title"><div class="library-heading"><h2 id="basic-library-title">${escapeHTML(t("library.basicExercise"))}</h2></div><div id="basic-practice-records" class="practice-records"></div></section><section class="library-section" aria-labelledby="personal-library-title"><div class="library-heading"><h2 id="personal-library-title">${escapeHTML(t("separation.library"))}</h2></div><div id="personal-practice-records" class="practice-records"></div></section></div></main>`);
  showBuildLabel();
  root.querySelector("#library-refresh")!.addEventListener("click", () => location.reload());
  root.querySelector<HTMLButtonElement>("#library-settings")!.onclick = () => {
    if (root.querySelector("#settings-dialog")) return;
    const opener = root.querySelector<HTMLButtonElement>("#library-settings")!;
    const dialog = createDialog("settings-dialog", t("icons.message059"), "tool-dialog library-settings-dialog", root);
    const panel = document.createElement("section");
    panel.className = "tool-body settings-panel";
    panel.dataset.settingsPanel = "screen";
    panel.innerHTML = `<h3>${t("settings.screenTitle")}</h3>${titleOrderFieldsHTML()}<p class="library-settings-status" role="status"></p>`;
    dialog.append(panel);
    const buttons = Array.from(panel.querySelectorAll<HTMLButtonElement>("[data-title-order]"));
    const sync = () => buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.titleOrder === readTitleOrder())));
    sync();
    buttons.forEach(button => button.onclick = () => {
      try {
        saveTitleOrder(button.dataset.titleOrder as TitleOrder);
        sync();
        root.querySelectorAll(".practice-card-title").forEach(heading => {
          const title = heading.querySelector("h3"), artist = heading.querySelector("p");
          if (title && artist) heading.prepend(readTitleOrder() === "artist-first" ? artist : title);
        });
        panel.querySelector(".library-settings-status")!.textContent = "";
      } catch (error) { panel.querySelector(".library-settings-status")!.textContent = String(error); }
    });
    dialog.addEventListener("close", () => { dialog.remove(); opener.focus({ preventScroll: true }); }, { once:true });
    dialog.showModal();
  };
  document
    .querySelector("#import-package")!
    .addEventListener("click", () =>
      document.querySelector<HTMLInputElement>("#package-file")!.click(),
    );
  document
    .querySelector("#package-file")!
    .addEventListener("change", (event) => {
      const input = event.currentTarget as HTMLInputElement;
      const file = input.files?.[0];
      input.value = "";
      if (file) void importFile(file);
    });
  installHelp(root);
  // Keep this render tied to its own container across asynchronous reads.
  const basicList = document.getElementById("basic-practice-records")!;
  const personalList = document.getElementById("personal-practice-records")!;
  const favoriteList = document.getElementById("favorite-practice-records")!;
  // Earlier score editions retain separate records, but belong to the same section.
  const basicIds = new Set(bundledScores
    .filter((s) => "category" in s && s.category === "basic")
    .flatMap((s) => [s.id, ...("legacyIds" in s ? s.legacyIds ?? [] : [])]));
  const listFor = (id: string) => basicIds.has(id) ? basicList : personalList;
  let favorites = new Set<string>();
  try {
    const stored: unknown = JSON.parse(localStorage.getItem("drum-practice:favorite-scores") || "[]");
    if (Array.isArray(stored)) favorites = new Set(stored.filter((id): id is string => typeof id === "string"));
  } catch { /* Invalid or unavailable preferences leave the score list usable. */ }
  const sortFavorites = () => {
    const cards = [favoriteList, basicList, personalList].flatMap(list => Array.from(list.children)) as HTMLElement[];
    cards.sort((a, b) => Number(a.dataset.libraryOrder) - Number(b.dataset.libraryOrder));
    for (const card of cards) {
      const id = card.dataset.scoreId!;
      (favorites.has(id) ? favoriteList : listFor(id)).append(card);
    }
    favoriteList.hidden = !favoriteList.childElementCount;
    basicList.closest<HTMLElement>("section")!.hidden = !basicList.childElementCount;
    personalList.closest<HTMLElement>("section")!.hidden = !personalList.childElementCount;
  };
  const appendCard = (id: string, card: HTMLElement) => {
    card.dataset.scoreId = id;
    const heading = card.querySelector(".practice-card-title");
    const artist = heading?.querySelector("p");
    if (artist && readTitleOrder() === "artist-first") heading!.prepend(artist);
    card.querySelectorAll<HTMLElement>("h3, p").forEach(text => { text.title = text.textContent || ""; });
    const favorite = document.createElement("button");
    favorite.type = "button";
    favorite.className = "library-favorite";
    const refreshFavorite = () => {
      setIconButton(favorite, icon("star"), t(favorites.has(id) ? "library.removeFavorite" : "library.addFavorite"));
      favorite.setAttribute("aria-pressed", String(favorites.has(id)));
    };
    refreshFavorite();
    favorite.onclick = () => {
      const next = new Set(favorites);
      if (next.has(id)) next.delete(id); else next.add(id);
      try {
        localStorage.setItem("drum-practice:favorite-scores", JSON.stringify([...next]));
        favorites = next;
        refreshFavorite();
        sortFavorites();
        favorite.focus({ preventScroll: true });
      } catch (error) { report(error); }
    };
    card.prepend(favorite);
    listFor(id).append(card);
  };
  const records = await listPracticeRecords();
  if (epoch !== libraryEpoch) return;
  for (const record of records) {
    const item = document.createElement("article");
    item.className = "practice-card";
    item.innerHTML = `<div class="practice-card-title"><h3>${escapeHTML(record.song.title)}</h3><p>${escapeHTML(record.song.artist || "")}</p></div><div class="practice-card-actions"><button class="primary" data-open title="${escapeHTML(t("library.tipOpen"))}">${escapeHTML(t("separation.open"))}</button></div>`;
    item.querySelector("[data-open]")!.addEventListener("click", () => {
      void openRecord(record.song.id);
    });
    const remove = document.createElement("button");
    remove.textContent = t("separation.remove");
    remove.title = t("library.tipRemove");
    remove.onclick = async () => {
      if (working || !window.confirm(t("separation.removeConfirm"))) return;
      working = true;
      try {
        await removePracticeRecord(record.song.id);
        await showLibrary();
      } catch (error) {
        report(error);
      } finally {
        working = false;
      }
    };
    item.querySelector(".practice-card-actions")!.append(remove);
    const bundled = bundledScores.find((s) => s.id === record.song.id);
    if (bundled)
      item
        .querySelector(".practice-card-actions")!
        .append(bundledButton(bundled, true));
    const archived = await listPracticeArchives(record.song.id);
    if (epoch !== libraryEpoch) return;
    if (archived.length) {
      const button = document.createElement("button");
      setIconButton(button, icon("rewind"), t("separation.restore"));
      button.title = t("library.tipRestore");
      button.onclick = () => {
        void restore(record.song.id).catch(report);
      };
      item.querySelector(".practice-card-actions")!.append(button);
    }
    appendCard(record.song.id, item);
  }
  const live = new Set(records.map((r) => r.song.id));
  for (const score of bundledScores.filter((s) => !live.has(s.id))) {
    const item = document.createElement("article");
    item.className = "practice-card";
    const title = document.createElement("h3");
    title.textContent = score.title;
    const button = bundledButton(score);
    const heading = document.createElement("div");
    heading.className = "practice-card-title";
    heading.append(title);
    item.append(heading, button);
    appendCard(score.id, item);
  }

  const archives = await listPracticeArchives();
  if (epoch !== libraryEpoch) return;
  const removed = archives.filter((a) => !live.has(a.record.song.id));
  const seen = new Set<string>();
  for (const archive of removed) {
    const id = archive.record.song.id;
    if (seen.has(id)) continue;
    seen.add(id);
    const item = document.createElement("article");
    item.className = "practice-card";
    const name = document.createElement("h3");
    name.textContent = archive.record.song.title;
    const button = document.createElement("button");
    button.textContent = t("separation.restoreRemoved");
    button.title = t("library.tipRestoreRemoved");
    button.onclick = () => {
      void restore(id).catch(report);
    };
    const heading = document.createElement("div");
    heading.className = "practice-card-title";
    const artist = document.createElement("p");
    artist.textContent = archive.record.song.artist || "";
    heading.append(name, artist);
    item.append(heading, button);
    appendCard(id, item);
  }
  // Catalog order is stable even when stored records are read in a different order.
  const order = new Map(bundledScores.map((score, index) => [score.id, index]));
  const cards = Array.from(basicList.children) as HTMLElement[];
  cards.sort((a, b) => (order.get(a.dataset.scoreId!) ?? Infinity) - (order.get(b.dataset.scoreId!) ?? Infinity));
  basicList.append(...cards);
  let libraryOrder = 0;
  for (const list of [basicList, personalList]) {
    Array.from(list.children).forEach(card => { (card as HTMLElement).dataset.libraryOrder = String(libraryOrder++); });
  }
  const empty = !personalList.childElementCount;
  sortFavorites();
  root.querySelector<HTMLElement>("#library-empty-hint")!.hidden = !empty;
  if (empty) root.querySelector("#import-package")!.setAttribute("aria-describedby", "library-empty-hint");
}
void showLibrary().catch(report);

window.addEventListener("focus", () => {
  if (root.classList.contains("player-library") && !working && !document.querySelector("dialog[open]"))
    void showLibrary().catch(report);
});
