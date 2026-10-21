import {
  libraryCardHTML,
  libraryPresentation,
} from "../../modules/library/library-presentation";
import {
  scoreCatalog,
  librarySectionHTML,
  type ScoreCatalogEntry,
} from "../../modules/library/score-catalog";
import { downloadScore } from "../../modules/library/download-score";
import { readScorePackage } from "../../modules/library/score-package";
import type { RecordData } from "../../model/record";
import { chooseRecent } from "../../modules/library/recent-score";
import {
  allRecords,
  deleteRecord,
  saveRecord,
} from "../../platform/storage/storage";
import { t as i18nText } from "../../shared/i18n/i18n";
import { escapeHTML as esc } from "../../shared/ui/html";
import { $ } from "./editor-dom";
interface LibraryHost {
  showHome(): Promise<void>;
  activate(record: RecordData): Promise<void>;
  openEditor(): Promise<void>;
  error(error: unknown): void;
  action(id: string, fn: () => unknown): void;
}
export function createEditorLibrary(h: LibraryHost) {
  const { activate, openEditor, error, action } = h;
  let opening = false;
  let homeEpoch = 0;
  const sections = (
    entries: ScoreCatalogEntry[],
    render: (entry: ScoreCatalogEntry, index: number) => string,
    prefix: string,
  ) =>
    (["basic", "personal"] as const)
      .map((category) => {
        const content = entries
          .map((entry, index) =>
            entry.category === category ? render(entry, index) : "",
          )
          .join("");
        return librarySectionHTML(
          category,
          `${prefix}-${category}`,
          `${prefix}-${category}-title`,
          content,
          !content,
        );
      })
      .join("");
  const catalogCard = (entry: ScoreCatalogEntry, index: number) =>
    libraryCardHTML(
      entry,
      `<button ${entry.record ? 'class="primary"' : ""} data-editor-open="${index}">${i18nText(entry.record ? "editorHome.edit" : "separation.loadBundled")}</button>${entry.record ? `<button data-editor-remove="${index}" title="${esc(i18nText("library.tipRemove"))}">${i18nText("separation.remove")}</button>` : ""}`,
    );
  async function openCatalogEntry(
    entry: ScoreCatalogEntry,
    button: HTMLButtonElement,
  ) {
    if (opening) return;
    opening = true;
    const label = button.textContent;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    let stage = "read-saved";
    try {
      let selected = (await allRecords()).find(
        (record) => record.song.id === entry.id,
      );
      if (!selected && entry.bundled) {
        stage = "download";
        const blob = await downloadScore(
          `${import.meta.env.BASE_URL}${entry.bundled.file}`,
          (percent) => {
            button.textContent =
              percent === null
                ? i18nText("library.downloading")
                : i18nText("library.downloadPercent", { percent });
          },
        );
        stage = "decode";
        const incoming = await readScorePackage(blob);
        if (incoming.song.id !== entry.id) {
          throw new Error(
            `Bundled score ID mismatch: expected=${entry.id}, actual=${incoming.song.id}`,
          );
        }
        // Preserve a saved edit if another tab imported the score during download.
        selected = (await allRecords()).find(
          (record) => record.song.id === entry.id,
        );
        if (!selected) {
          stage = "save";
          await saveRecord(incoming);
          selected = incoming;
        }
      }
      if (!selected) throw new Error(`Score missing: id=${entry.id}`);
      stage = "open-editor";
      await activate(selected);
      await refreshRecentScore(true);
      await openEditor();
    } catch (cause) {
      try {
        console.error("Editor catalog open failed", {
          id: entry.id,
          stage,
          cause,
        });
      } catch {
        /* Reporting must not hide the original failure. */
      }
      error(cause);
    } finally {
      opening = false;
      button.disabled = false;
      button.removeAttribute("aria-busy");
      button.textContent = label;
    }
  }
  async function openLibrary() {
    if (opening) return;
    await h.showHome();
    await refreshRecentScore();
  }
  action("library-button", openLibrary);
  action("welcome-library", openLibrary);
  async function refreshRecentScore(force = false) {
    if (opening && !force) return;
    const epoch = ++homeEpoch;
    const records = (await allRecords()).filter((r) => !r.song.audioPractice);
    if (epoch !== homeEpoch || (opening && !force)) return;
    const recent = chooseRecent(records);
    const catalog = scoreCatalog(records);
    $("editor-home-list").innerHTML =
      '<div id="editor-home-favorites" class="practice-records" hidden></div>' +
      sections(
        catalog,
        (entry, index) => catalogCard(entry, index),
        "editor-home",
      );
    const presentation = libraryPresentation(
      catalog,
      [$("editor-home-basic"), $("editor-home-personal")],
      $("editor-home-favorites"),
      error,
    );
    $("editor-home-list")
      .querySelectorAll<HTMLElement>(".practice-card")
      .forEach((card) => presentation.appendCard(card.dataset.scoreId!, card));
    presentation.sortFavorites();
    $("editor-home-list").onclick = async (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-editor-open], [data-editor-remove]",
      );
      if (!button || button.disabled || opening) return;
      if (button.dataset.editorRemove !== undefined) {
        const entry = catalog[Number(button.dataset.editorRemove)];
        if (!confirm(i18nText("separation.removeConfirm"))) return;
        button.disabled = true;
        opening = true;
        try {
          await deleteRecord(entry.id);
          await refreshRecentScore(true);
        } catch (cause) {
          try {
            console.error("Editor catalog deletion failed", {
              id: entry.id,
              cause,
            });
          } catch {
            /* Keep the original failure. */
          }
          error(cause);
        } finally {
          opening = false;
          button.disabled = false;
        }
        return;
      }
      void openCatalogEntry(catalog[Number(button.dataset.editorOpen)], button);
    };
    $("demo-button").textContent = recent
      ? i18nText("main.message223", { value1: recent.song.title })
      : i18nText("main.message289");
  }
  return { open: openLibrary, refreshRecent: refreshRecentScore };
}
