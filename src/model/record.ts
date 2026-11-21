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
  /** Editor file binding. It is not part of Song or a portable score package. */
  localProject?: import("./score-project").LocalProjectHead;
  /** Compare-and-swap token for the separate local draft, never a confirmed-save receipt. */
  localDraft?: {
    id: string;
    base: import("./score-project").LocalProjectHead | null;
  };
  /** A file-backed draft can also replace source media, outside the music undo stack. */
  localDraftChanges?: boolean;
  /** Authoring evidence, excluded from canonical MusicXML and playback packages. */
  lyricWork?: {
    lyrics?: import("./model").Lyric[];
    /** Reversible group membership; never serialized into canonical MusicXML. */
    groups?: Record<
      string,
      { lyric: import("./model").Lyric; offsetQuarters: number }[]
    >;
    text?: string;
    vocalXML?: string;
  };
  /** Explicitly restored audio timing must not be changed by automatic upgrades. */
  preserveAudioTiming?: boolean;
  editDraft?: import("./edit-history").EditDraft;
  revisions?: import("./edit-history").SavedRevision[];
  /** Authoring history/outbox; excluded from playback packages and canonical XML. */
  lyricCorrections?: import("./lyric-correction").LyricCorrection[];
  lyricCorrectionDelivery?: import("./lyric-correction").LyricCorrectionDelivery;
  /** Local result acceptance evidence, excluded from canonical XML and .drumscore. */
  productionReceipts?: import("./production-request").ProductionReceipt[];
  canonicalXML?: string;
  song: Song;
  otherScores?: ScoreVariant[];
  pdf: Blob;
  audio: Blob;
  pages: Blob[];
}
