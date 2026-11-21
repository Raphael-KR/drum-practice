import JSZip from "jszip";
import { type Song } from "../../model/model";
import type { RecordData } from "../../model/record";
import { mediaIdentity } from "../../modules/audio/media";
import {
  exportLibrary,
  importLibrary,
} from "../../modules/library/library-backup";
import { createMetronomeCorrectionNotice } from "../../modules/library/metronome-corrections";
import {
  ensureCanonical,
  readCanonical,
  writeCanonical,
} from "../../modules/score/canonical-xml";
import { songScores } from "../../modules/score/song-scores";
import { download } from "../../platform/browser/download";
import { allRecords } from "../../platform/storage/storage";
import {
  listProjects,
  readProject,
  projectRecord,
  restoreProject,
} from "./score-project-client";
import { t as i18nText } from "../../shared/i18n/i18n";
import type { setupScoreManagement } from "./score-management";

interface ManagementActionsHost {
  record: RecordData | undefined;
  song(): Song;
  edit(mut: (song: Song) => void, work?: RecordData["lyricWork"]): void;
  flush(): void;
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
      h.flush();
      h.edit(() => {}, { ...h.record.lyricWork, text });
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
      const legacy = await allRecords(),
        { projects, errors } = await listProjects();
      if (errors.length)
        throw Error(errors.map((e) => `${e.id}: ${e.error}`).join("\n"));
      const records = [
        ...legacy.filter((r) => !projects.some((p) => p.songId === r.song.id)),
        ...(await Promise.all(
          projects.map(async (p) => projectRecord(await readProject(p.songId))),
        )),
      ];
      if (!records.length) throw Error(i18nText("main.message372"));
      download(
        new Blob([new Uint8Array(await exportLibrary(records))]),
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
      await persist();
      const { projects } = await listProjects();
      const existing = [
          ...(await allRecords()),
          ...projects.map((p) => ({ song: { id: p.songId } })),
        ],
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
      // Capture every expected head before writing. Concurrent producer updates
      // fail CAS instead of being silently replaced by this archive.
      const sources = await Promise.all(
        parsed.records.map((r) =>
          projects.some((p) => p.songId === r.song.id)
            ? readProject(r.song.id)
            : undefined,
        ),
      );
      for (const [index, record] of parsed.records.entries())
        await restoreProject(record, sources[index]);
      h.beforeRestore();
      h.record = undefined;
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
      h.flush();
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
      delete next.editDraft;
      next.localDraftChanges = true;
      await activate(next);
      await persist();
    },
  };
}
