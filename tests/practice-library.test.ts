import "fake-indexeddb/auto";
import { describe, it, expect, vi, afterEach } from "vitest";
import { defaults, type Song } from "../src/model";
import type { RecordData } from "../src/storage";
import {
  importPracticeRecord,
  loadPracticeRecord,
  savePracticeRecord,
  savePracticeCanonicalMetadata,
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
    const r = indexedDB.open("drum-practice");
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
    expect(loaded.song.settings).toMatchObject({ musicVolume: .5, clickVolume: 1, click: true });
    loaded.song.settings.musicVolume = .27;
    loaded.song.settings.clickVolume = .64;
    loaded.song.settings.click = false;
    await savePracticeRecord(loaded);
    expect((await loadPracticeRecord(input.song.id))!.song.settings).toMatchObject({ musicVolume: .27, clickVolume: .64, click: false });
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
  it("directly replaces the same ID including changed structure and uses incoming practice state", async () => {
    const old = record(); old.song.settings.rate = .8;
    await savePracticeRecord(old);
    const next = record(); next.song.id = old.song.id;
    next.song.measures[1].id = "changed";
    next.audio = new Blob(["new audio"]);
    expect((await importPracticeRecord(next)).status).toBe("replaced");
    const loaded = (await loadPracticeRecord(old.song.id))!;
    expect(loaded.song).toEqual({ ...next.song, settings: { ...next.song.settings, musicVolume: .5, clickVolume: 1, click: true } });
    expect(await loaded.audio.text()).toBe("new audio");
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
  it("atomically preserves the current record if the replacement write fails", async () => {
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
    await expect(importPracticeRecord(next)).rejects.toThrow(
      "quota failure",
    );
    expect((await loadPracticeRecord(old.song.id))!.song).toEqual(old.song);
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

it("permanently deletes a score without a recovery store", async () => {
  const input = record(); await savePracticeRecord(input);
  await removePracticeRecord(input.song.id);
  expect(await loadPracticeRecord(input.song.id)).toBeUndefined();
  const db = await new Promise<IDBDatabase>(resolve => { const r=indexedDB.open("drum-practice");r.onsuccess=()=>resolve(r.result); });
  expect(db.objectStoreNames.contains("archives")).toBe(false); db.close();
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
  state.loops = [{id:"saved-range",name:"1~1",start:0,end:2}];
  state.repeatSlots = ["", "saved-range", "", "", "", "", "", ""];
  await savePracticeState(state.id, state);
  state.scoreFormat = "musicxml";
  await savePracticeState(state.id, state);
  const loaded = (await loadPracticeRecord(state.id))!;
  expect(loaded.song.pdfName).toBe("score.musicxml");
  expect(loaded.song.regions[0].id).toBe("svg-region");
  expect(loaded.song.measures[0].regionId).toBe("svg-region");
  expect(loaded.song.settings.position).toBe(2);
  expect(loaded.song.repeatSlots).toEqual(state.repeatSlots);
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

it("adds canonical metadata without replacing practice state and refuses a stale XML update", async () => {
  const r = record(); r.canonicalXML = "original";
  await savePracticeRecord(r);
  const state = structuredClone(r.song); state.settings.rate = .75;
  await savePracticeState(r.song.id, state);
  expect(await savePracticeCanonicalMetadata(r.song.id, "original", "upgraded")).toBe(true);
  const loaded = await loadPracticeRecord(r.song.id);
  expect(loaded!.canonicalXML).toBe("upgraded");
  expect(loaded!.song.settings.rate).toBe(.75);
  expect(loaded!.song.measures).toEqual(r.song.measures);
  expect(await savePracticeCanonicalMetadata(r.song.id, "original", "stale")).toBe(false);
  expect((await loadPracticeRecord(r.song.id))!.canonicalXML).toBe("upgraded");
});
