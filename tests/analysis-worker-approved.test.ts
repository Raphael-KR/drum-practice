import {expect,it,vi} from 'vitest';
vi.mock('../server/approved-analysis',()=>({approvedHashes:['a'.repeat(64)],reviewTokenHash:''}));
import worker from '../server/audio-analysis-worker';
import type {AnalysisDatabase} from '../server/audio-analysis-store';
const hash='a'.repeat(64),value={analyzerVersion:4,sha256:hash,title:'승인곡',artist:'가수',duration:10,bpm:120,firstBeat:.2,beats:4,denominator:4,confidence:.8};
const request=()=>new Request(`https://site.test/api/audio-analysis/v4/${hash}`);
it('serves the approved static snapshot without depending on D1 availability',async()=>{
 const prepare=vi.fn(()=>{throw Error('DB unavailable');});const assets=vi.fn(async(req:Request)=>{expect(new URL(req.url).pathname).toBe(`/analysis-approved/${hash}.json`);return Response.json(value);});
 const response=await worker.fetch(request(),{DB:{prepare} as AnalysisDatabase,ASSETS:{fetch:assets}});
 expect(response.status).toBe(200);expect(await response.json()).toEqual(value);expect(prepare).not.toHaveBeenCalled();
});
it('fails closed when an indexed approved snapshot is missing or corrupt',async()=>{
 for(const response of [new Response('',{status:404}),Response.json({...value,sha256:'b'.repeat(64)})]){
  const result=await worker.fetch(request(),{DB:{prepare(){throw Error('must not query pending');}},ASSETS:{async fetch(){return response;}}});
  expect(result.status).toBe(503);
 }
});
