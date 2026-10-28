import { beatTime, measureBeatAt, type Settings, type Song } from "./model";
import type { RecordData } from "./record";

export type MetronomeMode = "quarter" | "eighth" | "off";
export const metronomeModes = ["quarter", "eighth", "off"] as const;
const EPSILON = 1e-7;

export function metronomeMode(settings: Settings): MetronomeMode {
  return !settings.click
    ? "off"
    : settings.clickDivision === 8
      ? "eighth"
      : "quarter";
}
export function nextMetronomeMode(settings: Settings): MetronomeMode {
  return metronomeModes[
    (metronomeModes.indexOf(metronomeMode(settings)) + 1) % 3
  ];
}
/** Both UI entry points use this mutation; a selected choice is a no-op. */
export function setMetronomeMode(
  settings: Settings,
  mode: MetronomeMode,
): boolean {
  if (metronomeMode(settings) === mode) return false;
  settings.click = mode !== "off";
  if (mode !== "off") settings.clickDivision = mode === "eighth" ? 8 : 4;
  return true;
}

export interface MetronomeCorrection {
  songId: string;
  field: "settings.clickDivision";
  expected: "4 | 8";
  actual: string;
  actualType: string;
  applied: 4;
}
export type MetronomeCorrectionReporter = (
  corrections: MetronomeCorrection[],
) => void;
/** Correct only an explicitly invalid division, on a working copy. Never coerce other fields. */
export function normalizeMetronomeSettings<T>(song: T): {
  song: T;
  corrections: MetronomeCorrection[];
} {
  if (!song || typeof song !== "object" || !("settings" in song))
    return { song, corrections: [] };
  const settings = song.settings;
  if (
    !settings ||
    typeof settings !== "object" ||
    Array.isArray(settings) ||
    !("clickDivision" in settings)
  )
    return { song, corrections: [] };
  const value = settings.clickDivision;
  if (value === undefined || value === 4 || value === 8)
    return { song, corrections: [] };
  return {
    song: { ...song, settings: { ...settings, clickDivision: 4 } },
    corrections: [
      {
        songId:
          "id" in song && typeof song.id === "string"
            ? song.id.slice(0, 80)
            : "(unknown)",
        field: "settings.clickDivision",
        expected: "4 | 8",
        actual:
          typeof value === "object" && value !== null
            ? Array.isArray(value)
              ? "[array]"
              : "[object]"
            : String(value).slice(0, 80),
        actualType: value === null ? "null" : typeof value,
        applied: 4,
      },
    ],
  };
}

/** Drafts/revisions can later become the active song; normalize their working copies too. */
export function normalizeRecordMetronome(record: RecordData) {
  const corrections: MetronomeCorrection[] = [];
  const normalize = (song: Song) => {
    const result = normalizeMetronomeSettings(song);
    corrections.push(...result.corrections);
    return result.song;
  };
  return {
    record: {
      ...record,
      song: normalize(record.song),
      editDraft: record.editDraft
        ? { ...record.editDraft, song: normalize(record.editDraft.song) }
        : undefined,
      revisions: record.revisions?.map((revision) => ({
        ...revision,
        song: normalize(revision.song),
      })),
    },
    corrections,
  };
}

/** Musical position in quarter notes. Prelude and untracked gaps add no phase. */
export function metronomeQuarterAt(song: Song, time: number): number {
  let quarter = 0;
  for (const measure of song.measures) {
    if (measure.audioPrelude) continue;
    if (time < measure.start) break;
    if (time < measure.end)
      return quarter + (measureBeatAt(measure, time) * 4) / measure.denominator;
    quarter += (measure.beats * 4) / measure.denominator;
  }
  return quarter;
}

/** One cycle's immutable events. runFrom advances across natural repeats, unlike source time. */
export function metronomeEvents(
  song: Song,
  from: number,
  to: number,
  runFrom = metronomeQuarterAt(song, from),
): { time: number; accent: boolean }[] {
  if (!song.settings.click) return [];
  const step = song.settings.clickDivision === 8 ? 0.5 : 1;
  const phaseOffset = runFrom - metronomeQuarterAt(song, from);
  const events: { time: number; accent: boolean }[] = [];
  let quarter = 0;
  for (const measure of song.measures) {
    if (measure.audioPrelude) continue;
    if (measure.start >= to - EPSILON) break;
    const length = (measure.beats * 4) / measure.denominator;
    if (measure.end > from + EPSILON) {
      const first =
        quarter +
        phaseOffset +
        (measureBeatAt(measure, Math.max(from, measure.start)) * 4) /
          measure.denominator;
      const end =
        quarter +
        phaseOffset +
        (measureBeatAt(measure, Math.min(to, measure.end)) * 4) /
          measure.denominator;
      for (
        let index = Math.ceil((first - EPSILON) / step);
        index * step < end - EPSILON;
        index++
      ) {
        const beat =
          ((index * step - phaseOffset - quarter) * measure.denominator) / 4;
        events.push({
          time: beatTime(measure, Math.max(0, beat)),
          accent:
            step === 0.5
              ? index % 2 === 0
              : Math.abs(beat) < EPSILON &&
                (!song.audioPractice?.followTempo ||
                  !!song.audioPractice.barOne),
        });
      }
    }
    quarter += length;
  }
  return events;
}
