import { installHelp } from "./help";
import { t as i18nText, formatDate, formatTime } from "./i18n";
import { installUIStandard, uiText } from "./ui-standard";
import { Player } from "./audio-core";
import { readPlaybackData, decodePlaybackAsset } from "./playback-export";
import {
  clamp,
  locate,
  xAtBeat,
  continuousX,
  beatTime,
  uid,
  type Song,
  type Measure,
  type Region,
  type Loop,
} from "./model";
import { displayRegion } from "./score-view";
import {
  measurePageStaff,
  practiceStaffLayout,
  practicePage,
  type StaffPosition,
} from "./practice-staff-layout";
import {
  highlightPage,
  updateNoteHighlights,
  notePulseBeats,
  type HighlightPage,
} from "./note-highlight";
import { packLabels } from "./lyric-layout";
import { attachScoreGestures } from "./score-gestures";
import { bindNumericDrag, installNumericInputs } from "./numeric-drag";
import { centeredRange, scrubTime } from "./practice-controls";
import {
  markMeasure,
  markedMeasureIndices,
  sortedMarkerSlots,
} from "./marker-slots";
import { enterFullscreen, installScreenControls } from "./fullscreen";
import build from "./build-info.generated.json";
import { version } from "../package.json";

const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const input = (id: string) => $<HTMLInputElement>(id);
const esc = (x: unknown) =>
  String(x).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const glyphs: Record<string, string> = {
  screen:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 12h18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/>',
  "×": '<path d="m6 6 12 12M18 6 6 18"/>',
  "⚙": '<path d="m10 3-.6 2.1-2 .9-2-.7-2 3.4 1.5 1.5-.2 2.2L3 14l2 3.4 2-.7 2 .9.6 2.1h4l.6-2.1 2-.9 2 .7 2-3.4-1.5-1.5.2-2.2L21 10l-2-3.4-2 .7-2-.9L14 3Z"/><circle cx="12" cy="11.5" r="3"/>',
  "♧": '<path d="m8 3-5 18h18L16 3ZM12 17l7-12M7 17h10"/>',
  "⚑": '<path d="M6 3h12v18l-6-4-6 4Z"/>',
  "☷": '<path d="M5 3v5m0 4v9M12 3v10m0 4v4M19 3v2m0 4v12M2 8h6v4H2zm7 5h6v4H9zm7-8h6v4h-6z"/>',
  "↤": '<path d="M5 5v14m14-14L8 12l11 7Z"/>',
  "⇄": '<path d="m16 3 4 4-4 4M4 11V9a2 2 0 0 1 2-2h14M8 21l-4-4 4-4m12 0v2a2 2 0 0 1-2 2H4"/>',
  "↻": '<path d="M8 3 3 8l5 5M3 8h10a7 7 0 1 1-6 11"/>',
  "↺": '<path d="M8 3 3 8l5 5M3 8h10a7 7 0 1 1-6 11"/>',
  "✓": '<path d="m4 12 5 5L20 6"/>',
  "▶": '<path d="m8 4 13 8-13 8Z" fill="currentColor" stroke="none"/>',
  Ⅱ: '<path d="M7 5h3v14H7zm7 0h3v14h-3z" fill="currentColor" stroke="none"/>',
};
const pictogram = (glyph: string) =>
  glyphs[glyph]
    ? `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[glyph]}</svg>`
    : glyph;
const button = (id: string, glyph: string, label: string, caption = "") =>
  `<button class="icon-button" id="${id}" aria-label="${label}" title="${label}">${pictogram(glyph)}${caption ? `<span class="icon-caption">${caption}</span>` : ""}</button>`;
const number = (
  id: string,
  value: number,
  min: number,
  max: number,
  step = 1,
) =>
  `<input id="${id}" type="number" value="${value}" min="${min}" max="${max}" step="${step}">`;
