import { validateSong, type Song } from "./model";
import { isPortable } from "./portable";
const portableRecords = new Map<string, RecordData>();
export interface RecordData {
  song: Song;
  pdf: Blob;
  audio: Blob;
  pages: Blob[];
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
  const d = await db();
  try {
    await new Promise<void>((ok, no) => {
      const t = d.transaction("songs", "readwrite");
      t.objectStore("songs").put(record);
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
      r.onsuccess = () => ok(r.result);
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
