import type { MeasureLyric } from "../../model/model";

export const LEGACY_LYRIC_PART = "DrumPracticeLyrics";
export const CANONICAL_FIELD = "drum-practice:score:v2";
export const LEGACY_CANONICAL_FIELD = "drum-practice:score:v1";
export const LYRIC_DIVISIONS = 9600;

interface CommonManifest {
  partId: string;
  audioName: string;
  audioSHA256?: string;
  measureLyrics?: MeasureLyric[];
  measures: {
    id: string;
    label: string;
    beats: number;
    denominator: number;
    start: number;
    end: number;
    beatTimes?: number[];
    occurrence: number;
  }[];
}
export interface LyricVoiceIdentity {
  noteId: string;
  voice: string;
  id: string;
  confirmed: boolean;
}
export type CanonicalManifest = CommonManifest &
  (
    | { version: 1; lyrics: Omit<LyricVoiceIdentity, "noteId">[] }
    | { version: 2; lyrics: LyricVoiceIdentity[] }
  );

/** v1 partId belongs to the separate lyric part; v2 partId owns the lyric voices. */
export function canonicalManifest(d: Document): CanonicalManifest | undefined {
  const fields = Array.from(
    d.querySelectorAll("identification > miscellaneous > miscellaneous-field"),
  );
  const field =
    fields.find((e) => e.getAttribute("name") === CANONICAL_FIELD) ??
    fields.find((e) => e.getAttribute("name") === LEGACY_CANONICAL_FIELD);
  return field ? JSON.parse(field.textContent || "") : undefined;
}
