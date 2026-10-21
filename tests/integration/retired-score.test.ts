import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import {
  openScoreDatabase,
  RETIRED_SCORE_ID,
} from "../../src/platform/storage/score-database";
function connection(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(name);
    r.onupgradeneeded = () => {
      for (const store of ["songs", "archives"])
        if (!r.result.objectStoreNames.contains(store))
          r.result.createObjectStore(store, {
            keyPath: store === "songs" ? "song.id" : undefined,
            autoIncrement: store === "archives",
          });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
it("permanently purges 16-bar live records and backups in both databases while preserving 28/96", async () => {
  (await openScoreDatabase()).close();
  const expected = [
    {
      song: {
        id: "tom-moving-video-v2",
        measures: Array(28).fill({}),
        artist: "Portland",
      },
    },
    {
      song: {
        id: "preplay-hand-warmup-v1",
        measures: Array(96).fill({}),
        artist: "SoCal",
      },
    },
  ];
  for (const name of ["drum-practice", "drum-practice-player"]) {
    const db = await connection(name);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(
        Array.from(db.objectStoreNames).filter(
          (n) => n === "songs" || n === "archives",
        ),
        "readwrite",
      );
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      for (const record of [
        { song: { id: RETIRED_SCORE_ID, measures: Array(16).fill({}) } },
        ...expected,
      ]) {
        tx.objectStore("songs").put(record);
        if (db.objectStoreNames.contains("archives"))
          tx.objectStore("archives").add({ record });
      }
    });
    db.close();
  }
  (await openScoreDatabase()).close();
  for (const name of ["drum-practice", "drum-practice-player"]) {
    const db = await connection(name);
    const read = (store: string) =>
      new Promise<unknown[]>((resolve, reject) => {
        const r = db.transaction(store).objectStore(store).getAll();
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
    expect(await read("songs")).toEqual(
      [...expected].sort((a, b) => a.song.id.localeCompare(b.song.id)),
    );
    expect(db.objectStoreNames.contains("archives")).toBe(false);
    db.close();
  }
  (await openScoreDatabase()).close();
});
it("does not accept the retired edition again", async () => {
  const { savePracticeRecord } =
    await import("../../src/platform/storage/practice-library");
  await expect(
    savePracticeRecord({
      song: { id: RETIRED_SCORE_ID },
      pages: [],
    } as unknown as import("../../src/model/record").RecordData),
  ).rejects.toThrow("16마디");
});
