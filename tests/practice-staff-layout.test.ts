import { JSDOM } from 'jsdom';
import { it, expect, beforeAll } from 'vitest';
import { practiceStaffLayout } from '../src/practice-staff-layout';
import type { Region } from '../src/model';
it('fills equal cells and aligns staves despite differing source widths and vertical positions', () => {
  const a={id:'a',page:0,x:.1,y:.2,w:.3,h:.1,beatXs:[0,.5,1]} as Region;
  const b={...a,id:'b',x:.4,w:.2,y:.5};
  const sa={top:.24,gap:.007}, sb={top:.55,gap:.007};
  const la=practiceStaffLayout(a,sa,180,150), lb=practiceStaffLayout(b,sb,180,150);
  expect(la.height).toBe(lb.height);
  for (const [r,s,l] of [[a,sa,la],[b,sb,lb]] as const) {
    const size=l.size.split(' ').map(parseFloat), pos=l.position.split(' ').map(parseFloat);
    expect(size[0]*r.w).toBeCloseTo(180);
    expect(s.top*size[1]+pos[1]).toBeCloseTo(50.4);
    expect(s.gap*size[1]).toBeCloseTo(7.2);
  }
  expect(a.beatXs).toEqual([0,.5,1]);
});

import { practicePage } from '../src/practice-staff-layout';
it('allows CSS to stretch SVG page axes without hidden aspect-ratio padding', async () => {
  const page = await practicePage(new Blob(['<svg xmlns="http://www.w3.org/2000/svg" width="100" height="200" viewBox="0 0 100 200"/>'], {type:'image/svg+xml'}));
  expect(await page.text()).toContain('preserveAspectRatio="none"');
});

beforeAll(()=>{const w=new JSDOM('').window;Object.assign(globalThis,{DOMParser:w.DOMParser,XMLSerializer:w.XMLSerializer});});

it('removes marked headings only from practice pages, retaining musical labels', async()=>{
 const input='<svg xmlns="http://www.w3.org/2000/svg"><text data-score-heading="true">Title</text><g class="vf-measure"><text>Intro</text></g></svg>';
 const blob=new Blob([input],{type:'image/svg+xml'});
 const output=await(await practicePage(blob)).text();
 expect(output).not.toContain('Title');expect(output).toContain('Intro');
 expect(await blob.text()).toContain('Title');
});
