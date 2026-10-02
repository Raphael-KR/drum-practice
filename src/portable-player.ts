import { version } from "../package.json";
import { Player } from "./audio-core";
import build from "./build-info.generated.json";
import { t as i18nText } from "./i18n";
import { bindMarkerSlots, markerSlotsHTML } from "./marker-ui";
import type { Song } from "./model";
import { type HighlightPage } from "./note-highlight";
import {
  preparePlaybackAssets,
  replacePlaybackAssets,
} from "./playback-assets";
import { decodePlaybackAsset, readPlaybackData } from "./playback-export";
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

const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const input = (id: string) => $<HTMLInputElement>(id);
async function start() {
  const data = await readPlaybackData($("portable-data").textContent!);
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
  const markerContent = document.createElement("div");
  markerContent.innerHTML = `<div id="marker-list"></div>${playbackButton("marker-add", "bookmark", i18nText("main.message268"))}`;
  const { addSettings } = mountPlaybackShell($("app"), {
    ids: {
      ...portablePlaybackBindings,
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
      settings();
      open("settings");
    },
    markerContent,
  });
  addSettings("info", "info-settings", "open-info-settings").innerHTML =
    appInfoHTML(version, build) +
    `<details><summary>${i18nText("licenses.message083")}</summary><pre id="licenses"></pre></details>`;
  $("licenses").textContent = JSON.parse($("portable-licenses").textContent!);
  const status = (v: string) => {
    $("status").textContent = v;
  };
  const fail = (e: unknown) => {
    status(e instanceof Error ? e.message : String(e));
  };
  const action = (id: string, f: () => unknown) => {
    $(id).onclick = () => {
      try {
        Promise.resolve(f()).catch(fail);
      } catch (e) {
        fail(e);
      }
    };
  };
  const open = (id: string) => {
    scoreGestures.cancel();
    $<HTMLDialogElement>(id + "-dialog").showModal();
  };
  function settings() {
    selectPlaybackSettings($("settings-dialog"), selectedMenu);
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
      },
    },
    display: {
      highlightId: "highlight",
      fullscreenId: "fullscreen",
      fullscreen: () => fullscreen,
      setFullscreen: (value) => {
        fullscreen = value;
      },
      setHighlight: (value) => {
        noteHighlightEnabled = value;
      },
      report: status,
    },
    ids: {
      ...portablePlaybackBindings,
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
    }),
    highlight: () => noteHighlightEnabled,
    formats: () => variants.map((v) => v.song.scoreFormat ?? "pdf"),
    fail,
    changed: () => {},
    listsChanged: () => {
      $("marker-list").innerHTML = markerSlotsHTML(s, "data-marker");
    },
  });
  const scoreGestures = {
    cancel: () => playback.cancel(),
    dispose: () => playback.dispose(),
  };
  player.onstate = playback.onState;
  bindMarkerSlots($("marker-list"), song, playback.seek, "data-marker");
  action("marker-add", playback.mark);
  async function preparePages(pages = currentPages, score: Song = s) {
    return preparePlaybackAssets(pages.map(decodePlaybackAsset), score, {
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
  function useAssets(next: Awaited<ReturnType<typeof preparePages>>) {
    replacePlaybackAssets(
      { urls, pageRatios, highlightPages, practiceStaffs },
      next,
    );
  }
  function formatControls() {
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
      useAssets(next);
      s.regions = structuredClone(target.song.regions);
      s.measures.forEach(
        (m, i) => (m.regionId = target.song.measures[i].regionId),
      );
      s.pageCount = target.song.pageCount;
      s.scoreFormat = target.song.scoreFormat;
      currentPages = target.pages;
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
    await player.load(decodePlaybackAsset(data.audio), s);
    if (s.measures[0].start >= player.duration)
      throw Error(i18nText("portable-player.message469"));
    ready = true;
    playback.sync();
    playback.renderTrack();
    settings();
    status("");
    document.body.dataset.ready = "true";
    document.body.dataset.readyMs = String(performance.now());
  } catch (e) {
    fail(e);
    player.pause();
    for (const u of urls) URL.revokeObjectURL(u);
    $("play").setAttribute("disabled", "");
  }
  window.addEventListener(
    "pagehide",
    () => {
      ready = false;
      scoreGestures.dispose();
      player.pause();
      player.worker?.terminate();
      void player.ctx.close();
      for (const u of urls) URL.revokeObjectURL(u);
    },
    { once: true },
  );
}
void start().catch((e) => {
  document.getElementById("app")!.textContent =
    e instanceof Error ? e.message : String(e);
});
