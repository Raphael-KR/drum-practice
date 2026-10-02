import { it, expect } from 'vitest';
import { centeredRange, loopMeasureRange, scrubTime } from '../src/practice-controls';
import { defaults, type Song } from '../src/model';
const song = {settings:defaults(), measures:Array.from({length:40}, (_,i)=>({id:String(i),regionId:String(i),label:String(i+1),beats:4,denominator:4,start:i*2,end:(i+1)*2}))} as Song;
it('includes the centre and clamps song boundaries without moving the centre',()=>{
  for (let radius=1;radius<=4;radius++) {
    const range = centeredRange(song.measures,24,radius,80);
    expect([range.first+1,range.last+1]).toEqual([25-radius,25+radius]);
    expect(range.last-range.first+1).toBe(radius*2+1);
  }
  expect(centeredRange(song.measures,0,4,80)).toMatchObject({first:0,last:4,center:0});
  expect(centeredRange(song.measures,39,2,79.5)).toMatchObject({first:37,last:39,end:79.5});
});
it('right drag moves earlier, left moves later and respects different bar durations',()=>{
  expect(scrubTime(song,49,200,200,80)).toBe(47);
  expect(scrubTime(song,49,-200,200,80)).toBe(51);
  expect(scrubTime(song,1,1000,200,80)).toBe(0);
  expect(scrubTime(song,79,-1000,200,80)).toBe(80);
  const mixed={...song,measures:[{...song.measures[0],start:0,end:2},{...song.measures[1],beats:3,start:2,end:3.5}]};
  expect(scrubTime(mixed,1,-200,200,4)).toBe(2.75);
});
it('reports the inclusive final measure for an exclusive loop endpoint',()=>{
  expect(loopMeasureRange(song,46,54)).toEqual({first:23,last:26});
  expect(loopMeasureRange(song,46,53)).toEqual({first:23,last:26});
});
