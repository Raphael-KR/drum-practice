import { t } from "./i18n";
/** Both local apps own one score library on the same origin. */
export const SCORE_DATABASE = "drum-practice";
const MIGRATION = "player-library-v1";
function connect(name: string, version?: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = version === undefined ? indexedDB.open(name) : indexedDB.open(name, version);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("songs")) db.createObjectStore("songs", { keyPath: "song.id" });
      if (name === SCORE_DATABASE) {
        if (!db.objectStoreNames.contains("archives")) db.createObjectStore("archives", { autoIncrement: true });
        if (!db.objectStoreNames.contains("migrations")) db.createObjectStore("migrations");
      }
    };
    let blocked = false;
    request.onsuccess = () => {
      const db = request.result;
      if (blocked) { db.close(); return; }
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => { blocked = true; reject(new Error(t("storage.upgradeBlocked"))); };
  });
}
function values(db: IDBDatabase, store: string): Promise<any[]> {
  if (!db.objectStoreNames.contains(store)) return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    const request = db.transaction(store).objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function openScoreDatabase(): Promise<IDBDatabase> {
  const db = await connect(SCORE_DATABASE, 2);
  try {
    const migrated = await new Promise((resolve, reject) => {
      const r = db.transaction("migrations").objectStore("migrations").get(MIGRATION);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    if (migrated) return db;
    const legacy = await connect("drum-practice-player");
    let songs: any[], archives: any[];
    try { [songs, archives] = await Promise.all([values(legacy, "songs"), values(legacy, "archives")]); }
    finally { legacy.close(); }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(["songs", "archives", "migrations"], "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("Score library migration aborted"));
      // Recheck under the write transaction, so simultaneous app opens migrate once.
      const marker = tx.objectStore("migrations").get(MIGRATION);
      marker.onsuccess = () => {
        if (marker.result) return;
        for (const record of songs) {
          const current = tx.objectStore("songs").get(record.song.id);
          current.onsuccess = () => {
            if (!current.result) tx.objectStore("songs").put(record);
            else tx.objectStore("archives").add({ archivedAt: Date.now(), source: "legacy-player-conflict", record });
          };
        }
        for (const archive of archives) tx.objectStore("archives").add(archive);
        tx.objectStore("migrations").put(true, MIGRATION);
      };
    });
    return db;
  } catch (error) { db.close(); throw error; }
}
