import { audioFileHash } from "./audio-analysis-cache";
import { openScoreDatabase, RETIRED_SCORE_ID } from "./score-database";
import { t } from "../../shared/i18n/i18n";
import { defaults, validateSong, type Song } from "../../model/model";
import type { RecordData } from "./storage";
import { scoreStructureSignature } from "../../modules/library/score-package";
import { useScore } from "../../modules/score/song-scores";
import { practiceMetadataUpgrade } from "../../modules/library/practice-metadata-upgrade";
import {
  storeMedia,
  restoreMedia,
  storeScoreMedia,
  restoreScoreMedia,
  type StoredMedia,
} from "./stored-media";

type Stored = Omit<RecordData, "pdf" | "audio" | "pages" | "otherScores"> & {
  mediaFormat: "bytes-v1";
  pdf: StoredMedia;
  audio: StoredMedia;
  pages: StoredMedia[];
  otherScores?: (Omit<
    NonNullable<RecordData["otherScores"]>[number],
    "source" | "pages"
  > & { source: StoredMedia; pages: StoredMedia[] })[];
};
export type PracticeImportResult = {
  status: "added" | "replaced";
  record: RecordData;
};
let writes = Promise.resolve();
function queued<T>(work: () => Promise<T>): Promise<T> {
  const result = writes.then(work);
  writes = result.then(
    () => {},
    () => {},
  );
  return result;
}
function snapshot(record: RecordData): RecordData {
  return {
    ...record,
    song: structuredClone(record.song),
    editDraft: structuredClone(record.editDraft),
    revisions: structuredClone(record.revisions),
    pages: [...record.pages],
    otherScores: record.otherScores?.map((score) => ({
      ...score,
      pages: [...score.pages],
      regions: structuredClone(score.regions),
      measures: structuredClone(score.measures),
    })),
  };
}
async function encode(record: RecordData): Promise<Stored> {
  if (record.song.id === RETIRED_SCORE_ID)
    throw new Error(t("library.retiredScore"));
  validateSong(record.song);
  const [media, otherScores] = await Promise.all([
    storeScoreMedia(record),
    Promise.all(
      (record.otherScores ?? []).map(async (score) => ({
        ...score,
        source: await storeMedia(score.source),
        pages: await Promise.all(score.pages.map(storeMedia)),
      })),
    ),
  ]);
  return { ...record, mediaFormat: "bytes-v1", ...media, otherScores };
}
function decode(record: Stored): RecordData {
  if (!("mediaFormat" in record)) return record as RecordData;
  const rest: Omit<Stored, "mediaFormat"> & {
    mediaFormat?: Stored["mediaFormat"];
  } = { ...record };
  delete rest.mediaFormat;
  return {
    ...rest,
    ...restoreScoreMedia(record),
    otherScores: record.otherScores?.map((score) => ({
      ...score,
      source: restoreMedia(score.source),
      pages: score.pages.map(restoreMedia),
    })),
  };
}
const open = openScoreDatabase;
async function read<T>(
  work: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = work(db.transaction("songs").objectStore("songs"));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}
