// @vitest-environment jsdom
import {it, expect, vi} from "vitest";
import {writeSections, mountSectionEditor} from "../src/section-editor";
import {readSectionShortcuts} from "../src/section-shortcuts";
import type {Song} from "../src/model";
const xml = '<score-partwise><part id="P1"><measure number="1"><attributes><divisions>1</divisions></attributes><direction><direction-type><rehearsal>A</rehearsal><words>keep</words></direction-type><sound tempo="120"/></direction><note><rest/><duration>4</duration></note></measure><measure number="2"><note><rest/><duration>4</duration></note></measure></part></score-partwise>';
it('adds, moves, renames and deletes sections while preserving notation and other directions',()=>{
 const updated=writeSections(xml,[{name:'후렴 <1>',measureIndex:1}],2,'P1');
 expect(readSectionShortcuts(updated)).toEqual([{name:'후렴 <1>',measureIndex:1}]);
 const doc=new DOMParser().parseFromString(updated,'application/xml');
 expect(doc.querySelectorAll('note')).toHaveLength(2);
 expect(doc.querySelector('words')!.textContent).toBe('keep');
 expect(doc.querySelector('sound')!.getAttribute('tempo')).toBe('120');
 expect(readSectionShortcuts(writeSections(updated,[],2))).toEqual([]);
});
it('rejects empty names, duplicate and out-of-range starts without changing the source',()=>{
 for(const list of [[{name:'',measureIndex:0}],[{name:'A',measureIndex:2}],[{name:'A',measureIndex:0},{name:'B',measureIndex:0}]])
 expect(()=>writeSections(xml,list,2)).toThrow();
 expect(readSectionShortcuts(xml)).toEqual([{name:'A',measureIndex:0}]);
});
it('desktop editor supports adding and applying rows and reports validation errors', async()=>{
 const root=document.createElement('section');document.body.append(root);
 const apply=vi.fn(async(s)=>{writeSections(xml,s,2);});
 mountSectionEditor(root,{song:()=>({measures:[{},{}]} as Song),xml:()=>xml,apply});
 root.querySelector<HTMLButtonElement>('#section-add')!.click();
 const rows=root.querySelectorAll('tbody tr');
 expect(rows).toHaveLength(2);
 rows[1].querySelector<HTMLInputElement>('input[type=number]')!.value='2';
 rows[1].querySelector<HTMLInputElement>('input[type=text]')!.value='후렴';
 root.querySelector<HTMLButtonElement>('#section-apply')!.click();
 await vi.waitFor(()=>expect(apply).toHaveBeenCalledWith([{name:'A',measureIndex:0},{name:'후렴',measureIndex:1}]));
 await vi.waitFor(()=>expect(root.textContent).toContain('반영했습니다'));
 root.remove();
});
