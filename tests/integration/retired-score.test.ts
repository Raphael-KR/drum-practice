import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import { RETIRED_SCORE_ID } from "../../src/platform/storage/score-database";
it("does not accept the retired edition again", async () => {
  const { savePracticeRecord } =
    await import("../../src/platform/storage/practice-library");
  await expect(
    savePracticeRecord({
      song: { id: RETIRED_SCORE_ID },
      pages: [],
    } as unknown as import("../../src/model/record").RecordData),
  ).rejects.toThrow("16마디");
});
