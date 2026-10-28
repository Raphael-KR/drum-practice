import "fake-indexeddb/auto";
import { expect, it, vi } from "vitest";
import JSZip from "jszip";
import { defaults, type Song } from "../../src/model/model";
import type { RecordData } from "../../src/model/record";
import {
  readScorePackage,
  createScorePackage,
} from "../../src/modules/library/score-package";
import {
  createPracticeFile,
  readPracticeFile,
  bindPracticeAudio,
} from "../../src/modules/library/practice-file";
import {
  savePracticeRecord,
  loadPracticeRecord,
  importPracticeRecord,
} from "../../src/platform/storage/practice-library";
import { saveRecord, allRecords } from "../../src/platform/storage/storage";
import { openScoreDatabase } from "../../src/platform/storage/score-database";
import {
  exportLibrary,
  importLibrary,
} from "../../src/modules/library/library-backup";
import { createMetronomeCorrectionNotice } from "../../src/modules/library/metronome-corrections";

function fixture(audioOnly = false): RecordData {
  const song: Song = {
    version: 1,
    id: crypto.randomUUID(),
    title: "metronome",
    bpm: 120,
    firstBeat: 0,
    audioName: "a.mp3",
    pdfName: audioOnly ? "" : "s.pdf",
    pageCount: audioOnly ? 0 : 1,
    regions: audioOnly
      ? []
      : [{ id: "r", page: 0, x: 0, y: 0, w: 1, h: 1, beatXs: [] }],
    measures: [
      {
        id: "m",
        label: "1",
        regionId: audioOnly ? "" : "r",
        start: 0,
        end: 2,
        beats: 4,
        denominator: 4,
      },
    ],
    settings: {
      ...defaults(),
      click: false,
      clickDivision: 8,
      musicVolume: 0.3,
      clickVolume: 0.7,
    },
    lyrics: [],
    loops: [],
    markers: [],
    ...(audioOnly
      ? {
          audioPractice: {
            duration: 2,
            beats: 4,
            denominator: 4,
            peaks: [0, 1],
          },
        }
      : {}),
  };
  return {
    song,
    audio: new Blob([song.id], { type: "audio/mpeg" }),
    pdf: new Blob(["pdf"], { type: "application/pdf" }),
    pages: audioOnly ? [] : [new Blob(["page"], { type: "image/png" })],
  };
}
it("preserves eighth/off through package, editor save, playback save, and library backup; new imports use quarter/on", async () => {
  const record = fixture();
  const loaded = await readScorePackage(await createScorePackage(record));
  expect(loaded.song.settings).toEqual(record.song.settings);
  await saveRecord(loaded);
  expect(
    (await allRecords()).find((r) => r.song.id === record.song.id)!.song
      .settings,
  ).toEqual(record.song.settings);
  await savePracticeRecord(loaded);
  expect((await loadPracticeRecord(record.song.id))!.song.settings).toEqual(
    record.song.settings,
  );
  const bytes = await exportLibrary([loaded]);
  expect(
    (await importLibrary(bytes.buffer as ArrayBuffer)).records[0].song.settings,
  ).toEqual(record.song.settings);
  const imported = await importPracticeRecord(loaded);
  expect(imported.record.song.settings).toMatchObject({
    click: true,
    clickDivision: 4,
    musicVolume: 0.5,
    clickVolume: 1,
  });
  expect(record.song.settings.clickDivision).toBe(8);
});
it("corrects only an invalid package division before validation, with one report and unchanged original bytes", async () => {
  const record = fixture(),
    zip = await JSZip.loadAsync(
      await (await createScorePackage(record)).arrayBuffer(),
    );
  const manifest = JSON.parse(await zip.file("manifest.json")!.async("string"));
  manifest.song.settings.clickDivision = "8";
  zip.file("manifest.json", JSON.stringify(manifest));
  const file = new Blob([
    new Uint8Array(await zip.generateAsync({ type: "uint8array" })),
  ]);
  const before = await file.arrayBuffer(),
    report = vi.fn();
  const loaded = await readScorePackage(file, report);
  expect(loaded.song).toEqual({
    ...record.song,
    settings: { ...record.song.settings, clickDivision: 4 },
  });
  expect(report).toHaveBeenCalledOnce();
  expect(report.mock.calls[0][0]).toHaveLength(1);
  expect(await file.arrayBuffer()).toEqual(before);
  manifest.song.bpm = 0;
  zip.file("manifest.json", JSON.stringify(manifest));
  await expect(
    readScorePackage(
      new Blob([
        new Uint8Array(await zip.generateAsync({ type: "uint8array" })),
      ]),
    ),
  ).rejects.toThrow();
});
it("normalizes saved records only in the read copy, including old missing fields without a warning", async () => {
  const record = fixture();
  await savePracticeRecord(record);
  const db = await openScoreDatabase();
  const rawRecord = await new Promise<RecordData>((resolve) => {
    const request = db
      .transaction("songs")
      .objectStore("songs")
      .get(record.song.id);
    request.onsuccess = () => resolve(request.result);
  });
  const corrupt = {
    ...rawRecord,
    song: {
      ...rawRecord.song,
      settings: { ...rawRecord.song.settings, clickDivision: 16 },
    },
  };
  await new Promise<void>((resolve) => {
    const tx = db.transaction("songs", "readwrite");
    tx.objectStore("songs").put(corrupt);
    tx.oncomplete = () => resolve();
  });
  const report = vi.fn(),
    read = (await loadPracticeRecord(record.song.id, report))!;
  expect(read.song.settings).toEqual({
    ...record.song.settings,
    clickDivision: 4,
  });
  expect(report.mock.calls[0][0]).toHaveLength(1);
  const stored = await new Promise<RecordData>((resolve) => {
    const request = db
      .transaction("songs")
      .objectStore("songs")
      .get(record.song.id);
    request.onsuccess = () => resolve(request.result);
  });
  expect(stored.song.settings.clickDivision).toBe(16);
  db.close();
  await savePracticeRecord(read);
  expect(
    (await loadPracticeRecord(record.song.id))!.song.settings.clickDivision,
  ).toBe(4);
  delete record.song.settings.clickDivision;
  await savePracticeRecord(record);
  report.mockClear();
  expect(
    (await loadPracticeRecord(record.song.id, report))!.song.settings
      .clickDivision,
  ).toBeUndefined();
  expect(report.mock.calls[0][0]).toEqual([]);
});
it("restores a mixed practice backup with one aggregated correction and retains other settings and songs", async () => {
  const records = [fixture(true), fixture(true), fixture(true)];
  const data = JSON.parse(await (await createPracticeFile(records)).text());
  delete data.records[0].song.settings.clickDivision;
  data.records[1].song.settings.clickDivision = null;
  const file = new Blob([JSON.stringify(data)]),
    report = vi.fn();
  const read = await readPracticeFile(file, report);
  expect(report).toHaveBeenCalledOnce();
  expect(report.mock.calls[0][0]).toHaveLength(1);
  expect(read.records.map((r) => r.song.settings.clickDivision)).toEqual([
    undefined,
    4,
    8,
  ]);
  for (let i = 0; i < records.length; i++) {
    const restored = await bindPracticeAudio(read.records[i], records[i].audio);
    expect(restored.song.settings.click).toBe(false);
    expect(restored.song.settings.musicVolume).toBe(0.3);
  }
  expect(
    JSON.parse(await file.text()).records[1].song.settings.clickDivision,
  ).toBeNull();
  const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const notice = createMetronomeCorrectionNotice();
    notice.collect(report.mock.calls[0][0]);
    expect(notice.message()).toContain("4분으로 보정");
    expect(notice.message()).toBe("");
    expect(warning).toHaveBeenCalledOnce();
  } finally {
    warning.mockRestore();
  }
  data.records[1].song.settings.musicVolume = 2;
  await expect(
    readPracticeFile(new Blob([JSON.stringify(data)])),
  ).rejects.toThrow();
});
