import JSZip from "jszip";
import { validateSong, type Song } from "../../model/model";
import { normalizeMetronomeSettings } from "../../model/metronome";
import { createMetronomeCorrectionNotice } from "../../modules/library/metronome-corrections";
import type { RecordData } from "../../model/record";
import {
  mediaIdentity,
  verifyMedia,
  type MediaIdentity,
} from "../../modules/audio/media";
import {
  createScorePackage,
  readScorePackage,
} from "../../modules/library/score-package";
import { saveCanonical } from "../../modules/score/canonical-xml";
import { scoreArchivePath } from "../../modules/score/score-import";
import { pageExtension } from "../../modules/score/score-pages";
import { download } from "../../platform/browser/download";
import { allRecords, saveRecord } from "../../platform/storage/storage";
import {
  packScores,
  unpackScores,
} from "../../platform/storage/record-serialization";
import { t as i18nText } from "../../shared/i18n/i18n";
import { $, val } from "./editor-dom";

interface FileTransferHost {
  readonly record: RecordData | undefined;
  song(): Song;
  action(id: string, fn: () => unknown): void;
  persist(): Promise<void>;
  activate(record: RecordData): Promise<void>;
  renderScore(
    blob: Blob,
    format: Song["scoreFormat"],
    partId?: string,
  ): Promise<{ pages: Blob[] }>;
  tell(message: string): void;
  error(error: unknown): void;
  flushBeforeExport(): void;
}

/** ZIP backup/reconnection retains the existing storage format and form handler. */
export function installEditorBackup(h: FileTransferHost) {
  const { action, persist, song, activate, renderScore, tell, error } = h;
  action("export", async () => {
    await persist();
    const zip = new JSZip();
    zip.file("song.json", JSON.stringify(song(), null, 2));
    zip.file("canonical.musicxml", h.record!.canonicalXML!);
    zip.file(
      "media-identity.json",
      JSON.stringify(await mediaIdentity(h.record!.pdf, h.record!.audio)),
    );
    zip.file("README.txt", i18nText("main.message330"));
    if (val("include-media").checked) {
      zip.file(scoreArchivePath(song()), h.record!.pdf);
      zip.file(
        "pages/manifest.json",
        JSON.stringify(
          h.record!.pages.map((page, i) => ({
            path: `pages/${i}.${pageExtension(page)}`,
            type: page.type,
          })),
        ),
      );
      h.record!.pages.forEach((page, i) =>
        zip.file(`pages/${i}.${pageExtension(page)}`, page),
      );
      zip.file("media/audio", h.record!.audio);
      zip.file(
        "other-scores.json",
        JSON.stringify(await packScores(h.record!.otherScores)),
      );
    }
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "STORE",
    });
    download(blob, i18nText("main.message331", { value1: song().title }));
    tell(i18nText("main.message332"));
  });
  val("restore").onchange = async () => {
    try {
      const f = val("restore").files?.[0];
      if (!f) return;
      const zip = await JSZip.loadAsync(f);
      const text = await zip.file("song.json")?.async("string");
      if (!text) throw Error(i18nText("main.message333"));
      const correctionNotice = createMetronomeCorrectionNotice();
      const normalized = normalizeMetronomeSettings(
        JSON.parse(text) as unknown,
      );
      const s = normalized.song;
      validateSong(s);
      correctionNotice.collect(normalized.corrections);
      const canonicalXML = await zip
        .file("canonical.musicxml")
        ?.async("string");
      const identityText = await zip
        .file("media-identity.json")
        ?.async("string");
      const identity: MediaIdentity | undefined = identityText
        ? JSON.parse(identityText)
        : undefined;
      let pdf = await zip.file(scoreArchivePath(s))?.async("blob"),
        audio = await zip.file("media/audio")?.async("blob");
      if (!pdf || !audio) {
        const saved = (await allRecords()).find((r) => r.song.id === s.id);
        if (saved) {
          pdf = saved.pdf;
          audio = saved.audio;
        } else {
          pendingRestore = s;
          pendingCanonical = canonicalXML;
          pendingMedia = identity;
          $<HTMLDialogElement>("new-dialog").showModal();
          val("new-title").value = s.title;
          val("new-artist").value = s.artist || "";
          val("new-bpm").value = String(s.bpm);
          val("new-first").value = String(s.firstBeat);
          tell(
            [i18nText("main.message334"), correctionNotice.message()]
              .filter(Boolean)
              .join("\n"),
          );
          return;
        }
      }
      await verifyMedia(identity, pdf, audio);
      const manifestText = await zip
        .file("pages/manifest.json")
        ?.async("string");
      const manifest: { path: string; type: string }[] = manifestText
        ? JSON.parse(manifestText)
        : Array.from({ length: s.pageCount }, (_, i) => ({
            path: `pages/${i}.png`,
            type: "image/png",
          }));
      if (manifest.length !== s.pageCount)
        throw Error(i18nText("main.message335"));
      const savedPages = await Promise.all(
        manifest.map(async (p) => {
          const bytes = await zip.file(p.path)?.async("arraybuffer");
          return bytes ? new Blob([bytes], { type: p.type }) : undefined;
        }),
      );
      const pages = savedPages.every(Boolean)
        ? (savedPages as Blob[])
        : (await renderScore(pdf, s.scoreFormat, s.scorePartId)).pages;
      if (pages.length !== s.pageCount)
        throw Error(i18nText("main.message336"));
      const otherText = await zip.file("other-scores.json")?.async("string");
      const otherScores = otherText
        ? unpackScores(JSON.parse(otherText))
        : (await allRecords()).find((r) => r.song.id === s.id)?.otherScores;
      await activate({ song: s, pdf, audio, pages, otherScores, canonicalXML });
      tell(
        [i18nText("main.message337"), correctionNotice.message()]
          .filter(Boolean)
          .join("\n"),
      );
    } catch (e) {
      error(e);
    } finally {
      val("restore").value = "";
    }
  };
  let pendingRestore: Song | undefined;
  let pendingCanonical: string | undefined;
  let pendingMedia: MediaIdentity | undefined;
  $("new-dialog").addEventListener("close", () => {
    pendingRestore = undefined;
    pendingCanonical = undefined;
    pendingMedia = undefined;
  });
  // Use the same file picker for explicit reconnection; imported timing is preserved.
  const newHandler = $("new-form").onsubmit!;
  $("new-form").onsubmit = async (e) => {
    if (!pendingRestore) {
      return newHandler.call($("new-form"), e);
    }
    e.preventDefault();
    try {
      const pdf = val("pdf-file").files?.[0],
        audio = val("audio-file").files?.[0];
      if (!pdf || !audio) throw Error(i18nText("main.message338"));
      await verifyMedia(pendingMedia, pdf, audio);
      const { pages } = await renderScore(
        pdf,
        pendingRestore.scoreFormat,
        pendingRestore.scorePartId,
      );
      if (pages.length !== pendingRestore.pageCount)
        throw Error(i18nText("main.message336"));
      await activate({
        song: pendingRestore,
        pdf,
        audio,
        pages,
        canonicalXML: pendingCanonical,
      });
      pendingRestore = undefined;
      $<HTMLDialogElement>("new-dialog").close();
    } catch (e) {
      error(e);
    }
  };
  return { restoring: () => !!pendingRestore };
}

