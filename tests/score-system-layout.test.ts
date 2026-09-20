// @vitest-environment jsdom
import { expect, test } from 'vitest';
import { matchBundledPDFLayout, BUNDLED_PDF_SYSTEMS } from '../src/score-system-layout';
test('PDF page and row boundaries replace the obsolete four-bar layout without changing notes or spacing', () => {
 const input = '<score-partwise><part id="P1">'+Array.from({length:110},(_,i)=>`<measure number="${i+1}">${i===36?'<print new-page="yes"><system-layout><system-distance>72</system-distance></system-layout></print>':i===108?'<print new-system="yes"/>':''}<note><rest/><duration>4</duration></note></measure>`).join('')+'</part></score-partwise>';
 const result=matchBundledPDFLayout(input);
 const doc=new DOMParser().parseFromString(result.text,'text/xml');
 const pageStarts=[...doc.querySelectorAll('print[new-page="yes"]')].map(p=>Number(p.parentElement!.getAttribute('number')));
 expect(pageStarts).toEqual([37,77]);
 const starts=[1,...[...doc.querySelectorAll('print[new-system="yes"], print[new-page="yes"]')].map(p=>Number(p.parentElement!.getAttribute('number')))];
 expect(starts).toEqual(BUNDLED_PDF_SYSTEMS.flat());
 expect(starts.slice(-2)).toEqual([105,107]);
 expect(starts).not.toContain(109);
 expect(doc.querySelector('measure[number="1"] top-system-distance')!.textContent).toBe('180');
 expect(doc.querySelector('measure[number="84"] barline[location="right"] bar-style')!.textContent).toBe('light-light');
 expect(doc.querySelector('system-distance')!.textContent).toBe('72');
 expect(doc.querySelectorAll('note').length).toBe(110);
 expect([...doc.querySelectorAll('duration')].every(e=>e.textContent==='4')).toBe(true);
 expect(matchBundledPDFLayout(result.text).changed).toBe(false);
});
test('does not apply known PDF boundaries to a different score',()=>{
 expect(()=>matchBundledPDFLayout('<score-partwise><part><measure number="1"/></part></score-partwise>')).toThrow('110마디');
});
