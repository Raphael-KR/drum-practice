import {
  bindSoundAndViewSettings,
  bindPlaybackPreferences,
} from "./playback-settings";
import { readRecordingTempo } from "../../content/recording-tempo";
import { beatTime as audioBeatTime } from "../../model/model";
import { metronomeVolume } from "../../model/metronome";
import { PHONE_LAYOUT_QUERY } from "../../platform/browser/phone-layout";
import { closeDialogOnBackdrop } from "../../shared/ui/dialog-ui";
import { mountLiquidGlass } from "../../shared/ui/liquid-glass";
import { setIconButton } from "../../shared/ui/icon-button";
import { audioMeasureHTML } from "../audio/audio-practice-view";
import { originalTempoMode } from "../audio/audio-time-map";
import { formatSongTitle } from "../library/song-title";
import { gridPhase } from "../score/ribbon-timeline";
import { sliderFromZoom } from "../score/score-zoom";
import { mountLoopSlots } from "./loop-slots";
import { selectPlaybackEngraving, type RibbonAsset } from "./playback-assets";
import { mountPlaybackDrawer } from "./playback-drawer";
import {
  syncMetronomeControls,
  syncSettingsChoices,
  type SettingsCategory,
} from "./playback-forms";
import { createPlaybackTempo } from "./playback-tempo";
import { installPhoneLandscapeSettings } from "./playback-settings-layout";
import { createPlaybackWakeLock } from "./playback-wake-lock";
import { installScoreOnlyView } from "./score-only-view";
import { syncCurrentSection } from "./section-shortcuts";
/** The single playback screen owner. Hosts supply assets, persistence and authoring hooks. */
import {
  clamp,
  locate,
  uid,
  xAtBeat,
  type Loop,
  type Song,
} from "../../model/model";
import {
  enterFullscreen,
  installScreenControls,
} from "../../platform/browser/fullscreen";
import { t } from "../../shared/i18n/i18n";
import { icon, tempoNote } from "../../shared/ui/icon-svg";
import {
  bindNumericDrag,
  installNumericInputs,
} from "../../shared/ui/numeric-drag";
import {
  componentName,
  installUIStandard,
  uiText,
} from "../../shared/ui/ui-standard";
import type { Player } from "../audio/audio-core";
import { installHelp } from "../help/help";
import { lyricMeasureId } from "../lyrics/lyric-grid";
import type { HighlightPage } from "../score/note-highlight";
import type { StaffPosition } from "../score/practice-staff-layout";
import { displayRegion } from "../score/score-view";
import {
  deleteMarkerSlot,
  pruneMarkerOverflow,
  toggleMeasureMarker,
} from "./marker-slots";
import {
  bindMarkerSlots,
  markerSlotsHTML,
  syncMarkerBadges,
} from "./marker-ui";
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
  ribbonPosition,
  scoreLayout,
} from "./playback-layout";
import { renderMeasure } from "./playback-measure";
import { copyPosition, playbackPosition } from "./playback-position";
import { arrangePlaybackUI, type PlaybackBindings } from "./playback-ui";
import { scrubTime } from "./practice-controls";
import { repeatPreset, updateRepeatControls } from "./repeat-ui";

