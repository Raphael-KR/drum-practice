// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {Blob as NativeBlob} from 'node:buffer';
import {attachBundledScore} from '../src/bundled-score';
vi.stubGlobal('Blob',NativeBlob);vi.stubGlobal('crypto',webcrypto);
vi.mock('../src/musicxml',async original=>{
 const actual=await original<typeof import('../src/musicxml')>();
 return {...actual,renderMusicXML:async(blob:Blob)=>{
 const parsed=actual.parseMusicXML(await blob.text());
 const song=JSON.parse(readFileSync('public/demo/song.json','utf8'));
 return {parsed,regions:song.regions,pages:Array.from({length:3},()=>new Blob(['SVG']))};
 }};
});
it('attaches bundled XML once without changing PDF, timeline or lyrics',async()=>{
 const song=JSON.parse(readFileSync('public/demo/song.json','utf8'));
 const r={song,pdf:new Blob([readFileSync('public/demo/score.pdf')]),audio:new Blob(),pages:[new Blob()]};
 const before=structuredClone(song);
 const fetcher=vi.fn().mockResolvedValue({ok:true,blob:async()=>new Blob([readFileSync('public/demo/score.musicxml')])});vi.stubGlobal('fetch',fetcher);
 const next=await attachBundledScore(r,()=>{});
 expect(next.pdf).toBe(r.pdf);expect(next.pages).toBe(r.pages);
 expect(next.song.measures).toEqual(before.measures);expect(next.song.lyrics).toEqual(before.lyrics);
 expect(next.otherScores?.[0].format).toBe('musicxml');
 expect(await attachBundledScore(next,()=>{})).toBe(next);expect(fetcher).toHaveBeenCalledOnce();
 const unrelated={...r,pdf:new Blob(['different PDF'])};expect(await attachBundledScore(unrelated,()=>{})).toBe(unrelated);
 vi.unstubAllGlobals();
}, 20000);
it('repairs legacy metadata from verified source while preserving display title and timing',async()=>{
 vi.stubGlobal('Blob',NativeBlob);vi.stubGlobal('crypto',webcrypto);
 const {repairBundledMetadata}=await import('../src/bundled-score');
 const {metadataFromXML}=await import('../src/canonical-xml');
 const song=JSON.parse(readFileSync('public/demo/song.json','utf8'));
 song.originalTitle=song.title;
 const before=structuredClone(song);
 const r={song,pdf:new Blob([readFileSync('public/demo/score.pdf')]),audio:new Blob(),pages:[new Blob()],canonicalXML:undefined as string|undefined};
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,blob:async()=>new Blob([readFileSync('public/demo/score.musicxml')])}));
 expect(await repairBundledMetadata(r)).toBe(true);
 expect(song.originalTitle).toBe('風と丘のバラード');
 expect(song.artist).toBe('Real Paradis with のだめオーケストラ');
 expect(song.lyricist).toBe('Jane Su');expect(song.composer).toBe('野村陽一郎');
 expect(song.title).toBe(before.title);expect(song.measures).toEqual(before.measures);expect(song.lyrics).toEqual(before.lyrics);
 expect(metadataFromXML(r.canonicalXML!).artist).toBe(song.artist);
 expect(await repairBundledMetadata(r)).toBe(false);
 r.song={...before,artist:'Custom artist'};
 expect(await repairBundledMetadata(r)).toBe(false);
 vi.unstubAllGlobals();
}, 20000);
