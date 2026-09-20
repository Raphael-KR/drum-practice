import {it, expect, vi} from 'vitest';
import {ensureCenteredRestCache} from '../src/score-rest-correction';
import type {RecordData} from '../src/storage';
const render=vi.hoisted(()=>vi.fn());
vi.mock('../src/musicxml',()=>({renderMusicXML:render}));
it('refreshes SVG once without touching source, timeline, lyrics or manual regions',async()=>{
 const source=new Blob(['original XML']);
 const r={song:{scoreFormat:'musicxml',pdfName:'score.xml',regions:[{id:'manual'}],measures:[],lyrics:[{text:'Ah'}]},pdf:source,pages:[new Blob(['<svg/>'],{type:'image/svg+xml'})],canonicalXML:'canonical',audio:new Blob()} as unknown as RecordData;
 const pages=[new Blob(['<svg data-rest-layout="centered-hollow-v2"/>'],{type:'image/svg+xml'})];
 render.mockResolvedValueOnce({pages});
 const next=await ensureCenteredRestCache(r,()=>{});
 expect(next.pages).toBe(pages);expect(next.song).toBe(r.song);expect(next.pdf).toBe(source);expect(next.canonicalXML).toBe('canonical');expect(next.audio).toBe(r.audio);
 expect(await ensureCenteredRestCache(next,()=>{})).toBe(next);expect(render).toHaveBeenCalledTimes(1);
});
