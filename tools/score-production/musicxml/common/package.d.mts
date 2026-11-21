import type { Song, Region } from "../../../../src/model/model";
import type { RecordData } from "../../../../src/model/record";
import type { LyricCorrectionResult } from "../../../../src/modules/lyrics/lyric-corrections";
import type { LyricCorrectionEnvelope } from "../../../../src/model/lyric-correction";

export const projectBase: string;
export function sha(blob: Blob): Promise<string>;
export function base64(blob: Blob): Promise<string>;
export function saveEvidence(
  endpoint: string,
  data: unknown,
  port: number,
): Promise<void>;
export function verifyPackage(
  record: RecordData,
  loaded: RecordData,
): Promise<void>;
export function createVerifiedPackage(record: RecordData): Promise<Blob>;
export function prepareCanonical(
  song: Song,
  sourceXML: string,
  audioHash: string,
  editDocument?: (document: Document) => void,
): { canonicalXML: string; restored: Song };
export function prepareProductionCanonical(
  song: Song,
  sourceXML: string,
  audioHash: string,
  editDocument?: (document: Document) => void,
): Promise<{
  canonicalXML: string;
  restored: Song;
  lyricWork: {
    sourceXML: string;
    sourceSong: Song;
    removedFields: { name: string; value: string | null }[];
    sources: unknown[];
    groups: unknown[];
    confirmedCorrections?: LyricCorrectionEnvelope;
    corrections: LyricCorrectionResult & {
      status: "none" | "applied" | "conflict";
      confirmedSHA256?: string;
      correctionIds?: string[];
    };
  };
}>;
export function bindRenderedScore(
  song: Song,
  rendered: { regions: Region[]; pages: Blob[] },
): void;
