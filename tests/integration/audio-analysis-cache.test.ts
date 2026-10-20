import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {IDBFactory} from 'fake-indexeddb';
import {audioFileHash,loadAudioAnalysis,storeAudioAnalysis} from "../../src/platform/storage/audio-analysis-cache";
import {validAudioAnalysis,type AudioAnalysis} from "../../src/model/audio-analysis-contract";
import {openScoreDatabase} from "../../src/platform/storage/score-database";
const hash='a'.repeat(64);
const entry:AudioAnalysis={analyzerVersion:4,sha256:hash,title:'Local title',artist:'Artist',duration:10,bpm:120,firstBeat:.2,beats:4,denominator:4,confidence:.8,beatTimes:[.2,.7,1.2,1.7,2.2,2.7,3.2,3.7]};
beforeEach(()=>{vi.stubGlobal('indexedDB',new IDBFactory());vi.stubGlobal('fetch',vi.fn(()=>{throw Error('Network forbidden');}));});
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();});
it('hashes exact file bytes and validates version and beat map',async()=>{
 expect(await audioFileHash(new TextEncoder().encode('abc').buffer)).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
 expect(validAudioAnalysis(entry,hash)).toBe(true);
 for(const change of [{analyzerVersion:3},{bpm:NaN},{firstBeat:10},{confidence:0},{beatTimes:[1,0]}])expect(validAudioAnalysis({...entry,...change},hash)).toBe(false);
});
it('persists tags and beat times across database connections without any request',async()=>{
 expect(await loadAudioAnalysis(hash)).toBeUndefined();
 await storeAudioAnalysis(entry);
 expect(await loadAudioAnalysis(hash)).toEqual(entry);
 expect(await loadAudioAnalysis('b'.repeat(64))).toBeUndefined();
 expect(fetch).not.toHaveBeenCalled();
});
it('reanalyzed data replaces the cached value; invalid or outdated data is not reused',async()=>{
 await storeAudioAnalysis(entry);
 await storeAudioAnalysis({...entry,bpm:125});
 expect((await loadAudioAnalysis(hash))?.bpm).toBe(125);
 await storeAudioAnalysis({...entry,bpm:NaN});
 expect((await loadAudioAnalysis(hash))?.bpm).toBe(125);
 const db=await openScoreDatabase();
 await new Promise<void>((resolve,reject)=>{const tx=db.transaction('audioAnalyses','readwrite');tx.objectStore('audioAnalyses').put({...entry,analyzerVersion:3});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
 expect(await loadAudioAnalysis(hash)).toBeUndefined();
 expect(fetch).not.toHaveBeenCalled();
});
it('storage denial does not fall back to a server or prevent local analysis',async()=>{
 vi.stubGlobal('indexedDB',{open(){throw new DOMException('Denied','SecurityError');}});
 expect(await loadAudioAnalysis(hash)).toBeUndefined();
 await expect(storeAudioAnalysis(entry)).resolves.toBeUndefined();
 expect(fetch).not.toHaveBeenCalled();
});
it('upgrades the existing library without changing songs or migration markers',async()=>{
 const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('drum-practice',3);r.onupgradeneeded=()=>{r.result.createObjectStore('songs',{keyPath:'song.id'});r.result.createObjectStore('migrations');};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 const record={song:{id:'keep',title:'My score'},audio:'owned bytes'};
 await new Promise<void>((resolve,reject)=>{const tx=db.transaction(['songs','migrations'],'readwrite');tx.objectStore('songs').put(record);tx.objectStore('migrations').put(true,'player-library-v1');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
 await storeAudioAnalysis(entry);
 const next=await openScoreDatabase();
 const saved=await new Promise(resolve=>{const r=next.transaction('songs').objectStore('songs').get('keep');r.onsuccess=()=>resolve(r.result);});
 expect(saved).toEqual(record);expect(next.version).toBe(4);next.close();
 expect(await loadAudioAnalysis(hash)).toEqual(entry);
});
