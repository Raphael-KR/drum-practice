// @vitest-environment jsdom
import {it, expect} from "vitest";
import {readSectionShortcuts, sectionShortcutSlots} from "../src/section-shortcuts";
import type {Song} from "../src/model";
it("orders rehearsal marks, merges duplicate parts and limits to eight fixed slots", () => {
 const part = Array.from({length:10},(_,i)=>`<measure><direction><direction-type><rehearsal>후렴${i+1}</rehearsal></direction-type></direction></measure>`).join("");
 const sections=readSectionShortcuts(`<score-partwise><part>${part}</part><part>${part}</part></score-partwise>`);
 expect(sections).toHaveLength(10);
 const song={measures:Array.from({length:10},()=>({}))} as Song;
 const slots=sectionShortcutSlots(sections,song);
 expect(slots).toHaveLength(8);
 expect(slots[7]).toEqual({name:"후렴8",measureIndex:7});
});
it("keeps repeated section names at distinct measures and empty slots without inventing labels",()=>{
 const xml='<score-partwise><part><measure><direction><direction-type><rehearsal>A</rehearsal></direction-type></direction></measure><measure><direction><direction-type><rehearsal>A</rehearsal></direction-type></direction></measure></part></score-partwise>';
 expect(readSectionShortcuts(xml).map(s=>s.measureIndex)).toEqual([0,1]);
 expect(sectionShortcutSlots([], {measures:[]} as unknown as Song)).toEqual(Array(8).fill(undefined));
 expect(readSectionShortcuts('<broken')).toEqual([]);
});
