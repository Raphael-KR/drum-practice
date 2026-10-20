import type { RecordData } from "../../model/record";
import { chooseRecent } from "../../modules/library/recent-score";
import { scoreAssets } from "../../modules/library/score-assets";
import { savePreferPDF } from "../../modules/library/score-preference";
import { songScores, useScore } from "../../modules/score/song-scores";
import { allRecords, deleteRecord } from "../../platform/storage/storage";
import { t as i18nText } from "../../shared/i18n/i18n";
import { escapeHTML as esc } from "../../shared/ui/html";
import { $ } from "./editor-dom";
import { selectEditorPane } from "./workspace";
interface LibraryHost {
  persist(): Promise<void>;
  activate(record: RecordData): Promise<void>;
  openEditor(): Promise<void>;
  error(error: unknown): void;
  action(id: string, fn: () => unknown): void;
  hasRecord(): boolean;
  openReplace(): void;
  clearActive(id: string): void;
}
export function createEditorLibrary(h: LibraryHost) {
  const { persist, activate, openEditor, error, action } = h;
  let library: RecordData[] = [];
  async function openLibrary() {
    if (h.hasRecord()) await persist();
    library = (await allRecords()).filter((r) => !r.song.audioPractice);
    $("library-list").innerHTML = library.length
      ? library
          .map(
            (r, i) =>
              '<div class="panel song-card"><div class="song-card-heading"><button data-open="' +
              String(i) +
              '" class="song-card-title">' +
              String(esc(r.song.title)) +
              "</button><small>" +
              i18nText("main.message280", {
                value3: r.song.artist ? esc(r.song.artist) + " · " : "",
                value4: r.song.measures.length,
                value5: r.song.bpm,
              }) +
              '</small></div><div class="song-card-types" aria-label="' +
              i18nText("main.message281") +
              '">' +
              String(
                songScores(r)
                  .map(
                    (score) =>
                      '<button class="score-type score-type-' +
                      String(score.format) +
                      '" data-open="' +
                      String(i) +
                      '" data-score="' +
                      String(score.format) +
                      '" aria-label="' +
                      i18nText("main.message278", {
                        value4: esc(r.song.title),
                        value5:
                          score.format === "pdf"
                            ? i18nText("term.PDF")
                            : i18nText("term.MusicXML"),
                      }) +
                      '">' +
                      String(
                        score.format === "pdf"
                          ? i18nText("term.PDF")
                          : i18nText("term.MusicXML"),
                      ) +
                      "</button>",
                  )
                  .join(""),
              ) +
              String(
                scoreAssets(r).lyrics
                  ? '<button class="score-type score-type-lyrics" data-open="' +
                      String(i) +
                      '" data-lyrics="true">' +
                      i18nText("main.message279") +
                      "</button>"
                  : "",
              ) +
              '<span class="asset-chip asset-audio' +
              (scoreAssets(r).audio ? "" : " asset-missing") +
              '">' +
              i18nText("main.message282") +
              '</span></div><div class="song-card-actions" ' +
              '><button data-attach="' +
              String(i) +
              '" aria-label="' +
              i18nText("main.message283", { value10: esc(r.song.title) }) +
              '">' +
              i18nText("main.message284") +
              '</button><button data-delete="' +
              String(i) +
              '" class="danger">' +
              i18nText("main.message285") +
              "</button></div></div>",
          )
          .join("")
      : "<p>" + i18nText("main.message286") + "</p>";
    const backupLabel = document.querySelector("#library-backup-export small");
    if (backupLabel)
      backupLabel.textContent = i18nText("main.message287", {
        value1: library.length,
      });
    $<HTMLDialogElement>("library-dialog").showModal();
  }
  action("library-button", openLibrary);
  action("welcome-library", openLibrary);
  $("library-list").onclick = async (e) => {
    const b = (e.target as HTMLElement).closest("button");
    if (!b) return;
    try {
      if (b.dataset.open) {
        const selected = library[Number(b.dataset.open)];
        const target =
          b.dataset.score &&
          songScores(selected).find((s) => s.format === b.dataset.score);
        if (target && songScores(selected).length > 1)
          savePreferPDF(target.format === "pdf");
        await activate(target ? useScore(selected, target) : selected);
        $<HTMLDialogElement>("library-dialog").close();
        if (b.dataset.lyrics) {
          selectEditorPane("lyrics");
          await openEditor();
        }
      }
      if (b.dataset.attach) {
        await activate(library[Number(b.dataset.attach)]);
        $<HTMLDialogElement>("library-dialog").close();
        h.openReplace();
      }
      if (b.dataset.delete && confirm(i18nText("main.message288"))) {
        const deleting = library[Number(b.dataset.delete)].song.id;
        h.clearActive(deleting);
        await deleteRecord(deleting);
        await refreshRecentScore();
        $<HTMLDialogElement>("library-dialog").close();
        await openLibrary();
      }
    } catch (e) {
      error(e);
    }
  };
  async function refreshRecentScore() {
    const records = (await allRecords()).filter((r) => !r.song.audioPractice);
    const recent = chooseRecent(records);
    $("editor-home-list").innerHTML = records.length
      ? records
          .map(
            (r, i) =>
              `<article class="editor-home-card practice-card"><div><h3>${esc(r.song.title)}</h3><p class="subtle">${esc(r.song.artist || "")}</p></div><button class="primary" data-editor-open="${i}">${i18nText("editorHome.edit")}</button></article>`,
          )
          .join("")
      : `<p class="editor-home-empty">${i18nText("editorHome.empty")}</p>`;
    $("editor-home-list").onclick = (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-editor-open]",
      );
      if (!button || button.disabled) return;
      button.disabled = true;
      void (async () => {
        try {
          await activate(records[Number(button.dataset.editorOpen)]);
          await openEditor();
        } catch (e) {
          error(e);
        } finally {
          button.disabled = false;
        }
      })();
    };
    $("demo-button").textContent = recent
      ? i18nText("main.message223", { value1: recent.song.title })
      : i18nText("main.message289");
  }
  return { open: openLibrary, refreshRecent: refreshRecentScore };
}
