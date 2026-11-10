import { songBeforeLyricFeedback } from "./lyric-feedback-fixture";
import { describe, it, expect } from "vitest";
import {
  applyListeningFeedbackBatch,
  feedbackCorrections,
  feedbackBatchRevision,
} from "../../src/content/lyric-feedback-batch";
import { validateSong } from "../../src/model/model";
import type { Song } from "../../src/model/model";
describe("accumulated listening feedback", () => {
  it("applies all coordinates, confirms prefix, preserves tail and raw times, runs once", () => {
    const s = songBeforeLyricFeedback(feedbackBatchRevision),
      before = structuredClone(s.lyrics),
      last = before.findIndex((l) => l.id === "v2-l88");
    expect(applyListeningFeedbackBatch(s)).toBe(11);
    for (const [id, , measureId, tick] of feedbackCorrections)
      expect(s.lyrics.find((l) => l.id === id)?.grid).toEqual({
        measureId,
        tick,
      });
    expect(s.lyrics.slice(0, last + 1).every((l) => l.confirmed)).toBe(true);
    expect(s.lyrics.slice(last + 1)).toEqual(before.slice(last + 1));
    expect(s.lyrics.map((l) => l.originalTime)).toEqual(
      before.map((l) => l.originalTime),
    );
    validateSong(s);
    const once = structuredClone(s);
    expect(applyListeningFeedbackBatch(s)).toBe(0);
    expect(s).toEqual(once);
  });
  it("does not migrate unrelated songs or missing target text", () => {
    for (const mutate of [
      (s: Song) => {
        s.id = "other";
      },
      (s: Song) => {
        s.lyrics.find((l) => l.id === "v2-l88")!.text = "other";
      },
    ]) {
      const s = songBeforeLyricFeedback(feedbackBatchRevision);
      mutate(s);
      const before = structuredClone(s);
      expect(applyListeningFeedbackBatch(s)).toBe(0);
      expect(s).toEqual(before);
    }
  });
});
