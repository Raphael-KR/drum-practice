import { ANALYSIS_PATH, validAudioAnalysis, type AudioAnalysis } from './audio-analysis-contract';
export async function audioFileHash(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
}
const transient = new Set([408,429,500,502,503,504]);
/** Bounded retry for a slow connection; never retry a miss or a rejected payload. */
async function requestAnalysis(hash:string, init:RequestInit, read:boolean):Promise<unknown> {
  for(let attempt=0;attempt<2;attempt++) {
    try {
      const response=await fetch(`${ANALYSIS_PATH}${hash}`,{
        ...init,signal:AbortSignal.timeout(read ? 4000 : 8000),credentials:'omit',cache:'no-store',redirect:'error',
      });
      if(response.ok) {
        if(!read){await response.body?.cancel();return;}
        if(!response.headers.get('content-type')?.includes('application/json'))return;
        try { return await response.json(); } // Body consumption is inside the timeout too.
        catch(error) { if(error instanceof SyntaxError)return; throw error; }
      }
      // Consume/cancel every response before retrying to release the connection.
      await response.body?.cancel();
      if(!transient.has(response.status))return;
    } catch { /* Timeout/network failure: one bounded retry, then local practice. */ }
    if(attempt===0)await new Promise(resolve=>setTimeout(resolve,250));
  }
}
export async function loadAudioAnalysis(hash: string): Promise<AudioAnalysis | undefined> {
  const value=await requestAnalysis(hash,{},true);
  return validAudioAnalysis(value,hash) ? value : undefined;
}
export async function storeAudioAnalysis(value: AudioAnalysis): Promise<void> {
  if (!validAudioAnalysis(value, value.sha256)) return;
  const body=JSON.stringify(value);
  await requestAnalysis(value.sha256,{
    method:'PUT',headers:{'Content-Type':'application/json'},body,keepalive:new TextEncoder().encode(body).byteLength <= 60000,
  },false);
}
