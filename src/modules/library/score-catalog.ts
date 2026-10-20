import bundledScores from "../../content/bundled-scores.json";
import type { RecordData } from "../../model/record";
import { RETIRED_SCORE_ID } from "../../platform/storage/score-database";
import { t } from "../../shared/i18n/i18n";
import { escapeHTML } from "../../shared/ui/html";

export type LibraryCategory = "basic" | "personal" | "audio";
export type BundledScore = (typeof bundledScores)[number];
export interface ScoreCatalogEntry {
  id: string;
  category: LibraryCategory;
  record?: RecordData;
  bundled?: BundledScore;
}

/** One catalog for both apps: saved edits win; missing bundled scores remain visible. */
export function scoreCatalog(records: RecordData[]): ScoreCatalogEntry[] {
  const bundled = new Map(bundledScores.map((score) => [score.id, score]));
  const entries = new Map<string, ScoreCatalogEntry>();
  for (const record of records) {
    const id = record.song.id;
    if (id === RETIRED_SCORE_ID) continue;
    const score = bundled.get(id);
    entries.set(id, {
      id,
      record,
      bundled: score,
      category: record.song.audioPractice
        ? "audio"
        : score?.category === "basic"
          ? "basic"
          : "personal",
    });
  }
  for (const score of bundledScores) {
    if (score.id === RETIRED_SCORE_ID || entries.has(score.id)) continue;
    entries.set(score.id, {
      id: score.id,
      bundled: score,
      category: score.category === "basic" ? "basic" : "personal",
    });
  }
  const all = [...entries.values()];
  const order = new Map(bundledScores.map((score, index) => [score.id, index]));
  return [
    ...all
      .filter((entry) => entry.category === "basic")
      .sort((a, b) => order.get(a.id)! - order.get(b.id)!),
    ...all.filter((entry) => entry.category === "personal"),
    ...all.filter((entry) => entry.category === "audio"),
  ];
}

/** Shared section names and structure; callers supply app-specific actions. */
export function librarySectionHTML(
  category: LibraryCategory,
  listId: string,
  headingId: string,
  content = "",
  hidden = false,
) {
  const key = {
    basic: "library.basicExercise",
    personal: "separation.library",
    audio: "library.myAudio",
  } as const;
  return `<section class="library-section" aria-labelledby="${headingId}"${hidden ? " hidden" : ""}><div class="library-heading"><h2 id="${headingId}">${escapeHTML(t(key[category]))}</h2></div><div id="${listId}" class="practice-records">${content}</div></section>`;
}
