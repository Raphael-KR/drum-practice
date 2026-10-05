import { expect, it } from "vitest";
import { beginLoadTiming } from "../src/load-timing";
it("measures actual stages and accumulates screen work around audio decoding", () => {
  let time = 0;
  const timing = beginLoadTiming("test", () => time);
  time = 10; timing.stage("read");
  time = 110; timing.stage("conversion");
  time = 130; timing.stage("rendering");
  time = 140; timing.stage("screen");
  time = 160; timing.stage("audio");
  time = 210; timing.stage("screen");
  time = 220;
  expect(timing.finish("success")).toEqual({ build: "test", outcome: "success", totalMs: 220,
    stagesMs: { opening: 10, read: 100, conversion: 20, rendering: 10, screen: 30, audio: 50 } });
});
it("retains partial elapsed time on failure", () => {
  let time = 0;
  const timing = beginLoadTiming("test", () => time);
  timing.stage("read"); time = 42;
  expect(timing.finish("error")).toMatchObject({ outcome: "error", totalMs: 42, stagesMs: { read: 42 } });
});
