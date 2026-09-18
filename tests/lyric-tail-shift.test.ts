import {it,expect} from 'vitest';
import {applyTookuTailShift} from '../src/lyric-tail-shift';
import type {Song} from '../src/model';
const fixture=()=>({id:'real-paradis',lyricRevision:'listening-anchors-2026-09-19-v5',lyricGridEnabled:true,measures:[
 {id:'m13',label:'13',start:0,end:4,beats:4,denominator:4},
 {id:'m14',label:'14',start:4,end:9,beats:5,denominator:4},
 {id:'m15',label:'15',start:9,end:13,beats:4,denominator:4},
],lyrics:[
 {id:'before',text:'토',time:.5,end:.75,confirmed:true,grid:{measureId:'m13',tick:2}},
 {id:'v2-l25',text:'토',time:.75,end:1,confirmed:false,grid:{measureId:'m13',tick:3}},
 {id:'next',text:'오',time:3.75,end:4,confirmed:true,grid:{measureId:'m13',tick:15}},
 {id:'end5',text:'루',time:8.75,end:9,confirmed:false,grid:{measureId:'m14',tick:19}},
]} as Song);
it('moves the whole tail one tick, carries across 4/4 and 5/4, preserves earlier lyrics',()=>{
 const s=fixture(),old=structuredClone(s.lyrics);
 expect(applyTookuTailShift(s)).toBe(3);expect(s.lyrics[0]).toEqual(old[0]);
 expect(s.lyrics[1]).toMatchObject({time:1,confirmed:true,grid:{measureId:'m13',tick:4}});
 expect(s.lyrics[2]).toMatchObject({time:4,confirmed:false,grid:{measureId:'m14',tick:0}});
 expect(s.lyrics[3]).toMatchObject({time:9,grid:{measureId:'m15',tick:0}});
 expect(s.lyricArchive![0].lyrics).toEqual(old);
 const once=JSON.stringify(s);expect(applyTookuTailShift(s)).toBe(0);expect(JSON.stringify(s)).toBe(once);
});
it('preserves unrelated or already manually repositioned scores',()=>{
 const s=fixture();s.id='other';expect(applyTookuTailShift(s)).toBe(0);
 const t=fixture();t.lyrics[1].grid!.tick=4;expect(applyTookuTailShift(t)).toBe(0);
});
it('fails atomically if shifting past the final boundary',()=>{
 const s=fixture();s.lyrics.push({id:'last',text:'끝',time:13,end:13,confirmed:false,grid:{measureId:'m15',tick:16}});
 const old=JSON.stringify(s);expect(()=>applyTookuTailShift(s)).toThrow();expect(JSON.stringify(s)).toBe(old);
});
