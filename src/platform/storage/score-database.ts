import type { Song } from "../../model/model";
import { t } from "../../shared/i18n/i18n";
/** Both local apps own one score library on the same origin. */
const SCORE_DATABASE = "drum-practice";
const RESET = "canonical-v3";
export const RETIRED_SCORE_ID = "tom-moving-original-v1";

interface OldRecord {
  song: Song;
  canonicalXML?: string;
  mediaFormat?: unknown;
  pdf: unknown;
  audio: unknown;
  otherScores?: {
    format: string;
    name: string;
    partId?: string;
    source: unknown;
  }[];
  lyricWork?: unknown;
  editDraft?: unknown;
  revisions?: unknown;
  lyricCorrections?: unknown;
  lyricCorrectionDelivery?: unknown;
  productionReceipts?: unknown;
}
/** Keep originals and authoring evidence, discard derived geometry and app preferences. */
function sourceArchive(value: OldRecord, database: string) {
  const song = { ...value.song } as Partial<Song>;
  delete song.settings;
  delete song.regions;
  delete song.pageCount;
  return {
    id: `${database}:${song.id}`,
    database,
    song,
    canonicalXML: value.canonicalXML,
    mediaFormat: value.mediaFormat,
    pdf: value.pdf,
    audio: value.audio,
    otherScores: value.otherScores?.map((s) => ({
      format: s.format,
      name: s.name,
      partId: s.partId,
      source: s.source,
    })),
    lyricWork: value.lyricWork,
    editDraft: value.editDraft,
    revisions: value.revisions,
    lyricCorrections: value.lyricCorrections,
    lyricCorrectionDelivery: value.lyricCorrectionDelivery,
    productionReceipts: value.productionReceipts,
  };
}
function preserveAndClear(tx: IDBTransaction, database: string) {
  const songs = tx.objectStore("songs");
  const cursor = songs.openCursor();
  cursor.onsuccess = () => {
    const item = cursor.result;
    if (!item) return;
    // The retired 16-bar edition was explicitly deleted, including archives.
    if (
      item.value.song?.id !== RETIRED_SCORE_ID ||
      item.value.song?.measures?.length !== 16
    )
      tx.objectStore("sourceFiles").put(sourceArchive(item.value, database));
    item.delete();
    item.continue();
  };
}
function connect(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SCORE_DATABASE, 5);
    request.onupgradeneeded = (event) => {
      const db = request.result,
        tx = request.transaction!;
      if (!db.objectStoreNames.contains("songs"))
        db.createObjectStore("songs", { keyPath: "song.id" });
      if (!db.objectStoreNames.contains("sourceFiles"))
        db.createObjectStore("sourceFiles", { keyPath: "id" });
      if (event.oldVersion > 0) preserveAndClear(tx, SCORE_DATABASE);
      for (const name of ["audioAnalyses", "migrations", "archives"])
        if (db.objectStoreNames.contains(name)) db.deleteObjectStore(name);
      db.createObjectStore("audioAnalyses", { keyPath: "sha256" });
      db.createObjectStore("migrations");
    };
    let blocked = false;
    request.onsuccess = () => {
      const db = request.result;
      if (blocked) {
        db.close();
        return;
      }
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      blocked = true;
      reject(new Error(t("storage.upgradeBlocked")));
    };
  });
}
/** Open only an existing old player DB; aborting creation leaves no empty database. */
function legacyDatabase(): Promise<IDBDatabase | undefined> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("drum-practice-player");
    let missing = false;
    request.onupgradeneeded = () => {
      missing = true;
      request.transaction!.abort();
    };
    request.onerror = () =>
      missing ? resolve(undefined) : reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
async function clearLegacy(db: IDBDatabase) {
  const done = await new Promise((resolve, reject) => {
    const r = db.transaction("migrations").objectStore("migrations").get(RESET);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  if (done) return;
  const legacy = await legacyDatabase();
  try {
    const records: OldRecord[] = legacy?.objectStoreNames.contains("songs")
      ? await new Promise((resolve, reject) => {
          const r = legacy.transaction("songs").objectStore("songs").getAll();
          r.onsuccess = () => resolve(r.result);
          r.onerror = () => reject(r.error);
        })
      : [];
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(["sourceFiles", "migrations"], "readwrite");
      for (const record of records)
        if (
          record.song?.id !== RETIRED_SCORE_ID ||
          record.song?.measures?.length !== 16
        )
          tx.objectStore("sourceFiles").put(
            sourceArchive(record, "drum-practice-player"),
          );
      tx.objectStore("migrations").put(true, RESET);
      tx.oncomplete = () => resolve();
      tx.onerror = tx.onabort = () => reject(tx.error);
    });
  } finally {
    legacy?.close();
  }
  if (legacy) {
    // Originals are already retained in sourceFiles. A still-open old app may
    // postpone deletion until it closes; it never gets imported into the new library.
    indexedDB.deleteDatabase("drum-practice-player");
  }
}
export async function openScoreDatabase(): Promise<IDBDatabase> {
  const db = await connect();
  try {
    await clearLegacy(db);
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}
