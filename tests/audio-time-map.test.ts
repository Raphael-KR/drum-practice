import { expect, it } from "vitest";
import {
  audioTimeMap,
  currentAudioBpm,
  originalTempoMode,
  mapTime,
} from "../src/audio-time-map";
import { audioMeasures, followAudioTempo } from "../src/audio-practice";
import { defaults } from "../src/model";
const beats = [0.2, 0.7, 1.18, 1.64, 2.08, 2.5, 2.9, 3.28, 3.64];
function song() {
  return followAudioTempo({
    version: 1,
    id: "live",
    title: "live",
    bpm: 120,
    firstBeat: 0.2,
    audioName: "a.mp3",
    pdfName: "",
    pageCount: 0,
    regions: [],
    lyrics: [],
    markers: [],
    loops: [],
    settings: defaults(),
    audioPractice: {
      duration: 5,
      beats: 4,
      denominator: 4,
      peaks: [1],
      beatTimes: beats,
    },
    measures: audioMeasures(5, 120, 0.2, 4, 4),
  });
}
it("keeps 1x original distinct from practice at the same baseline BPM, including reload", () => {
  const s = song();
  expect(audioTimeMap(s, 5)).toBeUndefined();
  s.settings.tempoMode = "practice";
  const map = audioTimeMap(JSON.parse(JSON.stringify(s)), 5)!;
  expect(originalTempoMode(s)).toBe(false);
  beats.forEach((t, i) =>
    expect(mapTime(t, map.source, map.output)).toBeCloseTo(0.2 + i * 0.5),
  );
  for (const time of [0, 0.13, 1.25, 4.5, 5])
    expect(
      mapTime(mapTime(time, map.source, map.output), map.output, map.source),
    ).toBeCloseTo(time);
  s.settings.tempoMode = undefined;
  expect(originalTempoMode(s)).toBe(true);
  s.settings.rate = 0.8;
  expect(originalTempoMode(s)).toBe(false);
  s.audioPractice!.followTempo = false;
  expect(audioTimeMap(s, 5)).toBeUndefined();
});
it("reports only completed intervals, averages four, and holds between beats and after the last beat", () => {
  const s = song();
  expect(currentAudioBpm(s, 0.6)).toBe(120);
  expect(currentAudioBpm(s, 0.7)).toBeCloseTo(120);
  expect(currentAudioBpm(s, 2.08)).toBeCloseTo(240 / (2.08 - 0.2));
  expect(currentAudioBpm(s, 2.49)).toBe(currentAudioBpm(s, 2.08));
  expect(currentAudioBpm(s, 2.5)).toBeCloseTo(240 / (2.5 - 0.7));
  expect(currentAudioBpm(s, 5)).toBe(currentAudioBpm(s, 3.64));
});

it('uses selected note values for practice timing and BPM without moving source beats',()=>{
 const s=song();s.bpm=96;s.audioPractice!.beats=6;s.audioPractice!.denominator=8;
 const adjusted=followAudioTempo(s);adjusted.settings.tempoMode='practice';
 const map=audioTimeMap(adjusted,5)!;
 beats.forEach((t,i)=>expect(mapTime(t,map.source,map.output)).toBeCloseTo(.2+i*60/96/2));
 expect(adjusted.audioPractice!.beatTimes).toEqual(beats);
 expect(currentAudioBpm(adjusted,.7)).toBeCloseTo(60);
});
