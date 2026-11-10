import {
  validAudioAnalysis,
  type AudioAnalysis,
} from "../../model/audio-analysis-contract";
import { openScoreDatabase } from "./score-database";
import { sha256 } from "../browser/sha256";

export async function audioFileHash(bytes: ArrayBuffer): Promise<string> {
  return sha256(bytes);
}
/** This cache belongs to the current browser/origin. It never uses the network. */
export async function loadAudioAnalysis(
  hash: string,
): Promise<AudioAnalysis | undefined> {
  let db: IDBDatabase | undefined;
  try {
    db = await openScoreDatabase();
    const value = await new Promise<unknown>((resolve, reject) => {
      const tx = db!.transaction("audioAnalyses");
      const request = tx.objectStore("audioAnalyses").get(hash);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.onabort = () => reject(tx.error);
    });
    return validAudioAnalysis(value, hash) ? value : undefined;
  } catch {
    return undefined;
  } finally {
    // Storage unavailable: analyze on this device.
    db?.close();
  }
}
export async function storeAudioAnalysis(value: AudioAnalysis): Promise<void> {
  if (!validAudioAnalysis(value, value.sha256)) return;
  let db: IDBDatabase | undefined;
  try {
    db = await openScoreDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db!.transaction("audioAnalyses", "readwrite");
      tx.objectStore("audioAnalyses").put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = tx.onabort = () => reject(tx.error);
    });
  } catch {
    /* The imported song still contains its analysis; a cache failure is nonfatal. */
  } finally {
    db?.close();
  }
}
