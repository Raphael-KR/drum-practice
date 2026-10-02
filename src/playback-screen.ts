import { closeDialogOnBackdrop } from "./dialog-ui";
import { setIconButton } from "./icon-button";
/** The single playback screen owner. Hosts supply assets, persistence and authoring hooks. */
import type { Player } from "./audio-core";
import { enterFullscreen, installScreenControls } from "./fullscreen";
import { installHelp } from "./help";
import { t } from "./i18n";
import { icon, tempoNote } from "./icon-svg";
import { lyricMeasureId } from "./lyric-grid";
import { markMeasure } from "./marker-slots";
import {
  bindMarkerSlots,
  markerSlotsHTML,
  syncMarkerBadges,
} from "./marker-ui";
import { clamp, locate, uid, type Loop, type Song } from "./model";
import type { HighlightPage } from "./note-highlight";
import { bindNumericDrag, installNumericInputs } from "./numeric-drag";
import {
  attachPlaybackGestures,
  beginPlaybackScrub,
  changePlaybackLoop,
  finishPlaybackScrub,
  installPlaybackKeys,
  installPlaybackWheel,
  movePlaybackScrub,
  seekPlaybackFreely,
  validLoop,
  type ScrubSnapshot,
} from "./playback-actions";
import {
  buildScoreTrack,
  installScoreScroll,
  updateScoreFrame,
} from "./playback-frame";
import {
  layoutScoreLyrics,
  measurePosition,
  measureWidth,
  renderScoreRows,
  scoreLayout,
} from "./playback-layout";
import { renderMeasure } from "./playback-measure";
import { copyPosition, playbackPosition } from "./playback-position";
import { arrangePlaybackUI, type PlaybackBindings } from "./playback-ui";
import { scrubTime } from "./practice-controls";
import type { StaffPosition } from "./practice-staff-layout";
import {
  fillRepeatFields,
  repeatPoint,
  repeatPreset,
  updateRepeatControls,
} from "./repeat-ui";
import { displayRegion } from "./score-view";
import { componentName, installUIStandard, uiText } from "./ui-standard";

