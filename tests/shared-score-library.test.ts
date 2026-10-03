import { IDBFactory } from "fake-indexeddb";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { allRecords, saveRecord } from "../src/storage";
import { listPracticeRecords, loadPracticeRecord, savePracticeState, savePracticeRecord, listPracticeArchives } from "../src/practice-library";
import type { RecordData } from "../src/storage";
beforeEach(() => vi.stubGlobal("indexedDB", new IDBFactory()));
afterEach(() => vi.unstubAllGlobals());
function record(id: string): RecordData {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  song.id = id;
  return { song, canonicalXML: "<score-partwise/>", pdf:new Blob(["score"]), audio:new Blob(["audio"]), pages:[] };
}
async function seed(name: string, records: RecordData[], archives: boolean) {
  const db = await new Promise<IDBDatabase>((resolve,reject) => {
    const r=indexedDB.open(name,1);
    r.onupgradeneeded=()=>{r.result.createObjectStore("songs",{keyPath:"song.id"});if(archives)r.result.createObjectStore("archives",{autoIncrement:true});};
    r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
  });
  await new Promise<void>((resolve,reject)=>{
    const t=db.transaction("songs","readwrite");records.forEach(r=>t.objectStore("songs").put(r));
    t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);
  });db.close();
}
it("both apps read the same record and practice saves retain authoring data",async()=>{
  const r=record("shared");await saveRecord(r);
  expect((await listPracticeRecords()).map(r=>r.song.id)).toEqual(["shared"]);
  const played=(await loadPracticeRecord("shared"))!;
  played.song.settings.musicVolume=.42;
  await savePracticeState("shared",played.song);
  const saved=(await allRecords())[0];
  expect(saved.song.settings.musicVolume).toBe(.42);
  expect(saved.canonicalXML).toBe(r.canonicalXML);
  expect(await saved.pdf.text()).toBe("score");
  await savePracticeRecord(record("from-player"));
  expect((await allRecords()).map(r=>r.song.id)).toContain("from-player");
});
it("migrates player-only records once and archives collisions without overwriting editor",async()=>{
  const editor=record("collision");editor.song.title="Editor";
  const player=record("collision");player.song.title="Player";
  await seed("drum-practice",[editor],false);
  await seed("drum-practice-player",[player,record("player-only")],true);
  await Promise.all([allRecords(),listPracticeRecords()]);
  expect((await allRecords()).length).toBe(2);
  expect((await loadPracticeRecord("collision"))!.song.title).toBe("Editor");
  expect((await listPracticeArchives("collision")).map(a=>a.record.song.title)).toEqual(["Player"]);
  await allRecords();
  expect((await listPracticeArchives("collision")).length).toBe(1);
});
