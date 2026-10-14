import {afterEach,expect,it,vi} from 'vitest';
import {audioFileHash,loadAudioAnalysis,storeAudioAnalysis} from '../src/audio-analysis-cache';
import {validAudioAnalysis,type AudioAnalysis} from '../src/audio-analysis-contract';
const hash='a'.repeat(64);
export const entry:AudioAnalysis={analyzerVersion:4,sha256:hash,title:'곡',artist:'가수',duration:10,bpm:120,firstBeat:.2,beats:4,denominator:4,confidence:.8};
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();vi.useRealTimers();});
it('hashes exact bytes and rejects incompatible or private extra fields',async()=>{
  expect(await audioFileHash(new TextEncoder().encode('abc').buffer)).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  expect(validAudioAnalysis(entry,hash)).toBe(true);
  for(const change of [{audio:'base64'},{filename:'private.mp3'},{analyzerVersion:1},{analyzerVersion:2},{bpm:NaN},{firstBeat:10},{confidence:0},{title:'a'.repeat(301)}])
    expect(validAudioAnalysis({...entry,...change},hash)).toBe(false);
});
it('reads matching JSON only and fails open for unavailable or invalid cache',async()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
  fetch.mockResolvedValueOnce(Response.json(entry));expect(await loadAudioAnalysis(hash)).toEqual(entry);
  for(const response of [new Response('missing',{status:404}),new Response('<html>'),new Response('{',{headers:{'content-type':'application/json'}}),Response.json({...entry,sha256:'b'.repeat(64)}),Response.json({...entry,analyzerVersion:2,bpm:80})]) {
    fetch.mockResolvedValueOnce(response);expect(await loadAudioAnalysis(hash)).toBeUndefined();
  }
  fetch.mockRejectedValue(new DOMException('timeout','TimeoutError'));expect(await loadAudioAnalysis(hash)).toBeUndefined();
});
it('sends metadata JSON only without credentials and tolerates write failures',async()=>{
  const fetch=vi.fn().mockRejectedValue(new Error('offline'));vi.stubGlobal('fetch',fetch);
  await expect(storeAudioAnalysis(entry)).resolves.toBeUndefined();
  const [url,options]=fetch.mock.calls[0];expect(url.endsWith(hash)).toBe(true);
  expect(options.credentials).toBe('omit');expect(options.method).toBe('PUT');
  expect(JSON.parse(options.body)).toEqual(entry);
  await storeAudioAnalysis({...entry,confidence:0});expect(fetch).toHaveBeenCalledTimes(2);
});

it('retries a temporary failure once but never retries a missing or invalid entry',async()=>{
  const fetch=vi.fn().mockResolvedValueOnce(new Response('busy',{status:503})).mockResolvedValueOnce(Response.json(entry));vi.stubGlobal('fetch',fetch);
  expect(await loadAudioAnalysis(hash)).toEqual(entry);expect(fetch).toHaveBeenCalledTimes(2);
  fetch.mockClear().mockResolvedValue(new Response('missing',{status:404}));
  expect(await loadAudioAnalysis(hash)).toBeUndefined();expect(fetch).toHaveBeenCalledTimes(1);
});
it('allows a 2-second lookup, which exceeded the old 1.5-second deadline',async()=>{
  vi.useFakeTimers();
  vi.spyOn(AbortSignal,'timeout').mockImplementation(ms=>{const c=new AbortController();setTimeout(()=>c.abort(new DOMException('timeout','TimeoutError')),ms);return c.signal;});
  try {
    const fetch=vi.fn<typeof globalThis.fetch>((_,init)=>new Promise<Response>((resolve,reject)=>{
      init?.signal?.addEventListener('abort',()=>reject(init.signal?.reason),{once:true});
      setTimeout(()=>resolve(Response.json(entry)),2000);
    }));vi.stubGlobal('fetch',fetch);
    const result=loadAudioAnalysis(hash);await vi.advanceTimersByTimeAsync(2000);
    expect(await result).toEqual(entry);expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(false);
  } finally { vi.useRealTimers(); }
});
it('retries a dropped write and preserves the metadata-only keepalive payload',async()=>{
  const fetch=vi.fn().mockRejectedValueOnce(new TypeError('network')).mockResolvedValueOnce(Response.json({stored:true}));vi.stubGlobal('fetch',fetch);
  await storeAudioAnalysis(entry);expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch.mock.calls[1][1].keepalive).toBe(true);expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual(entry);
});
it('uses a normal bounded request for beat maps above the keepalive quota',async()=>{
 const fetch=vi.fn().mockResolvedValue(Response.json({stored:true}));vi.stubGlobal('fetch',fetch);
 const large={...entry,duration:10001,firstBeat:0,beatTimes:Array.from({length:20000},(_,i)=>i*.5)};
 expect(validAudioAnalysis(large,hash)).toBe(true);
 await storeAudioAnalysis(large);expect(fetch.mock.calls[0][1].keepalive).toBe(false);
 expect(new TextEncoder().encode(fetch.mock.calls[0][1].body).length).toBeLessThan(256*1024);
});
it('does not retry quota denials or queue-full responses',async()=>{
 const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
 for(const status of [429,503]){
  fetch.mockReset().mockResolvedValue(new Response('',{status,headers:{'Retry-After':'3600'}}));
  await storeAudioAnalysis(entry);expect(fetch).toHaveBeenCalledTimes(1);
 }
});
