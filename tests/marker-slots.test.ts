import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { toggleMeasureMarker, markMeasure, sortedMarkerSlots, markedMeasureIndices } from '../src/marker-slots';
import type { Song } from '../src/model';
const fixture=():Song=>({...JSON.parse(readFileSync('public/demo/song.json','utf8')),markers:[]});
it('shows three empty slots and anchors markers at the beginning of the measure',()=>{
  const s=fixture();expect(sortedMarkerSlots(s)).toEqual([undefined,undefined,undefined]);
  markMeasure(s,s.measures[9].start+.6,'a');
  expect(s.markers[0].time).toBe(s.measures[9].start);
  expect(markedMeasureIndices(s)).toEqual(new Set([9]));
  expect(sortedMarkerSlots(s).filter(Boolean)).toHaveLength(1);
});
it('evicts by creation order, not displayed measure order, and survives JSON reload',()=>{
  let s=fixture();
  for(const [index,id] of [[29,'a'],[9,'b'],[19,'c']] as const)markMeasure(s,s.measures[index].start,id);
  expect(sortedMarkerSlots(s).map(m=>m?.id)).toEqual(['b','c','a']);
  s=JSON.parse(JSON.stringify(s));markMeasure(s,s.measures[4].start,'d');
  expect(s.markers.map(m=>m.id)).toEqual(['b','c','d']);
  expect(sortedMarkerSlots(s).map(m=>m?.id)).toEqual(['d','b','c']);
  expect(markedMeasureIndices(s).has(29)).toBe(false);
});
it('refreshes a duplicate without using another slot',()=>{
  const s=fixture();for(const [i,id] of [[9,'a'],[19,'b'],[29,'c']] as const)markMeasure(s,s.measures[i].start,id);
  markMeasure(s,s.measures[9].start+.3,'unused');markMeasure(s,s.measures[39].start,'d');
  expect(s.markers.map(m=>m.id)).toEqual(['c','a','d']);
  expect(s.markers).toHaveLength(3);
});

it('toggles the current measure without evicting other markers or consuming a name on removal',()=>{
 const s=fixture();
 for(let i=0;i<5;i++) s.markers.push({id:String(i),name:String(i),time:s.measures[i].start});
 const original=structuredClone(s.markers);
 toggleMeasureMarker(s,s.measures[9].start+.2,'new',()=> 'Fill');
 expect(s.markers).toHaveLength(6);
 expect(s.markers[5]).toEqual({id:'new',name:'Fill',time:s.measures[9].start});
 toggleMeasureMarker(s,s.measures[9].start+.4,'unused',()=>{throw new Error('must not consume name');});
 expect(s.markers).toEqual(original);
});
