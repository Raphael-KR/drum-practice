import {
  createPracticeFile,
  readPracticeFile,
  bindPracticeAudio,
  matchPracticeAudio,
  practiceFileName,
  type PracticeFileData,
  type PracticeFileEntry,
} from "./practice-file";
import { AUDIO_FILE_ACCEPT } from "../audio/audio-practice";
import type { RecordData } from "../../model/record";
import { download } from "../../platform/browser/download";
import { t } from "../../shared/i18n/i18n";
import { createMetronomeCorrectionNotice } from "./metronome-corrections";

export interface PracticeFileControlsOptions {
  records(): Promise<Pick<RecordData, "song" | "audio">[]>;
  findAudio(entries: PracticeFileEntry[]): Promise<Map<string, Blob>>;
  restore(records: RecordData[]): Promise<void>;
}
/** Shared by audio settings and the library, including an empty library. */
export function installPracticeFileControls(
  container: HTMLElement,
  options: PracticeFileControlsOptions,
) {
  const section = document.createElement("div");
  section.className = "practice-file-controls settings-choice-row";
  section.innerHTML = `<div class="practice-file-actions settings-choice-buttons segmented-control" role="group" aria-label="${t("component.settings.audio.accessible")}"><button type="button" data-practice-save title="${t("practiceFile.save")}">${t("practiceFile.save")}</button><button type="button" data-practice-load title="${t("practiceFile.load")}">${t("practiceFile.load")}</button></div><button type="button" data-practice-audio hidden title="${t("practiceFile.chooseAudio")}">${t("practiceFile.chooseAudio")}</button><input type="file" data-practice-file accept=".json" hidden><input type="file" data-practice-audio-file accept="${AUDIO_FILE_ACCEPT}" multiple hidden><p class="practice-file-status" role="status" aria-live="polite"></p>`;
  container.append(section);
  const file = section.querySelector<HTMLInputElement>("[data-practice-file]")!;
  const audio = section.querySelector<HTMLInputElement>(
    "[data-practice-audio-file]",
  )!;
  const audioButton = section.querySelector<HTMLButtonElement>(
    "[data-practice-audio]",
  )!;
  const status = section.querySelector<HTMLElement>(".practice-file-status")!;
  let pending: PracticeFileData | undefined;
  let matched = new Map<string, Blob>();
  let busy = false;
  let correctionNotice = createMetronomeCorrectionNotice();
  function message(text: string, error = false) {
    status.textContent = [text, error ? "" : correctionNotice.message()]
      .filter(Boolean)
      .join("\n");
    status.classList.toggle("is-error", error);
    status.setAttribute("role", error ? "alert" : "status");
  }
  async function run(work: () => Promise<void>) {
    if (busy) return;
    busy = true;
    section
      .querySelectorAll<HTMLButtonElement>("button")
      .forEach((b) => (b.disabled = true));
    message(t("practiceFile.working"));
    try {
      await work();
    } catch (error) {
      message(
        `${t("practiceFile.failed")} ${error instanceof Error ? error.message : String(error)}`,
        true,
      );
    } finally {
      busy = false;
      section
        .querySelectorAll<HTMLButtonElement>("button")
        .forEach((b) => (b.disabled = false));
    }
  }
  async function restoreOrPrompt() {
    if (!pending) return;
    const missing = pending.records.filter(
      (entry) => !matched.has(entry.audio.sha256),
    );
    if (missing.length) {
      audioButton.hidden = false;
      message(
        t("practiceFile.needsAudio", {
          count: missing.length,
          total: pending.records.length,
          names: missing.map((entry) => entry.audio.name).join(", "),
        }),
      );
      return;
    }
    const records: RecordData[] = [];
    for (const entry of pending.records)
      records.push(
        await bindPracticeAudio(entry, matched.get(entry.audio.sha256)!),
      );
    await options.restore(records);
    const count = records.length;
    pending = undefined;
    matched.clear();
    audioButton.hidden = true;
    message(t("practiceFile.restored", { count }));
  }
  section
    .querySelector("[data-practice-save]")!
    .addEventListener("click", () => {
      void run(async () => {
        download(
          await createPracticeFile(await options.records()),
          practiceFileName(),
        );
        message(t("practiceFile.downloaded"));
      });
    });
  section
    .querySelector("[data-practice-load]")!
    .addEventListener("click", () => {
      if (!busy) file.click();
    });
  audioButton.addEventListener("click", () => {
    if (!busy) audio.click();
  });
  file.addEventListener("change", () => {
    const selected = file.files?.[0];
    file.value = "";
    if (!selected) return;
    void run(async () => {
      pending = undefined;
      matched.clear();
      audioButton.hidden = true;
      correctionNotice = createMetronomeCorrectionNotice();
      const data = await readPracticeFile(selected, correctionNotice.collect);
      matched = await options.findAudio(data.records);
      pending = data;
      await restoreOrPrompt();
    });
  });
  audio.addEventListener("change", () => {
    const selected = Array.from(audio.files ?? []);
    audio.value = "";
    if (!selected.length || !pending) return;
    void run(async () => {
      const found = await matchPracticeAudio(pending!.records, selected);
      if (!found.size) throw Error(t("practiceFile.audioMismatch"));
      for (const [hash, source] of found) matched.set(hash, source);
      await restoreOrPrompt();
    });
  });
}
