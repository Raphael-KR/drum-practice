import { IDBFactory } from "fake-indexeddb";
import { it, expect, vi } from "vitest";
import {
  openScoreDatabase,
  RETIRED_SCORE_ID,
} from "../../src/platform/storage/score-database";

function request<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
function completed(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(tx.error);
  });
}
it("resets old libraries once, preserving sources and editing evidence outside active songs", async () => {
  vi.stubGlobal("indexedDB", new IDBFactory());
  const live = {
    song: {
      id: "live",
      title: "Keep",
      measures: [],
      regions: [{ id: "derived" }],
      pageCount: 1,
      settings: { uniformSpacing: true },
    },
    canonicalXML: "<score-partwise/>",
    pdf: "original PDF bytes",
    audio: "original audio bytes",
    pages: ["derived SVG"],
    otherScores: [
      {
        format: "pdf",
        name: "original",
        source: "PDF bytes",
        pages: ["derived pixels"],
      },
    ],
    lyricWork: { text: "production lyrics" },
    revisions: [{ id: "editor-history" }],
    editDraft: { id: "editor-draft" },
    lyricCorrections: [{ id: "correction" }],
    productionReceipts: [{ id: "receipt" }],
  };
  try {
    for (const name of ["drum-practice", "drum-practice-player"]) {
      const opening = indexedDB.open(name, 2);
      opening.onupgradeneeded = () => {
        opening.result.createObjectStore("songs", { keyPath: "song.id" });
        opening.result.createObjectStore("archives", { autoIncrement: true });
      };
      const db = await request(opening);
      const tx = db.transaction(["songs", "archives"], "readwrite");
      tx.objectStore("songs").put(live);
      tx.objectStore("songs").put({
        song: { id: RETIRED_SCORE_ID, measures: Array(16).fill({}) },
      });
      tx.objectStore("archives").add({ song: { id: "deleted-score" } });
      await completed(tx);
      db.close();
    }
    const db = await openScoreDatabase();
    expect(db.version).toBe(5);
    expect(db.objectStoreNames.contains("archives")).toBe(false);
    expect(
      await request(db.transaction("songs").objectStore("songs").getAll()),
    ).toEqual([]);
    const sources = await request(
      db.transaction("sourceFiles").objectStore("sourceFiles").getAll(),
    );
    expect(sources).toHaveLength(2);
    expect(sources.map((s) => s.database).sort()).toEqual([
      "drum-practice",
      "drum-practice-player",
    ]);
    for (const source of sources) {
      expect(source).toMatchObject({
        song: { id: "live", title: "Keep", measures: [] },
        canonicalXML: live.canonicalXML,
        pdf: live.pdf,
        audio: live.audio,
        lyricWork: live.lyricWork,
        revisions: live.revisions,
        editDraft: live.editDraft,
        lyricCorrections: live.lyricCorrections,
        productionReceipts: live.productionReceipts,
      });
      expect(source.pages).toBeUndefined();
      expect(source.song.regions).toBeUndefined();
      expect(source.song.settings).toBeUndefined();
      expect(source.song.pageCount).toBeUndefined();
      expect(source.otherScores).toEqual([
        {
          format: "pdf",
          name: "original",
          source: "PDF bytes",
          partId: undefined,
        },
      ]);
    }
    expect(
      await request(
        db
          .transaction("migrations")
          .objectStore("migrations")
          .get("canonical-v3"),
      ),
    ).toBe(true);
    const current = { song: { id: "new-current", title: "New score" } };
    const tx = db.transaction("songs", "readwrite");
    tx.objectStore("songs").put(current);
    await completed(tx);
    db.close();
    await vi.waitFor(async () => {
      expect((await indexedDB.databases()).map((d) => d.name)).not.toContain(
        "drum-practice-player",
      );
    });
    const reopened = await openScoreDatabase();
    expect(
      await request(
        reopened.transaction("songs").objectStore("songs").getAll(),
      ),
    ).toEqual([current]);
    expect(
      await request(
        reopened.transaction("sourceFiles").objectStore("sourceFiles").getAll(),
      ),
    ).toEqual(sources);
    reopened.close();
  } finally {
    vi.unstubAllGlobals();
  }
});