export interface PlaybackScreenHost {
  root: HTMLElement;
  environment: "web" | "portable";
  preferences: {
    restartId: string;
    countoffId: string;
    read(): { restartMeasure: boolean; countOff: boolean };
    write(value: { restartMeasure: boolean; countOff: boolean }): void;
  };
  display: {
    highlightId: string;
    fullscreenId: string;
    fullscreen(): boolean;
    setFullscreen(value: boolean): void;
    setHighlight(value: boolean): void;
    report(message: string): void;
  };
  afterFrame?(time: number): void;
  initialLastLoop?: Loop;
  ids: PlaybackBindings & {
    rewindButton: string;
    mark: string;
    sound: string;
    radiusAttribute: string;
    settings?: string;
  };
  song(): Song;
  player(): Player;
  ready(): boolean;
  busy(): boolean;
  setBusy(value: boolean): void;
  assets(): {
    urls: string[];
    ratios: number[];
    staffs: Map<string, StaffPosition>;
    highlights: (HighlightPage | undefined)[];
  };
  highlight(): boolean;
  formats(): string[];
  fail(error: unknown): void;
  changed(): void;
  pauseOverride?(): boolean;
  compare?: {
    render(): void;
    draw(time: number): void;
    target(e: PointerEvent): number;
  };
  trackChanged?(): void;
  listsChanged?(): void;
  loopChanged?(loop?: Loop): void;
  loopDraft?(): { id?: string; name: string };
  markerName?(): string;
  validateView?(view: Song["settings"]["view"]): void;
  settingsChanged?(): void;
}
export function createPlaybackScreen(h: PlaybackScreenHost) {
  const { root, ids } = h;
  arrangePlaybackUI(root, ids);
  installUIStandard(h.environment, root);
  installHelp(root);
  const get = <T extends HTMLElement = HTMLElement>(id: string) =>
    root.querySelector<T>(`#${id}`)!;
  const input = (id: string) => get<HTMLInputElement>(id);
  const stage = get("stage"),
    ribbon = get("ribbon");
  const disposers: (() => void)[] = [];
  const listen = (target: EventTarget, type: string, fn: EventListener) => {
    target.addEventListener(type, fn);
    disposers.push(() => target.removeEventListener(type, fn));
  };
  const run = (fn: () => unknown) => {
    try {
      Promise.resolve(fn()).catch(h.fail);
    } catch (e) {
      h.fail(e);
    }
  };
  const action = (id: string, fn: () => unknown) =>
    listen(get(id), "click", () =>
      run(() => {
        if (h.ready()) return fn();
      }),
    );
  if (ids.settings)
    disposers.push(installScreenControls(get(ids.settings), h.display.report));
  for (const name of ["settings", "tempo", "sound", "loop", "marker"]) {
    const dialog = root.querySelector<HTMLDialogElement>(`#${name}-dialog`);
    if (!dialog) continue;
    disposers.push(closeDialogOnBackdrop(dialog));
    const close = dialog.querySelector<HTMLElement>(".close-button");
    if (close) {
      close.onclick = null;
      listen(close, "click", () => dialog.close());
    }
  }
  let native = false,
    stationary: number | undefined,
    panStart = 0,
    copiedUntil = 0;
  const offsets: number[] = [],
    widths: number[] = [];
  const rows = {
    rowWindow: -1,
    pausedBrowseIndex: -1,
    renderedBrowseWidth: NaN,
    playbackRowOrigin: 0,
  };
  let scrub: ScrubSnapshot<{ center?: number; radius?: number }> | undefined;
  let center: number | undefined,
    radius: number | undefined,
    lastLoop: Loop | undefined = h.initialLastLoop;
  let disposed = false;
  const available = () => h.ready() && !h.busy();
  function position(index: number, beat: number, width: number) {
    return measurePosition(h.song(), index, beat, width, widthOf);
  }
  function widthOf(m: Song["measures"][number]) {
    const s = h.song(),
      a = h.assets(),
      r = displayRegion(
        s,
        s.regions.find((r) => r.id === m.regionId)!,
      );
    return measureWidth(
      s,
      r,
      stage.clientWidth,
      a.ratios[r.page] || 1.294,
      s.scoreFormat === "musicxml" ? a.staffs.get(r.id) : undefined,
    );
  }
  function measureHTML(m: Song["measures"][number], i: number, width: number) {
    const s = h.song(),
      a = h.assets(),
      r = displayRegion(
        s,
        s.regions.find((r) => r.id === m.regionId)!,
      );
    const staff = a.staffs.get(r.id),
      isSVG = s.scoreFormat === "musicxml";
    return renderMeasure({
      s,
      m,
      i,
      width,
      r,
      ly: s.lyrics.filter((l) => lyricMeasureId(s, l) === m.id),
      layout:
        isSVG && staff
          ? scoreLayout(s, r, width, stage.clientWidth, staff)
          : undefined,
      highlight: a.highlights[r.page],
      pageURL: a.urls[r.page],
      pageRatio: a.ratios[r.page] || 1.294,
      isSVG,
      positionInMeasure: position,
    });
  }
  function layoutLyrics() {
    layoutScoreLyrics(stage, ribbon, h.song().settings.view);
  }
  function renderRows(index: number) {
    renderScoreRows(
      {
        stage,
        ribbon,
        song: h.song,
        playing: h.player().playing,
        scrubbing: !!scrub,
        resume: !!scrub?.resume,
        measureHTML,
        layoutLyrics,
      },
      rows,
      index,
    );
  }
  function renderTrack() {
    if (!h.ready()) return;
    gestures.cancel();
    native = false;
    stationary = undefined;
    rows.rowWindow = rows.pausedBrowseIndex = -1;
    stage.classList.remove("paused-score-scroll", "paused-ribbon-scroll");
    stage.style.setProperty("--scroll-x", "0px");
    stage.scrollLeft = stage.scrollTop = 0;
    const s = h.song(),
      compare = s.settings.view === "compare";
    get("practice").classList.toggle("two-rows", s.settings.view !== "ribbon");
    get("practice").classList.toggle("score-review", compare);
    input("zoom").closest("label")!.hidden = s.settings.view !== "ribbon";
    if (compare) {
      stage.style.removeProperty("height");
      h.compare?.render();
    } else {
      buildScoreTrack(stage, ribbon, s, offsets, widths, widthOf, measureHTML);
      layoutLyrics();
      if (!s.measures.length)
        ribbon.innerHTML = `<p>${t("main.message243")}</p>`;
    }
    h.trackChanged?.();
    renderLists();
  }
  function open(id: string) {
    gestures.cancel();
    get<HTMLDialogElement>(`${id}-dialog`).showModal();
  }
  async function play(fromMeasureStart?: boolean) {
    if (!available()) return;
    h.setBusy(true);
    try {
      if (h.display.fullscreen() && !document.fullscreenElement)
        await enterFullscreen(h.display.report);
      await h.player().play(true, fromMeasureStart);
    } finally {
      h.setBusy(false);
    }
  }
  function pause() {
    if (!h.pauseOverride?.()) h.player().pause();
  }
  async function toggle() {
    if (!available()) return;
    if (h.player().playing) pause();
    else await play();
  }
  function onState() {
    if (!h.ready()) return;
    const p = h.player();
    if (p.playing && !stage.classList.contains("is-playing")) {
      rows.playbackRowOrigin = Math.floor(
        locate(h.song(), p.current()).index / 4,
      );
      rows.rowWindow = -1;
      stationary = undefined;
    }
    stage.classList.toggle("is-playing", p.playing);
    const b = get("play"),
      label = uiText(p.playing ? "pause" : "play");
    setIconButton(b, icon(p.playing ? "pause" : "play"), label);
    if (!p.playing) {
      h.song().settings.position = p.position || 0;
      h.changed();
    }
  }
  function renderLists() {
    if (!h.ready()) return;
    const s = h.song();
    updateRepeatControls(root, s, h.player().loop, radius, {
      summary: ids.summary,
      stop: ids.stop,
      adjust: ids.adjust,
      attribute: ids.radiusAttribute,
    });
    get(ids.markers).innerHTML = markerSlotsHTML(s, "data-quick-marker");
    syncMarkerBadges(ribbon, s);
    h.listsChanged?.();
  }
  function seek(time: number) {
    if (!h.ready()) return;
    stationary = undefined;
    seekPlaybackFreely(h.player(), time, (previous) => {
      lastLoop = previous;
      center = radius = undefined;
      renderLists();
    });
  }
  function beginScrub() {
    if (!available()) return;
    panStart = h.song().settings.view === "ribbon" ? stage.scrollLeft : 0;
    scrub = beginPlaybackScrub(h.player(), { center, radius });
  }
  function previewScrub(time: number) {
    if (scrub) {
      seek(time);
      progress();
    }
  }
  function finishScrub(cancel = false) {
    const previous = scrub;
    scrub = undefined;
    finishPlaybackScrub(
      h.player(),
      previous,
      cancel,
      (extra) => {
        center = extra.center;
        radius = extra.radius;
        renderLists();
      },
      h.fail,
    );
    if (previous) h.changed();
  }
  const gestures = attachPlaybackGestures(stage, {
    ready: available,
    song: h.song,
    player: h.player,
    prepare: () => {
      if (available()) void h.player().prepare?.().catch(h.fail);
    },
    resume: () => play(false),
    pause,
    seek,
    selected: (index, time) => {
      rows.pausedBrowseIndex = index;
      stationary = time;
    },
    fail: h.fail,
    target: (e) =>
      h.song().settings.view === "compare" && h.compare
        ? h.compare.target(e)
        : locate(h.song(), h.player().current()).index,
    start: beginScrub,
    move: (delta) =>
      movePlaybackScrub(
        {
          song: h.song(),
          stage,
          state: scrub,
          panStart,
          widths,
          duration: h.player().duration,
          seek: previewScrub,
        },
        delta,
      ),
    finish: finishScrub,
  });
  disposers.push(gestures.dispose);
  disposers.push(
    installPlaybackWheel(stage, {
      ready: available,
      playing: () => h.player().playing,
      view: () => h.song().settings.view,
      cancel: gestures.cancel,
      browse: () => renderRows(locate(h.song(), h.player().current()).index),
      scrub: (delta) =>
        seek(
          scrubTime(
            h.song(),
            h.player().current(),
            -delta,
            Math.max(150, stage.clientWidth / 4),
            h.player().duration,
          ),
        ),
    }),
  );
  disposers.push(
    installScoreScroll(stage, {
      enabled: () =>
        available() &&
        !h.player().playing &&
        native &&
        h.song().settings.view === "ribbon",
      song: h.song,
      offsets,
      widths,
      position,
      seek,
      selected: () => {
        stationary = h.player().current();
      },
    }),
  );
  disposers.push(
    bindNumericDrag(input(ids.progress), {
      onStart: beginScrub,
      onPreview: (v) => previewScrub((v * h.player().duration) / 100),
      onCommit: (v) => {
        if (scrub) finishScrub();
        else if (h.ready()) seek((v * h.player().duration) / 100);
      },
      onCancel: () => finishScrub(true),
      onTap: () => {
        if (h.ready()) open("marker");
      },
    }),
  );
  disposers.push(bindNumericDrag(input(ids.tempoInput)));
  disposers.push(
    installPlaybackKeys({
      ready: available,
      cancel: gestures.cancel,
      toggle: () => run(toggle),
      mark,
      step: (delta) =>
        seek(
          h.song().measures[
            clamp(
              locate(h.song(), h.player().current()).index + delta,
              0,
              h.song().measures.length - 1,
            )
          ].start,
        ),
    }),
  );
  stage.tabIndex = 0;
  stage.setAttribute("aria-label", componentName("score"));
  listen(stage, "click", (e) => {
    if ((e as MouseEvent).detail === 0 && available() && h.player().playing)
      run(toggle);
  });
  listen(document, "pointerdown", (e) => {
    if (e.target instanceof Element && !stage.contains(e.target))
      gestures.cancel();
  });
  listen(document, "visibilitychange", () => {
    if (document.hidden && h.ready()) {
      gestures.cancel();
      if (scrub) finishScrub(true);
      h.player().pause();
    }
  });
  function progress() {
    const p = h.player(),
      v = input(ids.progress),
      time = p.current();
    if (!scrub && document.activeElement !== v)
      v.value = String(Math.round(clamp(time / (p.duration || 1), 0, 1) * 100));
    v.setAttribute("aria-valuenow", v.value);
    const clock = (n: number) =>
      `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
    v.setAttribute(
      "aria-valuetext",
      `${v.value}% · ${clock(time)} / ${clock(p.duration)}`,
    );
  }
  function frame() {
    if (!h.ready() || !h.song().measures.length) return;
    const p = h.player(),
      s = h.song(),
      time = p.current();
    const label =
      performance.now() < copiedUntil
        ? t("main.message244")
        : playbackPosition(s, time).label;
    if (get(ids.position).textContent !== label)
      get(ids.position).textContent = label;
    native = updateScoreFrame({
      root,
      stage,
      ribbon,
      s,
      t: time,
      playing: p.playing,
      count: p.count(),
      loop: p.loop,
      highlight: s.scoreFormat === "musicxml" && h.highlight(),
      native,
      scrubbing: !!scrub,
      stationary,
      offsets,
      widths,
      position,
      rows: renderRows,
      compare: () => h.compare?.draw(time),
    });
    progress();
    h.afterFrame?.(time);
  }
  async function rate(bpm: number) {
    if (!available()) return;
    h.setBusy(true);
    try {
      if (!Number.isFinite(bpm) || bpm <= 0) throw Error(t("main.message248"));
      await h.player().setRate(clamp(bpm / h.song().bpm, 0.5, 1.2));
      h.changed();
    } finally {
      h.setBusy(false);
      sync();
    }
  }
  function sync() {
    if (!h.ready()) return;
    const s = h.song(),
      bpm = Number((s.bpm * s.settings.rate).toFixed(2));
    get(ids.title).textContent = [s.artist, s.title]
      .filter(Boolean)
      .join(" - ");
    const tempo = get<HTMLButtonElement>(ids.tempo);
    tempo.hidden = tempo.disabled = false;
    tempo.innerHTML = `${tempoNote}<span id="original-tempo-value">= ${bpm}</span>`;
    tempo.setAttribute("aria-label", t("main.message210", { value1: bpm }));
    tempo.title = t("main.message211");
    const v = input(ids.tempoInput);
    v.value = String(bpm);
    v.min = String(Math.ceil(s.bpm * 0.5));
    v.max = String(Math.floor(s.bpm * 1.2));
    for (const [key, value] of [
      ["now", v.value],
      ["min", v.min],
      ["max", v.max],
    ])
      v.setAttribute(`aria-value${key}`, value);
    const click = input("click");
    click.checked = s.settings.click;
    click.classList.toggle("on", s.settings.click);
    click.setAttribute("aria-pressed", String(s.settings.click));
    input("music-volume").value = String(s.settings.musicVolume);
    input("click-volume").value = String(s.settings.clickVolume);
    input("zoom").value = String(s.settings.zoom);
    input("view").value = s.settings.view;
    const select = get<HTMLSelectElement>("view");
    get("view-selected-text").textContent =
      select.selectedOptions[0]?.textContent || "";
    root.querySelectorAll<HTMLElement>("[data-tempo]").forEach((b) => {
      const active = Math.abs(Number(b.dataset.tempo) - bpm) < 0.01;
      b.classList.toggle("primary", active);
      b.setAttribute("aria-pressed", String(active));
    });
    syncDisplay();
    h.player().volumes();
    h.settingsChanged?.();
  }
  function syncDisplay() {
    const view = h.ready() ? h.song().settings.view : input("view").value;
    const select = get<HTMLSelectElement>("view");
    get("view-selected-text").textContent =
      select.selectedOptions[0]?.textContent || "";
    get("view-description").textContent = t(
      view === "compare"
        ? "main.message224"
        : view === "rows"
          ? "main.message225"
          : "main.message226",
    );
    const pdf = h.ready() && h.song().scoreFormat !== "musicxml";
    const control = input(h.display.highlightId);
    control.disabled = view === "compare" || pdf;
    control.checked = !control.disabled && h.highlight();
    get("note-highlight-description").textContent = t(
      view === "compare"
        ? "main.message252"
        : pdf
          ? h.formats().includes("musicxml")
            ? "main.message253"
            : "main.message254"
          : "main.message255",
    );
  }
  function openTempo() {
    const original = h.song().bpm;
    get("tempo-options").innerHTML = [
      ...new Set(
        [0.5, 0.6, 0.7, 0.8, 0.9].map((f) => Math.round(original * f)),
      ),
    ]
      .map((bpm) => `<button data-tempo="${bpm}">${bpm} BPM</button>`)
      .join("");
    get("tempo-reset").textContent = t("main.message251", { original });
    sync();
    open("tempo");
  }
  action(ids.tempo, openTempo);
  action("tempo-reset", () => rate(h.song().bpm));
  listen(get("tempo-options"), "click", (e) => {
    const b = (e.target as Element).closest<HTMLElement>("[data-tempo]");
    if (b && h.ready()) run(() => rate(Number(b.dataset.tempo)));
  });
  listen(input(ids.tempoInput), "change", () =>
    run(() => rate(Number(input(ids.tempoInput).value))),
  );
  action("play", toggle);
  action("home", () => seek(0));
  action(ids.rewindButton, () => {
    const n = Number(input(ids.rewind).value);
    if (!Number.isSafeInteger(n) || n < 1 || n > 10)
      throw Error(t("main.message249"));
    seek(
      h.song().measures[
        Math.max(0, locate(h.song(), h.player().current()).index - n)
      ].start,
    );
  });
  action(ids.position, async () => {
    await copyPosition(playbackPosition(h.song(), h.player().current()).text);
    copiedUntil = performance.now() + 1400;
    get(ids.position).textContent = t("main.message244");
  });
  action(ids.sound, () => open("sound"));
  const click = input("click");
  listen(click, click.type === "checkbox" ? "change" : "click", () => {
    if (!available()) return;
    h.song().settings.click =
      click.type === "checkbox" ? click.checked : !h.song().settings.click;
    sync();
    h.changed();
  });
  for (const [id, key] of [
    ["music-volume", "musicVolume"],
    ["click-volume", "clickVolume"],
  ] as const) {
    const change = () => {
      if (!available()) return;
      h.song().settings[key] = clamp(Number(input(id).value), 0, 1);
      h.player().volumes();
      h.changed();
    };
    listen(input(id), "input", change);
    listen(input(id), "change", change);
  }
  for (const id of ["view", "zoom"])
    listen(input(id), "change", () =>
      run(() => {
        if (!h.ready()) {
          h.settingsChanged?.();
          return;
        }
        if (h.busy()) return;
        const s = h.song().settings;
        if (id === "view") {
          const view = input(id).value as typeof s.view;
          try {
            h.validateView?.(view);
          } catch (e) {
            sync();
            throw e;
          }
          s.view = view;
        } else s.zoom = clamp(Number(input(id).value), 0.5, 2);
        sync();
        renderTrack();
        h.changed();
      }),
    );
  listen(input("zoom"), "input", () => {
    if (!available()) return;
    h.song().settings.zoom = clamp(Number(input("zoom").value), 0.5, 2);
    renderTrack();
    h.changed();
  });
  function fillLoop(loop: Loop) {
    const f = fillRepeatFields(root, h.song(), loop);
    const precise = input("loop-precise");
    precise.checked = f.precise;
    precision();
    bounds();
  }
  function precision() {
    get("loop-beat-controls").hidden = !input("loop-precise").checked;
    get("loop-range-help").textContent = t(
      input("loop-precise").checked ? "main.message259" : "main.message260",
    );
  }
  function bounds() {
    for (const [bar, beat] of [
      ["loop-a", "loop-ab"],
      ["loop-b", "loop-bb"],
    ]) {
      const m = h.ready() && h.song().measures[Number(input(bar).value) - 1];
      if (!m) continue;
      input(bar).max = String(h.song().measures.length);
      input(beat).max = String(m.beats + (bar === "loop-b" ? 1 : 0));
      input(beat).value = String(
        clamp(Number(input(beat).value), 1, Number(input(beat).max)),
      );
    }
  }
  listen(input("loop-precise"), "change", precision);
  for (const id of ["loop-a", "loop-b"]) listen(input(id), "change", bounds);
  function loopFromForm(
    id: string = h.loopDraft?.().id ?? uid(),
    name = h.loopDraft?.().name ?? "",
  ): Loop {
    const point = (bar: string, beat: string, end: boolean) =>
      repeatPoint(
        h.song(),
        Number(input(bar).value),
        input("loop-precise").checked ? Number(input(beat).value) : undefined,
        end,
      );
    const start = point("loop-a", "loop-ab", false),
      end = point("loop-b", "loop-bb", true);
    if (!validLoop(start, end, h.player().duration))
      throw Error(t("main.message265"));
    return {
      id,
      name:
        name.trim() ||
        t("main.message266", {
          value1: Number(input("loop-a").value),
          value2: Number(input("loop-b").value),
        }),
      start,
      end,
    };
  }
  function useLoop(loop?: Loop, preservePosition = false) {
    gestures.cancel();
    const p = h.player();
    if (loop && !validLoop(loop.start, loop.end, p.duration))
      throw Error(t("main.message265"));
    if (p.loop) lastLoop = p.loop;
    changePlaybackLoop(
      p,
      loop,
      preservePosition,
      () => {
        if (loop) {
          lastLoop = loop;
          fillLoop(loop);
        }
        h.loopChanged?.(loop);
        renderLists();
      },
      h.fail,
    );
  }
  function clearPreset() {
    center = radius = undefined;
  }
  function stopLoop() {
    clearPreset();
    useLoop();
  }
  function quickRepeat(value: number, recenter = false) {
    if (!available()) return;
    const preset = repeatPreset(
      h.song(),
      h.player().current(),
      h.player().duration,
      value,
      recenter || !h.player().loop ? undefined : center,
    );
    center = preset.center;
    radius = value;
    useLoop(preset.loop, true);
  }
  listen(
    get(ids.repeat || ids.summary).closest(".repeat-controls")!,
    "click",
    (e) => {
      const b = (e.target as Element).closest(`[${ids.radiusAttribute}]`);
      if (b)
        run(() => quickRepeat(Number(b.getAttribute(ids.radiusAttribute))));
    },
  );
  action("recenter-loop", () => quickRepeat(radius || 1, true));
  action(ids.stop, stopLoop);
  action(ids.adjust, () => {
    fillLoop(
      h.player().loop ||
        lastLoop ||
        repeatPreset(h.song(), h.player().current(), h.player().duration, 1)
          .loop,
    );
    open("loop");
  });
  action("apply-loop", () => {
    const l = loopFromForm();
    clearPreset();
    useLoop(l, true);
    get<HTMLDialogElement>("loop-dialog").close();
  });
  function mark() {
    if (!available()) return;
    markMeasure(h.song(), h.player().current(), uid(), h.markerName?.());
    renderLists();
    h.changed();
  }
  action(ids.mark, mark);
  disposers.push(
    bindMarkerSlots(get(ids.markers), h.song, seek, "data-quick-marker"),
  );
  const prefs = h.preferences;
  input(prefs.restartId).checked = prefs.read().restartMeasure;
  input(prefs.countoffId).checked = prefs.read().countOff;
  for (const id of [prefs.restartId, prefs.countoffId])
    listen(input(id), "change", () =>
      run(() =>
        prefs.write({
          restartMeasure: input(prefs.restartId).checked,
          countOff: input(prefs.countoffId).checked,
        }),
      ),
    );
  input(h.display.fullscreenId).checked = h.display.fullscreen();
  listen(input(h.display.fullscreenId), "change", () =>
    run(async () => {
      const value = input(h.display.fullscreenId).checked;
      h.display.setFullscreen(value);
      if (value && h.ready()) await enterFullscreen(h.display.report);
      else if (!value) {
        if (document.fullscreenElement) await document.exitFullscreen();
        h.display.report("");
      }
    }),
  );
  listen(input(h.display.highlightId), "change", () => {
    const inputElement = input(h.display.highlightId);
    if (!inputElement.disabled) h.display.setHighlight(inputElement.checked);
    if (h.ready()) {
      sync();
      frame();
    }
  });
  disposers.push(installNumericInputs(root));
  let raf = 0;
  const animate = () => {
    if (disposed) return;
    raf = requestAnimationFrame(animate);
    frame();
  };
  raf = requestAnimationFrame(animate);
  disposers.push(() => cancelAnimationFrame(raf));
  let lastWidth = stage.clientWidth;
  const observer =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          const w = stage.clientWidth;
          if (h.ready() && w !== lastWidth) {
            lastWidth = w;
            renderTrack();
          }
        })
      : undefined;
  observer?.observe(stage);
  function reset() {
    gestures.cancel();
    clearPreset();
    lastLoop = undefined;
    stationary = undefined;
    native = false;
    rows.rowWindow = rows.pausedBrowseIndex = -1;
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    for (const fn of disposers.reverse()) fn();
  }
  return {
    sync,
    syncDisplay,
    frame,
    onState,
    renderTrack,
    renderLists,
    toggle,
    play,
    rate,
    seek,
    mark,
    fillLoop,
    loopFromForm,
    updateLoopBeatBounds: bounds,
    useLoop,
    stopLoop,
    clearPreset,
    reset,
    dispose,
    cancel: gestures.cancel,
    get scrubbing() {
      return !!scrub;
    },
    get lastLoop() {
      return lastLoop;
    },
  };
}
