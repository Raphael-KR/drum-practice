import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { saveRecord, allRecords, deleteRecord } from "../src/storage";
it("round-trips blobs, edited syllables, markers, loops and 81% rate", async () => {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  song.id = "storage-test";
  song.settings.rate = 0.81;
  song.markers.push({ id: "test", name: "필인", time: 50 });
  song.loops = [{ id: "a", name: "연결", start: 50, end: 60 }];
  song.lyrics[0].text = "확인";
  song.lyrics[0].confirmed = true;
  await saveRecord({
    song,
    pdf: new Blob(["pdf"]),
    audio: new Blob(["audio"]),
    pages: [new Blob(["page"])],
  });
  const got = (await allRecords()).find((r) => r.song.id === song.id)!;
  expect(got.song).toEqual(song);
  expect(await got.audio.text()).toBe("audio");
  await deleteRecord(song.id);
  expect((await allRecords()).some((r) => r.song.id === song.id)).toBe(false);
});
