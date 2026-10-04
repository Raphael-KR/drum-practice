// @vitest-environment jsdom
import {it, expect, vi} from 'vitest';
import {installLandscapeKeyboardGuard} from '../src/landscape-keyboard';
import {bindNumericDrag} from '../src/numeric-drag';
it('keeps landscape numeric focus, physical arrows and scrolling; restores portrait editing', () => {
 const orientation=new EventTarget() as EventTarget & {type:string};
 orientation.type='landscape-primary';
 Object.defineProperty(screen,'orientation',{configurable:true,value:orientation});
 vi.stubGlobal('matchMedia',()=>({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
 document.body.innerHTML='<input type="number" value="4" min="1" max="10"><textarea></textarea>';
 const input=document.querySelector('input')!;
 const unbind=bindNumericDrag(input);
 const dispose=installLandscapeKeyboardGuard();
 expect(input.readOnly).toBe(true);expect(input.inputMode).toBe('none');
 input.focus();expect(document.activeElement).toBe(input);
 input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));
 expect(input.value).toBe('5');
 input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));
 expect(input.value).toBe('4');
 input.dispatchEvent(new WheelEvent('wheel',{deltaY:-10,bubbles:true,cancelable:true}));
 expect(input.value).toBe('5');
 const text=document.querySelector('textarea')!;text.focus();expect(document.activeElement).toBe(text);
 orientation.type='portrait-primary';orientation.dispatchEvent(new Event('change'));
 expect(input.readOnly).toBe(false);expect(input.hasAttribute('data-gesture-only')).toBe(false);
 dispose();unbind();vi.unstubAllGlobals();
});
