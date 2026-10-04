import { openScoreDatabase } from "./score-database";
import { validateSong, type Song } from "./model";
import type { RecordData } from "./storage";
import { scoreStructureSignature } from "./score-package";
import { useScore } from "./song-scores";

type Media = { bytes: ArrayBuffer; type: string };
type Stored = Omit<RecordData, "pdf" | "audio" | "pages" | "otherScores"> & {
  mediaFormat: "bytes-v1";
  pdf: Media;
  audio: Media;
  pages: Media[];
  otherScores?: (Omit<
    NonNullable<RecordData["otherScores"]>[number],
    "source" | "pages"
  > & { source: Media; pages: Media[] })[];
};
export type PracticeImportResult = {
  status: "added" | "updated" | "conflict" | "kept";
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
  validateSong(record.song);
  const media = async (blob: Blob): Promise<Media> => ({
    bytes: await blob.arrayBuffer(),
    type: blob.type,
  });
  const [pdf, audio, pages, otherScores] = await Promise.all([
    media(record.pdf),
    media(record.audio),
    Promise.all(record.pages.map(media)),
    Promise.all(
      (record.otherScores ?? []).map(async (score) => ({
        ...score,
        source: await media(score.source),
        pages: await Promise.all(score.pages.map(media)),
      })),
    ),
  ]);
  return { ...record, mediaFormat: "bytes-v1", pdf, audio, pages, otherScores };
}
function decode(record: Stored): RecordData {
  if (!("mediaFormat" in record)) return record as RecordData;
  const media = (value: Media) => new Blob([value.bytes], { type: value.type });
  const { mediaFormat: _, ...rest } = record;
  return {
    ...rest,
    pdf: media(record.pdf),
    audio: media(record.audio),
    pages: record.pages.map(media),
    otherScores: record.otherScores?.map((score) => ({
      ...score,
      source: media(score.source),
      pages: score.pages.map(media),
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
  return (await read<Stored[]>((store) => store.getAll())).map(decode);
}
export async function loadPracticeRecord(
  id: string,
): Promise<RecordData | undefined> {
  const record = await read<Stored | undefined>((store) => store.get(id));
  return record ? decode(record) : undefined;
}
async function change(
  work: (transaction: IDBTransaction) => void,
): Promise<void> {
  const db = await open();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(["songs", "archives"], "readwrite");
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
export function removePracticeRecord(id: string): Promise<void> {
  return queued(async () => {
    let failure: unknown;
    await change((tx) => {
      const songs = tx.objectStore("songs");
      const request = songs.get(id);
      request.onsuccess = () => {
        try {
          if (request.result)
            tx.objectStore("archives").add({
              archivedAt: Date.now(),
              record: request.result,
            });
          songs.delete(id);
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
/** Musical position survives timing revisions, including lead-in, gaps and trailing audio. */
function remap(time: number, old: Song, next: Song): number {
  if (!old.measures.length) return time;
  for (let index = 0; index < old.measures.length; index++) {
    const previous = old.measures[index],
      updated = next.measures[index];
    if (time < previous.start) {
      const oldStart = index ? old.measures[index - 1].end : 0;
      const newStart = index ? next.measures[index - 1].end : 0;
      return (
        newStart +
        ((time - oldStart) / (previous.start - oldStart)) *
          (updated.start - newStart)
      );
    }
    if (time <= previous.end)
      return (
        updated.start +
        ((time - previous.start) / (previous.end - previous.start)) *
          (updated.end - updated.start)
      );
  }
  return next.measures.at(-1)!.end + time - old.measures.at(-1)!.end;
}
export function importPracticeRecord(
  incoming: RecordData,
  policy?: "replace" | "keep-existing",
): Promise<PracticeImportResult> {
  const copy = snapshot(incoming);
  return queued(async () => {
    const stored = await encode(copy);
    let result: PracticeImportResult | undefined;
    let failure: unknown;
    await change((tx) => {
      const songs = tx.objectStore("songs");
      const request = songs.get(stored.song.id);
      request.onsuccess = () => {
        try {
          const old = request.result as Stored | undefined;
          if (!old) {
            songs.put(stored);
            result = { status: "added", record: decode(stored) };
            return;
          }
          if (policy === "keep-existing") {
            result = { status: "kept", record: decode(old) };
            return;
          }
          if (
            scoreStructureSignature(old.song) !==
            scoreStructureSignature(stored.song)
          ) {
            if (policy !== "replace") {
              result = { status: "conflict", record: decode(old) };
              return;
            }

          } else {
            stored.song.settings = {
              ...old.song.settings,
              position: remap(
                old.song.settings.position,
                old.song,
                stored.song,
              ),
            };
            stored.song.markers = old.song.markers.map((marker) => ({
              ...marker,
              time: remap(marker.time, old.song, stored.song),
            }));
            stored.song.repeatSlots = old.song.repeatSlots?.slice();
            stored.song.markerSlots = old.song.markerSlots?.slice();
            stored.song.loops = old.song.loops.map((loop) => ({
              ...loop,
              start: remap(loop.start, old.song, stored.song),
              end: remap(loop.end, old.song, stored.song),
            }));
            validateSong(stored.song);
          }
          // A shared record may include an authoring draft even with identical bars.
          tx.objectStore("archives").add({ archivedAt: Date.now(), record: old });
          songs.put(stored);
          result = { status: "updated", record: decode(stored) };
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
    }).catch((error) => {
      throw failure ?? error;
    });
    return result!;
  });
}

export interface PracticeArchive {
  id: string;
  record: RecordData;
  archivedAt: number;
}
export async function listPracticeArchives(
  id?: string,
): Promise<PracticeArchive[]> {
  const db = await open();
  try {
    return await new Promise<PracticeArchive[]>((resolve, reject) => {
      const request = db
        .transaction("archives")
        .objectStore("archives")
        .openCursor();
      const result: PracticeArchive[] = [];
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve(result.reverse());
          return;
        }
        if (id === undefined || cursor.value.record.song.id === id)
          result.push({
            id: String(cursor.primaryKey),
            archivedAt: cursor.value.archivedAt,
            record: decode(cursor.value.record),
          });
        cursor.continue();
      };
    });
  } finally {
    db.close();
  }
}
export function restorePracticeArchive(archiveId: string): Promise<RecordData> {
  return queued(async () => {
    let restored: RecordData | undefined;
    let failure: unknown;
    await change((tx) => {
      const archives = tx.objectStore("archives");
      const request = archives.get(Number(archiveId));
      request.onsuccess = () => {
        try {
          if (!request.result) throw new Error("Practice archive not found");
          const previous = request.result.record as Stored;
          const songs = tx.objectStore("songs");
          const current = songs.get(previous.song.id);
          current.onsuccess = () => {
            try {
              if (current.result)
                archives.add({
                  archivedAt: Date.now(),
                  record: current.result,
                });
              songs.put(previous);
              restored = decode(previous);
            } catch (error) {
              failure = error;
              tx.abort();
            }
          };
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
    }).catch((error) => {
      throw failure ?? error;
    });
    return restored!;
  });
}

/** Frequent playback saves retain owned media bytes and only update practice state. */
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
