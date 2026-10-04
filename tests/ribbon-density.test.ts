import {expect,it} from "vitest";
import {measureWidth,scoreLayout,ribbonPosition} from "../src/playback-layout";
import type {Song,Region} from "../src/model";
it("shows 16 quarters at 100%, scales uniformly, and ignores BPM",()=>{
  const r={w:.4,h:.2,x:0,y:0,page:0,id:"r",beatXs:[0,1]} as Region;
  const staff={gap:.01,top:.1,ribbonQuarterInGaps:10};
  // Native page 1000x1000, 4 quarters x 100 units = 400 units.
  for(const W of [600,1000,1400]) for(const zoom of [.5,1,2]) {
    const s={settings:{zoom,view:"ribbon"},bpm:180} as unknown as Song;
    const width=measureWidth(s,r,W,1,staff);
    expect(width).toBeCloseTo(W/4*zoom);
    const layout=scoreLayout(s,r,width,W,staff)!;
    const [x,y]=layout.size.split(" ").map(parseFloat);
    expect(x).toBeCloseTo(y);
    expect(measureWidth({...s,bpm:60},r,W,1,staff)).toBe(width);
  }
});
it('uses identical glyph scale on both axes for the shared row artwork',()=>{
 const region={id:'r',page:0,x:0,y:0,w:.4,h:.2,beatXs:[0,1]} as Region;
 const staff={gap:.012,top:.1,nativePageRatio:2};
 for(const width of [744,1133,1400]) for(const zoom of [.5,1,2]) {
  const song={settings:{zoom,view:'rows'}} as unknown as Song;
  const row=scoreLayout(song,region,width/4,width,staff)!;
  song.settings.view='ribbon';
  const ribbon=scoreLayout(song,region,width/4*zoom,width,staff)!;
  const [rx,ry]=row.size.split(' ').map(parseFloat);
  const [x,y]=ribbon.size.split(' ').map(parseFloat);
  expect(x).toBeCloseTo(rx*zoom); expect(y).toBeCloseTo(ry*zoom);
  expect(y/x).toBeCloseTo(staff.nativePageRatio);
 }
});

it('moves uniformly across bar boundaries including different meters and empty bars',()=>{
 const quarterWidth=70, anchor=9;
 let offset=0, quarters=0;
 for(const [beats,denominator] of [[4,4],[3,4],[6,8],[4,4]]) {
  const width=quarterWidth*beats*4/denominator;
  const phase=anchor/width;
  for(let beat=0;beat<=beats;beat+=.125) {
   expect(offset+ribbonPosition(width,beat,beats,phase))
    .toBeCloseTo(anchor+quarterWidth*(quarters+beat*4/denominator));
  }
  offset+=width; quarters+=beats*4/denominator;
 }
});

it('aligns 32nd grid positions independently of other notes in a bar',async()=>{
 const {gridPosition}=await import('../src/ribbon-engraving');
 const positions=Array.from({length:32},(_,i)=>gridPosition(i/8,4,320));
 for(let i=1;i<32;i++) expect(positions[i]-positions[i-1]).toBeCloseTo(positions[1]-positions[0]);
 expect(gridPosition(1,4,320)).toBe(positions[8]);
 expect(gridPosition(2,4,320)).toBe(positions[16]);
 expect(gridPosition(.25,4,320)).toBe(positions[2]);
});
it('selects grid artwork without changing the legacy row artwork',async()=>{
 const {selectPlaybackEngraving}=await import('../src/playback-assets');
 const row={url:'row'},grid={url:'grid'},asset={row,grid} as any;
 expect(selectPlaybackEngraving(asset,true)).toBe(grid);
 expect(selectPlaybackEngraving(asset,false)).toBe(row);
});

it('places barlines midway between adjacent 32nd centres without fixed padding', async()=>{
 const {gridPhase}=await import('../src/ribbon-timeline');
 for(const width of [320,480,900]) {
  const step=width/32;
  expect(width*gridPhase(0,4)).toBeCloseTo(step/2);
  expect(width*gridPhase(31/8,4)).toBeCloseTo(width-step/2);
  expect(width+width*gridPhase(0,4)-width*gridPhase(31/8,4)).toBeCloseTo(step);
  for(let q=0;q<4;q+=1/64) {
   expect(width*(gridPhase(q+1/64,4)-gridPhase(q,4))).toBeCloseTo(width/256);
  }
  expect(width*gridPhase(4,4)).toBeCloseTo(width+width*gridPhase(0,4));
 }
});
