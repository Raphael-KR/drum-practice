// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { Blob as NodeBlob } from "node:buffer";
import { preparePlaybackAssets } from "../../src/modules/playback/playback-assets";
import type { Song } from "../../src/model/model";
const state = vi.hoisted(() => ({
  host: undefined as unknown as import("../../src/modules/playback/playback-screen").PlaybackScreenHost,
  dispose: vi.fn(),
  close: vi.fn(async () => {}),
  load: vi.fn(async () => {}),
}));
vi.mock("../../src/modules/audio/audio-core", () => ({
  Player: class {
    duration = 100;
    onprogress = () => {};
    onstate = () => {};
    ctx = { close: state.close };
    worker = { terminate: vi.fn() };
    load = state.load;
    pause = vi.fn();
  },
}));
vi.mock("../../src/modules/playback/playback-screen", () => ({
  createPlaybackScreen: (
    host: import("../../src/modules/playback/playback-screen").PlaybackScreenHost,
  ) => {
    state.host = host;
    return {
      dispose: state.dispose,
      cancel: vi.fn(),
      onState: vi.fn(),
      seek: vi.fn(),
      mark: vi.fn(),
      sync: vi.fn(),
      syncDisplay: vi.fn(),
      renderTrack: vi.fn(),
    };
  },
}));
vi.mock("../../src/modules/playback/playback-assets", () => ({
  preparePlaybackAssets: vi.fn(async () => ({
    urls: ["blob:test"],
    pageRatios: [1],
    highlightPages: [],
    practiceStaffs: new Map(),
  })),
  replacePlaybackAssets: (
    current: import("../../src/modules/playback/playback-assets").PlaybackAssets,
    next: import("../../src/modules/playback/playback-assets").PlaybackAssets,
  ) => Object.assign(current, next),
  releasePlaybackAssets: vi.fn(),
}));
import { mountPlaybackRuntime } from "../../src/modules/playback/playback-runtime";
function options() {
  const root = document.createElement("div");
  document.body.append(root);
  return {
    root,
    song: {
      scoreFormat: "pdf",
      measures: [{ start: 0 }],
      settings: { position: 0 },
      loops: [],
      markers: [],
    } as unknown as Song,
    audio: new Blob(),
    pages: [new Blob()],
  };
}
afterEach(() => {
  document.body.replaceChildren();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
it("mounts either adapter, persists position/preferences and disposes once before remount", async () => {
  vi.stubGlobal("URL", { revokeObjectURL: vi.fn() });
  const changed = vi.fn(),
    onLibrary = vi.fn(),
    o = options();
  const runtime = await mountPlaybackRuntime({ ...o, changed, onLibrary });
  expect(
    o.root.querySelector("#runtime-library")?.getAttribute("aria-label"),
  ).toBe("악보 선택");
  const ids = [...o.root.querySelectorAll("[id]")].map((element) => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(o.root.querySelector("#section-shortcuts")).not.toBeNull();
  expect(o.root.querySelector("#quick-markers")).not.toBeNull();
  state.host.afterFrame!(12);
  state.host.preferences.write({ restartMeasure: false, countOff: false });
  await runtime.flush();
  expect(changed).toHaveBeenLastCalledWith(
    o.song,
    expect.objectContaining({ restartMeasure: false, countOff: false }),
  );
  expect(o.song.settings.position).toBe(12);
  runtime.dispose();
  runtime.dispose();
  expect(state.dispose).toHaveBeenCalledTimes(1);
  expect(state.close).toHaveBeenCalledTimes(1);
  expect(o.root.innerHTML).toBe("<header></header>");
  expect(document.body.dataset.ready).toBeUndefined();
  const second = await mountPlaybackRuntime(o);
  expect(o.root.querySelectorAll("#play")).toHaveLength(1);
  second.dispose();
});
it("cleans up failed audio initialization and propagates failure to library host", async () => {
  vi.stubGlobal("URL", { revokeObjectURL: vi.fn() });
  state.load.mockRejectedValueOnce(Error("decode failed"));
  const o = options();
  await expect(mountPlaybackRuntime(o)).rejects.toThrow("decode failed");
  expect(o.root.innerHTML).toBe("<header></header>");
  expect(state.close).toHaveBeenCalledTimes(1);
  expect(document.body.classList.contains("has-song")).toBe(false);
});

it("throttles frame writes, serializes saves and flushes the latest position on dispose", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("URL", { revokeObjectURL: vi.fn() });
  let finish!: () => void;
  const changed = vi.fn().mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const o = options();
  const runtime = await mountPlaybackRuntime({ ...o, changed });
  for (let n = 1; n <= 60; n++) state.host.afterFrame!(n / 10);
  expect(changed).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(1000);
  expect(changed).toHaveBeenCalledTimes(1);
  expect(changed.mock.calls[0][0].settings.position).toBe(6);
  state.host.afterFrame!(7);
  runtime.dispose();
  expect(changed).toHaveBeenCalledTimes(1);
  finish();
  await runtime.flush();
  expect(changed).toHaveBeenCalledTimes(2);
  expect(changed.mock.calls[1][0].settings.position).toBe(7);
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});
it("flush rejects a failed save and a later discrete change can retry", async () => {
  vi.stubGlobal("URL", { revokeObjectURL: vi.fn() });
  const changed = vi
    .fn()
    .mockRejectedValueOnce(Error("quota"))
    .mockResolvedValue(undefined);
  const o = options();
  const runtime = await mountPlaybackRuntime({ ...o, changed });
  const notice = o.root.querySelector("#status")!;
  await expect(runtime.flush()).rejects.toThrow("quota");
  expect(notice.textContent).toBe("quota");
  const player = state.host.player();
  player.playing = true;
  player.onstate();
  expect(notice.textContent).toBe("quota");
  await expect(runtime.flush()).resolves.toBeUndefined();
  expect(notice.textContent).toBe("");
  runtime.dispose();
  await runtime.flush();
});

it("validates SVG content before rendering and permits internal glyph references", async () => {
  vi.stubGlobal("URL", { revokeObjectURL: vi.fn() });
  const o = options();
  o.song.scoreFormat = "musicxml";
  const runtime = await mountPlaybackRuntime(o);
  const validate = vi.mocked(preparePlaybackAssets).mock.calls[0][2]?.validate;
  expect(validate).toBeTypeOf("function");
  const svg = (body: string) =>
    new NodeBlob(
      [
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${body}</svg>`,
      ],
      { type: "image/svg+xml" },
    ) as unknown as Blob;
  for (const unsafe of [
    "<script>alert(1)</script>",
    "<foreignObject><div>unsafe</div></foreignObject>",
    '<path onload="alert(1)"/>',
    '<use href="https://example.invalid/glyph.svg#x"/>',
    '<image xlink:href="https://example.invalid/image.png"/>',
    '<path style="fill:url(https://example.invalid/a.svg#x)"/>',
    '<style>@import "https://example.invalid/a.css";</style>',
  ]) {
    await expect(validate!(svg(unsafe))).rejects.toThrow();
    const blob = svg(unsafe);
    const doc = new DOMParser().parseFromString(
      await blob.text(),
      "image/svg+xml",
    );
    const parse = vi.spyOn(DOMParser.prototype, "parseFromString");
    await expect(validate!(blob, doc)).rejects.toThrow();
    expect(parse).not.toHaveBeenCalled();
    parse.mockRestore();
  }
  await expect(
    validate!(
      svg(
        '<defs><path id="glyph" d="M0 0h1"/><clipPath id="clip"><path d="M0 0h1"/></clipPath></defs><use href="#glyph"/><use xlink:href="#glyph" clip-path="url(#clip)"/>',
      ),
    ),
  ).resolves.toBeUndefined();
  runtime.dispose();
});

it("keeps a BFCache page usable and saves position, while final pagehide disposes", async () => {
  vi.stubGlobal("URL", { revokeObjectURL: vi.fn() });
  const o = options();
  const changed = vi.fn();
  const runtime = await mountPlaybackRuntime({ ...o, changed });
  state.host.afterFrame!(8);
  window.dispatchEvent(
    new PageTransitionEvent("pagehide", { persisted: true }),
  );
  await runtime.flush();
  expect(changed).toHaveBeenLastCalledWith(
    expect.objectContaining({ settings: { position: 8 } }),
    expect.anything(),
  );
  expect(state.dispose).not.toHaveBeenCalled();
  expect(o.root.querySelector("#play")).not.toBeNull();
  window.dispatchEvent(
    new PageTransitionEvent("pageshow", { persisted: true }),
  );
  window.dispatchEvent(
    new PageTransitionEvent("pagehide", { persisted: false }),
  );
  await runtime.flush();
  expect(state.dispose).toHaveBeenCalledTimes(1);
  expect(o.root.innerHTML).toBe("<header></header>");
  runtime.dispose();
});

it("separates conversion progress from score errors and clears playback errors on recovery", async () => {
  vi.stubGlobal("URL", { revokeObjectURL: vi.fn() });
  const o = options();
  const runtime = await mountPlaybackRuntime(o);
  const notice = o.root.querySelector("#stage > #status")!;
  const player = state.host.player();
  expect(notice.textContent).toBe("");
  expect(notice.getAttribute("role")).toBe("alert");
  player.onprogress("BPM 변환 42%");
  expect(notice.textContent).toBe("");
  expect(o.root.querySelector("#tempo-status")!.textContent).toBe(
    "BPM 변환 42%",
  );
  player.onprogress("");
  player.onerror("오디오가 중단되어 일시정지했습니다.");
  expect(notice.textContent).toContain("일시정지");
  const stageClick = vi.fn();
  notice.parentElement!.addEventListener("click", stageClick);
  notice.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(stageClick).not.toHaveBeenCalled();
  const stage = notice.parentElement!;
  stage.scrollLeft = 1200;
  stage.scrollTop = 117;
  stage.dispatchEvent(new Event("scroll"));
  expect(
    (notice as HTMLElement).style.getPropertyValue("--notice-scroll-y"),
  ).toBe("117px");
  expect(
    (notice as HTMLElement).style.getPropertyValue("--notice-scroll-x"),
  ).toBe("1200px");
  player.playing = true;
  player.onstate();
  expect(notice.textContent).toBe("");
  runtime.dispose();
});
