import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { deleteMarkerSlot, toggleMeasureMarker, markMeasure, sortedMarkerSlots, markedMeasureIndices } from '../src/marker-slots';
import type { Song } from '../src/model';
const fixture=():Song=>({...JSON.parse(readFileSync('public/demo/song.json','utf8')),markers:[]});
it('shows five empty slots and anchors markers at the beginning of the measure',()=>{
  const s=fixture();expect(sortedMarkerSlots(s)).toEqual(Array(5).fill(undefined));
  markMeasure(s,s.measures[9].start+.6,'a');
  expect(s.markers[0].time).toBe(s.measures[9].start);
  expect(markedMeasureIndices(s)).toEqual(new Set([9]));
  expect(sortedMarkerSlots(s).filter(Boolean)).toHaveLength(1);
});
it('evicts by creation order, not displayed measure order, and survives JSON reload',()=>{
  let s=fixture();
  for(const [index,id] of [[29,'a'],[9,'b'],[19,'c'],[39,'e'],[49,'f']] as const)markMeasure(s,s.measures[index].start,id);
  expect(sortedMarkerSlots(s).map(m=>m?.id)).toEqual(['b','c','a','e','f']);
  s=JSON.parse(JSON.stringify(s));markMeasure(s,s.measures[4].start,'d');
  expect(s.markers.map(m=>m.id)).toEqual(['b','c','e','f','d']);
  expect(sortedMarkerSlots(s).map(m=>m?.id)).toEqual(['d','b','c','e','f']);
  expect(markedMeasureIndices(s).has(29)).toBe(false);
});
it('refreshes a duplicate without using another slot',()=>{
  const s=fixture();for(const [i,id] of [[9,'a'],[19,'b'],[29,'c']] as const)markMeasure(s,s.measures[i].start,id);
  markMeasure(s,s.measures[9].start+.3,'unused');markMeasure(s,s.measures[39].start,'d');
  expect(s.markers.map(m=>m.id)).toEqual(['b','c','a','d']);
  expect(s.markers).toHaveLength(4);
});

it('toggles the current measure while permanently evicting old markers or consuming a name on removal',()=>{
 const s=fixture();
 for(let i=0;i<7;i++) s.markers.push({id:String(i),name:String(i),time:s.measures[i].start});
 const retained=structuredClone(s.markers.slice(-4));
 toggleMeasureMarker(s,s.measures[9].start+.2,'new',()=> 'Fill');
 expect(s.markers).toHaveLength(5);
 expect(s.markers[4]).toEqual({id:'new',name:'Fill',time:s.measures[9].start});
 toggleMeasureMarker(s,s.measures[9].start+.4,'unused',()=>{throw new Error('must not consume name');});
 expect(s.markers).toEqual(retained);
});

it('keeps a deleted visible slot empty after persistence without promoting an older marker',()=>{
 const s=fixture();s.markers=[0,1,2,3,4,5].map(i=>({id:String(i),name:String(i),time:s.measures[i].start}));
 deleteMarkerSlot(s,'2');
 const loaded=JSON.parse(JSON.stringify(s));
 expect(sortedMarkerSlots(loaded).map(m=>m?.id)).toEqual(['1',undefined,'3','4','5']);
 expect(loaded.markers.map((m:{id:string})=>m.id)).toEqual(['1','3','4','5']);
});

it('does not resurrect evicted markers after deletion, adding or reloading',()=>{
 let s=fixture();
 for(let i=0;i<6;i++) toggleMeasureMarker(s,s.measures[i].start,String(i));
 expect(s.markers.map(m=>m.id)).toEqual(['1','2','3','4','5']);
 deleteMarkerSlot(s,'2');
 s=JSON.parse(JSON.stringify(s));
 toggleMeasureMarker(s,s.measures[6].start,'6');
 expect(s.markers.map(m=>m.id)).toEqual(['1','3','4','5','6']);
 expect(sortedMarkerSlots(s).map(m=>m?.id)).toEqual(['1','3','4','5','6']);
});
