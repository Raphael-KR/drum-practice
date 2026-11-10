import JSZip from "jszip";
import { retainRevision } from "../../model/edit-history";
import { type Song } from "../../model/model";
import type { RecordData } from "../../model/record";
import { mediaIdentity } from "../../modules/audio/media";
import {
  exportLibrary,
  importLibrary,
  preferenceKeys,
} from "../../modules/library/library-backup";
import { createMetronomeCorrectionNotice } from "../../modules/library/metronome-corrections";
import {
  ensureCanonical,
  readCanonical,
  writeCanonical,
} from "../../modules/score/canonical-xml";
import { songScores } from "../../modules/score/song-scores";
import { download } from "../../platform/browser/download";
import { allRecords, saveRecords } from "../../platform/storage/storage";
import { t as i18nText } from "../../shared/i18n/i18n";
import type { setupScoreManagement } from "./score-management";

interface ManagementActionsHost {
  record: RecordData | undefined;
  song(): Song;
  persist(): Promise<void>;
  activate(record: RecordData): Promise<void>;
  openLibrary(): Promise<void>;
  beforeRestore(): void;
  tell(message: string): void;
  error(error: unknown): void;
}

/** Preserve archive formats and restore order; the host controls active state and pending saves. */
export function createEditorManagementActions(
  h: ManagementActionsHost,
): Parameters<typeof setupScoreManagement>[0] {
  const { song, persist, activate, openLibrary, tell, error } = h;
  return {
    get: () => h.record,
    error,
    uploadLyrics: async (text) => {
      if (!h.record) return;
      if (
        (song().lyricText || song().lyrics.length) &&
        !confirm(i18nText("main.message371"))
      )
        return;
      h.record.revisions = retainRevision(h.record.revisions, h.record);
      song().lyricText = text;
      await persist();
    },
    exportFiles: async (kinds) => {
      if (!h.record || !kinds.length) return;
      await persist();
      const title = song().title.replace(/[\\/:*?"<>|]/g, "_"),
        files: { name: string; blob: Blob }[] = [];
      for (const k of kinds) {
        if (k === "xml")
          files.push({
            name: title + ".musicxml",
            blob: new Blob([h.record.canonicalXML!], {
              type: "application/vnd.recordare.musicxml+xml",
            }),
          });
        if (k === "pdf") {
          const pdf = songScores(h.record).find((s) => s.format === "pdf");
          if (pdf) files.push({ name: title + ".pdf", blob: pdf.source });
        }
        if (k === "audio")
          files.push({
            name:
              song().audioName.replace(/[\\/:*?"<>|]/g, "_") ||
              title + ".audio",
            blob: h.record.audio,
          });
      }
      if (files.length === 1) download(files[0].blob, files[0].name);
      else {
        const zip = new JSZip();
        for (const f of files) zip.file(f.name, await f.blob.arrayBuffer());
        download(
          new Blob([
            new Uint8Array(await zip.generateAsync({ type: "uint8array" })),
          ]),
          title + ".zip",
        );
      }
    },
    exportAll: async () => {
      await persist();
      const records = await allRecords();
      if (!records.length) throw Error(i18nText("main.message372"));
      const prefs = Object.fromEntries(
        preferenceKeys
          .map((k) => [k, localStorage.getItem(k)])
          .filter((p): p is [string, string] => p[1] !== null),
      );
      download(
        new Blob([new Uint8Array(await exportLibrary(records, prefs))]),
        i18nText("main.message373", { value1: records.length }),
      );
      tell(i18nText("main.message374", { value1: records.length }));
    },
    restoreAll: async (f) => {
      const correctionNotice = createMetronomeCorrectionNotice();
      const parsed = await importLibrary(
        await f.arrayBuffer(),
        correctionNotice.collect,
      );
      for (const r of parsed.records) {
        if (r.canonicalXML) readCanonical(r.canonicalXML, r.song);
      }
      const existing = await allRecords(),
        overlap = parsed.records.filter((r) =>
          existing.some((x) => x.song.id === r.song.id),
        );
      if (
        !confirm(
          i18nText("main.message375", {
            value1: parsed.records.length,
            value2: overlap.length,
          }),
        )
      )
        return;
      h.beforeRestore();
      await saveRecords(parsed.records);
      for (const [k, v] of Object.entries(parsed.preferences))
        localStorage.setItem(k, v);
      const replacement = parsed.records.find(
        (r) => r.song.id === h.record?.song.id,
      );
      if (replacement) {
        h.record = undefined;
        await activate(replacement);
      }
      await openLibrary();
      tell(
        [
          i18nText("main.message376", { value1: parsed.records.length }),
          correctionNotice.message(),
        ]
          .filter(Boolean)
          .join("\n"),
      );
    },
    replaceAudio: async (f) => {
      if (!h.record) return;
      if (!confirm(i18nText("main.message377"))) return;
      const old = h.record;
      const next = {
        ...old,
        audio: f,
        song: { ...structuredClone(old.song), audioName: f.name },
      };
      next.canonicalXML = writeCanonical(
        next.song,
        old.canonicalXML,
        (await mediaIdentity(next.pdf, next.audio)).audio,
      );
      await ensureCanonical(next);
      await activate(next);
      await persist();
    },
  };
}
