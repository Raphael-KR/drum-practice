import { songBeforeLyricFeedback } from "./lyric-feedback-fixture";
import { it, expect } from "vitest";
import {
  applyListeningFeedbackM48,
  feedbackCorrections,
  feedbackBatchRevision,
} from "../../src/content/lyric-feedback-m48";
import { validateSong, type Song } from "../../src/model/model";
it("applies 13 changed starts, confirms through gat, preserves other starts and entire tail", () => {
  const s = songBeforeLyricFeedback(feedbackBatchRevision),
    before = structuredClone(s.lyrics),
    last = before.findIndex((l) => l.id === "v2-l246");
  expect(applyListeningFeedbackM48(s)).toBe(13);
  for (const [id, , measureId, tick] of feedbackCorrections)
    expect(s.lyrics.find((l) => l.id === id)?.grid).toEqual({
      measureId,
      tick,
    });
  const ids = new Set<string>(feedbackCorrections.map((c) => c[0]));
  for (const l of before.filter((l) => !ids.has(l.id))) {
    const after = s.lyrics.find((a) => a.id === l.id)!;
    expect(after.time).toBe(l.time);
    expect(after.grid).toEqual(l.grid);
  }
  expect(s.lyrics.slice(last + 1)).toEqual(before.slice(last + 1));
  expect(s.lyrics.slice(0, last + 1).every((l) => l.confirmed)).toBe(true);
  expect(s.lyrics.map((l) => [l.id, l.text])).toEqual(
    before.map((l) => [l.id, l.text]),
  );
  expect(s.lyricArchive!.at(-1)!.lyrics).toEqual(before);
  validateSong(s);
  const once = structuredClone(s);
  expect(applyListeningFeedbackM48(s)).toBe(0);
  expect(s).toEqual(once);
});
it("preserves unexpected user edits and skips other songs or missing prerequisites", () => {
  for (const edit of [
    (s: Song) => {
      s.id = "other";
    },
    (s: Song) => {
      s.lyricShifts = [];
    },
    (s: Song) => {
      s.lyrics.find((l) => l.id === "v2-l223")!.text = "custom";
    },
  ]) {
    const s = songBeforeLyricFeedback(feedbackBatchRevision);
    edit(s);
    const before = structuredClone(s);
    expect(applyListeningFeedbackM48(s)).toBe(0);
    expect(s).toEqual(before);
  }
});
