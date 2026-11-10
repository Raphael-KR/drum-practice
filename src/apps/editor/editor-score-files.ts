import { type Song } from "../../model/model";
import type { RecordData } from "../../model/record";
import {
  vocalLyrics,
  withVocalSource,
  writeCanonical,
} from "../../modules/score/canonical-xml";
import {
  replaceWithMusicXML,
  scoreFormat,
} from "../../modules/score/score-import";
import {
  activeScore,
  songScores,
  useScore,
} from "../../modules/score/song-scores";
import { t as i18nText } from "../../shared/i18n/i18n";
import { createDialog } from "../../shared/ui/dialog-ui";
import { escapeHTML as esc } from "../../shared/ui/html";
import { Player } from "./audio";
import { $, val } from "./editor-dom";
import type { EditorScoreRenderer } from "./editor-record-preparation";
import { openSettingsChild } from "./workspace";

interface EditorScoreFilesHost {
  readonly record: RecordData | undefined;
  engine(): Player;
  edit(mut: (song: Song) => void): void;
  persist(): Promise<void>;
  activate(record: RecordData): Promise<void>;
  renderScore: EditorScoreRenderer;
  renderLyricEditor(near: boolean): void;
  tell(message: string): void;
  error(error: unknown): void;
}
const xmlModule = () => import("../../modules/score/musicxml");

