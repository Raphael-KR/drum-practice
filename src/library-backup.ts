import { t as i18nText } from "./i18n";
import JSZip from "jszip";
import { packSong, unpackSong, type PortableSong } from "./portable";
import { validateSong } from "./model";
import type { RecordData } from "./storage";
export const preferenceKeys = [
  "drum-practice.playback",
  "drum-practice.prefer-pdf",
  "drum-practice.auto-fullscreen",
  "drum-practice.settings-category",
];
export interface LibraryArchive {
  version: 1;
  kind: "drum-practice-library";
  createdAt: string;
  records: (PortableSong & Pick<RecordData, "editDraft" | "revisions">)[];
  preferences: Record<string, string>;
}
export async function exportLibrary(
  records: RecordData[],
  preferences: Record<string, string> = {},
) {
  const data: LibraryArchive = {
    version: 1,
    kind: "drum-practice-library",
    createdAt: new Date().toISOString(),
    preferences,
    records: await Promise.all(
      records.map(async (r) => ({
        ...(await packSong(r)),
        editDraft: r.editDraft,
        revisions: r.revisions,
      })),
    ),
  };
  const zip = new JSZip();
  zip.file("library.json", JSON.stringify(data));
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}
export async function importLibrary(bytes: ArrayBuffer) {
  const zip = await JSZip.loadAsync(bytes),
    file = zip.file("library.json");
  if (!file) throw Error(i18nText("library-backup.message077"));
  const data: LibraryArchive = JSON.parse(await file.async("string"));
  if (
    data.version !== 1 ||
    data.kind !== "drum-practice-library" ||
    !Array.isArray(data.records)
  )
    throw Error(i18nText("library-backup.message078"));
  const ids = new Set<string>();
  const records = data.records.map((p) => {
    const r = unpackSong(p);
    if (ids.has(r.song.id)) throw Error(i18nText("library-backup.message079"));
    ids.add(r.song.id);
    if (p.editDraft) {
      validateSong(p.editDraft.song);
      if (p.editDraft.song.id !== r.song.id)
        throw Error(i18nText("library-backup.message080"));
    }
    if (p.revisions) {
      if (!Array.isArray(p.revisions))
        throw Error(i18nText("library-backup.message081"));
      for (const v of p.revisions) {
        validateSong(v.song);
        if (v.song.id !== r.song.id)
          throw Error(i18nText("library-backup.message082"));
      }
    }
    return { ...r, editDraft: p.editDraft, revisions: p.revisions?.slice(-10) };
  });
  const preferences = Object.fromEntries(
    Object.entries(data.preferences || {}).filter(
      ([k, v]) => preferenceKeys.includes(k) && typeof v === "string",
    ),
  );
  return { records, preferences };
}
