// @vitest-environment jsdom
import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {correctMeasureFiveRests} from '../src/score-rest-correction';
it('separates bar 5 rests without changing musical events or other measures',()=>{
 const original=readFileSync('public/demo/qa/musicxml-candidate.musicxml','utf8');
 const fixed=correctMeasureFiveRests(original);expect(fixed.changed).toBe(true);
 const a=new DOMParser().parseFromString(original,'application/xml');const b=new DOMParser().parseFromString(fixed.text,'application/xml');
 const rests=Array.from(b.querySelectorAll('part[id="P1"] > measure[number="5"] rest'));
 expect(rests.map(r=>r.querySelector('display-step')?.textContent)).toEqual(['A','A','D','D','D','D']);
 expect(rests.map(r=>r.querySelector('display-octave')?.textContent)).toEqual(['5','5','4','4','4','4']);
 rests.forEach(r=>r.replaceChildren());
 expect(new XMLSerializer().serializeToString(b)).toBe(new XMLSerializer().serializeToString(a));
 expect(correctMeasureFiveRests(fixed.text)).toEqual({text:fixed.text,changed:false});
});
it('does not replace explicit placements or apply to unrelated XML',()=>{
 expect(correctMeasureFiveRests('<score-partwise/>').changed).toBe(false);
 const text=readFileSync('public/demo/score.musicxml','utf8');expect(correctMeasureFiveRests(text).changed).toBe(false);
});
