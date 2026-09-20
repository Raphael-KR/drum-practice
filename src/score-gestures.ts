/** Playback gestures for a score surface. Keep `touch-action: pan-y` on it so
 * vertical touch/trackpad scrolling remains native; wheel events are not consumed.
 * All callbacks run synchronously. Callers own async playback errors and audio.
 */
export interface ScoreGestureCallbacks<T> {
  isPlaying(): boolean;
  /** Resolve the measure at pointer-down, before playback can move the score. */
  getTarget(event: PointerEvent): T | null;
  /** Resume/unlock AudioContext while pointer-down still has user activation. */
  prepareAudio?(): void;
  pause(): void;
  play(): void;
  seek(target: T, resumePlaying: boolean): void;
  scrubStart(wasPlaying: boolean): void;
  /** Cumulative horizontal distance from pointer-down. Right is positive/earlier. */
  scrubMove(deltaX: number): void;
  scrubEnd(resumePlaying: boolean): void;
  /** Caller restores the pre-drag position and leaves playback paused. */
  scrubCancel(): void;
}

export interface ScoreGestureController {
  /** Invalidate a pending tap when changing songs, views, or playback controls. */
  cancel(): void;
  dispose(): void;
}

const TAP_DELAY = 260;
const DRAG_THRESHOLD = 8;
const DOUBLE_TAP_DISTANCE = 28;

export function attachScoreGestures<T>(
  surface: HTMLElement,
  callbacks: ScoreGestureCallbacks<T>,
): ScoreGestureController {
  type Tap = {
    x: number;
    y: number;
    pointerType: string;
    target: T;
    wasPlaying: boolean;
    released: number;
    timer: ReturnType<typeof setTimeout>;
  };
  type Gesture = {
    id: number;
    x: number;
    y: number;
    pointerType: string;
    target: T;
    wasPlaying: boolean;
    secondTap: boolean;
    mode: "tap" | "scroll" | "scrub";
  };

  const owner = surface.ownerDocument;
  const pointers = new Set<number>();
  let active: Gesture | undefined;
  let pending: Tap | undefined;
  let blocked = false;
  let disposed = false;

  function clearTap() {
    if (pending) clearTimeout(pending.timer);
    pending = undefined;
  }

  function releaseCapture(id: number) {
    if (surface.hasPointerCapture?.(id)) surface.releasePointerCapture(id);
  }

  function cancelGesture() {
    const previous = active;
    active = undefined;
    clearTap();
    if (previous) {
      releaseCapture(previous.id);
      if (previous.mode === "scrub") callbacks.scrubCancel();
    }
  }

  function cancel() {
    cancelGesture();
    pointers.clear();
    blocked = false;
  }

  function down(event: PointerEvent) {
    if (disposed || (event.pointerType === "mouse" && event.button !== 0)) return;
    pointers.add(event.pointerId);
    if (blocked || pointers.size > 1 || event.isPrimary === false) {
      blocked = true;
      cancelGesture();
      return;
    }
    const target = callbacks.getTarget(event);
    if (target === null) {
      clearTap();
      return;
    }
    callbacks.prepareAudio?.();
    const previous = pending;
    const secondTap = Boolean(previous &&
      Date.now() - previous.released <= TAP_DELAY &&
      previous.pointerType === event.pointerType &&
      Math.hypot(event.clientX - previous.x, event.clientY - previous.y) <= DOUBLE_TAP_DISTANCE);
    clearTap();
    active = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      pointerType: event.pointerType,
      target: secondTap ? previous!.target : target,
      wasPlaying: secondTap ? previous!.wasPlaying : callbacks.isPlaying(),
      secondTap,
      mode: "tap",
    };
  }

  // A second finger outside the score must also cancel a gesture on the score.
  function outsideDown(event: PointerEvent) {
    if (!active || surface.contains(event.target as Node) || event.pointerId === active.id) return;
    pointers.add(event.pointerId);
    blocked = true;
    cancelGesture();
  }

  function move(event: PointerEvent) {
    if (!active || event.pointerId !== active.id || blocked) return;
    const dx = event.clientX - active.x;
    const dy = event.clientY - active.y;
    if (active.mode === "tap") {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < DRAG_THRESHOLD) return;
      active.mode = Math.abs(dx) > Math.abs(dy) ? "scrub" : "scroll";
      if (active.mode === "scrub") {
        surface.setPointerCapture?.(event.pointerId);
        callbacks.scrubStart(active.wasPlaying);
      }
    }
    if (active.mode === "scrub") {
      event.preventDefault();
      callbacks.scrubMove(dx);
    }
  }

  function up(event: PointerEvent) {
    pointers.delete(event.pointerId);
    if (blocked) {
      if (!pointers.size) blocked = false;
      return;
    }
    if (!active || event.pointerId !== active.id) return;
    const finished = active;
    active = undefined;
    releaseCapture(event.pointerId);
    if (finished.mode === "scrub") {
      event.preventDefault();
      callbacks.scrubMove(event.clientX - finished.x);
      callbacks.scrubEnd(finished.wasPlaying);
      return;
    }
    if (finished.mode === "scroll") return;
    // Browsers can coalesce pointermove events. A moved pointer is never a tap.
    if (Math.hypot(event.clientX - finished.x, event.clientY - finished.y) >= DRAG_THRESHOLD) return;
    if (finished.secondTap) {
      callbacks.seek(finished.target, finished.wasPlaying);
      return;
    }
    if (finished.wasPlaying) callbacks.pause();
    const timer = setTimeout(() => {
      if (pending?.timer !== timer) return;
      const wasPlaying = pending.wasPlaying;
      pending = undefined;
      if (!wasPlaying) callbacks.play();
    }, TAP_DELAY);
    pending = {
      x: finished.x,
      y: finished.y,
      pointerType: finished.pointerType,
      target: finished.target,
      wasPlaying: finished.wasPlaying,
      released: Date.now(),
      timer,
    };
  }

  function pointerCancel(event: PointerEvent) {
    pointers.delete(event.pointerId);
    if (active?.id === event.pointerId) cancelGesture();
    if (!pointers.size) blocked = false;
  }

  function lostCapture(event: PointerEvent) {
    if (active?.id === event.pointerId) cancelGesture();
  }

  surface.addEventListener("pointerdown", down);
  owner.addEventListener("pointerdown", outsideDown);
  owner.addEventListener("pointermove", move, { passive: false });
  owner.addEventListener("pointerup", up);
  owner.addEventListener("pointercancel", pointerCancel);
  surface.addEventListener("lostpointercapture", lostCapture);

  return {
    cancel,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancel();
      surface.removeEventListener("pointerdown", down);
      owner.removeEventListener("pointerdown", outsideDown);
      owner.removeEventListener("pointermove", move);
      owner.removeEventListener("pointerup", up);
      owner.removeEventListener("pointercancel", pointerCancel);
      surface.removeEventListener("lostpointercapture", lostCapture);
    },
  };
}
