export type LoadStage = "opening" | "read" | "conversion" | "rendering" | "screen" | "audio";
export interface LoadTiming {
  build: string;
  outcome: "success" | "error";
  totalMs: number;
  stagesMs: Record<LoadStage, number>;
}
/** Wall-clock stage durations, not estimates of completed work. */
export function beginLoadTiming(build: string, now = () => performance.now()) {
  const started = now();
  let since = started;
  let stage: LoadStage = "opening";
  const stagesMs: Record<LoadStage, number> = { opening: 0, read: 0, conversion: 0, rendering: 0, screen: 0, audio: 0 };
  function checkpoint() {
    const time = now();
    stagesMs[stage] += time - since;
    since = time;
    return time;
  }
  return {
    stage(next: LoadStage) { checkpoint(); stage = next; },
    finish(outcome: LoadTiming["outcome"]): LoadTiming {
      const end = checkpoint();
      return { build, outcome, totalMs: end - started, stagesMs: { ...stagesMs } };
    },
  };
}
export function recordLoadTiming(result: LoadTiming) {
  const target = window as Window & { drumLoadTimings?: LoadTiming[] };
  target.drumLoadTimings = [...(target.drumLoadTimings ?? []).slice(-9), result];
  console.info("[drum-load]", result);
}
