import "fake-indexeddb/auto";
import { describe, it, expect, vi, afterEach } from "vitest";
import { defaults, type Song } from "../src/model";
import type { RecordData } from "../src/storage";
import {
  importPracticeRecord,
  listPracticeArchives,
  restorePracticeArchive,
  loadPracticeRecord,
  savePracticeRecord,
  savePracticeState,
  listPracticeRecords,
  removePracticeRecord,
} from "../src/practice-library";
let sequence = 0;
function record(): RecordData {
  const song: Song = {
    version: 1,
    id: `practice-${++sequence}`,
    title: "Original",
    bpm: 120,
    firstBeat: 1,
    pageCount: 1,
    pdfName: "score.pdf",
    audioName: "audio.wav",
    settings: defaults(),
    lyrics: [],
    markers: [],
    loops: [],
    regions: [{ id: "r", page: 0, x: 0, y: 0, w: 1, h: 1, beatXs: [] }],
    measures: [
      {
        id: "m1",
        label: "1",
        regionId: "r",
        beats: 4,
        denominator: 4,
        start: 1,
        end: 3,
      },
      {
        id: "m2",
        label: "2",
        regionId: "r",
        beats: 4,
        denominator: 4,
        start: 3,
        end: 5,
      },
    ],
  };
  return {
    song,
    pdf: new Blob(["pdf"], { type: "application/pdf" }),
    audio: new Blob(["audio"]),
    pages: [new Blob(["page"])],
  };
}
async function raw(store: string): Promise<any[]> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open("drum-practice-player", 1);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const r = db.transaction(store).objectStore(store).getAll();
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  } finally {
    db.close();
  }
}
afterEach(() => vi.restoreAllMocks());
describe("independent playback library", () => {
  it("stores owned bytes and isolates the authoring database", async () => {
    const input = record();
    expect((await importPracticeRecord(input)).status).toBe("added");
    const loaded = (await loadPracticeRecord(input.song.id))!;
    expect(await loaded.pdf.text()).toBe("pdf");
    expect(loaded.pdf.type).toBe("application/pdf");
    expect(
      (await raw("songs")).find((r) => r.song.id === input.song.id).pdf.bytes,
    ).toBeInstanceOf(ArrayBuffer);
    expect(
      (await listPracticeRecords()).some((r) => r.song.id === input.song.id),
    ).toBe(true);
    await removePracticeRecord(input.song.id);
    expect(await loadPracticeRecord(input.song.id)).toBeUndefined();
  });
  it("updates content while remapping local position markers loops by measure fraction", async () => {
    const old = record();
    old.song.settings.position = 3.5;
    old.song.settings.rate = 0.8;
    old.song.markers = [{ id: "a", name: "Local", time: 2 }];
    old.song.loops = [{ id: "l", name: "Loop", start: 2, end: 4 }];
    await savePracticeRecord(old);
    const incoming = record();
    incoming.song.id = old.song.id;
    incoming.song.title = "Revision";
    incoming.song.firstBeat = 2;
    incoming.song.measures[0].start = 2;
    incoming.song.measures[0].end = 6;
    incoming.song.measures[1].start = 6;
    incoming.song.measures[1].end = 10;
    const before = structuredClone(incoming.song);
    const result = await importPracticeRecord(incoming);
    expect(result.status).toBe("updated");
    expect(result.record.song.title).toBe("Revision");
    expect(result.record.song.settings.position).toBe(7);
    expect(result.record.song.settings.rate).toBe(0.8);
    expect(result.record.song.markers[0].time).toBe(4);
    expect(result.record.song.loops[0]).toMatchObject({ start: 4, end: 8 });
    expect(incoming.song).toEqual(before);
    expect(old.song.settings.position).toBe(3.5);
  });
  it("does not overwrite changed structure until explicit replace and archives all old media", async () => {
    const old = record();
    await savePracticeRecord(old);
    const next = {
      ...old,
      song: structuredClone(old.song),
      audio: new Blob(["new"]),
    };
    next.song.measures[1].id = "different";
    expect((await importPracticeRecord(next)).status).toBe("conflict");
    expect((await loadPracticeRecord(old.song.id))!.song).toEqual(old.song);
    expect((await importPracticeRecord(next, "keep-existing")).status).toBe(
      "kept",
    );
    expect((await importPracticeRecord(next, "replace")).status).toBe(
      "updated",
    );
    const archive = (await raw("archives")).find(
      (a) => a.record.song.id === old.song.id,
    );
    expect(archive.record.song).toEqual(old.song);
    expect(new TextDecoder().decode(archive.record.audio.bytes)).toBe("audio");
  });
  it("preserves saved state when media read fails and continues subsequent writes", async () => {
    const old = record();
    await savePracticeRecord(old);
    const bad = new Blob();
    bad.arrayBuffer = async () => {
      throw Error("unreadable");
    };
    await expect(importPracticeRecord({ ...old, audio: bad })).rejects.toThrow(
      "unreadable",
    );
    expect(await (await loadPracticeRecord(old.song.id))!.audio.text()).toBe(
      "audio",
    );
    await savePracticeRecord({ ...old, song: { ...old.song, title: "next" } });
    expect((await loadPracticeRecord(old.song.id))!.song.title).toBe("next");
  });
  it("atomically rolls back archive and replacement if the replacement write fails", async () => {
    const old = record();
    await savePracticeRecord(old);
    const next = { ...old, song: structuredClone(old.song) };
    next.song.measures[0].beats = 3;
    const original = IDBObjectStore.prototype.put;
    vi.spyOn(IDBObjectStore.prototype, "put").mockImplementation(function (
      this: IDBObjectStore,
      ...args: Parameters<typeof original>
    ) {
      if (this.name === "songs") throw Error("quota failure");
      return original.apply(this, args);
    });
    await expect(importPracticeRecord(next, "replace")).rejects.toThrow(
      "quota failure",
    );
    expect((await loadPracticeRecord(old.song.id))!.song).toEqual(old.song);
    expect(
      (await raw("archives")).some((a) => a.record.song.id === old.song.id),
    ).toBe(false);
  });
  it("snapshots save inputs and serializes rapid writes in invocation order", async () => {
    const old = record();
    const first = savePracticeRecord(old);
    old.song.title = "second";
    const second = savePracticeRecord(old);
    old.song.title = "not saved";
    await Promise.all([first, second]);
    expect((await loadPracticeRecord(old.song.id))!.song.title).toBe("second");
  });
});

