import type { RibbonAsset } from "./playback-assets";
import appVersions from "./app-versions.json";
import { installScoreReader } from "./score-reader";
import { Player } from "./audio-core";
import build from "./build-info.generated.json";
import { t as i18nText } from "./i18n";
import {
  attachPracticeManagement,
  practiceLoopHTML,
  practiceMarkerHTML,
} from "./practice-management";
import type { Song } from "./model";
import { type HighlightPage } from "./note-highlight";
import {
  preparePlaybackAssets,
  replacePlaybackAssets,
  releasePlaybackAssets,
} from "./playback-assets";
import { playbackInitial, type PlaybackInitial } from "./playback-export";
import {
  appInfoHTML,
  selectPlaybackSettings,
  type SettingsCategory,
} from "./playback-forms";
import { createPlaybackScreen } from "./playback-screen";
import { mountPlaybackShell } from "./playback-shell";
import {
  playbackButton,
  portablePlaybackBindings,
  scoreStageHTML,
} from "./playback-ui";
import { type StaffPosition } from "./practice-staff-layout";

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
}
/** Blob-based playback host shared by the library app and self-contained HTML. */
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
  let headerTintTimer: ReturnType<typeof setTimeout> | undefined;
  let headerTintStyle: HTMLStyleElement | undefined;
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
  $("app").innerHTML =
    `<header><div class="brand"></div><div class="actions"></div></header><main><section id="practice">${scoreStageHTML()}</section><p id="status" role="status">${i18nText("portable-player.message453")}</p></main>`;
  let management: ReturnType<typeof attachPracticeManagement> | undefined;
  const markerContent = document.createElement("div");
  markerContent.innerHTML = practiceMarkerHTML();
  const loopExtra = document.createElement("div");
  loopExtra.innerHTML = practiceLoopHTML();
  const { addSettings } = mountPlaybackShell($("app"), {
    showPosition: false,
    ids: {
      ...portablePlaybackBindings,
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
  const status = (v: string) => {
    if (disposed) return;
    $("status").textContent = v;
  };
  const fail = (e: unknown) => {
    status(e instanceof Error ? e.message : String(e));
  };
  const scoreReader = installScoreReader({
    root,
    controls: addSettings("score", "reader-settings", "open-reader-settings"),
    song: s,
    scores: variants,
    fail,
  });
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
    };
    // Serialize immutable snapshots. A failed write is reported but does not block a later retry.
    pending = pending.then(save, save);
    void pending.catch(fail);
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
      i18nText("icons.message054"),
    );
    const button = holder.firstElementChild as HTMLButtonElement;
    button.onclick = () => {
      player.pause();
      options.onLibrary?.();
    };
    root.querySelector("header .actions")!.prepend(button);
  }
  player.onprogress = status;
  const playback = createPlaybackScreen({
    root: $("app"),
    environment: "portable",
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
      report: status,
    },
    ids: {
      ...portablePlaybackBindings,
      markers: "quick-markers",
      rewindButton: "rewind",
      mark: "mark",
      sound: "sound",
      radiusAttribute: "data-radius",
      settings: "settings",
    },
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
  player.onstate = playback.onState;
  management = attachPracticeManagement({
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
          ? async (page) => {
              const text = await page.text(),
                doc = new DOMParser().parseFromString(text, "image/svg+xml");
              if (
                /url\(\s*['"]?(?!#)/i.test(text) ||
                /@import/i.test(text) ||
                doc.querySelector("script,foreignObject,parsererror") ||
                [...doc.querySelectorAll("*")].some((el) =>
                  [...el.attributes].some(
                    (a) =>
                      /^on/i.test(a.name) ||
                      (/(href|src)$/i.test(a.name) && !a.value.startsWith("#")),
                  ),
                )
              )
                throw Error(i18nText("portable-player.message468"));
            }
          : undefined,
    });
  }
  const ribbonAssets = new Map<number, RibbonAsset>();
  function useAssets(next: Awaited<ReturnType<typeof preparePages>>) {
    replacePlaybackAssets(
      { urls, pageRatios, highlightPages, practiceStaffs, ribbon: ribbonAssets },
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
    useAssets(await preparePages());
    formatControls();
    await player.load(data.audio, s);
    if (s.measures[0].start >= player.duration)
      throw Error(i18nText("portable-player.message469"));
    ready = true;
    playback.sync();
    playback.renderTrack();
    settings();
    status("");
    document.body.dataset.ready = "true";
    document.body.dataset.readyMs = String(performance.now());
    // Refresh Safari's browser-chrome sampling after the library-to-player transition.
    headerTintTimer = setTimeout(() => {
      if (disposed) return;
      headerTintStyle = document.createElement("style");
      headerTintStyle.dataset.playbackHeaderTint = "true";
      headerTintStyle.textContent = ".has-song .drawer-playback > header {position:sticky;top:0;background:#b8d4f5}";
      document.head.append(headerTintStyle);
    }, 3000);
  } catch (e) {
    dispose();
    throw e;
  }
  function dispose() {
    if (disposed) return;
    changed();
    disposed = true;
    clearTimeout(headerTintTimer);
    headerTintStyle?.remove();
    ready = false;
    window.removeEventListener("pagehide", pagehide);
    window.removeEventListener("pageshow", pageshow);
    scoreGestures.dispose();
    scoreReader.dispose();
    management?.dispose();
    player.onstate = () => {};
    player.onprogress = () => {};
    player.pause();
    player.worker?.terminate();
    void player.ctx.close().catch(() => {});
    releasePlaybackAssets({urls, ribbon:ribbonAssets});
    urls.length = 0;
    ribbonAssets.clear();
    for (const dialog of root.querySelectorAll<HTMLDialogElement>(
      "dialog[open]",
    ))
      dialog.close();
    root.replaceChildren();
    root.classList.remove("playback-ui");
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