/** Score replacement and vocal import read the current record when invoked. */
export function installEditorScoreFiles(h: EditorScoreFilesHost) {
  const {
    engine,
    edit,
    persist,
    activate,
    renderScore,
    renderLyricEditor,
    tell,
    error,
  } = h;
  const replaceDialog = createDialog(
    "replace-score-dialog",
    i18nText("main.message346"),
    "",
    document.body,
    "replace-close",
  );
  replaceDialog.insertAdjacentHTML(
    "beforeend",
    "<p>" +
      i18nText("main.message347") +
      "</p><label>" +
      i18nText("main.message158") +
      '<input type="file" id="replace-score-file" accept=".pdf,.musicxml,.xml,.mxl"></label><p><label>' +
      i18nText("main.message348") +
      '<select id="replace-score-part" disabled><option>' +
      i18nText("main.message349") +
      '</option></select></label></p><p id="replace-score-note" class="subtle"></p><button id="replace-score-apply" class="primary" disabled>' +
      i18nText("main.message350") +
      "</button>",
  );

  const openScoreReplacement = () => {
    if (!h.record) return;
    engine().pause();
    openSettingsChild(replaceDialog);
  };
  $("review-add-score").onclick = openScoreReplacement;
  let replaceGeneration = 0;
  val("replace-score-file").onchange = async () => {
    const gen = ++replaceGeneration;
    val("replace-score-apply").disabled = true;
    $("replace-score-part").innerHTML =
      "<option>" + i18nText("main.message349") + "</option>";
    val("replace-score-part").disabled = true;
    const file = val("replace-score-file").files?.[0];
    if (!file) return;
    try {
      if (scoreFormat(file.name) === "pdf") {
        $("replace-score-part").innerHTML =
          "<option>" + i18nText("main.message351") + "</option>";
        $("replace-score-note").textContent = i18nText("main.message352");
        val("replace-score-apply").disabled = false;
        return;
      }
      const xml = await xmlModule(),
        info = xml.parseMusicXML(await xml.readMusicXML(file), undefined, true);
      if (gen !== replaceGeneration) return;
      $("replace-score-part").innerHTML = info.parts
        .map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`)
        .join("");
      val("replace-score-part").disabled = false;
      $("replace-score-note").textContent = info.warnings.join(" ");
      val("replace-score-apply").disabled = false;
    } catch (e) {
      error(e);
    }
  };
  $("replace-score-apply").onclick = async () => {
    const file = val("replace-score-file").files?.[0];
    if (!file || !h.record) return;
    const original = h.record;
    val("replace-score-apply").disabled = true;
    try {
      const format = scoreFormat(file.name);
      if (
        songScores(original).some((s) => s.format === format) &&
        !confirm(
          i18nText("main.message353", {
            value1:
              format === "pdf"
                ? i18nText("term.PDF")
                : i18nText("term.MusicXML"),
          }),
        )
      )
        return;
      const r = await renderScore(
        file,
        format,
        val("replace-score-part").value,
      );
      if (h.record !== original) throw Error(i18nText("main.message354"));
      let updated: Song;
      if (r.parsed)
        updated = replaceWithMusicXML(
          original.song,
          { ...r, parsed: r.parsed },
          file.name,
        );
      else {
        if (r.regions.length !== original.song.measures.length)
          throw Error(
            i18nText("main.message355", {
              value1: original.song.measures.length,
              value2: r.regions.length,
            }),
          );
        updated = structuredClone(original.song);
        updated.regions = r.regions;
        updated.pageCount = r.pages.length;
        updated.measures.forEach((m, i) => {
          m.regionId = r.regions[i].id;
        });
        updated.scoreFormat = "pdf";
        updated.scorePartId = undefined;
        updated.pdfName = file.name;
      }
      const target = activeScore({
        song: updated,
        pdf: file,
        audio: original.audio,
        pages: r.pages,
      });
      const next = useScore(original, target);
      if (format === "musicxml")
        next.canonicalXML = writeCanonical(
          next.song,
          await (await xmlModule()).readMusicXML(file),
        );
      await activate(next);
      replaceDialog.close();
      tell(
        i18nText("main.message356", {
          value1:
            format === "pdf" ? i18nText("term.PDF") : i18nText("term.MusicXML"),
          value2: r.parsed?.warnings.join(" ") ?? "",
        }),
      );
    } catch (e) {
      error(e);
    } finally {
      val("replace-score-apply").disabled = false;
    }
  };

  const vocalDialog = createDialog(
    "vocal-dialog",
    i18nText("main.message358"),
    "",
    document.body,
    "vocal-close",
  );
  vocalDialog.insertAdjacentHTML(
    "beforeend",
    "<p>" +
      i18nText("main.message359") +
      '</p><input id="vocal-file" type="file" accept=".musicxml,.xml,.mxl"><label class="form-field">' +
      i18nText("main.message360") +
      '<select id="vocal-part" disabled><option>' +
      i18nText("main.message349") +
      '</option></select></label><button id="vocal-apply" disabled>' +
      i18nText("main.message361") +
      "</button>",
  );

  const vocalButton = document.createElement("button");
  vocalButton.id = "import-vocal";
  vocalButton.textContent = i18nText("main.message362");
  $("show-all").after(vocalButton);
  vocalButton.onclick = () => {
    engine().pause();
    vocalDialog.showModal();
  };
  let vocalGeneration = 0;
  val("vocal-file").onchange = async () => {
    const generation = ++vocalGeneration;
    val("vocal-apply").disabled = true;
    val("vocal-part").disabled = true;
    $("vocal-part").innerHTML =
      "<option>" + i18nText("main.message349") + "</option>";
    try {
      const f = val("vocal-file").files?.[0];
      if (!f) return;
      const xml = await xmlModule(),
        info = xml.parseMusicXML(await xml.readMusicXML(f), undefined, true);
      if (generation !== vocalGeneration) return;
      $("vocal-part").innerHTML = info.parts
        .map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`)
        .join("");
      val("vocal-part").disabled = false;
      val("vocal-apply").disabled = false;
    } catch (e) {
      error(e);
    }
  };
  $("vocal-apply").onclick = async () => {
    try {
      if (!h.record) return;
      const original = h.record,
        f = val("vocal-file").files?.[0];
      if (!f) return;
      const xml = await xmlModule(),
        parsed = xml.parseMusicXML(
          await xml.readMusicXML(f),
          val("vocal-part").value,
        );
      const lyrics = vocalLyrics(original.song, parsed);
      if (!confirm(i18nText("main.message363"))) return;
      if (h.record !== original) throw Error(i18nText("main.message364"));
      const base = withVocalSource(original.canonicalXML!, parsed.document);
      const previous = original.canonicalXML;
      original.canonicalXML = base;
      try {
        edit((s) => {
          s.lyricArchive = [
            ...(s.lyricArchive || []),
            {
              revision: "before-vocal-import",
              lyrics: structuredClone(s.lyrics),
            },
          ];
          s.lyrics = lyrics;
        });
      } catch (e) {
        original.canonicalXML = previous;
        throw e;
      }
      await persist();
      renderLyricEditor(false);
      vocalDialog.close();
      tell(i18nText("main.message365"));
    } catch (e) {
      error(e);
    }
  };
  return { openScoreReplacement };
}
