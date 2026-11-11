import { songBeforeLyricFeedback } from "./lyric-feedback-fixture";
import { describe, it, expect } from "vitest";
import {
  applyListeningFeedbackBatch,
  feedbackCorrections as batchCorrections,
  feedbackBatchRevision as batchRevision,
} from "../../src/content/lyric-feedback-batch";
import {
  applyListeningFeedbackFollowup,
  feedbackCorrections as followupCorrections,
  feedbackBatchRevision as followupRevision,
} from "../../src/content/lyric-feedback-followup";
import {
  applyListeningFeedbackM36,
  feedbackCorrections as m36Corrections,
  feedbackBatchRevision as m36Revision,
} from "../../src/content/lyric-feedback-m36";
import { validateSong } from "../../src/model/model";
import type { Song } from "../../src/model/model";
describe.each([
  {
    revision: batchRevision,
    corrections: batchCorrections,
    apply: applyListeningFeedbackBatch,
    lastId: "v2-l88",
    count: 11,
  },
  {
    revision: followupRevision,
    corrections: followupCorrections,
    apply: applyListeningFeedbackFollowup,
    lastId: "v2-l91",
    count: 6,
  },
  {
    revision: m36Revision,
    corrections: m36Corrections,
    apply: applyListeningFeedbackM36,
    lastId: "v2-l179",
    count: 5,
  },
])(
  "listening feedback $revision",
  ({ revision, corrections, apply, lastId, count }) => {
    it("applies all coordinates, confirms prefix, preserves tail and raw times, runs once", () => {
      const s = songBeforeLyricFeedback(revision),
        before = structuredClone(s.lyrics),
        last = before.findIndex((l) => l.id === lastId);
      expect(apply(s)).toBe(count);
      for (const [id, , measureId, tick] of corrections)
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
      expect(apply(s)).toBe(0);
      expect(s).toEqual(once);
    });
    it("does not migrate unrelated songs or missing target text", () => {
      for (const mutate of [
        (s: Song) => {
          s.id = "other";
        },
        (s: Song) => {
          s.lyrics.find((l) => l.id === lastId)!.text = "other";
        },
      ]) {
        const s = songBeforeLyricFeedback(revision);
        mutate(s);
        const before = structuredClone(s);
        expect(apply(s)).toBe(0);
        expect(s).toEqual(before);
      }
    });
  },
);
