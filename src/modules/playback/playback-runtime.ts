import {
  installPracticeFileControls,
  type PracticeFileControlsOptions,
} from "../library/practice-file-controls";
import { renderKeepingTopHeader } from "../../shared/ui/top-edge-header";
import type { RibbonAsset } from "./playback-assets";
import appVersions from "../../app-versions.json";
import { installScoreReader } from "../score/score-reader";
import { Player } from "../audio/audio-core";
import build from "../../generated/build-info.generated.json";
import { t as i18nText } from "../../shared/i18n/i18n";
import {
  attachPracticeManagement,
  practiceLoopHTML,
  practiceMarkerHTML,
} from "./practice-management";
import type { Song } from "../../model/model";
import { type HighlightPage } from "../score/note-highlight";
import {
  preparePlaybackAssets,
  replacePlaybackAssets,
  releasePlaybackAssets,
} from "./playback-assets";
import { playbackInitial, type PlaybackInitial } from "./playback-initial";
import {
  appInfoHTML,
  selectPlaybackSettings,
  type SettingsCategory,
} from "./playback-forms";
import { createPlaybackScreen } from "./playback-screen";
import { mountPlaybackShell } from "./playback-shell";
import {
  playbackButton,
  playerPlaybackBindings,
  scoreStageHTML,
} from "./playback-ui";
import { type StaffPosition } from "../score/practice-staff-layout";
import { isEmbeddedScoreTextFontStyle } from "../score/score-text-font";

