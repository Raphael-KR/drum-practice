// @vitest-environment jsdom
import {it,expect,vi,afterEach} from 'vitest';
import {readFileSync} from 'node:fs';
import {savedLoopSlots,storeLoopSlot,measureLoop,mountLoopSlots,nextLoopSlot} from '../src/loop-slots';
import type {Song,Loop} from '../src/model';
const song = ():Song => ({...JSON.parse(readFileSync('public/demo/song.json','utf8')),loops:[]});
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();document.body.replaceChildren();});
it('compacts sorted visible slots after deletion while preserving hidden legacy loops',()=>{
 const s=song(); s.loops=Array.from({length:10},(_,i)=>measureLoop(s,i,i,`old${i}`));
 storeLoopSlot(s,2);expect(savedLoopSlots(s)[2]?.id).toBe('old3');
 expect(s.loops.find(l=>l.id==='old9')).toBeTruthy();
 storeLoopSlot(s,8,measureLoop(s,8,6,'replacement'));
 const loaded=JSON.parse(JSON.stringify(s));expect(savedLoopSlots(loaded)).toHaveLength(12);
 expect(savedLoopSlots(loaded).slice(0,9).filter(Boolean).map(l=>l!.start)).toEqual(savedLoopSlots(loaded).slice(0,9).filter(Boolean).map(l=>l!.start).sort((a,b)=>a-b));
 expect(savedLoopSlots(loaded)[9]?.id).toBe('old9');
});
it('supports a single measure',()=>{
 const s=song(); expect(measureLoop(s,2,2)).toMatchObject({start:s.measures[2].start,end:s.measures[2].end});
});
function setup(){
 vi.useFakeTimers(); vi.stubGlobal('requestAnimationFrame',vi.fn(()=>1));vi.stubGlobal('cancelAnimationFrame',vi.fn());
 document.body.innerHTML='<div id="root"><div id="loop-slots"></div><div id="stage">'+Array.from({length:4},(_,i)=>`<div data-index="${i}"></div>`).join('')+'</div></div>';
 const s=song(),root=document.querySelector<HTMLElement>('#root')!,stage=document.querySelector<HTMLElement>('#stage')!;
 const rect=(x:number,y:number,w:number,h:number)=>({left:x,right:x+w,top:y,bottom:y+h,width:w,height:h,x,y,toJSON(){}});
 stage.getBoundingClientRect=()=>rect(0,0,400,200) as DOMRect;
 stage.querySelectorAll<HTMLElement>('[data-index]').forEach((e,i)=>e.getBoundingClientRect=()=>rect(i*100,0,100,200) as DOMRect);
 const p={loop:undefined as Loop|undefined,position:s.measures[0].start,current(){return this.position;}},changed=vi.fn();
 const control=mountLoopSlots(root,stage,{song:()=>s,ready:()=>true,player:()=>p,pause:vi.fn(),changed,use:l=>{p.loop=l;if(l)p.position=l.start;}});control.render();
 const click=(i:number)=>root.querySelector<HTMLButtonElement>(`[data-loop-slot="${i}"]`)!.click();
 const pointer=(type:string,x:number,id=1,pointerType='mouse')=>{const e=new Event(type,{bubbles:true,cancelable:true});Object.assign(e,{pointerId:id,pointerType,button:0,clientX:x,clientY:80});stage.dispatchEvent(e);return e;};
 const tap=(x:number)=>{pointer("pointerdown",x,1,"touch");pointer("pointerup",x,1,"touch");};
 return {s,p,root,stage,control,changed,click,pointer,tap};
}
it('empty slots show range selection; touch endpoints commit while mouse drags never register',()=>{
 const c=setup();c.click(0);expect(c.root.querySelector('[data-loop-slot="0"]')!.textContent).toBe('구간 선택');
 expect(c.pointer('pointerdown',350).defaultPrevented).toBe(false);c.pointer('pointermove',110);c.pointer('pointerup',110);expect(c.s.loops).toHaveLength(0);expect(c.stage.querySelectorAll('.range-selecting')).toHaveLength(0);
 c.tap(350);expect(c.s.loops).toHaveLength(0);c.tap(110);expect(savedLoopSlots(c.s)[0]).toMatchObject({start:c.s.measures[1].start,end:c.s.measures[3].end});
 c.click(0);expect(c.p.loop).toBeTruthy();c.click(0);expect(c.p.loop).toBeUndefined();expect(c.s.loops).toHaveLength(0);c.control.dispose();
});
it('cancel preserves existing range and deletion compacts slots',()=>{
 const c=setup();c.click(2);c.click(2);expect(c.s.loops).toHaveLength(0);
 c.click(2);c.tap(20);c.tap(20);const old=structuredClone(c.s.loops);
 c.root.querySelector('[data-loop-slot="0"]')!.dispatchEvent(new Event('contextmenu',{bubbles:true,cancelable:true}));
 c.root.querySelector<HTMLButtonElement>('[data-replace]')!.click();c.tap(220);
 document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));expect(c.s.loops).toEqual(old);
 c.root.querySelector('[data-loop-slot="0"]')!.dispatchEvent(new Event('contextmenu',{bubbles:true,cancelable:true}));
 c.root.querySelector<HTMLButtonElement>('[data-delete]')!.click();expect(savedLoopSlots(c.s)[0]).toBeUndefined();c.control.dispose();
});
it('long press reveals actions without activating repetition',()=>{
 const c=setup();c.click(0);c.tap(20);c.tap(20);
 c.root.querySelector('[data-loop-slot="0"]')!.dispatchEvent(new Event('pointerdown',{bubbles:true}));vi.advanceTimersByTime(600);
 expect(c.root.querySelector('[data-replace]')).toBeTruthy();expect(c.p.loop).toBeUndefined();c.control.dispose();
});

