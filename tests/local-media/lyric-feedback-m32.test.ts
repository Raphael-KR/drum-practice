import { songBeforeLyricFeedback } from "./lyric-feedback-fixture";
import { it, expect } from "vitest";
import {
  applyListeningFeedbackM32,
  feedbackCorrections,
  feedbackBatchRevision,
} from "../../src/content/lyric-feedback-m32";
import { validateSong, type Song } from "../../src/model/model";
it("applies latest feedback, splits again, preserves source times and tail, runs once", () => {
  const s = songBeforeLyricFeedback(feedbackBatchRevision),
    before = structuredClone(s.lyrics),
    end = before.findIndex((l) => l.id === "v2-l147");
  expect(applyListeningFeedbackM32(s)).toBe(21);
  for (const [id, , measureId, tick] of feedbackCorrections)
    expect(s.lyrics.find((l) => l.id === id)?.grid).toEqual({
      measureId,
      tick,
    });
  expect(s.lyrics.find((l) => l.id === "v2-l140")).toMatchObject({
    text: "a-",
    grid: { measureId: "m31", tick: 5 },
  });
  expect(s.lyrics.find((l) => l.id === "v2-l140-gain")).toMatchObject({
    text: "gain",
    grid: { measureId: "m31", tick: 8 },
  });
  expect(s.lyrics.slice(end + 2)).toEqual(before.slice(end + 1));
  expect(s.lyrics.slice(0, end + 2).every((l) => l.confirmed)).toBe(true);
  for (const old of before)
    expect(s.lyrics.find((l) => l.id === old.id)?.originalTime).toBe(
      old.originalTime,
    );
  expect(new Set(s.lyrics.map((l) => l.id)).size).toBe(s.lyrics.length);
  validateSong(s);
  const once = structuredClone(s);
  expect(applyListeningFeedbackM32(s)).toBe(0);
  expect(s).toEqual(once);
});
it("leaves unrelated or incompatible songs untouched", () => {
  for (const mutate of [
    (s: Song) => {
      s.id = "other";
    },
    (s: Song) => {
      s.lyrics.find((l) => l.id === "v2-l140")!.text = "edited";
    },
  ]) {
    const s = songBeforeLyricFeedback(feedbackBatchRevision);
    mutate(s);
    const before = structuredClone(s);
    expect(applyListeningFeedbackM32(s)).toBe(0);
    expect(s).toEqual(before);
  }
});
