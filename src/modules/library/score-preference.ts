import { t as i18nText } from "../../shared/i18n/i18n";
import { songScores } from "../score/song-scores";
import type { ScoreFormat } from "../../model/record";
import type { RecordData } from "../../model/record";
const KEY = "drum-practice.prefer-pdf";
let fallback = false;
export function preferPDF() {
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return fallback;
  }
}
export function savePreferPDF(value: boolean) {
  fallback = value;
  try {
    localStorage.setItem(KEY, String(value));
  } catch {
    /* Session fallback. */
  }
}
export function scorePreference(record: RecordData, preferred = preferPDF()) {
  const formats = songScores(record).map((s) => s.format);
  const pdf = formats.includes("pdf"),
    xml = formats.includes("musicxml");
  const format: ScoreFormat = pdf && (preferred || !xml) ? "pdf" : "musicxml";
  return {
    format,
    checked: format === "pdf",
    disabled: !pdf || !xml,
    message: !pdf
      ? i18nText("score-preference.message526")
      : !xml
        ? i18nText("score-preference.message527")
        : i18nText("main.message227"),
  };
}
