import {
  applyEnglishLyrics,
  correctBrightSpelling,
} from "../../content/english-lyrics";
import { applyListeningRevision } from "../../content/listening-revision";
import { applyBar34AcousticReview } from "../../content/lyric-bar34-review";
import { applyListeningFeedbackBatch } from "../../content/lyric-feedback-batch";
import { applyListeningFeedbackFollowup } from "../../content/lyric-feedback-followup";
import { applyListeningFeedbackM32 } from "../../content/lyric-feedback-m32";
import { applyListeningFeedbackM36 } from "../../content/lyric-feedback-m36";
import { applyListeningFeedbackM39 } from "../../content/lyric-feedback-m39";
import { applyListeningFeedbackM48 } from "../../content/lyric-feedback-m48";
import { applyTookuTailShift } from "../../content/lyric-tail-shift";
import lyricTimingRefinement from "../../content/lyric-timing-refinement";
import { validateSong, type Region, type Song } from "../../model/model";
import type { RecordData } from "../../model/record";
import {
  attachBundledScore,
  repairBundledMetadata,
} from "../../modules/library/bundled-score";
import {
  preferPDF,
  scorePreference,
} from "../../modules/library/score-preference";
import { enableLyricGrid } from "../../modules/lyrics/lyric-grid";
import { applyJapaneseReadings } from "../../modules/lyrics/lyric-reading";
import { applyLyricRevision } from "../../modules/lyrics/lyric-revision";
import { migrateLyricPositions } from "../../modules/lyrics/lyric-score";
import {
  applyLyricTimingPatch,
  applyUserLyricAnchors,
} from "../../modules/lyrics/lyric-timing";
import {
  ensureCanonical,
  readCanonical,
  verifyCanonicalAudio,
} from "../../modules/score/canonical-xml";
import { replaceWithMusicXML } from "../../modules/score/score-import";
import { SVG_GZIP } from "../../modules/score/score-pages";
import { correctStoredRests } from "../../modules/score/score-rest-correction";
import { songScores, useScore } from "../../modules/score/song-scores";
import { isPhoneLandscape } from "../../platform/browser/phone-layout";
import { saveRecord } from "../../platform/storage/storage";
import { t as i18nText } from "../../shared/i18n/i18n";

export type EditorScoreRenderer = (
  blob: Blob,
  format: Song["scoreFormat"],
  partId?: string,
) => Promise<{
  pages: Blob[];
  regions: Region[];
  parsed?: import("../../modules/score/musicxml").XMLScore;
}>;

/** Keep canonical validation and legacy migrations in their existing order, before activation becomes busy. */
export async function readEditorRecord(r: RecordData) {
  validateSong(r.song);
  if (r.canonicalXML) {
    await verifyCanonicalAudio(r);
    readCanonical(r.canonicalXML, r.song);
  } else {
    applyLyricTimingPatch(r.song);
    applyUserLyricAnchors(r.song);
    applyLyricTimingPatch(r.song, lyricTimingRefinement);
    applyLyricRevision(r.song);
    applyJapaneseReadings(r.song);
    applyEnglishLyrics(r.song);
    applyListeningRevision(r.song);
    enableLyricGrid(r.song);
    applyTookuTailShift(r.song);
    applyListeningFeedbackBatch(r.song);
    applyListeningFeedbackFollowup(r.song);
    applyListeningFeedbackM32(r.song);
    applyListeningFeedbackM36(r.song);
    applyBar34AcousticReview(r.song);
    correctBrightSpelling(r.song);
    applyListeningFeedbackM39(r.song);
    applyListeningFeedbackM48(r.song);
    migrateLyricPositions(r.song);
    await ensureCanonical(r);
  }
  validateSong(r.song);
}

/** Prepare record content only. The host owns the save queue, active record and media lifetime. */
export async function prepareEditorScore(
  r: RecordData,
  status: (message: string) => void,
  renderScore: EditorScoreRenderer,
) {
  if (await repairBundledMetadata(r)) await saveRecord(r);
  r = await attachBundledScore(r, status);
  r = await correctStoredRests(r, status);
  r = await (
    await import("../../modules/score/browser-score")
  ).prepareBrowserScore(r, status);
  const preferred = scorePreference(
    r,
    isPhoneLandscape() ? false : preferPDF(),
  ).format;
  if (preferred !== (r.song.scoreFormat ?? "pdf"))
    r = useScore(
      r,
      songScores(r).find((s) => s.format === preferred)!,
    );
  if (
    r.song.scoreFormat === "musicxml" &&
    r.pages.some((p) => p.type !== SVG_GZIP)
  ) {
    const rendered = await renderScore(r.pdf, "musicxml", r.song.scorePartId);
    if (!rendered.parsed) throw Error(i18nText("main.message219"));
    replaceWithMusicXML(
      r.song,
      { ...rendered, parsed: rendered.parsed },
      r.song.pdfName,
    );
    if (rendered.pages.length !== r.song.pageCount)
      throw Error(i18nText("main.message220"));
    // Same OSMD layout: keep normalized crops and any user beat-position edits.
    r = { ...r, pages: rendered.pages };
  }
  return r;
}
