import {expect,it} from "vitest";
import {measureWidth,scoreLayout} from "../src/playback-layout";
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
