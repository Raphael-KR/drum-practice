// @vitest-environment jsdom
import {it,expect,vi,afterEach} from 'vitest';
import {readFileSync} from 'node:fs';
import {savedLoopSlots,storeLoopSlot,measureLoop,edgeSpeed,mountLoopSlots} from '../src/loop-slots';
import type {Song,Loop} from '../src/model';
const song = ():Song => ({...JSON.parse(readFileSync('public/demo/song.json','utf8')),loops:[]});
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();document.body.replaceChildren();});
it('preserves slot holes, legacy loops and stable indices after JSON persistence',()=>{
 const s=song(); s.loops=Array.from({length:10},(_,i)=>measureLoop(s,i,i,`old${i}`));
 storeLoopSlot(s,2); expect(savedLoopSlots(s)[2]).toBeUndefined();
 expect(savedLoopSlots(s)[3]?.id).toBe('old3'); expect(s.loops.find(l=>l.id==='old9')).toBeTruthy();
 storeLoopSlot(s,2,measureLoop(s,8,6,'replacement'));
 const loaded=JSON.parse(JSON.stringify(s)); expect(savedLoopSlots(loaded)).toHaveLength(12);
 expect(savedLoopSlots(loaded)[2]).toMatchObject({start:s.measures[6].start,end:s.measures[8].end});
});
it('supports a single measure and bounded edge speeds in both directions',()=>{
 const s=song(); expect(measureLoop(s,2,2)).toMatchObject({start:s.measures[2].start,end:s.measures[2].end});
 expect(edgeSpeed(50,0,100)).toBe(0); expect(edgeSpeed(-500,0,100)).toBe(-900); expect(edgeSpeed(900,0,100)).toBe(900);
});
function setup(){
 vi.useFakeTimers(); vi.stubGlobal('requestAnimationFrame',vi.fn(()=>1));vi.stubGlobal('cancelAnimationFrame',vi.fn());
 document.body.innerHTML='<div id="root"><div id="loop-slots"></div><div id="stage">'+Array.from({length:4},(_,i)=>`<div data-index="${i}"></div>`).join('')+'</div></div>';
 const s=song(),root=document.querySelector<HTMLElement>('#root')!,stage=document.querySelector<HTMLElement>('#stage')!;
 const rect=(x:number,y:number,w:number,h:number)=>({left:x,right:x+w,top:y,bottom:y+h,width:w,height:h,x,y,toJSON(){}});
 stage.getBoundingClientRect=()=>rect(0,0,400,200) as DOMRect;
 stage.querySelectorAll<HTMLElement>('[data-index]').forEach((e,i)=>e.getBoundingClientRect=()=>rect(i*100,0,100,200) as DOMRect);
 const p={loop:undefined as Loop|undefined},changed=vi.fn();
 const control=mountLoopSlots(root,stage,{song:()=>s,ready:()=>true,player:()=>p,pause:vi.fn(),changed,use:l=>p.loop=l});control.render();
 const click=(i:number)=>root.querySelector<HTMLButtonElement>(`[data-loop-slot="${i}"]`)!.click();
 const pointer=(type:string,x:number,id=1)=>{const e=new Event(type,{bubbles:true,cancelable:true});Object.assign(e,{pointerId:id,button:0,clientX:x,clientY:80});stage.dispatchEvent(e);};
 return {s,p,root,stage,control,changed,click,pointer};
}
it('previews reverse selection, commits only on release, toggles repetition without deleting',()=>{
 const c=setup();c.click(0);c.pointer('pointerdown',350);c.pointer('pointermove',110);
 expect(c.s.loops).toHaveLength(0);expect(c.stage.querySelectorAll('.range-selecting')).toHaveLength(3);
 c.pointer('pointerup',110);expect(savedLoopSlots(c.s)[0]).toMatchObject({start:c.s.measures[1].start,end:c.s.measures[3].end});
 c.click(0);expect(c.p.loop).toBeTruthy();c.click(0);expect(c.p.loop).toBeUndefined();expect(c.s.loops).toHaveLength(1);c.control.dispose();
});
it('cancel preserves existing range, blank armed slot does not save, deletion keeps other slots fixed',()=>{
 const c=setup(); c.click(2);c.click(2);expect(c.s.loops).toHaveLength(0);
 c.click(2);c.pointer('pointerdown',20);c.pointer('pointercancel',20);expect(c.s.loops).toHaveLength(0);
 c.click(2);c.pointer('pointerdown',20);c.pointer('pointerup',20);const old=structuredClone(c.s.loops);
 c.root.querySelector('[data-loop-slot="2"]')!.dispatchEvent(new Event('contextmenu',{bubbles:true,cancelable:true}));
 c.root.querySelector<HTMLButtonElement>('[data-replace]')!.click();c.pointer('pointerdown',220);
 document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));expect(c.s.loops).toEqual(old);
 c.root.querySelector('[data-loop-slot="2"]')!.dispatchEvent(new Event('contextmenu',{bubbles:true,cancelable:true}));
 c.root.querySelector<HTMLButtonElement>('[data-delete]')!.click();expect(savedLoopSlots(c.s)[2]).toBeUndefined();c.control.dispose();
});
it('long press reveals actions without activating repetition',()=>{
 const c=setup();c.click(0);c.pointer('pointerdown',20);c.pointer('pointerup',20);
 c.root.querySelector('[data-loop-slot="0"]')!.dispatchEvent(new Event('pointerdown',{bubbles:true}));vi.advanceTimersByTime(600);
 expect(c.root.querySelector('[data-replace]')).toBeTruthy();expect(c.p.loop).toBeUndefined();c.control.dispose();
});

it('extends an existing eight-slot save without moving holes and persists slot twelve',()=>{
 const s=song(); const first=measureLoop(s,0,1,'first'); s.loops=[first];
 s.repeatSlots=['',first.id,'','','','','',''];
 storeLoopSlot(s,11,measureLoop(s,2,3,'twelfth'));
 const slots=savedLoopSlots(JSON.parse(JSON.stringify(s)));
 expect(slots).toHaveLength(12); expect(slots[0]).toBeUndefined();
 expect(slots[1]?.id).toBe('first'); expect(slots[11]?.id).toBe('twelfth');
});
