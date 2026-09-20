// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attachScoreGestures, type ScoreGestureController } from "../src/score-gestures";

describe("score playback gestures", () => {
  let surface: HTMLDivElement;
  let playing: boolean;
  let controller: ScoreGestureController;
  let callbacks: ReturnType<typeof makeCallbacks>;

  function makeCallbacks() {
    return {
      isPlaying: () => playing,
      getTarget: vi.fn((event: PointerEvent) => Math.floor(event.clientX / 100)),
      prepareAudio: vi.fn(),
      pause: vi.fn(() => { playing = false; }),
      play: vi.fn(() => { playing = true; }),
      seek: vi.fn((_target: number, resume: boolean) => { playing = resume; }),
      scrubStart: vi.fn(() => { playing = false; }),
      scrubMove: vi.fn(),
      scrubEnd: vi.fn((resume: boolean) => { playing = resume; }),
      scrubCancel: vi.fn(() => { playing = false; }),
    };
  }

  function pointer(type: string, x = 120, y = 50, id = 1, target: EventTarget = surface, pointerType = "touch") {
    // jsdom has no PointerEvent constructor; preserve the event's bubbling/cancelability.
    const event = new MouseEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true, cancelable: true });
    Object.defineProperties(event, {
      pointerId: { value: id },
      pointerType: { value: pointerType },
      isPrimary: { value: id === 1 },
    });
    target.dispatchEvent(event);
    return event;
  }

  function tap(x = 120, y = 50) {
    pointer("pointerdown", x, y);
    pointer("pointerup", x, y);
  }

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "<div id='score'></div><button id='outside'>Other control</button>";
    surface = document.getElementById("score") as HTMLDivElement;
    playing = false;
    callbacks = makeCallbacks();
    controller = attachScoreGestures(surface, callbacks);
  });

  afterEach(() => {
    controller.dispose();
    vi.useRealTimers();
  });

  it("pauses a playing score immediately at tap release and never restarts it later", () => {
    playing = true;
    pointer("pointerdown");
    expect(callbacks.prepareAudio).toHaveBeenCalledOnce();
    expect(callbacks.pause).not.toHaveBeenCalled();
    pointer("pointerup");
    expect(callbacks.pause).toHaveBeenCalledOnce();
    expect(playing).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(callbacks.play).not.toHaveBeenCalled();
  });

  it("selects a paused tap measure without ever starting playback", () => {
    tap();
    vi.advanceTimersByTime(259);
    expect(callbacks.play).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(callbacks.seek).toHaveBeenCalledWith(1, false);
    expect(playing).toBe(false);
  });

  it("double tap seeks the first-down measure and resumes the initial playing state", () => {
    playing = true;
    tap(195);
    expect(callbacks.pause).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(100);
    tap(205);
    expect(callbacks.seek).toHaveBeenCalledWith(1, true);
    expect(playing).toBe(true);
    vi.runAllTimers();
    expect(callbacks.play).not.toHaveBeenCalled();
    expect(callbacks.pause).toHaveBeenCalledOnce();
  });

  it("double tap while paused starts the touched measure without a delayed selection", () => {
    tap();
    vi.advanceTimersByTime(100);
    tap();
    vi.runAllTimers();
    expect(callbacks.seek).toHaveBeenCalledExactlyOnceWith(1, true);
    expect(playing).toBe(true);
    expect(callbacks.play).not.toHaveBeenCalled();
    expect(callbacks.pause).not.toHaveBeenCalled();
  });

  it("requires a nearby second tap, instead of seeking a distant measure", () => {
    tap(120);
    vi.advanceTimersByTime(100);
    tap(340);
    vi.runAllTimers();
    expect(callbacks.seek).toHaveBeenCalledExactlyOnceWith(3, false);
    expect(playing).toBe(false);
  });

  it("starts scrub only after horizontal intent and passes cumulative signed distance", () => {
    playing = true;
    pointer("pointerdown");
    pointer("pointermove", 126, 51);
    expect(callbacks.scrubStart).not.toHaveBeenCalled();
    expect(pointer("pointermove", 140, 51).defaultPrevented).toBe(true);
    pointer("pointermove", 90, 52);
    pointer("pointerup", 80, 52);
    expect(callbacks.scrubStart).toHaveBeenCalledWith(true);
    expect(callbacks.scrubMove.mock.calls).toEqual([[20], [-30], [-40]]);
    expect(callbacks.scrubEnd).toHaveBeenCalledWith(true);
    expect(playing).toBe(true);
    vi.runAllTimers();
    expect(callbacks.play).not.toHaveBeenCalled();
    expect(callbacks.seek).not.toHaveBeenCalled();
  });

  it("keeps a paused scrub paused at release", () => {
    pointer("pointerdown");
    pointer("pointermove", 80, 50);
    pointer("pointerup", 80, 50);
    expect(callbacks.scrubEnd).toHaveBeenCalledWith(false);
    expect(playing).toBe(false);
  });

  it("allows vertical scrolling without pause, scrub, or tap even after changing direction", () => {
    playing = true;
    pointer("pointerdown");
    expect(pointer("pointermove", 123, 65).defaultPrevented).toBe(false);
    expect(pointer("pointermove", 160, 67).defaultPrevented).toBe(false);
    pointer("pointerup", 160, 67);
    vi.runAllTimers();
    expect(callbacks.pause).not.toHaveBeenCalled();
    expect(callbacks.scrubStart).not.toHaveBeenCalled();
    expect(callbacks.play).not.toHaveBeenCalled();
  });

  it("leaves mouse wheel/trackpad scroll to the parent", () => {
    const wheel = new WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true });
    surface.dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(false);
    expect(callbacks.scrubStart).not.toHaveBeenCalled();
  });

  it("cancels a dragged pointer by restoring via callback without resuming", () => {
    playing = true;
    pointer("pointerdown");
    pointer("pointermove", 140, 51);
    pointer("pointercancel", 140, 51);
    pointer("pointerup", 140, 51);
    vi.runAllTimers();
    expect(callbacks.scrubCancel).toHaveBeenCalledOnce();
    expect(callbacks.scrubEnd).not.toHaveBeenCalled();
    expect(callbacks.play).not.toHaveBeenCalled();
    expect(playing).toBe(false);
  });

  it("does not turn a canceled touch into a tap", () => {
    pointer("pointerdown");
    pointer("pointercancel");
    pointer("pointerup");
    vi.runAllTimers();
    expect(callbacks.play).not.toHaveBeenCalled();
  });

  it("suppresses all multi-touch contacts until both fingers leave", () => {
    pointer("pointerdown");
    pointer("pointerdown", 150, 50, 2);
    pointer("pointerup");
    pointer("pointerup", 150, 50, 2);
    vi.runAllTimers();
    expect(callbacks.play).not.toHaveBeenCalled();
    tap();
    vi.runAllTimers();
    expect(callbacks.seek).toHaveBeenCalledExactlyOnceWith(1, false);
    expect(playing).toBe(false);
  });

  it("cancels a scrub when another finger lands outside the score", () => {
    pointer("pointerdown");
    pointer("pointermove", 140, 50);
    pointer("pointerdown", 150, 50, 2, document.getElementById("outside")!);
    pointer("pointerup");
    pointer("pointerup", 150, 50, 2, document.getElementById("outside")!);
    expect(callbacks.scrubCancel).toHaveBeenCalledOnce();
    expect(callbacks.scrubEnd).not.toHaveBeenCalled();
  });

  it("invalidates pending play when changing songs/views and removes listeners on disposal", () => {
    tap();
    controller.cancel();
    vi.runAllTimers();
    expect(callbacks.play).not.toHaveBeenCalled();
    controller.dispose();
    tap();
    vi.runAllTimers();
    expect(callbacks.play).not.toHaveBeenCalled();
  });

  it("handles a mouse release outside the score and ignores the secondary button", () => {
    pointer("pointerdown", 120, 50, 1, surface, "mouse");
    pointer("pointermove", 180, 50, 1, document.body, "mouse");
    pointer("pointerup", 180, 50, 1, document.body, "mouse");
    expect(callbacks.scrubEnd).toHaveBeenCalledOnce();
    const right = new MouseEvent("pointerdown", { button: 2, bubbles: true });
    Object.defineProperties(right, { pointerType: { value: "mouse" }, pointerId: { value: 1 } });
    surface.dispatchEvent(right);
    vi.runAllTimers();
    expect(callbacks.play).not.toHaveBeenCalled();
  });
});
