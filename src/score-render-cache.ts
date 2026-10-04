/** Disposable derived data only: never writes source scores or practice state. */
import type { Region } from "./model";
import { version as osmdVersion } from "opensheetmusicdisplay/package.json";
export const SCORE_RENDER_POLICY = `osmd-${osmdVersion}:drum-print-ribbon-v20-grid-whole-rest:svg1500:quarter-native:rows4`;
export interface RenderedScore {
  pages: Blob[];
  regions: Region[];
}
interface StoredScore {
  key: string;
  touched: number;
  regions: Region[];
  pages: { bytes: ArrayBuffer; type: string; digest: string }[];
}
async function digest(bytes: ArrayBuffer) {
  return Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
}
const DATABASE = "drum-score-render-cache";
const pending = new Map<
  string,
  Promise<{ value: RenderedScore; hit: boolean }>
>();
export async function scoreRenderKey(
  xml: string,
  partId = "",
  policy = SCORE_RENDER_POLICY,
) {
  const bytes = new TextEncoder().encode(JSON.stringify([policy, partId, xml]));
  return Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
}
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("renders", { keyPath: "key" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function read(key: string): Promise<RenderedScore | undefined> {
  const db = await database();
  try {
    const value = await new Promise<StoredScore | undefined>(
      (resolve, reject) => {
        const request = db
          .transaction("renders")
          .objectStore("renders")
          .get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      },
    );
    if (
      !value ||
      !Array.isArray(value.pages) ||
      !value.pages.length ||
      !Array.isArray(value.regions) ||
      !value.regions.length
    )
      return;
    if (
      value.pages.some(
        (p) => !(p.bytes instanceof ArrayBuffer) || !p.bytes.byteLength,
      ) ||
      value.regions.some(
        (r) =>
          !r.id ||
          !Number.isInteger(r.page) ||
          r.page < 0 ||
          r.page >= value.pages.length ||
          ![r.x, r.y, r.w, r.h, ...r.beatXs].every(Number.isFinite) ||
          r.w <= 0 ||
          r.h <= 0,
      )
    )
      return;
    if (
      (
        await Promise.all(
          value.pages.map(async (p) => (await digest(p.bytes)) === p.digest),
        )
      ).some((ok) => !ok)
    )
      return;
    return {
      regions: value.regions,
      pages: value.pages.map((p) => new Blob([p.bytes], { type: p.type })),
    };
  } finally {
    db.close();
  }
}
async function write(key: string, value: RenderedScore) {
  const pages = await Promise.all(
    value.pages.map(async (p) => {
      const bytes = await p.arrayBuffer();
      return { bytes, type: p.type, digest: await digest(bytes) };
    }),
  );
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("renders", "readwrite"),
        store = tx.objectStore("renders");
      const all = store.getAll();
      all.onsuccess = () => {
        const entries = (all.result as StoredScore[]).sort(
          (a, b) => b.touched - a.touched,
        );
        const touched = Math.max(Date.now(), (entries[0]?.touched || 0) + 1);
        store.put({ key, touched, pages, regions: value.regions });
        entries.filter(e => e.key !== key).slice(3).forEach((e) => store.delete(e.key));
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
export async function cachedScoreRender(
  key: string,
  render: () => Promise<RenderedScore>,
) {
  let work = pending.get(key);
  if (!work) {
    work = (async () => {
      let value: RenderedScore | undefined;
      try {
        value = await read(key);
      } catch {
        /* Storage unavailable: render from source. */
      }
      if (value) return { value, hit: true };
      value = await render();
      try {
        await write(key, value);
      } catch {
        /* Quota/private mode must not prevent display. */
      }
      return { value, hit: false };
    })();
    pending.set(key, work);
  }
  try {
    return await work;
  } finally {
    if (pending.get(key) === work) pending.delete(key);
  }
}
