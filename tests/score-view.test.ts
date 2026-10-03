import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { displayRegion, trimRegionLeft } from '../src/score-view';
import type { Song } from '../src/model';
import crops from '../src/pdf-display-crops.json';
const song: Song = JSON.parse(readFileSync('public/demo/song.json', 'utf8'));
it('applies all reviewed Loveholic prefixes only to the exact PDF geometry', () => {
  const source = {...song, id:crops.songId, scoreFormat:'pdf' as const};
  expect(crops.regions).toHaveLength(32);
  for (const c of crops.regions) {
    const {left, ...bounds} = c;
    const r = {...bounds, beatXs:[.2,.4,.6,.8,1]};
    const d = displayRegion(source,r);
    expect(d.x).toBe(left);
    expect(d.x+d.w).toBeCloseTo(r.x+r.w);
    r.beatXs.forEach((x,i) => expect(d.x+d.w*d.beatXs[i]).toBeCloseTo(r.x+r.w*x));
    expect(displayRegion({...source,scoreFormat:'musicxml'},r)).toBe(r);
    const edited={...r,y:r.y+.001};
    expect(displayRegion(source,edited)).toBe(edited);
    expect(displayRegion({...source,id:'another'},r)).toBe(r);
  }
});
it('never applies PDF trimming or anchor corrections to SVG', () => {
  for (const r of song.regions)
    expect(displayRegion({...song, scoreFormat:'musicxml'}, r)).toBe(r);
});
it('keeps hidden anchors at their source positions and rejects invalid crop boundaries', () => {
  const r = {id:'crop', page:0, x:.1, y:.2, w:.4, h:.1, beatXs:[0,.25,.5,1]};
  const before = structuredClone(r), d = trimRegionLeft(r,.15);
  expect(d.beatXs[0]).toBeLessThan(0);
  r.beatXs.forEach((x,i) => expect(d.x+d.w*d.beatXs[i]).toBeCloseTo(r.x+r.w*x));
  expect(r).toEqual(before);
  for (const x of [NaN,Infinity,.1,.09,.5,.6]) expect(trimRegionLeft(r,x)).toBe(r);
});
it('trims verified clef prefixes without changing source data or note page coordinates', () => {
  const original = song.regions[24];
  const before = JSON.stringify(original);
  const cropped = displayRegion(song, original);
  expect(cropped.x * 612).toBeCloseTo(original.x * 612 + 15);
  expect(cropped.x + cropped.w).toBeCloseTo(original.x + original.w);
  original.beatXs.forEach((beat, i) => {
    expect(cropped.x + cropped.w * cropped.beatXs[i]).toBeCloseTo(original.x + original.w * beat);
  });
  expect(JSON.stringify(original)).toBe(before);
  expect(displayRegion(song, song.regions[25])).toBe(song.regions[25]);
});
it('preserves the opening title, clef and meter', () => {
  const d=displayRegion(song,song.regions[0]);
  for(const key of ['x','y','w','h','page'] as const)expect(d[key]).toBe(song.regions[0][key]);
});
it('does not guess at trimming an unrelated score', () => {
  expect(displayRegion({ ...song, id: 'other' }, song.regions[24])).toBe(song.regions[24]);
});
it('anchors m41 beat one to the printed first note after trimming',()=>{
 const m=song.measures[40],r=song.regions.find(r=>r.id===m.regionId)!;
 const before=structuredClone(r),d=displayRegion(song,r);
 expect(d.x+d.w*d.beatXs[0]).toBeCloseTo(77.37/612);
 expect(d.beatXs[0]).toBeGreaterThan(0);
 expect(d.beatXs[0]+(d.beatXs[1]-d.beatXs[0])*.25).toBeGreaterThan(d.beatXs[0]);
 expect(r).toEqual(before);
 const custom={...r,beatXs:[.2,.4,.6,.8,1]};
 expect(displayRegion(song,custom).x+displayRegion(song,custom).w*displayRegion(song,custom).beatXs[0]).toBeCloseTo(r.x+r.w*.2);
});

it('covers every measure and preserves source data and custom crops',()=>{
 const before=JSON.stringify(song);
 for(const m of song.measures){
  const r=song.regions.find(r=>r.id===m.regionId)!,d=displayRegion(song,r);
  expect(d.beatXs.length,m.label).toBe(m.beats+1);
  for(let i=0;i<d.beatXs.length;i++){
   expect(d.beatXs[i]).toBeGreaterThanOrEqual(0);expect(d.beatXs[i]).toBeLessThanOrEqual(1);
   if(i)expect(d.beatXs[i]).toBeGreaterThan(d.beatXs[i-1]);
  }
 }
 expect(JSON.stringify(song)).toBe(before);
 const r=song.regions[41];
 expect(displayRegion(song,{...r,y:r.y+.001}).beatXs).toEqual([]);
 expect(displayRegion(song,song.regions[83]).beatXs.length).toBe(6);
});

import svgCrops from '../src/svg-display-crops.json';
it('removes the 26-unit empty prefix from all 31 reviewed SVG system starts',()=>{
 const s={...song,id:svgCrops.songId,scoreFormat:'musicxml' as const};
 expect(svgCrops.regions).toHaveLength(31);
 expect(svgCrops.regions.some(r=>r.id==='xml-r1')).toBe(false);
 for(const c of svgCrops.regions){
  const {left,...r}=c, before=JSON.stringify(r), d=displayRegion(s,r);
  expect((d.x-r.x)*1500).toBeCloseTo(26);
  expect(d.beatXs[0]*d.w*1500).toBeCloseTo(23.00912);
  r.beatXs.forEach((x,i)=>expect(d.x+d.w*d.beatXs[i]).toBeCloseTo(r.x+r.w*x));
  expect(d.x+d.w).toBeCloseTo(r.x+r.w);
  expect(JSON.stringify(r)).toBe(before);
  const edited={...r,w:r.w+.001};expect(displayRegion(s,edited)).toBe(edited);
  expect(displayRegion({...s,id:'other'},r)).toBe(r);
 }
});

it('preserves reviewed lyric centers through a clef crop, including hidden anchors',()=>{
 const r={id:'pdf',page:0,x:.1,y:.2,w:.4,h:.1,beatXs:[0,.5,1],
  lyricAnchors:[{lyricId:'a',quarterOffset:.5,x:.05},{lyricId:'b',quarterOffset:2,x:.7}]};
 const before=structuredClone(r),d=trimRegionLeft(r,.15);
 expect(d.lyricAnchors![0].x).toBeLessThan(0);
 r.lyricAnchors.forEach((a,i)=>expect(d.x+d.w*d.lyricAnchors![i].x).toBeCloseTo(r.x+r.w*a.x));
 expect(r).toEqual(before);
});
