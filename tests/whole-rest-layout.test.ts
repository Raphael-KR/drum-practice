import {it, expect, vi} from 'vitest';
import {ensureCenteredRestCache} from '../src/score-rest-correction';
import type {RecordData} from '../src/storage';
const render=vi.hoisted(()=>vi.fn());
vi.mock('../src/musicxml',()=>({renderMusicXML:render}));
it('refreshes SVG once without touching source, timeline or lyrics while synchronizing crop geometry',async()=>{
 const source=new Blob(['original XML']);
 const r={song:{scoreFormat:'musicxml',pdfName:'score.xml',regions:[{id:'xml-r1',y:0.3}],measures:[],lyrics:[{text:'Ah'}]},pdf:source,pages:[new Blob(['<svg/>'],{type:'image/svg+xml'})],canonicalXML:'canonical',audio:new Blob()} as unknown as RecordData;
 const pages=[new Blob(['<svg data-rest-layout="svg-geometry-sync-v5"/>'],{type:'image/svg+xml'})];
 const regions=[{id:'xml-r1',y:0.28}];
 render.mockResolvedValueOnce({pages,regions});
 const next=await ensureCenteredRestCache(r,()=>{});
 expect(next.pages).toBe(pages);expect(next.song.regions).toEqual(regions);expect(next.song.measures).toBe(r.song.measures);expect(next.song.lyrics).toBe(r.song.lyrics);expect(next.pdf).toBe(source);expect(next.canonicalXML).toBe('canonical');expect(next.audio).toBe(r.audio);
 expect(await ensureCenteredRestCache(next,()=>{})).toBe(next);expect(render).toHaveBeenCalledTimes(1);
});
