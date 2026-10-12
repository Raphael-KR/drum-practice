import {afterEach,expect,it,vi} from 'vitest';
import {audioFileHash,loadAudioAnalysis,storeAudioAnalysis} from '../src/audio-analysis-cache';
import {validAudioAnalysis,type AudioAnalysis} from '../src/audio-analysis-contract';
const hash='a'.repeat(64);
export const entry:AudioAnalysis={analyzerVersion:1,sha256:hash,title:'곡',artist:'가수',duration:10,bpm:120,firstBeat:.2,beats:4,denominator:4,confidence:.8};
afterEach(()=>vi.unstubAllGlobals());
it('hashes exact bytes and rejects incompatible or private extra fields',async()=>{
  expect(await audioFileHash(new TextEncoder().encode('abc').buffer)).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  expect(validAudioAnalysis(entry,hash)).toBe(true);
  for(const change of [{audio:'base64'},{filename:'private.mp3'},{analyzerVersion:2},{bpm:NaN},{firstBeat:10},{confidence:0},{title:'a'.repeat(301)}])
    expect(validAudioAnalysis({...entry,...change},hash)).toBe(false);
});
it('reads matching JSON only and fails open for unavailable or invalid cache',async()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
  fetch.mockResolvedValueOnce(Response.json(entry));expect(await loadAudioAnalysis(hash)).toEqual(entry);
  for(const response of [new Response('missing',{status:404}),new Response('<html>'),Response.json({...entry,sha256:'b'.repeat(64)})]) {
    fetch.mockResolvedValueOnce(response);expect(await loadAudioAnalysis(hash)).toBeUndefined();
  }
  fetch.mockRejectedValueOnce(new DOMException('timeout','TimeoutError'));expect(await loadAudioAnalysis(hash)).toBeUndefined();
});
it('sends metadata JSON only without credentials and tolerates write failures',async()=>{
  const fetch=vi.fn().mockRejectedValue(new Error('offline'));vi.stubGlobal('fetch',fetch);
  await expect(storeAudioAnalysis(entry)).resolves.toBeUndefined();
  const [url,options]=fetch.mock.calls[0];expect(url.endsWith(hash)).toBe(true);
  expect(options.credentials).toBe('omit');expect(options.method).toBe('PUT');
  expect(JSON.parse(options.body)).toEqual(entry);
  await storeAudioAnalysis({...entry,confidence:0});expect(fetch).toHaveBeenCalledTimes(1);
});
