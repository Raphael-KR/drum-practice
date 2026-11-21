import type { RecordData } from "../../model/record";
import type { CorrectedLyric } from "../../model/lyric-correction";
import { formatDate, t } from "../../shared/i18n/i18n";

/** Durable lyric edits are separate from the ten undo snapshots. */
export function appendLyricCorrectionHistory(
  container: HTMLElement,
  record: RecordData,
) {
  if (!record.lyricCorrections?.length) return;
  const section = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = t("lyric-corrections.history", {
    count: record.lyricCorrections.length,
  });
  section.append(summary);
  const describe = (value?: CorrectedLyric) => {
    if (!value) return t("lyric-corrections.absent");
    const p = value.scorePosition;
    const measure =
      record.song.measures.find((m) => m.id === p.measureId)?.label ||
      p.measureId;
    return t("lyric-corrections.position", {
      text: value.text,
      measure,
      start: p.quarterOffset,
      duration: p.durationQuarters,
      confirmed: t(
        value.confirmed
          ? "lyric-corrections.confirmed"
          : "lyric-corrections.unconfirmed",
      ),
    });
  };
  for (const event of [...record.lyricCorrections].reverse()) {
    const item = document.createElement("details");
    const title = document.createElement("summary");
    title.textContent = formatDate(new Date(event.savedAt));
    item.append(title);
    for (const change of event.changes) {
      const line = document.createElement("p");
      line.textContent = `${describe(change.before)} → ${describe(change.after)}`;
      item.append(line);
    }
    section.append(item);
  }
  container.append(section);
}
