import type { RecordData } from "../../model/record";
import { createMetronomeCorrectionNotice } from "../../modules/library/metronome-corrections";
import {
  createScorePackage,
  readScorePackage,
} from "../../modules/library/score-package";
import { saveCanonical } from "../../modules/score/canonical-xml";
import { download } from "../../platform/browser/download";
import { allRecords, saveRecord } from "../../platform/storage/storage";
import { t as i18nText } from "../../shared/i18n/i18n";
import { $ } from "./editor-dom";

interface FileTransferHost {
  readonly record: RecordData | undefined;
  action(id: string, fn: () => unknown): void;
  persist(): Promise<void>;
  activate(record: RecordData): Promise<void>;
  tell(message: string): void;
  error(error: unknown): void;
  flushBeforeExport(): void;
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
  const newDialog = $("new-dialog");
  const packageImport = document.createElement("button");
  packageImport.id = "new-package-import";
  packageImport.type = "button";
  packageImport.textContent = i18nText("separation.packageImport");
  packageImport.onclick = () => packageInput.click();
  newDialog.querySelector(".dialoghead")?.after(packageImport);
  if (!packageImport.isConnected) newDialog.prepend(packageImport);
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
