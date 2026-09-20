import { beforeAll, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { prepareDrumDecorations, normalizeBundledDrumNotation } from '../src/drum-notation';
beforeAll(()=>{const w=new JSDOM('').window;Object.assign(globalThis,{DOMParser:w.DOMParser,XMLSerializer:w.XMLSerializer});});
it('binds sticking by musical time and voice and keeps lyrics untouched',()=>{
 const d=new DOMParser().parseFromString(`<score-partwise><part><measure><attributes><divisions>4</divisions></attributes><direction><direction-type><words>R</words></direction-type><voice>2</voice></direction><note><unpitched/><duration>4</duration><voice>1</voice><notehead parentheses="yes">normal</notehead><lyric><text>R</text></lyric></note><backup><duration>4</duration></backup><note><unpitched/><duration>4</duration><voice>2</voice></note></measure></part></score-partwise>`,'application/xml');
 const rules=[...prepareDrumDecorations(d).values()];expect(rules).toEqual([{ghost:true,sticking:undefined,color:'#000000'},{ghost:false,sticking:'R',color:'#000000'}]);expect(d.querySelector('lyric text')?.textContent).toBe('R');expect(d.querySelector('words')).toBeNull();
});
it('normalizes only known open hi-hat and is idempotent',()=>{
 const xml='<score-partwise><part-list><score-part><score-instrument id="P1-hh-open"><instrument-name>Open hi-hat</instrument-name></score-instrument></score-part></part-list><part><measure><note><unpitched><display-step>F</display-step><display-octave>5</display-octave></unpitched><instrument id="P1-hh-open"/><notehead filled="no">normal</notehead></note></measure></part></score-partwise>';
 const r=normalizeBundledDrumNotation(xml);expect(r.changed).toBe(true);expect(r.text).toContain('circle-x');expect(normalizeBundledDrumNotation(r.text).changed).toBe(false);
 expect(normalizeBundledDrumNotation(xml.replace('Open hi-hat','Custom instrument')).changed).toBe(false);
});
