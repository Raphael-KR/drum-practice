import { openScoreDatabase } from "./score-database";
import { validateSong, type Song } from "./model";
import type { ScoreVariant } from "./song-scores";
import { isPortable } from "./portable";
const portableRecords = new Map<string, RecordData>();
export interface RecordData {
  editDraft?: import("./edit-history").EditDraft;
  revisions?: import("./edit-history").SavedRevision[];
  canonicalXML?: string;
  song: Song;
  otherScores?: ScoreVariant[];
  pdf: Blob;
  audio: Blob;
  pages: Blob[];
}
interface StoredMedia {
  bytes: ArrayBuffer;
  type: string;
}
interface StoredScore extends Omit<ScoreVariant, "source" | "pages"> {
  source: StoredMedia;
  pages: StoredMedia[];
}
interface StoredRecord {
  editDraft?: import("./edit-history").EditDraft;
  revisions?: import("./edit-history").SavedRevision[];
  canonicalXML?: string;
  otherScores?: StoredScore[];
  song: Song;
  mediaFormat: "bytes-v1";
  pdf: StoredMedia;
  audio: StoredMedia;
  pages: StoredMedia[];
}
async function storedMedia(blob: Blob): Promise<StoredMedia> {
  return { bytes: await blob.arrayBuffer(), type: blob.type };
}
function restoreRecord(value: StoredRecord | RecordData): RecordData {
  if (!("mediaFormat" in value)) return value;
  const blob = (m: StoredMedia) => new Blob([m.bytes], { type: m.type });
  return {
    song: value.song,
    editDraft: value.editDraft,
    revisions: value.revisions,
    canonicalXML: value.canonicalXML,
    pdf: blob(value.pdf),
    audio: blob(value.audio),
    pages: value.pages.map(blob),
    otherScores: value.otherScores?.map((s) => ({
      ...s,
      source: blob(s.source),
      pages: s.pages.map(blob),
    })),
  };
}
const db = openScoreDatabase;
async function serializeRecord(record: RecordData): Promise<StoredRecord> {
  validateSong(record.song);
  // Persist owned bytes, not references to browser-managed Blob backing files.
  // Read everything before opening a write transaction, so failure preserves the old record.
  const [pdf, audio, pages] = await Promise.all([
    storedMedia(record.pdf),
    storedMedia(record.audio),
    Promise.all(record.pages.map(storedMedia)),
  ]);
  const otherScores = await Promise.all(
    (record.otherScores ?? []).map(async (s) => ({
      ...structuredClone({ ...s, source: undefined, pages: undefined }),
      source: await storedMedia(s.source),
      pages: await Promise.all(s.pages.map(storedMedia)),
    })),
  );
  const stored: StoredRecord = {
    song: structuredClone(record.song),
    editDraft: structuredClone(record.editDraft),
    revisions: structuredClone(record.revisions),
    canonicalXML: record.canonicalXML,
    mediaFormat: "bytes-v1",
    pdf,
    audio,
    pages,
    otherScores,
  };
  return stored;
}
export async function saveRecord(record: RecordData) {
  if (isPortable) { portableRecords.set(record.song.id,record);return; }
  await saveRecords([record]);
}
/** Validate and materialize all media before one atomic restore transaction. */
let writeQueue:Promise<void>=Promise.resolve();
export function saveRecords(records: RecordData[]) {
  const copies=records.map(r=>({...r,song:structuredClone(r.song),editDraft:structuredClone(r.editDraft),revisions:structuredClone(r.revisions),pages:[...r.pages],otherScores:r.otherScores?.map(s=>({...s,pages:[...s.pages]}))}));
  const result=writeQueue.then(()=>writeRecords(copies));
  writeQueue=result.catch(()=>{});
  return result;
}
async function writeRecords(records:RecordData[]) {
  const stored=await Promise.all(records.map(serializeRecord));
  const d = await db();
  try {
    await new Promise<void>((ok, no) => {
      const t = d.transaction("songs", "readwrite");
      for(const r of stored)t.objectStore("songs").put(r);
      t.oncomplete = () => ok();
      t.onerror = () => no(t.error);
      t.onabort = () => no(t.error);
    });
  } finally {
    d.close();
  }
}
export async function allRecords(): Promise<RecordData[]> {
  if (isPortable) return [...portableRecords.values()];
  const d = await db();
  try {
    return await new Promise((ok, no) => {
      const r = d.transaction("songs").objectStore("songs").getAll();
      r.onsuccess = () => ok(r.result.map(restoreRecord));
      r.onerror = () => no(r.error);
    });
  } finally {
    d.close();
  }
}
export async function deleteRecord(id: string) {
  if (isPortable) {
    portableRecords.delete(id);
    return;
  }
  const d = await db();
  try {
    await new Promise<void>((ok, no) => {
      const t = d.transaction("songs", "readwrite");
      t.objectStore("songs").delete(id);
      t.oncomplete = () => ok();
      t.onerror = () => no(t.error);
    });
  } finally {
    d.close();
  }
}
