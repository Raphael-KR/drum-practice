// @vitest-environment jsdom
import { Blob as NodeBlob } from "node:buffer";
import { webcrypto } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import { installPracticeFileControls } from "../../src/modules/library/practice-file-controls";
import {
  createPracticeFile,
  readPracticeFile,
} from "../../src/modules/library/practice-file";
import { audioMeasures } from "../../src/modules/audio/audio-practice";
import { defaults, type Song } from "../../src/model/model";
import { download } from "../../src/platform/browser/download";
vi.mock("../../src/platform/browser/download", () => ({ download: vi.fn() }));
afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
function fixture(title: string) {
  const song: Song = {
    version: 1,
    id: webcrypto.randomUUID(),
    title,
    bpm: 120,
    firstBeat: 0,
    audioName: `${title}.mp3`,
    pdfName: "",
    pageCount: 0,
    regions: [],
    lyrics: [],
    markers: [],
    loops: [],
    settings: defaults(),
    audioPractice: { duration: 5, beats: 4, denominator: 4, peaks: [] },
    measures: audioMeasures(5, 120, 0, 4, 4),
  };
  return {
    song,
    audio: new NodeBlob([title], { type: "audio/mpeg" }) as unknown as Blob,
  };
}
function choose(selector: string, files: Blob[]) {
  const input = document.querySelector<HTMLInputElement>(selector)!;
  Object.defineProperty(input, "files", { configurable: true, value: files });
  input.dispatchEvent(new Event("change"));
}
function setup() {
  vi.stubGlobal("Blob", NodeBlob);
  vi.stubGlobal("crypto", webcrypto);
  const records = [fixture("첫 곡"), fixture("둘째 곡")];
  const options = {
    records: vi.fn(async () => records),
    findAudio: vi.fn(async () => new Map<string, Blob>()),
    restore: vi.fn(async () => {}),
  };
  installPracticeFileControls(document.body, options);
  return { records, options };
}
it("downloads all audio metadata in a single JSON without audio bytes", async () => {
  const { records } = setup();
  document.querySelector<HTMLButtonElement>("[data-practice-save]")!.click();
  await vi.waitFor(() => expect(download).toHaveBeenCalledOnce());
  const [file, name] = vi.mocked(download).mock.calls[0];
  expect(name).toMatch(/^drumpractice_backup_\d{8}_\d{6}\.json$/);
  expect((await readPracticeFile(file)).records.map((r) => r.song)).toEqual(
    records.map((r) => r.song),
  );
});
it("waits for all missing originals, accepts multiple selections, and does not import a partial batch", async () => {
  const { records, options } = setup();
  choose("[data-practice-file]", [await createPracticeFile(records)]);
  await vi.waitFor(() =>
    expect(
      document.querySelector("[data-practice-audio]")!.hasAttribute("hidden"),
    ).toBe(false),
  );
  expect(
    document
      .querySelector("[data-practice-audio-file]")!
      .hasAttribute("multiple"),
  ).toBe(true);
  choose("[data-practice-audio-file]", [records[0].audio]);
  await vi.waitFor(() =>
    expect(
      document.querySelector(".practice-file-status")!.textContent,
    ).toContain("1곡의 원본"),
  );
  expect(options.restore).not.toHaveBeenCalled();
  choose("[data-practice-audio-file]", [records[1].audio]);
  await vi.waitFor(() => expect(options.restore).toHaveBeenCalledOnce());
  const batch = options.restore.mock.calls[0] as unknown as [unknown[]];
  expect(batch[0]).toHaveLength(2);
});
it("reuses existing originals and restores without asking for audio files", async () => {
  const { records, options } = setup();
  const file = await createPracticeFile(records),
    data = await readPracticeFile(file);
  options.findAudio.mockResolvedValue(
    new Map(data.records.map((r, i) => [r.audio.sha256, records[i].audio])),
  );
  choose("[data-practice-file]", [file]);
  await vi.waitFor(() => expect(options.restore).toHaveBeenCalledOnce());
  expect(
    document.querySelector("[data-practice-audio]")!.hasAttribute("hidden"),
  ).toBe(true);
});
it("shows mismatched-file and storage failures in red, preserving pending data for retry", async () => {
  const { records, options } = setup();
  choose("[data-practice-file]", [await createPracticeFile(records)]);
  await vi.waitFor(() =>
    expect(
      document.querySelector("[data-practice-audio]")!.hasAttribute("hidden"),
    ).toBe(false),
  );
  choose("[data-practice-audio-file]", [
    new NodeBlob(["wrong"]) as unknown as Blob,
  ]);
  await vi.waitFor(() =>
    expect(
      document.querySelector(".practice-file-status")!.textContent,
    ).toContain("다른 파일"),
  );
  expect(
    document
      .querySelector(".practice-file-status")!
      .classList.contains("is-error"),
  ).toBe(true);
  expect(options.restore).not.toHaveBeenCalled();
  options.restore.mockRejectedValueOnce(new Error("quota full"));
  choose(
    "[data-practice-audio-file]",
    records.map((r) => r.audio),
  );
  await vi.waitFor(() =>
    expect(
      document.querySelector(".practice-file-status")!.textContent,
    ).toContain("quota full"),
  );
  choose(
    "[data-practice-audio-file]",
    records.map((r) => r.audio),
  );
  await vi.waitFor(() =>
    expect(
      document.querySelector(".practice-file-status")!.textContent,
    ).toContain("2곡을 새 항목"),
  );
});
