import { attachScoreGestures } from "./score-gestures";
import { type Loop, type Song, locate } from "./model";
import { scrubTime } from "./practice-controls";
interface PlayerPort {
  playing: boolean;
  duration: number;
  position: number;
  loop?: Loop;
  current(): number;
  pause(): void;
  seek(t: number): void;
  play(countIn?: boolean, prepare?: boolean): Promise<unknown>;
}
export interface ScrubSnapshot<T> {
  start: number;
  resume: boolean;
  loop?: Loop;
  extra: T;
}
export function beginPlaybackScrub<T>(
  p: PlayerPort,
  extra: T,
): ScrubSnapshot<T> {
  const state = { start: p.current(), resume: p.playing, loop: p.loop, extra };
  p.pause();
  return state;
}
export function finishPlaybackScrub<T>(
  p: PlayerPort,
  state: ScrubSnapshot<T> | undefined,
  cancel: boolean,
  restore: (extra: T) => void,
  fail: (e: unknown) => void,
) {
  if (!state) return;
  if (cancel) {
    p.pause();
    p.loop = state.loop;
    p.seek(state.start);
    restore(state.extra);
  } else if (state.resume && p.current() < p.duration)
    void p.play(false, false).catch(fail);
}
export function movePlaybackScrub(
  h: {
    song: Song;
    stage: HTMLElement;
    state?: { start: number; resume: boolean };
    panStart: number;
    widths: number[];
    duration: number;
    seek: (t: number) => void;
  },
  delta: number,
) {
  if (!h.state) return;
  if (!h.state.resume && h.song.settings.view === "ribbon") {
    h.stage.scrollLeft = h.panStart - delta;
    return;
  }
  const width =
    h.song.settings.view === "ribbon"
      ? h.widths[locate(h.song, h.state.start).index]
      : h.stage.clientWidth / 4;
  h.seek(scrubTime(h.song, h.state.start, delta, width, h.duration));
}
export function validLoop(start: number, end: number, duration: number) {
  return (
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    start >= 0 &&
    end - start >= 0.15 &&
    end <= duration + 0.01
  );
}
export function changePlaybackLoop(
  p: PlayerPort,
  loop: Loop | undefined,
  preservePosition: boolean,
  update: () => void,
  fail: (e: unknown) => void,
) {
  const resume = p.playing;
  p.pause();
  p.loop = loop;
  if (
    loop &&
    (!preservePosition || p.position < loop.start || p.position >= loop.end)
  )
    p.position = loop.start;
  update();
  if (resume) void p.play(false, false).catch(fail);
}
export function installPlaybackKeys(
  h: {
    ready: () => boolean;
    cancel: () => void;
    toggle: () => void;
    mark: () => void;
    step: (delta: number) => void;
  },
  target: Document = document,
) {
  const listener = (e: KeyboardEvent) => {
    if (
      !h.ready() ||
      target.querySelector("dialog[open]") ||
      (e.target as Element)?.closest?.(
        "input,select,textarea,[contenteditable=true]",
      )
    )
      return;
    if (e.code === "Space") {
      e.preventDefault();
      if (e.repeat) return;
      h.cancel();
      h.toggle();
    } else if (e.key.toLowerCase() === "m") {
      if (e.repeat) return;
      h.cancel();
      h.mark();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      h.cancel();
      h.step(e.key === "ArrowLeft" ? -1 : 1);
    }
  };
  target.addEventListener("keydown", listener);
  return () => target.removeEventListener("keydown", listener);
}
export function installPlaybackWheel(
  stage: HTMLElement,
  h: {
    ready: () => boolean;
    playing: () => boolean;
    view: () => string;
    cancel: () => void;
    browse: () => void;
    scrub: (delta: number) => void;
  },
) {
  const listener = (e: WheelEvent) => {
    if (!h.ready() || document.querySelector("dialog[open]") || e.ctrlKey)
      return;
    if (
      !h.playing() &&
      h.view() === "rows" &&
      Math.abs(e.deltaY) >= Math.abs(e.deltaX)
    ) {
      h.cancel();
      h.browse();
      return;
    }
    if (h.playing()) {
      e.preventDefault();
      return;
    }
    const scale =
      e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? stage.clientHeight : 1;
    if (h.view() === "ribbon") {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        stage.scrollLeft += e.deltaY * scale;
      }
      return;
    }
    e.preventDefault();
    h.cancel();
    if (h.view() !== "rows")
      h.scrub(
        (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) *
          scale,
      );
  };
  stage.addEventListener("wheel", listener, { passive: false });
  return () => stage.removeEventListener("wheel", listener);
}

/** Host supplies audio preparation and optional compare-view target resolution. */
export function attachPlaybackGestures(
  stage: HTMLElement,
  h: {
    ready: () => boolean;
    song: () => Song;
    player: () => PlayerPort;
    prepare: () => void;
    resume: () => Promise<unknown>;
    pause: () => void;
    seek: (t: number) => void;
    selected: (index: number, time: number) => void;
    fail: (e: unknown) => void;
    target?: (e: PointerEvent) => number;
    start: () => void;
    move: (delta: number) => void;
    finish: (cancel: boolean) => void;
  },
) {
  return attachScoreGestures<number>(stage, {
    isPlaying: () => h.ready() && h.player().playing,
    horizontalEnabled: () => h.ready() && h.song().settings.view !== "rows",
    nativeHorizontal: () =>
      h.ready() && !h.player().playing && h.song().settings.view === "ribbon",
    getTarget: (e) => {
      if (!h.ready() || document.querySelector("dialog[open]")) return null;
      const measure = (e.target as Element).closest<HTMLElement>(
        "[data-index]",
      );
      return measure
        ? Number(measure.dataset.index)
        : (h.target?.(e) ?? locate(h.song(), h.player().current()).index);
    },
    prepareAudio: h.prepare,
    pause: h.pause,
    seek: (index, resume) => {
      if (!h.ready()) return;
      const p = h.player();
      p.pause();
      h.seek(h.song().measures[index].start);
      if (resume) void h.resume().catch(h.fail);
      else h.selected(index, p.current());
    },
    scrubStart: h.start,
    scrubMove: h.move,
    scrubEnd: () => h.finish(false),
    scrubCancel: () => h.finish(true),
  });
}
export function seekPlaybackFreely(
  p: PlayerPort,
  t: number,
  onExit: (loop: Loop) => void,
) {
  if (p.loop && (t < p.loop.start || t >= p.loop.end)) {
    const previous = p.loop;
    p.loop = undefined;
    onExit(previous);
  }
  p.seek(t);
}
