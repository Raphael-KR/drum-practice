import type { Song, Region } from "../../../../src/model/model";
import type { RecordData } from "../../../../src/model/record";

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
export function bindRenderedScore(
  song: Song,
  rendered: { regions: Region[]; pages: Blob[] },
): void;
