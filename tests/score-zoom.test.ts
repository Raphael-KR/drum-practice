import {it,expect} from 'vitest';
import {zoomFromSlider,sliderFromZoom,snapZoomSlider} from '../src/score-zoom';
it('centres 100% and preserves 50–300% with reversible mapping',()=>{
 expect([0,25,50,75,100].map(zoomFromSlider)).toEqual([.5,.75,1,2,3]);
 for(const z of [.5,.7,1,1.3,2,2.5,3]) expect(zoomFromSlider(sliderFromZoom(z))).toBeCloseTo(z);
});
it('snaps near ticks but releases outside their magnetic zone',()=>{
 expect(snapZoomSlider(48)).toBe(50);
 expect(snapZoomSlider(53)).toBe(50);
 expect(snapZoomSlider(54)).toBe(54);
 expect(snapZoomSlider(24)).toBe(25);
});
