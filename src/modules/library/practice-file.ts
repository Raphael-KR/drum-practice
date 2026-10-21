import { validateSong, uid, type Song } from "../../model/model";
import type { RecordData } from "../../model/record";
import {
  MAX_AUDIO_FILE_BYTES,
  MAX_AUDIO_SECONDS,
} from "../audio/audio-import-limits";
import { t } from "../../shared/i18n/i18n";
import { audioFileHash } from "../../platform/storage/audio-analysis-cache";

/** Stable filename in Korean time, regardless of the device timezone. */
export function practiceFileName(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)!.value;
  return `drumpractice_backup_${value("year")}${value("month")}${value("day")}_${value("hour")}${value("minute")}${value("second")}.json`;
}
const MAX_FILE = 64 * 1024 * 1024;
const MAX_RECORDS = 1000;
export interface PracticeFileEntry {
  song: Song;
  audio: { name: string; size: number; sha256: string };
}
function invalid(): never {
  throw Error(t("practiceFile.invalid"));
}
export async function practiceAudioHash(audio: Blob): Promise<string> {
  if (!audio.size || audio.size > MAX_AUDIO_FILE_BYTES) invalid();
  return audioFileHash(await audio.arrayBuffer());
}
export interface PracticeFileData {
  format: "drumpractice";
  version: 1;
  records: PracticeFileEntry[];
}
function validateEntry(m: PracticeFileEntry) {
  if (!m) invalid();
  validateSong(m.song);
  if (
    !m.song.audioPractice ||
    m.song.audioPractice.duration > MAX_AUDIO_SECONDS ||
    !m.audio ||
    typeof m.audio.name !== "string" ||
    !Number.isSafeInteger(m.audio.size) ||
    m.audio.size <= 0 ||
    m.audio.size > MAX_AUDIO_FILE_BYTES ||
    typeof m.audio.sha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(m.audio.sha256)
  )
    invalid();
  for (const [items, slots] of [
    [m.song.markers, m.song.markerSlots],
    [m.song.loops, m.song.repeatSlots],
  ] as const) {
    const ids = new Set(items.map((item) => item.id));
    if (
      items.some((item) => typeof item.id !== "string" || !item.id) ||
      ids.size !== items.length ||
      (slots !== undefined &&
        (!Array.isArray(slots) ||
          slots.length > 100000 ||
          slots.some(
            (id) => typeof id !== "string" || (id !== "" && !ids.has(id)),
          )))
    )
      invalid();
  }
}
function validate(data: PracticeFileData) {
  if (
    !data ||
    data.format !== "drumpractice" ||
    data.version !== 1 ||
    !Array.isArray(data.records) ||
    !data.records.length ||
    data.records.length > MAX_RECORDS
  )
    invalid();
  const ids = new Set<string>();
  for (const entry of data.records) {
    validateEntry(entry);
    if (ids.has(entry.song.id)) invalid();
    ids.add(entry.song.id);
  }
}
/** Snapshot every song before reading bytes. Audio is represented only by its fingerprint. */
export async function createPracticeFile(
  records: Pick<RecordData, "song" | "audio">[],
): Promise<Blob> {
  if (!records.length) throw Error(t("practiceFile.empty"));
  if (records.length > MAX_RECORDS) invalid();
  const snapshots = records.map((record) => ({
    song: structuredClone(record.song),
    audio: record.audio,
  }));
  const entries: PracticeFileEntry[] = [];
  for (const { song, audio } of snapshots) {
    entries.push({
      song,
      audio: {
        name: song.audioName,
        size: audio.size,
        sha256: await practiceAudioHash(audio),
      },
    });
  }
  const data: PracticeFileData = {
    format: "drumpractice",
    version: 1,
    records: entries,
  };
  validate(data);
  const file = new Blob([JSON.stringify(data)], { type: "application/json" });
  if (file.size > MAX_FILE) invalid();
  return file;
}
export async function readPracticeFile(file: Blob): Promise<PracticeFileData> {
  if (!file.size || file.size > MAX_FILE) invalid();
  const data: PracticeFileData = JSON.parse(await file.text());
  validate(data);
  return data;
}
/** Matching bytes, not names, establish which audio the preserved timing belongs to. */
export async function bindPracticeAudio(
  entry: PracticeFileEntry,
  audio: Blob,
): Promise<RecordData> {
  validateEntry(entry);
  if (
    audio.size !== entry.audio.size ||
    (await practiceAudioHash(audio)) !== entry.audio.sha256
  )
    throw Error(t("practiceFile.audioMismatch"));
  return {
    song: { ...structuredClone(entry.song), id: uid() },
    audio,
    pdf: new Blob(),
    pages: [],
    preserveAudioTiming: true,
  };
}
/** One bounded lookup per existing audio; skip hashing unrelated file sizes. */
export async function matchPracticeAudio(
  entries: PracticeFileEntry[],
  sources: Blob[],
): Promise<Map<string, Blob>> {
  const needed = new Map(
    entries.map((entry) => [entry.audio.sha256, entry.audio.size]),
  );
  const sizes = new Set(needed.values());
  const matched = new Map<string, Blob>();
  for (const source of sources) {
    if (!sizes.has(source.size)) continue;
    const hash = await practiceAudioHash(source);
    if (needed.get(hash) === source.size) matched.set(hash, source);
    if (matched.size === needed.size) break;
  }
  return matched;
}
