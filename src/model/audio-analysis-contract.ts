import { validBeatTimes } from "./audio-beat-grid";
export const ANALYZER_VERSION = 4;
export interface AudioAnalysis {
  analyzerVersion: number;
  sha256: string;
  title: string;
  artist: string;
  duration: number;
  bpm: number;
  firstBeat: number;
  beats: number;
  denominator: number;
  confidence: number;
  beatTimes?: number[];
}
const keys = [
  "analyzerVersion",
  "sha256",
  "title",
  "artist",
  "duration",
  "bpm",
  "firstBeat",
  "beats",
  "denominator",
  "confidence",
];
export const isAudioHash = (hash: string) => /^[a-f0-9]{64}$/.test(hash);
export function validAudioAnalysis(
  value: unknown,
  hash: string,
): value is AudioAnalysis {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as AudioAnalysis;
  return (
    keys.every((k) => Object.hasOwn(v, k)) &&
    Object.keys(v).every((k) => keys.includes(k) || k === "beatTimes") &&
    v.analyzerVersion === ANALYZER_VERSION &&
    v.sha256 === hash &&
    isAudioHash(hash) &&
    typeof v.title === "string" &&
    v.title.length <= 300 &&
    typeof v.artist === "string" &&
    v.artist.length <= 300 &&
    Number.isFinite(v.duration) &&
    v.duration > 0 &&
    v.duration <= 14400 &&
    Number.isFinite(v.bpm) &&
    v.bpm >= 20 &&
    v.bpm <= 300 &&
    Number.isFinite(v.firstBeat) &&
    v.firstBeat >= 0 &&
    v.firstBeat < v.duration &&
    Number.isInteger(v.beats) &&
    v.beats >= 1 &&
    v.beats <= 16 &&
    [2, 4, 8, 16].includes(v.denominator) &&
    Number.isFinite(v.confidence) &&
    v.confidence >= 0.08 &&
    v.confidence <= 1 &&
    (v.beatTimes === undefined ||
      (validBeatTimes(v.beatTimes, v.duration) &&
        v.firstBeat === v.beatTimes[0] &&
        v.beats === 4 &&
        v.denominator === 4))
  );
}