const toggleRow = (
  id: string,
  title: string,
  description: string,
  checked: boolean,
) =>
  `<label class="setting"><span><strong>${title}</strong><small>${description}</small></span><input id="${id}" type="checkbox" role="switch" ${checked ? "checked" : ""}></label>`;
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
    busy = false,
    stationarySelectionTime: number | undefined,
    pausedBrowseIndex = -1,
    rowWindow = -1,
    playbackRowOrigin = 0;
  let noteHighlightEnabled = initial.highlight,
    fullscreen = initial.fullscreen,
    selectedMenu = "screen",
    repeatCenter: number | undefined,
    lastLoop = s.loops[0];
  const urls: string[] = [],
    practiceStaffs = new Map<string, StaffPosition>(),
    highlightPages: (HighlightPage | undefined)[] = [],
    pageRatios: number[] = [],
    trackOffsets: number[] = [],
    trackWidths: number[] = [];
  let gestureScrub: { start: number; resume: boolean; loop?: Loop } | undefined;
  let activeRadius = "";
  let panStartBars = 0,
    renderedBrowseWidth = NaN;
  let nativeRibbonScroll = false;

  const song = () => s;
  $("app").innerHTML =
    '<header><div class="brand"><h1 id="title"></h1>' +
    String(button("bpm", "♩", i18nText("main.message208"))) +
    '</div><div class="actions">' +
    String(button("click", "♧", i18nText("icons.message076"))) +
    String(button("settings", "⚙", i18nText("icons.message059"))) +
    '</div></header>\n <main><section id="practice"><div id="stage" class="stage" tabindex="0" aria-label="' +
    i18nText("portable-player.message448") +
    '"><div id="ribbon" class="ribbon"></div></div><div class="playhead"></div></section>\n <div class="transport"><div class="transport-left">' +
    String(button("home", "↤", i18nText("icons.message051"))) +
    String(number("rewind-bars", 1, 1, 10)) +
    String(button("rewind", "↺", i18nText("icons.message053"))) +
    '<button id="position" title="' +
    i18nText("main.message120") +
    '" aria-label="' +
    i18nText("main.message120") +
    '"></button></div>' +
    String(button("play", "▶", i18nText("icons.message052"))) +
    '<div class="transport-right"><label class="progress-number">' +
    String(number("percent", 0, 0, 100)) +
    "<span>%</span></label>" +
    String(
      button(
        "mark",
        "⚑",
        i18nText("main.message268"),
        i18nText("icons.message069"),
      ),
    ) +
    String(
      button(
        "sound",
        "☷",
        i18nText("icons.message070"),
        i18nText("icons.message070"),
      ),
    ) +
    '</div></div>\n <section class="repeat-controls"><div class="repeat-actions">' +
    String(
      button(
        "adjust",
        "⇄",
        i18nText("portable-player.message435"),
        i18nText("icons.message068"),
      ),
    ) +
    '<span class="repeat-heading">' +
    i18nText("portable-player.message449") +
    '</span><div class="repeat-presets">' +
    String(
      [1, 2, 3, 4]
        .map(
          (n) =>
            '<button data-radius="' +
            String(n) +
            '" aria-pressed="false" aria-label="' +
            i18nText("portable-player.message436", { n: n }) +
            '">' +
            i18nText("portable-player.message437", { n: n }) +
            "</button>",
        )
        .join(""),
    ) +
    '</div><span id="loop-state"></span><button id="recenter-loop">' +
    i18nText("portable-player.message450") +
    '</button><button id="loop-off">' +
    i18nText("portable-player.message451") +
    '</button></div><div id="markers" class="marker-slots" role="group" aria-label="' +
    i18nText("portable-player.message452") +
    '"></div></section><p id="status" role="status">' +
    i18nText("portable-player.message453") +
    '</p></main>\n <dialog id="settings-dialog"><div class="dialoghead"><h2>' +
    i18nText("icons.message059") +
    "</h2>" +
    String(
      button("settings-close", "×", i18nText("editor-session.message042")),
    ) +
    '</div><div class="settings-grid"><nav>' +
    String(
      [
        ["screen", i18nText("icons.message071")],
        ["playback", i18nText("icons.message052")],
        ["info", i18nText("icons.message066")],
      ]
        .map(
          ([k, v]) =>
            `<button class="icon-button" data-menu="${k}">${pictogram(k === "playback" ? "▶" : k)}<span class="icon-caption">${v}</span></button>`,
        )
        .join(""),
    ) +
    '</nav><div>\n <section data-panel="screen"><label class="setting"><strong>' +
    i18nText("main.message108") +
    '</strong><span class="view-select-control"><span id="view-selected-text" aria-hidden="true"></span><select id="view"><option value="ribbon">' +
    i18nText("main.message109") +
    '</option><option value="rows">' +
    i18nText("portable-player.message454") +
    '</option></select></span></label><small id="view-description" class="description"></small><label class="setting" id="zoom-row"><strong>' +
    i18nText("portable-player.message455") +
    '</strong><input id="zoom" type="range" min="0.5" max="2" step="0.1" value="' +
    String(s.settings.zoom) +
    '"></label>' +
    String(
      toggleRow("pdf-view", i18nText("portable-player.message438"), "", !isSVG),
    ) +
    String(
      toggleRow(
        "highlight",
        i18nText("portable-player.message439"),
        i18nText("portable-player.message440"),
        noteHighlightEnabled,
      ),
    ) +
    String(
      toggleRow(
        "fullscreen",
        i18nText("portable-player.message441"),
        "",
        fullscreen,
      ),
    ) +
    '</section>\n <section data-panel="playback" hidden>' +
    String(
      toggleRow(
        "restart",
        i18nText("portable-player.message442"),
        i18nText("portable-player.message443"),
        prefs.restartMeasure,
      ),
    ) +
    String(
      toggleRow(
        "countoff",
        i18nText("portable-player.message444"),
        i18nText("portable-player.message445"),
        prefs.countOff,
      ),
    ) +
    '</section>\n <section data-panel="info" hidden><h2>' +
    i18nText("main.message097") +
    "</h2><dl><dt>" +
    i18nText("portable-player.message456") +
    "</dt><dd>" +
    String(version) +
    " (" +
    String(build.source) +
    ")</dd><dt>" +
    i18nText("portable-player.message457") +
    "</dt><dd>" +
    String(
      esc(
        formatDate(new Date(build.builtAt), {
          timeZone: "Asia/Seoul",
          hour12: false,
        }),
      ),
    ) +
    " KST</dd></dl><details><summary>" +
    i18nText("licenses.message083") +
    '</summary><pre id="licenses"></pre></details></section></div></div></dialog>\n <dialog id="tempo-dialog"><div class="dialoghead"><h2>' +
    i18nText("main.message208") +
    "</h2>" +
    String(button("tempo-close", "×", i18nText("editor-session.message042"))) +
    '</div><label class="tempo-number">' +
    String(
      number(
        "tempo",
        Math.round(s.bpm * s.settings.rate),
        Math.ceil(s.bpm * 0.5),
        Math.floor(s.bpm * 1.2),
      ),
    ) +
    ("<span>" + i18nText("term.BPM") + "</span></label>") +
    String(button("tempo-reset", "↺", i18nText("portable-player.message446"))) +
    '</dialog>\n <dialog id="sound-dialog"><div class="dialoghead"><h2>' +
    i18nText("icons.message070") +
    "</h2>" +
    String(button("sound-close", "×", i18nText("editor-session.message042"))) +
    '</div><label class="setting">' +
    i18nText("main.message282") +
    '<input id="music-volume" type="range" min="0" max="1" step=".01" value="' +
    String(s.settings.musicVolume) +
    '"></label><label class="setting">' +
    i18nText("icons.message076") +
    '<input id="click-volume" type="range" min="0" max="1" step=".01" value="' +
    String(s.settings.clickVolume) +
    '"></label></dialog>\n <dialog id="loop-dialog"><div class="dialoghead"><h2>' +
    i18nText("main.message132") +
    "</h2>" +
    String(button("loop-close", "×", i18nText("editor-session.message042"))) +
    '</div><label class="setting">' +
    i18nText("portable-player.message458", {
      value31: number("loop-a", 1, 1, s.measures.length),
      value32: number("loop-ab", 1, 1, 16, 0.25),
    }) +
    '</label><label class="setting">' +
    i18nText("portable-player.message459", {
      value33: number("loop-b", 1, 1, s.measures.length),
      value34: number("loop-bb", 5, 1, 17, 0.25),
    }) +
    "</label>" +
    String(button("apply-loop", "✓", i18nText("portable-player.message447"))) +
    '</dialog>\n <dialog id="marker-dialog"><div class="dialoghead"><h2>' +
    i18nText("icons.message069") +
    "</h2>" +
    String(button("marker-close", "×", i18nText("editor-session.message042"))) +
    '</div><div id="marker-list"></div>' +
    String(button("marker-add", "⚑", i18nText("main.message268"))) +
    "</dialog>";
  $("title").textContent = [s.artist, s.title].filter(Boolean).join(" - ");
  $("licenses").textContent = JSON.parse($("portable-licenses").textContent!);
  const status = (v: string) => {
    $("status").textContent = v;
  };
  installScreenControls($("settings"), status);
  installUIStandard("portable", $("app"));
  installHelp(document.getElementById("app")!);
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
  for (const id of ["settings", "tempo", "sound", "loop", "marker"]) {
    action(id + "-close", () => $<HTMLDialogElement>(id + "-dialog").close());
    const d = $<HTMLDialogElement>(id + "-dialog");
    d.addEventListener("click", (e) => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    });
  }
  function settings() {
    document
      .querySelectorAll<HTMLElement>("[data-panel]")
      .forEach((e) => (e.hidden = e.dataset.panel !== selectedMenu));
    document.querySelectorAll<HTMLElement>("[data-menu]").forEach((e) => {
      e.classList.toggle("on", e.dataset.menu === selectedMenu);
      e.setAttribute("aria-pressed", String(e.dataset.menu === selectedMenu));
    });
  }
  document.querySelectorAll<HTMLElement>("[data-menu]").forEach(
    (b) =>
      (b.onclick = () => {
        selectedMenu = b.dataset.menu!;
        settings();
      }),
  );
  action("settings", () => {
    settings();
    open("settings");
  });
  action("bpm", () => open("tempo"));
  action("sound", () => open("sound"));
  player.onprogress = status;
  player.onstate = () => {
    if (player.playing)
      playbackRowOrigin = Math.floor(locate(s, player.current()).index / 4);
    $("play").innerHTML = pictogram(player.playing ? "Ⅱ" : "▶");
    $("play").setAttribute(
      "aria-label",
      uiText(player.playing ? "pause" : "play"),
    );
  };
  function sync() {
    $("bpm").innerHTML =
      `<svg class="tempo-note" viewBox="0 0 18 32" aria-hidden="true"><ellipse cx="6.5" cy="26" rx="6" ry="4" transform="rotate(-22 6.5 26)" fill="currentColor"/><path d="M11.5 25V2" stroke="currentColor" stroke-width="2"/></svg><span>= ${Math.round(s.bpm * s.settings.rate)}</span>`;
    input("tempo").value = String(Math.round(s.bpm * s.settings.rate));
    $("click").classList.toggle("on", s.settings.click);
    $("click").setAttribute("aria-pressed", String(s.settings.click));
  }
  async function play(fromMeasureStart?: boolean) {
    if (!ready || busy) return;
    busy = true;
    try {
      if (fullscreen && !document.fullscreenElement)
        await enterFullscreen(status);
      await player.play(true, fromMeasureStart);
    } finally {
      busy = false;
    }
  }
  action("play", () => (player.playing ? player.pause() : play()));
  action("click", () => {
    s.settings.click = !s.settings.click;
    player.volumes();
    sync();
  });
  async function rate() {
    if (!ready || busy) return;
    busy = true;
    try {
      await player.setRate(
        clamp(Number(input("tempo").value) / s.bpm, 0.5, 1.2),
      );
      sync();
    } finally {
      busy = false;
    }
  }
  input("tempo").onchange = () => void rate().catch(fail);
  action("tempo-reset", () => {
    input("tempo").value = String(s.bpm);
    return rate();
  });
  for (const [id, key] of [
    ["music-volume", "musicVolume"],
    ["click-volume", "clickVolume"],
  ] as const)
    input(id).oninput = () => {
      s.settings[key] = Number(input(id).value);
      player.volumes();
    };
  input("restart").onchange = () =>
    (prefs.restartMeasure = input("restart").checked);
  input("countoff").onchange = () =>
    (prefs.countOff = input("countoff").checked);
  input("fullscreen").onchange = async () => {
    fullscreen = input("fullscreen").checked;
    if (fullscreen) await enterFullscreen(status);
    else if (document.fullscreenElement) await document.exitFullscreen();
  };
  input("highlight").onchange = () =>
    (noteHighlightEnabled = input("highlight").checked);
  function seekFreely(t: number) {
    stationarySelectionTime = undefined;
    if (player.loop && (t < player.loop.start || t >= player.loop.end)) {
      lastLoop = player.loop;
      player.loop = undefined;
    }
    player.seek(t);
    renderLists();
  }
  action("home", () => seekFreely(s.measures[0].start));
  action("position", async () => {
    try {
      await navigator.clipboard.writeText($("position").textContent || "");
    } catch {
      status(i18nText("portable-player.message460"));
    }
  });
  action("rewind", () =>
    seekFreely(
      s.measures[
        Math.max(
          0,
          locate(s, player.current()).index -
            Number(input("rewind-bars").value),
        )
      ].start,
    ),
  );
  function beginScrub() {
    if (!ready || busy) return;
    panStartBars = s.settings.view === "ribbon" ? $("stage").scrollLeft : 0;
    gestureScrub = {
      start: player.current(),
      resume: player.playing,
      loop: player.loop,
    };
    player.pause();
  }
  function finishScrub(cancel = false) {
    const old = gestureScrub;
    gestureScrub = undefined;
    if (!old) return;
    if (cancel) {
      player.loop = old.loop;
      seekFreely(old.start);
    } else if (old.resume) void player.play(false, false).catch(fail);
  }
  const scoreGestures = attachScoreGestures<number>($("stage"), {
    isPlaying: () => player.playing,
    horizontalEnabled: () => s.settings.view !== "rows",
    nativeHorizontal: () => !player.playing && s.settings.view === "ribbon",
    getTarget: (e) =>
      !ready || busy
        ? null
        : Number(
            (e.target as Element).closest<HTMLElement>("[data-index]")?.dataset
              .index ?? locate(s, player.current()).index,
          ),
    prepareAudio: () => {
      if (ready) void player.prepare().catch(fail);
    },
    pause: () => player.pause(),
    seek: (i, resume) => {
      player.pause();
      seekFreely(s.measures[i].start);
      if (resume) void play(false).catch(fail);
      else {
        pausedBrowseIndex = i;
        stationarySelectionTime = player.current();
      }
    },
    scrubStart: beginScrub,
    scrubMove: (dx) => {
      if (!gestureScrub) return;
      if (!gestureScrub.resume && s.settings.view === "ribbon") {
        $("stage").scrollLeft = panStartBars - dx;
        return;
      }
      seekFreely(
        scrubTime(
          s,
          gestureScrub.start,
          dx,
          $("stage").clientWidth / 4,
          player.duration,
        ),
      );
    },
    scrubEnd: () => finishScrub(),
    scrubCancel: () => finishScrub(true),
  });
  $("stage").addEventListener(
    "wheel",
    (e) => {
      if (!ready || player.playing || e.ctrlKey) return;
      if (
        s.settings.view === "rows" &&
        Math.abs(e.deltaY) >= Math.abs(e.deltaX)
      )
        return;
      if (s.settings.view === "ribbon") {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          $("stage").scrollLeft += e.deltaY;
        }
        return;
      }
      e.preventDefault();
    },
    { passive: false },
  );
  bindNumericDrag(input("percent"), {
    onStart: beginScrub,
    onPreview: (v) => seekFreely((v * player.duration) / 100),
    onCommit: (v) => {
      if (gestureScrub) finishScrub();
      else if (ready) seekFreely((v * player.duration) / 100);
    },
    onCancel: () => finishScrub(true),
    onTap: () => open("marker"),
  });
  const disposeNumbers = installNumericInputs(document);
  function mark() {
    markMeasure(s, player.current(), uid());
    renderLists();
  }
  action("mark", mark);
  action("marker-add", mark);
  function renderLists() {
    const slots = sortedMarkerSlots(s)
      .map(
        (m, i) =>
          `<button class="${m ? "" : "empty-marker-slot"}" data-marker="${i}" ${m ? "" : "disabled"} aria-label="${m ? esc(m.name) : i18nText("portable-player.message461")}">${m ? esc(locate(s, m.time).measure.label) : "—"}</button>`,
      )
      .join("");
    $("markers").innerHTML = $("marker-list").innerHTML = slots;
    document.querySelectorAll<HTMLElement>("[data-marker]").forEach(
      (b) =>
        (b.onclick = () => {
          const m = sortedMarkerSlots(s)[Number(b.dataset.marker)];
          if (m) seekFreely(m.time);
        }),
    );
    $("loop-state").textContent = player.loop
      ? player.loop.name
      : i18nText("main.message270");
    $("loop-off").hidden = !player.loop;
    $("recenter-loop").hidden = !player.loop;
    document.querySelectorAll<HTMLElement>("[data-radius]").forEach((b) => {
      const active = !!player.loop && b.dataset.radius === activeRadius;
      b.setAttribute("aria-pressed", String(active));
    });
    const marked = markedMeasureIndices(s);
    document.querySelectorAll<HTMLElement>("[data-index]").forEach((e) => {
      const badge = e.querySelector<HTMLElement>(".measure-marker");
      if (badge) badge.hidden = !marked.has(Number(e.dataset.index));
    });
  }
  function setLoop(l: Loop) {
    if (l.end <= l.start || l.end > player.duration)
      throw Error(i18nText("portable-player.message462"));
    const resume = player.playing;
    player.pause();
    player.loop = l;
    lastLoop = l;
    if (player.position < l.start || player.position >= l.end)
      player.position = l.start;
    renderLists();
    if (resume) void player.play(false, false).catch(fail);
  }
  action("recenter-loop", () => {
    repeatCenter = locate(s, player.current()).index;
    document
      .querySelector<HTMLElement>(`[data-radius="${activeRadius || "1"}"]`)
      ?.click();
  });
  document.querySelectorAll<HTMLElement>("[data-radius]").forEach(
    (b) =>
      (b.onclick = () => {
        try {
          activeRadius = b.dataset.radius!;
          repeatCenter = player.loop
            ? (repeatCenter ?? locate(s, player.current()).index)
            : locate(s, player.current()).index;
          const r = centeredRange(
            s.measures,
            repeatCenter,
            Number(b.dataset.radius),
            player.duration,
          );
          setLoop({
            id: uid(),
            name: i18nText("portable-player.message463", {
              value1: r.first + 1,
              value2: r.last + 1,
            }),
            start: r.start,
            end: r.end,
          });
        } catch (e) {
          fail(e);
        }
      }),
  );
  action("loop-off", () => {
    const resume = player.playing;
    player.pause();
    player.loop = undefined;
    repeatCenter = undefined;
    renderLists();
    if (resume) void player.play(false, false).catch(fail);
  });
  action("adjust", () => {
    const a = lastLoop
        ? locate(s, lastLoop.start)
        : locate(s, player.current()),
      b = lastLoop ? locate(s, lastLoop.end - 1e-6) : a;
    input("loop-a").value = String(a.index + 1);
    input("loop-b").value = String(b.index + 1);
    input("loop-ab").value = String(lastLoop ? a.beat + 1 : 1);
    input("loop-bb").value = String(b.measure.beats + 1);
    open("loop");
  });
  action("apply-loop", () => {
    const a = s.measures[Number(input("loop-a").value) - 1],
      b = s.measures[Number(input("loop-b").value) - 1],
      ab = Number(input("loop-ab").value) - 1,
      bb = Number(input("loop-bb").value) - 1;
    if (!a || !b || ab < 0 || ab >= a.beats || bb < 0 || bb > b.beats)
      throw Error(i18nText("portable-player.message464"));
    setLoop({
      id: uid(),
      name: i18nText("portable-player.message463", {
        value1: a.label,
        value2: b.label,
      }),
      start: beatTime(a, ab),
      end: beatTime(b, bb),
    });
    $<HTMLDialogElement>("loop-dialog").close();
  });
  document.addEventListener("keydown", (e) => {
    if (
      !ready ||
      document.querySelector("dialog[open]") ||
      /INPUT|SELECT|TEXTAREA/.test((e.target as Element).tagName)
    )
      return;
    if (e.code === "Space") {
      e.preventDefault();
      if (player.playing) player.pause();
      else void play().catch(fail);
    } else if (e.key.toLowerCase() === "m") mark();
    else if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      seekFreely(
        s.measures[
          clamp(
            locate(s, player.current()).index +
              (e.key === "ArrowLeft" ? -1 : 1),
            0,
            s.measures.length - 1,
          )
        ].start,
      );
    }
  });
  function practiceRegion(s: Song, region: Region) {
    return displayRegion(s, region);
  }
  const xmlPracticeLayout = (s: Song, r: Region, width: number) => {
    const staff = practiceStaffs.get(r.id);
    if (!isSVG || !staff) return undefined;
    // One engraving scale for playing and paused rows, independent of grid state.
    const budget =
      s.settings.view === "rows"
        ? clamp(width * 0.52, 100, 180)
        : (clamp($("stage").clientWidth * 0.245, 170, 340) * s.settings.zoom) /
          2;
    return practiceStaffLayout(r, staff, width, budget);
  };
  function widthOf(m: Measure) {
    const r = practiceRegion(
      song(),
      song().regions.find((r) => r.id === m.regionId)!,
    );
    const staff = practiceStaffs.get(r.id);
    if (isSVG && staff) {
      const height =
        (clamp($("stage").clientWidth * 0.245, 170, 340) *
          song().settings.zoom) /
        2;
      return (r.w * height) / (15 * staff.gap * (pageRatios[r.page] || 1.294));
    }
    return (
      (clamp($("stage").clientWidth * 0.245, 170, 340) *
        song().settings.zoom *
        (r.w / r.h / (pageRatios[r.page] || 1.294))) /
      2
    );
  }
  function measureHTML(m: Measure, i: number, width: number) {
    const s = song(),
      r = practiceRegion(
        s,
        s.regions.find((r) => r.id === m.regionId)!,
      );
    const ly = s.lyrics.filter((l) => l.time >= m.start && l.time < m.end);
    const layout = isSVG ? xmlPracticeLayout!(s, r, width) : undefined;
    const height =
      layout?.height ??
      (width > 1 ? (width / r.w) * r.h * (pageRatios[r.page] || 1.294) : 165);
    // Two-row alignment keeps a shared height; mask ink outside this source system.
    let trim = "";
    if (layout) {
      const pageHeight = parseFloat(layout.size.split(" ")[1]);
      const offset = parseFloat(layout.position.split(" ")[1]);
      const top = Math.max(0, r.y * pageHeight + offset);
      const bottom = Math.max(0, height - ((r.y + r.h) * pageHeight + offset));
      trim = `clip-path:inset(${top}px 0 ${bottom}px 0);`;
    }
    const highlight = highlightPages[r.page];
    let overlay = "";
    if (isSVG && highlight?.measures.has(i)) {
      const scaledHeight = layout
        ? Number(layout.size.split(" ")[1].replace("px", ""))
        : height / r.h;
      const offsetY = layout
        ? Number(layout.position.split(" ")[1].replace("px", ""))
        : -r.y * scaledHeight;
      overlay = `<svg class="note-highlight" aria-hidden="true" data-highlight-measure="${i}" preserveAspectRatio="none" viewBox="${r.x * highlight.width} ${(-offsetY / scaledHeight) * highlight.height} ${r.w * highlight.width} ${(height / scaledHeight) * highlight.height}">${highlight.measures.get(i)}</svg>`;
    }
    const syl = ly
      .map((l) => {
        const b = ((l.time - m.start) / (m.end - m.start)) * m.beats;
        const x =
          s.settings.view === "ribbon"
            ? positionInMeasure(i, b, width) / width
            : xAtBeat(r, m, b);
        return `<span class="syllable" title="${l.confirmed ? i18nText("main.message232") : i18nText("main.message233")}" style="left:${x * 100}%;${l.text.length > 4 ? "font-size:14px;white-space:normal;max-width:95%;transform:none;" : ""}">${esc(l.text)}</span>`;
      })
      .join("");
    return (
      '<div class="measure" data-index="' +
      String(i) +
      '" style="width:' +
      String(width) +
      'px"><span class="label"><span class="measure-marker" aria-label="' +
      i18nText("main.message234") +
      '" ' +
      String(markedMeasureIndices(s).has(i) ? "" : "hidden") +
      ">⚑</span>" +
      i18nText("main.message235", { value4: esc(m.label) }) +
      '<span class="measure-beat" aria-label="' +
      i18nText("main.message236") +
      '">1</span><small class="measure-signature">' +
      String(m.beats) +
      "/" +
      String(m.denominator) +
      '</small></span><div class="crop" style="' +
      String(trim) +
      "width:" +
      String(width) +
      "px;height:" +
      String(height) +
      "px;background-image:url('" +
      String(urls[r.page]) +
      "');background-size:" +
      String(layout?.size ?? `${100 / r.w}% ${100 / r.h}%`) +
      ";background-position:" +
      String(
        layout?.position ??
          `${(r.x / (1 - r.w || 1)) * 100}% ${(r.y / (1 - r.h || 1)) * 100}%`,
      ) +
      '">' +
      String(overlay) +
      '</div><div class="lyrics" style="top:' +
      String(height + 6) +
      'px">' +
      String(syl) +
      "</div></div>"
    );
  }
  function positionInMeasure(index: number, beat: number, width: number) {
    const s = song(),
      m = s.measures[index],
      next = s.measures[index + 1];
    const r = practiceRegion(
      s,
      s.regions.find((r) => r.id === m.regionId)!,
    );
    const nextRegion =
      next &&
      practiceRegion(
        s,
        s.regions.find((r) => r.id === next.regionId)!,
      );
    const end =
      width + (next ? widthOf(next) * xAtBeat(nextRegion!, next, 0) : 0);
    return continuousX(r, m, beat, width, end);
  }
  function renderTrack() {
    scoreGestures.cancel();
    rowWindow = -1;
    pausedBrowseIndex = -1;
    stationarySelectionTime = undefined;
    nativeRibbonScroll = false;
    $("stage").classList.remove("paused-score-scroll", "paused-ribbon-scroll");
    $("stage").scrollLeft = 0;
    $("stage").scrollTop = 0;
    $("ribbon").style.transform = "";
    $("practice").classList.toggle("two-rows", s.settings.view === "rows");
    trackOffsets.length = trackWidths.length = 0;
    let offset = 0;
    $("ribbon").innerHTML = s.measures
      .map((m, i) => {
        const w =
          s.settings.view === "rows" ? $("stage").clientWidth / 4 : widthOf(m);
        trackOffsets.push(offset);
        trackWidths.push(w);
        offset += w;
        return measureHTML(m, i, w);
      })
      .join("");
    const height =
      Math.max(
        100,
        ...Array.from($("ribbon").querySelectorAll<HTMLElement>(".crop"), (e) =>
          parseFloat(e.style.height),
        ),
      ) + 30;
    $("stage").style.setProperty("--row-content-height", height + "px");
    $("stage").style.height =
      (s.settings.view === "rows" ? height * 2 + 84 : height + 70) + "px";
    $("zoom-row").hidden = s.settings.view !== "ribbon";
    $("view-selected-text").textContent =
      s.settings.view === "rows"
        ? i18nText("portable-player.message454")
        : i18nText("main.message109");
    $("view-description").textContent =
      s.settings.view === "ribbon"
        ? i18nText("main.message226")
        : i18nText("portable-player.message465");
    layoutLyrics();
    renderLists();
  }
  function renderRows(index: number) {
    const stage = $("stage"),
      ribbon = $("ribbon");
    if (!player.playing && !gestureScrub?.resume) {
      if (rowWindow !== -2) {
        rowWindow = -2;
        pausedBrowseIndex = -1;
        stage.classList.add("paused-score-scroll");

        renderedBrowseWidth = NaN;
      }
      const width = stage.clientWidth / 4;
      if (width !== renderedBrowseWidth) {
        renderedBrowseWidth = width;
        const rows = Math.ceil(s.measures.length / 4);
        ribbon.innerHTML = Array.from(
          { length: rows },
          (_, row) =>
            `<div class="browse-row"><div class="browse-strip">${Array.from(
              { length: 4 },
              (_, j) => {
                const i = row * 4 + j;
                return i >= 0 && i < s.measures.length
                  ? measureHTML(s.measures[i], i, width)
                  : `<div class="measure empty-measure" style="width:${width}px"></div>`;
              },
            ).join("")}</div></div>`,
        ).join("");
        layoutLyrics();
      }
      // Anchor only when playback position changes; native scrolling must survive frames.
      if (!gestureScrub && pausedBrowseIndex !== index) {
        pausedBrowseIndex = index;
        const row = ribbon.querySelector<HTMLElement>(
          `[data-index="${Math.floor(index / 4) * 4}"]`,
        );
        stage.scrollTop = Math.max(
          0,
          (row?.closest<HTMLElement>(".browse-row")?.offsetTop || 0) - 28,
        );
      }
      return;
    }
    if (stage.classList.contains("paused-score-scroll")) {
      stage.classList.remove("paused-score-scroll");
      stage.scrollTop = 0;
      pausedBrowseIndex = -1;
      rowWindow = -1;
    }
    const windowIndex = Math.floor(index / 4);
    if (windowIndex === rowWindow) return;
    rowWindow = windowIndex;
    const currentOnTop = (windowIndex - playbackRowOrigin) % 2 === 0;
    const upper = currentOnTop ? windowIndex : windowIndex + 1,
      lower = currentOnTop ? windowIndex + 1 : windowIndex;
    const indices = [
      ...Array.from({ length: 4 }, (_, j) => upper * 4 + j),
      ...Array.from({ length: 4 }, (_, j) => lower * 4 + j),
    ];
    $("ribbon").innerHTML = indices
      .filter((i) => i < s.measures.length)
      .map((i) => measureHTML(s.measures[i], i, $("stage").clientWidth / 4))
      .join("");
    layoutLyrics();
  }
  // One lyric baseline per score row; preserve time anchors in the song data.
  function layoutLyrics() {
    const rows = new Map<number, { el: HTMLElement; rect: DOMRect }[]>();
    $("ribbon")
      .querySelectorAll<HTMLElement>(".syllable")
      .forEach((el) => {
        el.style.top = "0px";
        el.style.marginLeft = "0px";
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const row =
          el.closest<HTMLElement>(".browse-row")?.offsetTop ??
          el.closest<HTMLElement>(".measure")!.offsetTop;
        if (!rows.has(row)) rows.set(row, []);
        rows.get(row)!.push({ el, rect });
      });
    for (const items of rows.values()) {
      const positions = packLabels(
        items.map(({ rect }) => ({ left: rect.left, width: rect.width })),
        2,
        // Clamp to the row content edge, not the moving viewport in ribbon mode.
        song().settings.view === "rows"
          ? (items[0].el
              .closest<HTMLElement>(".browse-strip")
              ?.getBoundingClientRect().left ??
              $("stage").getBoundingClientRect().left) + 4
          : $("ribbon").getBoundingClientRect().left + 4,
      );
      const baseline = Math.max(...items.map(({ rect }) => rect.top));
      items.forEach(({ el, rect }, i) => {
        el.style.marginLeft = `${positions[i] - rect.left}px`;
        el.style.top = `${baseline - rect.top}px`;
      });
    }
  }

  input("view").value = s.settings.view;
  input("view").onchange = () => {
    s.settings.view = input("view").value as "ribbon" | "rows";
    renderTrack();
  };
  input("zoom").oninput = () => {
    s.settings.zoom = Number(input("zoom").value);
    renderTrack();
  };
  let raf = 0;
  $("stage").addEventListener("scroll", () => {
    if (
      !ready ||
      !nativeRibbonScroll ||
      player.playing ||
      s.settings.view !== "ribbon"
    )
      return;
    const x = $("stage").scrollLeft;
    let i = trackOffsets.findIndex(
      (v, j) => j === trackOffsets.length - 1 || x < trackOffsets[j + 1],
    );
    i = Math.max(0, i);
    const local = x - trackOffsets[i],
      m = s.measures[i];
    let lo = 0,
      hi = m.beats;
    for (let n = 0; n < 20; n++) {
      const mid = (lo + hi) / 2;
      if (positionInMeasure(i, mid, trackWidths[i]) < local) lo = mid;
      else hi = mid;
    }
    player.seek(m.start + ((m.end - m.start) * (lo + hi)) / 2 / m.beats);
    stationarySelectionTime = player.current();
  });
  function frame() {
    raf = requestAnimationFrame(frame);
    if (!ready) return;
    const t = player.current(),
      { index, measure: m, beat } = locate(s, t),
      count = player.count();
    if (s.settings.view === "rows") {
      nativeRibbonScroll = false;
      $("stage").classList.remove("paused-ribbon-scroll");
      renderRows(index);
    } else {
      const stage = $("stage"),
        ribbon = $("ribbon");
      const x =
        trackOffsets[index] +
        positionInMeasure(index, beat, trackWidths[index]);
      if (!player.playing) {
        if (!nativeRibbonScroll) {
          nativeRibbonScroll = true;
          stage.classList.add("paused-ribbon-scroll");
          ribbon.style.transform = "none";
          stage.scrollLeft = x;
        } else if (!gestureScrub && stationarySelectionTime !== t)
          stage.scrollLeft = x;
      } else {
        nativeRibbonScroll = false;
        stage.classList.remove("paused-ribbon-scroll");
        stage.scrollLeft = 0;
        ribbon.style.transform = `translateX(${stage.clientWidth / 3 - x}px)`;
      }
    }
    if (isSVG)
      updateNoteHighlights(
        $("ribbon"),
        index,
        beat,
        !!count,
        noteHighlightEnabled && player.playing,
        notePulseBeats(m.beats, m.end - m.start, s.settings.rate),
      );
    $("position").textContent = i18nText("portable-player.message467", {
      value1: m.label,
      value2: count
        ? i18nText("main.message246") + count
        : Math.min(m.beats, Math.floor(beat) + 1) +
          i18nText("portable-player.message466"),
    });
    if (!gestureScrub && document.activeElement !== input("percent"))
      input("percent").value = String(
        Math.round((t / (player.duration || 1)) * 100),
      );
    document.querySelectorAll<HTMLElement>("[data-index]").forEach((el) => {
      const n = Number(el.dataset.index),
        bar = s.measures[n];
      el.classList.toggle("active", n === index);
      el.classList.toggle(
        "in-loop",
        !!player.loop &&
          bar.end > player.loop.start &&
          bar.start < player.loop.end,
      );
      if (n === index) {
        el.querySelector(".measure-beat")!.textContent = String(
          count || Math.floor(beat) + 1,
        );
        el.style.setProperty(
          "--played",
          xAtBeat(
            s.regions.find((r) => r.id === bar.regionId)!,
            bar,
            beat,
          ) *
            100 +
            "%",
        );
      }
    });
  }
  async function preparePages() {
    for (const [i, a] of currentPages.entries()) {
      const blob = decodePlaybackAsset(a),
        page = isSVG ? await practicePage(blob) : blob;
      if (isSVG) {
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
        highlightPages.push(await highlightPage(blob));
      }
      const url = URL.createObjectURL(page);
      urls.push(url);
      const image = new Image();
      image.src = url;
      await image.decode();
      pageRatios.push(image.naturalHeight / image.naturalWidth);
      if (isSVG)
        for (const [id, staff] of measurePageStaff(
          image,
          s.regions.filter((r) => r.page === i),
        ))
          practiceStaffs.set(id, staff);
    }
  }
  function formatControls() {
    input("pdf-view").checked = !isSVG;
    input("pdf-view").disabled = variants.length < 2;
    input("highlight").closest<HTMLElement>(".setting")!.hidden = !isSVG;
  }
  input("pdf-view").onchange = async () => {
    if (busy || !ready) return;
    const target = variants.find(
      (v) =>
        v.song.scoreFormat === (input("pdf-view").checked ? "pdf" : "musicxml"),
    );
    if (!target) return;
    busy = true;
    ready = false;
    player.pause();
    scoreGestures.cancel();
    try {
      for (const u of urls) URL.revokeObjectURL(u);
      urls.length = 0;
      pageRatios.length = 0;
      highlightPages.length = 0;
      practiceStaffs.clear();
      s.regions = structuredClone(target.song.regions);
      s.measures.forEach(
        (m, i) => (m.regionId = target.song.measures[i].regionId),
      );
      s.pageCount = target.song.pageCount;
      s.scoreFormat = target.song.scoreFormat;
      nativeRibbonScroll = false;
      renderedBrowseWidth = NaN;
      $("stage").classList.remove("paused-ribbon-scroll");
      $("stage").scrollLeft = 0;
      currentPages = target.pages;
      isSVG = s.scoreFormat === "musicxml";
      await preparePages();
      renderTrack();
      formatControls();
      ready = true;
    } catch (e) {
      fail(e);
    } finally {
      busy = false;
    }
  };
  try {
    await preparePages();
    formatControls();
    await player.load(decodePlaybackAsset(data.audio), s);
    if (s.measures[0].start >= player.duration)
      throw Error(i18nText("portable-player.message469"));
    sync();
    renderTrack();
    settings();
    ready = true;
    status("");
    document.body.dataset.ready = "true";
    document.body.dataset.readyMs = String(performance.now());
    frame();
  } catch (e) {
    fail(e);
    player.pause();
    for (const u of urls) URL.revokeObjectURL(u);
    $("play").setAttribute("disabled", "");
  }
  let lastWidth = $("stage").clientWidth;
  const observer = new ResizeObserver(() => {
    const width = $("stage").clientWidth;
    if (ready && width !== lastWidth) {
      lastWidth = width;
      renderTrack();
    }
  });
  observer.observe($("stage"));
  window.addEventListener(
    "pagehide",
    () => {
      ready = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      scoreGestures.dispose();
      disposeNumbers();
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
