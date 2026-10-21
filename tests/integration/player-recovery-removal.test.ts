import { IDBFactory } from "fake-indexeddb";
import { it, expect, vi } from "vitest";
import { openScoreDatabase } from "../../src/platform/storage/score-database";
it("upgrades both v2 databases, deletes all recovery copies and preserves live scores and editor history", async () => {
  vi.stubGlobal("indexedDB", new IDBFactory());
  const live = {
    song: { id: "live", title: "Keep", measures: [] },
    revisions: [{ id: "editor-history" }],
    editDraft: { id: "editor-draft" },
  };
  try {
    for (const name of ["drum-practice", "drum-practice-player"]) {
      const db = await new Promise<IDBDatabase>((resolve) => {
        const r = indexedDB.open(name, 2);
        r.onupgradeneeded = () => {
          r.result.createObjectStore("songs", { keyPath: "song.id" });
          r.result.createObjectStore("archives", { autoIncrement: true });
          if (name === "drum-practice")
            r.result.createObjectStore("migrations");
        };
        r.onsuccess = () => resolve(r.result);
      });
      await new Promise<void>((resolve) => {
        const t = db.transaction(["songs", "archives"], "readwrite");
        t.objectStore("songs").put(live);
        t.objectStore("archives").add({
          record: { song: { id: "deleted-score" } },
          media: "old audio",
        });
        t.oncomplete = () => resolve();
      });
      db.close();
    }
    (await openScoreDatabase()).close();
    for (const name of ["drum-practice", "drum-practice-player"]) {
      const db = await new Promise<IDBDatabase>((resolve) => {
        const r = indexedDB.open(name);
        r.onsuccess = () => resolve(r.result);
      });
      expect(db.version).toBe(name === "drum-practice" ? 4 : 3);
      expect(db.objectStoreNames.contains("archives")).toBe(false);
      const rows = await new Promise<any[]>((resolve) => {
        const r = db.transaction("songs").objectStore("songs").getAll();
        r.onsuccess = () => resolve(r.result);
      });
      expect(rows).toEqual([live]);
      db.close();
    }
    (await openScoreDatabase()).close();
  } finally {
    vi.unstubAllGlobals();
  }
});
