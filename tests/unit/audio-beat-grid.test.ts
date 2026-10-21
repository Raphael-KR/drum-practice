import { expect, it } from "vitest";
import {
  audioMeasures,
  followAudioTempo,
  retimeAudio,
  setAudioBarOne,
} from "../../src/modules/audio/audio-practice";
import {
  beatEvents,
  beatTime,
  preludeCountBeats,
  defaults,
  locate,
  makeCycle,
  validateSong,
  type Song,
} from "../../src/model/model";
import { validAudioAnalysis } from "../../src/model/audio-analysis-contract";
const times = [0.2, 0.7, 1.18, 1.64, 2.08, 2.5, 2.9, 3.28, 3.64];
const base = (): Song => ({
  version: 1,
  id: "tracked",
  title: "live",
  bpm: 120,
  firstBeat: 0.2,
  audioName: "a.mp3",
  pdfName: "",
  pageCount: 0,
  regions: [],
  lyrics: [],
  markers: [{ id: "m", name: "m", time: 1 }],
  loops: [{ id: "l", name: "l", start: 1, end: 3 }],
  settings: defaults(),
  audioPractice: {
    duration: 4.2,
    beats: 4,
    denominator: 4,
    peaks: [1],
    beatTimes: times,
  },
  measures: audioMeasures(4.2, 120, 0.2, 4, 4),
});
it("uses exact source beat timestamps and inverse beat coordinates, including partial last group", () => {
  const s = followAudioTempo(base());
  validateSong(s);
  expect(beatEvents(s, 0, 4.2).map((b) => b.time)).toEqual(times);
  expect(beatEvents(s, 0, 4.2).every((b) => !b.accent)).toBe(true);
  for (const [i, t] of times.entries()) {
    expect(locate(s, t).beat).toBeCloseTo(i % 4);
    expect(beatTime(s.measures[Math.floor(i / 4)], i % 4)).toBe(t);
  }
  expect(s.measures.at(-1)!.beats).toBe(1);
  const t = beatTime(s.measures[0], 2.5);
  expect(locate(s, t).beat).toBeCloseTo(2.5);
  const c = makeCycle(0, 2.08, 3.64, 0.5, 0, s.measures[1], true);
  expect(c.countBeatSeconds).toBeCloseTo(0.42 / 0.5);
});
it("can switch fixed/variable without losing user state and rejects corrupt timing", () => {
  const s = followAudioTempo(base()),
    fixed = retimeAudio(s, 100, 0.1, 3, 4);
  validateSong(fixed);
  expect(fixed.audioPractice!.followTempo).toBe(false);
  expect(fixed.measures[0].beatTimes).toBeUndefined();
  const restored = followAudioTempo(fixed);
  validateSong(restored);
  expect(restored.markers).toEqual(s.markers);
  expect(restored.loops).toEqual(s.loops);
  expect(beatEvents(restored, 0, 4.2).map((b) => b.time)).toEqual(times);
  expect(restored.measures[0].beats).toBe(3);
  for (const malformed of [
    [0.2, 0.2, ...times.slice(2)],
    [...times.slice(0, -1), 9],
    [...times.slice(0, -1), NaN],
  ]) {
    expect(() =>
      followAudioTempo({
        ...s,
        audioPractice: { ...s.audioPractice!, beatTimes: malformed },
      }),
    ).toThrow();
  }
  const bad = structuredClone(s);
  bad.measures[0].beatTimes![1] += 0.1;
  expect(() => validateSong(bad)).toThrow();
});
it("accepts only bounded, matching, current-version cached beat maps", () => {
  const hash = "a".repeat(64),
    a = {
      analyzerVersion: 4,
      sha256: hash,
      title: "t",
      artist: "a",
      bpm: 120,
      duration: 4.2,
      firstBeat: 0.2,
      beats: 4,
      denominator: 4,
      confidence: 0.8,
      beatTimes: times,
    };
  expect(validAudioAnalysis(a, hash)).toBe(true);
  for (const change of [
    { analyzerVersion: 3 },
    { firstBeat: 0 },
    { beatTimes: [...times, Infinity] },
    { audio: "private" },
  ])
    expect(validAudioAnalysis({ ...a, ...change }, hash)).toBe(false);
});

it("groups triple meter accents and count-in while rejecting mismatched saved measures", () => {
  const s = base();
  s.audioPractice!.beats = 3;
  const grouped = setAudioBarOne(followAudioTempo(s), times[3]);
  validateSong(grouped);
  expect(
    beatEvents(grouped, 0, 4.2)
      .filter((b) => b.accent)
      .map((b) => b.time),
  ).toEqual([times[3], times[6]]);
  expect(preludeCountBeats(grouped)).toEqual(times.slice(0, 3));
  grouped.measures[1].denominator = 8;
  expect(() => validateSong(grouped)).toThrow();
});
