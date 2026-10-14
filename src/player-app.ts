import { installPracticeFileControls } from "./practice-file-controls";
import { matchPracticeAudio, type PracticeFileEntry } from "./practice-file";
import { checkAudioBeforeDecode } from "./audio-import-limits";
import {
  practiceFileKind,
  readAudioPractice,
  ensureAudioBeatTracking,
} from "./audio-practice";
import { libraryHTML } from "./player-library-view";
import { setupAudioPractice } from "./audio-practice-setup";
import { RETIRED_SCORE_ID } from "./score-database";
import { titleOrderFieldsHTML } from "./playback-forms";
import { recordingTempoUpgrade } from "./recording-tempo";
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
import "./player.css";
import "./player-library.css";
import "./audio-practice.css";
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
  savePracticeRecord,
  addPracticeRecords,
  savePracticeCanonicalMetadata,
  importPracticeRecord,
} from "./practice-library";
import { mountPlaybackRuntime } from "./playback-runtime";
import { playbackInitial, type PlaybackInitial } from "./playback-initial";
import { songScores, useScore } from "./song-scores";
import { createDialog } from "./dialog-ui";
import type { RecordData } from "./storage";

const PLAYER_PREFERENCES_KEY = "drum-player-preferences";
const FAVORITES_KEY = "drum-practice:favorite-scores";

