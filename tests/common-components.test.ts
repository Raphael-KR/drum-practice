// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { Blob as NodeBlob } from "node:buffer";
import { mountPlaybackShell } from "../src/playback-shell";
import {
  webPlaybackBindings,
  portablePlaybackBindings,
} from "../src/playback-ui";
import { iconButton } from "../src/icons";
import { download } from "../src/download";
import { encodeAsset, decodeAsset } from "../src/binary-asset";
vi.mock("../src/practice-staff-layout", () => ({
  practicePage: vi.fn(async (b: Blob) => b),
  measurePageStaff: vi.fn(() => new Map([["r", { top: 1 }]])),
}));
vi.mock("../src/note-highlight", () => ({
  highlightPage: vi.fn(async () => undefined),
}));
import {
  preparePlaybackAssets,
  replacePlaybackAssets,
} from "../src/playback-assets";
import type { Song } from "../src/model";
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  document.body.replaceChildren();
});
for (const [host, binding] of [
  ["web", webPlaybackBindings],
  ["portable", portablePlaybackBindings],
] as const)
  it(`${host}: same shell, unique controls, authoring slots retained`, () => {
    document.body.innerHTML =
      '<div id="app"><header><div class="brand"></div><div class="actions"></div></header><main><section id="practice"><div id="stage"></div></section></main></div>';
    const markerContent = document.createElement("div"),
      loopExtra = document.createElement("input");
    loopExtra.value = "preserved";
    const open = vi.fn();
    mountPlaybackShell(document.querySelector("#app")!, {
      ids: {
        ...binding,
        rewindButton: "rewind",
        mark: "mark",
        sound: "sound",
        settings: "settings",
        radiusAttribute: "data-radius",
      },
      screen: { pdf: "pdf", highlight: "highlight", fullscreen: "fullscreen" },
      preferences: { restart: "restart", countoff: "countoff" },
      select: vi.fn(),
      openSettings: open,
      markerContent,
      loopExtra: host === "web" ? loopExtra : undefined,
    });
    expect(document.querySelector("#practice")!.lastElementChild?.id).toBe(
      "score-gesture-hint",
    );
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(document.querySelectorAll("#loop-a")).toHaveLength(1);
    expect(document.querySelectorAll("#music-volume")).toHaveLength(1);
    expect(document.querySelector("#practice .transport")).not.toBeNull();
    expect(document.querySelector("#practice .repeat-controls")).not.toBeNull();
    (document.querySelector("#settings") as HTMLElement).click();
    expect(open).toHaveBeenCalledOnce();
    if (host === "web")
      expect(document.querySelector("#loop-dialog")!.contains(loopExtra)).toBe(
        true,
      );
  });
it("icon updates preserve the button identity and handler; escape captions", () => {
  document.body.innerHTML = '<button id="example"></button>';
  const button = document.querySelector<HTMLButtonElement>("button")!;
  const action = vi.fn();
  button.onclick = action;
  iconButton("example", "play", 'A "label"', "<b>caption</b>");
  button.click();
  expect(action).toHaveBeenCalledOnce();
  expect(button.querySelector("b")).toBeNull();
  expect(button.textContent).toBe("<b>caption</b>");
});
it("download sanitizes filenames and releases URL even if click fails", () => {
  vi.useFakeTimers();
  const revoke = vi.fn();
  vi.stubGlobal("URL", {
    createObjectURL: () => "blob:test",
    revokeObjectURL: revoke,
  });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    expect(this.download).toBe("a_b.xml");
    throw Error("blocked");
  });
  expect(() => download(new Blob(), "a/b.xml")).toThrow("blocked");
  vi.runAllTimers();
  expect(revoke).toHaveBeenCalledWith("blob:test");
});
it("binary codec preserves bytes and boundary MIME defaults", async () => {
  vi.stubGlobal("Blob", NodeBlob);
  const b = new NodeBlob([new Uint8Array([0, 127, 128, 255])]);
  const a = await encodeAsset(b as Blob, "application/octet-stream");
  expect(a.type).toBe("application/octet-stream");
  expect(new Uint8Array(await decodeAsset(a).arrayBuffer())).toEqual(
    new Uint8Array([0, 127, 128, 255]),
  );
});
it("asset decode failure releases all new URLs without touching current assets", async () => {
  let i = 0;
  const revoke = vi.fn();
  vi.stubGlobal("URL", {
    createObjectURL: () => `blob:${++i}`,
    revokeObjectURL: revoke,
  });
  let decoded = 0;
  vi.stubGlobal(
    "Image",
    class {
      src = "";
      naturalHeight = 200;
      naturalWidth = 100;
      async decode() {
        if (++decoded === 2) throw Error("decode");
      }
    },
  );
  const score = {
    scoreFormat: "musicxml",
    regions: [{ id: "r", page: 0 }],
  } as Song;
  await expect(
    preparePlaybackAssets([new Blob(), new Blob()], score),
  ).rejects.toThrow("decode");
  expect(revoke.mock.calls.flat()).toEqual(["blob:1", "blob:2"]);
});
it("asset replacement preserves reference identity and revokes old URLs", async () => {
  const revoke = vi.fn();
  vi.stubGlobal("URL", {
    createObjectURL: () => "blob:new",
    revokeObjectURL: revoke,
  });
  vi.stubGlobal(
    "Image",
    class {
      src = "";
      naturalHeight = 200;
      naturalWidth = 100;
      async decode() {}
    },
  );
  const current = {
    urls: ["blob:old"],
    pageRatios: [1],
    highlightPages: [],
    practiceStaffs: new Map(),
  };
  const ref = current.urls;
  const next = await preparePlaybackAssets([new Blob()], {
    scoreFormat: "pdf",
    regions: [],
  } as unknown as Song);
  replacePlaybackAssets(current, next);
  expect(current.urls).toBe(ref);
  expect(current.urls).toEqual(["blob:new"]);
  expect(current.pageRatios).toEqual([2]);
  expect(revoke).toHaveBeenCalledWith("blob:old");
});
