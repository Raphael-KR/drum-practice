import type { Song } from "../../model/model";
// Migration only reads song identity and copies the rest of each stored record unchanged.
type MigrationRecord = { song: Pick<Song, "id"> };
import { t } from "../../shared/i18n/i18n";
/** Both local apps own one score library on the same origin. */
export const SCORE_DATABASE = "drum-practice";
const MIGRATION = "player-library-v1";
export const RETIRED_SCORE_ID = "tom-moving-original-v1";
/** User explicitly retired the 16-bar edition, including recoverable archives. */
async function purgeRetiredScore(db: IDBDatabase): Promise<void> {
  const stores = ["songs"].filter((name) => db.objectStoreNames.contains(name));
  if (!stores.length) return;
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(stores, "readwrite");
    let failure: Error | undefined;
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(failure ?? tx.error);
    for (const name of stores) {
      const request = tx.objectStore(name).openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        const record = cursor.value;
        if (record?.song?.id === RETIRED_SCORE_ID) {
          if (record.song.measures?.length !== 16) {
            failure = new Error(
              "Retired score ID has unexpected measure count",
            );
            tx.abort();
            return;
          }
          cursor.delete();
        }
        cursor.continue();
      };
    }
  });
}
function connect(name: string, version?: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request =
      version === undefined
        ? indexedDB.open(name)
        : indexedDB.open(name, version);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("songs"))
        db.createObjectStore("songs", { keyPath: "song.id" });
      // User removed playback recovery copies. Schema upgrade deletes all old copies.
      if (db.objectStoreNames.contains("archives"))
        db.deleteObjectStore("archives");
      if (name === SCORE_DATABASE) {
        if (!db.objectStoreNames.contains("audioAnalyses"))
          db.createObjectStore("audioAnalyses", { keyPath: "sha256" });
        if (!db.objectStoreNames.contains("migrations"))
          db.createObjectStore("migrations");
      }
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
function values(db: IDBDatabase, store: string): Promise<MigrationRecord[]> {
  if (!db.objectStoreNames.contains(store)) return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    const request = db.transaction(store).objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function openScoreDatabase(): Promise<IDBDatabase> {
  const db = await connect(SCORE_DATABASE, 4);
  try {
    const migrated = await new Promise((resolve, reject) => {
      const r = db
        .transaction("migrations")
        .objectStore("migrations")
        .get(MIGRATION);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    if (migrated) {
      await purgeRetiredScore(db);
      const legacy = await connect("drum-practice-player", 3);
      try {
        await purgeRetiredScore(legacy);
      } finally {
        legacy.close();
      }
      return db;
    }
    const legacy = await connect("drum-practice-player", 3);
    let songs: MigrationRecord[];
    try {
      await purgeRetiredScore(legacy);
      songs = await values(legacy, "songs");
    } finally {
      legacy.close();
    }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(["songs", "migrations"], "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () =>
        reject(tx.error ?? new Error("Score library migration aborted"));
      // Recheck under the write transaction, so simultaneous app opens migrate once.
      const marker = tx.objectStore("migrations").get(MIGRATION);
      marker.onsuccess = () => {
        if (marker.result) return;
        for (const record of songs) {
          const current = tx.objectStore("songs").get(record.song.id);
          current.onsuccess = () => {
            if (!current.result) tx.objectStore("songs").put(record);
          };
        }
        tx.objectStore("migrations").put(true, MIGRATION);
      };
    });
    await purgeRetiredScore(db);
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}
