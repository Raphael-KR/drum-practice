import { songBeforeLyricFeedback } from "./lyric-feedback-fixture";
import { it, expect } from "vitest";
import {
  applyBar34AcousticReview,
  feedbackCorrections,
  feedbackBatchRevision,
} from "../../src/content/lyric-bar34-review";
import { validateSong } from "../../src/model/model";
it("preserves listening anchors, separates estimates, limits changes to phrase, applies once", () => {
  const s = songBeforeLyricFeedback(feedbackBatchRevision);
  const before = structuredClone(s.lyrics),
    ids = new Set<string>(feedbackCorrections.map((r) => r[0]));
  expect(applyBar34AcousticReview(s)).toBe(5);
  for (const [id, , measureId, tick] of feedbackCorrections)
    expect(s.lyrics.find((l) => l.id === id)?.grid).toEqual({
      measureId,
      tick,
    });
  expect(s.lyrics.filter((l) => !ids.has(l.id))).toEqual(
    before.filter((l) => !ids.has(l.id)),
  );
  expect(s.lyrics.find((l) => l.id === "v2-l162")?.confirmed).toBe(false);
  expect(s.lyrics.find((l) => l.id === "v2-l157")?.confirmed).toBe(true);
  validateSong(s);
  const once = structuredClone(s);
  expect(applyBar34AcousticReview(s)).toBe(0);
  expect(s).toEqual(once);
});
