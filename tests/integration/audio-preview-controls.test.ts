// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bindAudioPreviewControls } from "../../src/modules/audio/audio-preview-controls";
beforeEach(() => {
  document.body.innerHTML = "<audio controls></audio>";
});
afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
function setup() {
  const audio = document.querySelector("audio")!,
    error = vi.fn();
  audio.volume = 0.3;
  audio.muted = true;
  const binding = bindAudioPreviewControls(audio, 267, error);
  return {
    audio,
    error,
    binding,
    controls: document.querySelector(".audio-preview-controls")!,
  };
}
it("replaces native controls and offers exactly four correction speeds", () => {
  const { audio, controls, binding } = setup();
  expect(audio.controls).toBe(false);
  expect(audio.hidden).toBe(true);
  expect(audio.volume).toBe(1);
  expect(audio.muted).toBe(false);
  expect(
    controls.querySelector("[data-volume], .audio-preview-volume"),
  ).toBeNull();
  const speed = controls.querySelector<HTMLSelectElement>("[data-speed]")!;
  expect([...speed.options].map((o) => o.value)).toEqual([
    "0.1",
    "0.25",
    "0.5",
    "1",
  ]);
  expect(speed.value).toBe("1");
  for (const rate of ["0.1", "0.25", "0.5", "1"]) {
    speed.value = rate;
    speed.dispatchEvent(new Event("change"));
    expect(audio.playbackRate).toBe(Number(rate));
  }
  expect(controls.textContent).not.toContain("미디어 통계");
  expect(
    controls.querySelector("[data-skip], [aria-label=AirPlay]"),
  ).toBeNull();
  expect(
    controls.querySelector(".audio-preview-speed [data-speed]"),
  ).not.toBeNull();
  binding.dispose();
});
it("seeks, displays time and handles playback", async () => {
  const { audio, controls, binding } = setup();
  const paused = vi.spyOn(audio, "paused", "get").mockReturnValue(true);
  const play = vi.spyOn(audio, "play").mockResolvedValue();
  const pause = vi.spyOn(audio, "pause").mockImplementation(() => {});
  const button = controls.querySelector<HTMLButtonElement>(
    ":scope > .icon-button",
  )!;
  button.click();
  expect(play).toHaveBeenCalledTimes(1);
  paused.mockReturnValue(false);
  audio.dispatchEvent(new Event("play"));
  expect(button.getAttribute("aria-label")).toBe("일시정지");
  button.click();
  expect(pause).toHaveBeenCalledTimes(1);
  const seek = controls.querySelector<HTMLInputElement>("[data-seek]")!;
  seek.value = "12.98";
  seek.dispatchEvent(new Event("input"));
  expect(audio.currentTime).toBe(12.98);
  expect(controls.querySelector("[data-current]")!.textContent).toBe("00:12");
  binding.dispose();
  button.click();
  expect(pause).toHaveBeenCalledTimes(1);
});
it("reports unsupported playback rate without leaving a false selected speed", () => {
  const { audio, controls, error, binding } = setup();
  vi.spyOn(audio, "playbackRate", "set").mockImplementation(() => {
    throw new Error("unsupported rate");
  });
  const speed = controls.querySelector<HTMLSelectElement>("[data-speed]")!;
  speed.value = "0.1";
  speed.dispatchEvent(new Event("change"));
  expect(error).toHaveBeenCalledTimes(1);
  expect(speed.value).toBe("1");
  binding.dispose();
});
