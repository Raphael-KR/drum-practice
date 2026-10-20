import "fake-indexeddb/auto";
import { afterEach, expect, it, vi } from "vitest";
import {
  createPracticeFile,
  readPracticeFile,
  bindPracticeAudio,
  matchPracticeAudio,
} from "../../src/modules/library/practice-file";
import {
  audioMeasures,
  followAudioTempo,
  setAudioBarOne,
  ensureAudioBeatTracking,
} from "../../src/modules/audio/audio-practice";
import { defaults, validateSong, type Song } from "../../src/model/model";
import {
  savePracticeRecord,
  importPracticeRecord,
  assertNewPracticeAudio,
  addPracticeRecords,
  loadPracticeRecord,
  removePracticeRecord,
} from "../../src/platform/storage/practice-library";
import type { RecordData } from "../../src/model/record";
function fixture(): RecordData {
  const song: Song = {
    version: 1,
    id: crypto.randomUUID(),
    title: "붉은 노을 연습",
    artist: "YB",
    bpm: 120,
    firstBeat: 0.2,
    audioName: "original.mp3",
    pdfName: "",
    pageCount: 0,
    regions: [],
    lyrics: [],
    markers: [{ id: "marker", name: "후렴", time: 2.23 }],
    markerSlots: ["", "marker"],
    loops: [{ id: "loop", name: "반복", start: 1.2, end: 4.1 }],
    repeatSlots: ["loop"],
    settings: {
      ...defaults(),
      musicVolume: 0.38,
      clickVolume: 0.72,
      rate: 0.8,
      tempoMode: "practice",
      position: 2.5,
    },
    audioPractice: {
      duration: 6,
      beats: 4,
      denominator: 4,
      peaks: [0, 0.4, 1],
    },
    measures: audioMeasures(6, 120, 0.2, 4, 4),
  };
  return {
    song,
    audio: new Blob(["original audio bytes"], { type: "audio/mpeg" }),
    pdf: new Blob(),
    pages: [],
  };
}
afterEach(() => vi.unstubAllGlobals());
it("exports only information, preserves manual corrections, mix, markers, loop slots and audio hash", async () => {
  const record = fixture();
  record.song = setAudioBarOne(record.song, 1.1);
  record.song.settings = {
    ...defaults(),
    musicVolume: 0.38,
    clickVolume: 0.72,
    rate: 0.8,
    tempoMode: "practice",
    position: 2.5,
  };
  const original = structuredClone(record.song);
  const file = await createPracticeFile([record]),
    text = await file.text();
  expect(text).not.toContain("original audio bytes");
  expect(Object.keys(JSON.parse(text).records[0].audio).sort()).toEqual([
    "name",
    "sha256",
    "size",
  ]);
  const data = await readPracticeFile(file);
  expect(data.records[0].song).toEqual(original);
  expect(data.records[0].audio.sha256).toMatch(/^[a-f0-9]{64}$/);
  const restored = await bindPracticeAudio(data.records[0], record.audio);
  expect(restored.song.id).not.toBe(original.id);
  expect({ ...restored.song, id: original.id }).toEqual(original);
  expect(restored.audio).toBe(record.audio);
  expect(record.song).toEqual(original);
});
it("restores variable beat timings exactly and suppresses automatic analysis on later opens", async () => {
  const record = fixture();
  record.song.audioPractice!.beatTimes = [
    0.2, 0.69, 1.21, 1.7, 2.22, 2.73, 3.22, 3.75, 4.25, 4.74, 5.26, 5.75,
  ];
  record.song = followAudioTempo(record.song);
  record.song = setAudioBarOne(record.song, 1.21);
  const data = await readPracticeFile(await createPracticeFile([record]));
  const restored = await bindPracticeAudio(data.records[0], record.audio);
  await savePracticeRecord(record);
  await savePracticeRecord(restored);
  try {
    const saved = (await loadPracticeRecord(restored.song.id))!;
    expect(saved.song).toEqual(restored.song);
    expect(saved.preserveAudioTiming).toBe(true);
    const decoder = vi.fn(() => {
      throw Error("Unexpected analysis");
    });
    vi.stubGlobal("AudioContext", decoder);
    expect(await ensureAudioBeatTracking(saved)).toBe(saved);
    expect(decoder).not.toHaveBeenCalled();
    expect((await loadPracticeRecord(record.song.id))!.song).toEqual(
      record.song,
    );
  } finally {
    await removePracticeRecord(record.song.id);
    await removePracticeRecord(restored.song.id);
  }
});
it("preserves manually fixed timing without beatTimes instead of auto-upgrading it", async () => {
  const record = fixture();
  const restored = await bindPracticeAudio(
    (await readPracticeFile(await createPracticeFile([record]))).records[0],
    record.audio,
  );
  const decoder = vi.fn(() => {
    throw Error("Unexpected analysis");
  });
  vi.stubGlobal("AudioContext", decoder);
  expect(await ensureAudioBeatTracking(restored)).toBe(restored);
  expect(decoder).not.toHaveBeenCalled();
});
it("rejects a wrong audio file even when size and filename match", async () => {
  const record = fixture(),
    data = await readPracticeFile(await createPracticeFile([record]));
  await expect(
    bindPracticeAudio(data.records[0], new Blob(["different audio byte"])),
  ).rejects.toThrow("다른 파일");
  await expect(
    bindPracticeAudio(data.records[0], new Blob(["short"])),
  ).rejects.toThrow("다른 파일");
});
it("rejects malformed JSON, unknown format/version, broken timing and dangling slots", async () => {
  const base = await readPracticeFile(await createPracticeFile([fixture()]));
  for (const mutate of [
    (d: any) => (d.version = 2),
    (d: any) => (d.format = "drumscore"),
    (d: any) => delete d.records[0].song.audioPractice,
    (d: any) => (d.records[0].song.measures[0].start = 1),
    (d: any) => (d.records[0].song.audioPractice.beatTimes = [1, 0.5]),
    (d: any) => (d.records[0].song.markerSlots = ["missing"]),
    (d: any) => (d.records[0].audio.sha256 = "invalid"),
    (d: any) => (d.records[0].audio.size = 0),
  ]) {
    const data = structuredClone(base);
    mutate(data);
    await expect(
      readPracticeFile(new Blob([JSON.stringify(data)])),
    ).rejects.toThrow();
  }
  await expect(readPracticeFile(new Blob(["{"]))).rejects.toThrow();
  await expect(
    readPracticeFile(new Blob([new Uint8Array(64 * 1024 * 1024 + 1)])),
  ).rejects.toThrow();
});
it("snapshots before async hashing so later playback changes do not leak into the saved file", async () => {
  const record = fixture(),
    before = structuredClone(record.song);
  const result = createPracticeFile([record]);
  record.song.markers[0].time = 5;
  record.song.settings.position = 5;
  expect((await readPracticeFile(await result)).records[0].song).toEqual(
    before,
  );
  validateSong(before);
});
it("stores multiple audio entries in one JSON and matches renamed originals by hash", async () => {
  const a = fixture(),
    b = fixture();
  b.song.title = "두번째 곡";
  b.audio = new Blob(["second audio bytes"]);
  const data = await readPracticeFile(await createPracticeFile([a, b]));
  expect(data.records.map((r) => r.song.title)).toEqual([
    a.song.title,
    b.song.title,
  ]);
  const matches = await matchPracticeAudio(data.records, [
    b.audio,
    new Blob(["wrong"]),
    a.audio,
  ]);
  expect(matches.size).toBe(2);
  const restored = [];
  for (const entry of data.records)
    restored.push(
      await bindPracticeAudio(entry, matches.get(entry.audio.sha256)!),
    );
  await addPracticeRecords(restored);
  try {
    for (let i = 0; i < 2; i++)
      expect((await loadPracticeRecord(restored[i].song.id))!.song).toEqual(
        restored[i].song,
      );
  } finally {
    for (const record of restored) await removePracticeRecord(record.song.id);
  }
});
it("atomic batch restore leaves no partial records on a conflicting ID", async () => {
  const existing = fixture(),
    first = fixture(),
    collision = {
      ...fixture(),
      song: { ...existing.song, title: "must not overwrite" },
    };
  first.audio = new Blob(["first distinct audio"]);
  collision.audio = new Blob(["collision distinct audio"]);
  await savePracticeRecord(existing);
  try {
    await expect(addPracticeRecords([first, collision])).rejects.toBeDefined();
    expect(await loadPracticeRecord(first.song.id)).toBeUndefined();
    expect((await loadPracticeRecord(existing.song.id))!.song.title).toBe(
      existing.song.title,
    );
  } finally {
    await removePracticeRecord(existing.song.id);
    await removePracticeRecord(first.song.id);
  }
});
it("rejects empty exports and duplicate record identities", async () => {
  await expect(createPracticeFile([])).rejects.toThrow("없습니다");
  const record = fixture();
  await expect(createPracticeFile([record, record])).rejects.toThrow();
});

