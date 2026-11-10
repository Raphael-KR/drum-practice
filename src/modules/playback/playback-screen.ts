import { createPlaybackNavigation } from "./playback-navigation";
import { locate, uid, type Loop, type Song } from "../../model/model";
import {
  enterFullscreen,
  installScreenControls,
} from "../../platform/browser/fullscreen";
import { PHONE_LAYOUT_QUERY } from "../../platform/browser/phone-layout";
import { t } from "../../shared/i18n/i18n";
import { closeDialogOnBackdrop } from "../../shared/ui/dialog-ui";
import { setIconButton } from "../../shared/ui/icon-button";
import { icon } from "../../shared/ui/icon-svg";
import { mountLiquidGlass } from "../../shared/ui/liquid-glass";
import { installNumericInputs } from "../../shared/ui/numeric-drag";
import {
  componentName,
  installUIStandard,
  uiText,
} from "../../shared/ui/ui-standard";
import type { Player } from "../audio/audio-core";
import { installHelp } from "../help/help";
import type { HighlightPage } from "../score/note-highlight";
import type { StaffPosition } from "../score/practice-staff-layout";
import { mountLoopSlots } from "./loop-slots";
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
  beginPlaybackScrub,
  changePlaybackLoop,
  finishPlaybackScrub,
  seekPlaybackFreely,
  validLoop,
  type ScrubSnapshot,
} from "./playback-actions";
import { type RibbonAsset } from "./playback-assets";
import { createPlaybackDisplay } from "./playback-display";
import { mountPlaybackDrawer } from "./playback-drawer";
import type { SettingsCategory } from "./playback-forms";
import { buildScoreTrack, updateScoreFrame } from "./playback-frame";
import { copyPosition, playbackPosition } from "./playback-position";
import {
  bindPlaybackPreferences,
  bindSoundAndViewSettings,
} from "./playback-settings";
import { installPhoneLandscapeSettings } from "./playback-settings-layout";
import { createPlaybackTempo } from "./playback-tempo";
import { createPlaybackTrack } from "./playback-track";
import { arrangePlaybackUI, type PlaybackBindings } from "./playback-ui";
import { createPlaybackWakeLock } from "./playback-wake-lock";
import { repeatPreset, updateRepeatControls } from "./repeat-ui";
import { installScoreOnlyView } from "./score-only-view";
import { syncCurrentSection } from "./section-shortcuts";

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
/** Owns selection, transport, repeats and listener lifetime for both app hosts. */
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
  const track = createPlaybackTrack(h, {
    stage,
    ribbon,
    scrubbing: () => !!scrub || !!loopSlots?.selecting,
    resuming: () => !!scrub?.resume,
  });
  const {
    rows,
    position,
    ribbonAsset,
    widthOf,
    measureHTML,
    layoutLyrics,
    rowCellWidth,
    renderRows,
  } = track;
  let scrub: ScrubSnapshot<{ center?: number; radius?: number }> | undefined;
  let center: number | undefined,
    radius: number | undefined,
    lastLoop: Loop | undefined = h.initialLastLoop;
  const repeatPresets = new Map<number, ReturnType<typeof repeatPreset>>();
  let disposed = false;
  let framePending = true;
  let framedSong: Song | undefined;
  let framedTime: number | undefined;
  let framedSelection: number | undefined;
  let framedFocus: Element | null | undefined;
  let framedCopyActive = false;
  const available = () => h.ready() && !h.busy();
  const canRepeat = () => available() && repeatEnabled();
  function renderTrack() {
    framePending = true;
    if (!h.ready()) return;
    refreshSources();
    gestures.cancel();
    native = false;
    stationary = undefined;
    rows.rowWindow = rows.pausedBrowseIndex = -1;
    track.invalidate();
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
    framePending = true;
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
    framePending = true;
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
  const navigation = createPlaybackNavigation(h, {
    stage,
    offsets,
    widths,
    rows,
    position,
    renderRows,
    disposers,
    listen,
    input,
    run,
    available,
    canRepeat,
    selectionIndex,
    selectMeasure,
    play,
    pause,
    seek,
    beginScrub,
    previewScrub,
    finishScrub,
    toggle,
    mark,
    frame,
    get loopSlots() {
      return loopSlots;
    },
    get scrub() {
      return scrub;
    },
    get panStart() {
      return panStart;
    },
    get native() {
      return native;
    },
    get stationary() {
      return stationary;
    },
    set stationary(value) {
      stationary = value;
    },
  });
  const { gestures } = navigation;
  disposers.push(gestures.dispose);
  const loopSlots: ReturnType<typeof mountLoopSlots> = mountLoopSlots(
    root,
    stage,
    {
      song: h.song,
      player: () => ({ loop: h.player().loop, current: selectionTime }),
      changed: () => {
        framePending = true;
        h.changed();
      },
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

  navigation.bind();
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
  const tempo = createPlaybackTempo(h, {
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
  const { rate, syncHeaderBpm, refreshSources } = tempo;
  function frame() {
    if (!h.ready() || !h.song().measures.length) return;
    const p = h.player(),
      s = h.song(),
      time = p.current();
    framePending = false;
    framedSong = s;
    framedTime = time;
    framedSelection = selectedIndex;
    framedFocus = document.activeElement;
    framedCopyActive = performance.now() < copiedUntil;
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
  // Keep one public screen API while the display module owns DOM synchronization.
  const display = createPlaybackDisplay(h, {
    get,
    input,
    tempo,
    scoreOnlyView,
    settingsLayout,
    requestFrame: () => {
      framePending = true;
    },
    syncRepeatAvailability,
    isDisposed: () => disposed,
  });
  function sync() {
    display.sync();
  }
  function syncDisplay() {
    display.syncDisplay();
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
    if (!h.ready()) return;
    const p = h.player();
    const copyActive = performance.now() < copiedUntil;
    // Native vertical browsing needs no score/overlay updates while paused.
    // Explicit frame calls remain immediate; state/layout/list changes request
    // one update, and playback, scrubbing and range previews keep animating.
    if (
      p.playing ||
      h.song().settings.view !== "rows" ||
      framePending ||
      h.song() !== framedSong ||
      p.current() !== framedTime ||
      selectedIndex !== framedSelection ||
      document.activeElement !== framedFocus ||
      !!scrub ||
      loopSlots.awaitingEndpoint ||
      copyActive !== framedCopyActive
    )
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
    framePending = true;
    loopSlots?.cancel();
    gestures.cancel();
    clearPreset();
    repeatPresets.clear();
    selectedIndex = undefined;
    lastLoop = undefined;
    stationary = undefined;
    native = false;
    track.invalidate();
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
