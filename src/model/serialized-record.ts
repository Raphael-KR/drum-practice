import type { Song } from "./model";
import type { RecordData, ScoreVariant } from "./record";

export interface BinaryAsset {
  type: string;
  base64: string;
}
export interface SerializedScore<T> extends Omit<
  ScoreVariant,
  "source" | "pages"
> {
  source: T;
  pages: T[];
}
/** One metadata contract; portable records embed media and local projects reference assets. */
export interface SerializedRecord<T> {
  version: 2;
  song: Song;
  pdf: T;
  audio: T;
  pages: T[];
  canonicalXML?: string;
  otherScores?: SerializedScore<T>[];
  revisions?: RecordData["revisions"];
  preserveAudioTiming?: boolean;
  lyricWork?: RecordData["lyricWork"];
  lyricCorrections?: RecordData["lyricCorrections"];
  lyricCorrectionDelivery?: RecordData["lyricCorrectionDelivery"];
  productionReceipts?: RecordData["productionReceipts"];
}
export type PackedRecord = SerializedRecord<BinaryAsset>;
export type PackedScore = SerializedScore<BinaryAsset>;
