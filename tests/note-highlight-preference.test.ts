// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
beforeEach(()=>{localStorage.clear();vi.resetModules();});
afterEach(()=>vi.unstubAllGlobals());
it('defaults on and remembers an explicit off across module reloads',async()=>{
 let p=await import('../src/note-highlight-preference');
 expect(p.readNoteHighlight()).toBe(true);
 expect(p.saveNoteHighlight(false)).toBe(true);
 vi.resetModules();p=await import('../src/note-highlight-preference');
 expect(p.readNoteHighlight()).toBe(false);
 p.saveNoteHighlight(true);expect(p.readNoteHighlight()).toBe(true);
});
it('keeps the toggle effective when persistence is blocked',async()=>{
 const p=await import('../src/note-highlight-preference');
 vi.stubGlobal('localStorage',{getItem:()=>null,setItem:()=>{throw Error('quota');}});
 expect(p.saveNoteHighlight(false)).toBe(false);expect(p.readNoteHighlight()).toBe(false);
 p.saveNoteHighlight(true);expect(p.readNoteHighlight()).toBe(true);
});