it("restores archived versions and retains the version replaced by restoration", async () => {
  const old = record();
  await savePracticeRecord(old);
  const next = { ...old, song: structuredClone(old.song) };
  next.song.measures[0].beats = 3;
  await importPracticeRecord(next, "replace");
  const [archive] = await listPracticeArchives(old.song.id);
  const restored = await restorePracticeArchive(archive.id);
  expect(restored.song).toEqual(old.song);
  expect((await loadPracticeRecord(old.song.id))!.song).toEqual(old.song);
  expect((await listPracticeArchives(old.song.id))[0].record.song).toEqual(
    next.song,
  );
  await removePracticeRecord(old.song.id);
  expect(await loadPracticeRecord(old.song.id)).toBeUndefined();
  const [removed] = await listPracticeArchives(old.song.id);
  await restorePracticeArchive(removed.id);
  expect((await loadPracticeRecord(old.song.id))!.song).toEqual(old.song);
  await expect(restorePracticeArchive("999999")).rejects.toThrow(
    "Practice archive not found",
  );
});

it("saves frequent state and score switches without reading any Blob bytes", async () => {
  const input = record();
  input.otherScores = [
    {
      format: "musicxml",
      name: "score.musicxml",
      source: new Blob(["xml"]),
      pages: [new Blob(["svg"])],
      regions: [{ ...input.song.regions[0], id: "svg-region" }],
      measures: input.song.measures.map((m) => ({
        id: m.id,
        regionId: "svg-region",
        beats: m.beats,
        denominator: m.denominator,
      })),
    },
  ];
  await savePracticeRecord(input);
  const read = vi
    .spyOn(Blob.prototype, "arrayBuffer")
    .mockRejectedValue(new Error("must not read bytes"));
  const state = structuredClone(input.song);
  state.settings.position = 2;
  state.settings.rate = 0.9;
  await savePracticeState(state.id, state);
  state.scoreFormat = "musicxml";
  await savePracticeState(state.id, state);
  const loaded = (await loadPracticeRecord(state.id))!;
  expect(loaded.song.pdfName).toBe("score.musicxml");
  expect(loaded.song.regions[0].id).toBe("svg-region");
  expect(loaded.song.measures[0].regionId).toBe("svg-region");
  expect(loaded.song.settings.position).toBe(2);
  expect(await loaded.pdf.text()).toBe("xml");
  expect(await loaded.pages[0].text()).toBe("svg");
  expect(await loaded.audio.text()).toBe("audio");
  state.scoreFormat = "pdf";
  await savePracticeState(state.id, state);
  const reverted = (await loadPracticeRecord(state.id))!;
  expect(reverted.song.regions[0].id).toBe("r");
  expect(await reverted.pdf.text()).toBe("pdf");
  expect(await reverted.pages[0].text()).toBe("page");
  expect(read).not.toHaveBeenCalled();
});
it("rejects unavailable variants and structural changes without changing saved state", async () => {
  const input = record();
  await savePracticeRecord(input);
  const state = structuredClone(input.song);
  state.scoreFormat = "musicxml";
  await expect(savePracticeState(state.id, state)).rejects.toThrow(
    "variant not found",
  );
  state.scoreFormat = "pdf";
  state.measures[0].beats = 3;
  await expect(savePracticeState(state.id, state)).rejects.toThrow(
    "structure changed",
  );
  expect((await loadPracticeRecord(state.id))!.song).toEqual(input.song);
});