export interface PlaybackScreenHost {
  root: HTMLElement;
  environment: "web" | "player";
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
    setPhoneLandscape?(active: boolean): Promise<void>;
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
  canonicalXML?(): string | undefined;
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
    ribbon?: Map<number, RibbonAsset>;
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
  validateView?(view: Song["settings"]["view"]): void;
  settingsChanged?(): void;
  settingsSelected?(category: SettingsCategory): void;
}
export function createPlaybackScreen(h: PlaybackScreenHost) {
  const { root, ids } = h;
  arrangePlaybackUI(root, ids);
  installUIStandard(h.environment, root);
  installHelp(root);
  const drawer = mountPlaybackDrawer(root, ids);
  const scoreOnlyView = installScoreOnlyView(root, h.ready);
  const settingsLayout = installPhoneLandscapeSettings(
    root,
    h.settingsSelected,
  );
  let applyingDisplayMode = false;
  const phoneLayout = window.matchMedia?.(PHONE_LAYOUT_QUERY);
  const repeatEnabled = () => !phoneLayout?.matches;
  root.classList.toggle("phone-layout", !repeatEnabled());
  const get = <T extends HTMLElement = HTMLElement>(id: string) =>
    root.querySelector<T>(`#${id}`)!;
  const input = (id: string) => get<HTMLInputElement>(id);
  const stage = get("stage"),
    ribbon = get("ribbon");
  const wakeLock = createPlaybackWakeLock();
  const disposers: (() => void)[] = [
    drawer.dispose,
    wakeLock.dispose,
    scoreOnlyView.dispose,
    settingsLayout.dispose,
    () => root.classList.remove("phone-layout"),
  ];
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
  for (const name of ["settings", "tempo", "loop", "marker"]) {
    const dialog = root.querySelector<HTMLDialogElement>(`#${name}-dialog`);
    if (!dialog) continue;
    if (name === "settings") disposers.push(mountLiquidGlass(dialog).dispose);
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
  let selectedIndex: number | undefined;
  const selectionIndex = () =>
    !h.player().playing && selectedIndex !== undefined
      ? selectedIndex
      : locate(h.song(), h.player().current()).index;
  const selectionTime = () =>
    !h.player().playing && selectedIndex !== undefined
      ? h.song().measures[selectedIndex].start
      : h.player().current();
  function selectMeasure(index: number) {
    if (h.player().playing) seek(h.song().measures[index].start);
    else selectedIndex = index;
    frame();
    stage.focus({ preventScroll: true });
  }
  const offsets: number[] = [],
    widths: number[] = [];
  const rows = {
    rowWindow: -1,
    pausedBrowseIndex: -1,
    renderedBrowseWidth: NaN,
    playbackRowOrigin: 0,
  };
  let fittedRowWidth: number | undefined;
  let scrub: ScrubSnapshot<{ center?: number; radius?: number }> | undefined;
  let center: number | undefined,
    radius: number | undefined,
    lastLoop: Loop | undefined = h.initialLastLoop;
  const repeatPresets = new Map<number, ReturnType<typeof repeatPreset>>();
  let disposed = false;
  const available = () => h.ready() && !h.busy();
  const canRepeat = () => available() && repeatEnabled();
  function position(index: number, beat: number, width: number) {
    const s = h.song(),
      asset = ribbonAsset(index);
    if (asset) {
      if (s.settings.uniformSpacing) {
        const m = s.measures[index];
        return (
          width *
          gridPhase((beat * 4) / m.denominator, (m.beats * 4) / m.denominator)
        );
      }
      if (s.settings.view === "rows")
        return width * xAtBeat(asset.region, s.measures[index], beat);
      // Ribbon motion retains the continuous musical timeline.
      const timeline = h.assets().ribbon!.get(index)!;
      return ribbonPosition(
        width,
        beat,
        s.measures[index].beats,
        timeline.phase,
      );
    }
    if (s.audioPractice) {
      const m = s.measures[index];
      return (width * (audioBeatTime(m, beat) - m.start)) / (m.end - m.start);
    }
    return measurePosition(s, index, beat, width, widthOf);
  }
  function ribbonAsset(index: number) {
    if (h.song().scoreFormat !== "musicxml") return undefined;
    const asset = h.assets().ribbon?.get(index);
    return selectPlaybackEngraving(
      asset,
      h.song().settings.uniformSpacing,
      h.song().settings.view,
    );
  }
  function widthOf(m: Song["measures"][number]) {
    if (h.song().audioPractice)
      return Math.max(120, (stage.clientWidth / 4) * h.song().settings.zoom);
    const s = h.song(),
      a = h.assets(),
      timeline =
        s.scoreFormat === "musicxml"
          ? a.ribbon?.get(s.measures.indexOf(m))
          : undefined,
      r =
        timeline?.region ??
        displayRegion(
          s,
          s.regions.find((r) => r.id === m.regionId)!,
        );
    if (s.settings.uniformSpacing && timeline?.grid)
      return (
        (stage.clientWidth / 4) *
        (s.settings.view === "ribbon" ? s.settings.zoom : 1)
      );
    return measureWidth(
      s,
      r,
      stage.clientWidth,
      timeline?.ratio ?? a.ratios[r.page] ?? 1.294,
      timeline?.staff ?? a.staffs.get(r.id),
    );
  }
  function measureHTML(m: Song["measures"][number], i: number, width: number) {
    if (h.song().audioPractice) return audioMeasureHTML(h.song(), m, i, width);
    const s = h.song(),
      a = h.assets(),
      timeline = ribbonAsset(s.measures.indexOf(m)),
      r =
        timeline?.region ??
        displayRegion(
          s,
          s.regions.find((r) => r.id === m.regionId)!,
        );
    const staff = timeline?.staff ?? a.staffs.get(r.id),
      isSVG = s.scoreFormat === "musicxml";
    return renderMeasure({
      s,
      m,
      i,
      width,
      r,
      ly: s.lyrics.filter((l) => lyricMeasureId(s, l) === m.id),
      layout: staff
        ? scoreLayout(s, r, width, stage.clientWidth, staff)
        : undefined,
      highlight: timeline?.highlight ?? a.highlights[r.page],
      pageURL: timeline?.url ?? a.urls[r.page],
      pageRatio: timeline?.ratio ?? a.ratios[r.page] ?? 1.294,
      isSVG,
      positionInMeasure: (index, beat, cellWidth) =>
        timeline && !s.settings.uniformSpacing
          ? cellWidth * xAtBeat(r, s.measures[index], beat)
          : position(index, beat, cellWidth),
    });
  }
  function layoutLyrics() {
    layoutScoreLyrics(stage, ribbon, h.song().settings.view);
  }

  function rowCellWidth() {
    if (
      fittedRowWidth !== undefined &&
      fittedRowWidth === stage.clientWidth / 4
    )
      return fittedRowWidth;
    const song = h.song();
    const s: Song = { ...song, settings: { ...song.settings, view: "rows" } };
    const base = stage.clientWidth / 4;
    if (!stage.clientHeight) return base;
    const assets = h.assets();
    const naturalHeight = Math.max(
      s.audioPractice ? 100 : 1,
      ...s.regions.map((region) => {
        const staff = assets.staffs.get(region.id);
        return staff
          ? scoreLayout(
              s,
              displayRegion(s, region),
              base,
              stage.clientWidth,
              staff,
            )?.height || 100
          : 100;
      }),
    );
    // Size rows from the full available width; surrounding UI must not shrink notation.
    const width = base;
    const selectedHeight =
      s.settings.uniformSpacing && s.scoreFormat === "musicxml"
        ? Math.max(
            ...s.measures.map((_, i) => {
              const asset = ribbonAsset(i);
              return asset
                ? scoreLayout(
                    s,
                    asset.region,
                    base,
                    stage.clientWidth,
                    asset.staff,
                  )!.height
                : naturalHeight;
            }),
          )
        : naturalHeight;
    const fittedHeight = Math.max(naturalHeight, selectedHeight) + 30;
    stage.style.setProperty(
      "--two-row-stage-height",
      `${Math.ceil(fittedHeight * 2 + 56 + 2)}px`,
    );
    stage.style.setProperty("--fitted-row-width", `${stage.clientWidth}px`);
    stage.style.setProperty("--row-content-height", `${fittedHeight}px`);
    stage.style.setProperty("--browse-row-pitch", `${fittedHeight + 28}px`);
    fittedRowWidth = width;
    return width;
  }
  function renderRows(index: number) {
    renderScoreRows(
      {
        stage,
        ribbon,
        song: h.song,
        playing: h.player().playing,
        scrubbing: !!scrub || !!loopSlots?.selecting,
        resume: !!scrub?.resume,
        measureHTML,
        layoutLyrics,
        cellWidth: rowCellWidth(),
      },
      rows,
      index,
    );
  }
  function renderTrack() {
    if (!h.ready()) return;
    refreshSources();
    gestures.cancel();
    native = false;
    stationary = undefined;
    rows.rowWindow = rows.pausedBrowseIndex = -1;
    fittedRowWidth = undefined;
    stage.classList.remove("paused-score-scroll", "paused-ribbon-scroll");
    stage.style.setProperty("--scroll-x", "0px");
    stage.scrollLeft = stage.scrollTop = 0;
    const s = h.song(),
      compare = s.settings.view === "compare";
    stage.setAttribute(
      "aria-label",
      s.audioPractice ? t("audioPractice.timeline") : componentName("score"),
    );
    get("practice").classList.toggle("two-rows", s.settings.view !== "ribbon");
    get("practice").classList.toggle("score-review", compare);
    get("practice").classList.toggle(
      "uniform-spacing",
      !!s.settings.uniformSpacing && s.scoreFormat === "musicxml",
    );
    input("zoom").closest("label")!.hidden =
      s.settings.view !== "ribbon" && !scoreOnlyView.active();
    if (compare) {
      stage.style.removeProperty("height");
      h.compare?.render();
    } else {
      // Both views share the two-row outer geometry; track rendering sets its own content height.
      if (s.settings.view !== "rows") rowCellWidth();
      buildScoreTrack(stage, ribbon, s, offsets, widths, widthOf, measureHTML);
      // Crop sizing also writes row CSS variables. Apply the fitted row
      // geometry afterwards so the cached first frame matches later frames.
      if (s.settings.view === "rows") rowCellWidth();
      layoutLyrics();
      if (!s.measures.length)
        ribbon.innerHTML = `<p>${t("main.message243")}</p>`;
    }
    h.trackChanged?.();
    renderLists();
    scoreOnlyView.alignStaff();
  }
  function open(id: string) {
    gestures.cancel();
    if (id === "loop" || id === "marker") {
      drawer.show(id);
      return;
    }
    get<HTMLDialogElement>(`${id}-dialog`).showModal();
  }
  async function play(fromMeasureStart?: boolean) {
    if (!available()) return;
    h.setBusy(true);
    try {
      if (!h.player().playing && selectedIndex !== undefined)
        seek(h.song().measures[selectedIndex].start);
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
    else {
      const p = h.player();
      if (radius !== undefined && p.loop) p.seek(p.loop.start);
      await play();
    }
  }
  function onState() {
    wakeLock.setPlaying(h.ready() && h.player().playing);
    if (!h.ready()) return;
    const p = h.player();
    if (p.playing) selectedIndex = undefined;
    if (p.playing && !stage.classList.contains("is-playing")) {
      const index = locate(h.song(), p.current()).index;
      const stageRect = stage.getBoundingClientRect();
      const cellRect = ribbon
        .querySelector<HTMLElement>(`[data-index="${index}"]`)
        ?.getBoundingClientRect();
      const startsOnLowerRow =
        h.song().settings.view === "rows" &&
        stageRect.height > 0 &&
        cellRect !== undefined &&
        cellRect.top >= stageRect.top + stageRect.height / 2 &&
        cellRect.top < stageRect.bottom;
      rows.playbackRowOrigin =
        Math.floor(index / 4) - (startsOnLowerRow ? 1 : 0);
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
    if (pruneMarkerOverflow(s)) h.changed();
    updateRepeatControls(
      root,
      s,
      h.player().loop,
      radius,
      {
        summary: ids.summary,
        stop: ids.stop,
        adjust: ids.adjust,
        attribute: ids.radiusAttribute,
      },
      new Map([...repeatPresets].map(([key, preset]) => [key, preset.loop])),
    );
    get(ids.markers).innerHTML = markerSlotsHTML(s, "data-quick-marker");
    syncMarkerBadges(ribbon, s);
    loopSlots?.render();
    h.listsChanged?.();
  }
  function seek(time: number, countOff = false) {
    if (!h.ready()) return;
    stationary = undefined;
    selectedIndex = undefined;
    seekPlaybackFreely(
      h.player(),
      time,
      (previous) => {
        lastLoop = previous;
        center = radius = undefined;
        renderLists();
      },
      countOff,
    );
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
    pausedDoubleTap: (index) => {
      if (!canRepeat()) return;
      selectMeasure(index);
      loopSlots?.endpoint(index);
      frame();
    },
    pausedTap: (index) => {
      if (
        !available() ||
        h.player().playing ||
        index !== selectionIndex() ||
        loopSlots?.awaitingEndpoint
      )
        return false;
      selectMeasure(index);
      run(() => play());
      return true;
    },
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
  const loopSlots: ReturnType<typeof mountLoopSlots> = mountLoopSlots(
    root,
    stage,
    {
      song: h.song,
      player: () => ({ loop: h.player().loop, current: selectionTime }),
      changed: h.changed,
      pause: () => {
        gestures.cancel();
        pause();
        frame();
        stationary = h.player().current();
      },
      use: (loop) => {
        if (loop) selectedIndex = undefined;
        clearPreset();
        useLoop(loop);
      },
      ready: canRepeat,
    },
  );
  disposers.push(loopSlots.dispose);

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
        !loopSlots?.selecting &&
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
      surface:
        input(ids.progress).closest<HTMLElement>(".progress-number") ??
        undefined,
      onStart: beginScrub,
      onPreview: (v) =>
        previewScrub(
          h.song().measures[v - (h.song().measures[0]?.audioPrelude ? 0 : 1)]
            ?.start ?? 0,
        ),
      onCommit: (v) => {
        if (scrub) finishScrub();
        else if (h.ready())
          seek(
            h.song().measures[v - (h.song().measures[0]?.audioPrelude ? 0 : 1)]
              ?.start ?? 0,
          );
      },
      onCancel: () => finishScrub(true),
    }),
  );
  disposers.push(bindNumericDrag(input(ids.rewind)));
  disposers.push(bindNumericDrag(input(ids.tempoInput)));
  disposers.push(
    installPlaybackKeys({
      ready: () => available() && !loopSlots?.selecting,
      cancel: gestures.cancel,
      toggle: () => run(toggle),
      mark,
      rows: () => h.song().settings.view === "rows",
      rowStep: (delta) => {
        // Two-row practice lays out four measures per row. Keep the column;
        // an absent cell in the first/last/incomplete row is not a seek target.
        const index = selectionIndex() + delta * 4;
        const measure = h.song().measures[index];
        if (measure) selectMeasure(index);
      },
      step: (delta) =>
        selectMeasure(
          clamp(selectionIndex() + delta, 0, h.song().measures.length - 1),
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
    if (!scrub && document.activeElement !== v) {
      const value = String(
        selectionIndex() + (h.song().measures[0]?.audioPrelude ? 0 : 1),
      );
      if (v.value !== value) v.value = value;
    }
    const prelude = !!h.song().measures[0]?.audioPrelude;
    const min = prelude ? "0" : "1";
    if (v.min !== min) v.min = min;
    const total = h.song().measures.length - (prelude ? 1 : 0);
    if (v.max !== String(total)) v.max = String(total);
    const totalElement = v.parentElement!.querySelector(".progress-total")!;
    if (totalElement.textContent !== String(total))
      totalElement.textContent = String(total);
    const clock = (n: number) =>
      `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
    for (const [name, value] of [
      ["aria-valuemin", min],
      ["aria-valuemax", String(total)],
      ["aria-valuenow", v.value],
      [
        "aria-valuetext",
        `${v.value} / ${total} · ${clock(time)} / ${clock(p.duration)}`,
      ],
    ])
      if (v.getAttribute(name) !== value) v.setAttribute(name, value);
  }
  const {
    rate,
    headerBpm,
    syncHeaderBpm,
    originalAudioBpm,
    minimumPracticeBpm,
    refreshSources,
    prepareTempo,
  } = createPlaybackTempo(h, {
    get,
    input,
    available,
    isDisposed: () => disposed,
    sync,
    open,
    action,
    listen,
    run,
  });
  function frame() {
    if (!h.ready() || !h.song().measures.length) return;
    const p = h.player(),
      s = h.song(),
      time = p.current();
    const positionButton = root.querySelector<HTMLElement>(`#${ids.position}`);
    if (positionButton) {
      const label =
        performance.now() < copiedUntil
          ? t("main.message244")
          : playbackPosition(s, selectionTime()).label;
      if (positionButton.textContent !== label)
        positionButton.textContent = label;
    }
    native = updateScoreFrame({
      root,
      stage,
      ribbon,
      s,
      t: time,
      selectedIndex: !p.playing ? selectedIndex : undefined,
      playing: p.playing,
      count: p.count(),
      loop: p.loop,
      repeatEnabled: repeatEnabled(),
      highlight:
        s.scoreFormat === "musicxml" &&
        (scoreOnlyView.active() || h.highlight()),
      native,
      scrubbing: !!scrub || !!loopSlots?.selecting,
      stationary,
      offsets,
      widths,
      position,
      rows: renderRows,
      // Progress must use the same cropped engraving as the visible measure.
      regionAt: (i) => ribbonAsset(i)?.region,
      compare: () => h.compare?.draw(time),
    });
    syncHeaderBpm();
    progress();
    syncCurrentSection(root, locate(h.song(), time).index);
    loopSlots?.refreshKeyboardPreview();
    h.afterFrame?.(time);
  }
  function sync() {
    if (!h.ready()) return;
    refreshSources();
    prepareTempo();
    const s = h.song(),
      bpm = originalTempoMode(s)
        ? s.bpm
        : Number((originalAudioBpm() * s.settings.rate).toFixed(3));
    get(ids.title).textContent = formatSongTitle(s);
    const info = root.querySelector<HTMLElement>("#recording-tempo-info");
    if (info) {
      const recording = readRecordingTempo(h.canonicalXML?.());
      info.hidden = !recording;
      info.textContent = recording
        ? t("tempo.recordingEstimate", {
            score: s.bpm,
            recording: recording.bpmEstimate,
            firstBeat: recording.firstBeatEstimateSeconds,
          })
        : "";
    }
    const tempo = get<HTMLButtonElement>(ids.tempo);
    tempo.hidden = tempo.disabled = false;
    tempo.innerHTML = `${tempoNote}<span id="original-tempo-value">= ${headerBpm()}</span>`;
    tempo.setAttribute(
      "aria-label",
      t("main.message210", { value1: headerBpm() }),
    );
    tempo.title = t("main.message211");
    const v = input(ids.tempoInput);
    if (!h.busy()) v.value = String(bpm);
    v.min = String(minimumPracticeBpm());
    v.max = String(Math.floor(originalAudioBpm() * 1.2));
    for (const [key, value] of [
      ["now", v.value],
      ["min", v.min],
      ["max", v.max],
    ])
      v.setAttribute(`aria-value${key}`, value);
    syncMetronomeControls(root, s.settings);
    input("music-volume").value = String(s.settings.musicVolume);
    input("click-volume").value = String(metronomeVolume(s.settings));
    for (const id of ["music-volume", "click-volume"]) {
      const output = root.querySelector(`#${id}-value`);
      if (output)
        output.textContent = `${Math.round(Number(input(id).value) * 100)}%`;
    }
    input("zoom").value = String(sliderFromZoom(s.settings.zoom));
    input("zoom").setAttribute(
      "aria-valuetext",
      `${Math.round(s.settings.zoom * 100)}%`,
    );
    get("zoom-value").textContent = `${Math.round(s.settings.zoom * 100)}%`;
    input("view").value = s.settings.view;
    const select = get<HTMLSelectElement>("view");
    get("view-selected-text").textContent =
      select.selectedOptions[0]?.textContent || "";
    root.querySelectorAll<HTMLElement>("[data-tempo]").forEach((b) => {
      const active =
        b.id === "tempo-reset"
          ? originalTempoMode(s)
          : !originalTempoMode(s) &&
            Math.abs(Number(b.dataset.tempo) - bpm) < 0.01;
      b.classList.toggle("primary", active);
      b.setAttribute("aria-pressed", String(active));
    });
    syncDisplay();
    h.player().volumes();
    h.settingsChanged?.();
  }
  function syncDisplay() {
    scoreOnlyView.sync();
    if (h.ready()) prepareTempo();
    settingsLayout.sync(scoreOnlyView.active());
    syncPhoneDisplayMode();
    syncRepeatAvailability();
    syncSettingsChoices(root);
    const view = h.ready() ? h.song().settings.view : input("view").value;
    const zoom = input("zoom");
    zoom.closest("label")!.hidden =
      view !== "ribbon" && !scoreOnlyView.active();
    zoom.disabled = view !== "ribbon";
    root
      .querySelectorAll<HTMLButtonElement>("[data-row-view]")
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.rowView === view),
        );
        button.disabled = !h.ready() || h.busy();
      });
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
    const spacing = input("uniform-spacing");
    spacing.disabled =
      !h.ready() ||
      pdf ||
      view === "compare" ||
      !h.assets().ribbon?.get(0)?.grid;
    spacing.checked = h.ready() && !!h.song().settings.uniformSpacing;
    get("uniform-spacing-description").textContent = t(
      spacing.disabled
        ? "settings.uniformSpacingUnavailable"
        : "settings.uniformSpacingDescription",
    );
    const control = input(h.display.highlightId);
    control.disabled = view === "compare" || pdf;
    control.checked =
      !control.disabled && (scoreOnlyView.active() || h.highlight());
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
  function syncPhoneDisplayMode() {
    if (
      !h.ready() ||
      h.busy() ||
      applyingDisplayMode ||
      !h.display.setPhoneLandscape
    )
      return;
    const phone = scoreOnlyView.active();
    applyingDisplayMode = true;
    void Promise.resolve()
      .then(() => {
        if (!disposed && h.ready() && !h.busy())
          return h.display.setPhoneLandscape!(phone);
      })
      .catch(h.fail)
      .finally(() => {
        applyingDisplayMode = false;
        if (!disposed && phone !== scoreOnlyView.active()) syncDisplay();
      });
  }
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
  if (root.querySelector(`#${ids.position}`))
    action(ids.position, async () => {
      await copyPosition(playbackPosition(h.song(), h.player().current()).text);
      copiedUntil = performance.now() + 1400;
      get(ids.position).textContent = t("main.message244");
    });
  const settingsBindings = {
    root,
    get,
    input,
    listen,
    run,
    available,
    sync,
    renderTrack,
    frame,
  };
  bindSoundAndViewSettings(h, settingsBindings);
  function useLoop(loop?: Loop, preservePosition = false) {
    if (loop && !repeatEnabled()) return;
    gestures.cancel();
    const p = h.player();
    if (loop && !validLoop(loop.start, loop.end, p.duration))
      throw Error(t("main.message265"));
    if (p.loop) lastLoop = p.loop;
    if (loop) {
      selectedIndex = undefined;
      stationary = undefined;
    }
    changePlaybackLoop(
      p,
      loop,
      preservePosition,
      () => {
        if (loop) {
          lastLoop = loop;
        }
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
  function quickRepeat(value: number) {
    if (!canRepeat()) return;
    if (h.player().loop && radius === value) {
      repeatPresets.delete(value);
      stopLoop();
      return;
    }
    const preset =
      repeatPresets.get(value) ??
      repeatPreset(
        h.song(),
        h.player().current(),
        h.player().duration,
        value,
        !h.player().loop ? undefined : center,
      );
    repeatPresets.delete(value);
    repeatPresets.set(value, preset);
    center = preset.center;
    radius = value;
    useLoop(preset.loop);
    drawer.show("loop");
  }
  listen(root.querySelector(".repeat-presets")!, "click", (e) => {
    const b = (e.target as Element).closest(`[${ids.radiusAttribute}]`);
    if (b) run(() => quickRepeat(Number(b.getAttribute(ids.radiusAttribute))));
  });

  action(ids.adjust, () => {
    if (!canRepeat()) return;
    if (h.player().loop) {
      stopLoop();
      return;
    }
    const recent = [...repeatPresets.entries()].at(-1);
    if (recent) quickRepeat(recent[0]);
  });
  function mark() {
    if (!available()) return;
    toggleMeasureMarker(h.song(), selectionTime(), uid());
    renderLists();
    progress();
    h.changed();
  }
  disposers.push(
    bindMarkerSlots(
      get(ids.markers),
      h.song,
      (time) => seek(time, true),
      "data-quick-marker",
      false,
      {
        current: selectionTime,
        toggleCurrent: mark,
        remove: (id) => {
          deleteMarkerSlot(h.song(), id);
          renderLists();
          progress();
          h.changed();
        },
      },
    ),
  );
  bindPlaybackPreferences(h, settingsBindings);
  disposers.push(installNumericInputs(root));
  function syncRepeatAvailability() {
    const phone = !repeatEnabled();
    const enteringPhone = phone && !root.classList.contains("phone-layout");
    root.classList.toggle("phone-layout", phone);
    if (!phone || !h.ready()) return;
    if (enteringPhone) {
      gestures.cancel();
      if (scrub) finishScrub(true);
    }
    if (loopSlots.awaitingEndpoint) loopSlots.cancel();
    clearPreset();
    // Reuse the normal loop-off path so already scheduled audio is cancelled too.
    // Saved loops and slots remain on the song; returning to a wider layout only
    // makes them available again, without unexpectedly restarting a loop.
    if (h.player().loop) useLoop();
    const focused = document.activeElement;
    if (
      focused instanceof HTMLElement &&
      root.contains(focused) &&
      focused.closest('.dock-repeat, [data-drawer-panel="loop"]')
    )
      stage.focus({ preventScroll: true });
  }
  if (phoneLayout)
    listen(phoneLayout, "change", () => {
      syncRepeatAvailability();
      renderLists();
      frame();
    });
  if (scoreOnlyView.media)
    listen(scoreOnlyView.media, "change", () => {
      syncDisplay();
      frame();
    });
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
          if (!h.ready()) return;
          const w = stage.clientWidth;
          if (w !== lastWidth) {
            lastWidth = w;
            renderTrack();
          } else scoreOnlyView.alignStaff();
        })
      : undefined;
  observer?.observe(stage);
  observer?.observe(root.querySelector<HTMLElement>("main")!);
  function reset() {
    loopSlots?.cancel();
    gestures.cancel();
    clearPreset();
    repeatPresets.clear();
    selectedIndex = undefined;
    lastLoop = undefined;
    stationary = undefined;
    native = false;
    fittedRowWidth = undefined;
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