it('extends an existing eight-slot save while sorting visible slots and persists slot twelve',()=>{
 const s=song(); const first=measureLoop(s,0,1,'first'); s.loops=[first];
 s.repeatSlots=['',first.id,'','','','','',''];
 storeLoopSlot(s,11,measureLoop(s,2,3,'twelfth'));
 const slots=savedLoopSlots(JSON.parse(JSON.stringify(s)));
 expect(slots).toHaveLength(12); expect(slots[0]?.id).toBe('first');
 expect(slots[1]).toBeUndefined(); expect(slots[11]?.id).toBe('twelfth');
});
it('keeps action tooltips through empty, selecting, saved and edit states',()=>{
 const c=setup();
 const title=()=>c.root.querySelector<HTMLButtonElement>('[data-loop-slot="0"]')!.title;
 expect(title()).toContain('구간 선택');c.click(0);expect(title()).toContain('취소');
 c.tap(20);c.tap(20);expect(title()).toContain('길게');
 c.root.querySelector('[data-loop-slot="0"]')!.dispatchEvent(new Event('contextmenu',{bubbles:true,cancelable:true}));
 expect([...c.root.querySelectorAll<HTMLButtonElement>('button')].every(b=>!!b.title)).toBe(true);
 c.control.dispose();
});
it('fills empty slots and evicts oldest registration independently of measure sorting, including JSON reload',()=>{
 let s=song();
 for(const [i,start] of [80,10,70,20,60,30,50,40,90].entries())storeLoopSlot(s,nextLoopSlot(s),measureLoop(s,start,start,`registered-${i}`));
 expect(savedLoopSlots(s).slice(0,9).map(l=>l?.id)).toEqual(['registered-1','registered-3','registered-5','registered-7','registered-6','registered-4','registered-2','registered-0','registered-8']);
 s=JSON.parse(JSON.stringify(s));const slot=nextLoopSlot(s);expect(savedLoopSlots(s)[slot]?.id).toBe('registered-0');
 storeLoopSlot(s,slot,measureLoop(s,0,0,'newest'));
 expect(s.loops).toHaveLength(9);expect(s.loops.some(l=>l.id==='registered-0')).toBe(false);
 expect(savedLoopSlots(s)[0]?.id).toBe('newest');
 expect(savedLoopSlots(s)[nextLoopSlot(s)]?.id).toBe('registered-1');
});
it('Enter previews inclusive reverse endpoints, ignores repeats and Escape leaves data untouched',()=>{
 const c=setup();const key=(key:string,repeat=false)=>document.dispatchEvent(new KeyboardEvent('keydown',{key,repeat,bubbles:true,cancelable:true}));
 c.p.position=c.s.measures[8].start;key('Enter');expect(c.s.loops).toHaveLength(0);expect(c.control.selecting).toBe(false);
 expect(c.root.textContent).toContain('9~?');key('Enter',true);expect(c.s.loops).toHaveLength(0);
 c.p.position=c.s.measures[4].start;key('Enter');
 expect(savedLoopSlots(c.s)[0]).toMatchObject({start:c.s.measures[4].start,end:c.s.measures[8].end});
 c.p.position=c.s.measures[2].start;key('Enter');key('Escape');expect(c.s.loops).toHaveLength(1);
 key('Enter');key('Enter');expect(c.s.loops).toHaveLength(2);expect(savedLoopSlots(c.s)[0]).toMatchObject({start:c.s.measures[2].start,end:c.s.measures[2].end});
 c.control.dispose();
});
it('Enter does not intercept numeric editing, focused buttons or open dialogs',()=>{
 const c=setup();const input=document.createElement('input');c.root.append(input);
 input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
 c.root.querySelector('[data-loop-slot]')!.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
 const dialog=document.createElement('dialog');dialog.setAttribute('open','');c.root.append(dialog);
 document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
 expect(c.root.textContent).not.toContain('~?');expect(c.s.loops).toHaveLength(0);c.control.dispose();
});
it('replacing the oldest active loop with Enter clears the removed repeat without activating the new one',()=>{
 const c=setup();for(let i=0;i<9;i++)storeLoopSlot(c.s,nextLoopSlot(c.s),measureLoop(c.s,8-i,8-i,`old-${i}`));
 c.p.loop=c.s.loops[0];c.p.position=c.s.measures[10].start;
 document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
 expect(c.s.loops).toHaveLength(9);
 c.p.position=c.s.measures[12].start;
 document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
 expect(c.s.loops).toHaveLength(9);expect(c.s.loops.some(l=>l.id==='old-0')).toBe(false);
 expect(c.p.loop).toBeUndefined();c.control.dispose();
});