it("rejects renamed audio and restored duplicates without changing existing corrections", async () => {
  const existing = fixture();
  await savePracticeRecord(existing);
  const duplicate = fixture();
  duplicate.song.audioName = "renamed.mp3";
  try {
    await expect(assertNewPracticeAudio(new Blob([await existing.audio.arrayBuffer()]))).rejects.toThrow("이미 내 음원 목록");
    await expect(importPracticeRecord(duplicate)).rejects.toThrow("이미 내 음원 목록");
    const fresh = fixture(); fresh.audio = new Blob(["unique batch audio"]);
    await expect(addPracticeRecords([fresh, duplicate])).rejects.toThrow("이미 내 음원 목록");
    expect(await loadPracticeRecord(fresh.song.id)).toBeUndefined();
    expect(await loadPracticeRecord(duplicate.song.id)).toBeUndefined();
    expect((await loadPracticeRecord(existing.song.id))!.song).toEqual(existing.song);
  } finally { await removePracticeRecord(existing.song.id); }
});
it("rejects repeated audio within a backup batch before saving anything", async () => {
  const a = fixture(), b = fixture();
  await expect(addPracticeRecords([a, b])).rejects.toThrow("이미 내 음원 목록");
  expect(await loadPracticeRecord(a.song.id)).toBeUndefined();
  expect(await loadPracticeRecord(b.song.id)).toBeUndefined();
});
it("allows different bytes with the same filename and audio already in a score package", async () => {
  const score = fixture(), a = fixture(), b = fixture();
  delete score.song.audioPractice;
  score.song.pageCount = 1;
  score.song.regions = [{ id: "r", page: 0, x: 0, y: 0, w: 1, h: 1, beatXs: [] }];
  score.song.measures.forEach(m => m.regionId = "r");
  score.pages = [new Blob(["page"])];
  b.audio = new Blob(["different recording"]);
  await savePracticeRecord(score);
  try {
    await importPracticeRecord(a);
    await importPracticeRecord(b);
    expect(await loadPracticeRecord(a.song.id)).toBeDefined();
    expect(await loadPracticeRecord(b.song.id)).toBeDefined();
  } finally { for (const r of [score, a, b]) await removePracticeRecord(r.song.id); }
});
it("serializes simultaneous imports so only one identical audio is registered", async () => {
  const a = fixture(), b = fixture();
  try {
    const results = await Promise.allSettled([importPracticeRecord(a), importPracticeRecord(b)]);
    expect(results.map(r => r.status)).toEqual(["fulfilled", "rejected"]);
    expect(await loadPracticeRecord(b.song.id)).toBeUndefined();
  } finally { for (const r of [a, b]) await removePracticeRecord(r.song.id); }
});

it("adds an explicitly approved duplicate as a new entry without replacing existing practice state", async () => {
  const existing = fixture(), duplicate = fixture();
  await savePracticeRecord(existing);
  try {
    await importPracticeRecord(duplicate, { allowDuplicateAudio: true });
    expect((await loadPracticeRecord(existing.song.id))!.song).toEqual(existing.song);
    expect((await loadPracticeRecord(duplicate.song.id))!.song.id).toBe(duplicate.song.id);
  } finally { for (const r of [existing, duplicate]) await removePracticeRecord(r.song.id); }
});
