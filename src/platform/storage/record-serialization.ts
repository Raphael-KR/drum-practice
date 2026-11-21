import { encodeAsset, decodeAsset as decode } from "./binary-asset";
import { t as i18nText } from "../../shared/i18n/i18n";
import { validateSong } from "../../model/model";
import type {
  PackedRecord,
  PackedScore,
  SerializedRecord,
} from "../../model/serialized-record";
export type {
  PackedRecord,
  PackedScore,
  SerializedRecord,
  SerializedScore,
} from "../../model/serialized-record";
import {
  normalizeMetronomeSettings,
  type MetronomeCorrectionReporter,
} from "../../model/metronome";
import type { ScoreVariant } from "../../model/record";
import type { RecordData } from "./storage";
import { validateProductionReceipts } from "../../model/production-request";
import {
  validateLyricCorrections,
  validateLyricCorrectionDelivery,
} from "../../model/lyric-correction";

const encode = (blob: Blob) => encodeAsset(blob, "application/octet-stream");
export async function packScores(
  scores: ScoreVariant[] = [],
): Promise<PackedScore[]> {
  return Promise.all(
    scores.map(async (s) => ({
      ...s,
      source: await encode(s.source),
      pages: await Promise.all(s.pages.map(encode)),
    })),
  );
}
export function unpackScores(scores: PackedScore[] = []): ScoreVariant[] {
  return scores.map((s) => {
    if (
      !["pdf", "musicxml"].includes(s.format) ||
      (s.format !== "musicxml" && !s.pages.length)
    )
      throw Error(i18nText("record-serialization.invalidScore"));
    return { ...s, source: decode(s.source), pages: s.pages.map(decode) };
  });
}
export async function packSong(record: RecordData): Promise<PackedRecord> {
  return serializeSong(record, encode);
}
/** Project files and portable records share metadata; each boundary owns its media representation. */
export async function serializeSong<T>(
  record: RecordData,
  encode: (blob: Blob) => Promise<T>,
): Promise<SerializedRecord<T>> {
  validateSong(record.song);
  return {
    version: 2,
    revisions: structuredClone(record.revisions),
    preserveAudioTiming: record.preserveAudioTiming,
    lyricWork: structuredClone(record.lyricWork),
    lyricCorrections: structuredClone(record.lyricCorrections),
    lyricCorrectionDelivery: structuredClone(record.lyricCorrectionDelivery),
    productionReceipts: structuredClone(record.productionReceipts),
    otherScores: await Promise.all(
      (record.otherScores ?? []).map(async (score) => ({
        ...score,
        source: await encode(score.source),
        pages: await Promise.all(score.pages.map(encode)),
      })),
    ),
    song: structuredClone(record.song),
    canonicalXML: record.canonicalXML,
    pdf: await encode(record.pdf),
    audio: await encode(record.audio),
    pages: await Promise.all(record.pages.map(encode)),
  };
}
export function unpackSong(
  data: PackedRecord,
  report?: MetronomeCorrectionReporter,
): RecordData {
  if (data.version !== 2)
    throw Error(i18nText("record-serialization.invalidVersion"));
  const normalized = normalizeMetronomeSettings(data.song);
  validateSong(normalized.song);
  if (data.lyricCorrections !== undefined)
    validateLyricCorrections(data.lyricCorrections, data.song.id);
  if (data.productionReceipts !== undefined)
    validateProductionReceipts(data.productionReceipts, data.song.id);
  if (data.lyricCorrectionDelivery !== undefined) {
    validateLyricCorrectionDelivery(data.lyricCorrectionDelivery, data.song.id);
    if (
      JSON.stringify(data.lyricCorrectionDelivery.envelope.corrections) !==
      JSON.stringify(data.lyricCorrections)
    )
      throw Error("Lyric correction delivery/history mismatch");
  }
  if (data.pages.length !== data.song.pageCount)
    throw Error(i18nText("record-serialization.invalidPages"));
  const record = {
    revisions: data.revisions,
    preserveAudioTiming: data.preserveAudioTiming,
    song: normalized.song,
    lyricWork: data.lyricWork,
    lyricCorrections: data.lyricCorrections,
    lyricCorrectionDelivery: data.lyricCorrectionDelivery,
    productionReceipts: data.productionReceipts,
    canonicalXML: data.canonicalXML,
    otherScores: unpackScores(data.otherScores),
    pdf: decode(data.pdf),
    audio: decode(data.audio),
    pages: data.pages.map(decode),
  };
  report?.(normalized.corrections);
  return record;
}