export async function listPracticeRecords(): Promise<RecordData[]> {
  const records = (await read<Stored[]>((store) => store.getAll())).map(decode);
  for (let i = 0; i < records.length; i++)
    records[i] = await upgradePracticeMetadata(records[i]);
  return records;
}
async function upgradePracticeMetadata(
  record: RecordData,
): Promise<RecordData> {
  const next = await practiceMetadataUpgrade(record);
  if (!next) return record;
  return queued(async () => {
    let updated: RecordData = record;
    await change((tx) => {
      const store = tx.objectStore("songs"),
        request = store.get(record.song.id);
      request.onsuccess = () => {
        const stored = request.result as Stored | undefined;
        if (
          !stored ||
          stored.canonicalXML !== record.canonicalXML ||
          stored.song.title !== record.song.title ||
          stored.song.artist !== record.song.artist
        )
          return;
        const song = {
          ...stored.song,
          title: next.song.title,
          originalTitle: next.song.originalTitle,
          artist: next.song.artist,
        };
        const revised = { ...stored, song, canonicalXML: next.canonicalXML };
        store.put(revised);
        updated = decode(revised);
      };
    });
    return updated;
  });
}
export async function loadPracticeRecord(
  id: string,
): Promise<RecordData | undefined> {
  const record = await read<Stored | undefined>((store) => store.get(id));
  return record ? upgradePracticeMetadata(decode(record)) : undefined;
}
async function change(
  work: (transaction: IDBTransaction) => void,
): Promise<void> {
  const db = await open();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("songs", "readwrite");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () =>
        reject(
          transaction.error ??
            new Error("Playback library transaction aborted"),
        );
      try {
        work(transaction);
      } catch (error) {
        transaction.abort();
        reject(error);
      }
    });
  } finally {
    db.close();
  }
}
export function savePracticeRecord(record: RecordData): Promise<void> {
  const copy = snapshot(record);
  return queued(async () => {
    const stored = await encode(copy);
    await change((tx) => {
      tx.objectStore("songs").put(stored);
    });
  });
}
export class DuplicatePracticeAudioError extends Error {
  constructor() {
    super(t("audioPractice.duplicate"));
    this.name = "DuplicatePracticeAudioError";
  }
}
/** Only standalone audio entries conflict; score packages remain independent. */
export async function assertNewPracticeAudio(audio: Blob): Promise<void> {
  await assertNewAudioBatch([audio]);
}
async function assertNewAudioBatch(incoming: Blob[]): Promise<void> {
  if (!incoming.length) return;
  const sizes = new Set(incoming.map((audio) => audio.size));
  const existing = await read<Stored[]>((store) => store.getAll());
  const hashes = new Set<string>();
  for (const stored of existing) {
    if (!stored.song.audioPractice) continue;
    const audio = decode(stored).audio;
    if (sizes.has(audio.size))
      hashes.add(await audioFileHash(await audio.arrayBuffer()));
  }
  for (const audio of incoming) {
    const hash = await audioFileHash(await audio.arrayBuffer());
    if (hashes.has(hash)) throw new DuplicatePracticeAudioError();
    hashes.add(hash);
  }
}
/** Restore the entire validated batch atomically. New IDs must never overwrite old records. */
export function addPracticeRecords(records: RecordData[]): Promise<void> {
  const copies = records.map(snapshot);
  return queued(async () => {
    await assertNewAudioBatch(
      copies
        .filter((copy) => !!copy.song.audioPractice)
        .map((copy) => copy.audio),
    );
    const stored: Stored[] = [];
    for (const copy of copies) stored.push(await encode(copy));
    await change((tx) => {
      const store = tx.objectStore("songs");
      for (const record of stored) store.add(record);
    });
  });
}
/** Metadata-only upgrade; never overwrite a concurrent edit or practice state. */
export function savePracticeCanonicalMetadata(
  id: string,
  previous: string,
  next: string,
): Promise<boolean> {
  return queued(async () => {
    let saved = false;
    await change((tx) => {
      const store = tx.objectStore("songs");
      const request = store.get(id);
      request.onsuccess = () => {
        const stored = request.result as Stored | undefined;
        if (!stored || stored.canonicalXML !== previous) return;
        store.put({ ...stored, canonicalXML: next });
        saved = true;
      };
    });
    return saved;
  });
}
export function removePracticeRecord(id: string): Promise<void> {
  return queued(() =>
    change((tx) => {
      tx.objectStore("songs").delete(id);
    }),
  );
}
/** Reimport is a direct replacement. No backup or practice-state restoration. */
export function importPracticeRecord(
  incoming: RecordData,
  options: { allowDuplicateAudio?: boolean } = {},
): Promise<PracticeImportResult> {
  const copy = snapshot(incoming);
  // A newly imported score uses practice defaults, not the author's mix.
  const { musicVolume, clickVolume, click } = defaults();
  Object.assign(copy.song.settings, { musicVolume, clickVolume, click });
  return queued(async () => {
    if (copy.song.audioPractice && !options.allowDuplicateAudio)
      await assertNewPracticeAudio(copy.audio);
    const stored = await encode(copy);
    let existed = false;
    let failure: unknown;
    await change((tx) => {
      const songs = tx.objectStore("songs");
      const request = songs.get(stored.song.id);
      request.onsuccess = () => {
        existed = !!request.result;
        try {
          songs.put(stored);
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
    }).catch((error) => {
      throw failure ?? error;
    });
    if (failure) throw failure;
    return { status: existed ? "replaced" : "added", record: decode(stored) };
  });
}

export function savePracticeState(id: string, song: Song): Promise<void> {
  const state = structuredClone(song);
  return queued(async () => {
    let failure: unknown;
    await change((tx) => {
      const store = tx.objectStore("songs");
      const request = store.get(id);
      request.onsuccess = () => {
        try {
          const stored = request.result as Stored | undefined;
          if (!stored) throw new Error("Practice record not found");
          if (
            state.id !== id ||
            scoreStructureSignature(stored.song) !==
              scoreStructureSignature(state)
          )
            throw new Error("Practice score structure changed");
          const desiredFormat = state.scoreFormat ?? "pdf";
          if ((stored.song.scoreFormat ?? "pdf") !== desiredFormat) {
            const target = stored.otherScores?.find(
              (score) => score.format === desiredFormat,
            );
            if (!target) throw new Error("Practice score variant not found");
            // The shared score switch owns geometry semantics. Decode only during a
            // format switch; retain the already-owned raw bytes when persisting.
            const decoded = decode(stored);
            const switched = useScore(
              decoded,
              decoded.otherScores!.find(
                (score) => score.format === desiredFormat,
              )!,
            );
            const previous = {
              format: stored.song.scoreFormat ?? "pdf",
              name: stored.song.pdfName,
              partId: stored.song.scorePartId,
              source: stored.pdf,
              pages: stored.pages,
              regions: stored.song.regions,
              measures: stored.song.measures.map(
                ({ id, regionId, beats, denominator }) => ({
                  id,
                  regionId,
                  beats,
                  denominator,
                }),
              ),
            };
            stored.song = switched.song;
            stored.pdf = target.source;
            stored.pages = target.pages;
            stored.otherScores = [
              previous,
              ...(stored.otherScores ?? []).filter(
                (score) =>
                  score.format !== desiredFormat &&
                  score.format !== previous.format,
              ),
            ];
          }
          stored.song.settings = state.settings;
          stored.song.markers = state.markers;
          stored.song.loops = state.loops;
          stored.song.repeatSlots = state.repeatSlots;
          stored.song.markerSlots = state.markerSlots;
          validateSong(stored.song);
          store.put(stored);
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
    }).catch((error) => {
      throw failure ?? error;
    });
  });
}
