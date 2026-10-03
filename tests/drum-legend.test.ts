// @vitest-environment jsdom
import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import JSZip from 'jszip';
import {normalizeDrumScore,DRUM_LEGEND} from '../src/drum-legend';
const parse=(s:string)=>new DOMParser().parseFromString(s,'application/xml');
function events(doc:Document,repair=false){
 const result:string[]=[];
 for(const [pi,p] of [...doc.querySelectorAll('part')].entries())for(const [mi,m] of [...p.querySelectorAll(':scope > measure')].entries()){
 let t=0,last=0;
 for(const n of m.children){const d=Number(n.querySelector(':scope > duration')?.textContent||0);
 if(n.localName==='backup')t-=d;if(n.localName==='forward')t+=d;if(n.localName!=='note')continue;
 if(!n.querySelector('chord'))last=t;
 let id=n.querySelector('instrument')?.getAttribute('id');if(repair&&id==='P1-hh-open')id='P1-crash';
 if(!n.querySelector('rest'))result.push(JSON.stringify([pi,mi,last,d,id||'',n.querySelector('lyric')?.textContent||'',n.querySelector('notations')?.textContent||'']));
 if(!n.querySelector('chord,grace'))t+=d;
 }
 }
 return result.sort();
}
for(const song of ['loveholic','real-paradis'])it(`${song}: all sounding events, lyrics and directions survive common normalization`,async()=>{
 const z=await JSZip.loadAsync(readFileSync(`public/scores/${song}.drumscore`));const m=JSON.parse(await z.file('manifest.json')!.async('string'));
 const before=parse(m.canonicalXML),text=normalizeDrumScore(m.canonicalXML),after=parse(text);
 expect(events(after)).toEqual(events(before,song==='loveholic'));
 expect([...after.querySelectorAll('direction')].map(e=>e.textContent)).toEqual([...before.querySelectorAll('direction')].map(e=>e.textContent));
 expect(normalizeDrumScore(text)).toBe(text);
 const structure=(doc:Document)=>[...doc.querySelectorAll('part > measure')].map(m=>[...m.children].filter(e=>['note','backup','forward'].includes(e.localName)).map(e=>[e.localName,...['voice','duration','type','stem','chord','rest','beam'].map(tag=>[...e.querySelectorAll(`:scope > ${tag}`)].map(n=>n.outerHTML))]));
 expect(structure(after)).toEqual(structure(before));
 const names=new Map([...after.querySelectorAll('score-instrument')].map(e=>[e.id,e.querySelector('instrument-name')!.textContent!.toLowerCase()]));
 for(const note of after.querySelectorAll('part > measure > note')){
 const name=names.get(note.querySelector('instrument')?.getAttribute('id')||'');const rule=name&&DRUM_LEGEND[name];if(!rule)continue;
 expect(note.querySelector('unpitched/display-step'.replace('/',' > '))?.textContent).toBe(rule[0]);
 expect(note.querySelector('notehead')?.textContent).toBe(rule[2]);

 }
},30000);
it('unknown instruments keep their original shape and position',()=>{
 const s='<score-partwise><part-list><score-part><score-instrument id="custom"><instrument-name>Custom cymbal</instrument-name></score-instrument></score-part></part-list><part><measure><note><unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched><duration>1</duration><instrument id="custom"/><notehead filled="no">normal</notehead></note></measure></part></score-partwise>';
 const doc=parse(normalizeDrumScore(s));expect(doc.querySelector('notehead')?.getAttribute('filled')).toBe('no');expect(doc.querySelector('display-step')?.textContent).toBe('C');
});