it('touch uses two taps and lets swipe scrolling leave the pending start unchanged',()=>{
 const c=setup();c.click(0);
 const down=c.pointer('pointerdown',120,1,'touch');expect(down.defaultPrevented).toBe(false);
 c.pointer('pointerup',120,1,'touch');expect(c.s.loops).toHaveLength(0);expect(c.stage.querySelectorAll('.range-selecting')).toHaveLength(1);
 expect(c.root.querySelector('[data-loop-slot="0"]')!.textContent).toContain('끝 마디 선택');
 c.pointer('pointerdown',220,2,'touch');const move=c.pointer('pointermove',350,2,'touch');expect(move.defaultPrevented).toBe(false);
 c.pointer('pointerup',350,2,'touch');expect(c.s.loops).toHaveLength(0);expect(c.control.selecting).toBe(true);
 c.pointer('pointerdown',220,3,'touch');c.pointer('pointercancel',230,3,'touch');expect(c.control.selecting).toBe(true);
 c.pointer('pointerdown',350,4,'touch');c.pointer('pointerup',350,4,'touch');
 expect(savedLoopSlots(c.s)[0]).toMatchObject({start:c.s.measures[1].start,end:c.s.measures[3].end});expect(c.changed).toHaveBeenCalledOnce();c.control.dispose();
});
it.each([[350,20,0,3],[220,220,2,2]])('touch supports reverse and single-measure ranges %s to %s',(a,b,first,last)=>{
 const c=setup();c.click(0);for(const x of [a,b]){c.pointer('pointerdown',x,1,'touch');c.pointer('pointerup',x,1,'touch');}
 expect(savedLoopSlots(c.s)[0]).toMatchObject({start:c.s.measures[first].start,end:c.s.measures[last].end});c.control.dispose();
});
it('touch scroll before the first tap and Escape do not register a range',()=>{
 const c=setup();c.click(0);c.pointer('pointerdown',20,1,'touch');c.pointer('pointermove',120,1,'touch');c.pointer('pointermove',20,1,'touch');c.pointer('pointerup',20,1,'touch');
 expect(c.stage.querySelectorAll('.range-selecting')).toHaveLength(0);expect(c.s.loops).toHaveLength(0);
 c.pointer('pointerdown',120,2,'touch');c.pointer('pointerup',120,2,'touch');document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));
 expect(c.control.selecting).toBe(false);expect(c.stage.querySelectorAll('.range-selecting')).toHaveLength(0);expect(c.s.loops).toHaveLength(0);c.control.dispose();
});

