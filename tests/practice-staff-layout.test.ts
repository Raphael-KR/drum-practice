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

import { framePDFStaffs } from '../src/practice-staff-layout';
it('aligns PDF staves while retaining the full lyric-bearing crop', () => {
  const regions: Region[] = [
    {id:'a',page:0,x:.1,y:.1,w:.3,h:.12,beatXs:[0,1]},
    {id:'b',page:1,x:.1,y:.4,w:.3,h:.19,beatXs:[0,1]},
  ];
  const staffs = new Map([['a',{top:.15,gap:.006}],['b',{top:.45,gap:.006}]]);
  framePDFStaffs(regions, staffs);
  let gap: number|undefined, baseline: number|undefined;
  for (const r of regions) {
    const s=staffs.get(r.id)!;
    const l=practiceStaffLayout(r,s,250,180);
    const scale=parseFloat(l.size.split(' ')[1]), offset=parseFloat(l.position.split(' ')[1]);
    expect(r.y*scale+offset).toBeGreaterThanOrEqual(-.000001);
    expect((r.y+r.h)*scale+offset).toBeLessThanOrEqual(l.height+.000001);
    if(gap !== undefined) expect(s.gap*scale).toBeCloseTo(gap);
    if(baseline !== undefined) expect(s.top*scale+offset).toBeCloseTo(baseline);
    gap=s.gap*scale; baseline=s.top*scale+offset;
  }
});
it('keeps unreadable or non-five-line PDFs on their existing crop layout', () => {
  const staffs=new Map([['a',{top:.15,gap:.006}]]);
  framePDFStaffs([{id:'a'},{id:'undetected'}] as Region[],staffs);
  expect(staffs.size).toBe(0);
});

import { measureWidth, scoreLayout } from '../src/playback-layout';
import type { Song } from '../src/model';
it('keeps ribbon staff scale and baseline constant for narrow final rest bars', () => {
  const song={settings:{view:'ribbon',zoom:1}} as Song;
  const staff={top:.8,gap:.006};
  const gaps:number[]=[], tops:number[]=[];
  for (const w of [.25,.112,.05,.025]) {
    const r={id:'r',page:0,x:.1,y:.7,w,h:.1,beatXs:[.04,1]};
    const width=measureWidth(song,r,1133,1.4,staff);
    const layout=scoreLayout(song,r,width,1133,staff)!;
    const scale=parseFloat(layout.size.split(' ')[1]);
    gaps.push(staff.gap*scale);
    tops.push(staff.top*scale+parseFloat(layout.position.split(' ')[1]));
    expect(parseFloat(layout.size)*r.w).toBeCloseTo(width);
  }
  gaps.forEach(g=>expect(g).toBeCloseTo(gaps[0]));
  tops.forEach(y=>expect(y).toBeCloseTo(tops[0]));
});

it('keeps rehearsal text and frame together on the cropped practice copy only',async()=>{
 const source={id:'r',page:0,x:.1,y:.1,w:.3,h:.3,beatXs:[.2,1]};
 const display={...source,x:.126,w:.274};
 const input='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><rect data-section-top="safe" x="121" y="120"/><text data-section-top="safe" x="124" y="135">A</text><text x="500" y="120">Other</text></svg>';
 const blob=new Blob([input],{type:'image/svg+xml'});
 const doc=new DOMParser().parseFromString(await(await practicePage(blob,[{source,display}])).text(),'image/svg+xml');
 expect(Number(doc.querySelector('rect')!.getAttribute('x'))).toBeCloseTo(147);
 expect(Number(doc.querySelector('text')!.getAttribute('x'))).toBeCloseTo(150);
 expect(doc.querySelectorAll('text')[1].getAttribute('x')).toBe('500');
 expect(await blob.text()).toBe(input);
});

it('scales native playback rows uniformly regardless of source page aspect or crop width', () => {
  for (const ratio of [1,2,3]) for (const w of [.2,.4]) {
    const region = {id:'r',page:0,x:.1,y:.1,w,h:.2,beatXs:[0,1]};
    const staff = {top:.15,gap:.01,nativePageRatio:ratio};
    const layout = practiceStaffLayout(region,staff,275,100,true);
    const [pw,ph] = layout.size.split(' ').map(parseFloat);
    expect(ph/pw).toBeCloseTo(ratio);
    expect(ph*staff.gap).toBeCloseTo(275/w*ratio*.01);
  }
});
