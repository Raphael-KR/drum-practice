import { beforeAll, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { applyDrumDecorations, prepareDrumDecorations, normalizeBundledDrumNotation } from '../src/drum-notation';
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
it('uses only explicit percussion half-open semantics, preserving the technical element',()=>{
 const doc=(smufl:string)=>new DOMParser().parseFromString(`<score-partwise><part><measure><note><unpitched/><duration>1</duration><notations><technical><half-muted ${smufl}/></technical></notations></note></measure></part></score-partwise>`,'application/xml');
 const d=doc('smufl="pictHalfOpen1"');
 expect([...prepareDrumDecorations(d).values()][0].halfOpen).toBe(true);
 expect(d.querySelector('half-muted')?.getAttribute('smufl')).toBe('pictHalfOpen1');
 expect(prepareDrumDecorations(doc('')).size).toBe(0);
 expect(prepareDrumDecorations(doc('smufl="brassMuteHalfClosed"')).size).toBe(0);
});

it('places sticking over the actual beamed stem even when no stem SVG is inside the note',()=>{
 const dom=new JSDOM('<div id="host"><svg><g id="note"><path id="head"/></g></svg></div>');
 Object.assign(globalThis,{document:dom.window.document});
 const host=document.querySelector('#host') as HTMLElement;
 const head=document.querySelector('#head') as any;
 head.getBBox=()=>({x:20,y:100,width:12,height:10});
 const note={sourceNote:{NoteheadColorXml:'#abcdef'},getNoteheadSVGs:()=>[head],
   getSVGGElement:()=>document.querySelector('#note'),
   vfnote:[{getStemX:()=>32,getStemExtents:()=>({topY:60,baseY:105})},0]};
 applyDrumDecorations(host,{GraphicSheet:{MeasureList:[[{staffEntries:[{graphicalVoiceEntries:[{notes:[note]}]}]}]]}},
   new Map([['#abcdef',{sticking:'R',ghost:false,color:'#000000'}]]));
 const text=host.querySelector('[data-sticking]')!;
 expect(text.getAttribute('x')).toBe('32');
 expect(text.getAttribute('y')).toBe('51');
});