it('click goes to the range start; another click at that measure deletes without timing requirements',()=>{
 const c=setup();storeLoopSlot(c.s,0,measureLoop(c.s,1,2,'first'));storeLoopSlot(c.s,1,measureLoop(c.s,3,3,'second'));c.control.render();
 c.click(0);expect(c.p.position).toBe(c.s.measures[1].start);expect(c.s.loops).toHaveLength(2);
 vi.advanceTimersByTime(10000);c.click(0);expect(c.p.loop).toBeUndefined();expect(c.s.loops.map(l=>l.id)).toEqual(['second']);expect(savedLoopSlots(c.s)[0]?.id).toBe('second');
 c.click(0);expect(c.s.loops.map(l=>l.id)).toEqual(['second']);expect(c.p.position).toBe(c.s.measures[3].start);c.control.dispose();
});
it('moving away after a click makes the next click jump again rather than delete',()=>{
 const c=setup();storeLoopSlot(c.s,0,measureLoop(c.s,1,2,'first'));c.control.render();
 c.click(0);c.p.position=c.s.measures[3].start;c.click(0);
 expect(c.s.loops).toHaveLength(1);expect(c.p.position).toBe(c.s.measures[1].start);c.control.dispose();
});
it('click deletes immediately when already in the start measure, even without active repeat',()=>{
 const c=setup();storeLoopSlot(c.s,0,measureLoop(c.s,1,2,'first'));c.control.render();c.p.position=c.s.measures[1].start+.1;
 c.click(0);expect(c.s.loops).toHaveLength(0);expect(c.changed).toHaveBeenCalledOnce();c.control.dispose();
});
it('pressing an empty slot twice only cancels range selection',()=>{
 const c=setup();c.click(0);c.click(0);expect(c.control.selecting).toBe(false);expect(c.s.loops).toHaveLength(0);expect(c.changed).not.toHaveBeenCalled();c.control.dispose();
});

it('mouse single clicks in range selection register endpoints, while movement and cancellation do not',()=>{
 const c=setup();c.click(0);c.pointer('pointerdown',120);c.pointer('pointerup',120);expect(c.s.loops).toHaveLength(0);
 c.pointer('pointerdown',220);c.pointer('pointermove',350);c.pointer('pointerup',350);expect(c.s.loops).toHaveLength(0);
 c.pointer('pointerdown',220);c.pointer('pointercancel',220);expect(c.control.selecting).toBe(true);
 c.pointer('pointerdown',350);c.pointer('pointerup',350);expect(savedLoopSlots(c.s)[0]).toMatchObject({start:c.s.measures[1].start,end:c.s.measures[3].end});c.control.dispose();
});