export interface PlaybackRuntimeOptions {
  root: HTMLElement;
  song: Song;
  canonicalXML?: string;
  audio: Blob;
  pages: Blob[];
  scores?: { song: Song; pages: Blob[] }[];
  initial?: PlaybackInitial;
  licenses?: string;
  changed?: (song: Song, initial: PlaybackInitial) => void | Promise<void>;
  onLibrary?: () => void;
  practiceFiles?: PracticeFileControlsOptions;
  onLoading?: (phase: "screen" | "audio") => void;
}
/** Blob-based playback host for the practice library app. */
export async function mountPlaybackRuntime(options: PlaybackRuntimeOptions) {
  const { root } = options;
  const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
    (id === "app" ? root : root.querySelector(`#${id}`)) as T;
  const input = (id: string) => $<HTMLInputElement>(id);
  const data = {
    ...options,
    initial: { ...playbackInitial, ...options.initial },
  };
  let disposed = false;
  let pending = Promise.resolve();
  let positionTimer: ReturnType<typeof setTimeout> | undefined;
  root.classList.remove("player-library");
  let isSVG = data.song.scoreFormat === "musicxml";
  let currentPages = data.pages;
  const variants = [
    { song: structuredClone(data.song), pages: data.pages },
    ...(data.scores ?? []),
  ];
  const s = data.song,
    initial = data.initial,
    prefs = {
      restartMeasure: initial.restartMeasure,
      countOff: initial.countOff,
    };
  const player = new Player(() => prefs);
  let ready = false,
    busy = false;
  let noteHighlightEnabled = initial.highlight,
    fullscreen = initial.fullscreen,
    selectedMenu: SettingsCategory = "screen";
  const urls: string[] = [],
    practiceStaffs = new Map<string, StaffPosition>(),
    highlightPages: (HighlightPage | undefined)[] = [],
    pageRatios: number[] = [];
  const song = () => s;
  document.body.classList.add("has-song");
  root.classList.toggle("audio-practice", !!s.audioPractice);
  renderKeepingTopHeader(
    root,
    `<header><div class="brand"></div><div class="actions"></div></header><main><section id="practice">${scoreStageHTML('<p id="status" role="alert" aria-atomic="true"></p>')}</section></main>`,
  );

  const markerContent = document.createElement("div");
  markerContent.innerHTML = practiceMarkerHTML();
  const loopExtra = document.createElement("div");
  loopExtra.innerHTML = practiceLoopHTML();
  const { addSettings } = mountPlaybackShell($("app"), {
    showPosition: false,
    ids: {
      ...playerPlaybackBindings,
      markers: "quick-markers",
      rewindButton: "rewind",
      mark: "mark",
      sound: "sound",
      settings: "settings",
      radiusAttribute: "data-radius",
    },
    screen: {
      pdf: "pdf-view",
      highlight: "highlight",
      fullscreen: "fullscreen",
    },
    preferences: { restart: "restart", countoff: "countoff" },
    select: (category) => {
      selectedMenu = category;
      settings();
    },
    openSettings: () => {
      open("settings");
      settings();
    },
    markerContent,
    loopExtra,
  });
  addSettings("info", "info-settings", "open-info-settings").innerHTML =
    appInfoHTML(appVersions.player.version, build) +
    `<details><summary>${i18nText("licenses.message083")}</summary><pre id="licenses"></pre></details>`;
  $("licenses").textContent = options.licenses ?? "";
  const noticeStage = $("stage");
  const alignNotice = () => {
    $("status").style.setProperty(
      "--notice-scroll-x",
      `${noticeStage.scrollLeft}px`,
    );
    $("status").style.setProperty(
      "--notice-scroll-y",
      `${noticeStage.scrollTop}px`,
    );
  };
  noticeStage.addEventListener("scroll", alignNotice);
  let noticeSource = "";
  const status = (message: string, source = "playback") => {
    if (disposed || (!message && noticeSource !== source)) return;
    noticeSource = message ? source : "";
    $("status").textContent = message;
    alignNotice();
  };
  // The notice can scroll long errors without selecting or starting a measure.
  for (const event of [
    "pointerdown",
    "pointerup",
    "click",
    "dblclick",
    "touchstart",
    "touchmove",
    "wheel",
  ]) {
    $("status").addEventListener(event, (e) => e.stopPropagation());
  }
  const fail = (e: unknown) => {
    status(e instanceof Error ? e.message : String(e));
  };
  const scoreReader = s.audioPractice
    ? { dispose() {} }
    : installScoreReader({
        root,
        controls: addSettings(
          "score",
          "reader-settings",
          "open-reader-settings",
        ),
        song: s,
        scores: variants,
        fail,
      });
  if (s.audioPractice && options.practiceFiles) {
    installPracticeFileControls(
      addSettings("audio", "audio-settings", "open-audio-settings"),
      {
        ...options.practiceFiles,
        records: async () => {
          // Snapshot live state before awaiting IndexedDB; it can be newer than queued autosave.
          const current = { song: structuredClone(s), audio: data.audio };
          const records = await options.practiceFiles!.records();
          return [
            ...records.filter((record) => record.song.id !== s.id),
            current,
          ];
        },
      },
    );
  }
  const open = (id: string) => {
    scoreGestures.cancel();
    $<HTMLDialogElement>(id + "-dialog").showModal();
  };
  function settings() {
    selectPlaybackSettings($("settings-dialog"), selectedMenu);
  }
  function changed() {
    if (positionTimer !== undefined) clearTimeout(positionTimer);
    positionTimer = undefined;
    if (disposed || !ready || !options.changed) return;
    const snapshot = structuredClone(s);
    const preferences = {
      ...prefs,
      fullscreen,
      highlight: noteHighlightEnabled,
    };
    const save = async () => {
      await options.changed!(snapshot, preferences);
      status("", "save");
    };
    // Serialize immutable snapshots. A failed write is reported but does not block a later retry.
    pending = pending.then(save, save);
    void pending.catch((error) =>
      status(error instanceof Error ? error.message : String(error), "save"),
    );
  }
  function positionChanged() {
    if (!options.changed || disposed || positionTimer !== undefined) return;
    positionTimer = setTimeout(changed, 1000);
  }
  if (options.onLibrary) {
    const holder = document.createElement("div");
    holder.innerHTML = playbackButton(
      "runtime-library",
      "library",
      i18nText("library.screenName"),
    );
    const button = holder.firstElementChild as HTMLButtonElement;
    button.onclick = () => {
      player.pause();
      options.onLibrary?.();
    };
    root.querySelector("header .actions")!.prepend(button);
  }
  player.onerror = status;
  player.onprogress = (message) => {
    if (!disposed) $("tempo-status").textContent = message;
  };
  const playback = createPlaybackScreen({
    root: $("app"),
    environment: "player",
    initialLastLoop: s.loops[0],
    preferences: {
      restartId: "restart",
      countoffId: "countoff",
      read: () => prefs,
      write: (value) => {
        Object.assign(prefs, value);
        changed();
      },
    },
    display: {
      highlightId: "highlight",
      fullscreenId: "fullscreen",
      fullscreen: () => fullscreen,
      setFullscreen: (value) => {
        fullscreen = value;
        changed();
      },
      setHighlight: (value) => {
        noteHighlightEnabled = value;
        changed();
      },
      report: (message) => status(message, "display"),
    },
    ids: {
      ...playerPlaybackBindings,
      markers: "quick-markers",
      rewindButton: "rewind",
      mark: "mark",
      sound: "sound",
      radiusAttribute: "data-radius",
      settings: "settings",
    },
    canonicalXML: () => options.canonicalXML,
    song,
    player: () => player,
    ready: () => ready,
    busy: () => busy,
    setBusy: (value) => {
      busy = value;
    },
    assets: () => ({
      urls,
      ratios: pageRatios,
      staffs: practiceStaffs,
      highlights: highlightPages,
      ribbon: ribbonAssets,
    }),
    highlight: () => noteHighlightEnabled,
    formats: () => variants.map((v) => v.song.scoreFormat ?? "pdf"),
    fail,
    changed,
    afterFrame: (time) => {
      if (ready && s.settings.position !== time) {
        s.settings.position = time;
        positionChanged();
      }
    },
    listsChanged: () => management?.render(),
  });
  const scoreGestures = {
    cancel: () => playback.cancel(),
    dispose: () => playback.dispose(),
  };
  player.onstate = () => {
    if (player.playing) status("");
    playback.onState();
  };
  const management: ReturnType<typeof attachPracticeManagement> =
    attachPracticeManagement({
      canonicalXML: () => options.canonicalXML,
      root,
      song,
      playback: () => playback,
      player: () => player,
      changed,
      fail,
    });
  async function preparePages(pages = currentPages, score: Song = s) {
    return preparePlaybackAssets(pages, score, {
      validate:
        score.scoreFormat === "musicxml"
          ? async (page, svg) => {
              const doc =
                svg ??
                new DOMParser().parseFromString(
                  await page.text(),
                  "image/svg+xml",
                );
              const fonts: { style: Element; css: string }[] = [];
              for (const style of doc.querySelectorAll(
                "style[data-score-font]",
              ))
                if (await isEmbeddedScoreTextFontStyle(style)) {
                  fonts.push({ style, css: style.textContent || "" });
                  style.textContent = "";
                }
              let inspected: string;
              try {
                inspected = new XMLSerializer().serializeToString(doc);
              } finally {
                // Validation borrows the preparation document. Its trusted font
                // bytes must remain intact for subsequent image rendering.
                fonts.forEach(({ style, css }) => (style.textContent = css));
              }
              const unsafeAttribute = [...doc.querySelectorAll("*")]
                .flatMap((el) => [...el.attributes])
                .find(
                  (a) =>
                    /^on/i.test(a.name) ||
                    (/(href|src)$/i.test(a.name) && !a.value.startsWith("#")),
                );
              const unsafe = {
                cssURL: /url\(\s*['"]?(?!#)/i.test(inspected),
                cssImport: /@import/i.test(inspected),
                element: doc.querySelector("script,foreignObject,parsererror")
                  ?.localName,
                attribute: unsafeAttribute?.name,
              };
              if (
                unsafe.cssURL ||
                unsafe.cssImport ||
                unsafe.element ||
                unsafe.attribute
              ) {
                console.error("Unsafe score SVG", unsafe);
                throw Error(i18nText("playback.message468"));
              }
            }
          : undefined,
    });
  }
  const ribbonAssets = new Map<number, RibbonAsset>();
  function useAssets(next: Awaited<ReturnType<typeof preparePages>>) {
    replacePlaybackAssets(
      {
        urls,
        pageRatios,
        highlightPages,
        practiceStaffs,
        ribbon: ribbonAssets,
      },
      next,
    );
  }
  function formatControls() {
    if (disposed) return;
    input("pdf-view").checked = !isSVG;
    input("pdf-view").disabled = variants.length < 2;
    if (ready) playback.syncDisplay();
  }
  input("pdf-view").onchange = async () => {
    if (busy || !ready) return;
    const target = variants.find(
      (v) =>
        v.song.scoreFormat === (input("pdf-view").checked ? "pdf" : "musicxml"),
    );
    if (!target) return;
    busy = true;
    scoreGestures.cancel();
    try {
      const next = await preparePages(target.pages, target.song);
      if (disposed) {
        releasePlaybackAssets(next);
        return;
      }
      useAssets(next);
      s.regions = structuredClone(target.song.regions);
      s.measures.forEach(
        (m, i) => (m.regionId = target.song.measures[i].regionId),
      );
      s.pageCount = target.song.pageCount;
      s.scoreFormat = target.song.scoreFormat;
      currentPages = target.pages;
      changed();
      isSVG = s.scoreFormat === "musicxml";

      playback.renderTrack();
      formatControls();
    } catch (e) {
      fail(e);
    } finally {
      busy = false;
      formatControls();
    }
  };
  try {
    options.onLoading?.("screen");
    useAssets(await preparePages());
    formatControls();
    options.onLoading?.("audio");
    await player.load(data.audio, s);
    options.onLoading?.("screen");
    if (s.measures[0].start >= player.duration)
      throw Error(i18nText("playback.message469"));
    ready = true;
    playback.sync();
    playback.renderTrack();
    settings();
    status("");
    document.body.dataset.ready = "true";
    document.body.dataset.readyMs = String(performance.now());
  } catch (e) {
    dispose();
    throw e;
  }
  function dispose() {
    if (disposed) return;
    changed();
    disposed = true;
    ready = false;
    window.removeEventListener("pagehide", pagehide);
    window.removeEventListener("pageshow", pageshow);
    scoreGestures.dispose();
    scoreReader.dispose();
    management?.dispose();
    player.onstate = () => {};
    player.onprogress = () => {};
    player.onerror = () => {};
    noticeStage.removeEventListener("scroll", alignNotice);
    player.pause();
    player.worker?.terminate();
    void player.ctx.close().catch(() => {});
    releasePlaybackAssets({ urls, ribbon: ribbonAssets });
    urls.length = 0;
    ribbonAssets.clear();
    for (const dialog of root.querySelectorAll<HTMLDialogElement>(
      "dialog[open]",
    ))
      dialog.close();
    renderKeepingTopHeader(root, "");
    root.classList.remove("playback-ui", "audio-practice");
    document.body.classList.remove("has-song");
    delete document.body.dataset.ready;
    delete document.body.dataset.readyMs;
  }
  function pagehide(event: PageTransitionEvent) {
    if (event.persisted) {
      player.pause();
      changed();
    } else dispose();
  }
  function pageshow(event: PageTransitionEvent) {
    if (event.persisted && ready && !disposed) {
      playback.sync();
      playback.renderTrack();
    }
  }
  window.addEventListener("pagehide", pagehide);
  window.addEventListener("pageshow", pageshow);
  return {
    dispose,
    flush: async () => {
      changed();
      await pending;
    },
  };
}
