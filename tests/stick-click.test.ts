import { expect,it } from 'vitest';
import { stickClickSamples } from '../src/stick-click';
it('creates a short finite dry stick transient with silent boundaries and a safe peak',()=>{
  for(const sr of [32000,44100,48000]) {
    const samples=stickClickSamples(sr);
    expect(samples.length/sr).toBeCloseTo(.035,4);
    expect(samples[0]).toBe(0);
    expect(Math.abs(samples.at(-1)!)).toBeLessThan(.00001);
    expect(samples.every(Number.isFinite)).toBe(true);
    const peak=Math.max(...samples.map(Math.abs));
    expect(peak).toBeGreaterThan(.2);expect(peak).toBeLessThan(1);
  }
});
