import type { Song, Region } from "./model";
export type ScoreFormat = "pdf" | "musicxml";
export interface ScoreVariant {
  format: ScoreFormat;
  name: string;
  partId?: string;
  source: Blob;
  pages: Blob[];
  regions: Region[];
  measures: {
    id: string;
    regionId: string;
    beats: number;
    denominator: number;
  }[];
}
export interface RecordData {
  /** Explicitly restored audio timing must not be changed by automatic upgrades. */
  preserveAudioTiming?: boolean;
  editDraft?: import("./edit-history").EditDraft;
  revisions?: import("./edit-history").SavedRevision[];
  canonicalXML?: string;
  song: Song;
  otherScores?: ScoreVariant[];
  pdf: Blob;
  audio: Blob;
  pages: Blob[];
}
