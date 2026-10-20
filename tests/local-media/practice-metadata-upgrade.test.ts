// @vitest-environment jsdom
import "fake-indexeddb/auto";
import { it, expect, vi, afterEach } from "vitest";
import { webcrypto } from "node:crypto";
import { Blob as NodeBlob } from "node:buffer";
import { readFileSync } from "node:fs";
import JSZip from "jszip";
import { practiceMetadataUpgrade } from "../../src/modules/library/practice-metadata-upgrade";
import { savePracticeRecord, listPracticeRecords, loadPracticeRecord } from "../../src/platform/storage/practice-library";
import type { RecordData } from "../../src/model/record";
afterEach(() => vi.unstubAllGlobals());
for (const [file,oldArtist,title,artist] of [
 ["tom-moving","탁선생의 쿵치타치","탐탐 무빙 연습","Portland 드럼킷"],
]) it(`repairs ${file} saved labels without changing media, score or practice records`, async () => {
 vi.stubGlobal("crypto",webcrypto); vi.stubGlobal("Blob",NodeBlob);
 const zip=await JSZip.loadAsync(readFileSync(`public/scores/${file}.drumscore`));
 const m=JSON.parse(await zip.file("manifest.json")!.async("string"));
 const song={...m.song,title:"탐탐 무빙 연습",artist:oldArtist};
 song.settings.rate=.75; song.settings.position=4;
 const record={song,canonicalXML:m.canonicalXML,audio:new NodeBlob([await zip.file(m.audio.path)!.async("uint8array")]),pdf:new NodeBlob(["source-preserved"]),pages:[]} as unknown as RecordData;
 const next=await practiceMetadataUpgrade(record);
 expect(next!.song.title).toBe(title);expect(next!.song.artist).toBe(artist);
 expect(next!.song.measures).toEqual(record.song.measures);
 expect(next!.song.settings).toEqual(record.song.settings);
 expect(next!.audio).toBe(record.audio);expect(next!.pdf).toBe(record.pdf);
 await savePracticeRecord(record);
 const listed=(await listPracticeRecords()).find(r=>r.song.id===song.id)!;
 expect(listed.song.artist).toBe(artist);expect(listed.song.title).toBe(title);
 expect(listed.song.settings).toEqual(record.song.settings);
 expect((await loadPracticeRecord(song.id))!.song.artist).toBe(artist);
 expect(await practiceMetadataUpgrade({...record,audio:new NodeBlob(["unrecognized sound"]) as unknown as Blob})).toBeUndefined();
 expect(await practiceMetadataUpgrade({...record,song:{...song,title:"My custom exercise"}})).toBeUndefined();
});
