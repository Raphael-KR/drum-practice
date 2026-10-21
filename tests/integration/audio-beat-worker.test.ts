import { afterEach, expect, it, vi } from "vitest";
import { analyzeAudioBeats } from "../../src/modules/audio/audio-beat-analysis";
const buffer = {
  duration: 5,
  sampleRate: 16000,
  numberOfChannels: 1,
  getChannelData: () => new Float32Array(80000),
} as unknown as AudioBuffer;
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it.each(["success", "error", "timeout", "abort"])(
  "settles and terminates the analysis worker on %s",
  async (mode) => {
    const workers: {
      onmessage: (event: { data: { beatTimes: number[] } }) => void;
      onerror: (event: { message: string }) => void;
      terminate: ReturnType<typeof vi.fn>;
      postMessage: ReturnType<typeof vi.fn>;
    }[] = [];
    const worker = () => workers.at(-1)!;
    vi.stubGlobal(
      "Worker",
      class {
        onmessage!: (event: { data: { beatTimes: number[] } }) => void;
        onerror!: (event: { message: string }) => void;
        terminate = vi.fn();
        postMessage = vi.fn();
        constructor() {
          workers.push(this);
        }
      },
    );
    vi.useFakeTimers();
    const controller = new AbortController();
    const pending = analyzeAudioBeats(buffer, 120, controller.signal);
    const result = pending.then(
      (value) => ({ value }),
      (error) => ({ error }),
    );
    expect(worker().postMessage).toHaveBeenCalledOnce();
    if (mode === "success")
      worker().onmessage({
        data: { beatTimes: [0.2, 0.7, 1.2, 1.7, 2.2, 2.7, 3.2, 3.7] },
      });
    if (mode === "error") worker().onerror({ message: "WASM unavailable" });
    if (mode === "timeout") await vi.advanceTimersByTimeAsync(120000);
    if (mode === "abort") controller.abort();
    if (mode === "success")
      expect(await result).toEqual({
        value: [0.2, 0.7, 1.2, 1.7, 2.2, 2.7, 3.2, 3.7],
      });
    else expect(await result).toHaveProperty("error");
    expect(worker().terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  },
);
