import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { readScorePackage } from "../../src/modules/library/score-package";
import { preservedScoreLayout } from "./preserved-score-layout";
import {
  importPracticeRecord,
  loadPracticeRecord,
} from "../../src/platform/storage/practice-library";
it("updates the shipped 28-bar source and audio while using incoming practice state on reopen", async () => {
  const old = await preservedScoreLayout(
    "data/reference/test-fixtures/tom-moving-28-portland.drumscore",
  );
  const next = await readScorePackage(
    new Blob([readFileSync("public/scores/tom-moving.drumscore")]),
  );
  old.song.settings.position = 9.25;
  old.song.settings.rate = 0.8;
  old.song.markers = [{ id: "local", name: "Practice", time: 6.25 }];
  old.song.loops = [
    { id: "local-loop", name: "Repeat", start: 3.25, end: 12.25 },
  ];
  await importPracticeRecord(old);
  const updated = await importPracticeRecord(next);
  expect(updated.status).toBe("replaced");
  const reopened = (await loadPracticeRecord(next.song.id))!;
  expect(reopened.song.title).toBe("탐탐 무빙 연습");
  expect(reopened.song.artist).toBe("Portland 드럼킷");
  expect(reopened.song.settings).toEqual({
    ...next.song.settings,
    clickDivision: 4,
    musicVolume: 0.5,
    clickVolume: 1,
    click: true,
  });
  expect(reopened.song.markers).toEqual(next.song.markers);
  expect(reopened.song.loops).toEqual(next.song.loops);
  expect(reopened.canonicalXML).toBe(next.canonicalXML);
  expect(
    createHash("sha256")
      .update(Buffer.from(await reopened.audio.arrayBuffer()))
      .digest("hex"),
  ).toBe("feb450641aef6b621af8a3e2380249a2efaca85ae1cefab51b66006012110e02");
  expect(reopened.pages).toEqual([]);
  expect(reopened.song.regions).toEqual([]);
  expect(reopened.canonicalXML).not.toBe(old.canonicalXML);
});
