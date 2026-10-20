import { encodeAsset, decodeAsset as decode } from "./binary-asset";
import { t as i18nText } from "../../shared/i18n/i18n";
import { validateSong, type Song } from "../../model/model";
import type { ScoreVariant } from "../../model/record";
import type { RecordData } from "./storage";

interface Asset {
  type: string;
  base64: string;
}
export interface PackedScore extends Omit<ScoreVariant, "source" | "pages"> {
  source: Asset;
  pages: Asset[];
}
export interface PackedRecord {
  canonicalXML?: string;
  otherScores?: PackedScore[];
  version: 1;
  song: Song;
  pdf: Asset;
  audio: Asset;
  pages: Asset[];
}
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
    if (!["pdf", "musicxml"].includes(s.format) || !s.pages.length)
      throw Error(i18nText("record-serialization.invalidScore"));
    return { ...s, source: decode(s.source), pages: s.pages.map(decode) };
  });
}
export async function packSong(record: RecordData): Promise<PackedRecord> {
  validateSong(record.song);
  return {
    version: 1,
    otherScores: await packScores(record.otherScores),
    song: structuredClone(record.song),
    canonicalXML: record.canonicalXML,
    pdf: await encode(record.pdf),
    audio: await encode(record.audio),
    pages: await Promise.all(record.pages.map(encode)),
  };
}
export function unpackSong(data: PackedRecord): RecordData {
  if (data.version !== 1) throw Error(i18nText("record-serialization.invalidVersion"));
  validateSong(data.song);
  if (data.pages.length !== data.song.pageCount)
    throw Error(i18nText("record-serialization.invalidPages"));
  return {
    song: data.song,
    canonicalXML: data.canonicalXML,
    otherScores: unpackScores(data.otherScores),
    pdf: decode(data.pdf),
    audio: decode(data.audio),
    pages: data.pages.map(decode),
  };
}
