import { clamp, locate } from "../../model/model";
import { bindNumericDrag } from "../../shared/ui/numeric-drag";
import { componentName } from "../../shared/ui/ui-standard";
import type { mountLoopSlots } from "./loop-slots";
import {
  attachPlaybackGestures,
  installPlaybackKeys,
  installPlaybackWheel,
  movePlaybackScrub,
  type ScrubSnapshot,
} from "./playback-actions";
import { installScoreScroll } from "./playback-frame";
import type { PlaybackScreenHost } from "./playback-screen";
import type { createPlaybackTrack } from "./playback-track";
import { scrubTime } from "./practice-controls";

type Track = ReturnType<typeof createPlaybackTrack>;
interface NavigationControls {
  stage: HTMLElement;
  offsets: number[];
  widths: number[];
  rows: Track["rows"];
  position: Track["position"];
  renderRows: Track["renderRows"];
  disposers: (() => void)[];
  listen(target: EventTarget, type: string, fn: EventListener): void;
  input(id: string): HTMLInputElement;
  run(fn: () => unknown): void;
  available(): boolean;
  canRepeat(): boolean;
  selectionIndex(): number;
  selectMeasure(index: number): void;
  play(fromMeasureStart?: boolean): Promise<void>;
  pause(): void;
  seek(time: number, countOff?: boolean): void;
  beginScrub(): void;
  previewScrub(time: number): void;
  finishScrub(cancel?: boolean): void;
  toggle(): Promise<void>;
  mark(): void;
  frame(): void;
  readonly loopSlots: ReturnType<typeof mountLoopSlots>;
  readonly scrub:
    ScrubSnapshot<{ center?: number; radius?: number }> | undefined;
  readonly panStart: number;
  readonly native: boolean;
  stationary: number | undefined;
}

/** Bind inputs to the screen's live state and disposer list; never copy navigation state. */
export function createPlaybackNavigation(
  h: PlaybackScreenHost,
  controls: NavigationControls,
) {
  const { ids } = h;
  const {
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
  } = controls;
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
      controls.loopSlots?.endpoint(index);
      frame();
    },
    pausedTap: (index) => {
      if (
        !available() ||
        h.player().playing ||
        index !== selectionIndex() ||
        controls.loopSlots?.awaitingEndpoint
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
      controls.stationary = time;
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
          state: controls.scrub,
          panStart: controls.panStart,
          widths,
          duration: h.player().duration,
          seek: previewScrub,
        },
        delta,
      ),
    finish: finishScrub,
  });

  // The screen mounts loop slots between gestures and the remaining input bindings.
  function bind() {
    const wheel = installPlaybackWheel(stage, {
      ready: available,
      playing: () => h.player().playing,
      view: () => h.song().settings.view,
      cancel: gestures.cancel,
      browse: () => renderRows(selectionIndex()),
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
    });
    disposers.push(wheel.dispose);
    // Blocking wheel registration interrupts row-snap momentum in Dock WebKit.
    const syncWheel = () =>
      wheel.setPassive(
        h.ready() && !h.player().playing && h.song().settings.view === "rows",
      );
    syncWheel();
    disposers.push(
      installScoreScroll(stage, {
        enabled: () =>
          available() &&
          !h.player().playing &&
          !controls.loopSlots?.selecting &&
          controls.native &&
          h.song().settings.view === "ribbon",
        song: h.song,
        offsets,
        widths,
        position,
        seek,
        selected: () => {
          controls.stationary = h.player().current();
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
          if (controls.scrub) finishScrub();
          else if (h.ready())
            seek(
              h.song().measures[
                v - (h.song().measures[0]?.audioPrelude ? 0 : 1)
              ]?.start ?? 0,
            );
        },
        onCancel: () => finishScrub(true),
      }),
    );
    disposers.push(bindNumericDrag(input(ids.rewind)));
    disposers.push(bindNumericDrag(input(ids.tempoInput)));
    disposers.push(
      installPlaybackKeys({
        ready: () => available() && !controls.loopSlots?.selecting,
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
        if (controls.scrub) finishScrub(true);
        h.player().pause();
      }
    });
    return syncWheel;
  }
  return { gestures, bind };
}
