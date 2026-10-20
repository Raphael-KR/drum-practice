import { download } from "../../platform/browser/download";
import { t as i18nText } from "../../shared/i18n/i18n";

import type { RecordData } from "../../model/record";
import { replaceWithMusicXML } from "../../modules/score/score-import";
import { SVG_GZIP } from "../../modules/score/score-pages";
import { saveRecord } from "../../platform/storage/storage";
import { ScoreReview, copyReviewImage, reviewPair } from "./score-review";

import { type Song } from "../../model/model";
import { $ } from "./editor-dom";
interface ReviewHost {
  record(): RecordData | undefined;
  song(): Song;
  engine(): { current(): number; pause(): void };
  renderScore(
    blob: Blob,
    format: Song["scoreFormat"],
    partId?: string,
  ): Promise<{
    pages: Blob[];
    regions: import("../../model/model").Region[];
    parsed?: import("../../modules/score/musicxml").XMLScore;
  }>;
  action(id: string, fn: () => unknown): void;
  error(error: unknown): void;
}
export function createEditorReview(h: ReviewHost) {
  const { song, engine, renderScore, action, error } = h;
  let review: ScoreReview | undefined;
  let reviewGeneration = 0;
  let reviewPNG: Promise<Blob> | undefined;
  async function prepareReview() {
    const generation = ++reviewGeneration;
    review?.dispose();
    review = undefined;
    $("review-copy").setAttribute("disabled", "");
    try {
      const sourceRecord = h.record()!;
      const pair = reviewPair(sourceRecord);
      if (
        pair[1].pages.some(
          (p) => p.type !== SVG_GZIP && p.type !== "image/svg+xml",
        )
      ) {
        const rendered = await renderScore(
          pair[1].source,
          "musicxml",
          pair[1].partId,
        );
        if (!rendered.parsed) throw Error(i18nText("main.message219"));
        replaceWithMusicXML(
          sourceRecord.song,
          { ...rendered, parsed: rendered.parsed },
          pair[1].name,
        );
        if (rendered.pages.length !== pair[1].pages.length)
          throw Error(i18nText("main.message238"));
        if (generation !== reviewGeneration) return;
        pair[1] = { ...pair[1], pages: rendered.pages };
        if (sourceRecord.song.scoreFormat === "musicxml")
          sourceRecord.pages = rendered.pages;
        else
          sourceRecord.otherScores = sourceRecord.otherScores?.map((s) =>
            s.format === "musicxml" ? pair[1] : s,
          );
        await saveRecord(sourceRecord);
      }
      if (generation !== reviewGeneration) return;
      const candidate = new ScoreReview(
        $<HTMLCanvasElement>("review-canvas"),
        song(),
        pair,
      );
      try {
        await candidate.load();
      } catch (e) {
        candidate.dispose();
        throw e;
      }
      if (generation !== reviewGeneration) {
        candidate.dispose();
        return;
      }
      review = candidate;
      review.draw(engine().current());
      $("review-copy").removeAttribute("disabled");
    } catch (e) {
      if (generation === reviewGeneration) {
        $("review-message").textContent = String(e);
        error(e);
      }
    }
  }
  function captureReview() {
    engine().pause();
    if (!review) {
      $("review-message").textContent = i18nText("main.message239");
      return;
    }
    const time = engine().current();
    reviewPNG = review.snapshot(time);
    $("review-save").hidden = false;
    void copyReviewImage(reviewPNG).then(
      () => {
        $("review-message").textContent = i18nText("main.message240");
      },
      () => {
        $("review-message").textContent = i18nText("main.message241");
      },
    );
    void reviewPNG.catch(error);
  }
  action("review-copy", captureReview);
  action("review-save", async () => {
    if (!reviewPNG) return;
    download(await reviewPNG, i18nText("main.message242"));
  });
  return {
    capture: captureReview,
    prepare: prepareReview,
    draw: (time: number) => review?.draw(time),
    dispose() {
      reviewGeneration++;
      review?.dispose();
      review = undefined;
    },
  };
}
