import { beginLoadTiming, recordLoadTiming } from "./load-timing";
import { icon } from "./icon-svg";
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
  if (target)
    target.textContent = error instanceof Error ? error.message : String(error);
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
    body.innerHTML = `<p>${escapeHTML(t("separation.conflictBody"))}</p><div class="package-choice"><button id="keep-package">${escapeHTML(t("separation.keep"))}</button><button id="replace-package">${escapeHTML(t("separation.replace"))}</button></div>`;
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
async function importFile(file: File) {
  if (working) return;
  working = true;
  const epoch = ++importEpoch;
  const input = document.querySelector<HTMLInputElement>("#package-file");
  if (input) input.disabled = true;
  try {
    const record = await readScorePackage(file);
    let result = await importPracticeRecord(record);
    if (result.status === "conflict")
      result = await importPracticeRecord(record, await resolveConflict());
    if (epoch !== importEpoch) return;
    await showLibrary();
    const status = document.getElementById("library-status");
    if (status)
      status.textContent = t(
        result.status === "kept" ? "separation.kept" : "separation.saved",
      );
  } catch (e) {
    report(e);
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
  button.onclick = async () => {
    if (working || button.disabled) return;
    button.disabled = true;
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}${score.file}`, {
        cache: "no-cache",
      });
      if (!response.ok) throw new Error(t("separation.bundledFailed"));
      await importFile(
        new File([await response.blob()], score.file, {
          type: "application/zip",
        }),
      );
    } catch (error) {
      report(error);
    } finally {
      button.disabled = false;
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
  renderKeepingTopHeader(root, `<header class="library-header"><h1>${escapeHTML(t("separation.appTitle"))}</h1><div class="library-header-actions"><button id="library-refresh" type="button" aria-label="${escapeHTML(t("library.refresh"))}" title="${escapeHTML(t("library.refresh"))}">${icon("reload")}</button><a class="library-booking" href="https://m.booking.naver.com/booking/6/bizes/1512990?theme=place&amp;entry=pll&amp;lang=ko&amp;area=pll" target="_blank" rel="noopener noreferrer">${escapeHTML(t("library.booking"))}</a>${import.meta.env.DEV ? `<a href="./editor.html">${escapeHTML(t("separation.openEditor"))}</a>` : ""}</div></header><main class="library-main"><div class="library-heading"><h2>${escapeHTML(t("separation.library"))}</h2><button id="import-package" class="primary">${escapeHTML(t("separation.add"))}</button><input type="file" id="package-file" accept=".drumscore,application/zip" hidden></div><p id="library-status" role="status"></p><div id="practice-records" class="practice-records"></div></main>`);
  showBuildLabel();
  root.querySelector("#library-refresh")!.addEventListener("click", () => location.reload());
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
  const list = document.getElementById("practice-records")!;
  const records = await listPracticeRecords();
  if (epoch !== libraryEpoch) return;
  if (!records.length) {
    list.textContent = t("separation.empty");
  }
  for (const record of records) {
    const item = document.createElement("article");
    item.className = "practice-card";
    item.innerHTML = `<div><h3>${escapeHTML(record.song.title)}</h3><p>${escapeHTML(record.song.artist || "")}</p></div><div class="practice-card-actions"><button class="primary" data-open>${escapeHTML(t("separation.open"))}</button></div>`;
    item.querySelector("[data-open]")!.addEventListener("click", () => {
      void openRecord(record.song.id);
    });
    const remove = document.createElement("button");
    remove.textContent = t("separation.remove");
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
      button.textContent = t("separation.restore");
      button.onclick = () => {
        void restore(record.song.id).catch(report);
      };
      item.querySelector(".practice-card-actions")!.append(button);
    }
    list.append(item);
  }
  const live = new Set(records.map((r) => r.song.id));
  for (const score of bundledScores.filter((s) => !live.has(s.id))) {
    const item = document.createElement("article");
    item.className = "practice-card";
    const title = document.createElement("h3");
    title.textContent = score.title;
    const button = bundledButton(score);
    item.append(title, button);
    list.append(item);
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
    button.onclick = () => {
      void restore(id).catch(report);
    };
    item.append(name, button);
    list.append(item);
  }
}
void showLibrary().catch(report);

window.addEventListener("focus", () => {
  if (root.classList.contains("player-library") && !working && !document.querySelector("dialog[open]"))
    void showLibrary().catch(report);
});
