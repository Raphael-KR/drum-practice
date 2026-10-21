import { beforeAll, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import {
  readScorePackage,
  createScorePackage,
} from "../../src/modules/library/score-package";
import {
  writeCanonical,
  readCanonical,
  verifyCanonicalAudio,
} from "../../src/modules/score/canonical-xml";
import {
  audioTimeMap,
  mapTime,
  currentAudioBpm,
} from "../../src/modules/audio/audio-time-map";
import {
  beatTime,
  measureBeatAt,
  beatEvents,
  validateSong,
  setMeasureTiming,
  reflow,
} from "../../src/model/model";
import { scrubTime } from "../../src/modules/playback/practice-controls";
import type { RecordData } from "../../src/model/record";

// Real production artifact, including the six-beat free-ending measure.
let record: RecordData;
beforeAll(async () => {
  const { window } = new JSDOM();
  Object.assign(globalThis, {
    DOMParser: window.DOMParser,
    XMLSerializer: window.XMLSerializer,
  });
  record = await readScorePackage(
    new Blob([readFileSync("public/scores/red-sunset.drumscore")]),
  );
});
it("preserves the actual recording grid through package and canonical XML readback", async () => {
  const loaded = await readScorePackage(await createScorePackage(record));
  await verifyCanonicalAudio(loaded);
  const s = loaded.song;
  expect(s.title).toBe("붉은 노을");
  expect(s.artist).toBe("YB");
  expect(s.bpm).toBe(134);
  expect(s.measures).toHaveLength(137);
  const expected = structuredClone(s.measures);
  const xml = writeCanonical(s, loaded.canonicalXML);
  s.measures.forEach((m) => delete m.beatTimes);
  readCanonical(xml, s);
  validateSong(s);
  expect(s.measures).toEqual(expected);
  expect(s.measures[41].start).toBe(83.56);
  expect(s.measures[134].beats).toBe(6);
  expect(s.measures[134].beatTimes).toEqual([
    246.8, 247.303333, 248.008, 248.914, 250.021333, 251.33,
  ]);
});
it("uses the same nonuniform ending positions for clicks, cursor, seeking and fixed practice beats", () => {
  const s = structuredClone(record.song),
    m = s.measures[134];
  expect(audioTimeMap(s, 267.8335)).toBeUndefined();
  expect(beatEvents(s, m.start, m.end).map((e) => e.time)).toEqual(m.beatTimes);
  for (let b = 0; b <= m.beats; b += 0.25)
    expect(measureBeatAt(m, beatTime(m, b))).toBeCloseTo(b, 9);
  expect(scrubTime(s, beatTime(m, 2), 0, 100, 267.8335)).toBeCloseTo(
    beatTime(m, 2),
    9,
  );
  for (const rate of [0.5, 1, 1.2]) {
    s.settings = { ...s.settings, rate, tempoMode: "practice" };
    const map = audioTimeMap(s, 267.8335)!;
    let q = 0;
    for (const bar of s.measures) {
      for (let b = 0; b <= bar.beats; b++) {
        const time = beatTime(bar, b),
          output = mapTime(time, map.source, map.output);
        expect(output).toBeCloseTo(
          11.27 / rate + ((q + (b * 4) / bar.denominator) * 60) / (134 * rate),
          8,
        );
        expect(mapTime(output, map.output, map.source)).toBeCloseTo(time, 8);
      }
      q += (bar.beats * 4) / bar.denominator;
    }
    expect(
      mapTime(267.8335, map.source, map.output) -
        mapTime(258.28, map.source, map.output),
    ).toBeCloseTo((267.8335 - 258.28) / rate, 8);
  }
  expect(currentAudioBpm(s, 251.33)).toBeLessThan(
    currentAudioBpm(s, 247.303333),
  );
});
it("rejects corrupt beat arrays before they can be played or stored", () => {
  for (const kind of [
    "empty",
    "duplicate",
    "first",
    "end",
    "nonfinite",
  ] as const) {
    const s = structuredClone(record.song),
      m = s.measures[134];
    if (kind === "empty") m.beatTimes = [];
    if (kind === "duplicate") m.beatTimes![2] = m.beatTimes![1];
    if (kind === "first") m.beatTimes![0] -= 0.1;
    if (kind === "end") m.beatTimes![5] = m.end;
    if (kind === "nonfinite") m.beatTimes![2] = NaN;
    expect(() => validateSong(s)).toThrow();
    expect(() => writeCanonical(s, record.canonicalXML)).toThrow();
  }
});
it("preserves beat shape on boundary edits and clears stale grids on uniform reflow or legacy canonical read", () => {
  const s = structuredClone(record.song),
    m = s.measures[134],
    before = structuredClone(m);
  setMeasureTiming(m, m.start + 1, m.end + 2);
  expect(measureBeatAt(m, beatTime(m, 2.5))).toBeCloseTo(2.5);
  expect((m.beatTimes![2] - m.start) / (m.end - m.start)).toBeCloseTo(
    (before.beatTimes![2] - before.start) / (before.end - before.start),
  );
  reflow(s);
  expect(s.measures.some((m) => m.beatTimes)).toBe(false);
  const xml = writeCanonical(s, record.canonicalXML),
    copy = structuredClone(record.song);
  readCanonical(xml, copy);
  expect(copy.measures.some((m) => m.beatTimes)).toBe(false);
  copy.settings.tempoMode = "practice";
  expect(audioTimeMap(copy, 267.8335)).toBeUndefined();
});
