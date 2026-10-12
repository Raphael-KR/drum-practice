import { ANALYSIS_PATH, isAudioHash, validAudioAnalysis, type AudioAnalysis } from '../src/audio-analysis-contract';
export interface AnalysisStore {
  get(hash: string): Promise<AudioAnalysis | undefined>;
  put(value: AudioAnalysis): Promise<void>;
}
const reply = (value: unknown, status = 200) => Response.json(value, {status, headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function audioAnalysisAPI(request: Request, store: AnalysisStore): Promise<Response> {
  const url = new URL(request.url), hash = url.pathname.slice(ANALYSIS_PATH.length);
  if (!url.pathname.startsWith(ANALYSIS_PATH) || !isAudioHash(hash) || url.search) return reply({error:'Not found'},404);
  try {
    if (request.method === 'GET') {
      const value = await store.get(hash);
      return value && validAudioAnalysis(value,hash) ? reply(value) : reply({error:'Not found'},404);
    }
    if (request.method !== 'PUT') return reply({error:'Method not allowed'},405);
    if (request.headers.get('sec-fetch-site') === 'cross-site' ||
        (request.headers.has('origin') && request.headers.get('origin') !== url.origin)) return reply({error:'Forbidden'},403);
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return reply({error:'JSON only'},415);
    if (Number(request.headers.get('content-length')) > 4096) return reply({error:'Too large'},413);
    // Bound actual bytes as well as Content-Length; never buffer an uploaded audio file.
    const reader = request.body?.getReader();
    if (!reader) return reply({error:'Missing body'},400);
    let length=0; const chunks:Uint8Array[]=[];
    while (true) {
      const {done,value}=await reader.read(); if(done) break;
      length+=value.byteLength;
      if(length>4096) { await reader.cancel(); return reply({error:'Too large'},413); }
      chunks.push(value);
    }
    const bytes=new Uint8Array(length);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}
    let value:unknown;
    try { value=JSON.parse(new TextDecoder().decode(bytes)); } catch { return reply({error:'Invalid JSON'},400); }
    if(!validAudioAnalysis(value,hash)) return reply({error:'Invalid analysis'},400);
    await store.put(value);
    return reply({stored:true});
  } catch { return reply({error:'Cache unavailable'},503); }
}