const root = document.getElementById("app")!;
const removeKeyboardGuard = installLandscapeKeyboardGuard();
if (import.meta.hot) import.meta.hot.dispose(removeKeyboardGuard);
let session: Awaited<ReturnType<typeof mountPlaybackRuntime>> | undefined;
function showBuildLabel() {
  const title = root.querySelector<HTMLElement>("header h1");
  if (title)
    title.dataset.playerBuild = `v${appVersions.player.version} · build ${buildInfo.source.slice(0, 8)}`;
}
let working = false;
let filePickerOpen = false;
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
  const detail =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);
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
      ...JSON.parse(localStorage.getItem(PLAYER_PREFERENCES_KEY) || "{}"),
    };
  } catch {
    return { ...playbackInitial };
  }
}
function downloadLabel(percent: number | null): string {
  return percent === null
    ? t("library.downloading")
    : t("library.downloadPercent", { percent });
}
function syncCardTitleOrder(heading: Element) {
  const title = heading.querySelector("h3");
  const artist = heading.querySelector("p");
  if (title && artist)
    heading.prepend(readTitleOrder() === "artist-first" ? artist : title);
}
/** Compare bundled content without discarding saved practice state for an unchanged score. */
async function hasSameBundledContent(
  current: RecordData,
  incoming: RecordData,
): Promise<boolean> {
  if (
    current.canonicalXML !== incoming.canonicalXML ||
    current.song.title !== incoming.song.title ||
    current.song.artist !== incoming.song.artist
  )
    return false;
  const oldAssets = [current.pdf, current.audio, ...current.pages];
  const newAssets = [incoming.pdf, incoming.audio, ...incoming.pages];
  if (oldAssets.length !== newAssets.length) return false;
  const matches = await Promise.all(
    oldAssets.map(async (asset, index) => {
      const next = newAssets[index];
      if (asset.size !== next.size || asset.type !== next.type) return false;
      const [a, b] = await Promise.all([
        asset.arrayBuffer(),
        next.arrayBuffer(),
      ]);
      const bytes = new Uint8Array(b);
      return new Uint8Array(a).every((byte, i) => byte === bytes[i]);
    }),
  );
  return matches.every(Boolean);
}
async function audioPracticeRecords() {
  return (await listPracticeRecords()).filter(record => !!record.song.audioPractice);
}
async function findPracticeAudio(entries: PracticeFileEntry[]) {
  return matchPracticeAudio(entries, (await listPracticeRecords()).map(record => record.audio));
}
async function restorePracticeFile(records: RecordData[]) {
  if (working) throw Error(t("practiceFile.working"));
  working = true;
  try {
    for (const record of records)
      await checkAudioBeforeDecode(new File([record.audio], record.song.audioName, {type: record.audio.type}));
    // Validate and commit the complete batch before replacing the visible screen.
    await addPracticeRecords(records);
    await showLibrary();
    const status = root.querySelector<HTMLElement>("#library-status");
    if (status) status.textContent = t("practiceFile.restored", {count: records.length});
  } finally { working = false; }
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
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => setTimeout(resolve, 0)),
    );
    timing.stage("read");
    const basic = bundledScores.find(
      (score) =>
        score.id === id && "category" in score && score.category === "basic",
    );
    let record;
    if (basic) {
      const blob = await downloadScore(
        `${import.meta.env.BASE_URL}${basic.file}`,
        (percent) => {
          message.textContent = downloadLabel(percent);
        },
      );
      record = await readScorePackage(blob);
      if (record.song.id !== id) throw Error("Basic score ID mismatch");
      const current = await loadPracticeRecord(id);
      if (current && (await hasSameBundledContent(current, record)))
        record = current;
      else await importPracticeRecord(record);
    } else record = await loadPracticeRecord(id);
    timing.stage("opening");
    if (!record) throw Error(t("separation.missing"));
    const tracked = await ensureAudioBeatTracking(record, (text) => {
      message.textContent = text;
    });
    if (tracked !== record) {
      await savePracticeRecord(tracked);
      record = tracked;
    }
    const upgradedXML = await recordingTempoUpgrade(record);
    if (
      upgradedXML &&
      (await savePracticeCanonicalMetadata(
        id,
        record.canonicalXML!,
        upgradedXML,
      ))
    ) {
      record.canonicalXML = upgradedXML;
    }
    await closePlayback();
    timing.stage("conversion");
    message.textContent = t("library.loadingConvert");
    const { prepareBrowserScore } = await import("./browser-score");
    record = await prepareBrowserScore(
      record,
      (detail) => {
        const status = document.getElementById("library-status");
        if (status) status.textContent = detail;
      },
      (phase) => {
        timing.stage(phase);
        message.textContent = t(
          phase === "rendering"
            ? "library.loadingRender"
            : "library.loadingConvert",
        );
      },
    );
    timing.stage("screen");
    message.textContent = t("library.loadingScreen");
    const variants = songScores(record);
    session = await mountPlaybackRuntime({
      onLoading: (phase) => {
        timing.stage(phase);
        message.textContent = t(
          phase === "audio" ? "library.loadingAudio" : "library.loadingScreen",
        );
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
      practiceFiles: {records: audioPracticeRecords, findAudio: findPracticeAudio, restore: restorePracticeFile},
      licenses: notices.entries
        .map((e) => `${e.name} ${e.version} · ${e.license}\n${e.text}`)
        .join("\n\n"),
      changed: async (song, initial) => {
        await savePracticeState(id, structuredClone(song));
        localStorage.setItem(PLAYER_PREFERENCES_KEY, JSON.stringify(initial));
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
    recordLoadTiming(
      measured ?? timing.finish(loadSucceeded ? "success" : "error"),
    );
    loading.remove();
    root.inert = wasInert;
    root.removeAttribute("aria-busy");
    working = false;
  }
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
    const kind = practiceFileKind(file);
    let record: RecordData;
    if (kind === "audio") {
      stage = t("audioPractice.loading");
      const button = root.querySelector<HTMLButtonElement>("#import-package");
      if (button) {
        button.disabled = true;
        button.textContent = stage;
      }
      record = await readAudioPractice(file, (text) => {
        if (button) button.textContent = text;
      });
    } else record = await readScorePackage(file);
    stage = t("library.stageSave");
    await importPracticeRecord(record);
    if (epoch !== importEpoch) return;
    stage = t("library.stageList");
    await showLibrary();
    if (kind === "audio") {
      working = false;
      await openRecord(record.song.id);
    }
  } catch (e) {
    reportImportError(e, stage);
  } finally {
    working = false;
    if (input) input.disabled = false;
    const button = root.querySelector<HTMLButtonElement>("#import-package");
    if (button) {
      button.disabled = false;
      button.textContent = t("audioPractice.import");
    }
  }
}
function bundledButton(score: (typeof bundledScores)[number]) {
  const button = document.createElement("button");
  button.textContent = t("separation.loadBundled");
  button.title = t("library.tipDownload");
  button.onclick = async () => {
    if (working || button.disabled) return;
    working = true;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    const label = button.innerHTML;
    clearLibraryError();
    try {
      const blob = await downloadScore(
        `${import.meta.env.BASE_URL}${score.file}`,
        (percent) => {
          button.textContent = downloadLabel(percent);
        },
      );
      button.textContent = t("library.savingScore");
      await importFile(
        new File([blob], score.file, { type: "application/zip" }),
        true,
      );
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
  renderKeepingTopHeader(root, libraryHTML(import.meta.env.DEV));
  if(import.meta.env.DEV){
  }
  showBuildLabel();
  root
    .querySelector("#library-refresh")!
    .addEventListener("click", () => location.reload());
  root.querySelector<HTMLButtonElement>("#library-settings")!.onclick = () => {
    if (root.querySelector("#settings-dialog")) return;
    const opener = root.querySelector<HTMLButtonElement>("#library-settings")!;
    const dialog = createDialog(
      "settings-dialog",
      t("icons.message059"),
      "tool-dialog library-settings-dialog",
      root,
    );
    const panel = document.createElement("section");
    panel.className = "tool-body settings-panel";
    panel.dataset.settingsPanel = "screen";
    panel.innerHTML = `<h3 class="settings-section-heading">${t("settings.screenTitle")}</h3>${titleOrderFieldsHTML()}<p class="library-settings-status" role="status"></p>`;
    dialog.append(panel);
    const practiceFiles = document.createElement("section");
    practiceFiles.className = "tool-body settings-panel";
    practiceFiles.dataset.settingsPanel = "audio";
    practiceFiles.innerHTML = `<h3 class="settings-section-heading">${t("component.settings.audio.name")}</h3>`;
    dialog.append(practiceFiles);
    installPracticeFileControls(practiceFiles, {records: audioPracticeRecords, findAudio: findPracticeAudio, restore: restorePracticeFile});
    const buttons = Array.from(
      panel.querySelectorAll<HTMLButtonElement>("[data-title-order]"),
    );
    const sync = () =>
      buttons.forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.titleOrder === readTitleOrder()),
        ),
      );
    sync();
    buttons.forEach(
      (button) =>
        (button.onclick = () => {
          try {
            saveTitleOrder(button.dataset.titleOrder as TitleOrder);
            sync();
            root.querySelectorAll(".practice-card-title").forEach((heading) => {
              syncCardTitleOrder(heading);
            });
            panel.querySelector(".library-settings-status")!.textContent = "";
          } catch (error) {
            panel.querySelector(".library-settings-status")!.textContent =
              String(error);
          }
        }),
    );
    dialog.addEventListener(
      "close",
      () => {
        dialog.remove();
        opener.focus({ preventScroll: true });
      },
      { once: true },
    );
    dialog.showModal();
  };
  document.querySelector("#import-package")!.addEventListener("click", () => {
    if (working || filePickerOpen) return;
    const input = document.querySelector<HTMLInputElement>("#package-file")!;
    // Safari can restore window focus before dispatching the chosen file.
    // Keep this input attached until change/cancel, instead of rebuilding it.
    filePickerOpen = true;
    try {
      input.click();
    } catch (error) {
      filePickerOpen = false;
      reportImportError(error, t("audioPractice.loading"));
    }
  });
  document.querySelector("#package-file")!.addEventListener("cancel", () => {
    filePickerOpen = false;
  });
  document
    .querySelector("#package-file")!
    .addEventListener("change", (event) => {
      filePickerOpen = false;
      const input = event.currentTarget as HTMLInputElement;
      const file = input.files?.[0];
      input.value = "";
      if (!file) return;
      try {
        if (practiceFileKind(file) !== "audio")
          throw Error(t("audioPractice.unsupported"));
        void importFile(file);
      } catch (error) {
        reportImportError(error, t("audioPractice.loading"));
      }
    });
  installHelp(root);
  // Keep this render tied to its own container across asynchronous reads.
  const basicList = document.getElementById("basic-practice-records")!;
  const personalList = document.getElementById("personal-practice-records")!;
  const audioList = document.getElementById("audio-practice-records")!;
  const sectionLists = [basicList, personalList, audioList];
  const audioIds = new Set<string>();
  const favoriteList = document.getElementById("favorite-practice-records")!;
  // Classify only current bundled basic exercises.
  const basicIds = new Set(
    bundledScores
      .filter((s) => "category" in s && s.category === "basic")
      .map((s) => s.id),
  );
  const listFor = (id: string) =>
    basicIds.has(id) ? basicList : audioIds.has(id) ? audioList : personalList;
  let favorites = new Set<string>();
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "[]",
    );
    if (Array.isArray(stored)) {
      favorites = new Set(
        stored.filter(
          (id): id is string =>
            typeof id === "string" && id !== RETIRED_SCORE_ID,
        ),
      );
      if (stored.includes(RETIRED_SCORE_ID))
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    }
  } catch {
    /* Invalid or unavailable preferences leave the score list usable. */
  }
  const sortFavorites = () => {
    const cards = [favoriteList, ...sectionLists].flatMap((list) =>
      Array.from(list.children),
    ) as HTMLElement[];
    cards.sort(
      (a, b) => Number(a.dataset.libraryOrder) - Number(b.dataset.libraryOrder),
    );
    for (const card of cards) {
      const id = card.dataset.scoreId!;
      (favorites.has(id) ? favoriteList : listFor(id)).append(card);
    }
    favoriteList.hidden = !favoriteList.childElementCount;
    for (const list of sectionLists)
      list.closest<HTMLElement>("section")!.hidden = !list.childElementCount;
  };
  const appendCard = (id: string, card: HTMLElement) => {
    card.dataset.scoreId = id;
    const heading = card.querySelector(".practice-card-title");
    if (heading) syncCardTitleOrder(heading);
    card.querySelectorAll<HTMLElement>("h3, p").forEach((text) => {
      text.title = text.textContent || "";
    });
    const favorite = document.createElement("button");
    favorite.type = "button";
    favorite.className = "library-favorite";
    const refreshFavorite = () => {
      setIconButton(
        favorite,
        icon("star"),
        t(favorites.has(id) ? "library.removeFavorite" : "library.addFavorite"),
      );
      favorite.setAttribute("aria-pressed", String(favorites.has(id)));
    };
    refreshFavorite();
    favorite.onclick = () => {
      const next = new Set(favorites);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
        favorites = next;
        refreshFavorite();
        sortFavorites();
        favorite.focus({ preventScroll: true });
      } catch (error) {
        report(error);
      }
    };
    card.prepend(favorite);
    listFor(id).append(card);
  };
  const records = (await listPracticeRecords()).filter(
    (record) => record.song.id !== RETIRED_SCORE_ID,
  );
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
    if (record.song.audioPractice) {
      audioIds.add(record.song.id);
      item.classList.add("audio-practice-card");
      const setup = document.createElement("button");
      setup.textContent = setup.title = t("audioPractice.setup");
      setup.onclick = async () => {
        if (working) return;
        working = true;
        try {
          const current = await loadPracticeRecord(record.song.id);
          if (!current) throw Error(t("separation.missing"));
          const updated = await setupAudioPractice(current);
          if (updated) {
            await savePracticeRecord(updated);
            await showLibrary();
          }
        } catch (error) {
          report(error);
        } finally {
          working = false;
        }
      };
      item.querySelector(".practice-card-actions")!.append(setup);
      const badge = document.createElement("span");
      badge.className = "audio-type";
      badge.textContent = t("audioPractice.label");
      item.querySelector(".practice-card-title")!.append(badge);
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

  // Catalog order is stable even when stored records are read in a different order.
  const order = new Map(bundledScores.map((score, index) => [score.id, index]));
  const cards = Array.from(basicList.children) as HTMLElement[];
  cards.sort(
    (a, b) =>
      (order.get(a.dataset.scoreId!) ?? Infinity) -
      (order.get(b.dataset.scoreId!) ?? Infinity),
  );
  basicList.append(...cards);
  let libraryOrder = 0;
  for (const list of sectionLists) {
    Array.from(list.children).forEach((card) => {
      (card as HTMLElement).dataset.libraryOrder = String(libraryOrder++);
    });
  }
  const empty = !personalList.childElementCount && !audioList.childElementCount;
  sortFavorites();
  root.querySelector<HTMLElement>("#library-empty-hint")!.hidden = !empty;
  if (empty)
    root
      .querySelector("#import-package")!
      .setAttribute("aria-describedby", "library-empty-hint");
}
void showLibrary().catch(report);

window.addEventListener("focus", () => {
  if (
    root.classList.contains("player-library") &&
    !working &&
    !filePickerOpen &&
    !document.querySelector("dialog[open]")
  )
    void showLibrary().catch(report);
});
