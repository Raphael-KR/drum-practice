import { validateSong, type Song } from "./model";
import type { ScoreVariant } from "./song-scores";
import { isPortable } from "./portable";
const portableRecords = new Map<string, RecordData>();
export interface RecordData {
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
function db(): Promise<IDBDatabase> {
  return new Promise((ok, no) => {
    const r = indexedDB.open("drum-practice", 1);
    r.onupgradeneeded = () =>
      r.result.createObjectStore("songs", { keyPath: "song.id" });
    r.onsuccess = () => ok(r.result);
    r.onerror = () => no(r.error);
  });
}
export async function saveRecord(record: RecordData) {
  validateSong(record.song);
  if (isPortable) {
    portableRecords.set(record.song.id, record);
    return;
  }
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
    mediaFormat: "bytes-v1",
    pdf,
    audio,
    pages,
    otherScores,
  };
  const d = await db();
  try {
    await new Promise<void>((ok, no) => {
      const t = d.transaction("songs", "readwrite");
      t.objectStore("songs").put(stored);
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
