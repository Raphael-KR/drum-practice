vi.mock("../src/drum-legend", () => ({normalizeDrumScore: (s:string)=>s}));
import { it, expect, vi } from 'vitest';
import { prepareBrowserScore } from '../src/browser-score';
import type { RecordData } from '../src/storage';
const render=vi.hoisted(()=>vi.fn());
vi.mock('../src/musicxml',()=>({renderMusicXML:render,readMusicXML:(b:Blob)=>b.text()}));
it('regenerates geometry from source XML when no canonical XML exists, retaining timing and lyrics',async()=>{
 const source=new Blob(['original XML']);
 const r={song:{scoreFormat:'musicxml',pdfName:'score.xml',regions:[{id:'old',y:0.3}],measures:[{id:'m1',regionId:'old',beats:4,denominator:4,start:2,end:4}],lyrics:[{text:'Ah'}]},pdf:source,pages:[new Blob(['<svg/>'],{type:'image/svg+xml'})],audio:new Blob()} as unknown as RecordData;
 const pages=[new Blob(['<svg/>'],{type:'image/svg+xml'})];
 const regions=[{id:'xml-r1',y:0.28}];
 render.mockResolvedValueOnce({pages,regions,parsed:{measures:[{beats:4,denominator:4}]}});
 const next=await prepareBrowserScore(r);
 expect(await render.mock.calls[0][0].text()).toBe(await source.text());
 expect(next.pages).toBe(pages);expect(next.song.regions).toEqual(regions);
 expect(next.song.measures[0]).toEqual({...r.song.measures[0],regionId:'xml-r1'});
 expect(next.song.lyrics).toEqual(r.song.lyrics);expect(next.pdf).toBe(source);expect(next.audio).toBe(r.audio);
});