export function installEditorPackages(h: FileTransferHost) {
  const { action, persist, activate, tell, error } = h;
  // New-score entry uses one package-import path. The authoring database remains
  // the existing library; an existing identity is never silently overwritten.
  const packageInput = document.createElement("input");
  packageInput.type = "file";
  packageInput.accept = ".drumscore";
  packageInput.hidden = true;
  packageInput.id = "authoring-package-file";
  document.body.append(packageInput);
  for (const [host, id] of [["new-dialog", "new-package-import"]]) {
    const button = document.createElement("button");
    button.id = id;
    button.type = "button";
    button.textContent = i18nText("separation.packageImport");
    button.onclick = () => packageInput.click();
    $(host).querySelector(".dialoghead")?.after(button);
    if (!button.isConnected) $(host).prepend(button);
  }
  packageInput.onchange = async () => {
    const file = packageInput.files?.[0];
    if (!file) return;
    packageInput.disabled = true;
    try {
      const correctionNotice = createMetronomeCorrectionNotice();
      const imported = await readScorePackage(file, correctionNotice.collect);
      if ((await allRecords()).some((r) => r.song.id === imported.song.id)) {
        if (!confirm(i18nText("separation.importCopy"))) return;
        imported.song.id = crypto.randomUUID();
        imported.song.title = i18nText("separation.copyTitle", {
          title: imported.song.title,
        });
        saveCanonical(imported);
      }
      await saveRecord(imported);
      await activate(imported);
      $<HTMLDialogElement>("new-dialog").close();
      tell(
        [i18nText("separation.saved"), correctionNotice.message()]
          .filter(Boolean)
          .join("\n"),
      );
    } catch (e) {
      error(e);
    } finally {
      packageInput.value = "";
      packageInput.disabled = false;
    }
  };
  const packageExport = document.createElement("button");
  packageExport.id = "export-score-package";
  packageExport.type = "button";
  packageExport.className = "management-row";
  packageExport.textContent = i18nText("separation.packageExport");
  packageExport.title = i18nText("separation.packageDetail");
  const exportDialog = $("song-export-dialog");
  exportDialog.firstElementChild?.after(packageExport);
  action("export-score-package", async () => {
    if (!h.record || packageExport.disabled) return;
    packageExport.disabled = true;
    try {
      // Apply the currently visible authoring values before capturing the package.
      // Existing edit-session persistence still owns saved state and drafts.
      h.flushBeforeExport();
      await persist();
      const blob = await createScorePackage(h.record!);
      download(blob, `${h.record!.song.title}.drumscore`);
      tell(i18nText("separation.exportReady"));
    } finally {
      packageExport.disabled = false;
    }
  });
}
