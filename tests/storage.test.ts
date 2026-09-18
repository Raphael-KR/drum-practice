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
  // Repeated settings saves must own the media bytes after every DB close/reopen.
  for (let i = 0; i < 3; i++) {
    const reopened = (await allRecords()).find((r) => r.song.id === song.id)!;
    reopened.song.settings.position = i;
    await saveRecord(reopened);
  }
  const reopened = (await allRecords()).find((r) => r.song.id === song.id)!;
  expect(await reopened.pages[0].text()).toBe("page");
  expect(await reopened.audio.text()).toBe("audio");
  const db = await new Promise<IDBDatabase>((resolve) => {
    const request = indexedDB.open("drum-practice", 1);
    request.onsuccess = () => resolve(request.result);
  });
  const raw = await new Promise<any>((resolve) => {
    const request = db.transaction("songs").objectStore("songs").get(song.id);
    request.onsuccess = () => resolve(request.result);
  });
  db.close();
  expect(raw.mediaFormat).toBe("bytes-v1");
  expect(raw.pages[0].bytes).toBeInstanceOf(ArrayBuffer);
  await deleteRecord(song.id);
  expect((await allRecords()).some((r) => r.song.id === song.id)).toBe(false);
});
it("preserves the saved song when reading a media blob fails", async () => {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  song.id = "failed-media-save";
  const record = { song, pdf: new Blob(["pdf"]), audio: new Blob(["audio"]), pages: [new Blob(["page"])] };
  await saveRecord(record);
  const broken = new Blob(["missing"]);
  broken.arrayBuffer = async () => { throw new Error("missing backing file"); };
  await expect(saveRecord({ ...record, song: { ...song, title: "should not overwrite" }, pages: [broken] })).rejects.toThrow("missing backing file");
  const preserved = (await allRecords()).find(r => r.song.id === song.id)!;
  expect(preserved.song.title).toBe(song.title);
  expect(await preserved.pages[0].text()).toBe("page");
  await deleteRecord(song.id);
});
