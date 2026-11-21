import type { MeasureLyric } from "../../model/model";
import { t } from "../../shared/i18n/i18n";

export const TIMING_PART = "DrumPracticeLyrics";
export const CANONICAL_FIELD = "drum-practice:score:v3";
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
export interface CanonicalManifest extends CommonManifest {
  version: 3;
  lyrics: LyricVoiceIdentity[];
  /** Authored row-start IDs whose full-score rhythmic spacing fills the line. */
  fullWidthSystems?: string[];
}

/** v3 owns final display groups; raw syllables live in production work files. */
export function canonicalManifest(d: Document): CanonicalManifest | undefined {
  const fields = Array.from(
    d.querySelectorAll("identification > miscellaneous > miscellaneous-field"),
  );
  const field = fields.find((e) => e.getAttribute("name") === CANONICAL_FIELD);
  if (!field) {
    if (
      fields.some((e) =>
        /^drum-practice:score:v/.test(e.getAttribute("name") || ""),
      )
    )
      throw new Error(t("canonical-xml.unsupportedVersion"));
    return;
  }
  const data = JSON.parse(field.textContent || "");
  if (data.version !== 3)
    throw new Error(t("canonical-xml.unsupportedVersion"));
  return data;
}
