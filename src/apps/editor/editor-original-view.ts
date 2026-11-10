import type { RecordData } from "../../model/record";
import { locate, type Song } from "../../model/model";
import type { Player } from "./audio";
import { displayPage } from "../../modules/score/score-pages";
import { songScores } from "../../modules/score/song-scores";
import { t as i18nText } from "../../shared/i18n/i18n";
import { $ } from "./editor-dom";
import { openSettingsChild } from "./workspace";

interface OriginalScoreHost {
  readonly record: RecordData | undefined;
  readonly selected: number;
  song(): Song;
  engine(): Player;
  action(id: string, fn: () => unknown): void;
}

/** Own the original-page viewer and its URLs; read the active record on each action. */
export function installOriginalScoreView(h: OriginalScoreHost) {
  const { action, engine, song } = h;
  let originalPage = 0;
  let originalURLs: string[] = [];
  function showOriginalPage() {
    $("page-original").innerHTML =
      '<img src="' +
      String(originalURLs[originalPage]) +
      '" alt="' +
      i18nText("main.message326", { value2: originalPage + 1 }) +
      '"><div class="pager"><button id="original-prev" ' +
      String(originalPage === 0 ? "disabled" : "") +
      ">" +
      i18nText("main.message327") +
      "</button><span>" +
      String(originalPage + 1) +
      " / " +
      String(originalURLs.length) +
      '</span><button id="original-next" ' +
      String(originalPage === originalURLs.length - 1 ? "disabled" : "") +
      ">" +
      i18nText("main.message328") +
      "</button></div>";
    $("original-prev").onclick = () => {
      originalPage--;
      showOriginalPage();
    };
    $("original-next").onclick = () => {
      originalPage++;
      showOriginalPage();
    };
  }
  action("original-button", async () => {
    if (!h.record) return;
    const pdf = songScores(h.record).find((s) => s.format === "pdf");
    if (!pdf) throw Error(i18nText("main.message329"));
    originalURLs.forEach(URL.revokeObjectURL);
    originalURLs = await Promise.all(
      pdf.pages.map(async (p) => URL.createObjectURL(await displayPage(p))),
    );
    const index = $<HTMLDialogElement>("editor-dialog").open
      ? h.selected
      : locate(song(), engine().current()).index;
    originalPage =
      pdf.regions.find((r) => r.id === pdf.measures[index]?.regionId)?.page ||
      0;
    showOriginalPage();
    openSettingsChild($<HTMLDialogElement>("original-dialog"));
  });
}
