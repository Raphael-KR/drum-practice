import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("music-metadata", () => ({
  parseBlob: vi.fn(async () => ({
    format: { duration: 10, numberOfChannels: 2 },
  })),
}));
import {
  audioAnalysisSamples,
  audioMeasures,
  practiceFileKind,
  readAudioPractice,
  retimeAudio,
  waveformPeaks,
} from "../../src/modules/audio/audio-practice";
import { defaults, validateSong, type Song } from "../../src/model/model";
import {
  importPracticeRecord,
  loadPracticeRecord,
  removePracticeRecord,
  savePracticeState,
} from "../../src/platform/storage/practice-library";
import { estimatePracticeTempo as estimateTempo } from "../../src/modules/audio/audio-tempo";
import { songScores } from "../../src/modules/score/song-scores";
import type { RecordData } from "../../src/model/record";
const sample = (): Song => ({
  version: 1,
  id: "audio-test",
  title: "Audio",
  bpm: 120,
  firstBeat: 0.2,
  audioName: "song.mp3",
  pdfName: "",
  pageCount: 0,
  regions: [],
  lyrics: [],
  markers: [],
  loops: [],
  settings: defaults(),
  audioPractice: { duration: 5, beats: 4, denominator: 4, peaks: [0, 0.4, 1] },
  measures: audioMeasures(5, 120, 0.2, 4, 4),
});
afterEach(() => vi.unstubAllGlobals());
describe("local audio practice", () => {
  it("dispatches by file type without misreading packages as audio", () => {
    expect(practiceFileKind({ name: "SONG.MP3", type: "" })).toBe("audio");
    expect(practiceFileKind({ name: "unknown", type: "audio/mp4" })).toBe(
      "audio",
    );
    expect(
      practiceFileKind({ name: "song.drumscore", type: "audio/mpeg" }),
    ).toBe("score");
    expect(
      practiceFileKind({ name: "song.zip", type: "application/zip" }),
    ).toBe("score");
    expect(() =>
      practiceFileKind({ name: "video.mp4", type: "video/mp4" }),
    ).toThrow();
  });
  it("keeps pickup offset and full musical duration for a partial final bar", () => {
    expect(
      audioMeasures(5, 120, 0.2, 4, 4).map((m) => [m.start, m.end]),
    ).toEqual([
      [0.2, 2.2],
      [2.2, 4.2],
      [4.2, 6.2],
    ]);
    expect(audioMeasures(5, 120, 0, 6, 8)[0].end).toBe(1.5);
    for (const args of [
      [0, 120, 0, 4, 4],
      [5, NaN, 0, 4, 4],
      [5, 120, 5, 4, 4],
      [5, 120, 0, 0, 4],
      [5, 120, 0, 4, 3],
      [100000, 300, 0, 4, 4],
    ])
      expect(() =>
        audioMeasures(...(args as [number, number, number, number, number])),
      ).toThrow();
  });
  it("validates explicit no-score records and rejects inconsistent timing", () => {
    const s = sample();
    expect(() => validateSong(s)).not.toThrow();
    expect(() => validateSong({ ...s, audioPractice: undefined })).toThrow();
    expect(() => validateSong({ ...s, pageCount: 1 })).toThrow();
    expect(() =>
      validateSong({
        ...s,
        audioPractice: { ...s.audioPractice!, peaks: [Infinity] },
      }),
    ).toThrow();
    s.measures[0].end = 1;
    expect(() => validateSong(s)).toThrow();
  });
  it("retimes bars without moving markers and loops in the audio, restoring original speed", () => {
    const s = sample();
    s.settings.rate = 0.7;
    s.markers = [{ id: "m", name: "M", time: 1 }];
    s.loops = [{ id: "l", name: "L", start: 1, end: 3 }];
    const next = retimeAudio(s, 90, 0.5, 3, 4);
    validateSong(next);
    expect(next.measures[0].end).toBe(2.5);
    expect(next.settings.rate).toBe(1);
    expect(next.markers).toEqual(s.markers);
    expect(next.loops).toEqual(s.loops);
    expect(s.bpm).toBe(120);
  });
  it("stores original bytes and practice state with no score renderer assets", async () => {
    const record: RecordData = {
      song: sample(),
      audio: new Blob(["mp3 bytes"], { type: "audio/mpeg" }),
      pdf: new Blob(),
      pages: [],
    };
    await importPracticeRecord(record);
    const saved = (await loadPracticeRecord(record.song.id))!;
    expect(await saved.audio.text()).toBe("mp3 bytes");
    expect(saved.audio.type).toBe("audio/mpeg");
    expect(songScores(saved)).toEqual([]);
    saved.song.markers = [{ id: "m", name: "marker", time: 2 }];
    saved.song.loops = [{ id: "l", name: "loop", start: 1, end: 4 }];
    saved.song.settings.rate = 0.8;
    await savePracticeState(saved.song.id, saved.song);
    const reopened = (await loadPracticeRecord(record.song.id))!;
    expect(reopened.song.markers).toEqual(saved.song.markers);
    expect(reopened.song.loops).toEqual(saved.song.loops);
    expect(reopened.song.settings.rate).toBe(0.8);
    await removePracticeRecord(record.song.id);
  });
  it("bounds waveform storage and always closes the decoder on invalid input", async () => {
    expect(
      waveformPeaks({
        numberOfChannels: 1,
        getChannelData: () => new Float32Array([-0.4, 0.8, 2]),
      } as unknown as AudioBuffer),
    ).toEqual([expect.closeTo(0.4), expect.closeTo(0.8), 1]);
    const close = vi.fn(async () => {});
    vi.stubGlobal(
      "AudioContext",
      class {
        close = close;
        decodeAudioData = vi.fn(async () => {
          throw new Error("corrupt mp3");
        });
      },
    );
    await expect(
      readAudioPractice(new File(["bad"], "bad.mp3")),
    ).rejects.toThrow("corrupt mp3");
    expect(close).toHaveBeenCalledOnce();
    await expect(readAudioPractice(new File([], "empty.mp3"))).rejects.toThrow(
      "빈 음원",
    );
  });
});

it("detects right-only and opposite-phase stereo pulses without cancelling them", () => {
  const sampleRate = 1000,
    pulse = new Float32Array(20000);
  for (let i = 200; i < pulse.length; i += 500) pulse.fill(0.8, i, i + 20);
  for (const channels of [
    [new Float32Array(pulse.length), pulse],
    [pulse, pulse.map((v) => -v)],
  ]) {
    const buffer = {
      numberOfChannels: 2,
      sampleRate,
      getChannelData: (i: number) => channels[i],
    } as AudioBuffer;
    const guess = estimateTempo(audioAnalysisSamples(buffer), sampleRate);
    expect(guess.bpm).toBe(120);
    expect(guess.firstBeat).toBeCloseTo(0.2, 1);
    expect(guess.confidence).toBeGreaterThan(0.08);
    expect(Math.max(...waveformPeaks(buffer))).toBeCloseTo(0.8);
  }
});
