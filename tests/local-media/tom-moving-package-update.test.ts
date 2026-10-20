import "fake-indexeddb/auto";
import {it,expect} from "vitest";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import JSZip from "jszip";
import {importPracticeRecord,loadPracticeRecord} from "../../src/platform/storage/practice-library";
import type { RecordData } from "../../src/model/record";
async function read(path:string):Promise<RecordData> {
 const zip=await JSZip.loadAsync(readFileSync(path));
 const m=JSON.parse(await zip.file("manifest.json")!.async("string"));
 const media=async(path:string,type:string)=>new Blob([new Uint8Array(await zip.file(path)!.async("uint8array"))],{type});
 return {song:m.song,canonicalXML:m.canonicalXML,pdf:await media(m.source.path,"application/xml"),audio:await media(m.audio.path,"audio/mpeg"),pages:await Promise.all(m.pages.map((p:{path:string})=>media(p.path,"image/svg+xml")))};
}
it("updates the shipped 28-bar score, audio and SVG cache while using incoming practice state on reopen",async()=>{
 const old=await read("data/reference/test-fixtures/tom-moving-28-portland.drumscore");
 const next=await read("public/scores/tom-moving.drumscore");
 old.song.settings.position=9.25;old.song.settings.rate=.8;
 old.song.markers=[{id:"local",name:"Practice",time:6.25}];
 old.song.loops=[{id:"local-loop",name:"Repeat",start:3.25,end:12.25}];
 await importPracticeRecord(old);
 const updated=await importPracticeRecord(next);
 expect(updated.status).toBe("replaced");
 const reopened=(await loadPracticeRecord(next.song.id))!;
 expect(reopened.song.title).toBe("탐탐 무빙 연습");
 expect(reopened.song.artist).toBe("Portland 드럼킷");
 expect(reopened.song.settings).toEqual({...next.song.settings, musicVolume:.5, clickVolume:1, click:true});
 expect(reopened.song.markers).toEqual(next.song.markers);
 expect(reopened.song.loops).toEqual(next.song.loops);
 expect(reopened.canonicalXML).toBe(next.canonicalXML);
 expect(createHash("sha256").update(Buffer.from(await reopened.audio.arrayBuffer())).digest("hex")).toBe("feb450641aef6b621af8a3e2380249a2efaca85ae1cefab51b66006012110e02");
 expect(Buffer.from(await reopened.pages[0].arrayBuffer())).toEqual(Buffer.from(await next.pages[0].arrayBuffer()));
 expect(reopened.canonicalXML).not.toBe(old.canonicalXML);
});
