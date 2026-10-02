// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindNumericDrag, disposeNumericInputs, installNumericInputs } from '../src/numeric-drag';

const cleanups: (() => void)[] = [];
afterEach(() => {
  cleanups.splice(0).forEach(cleanup => cleanup());
  document.body.replaceChildren();
});

function input(value = '94', attributes: Record<string, string> = {}): HTMLInputElement {
  const element = document.createElement('input');
  element.type = 'number';
  element.value = value;
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  document.body.append(element);
  return element;
}

function pointer(target: EventTarget, type: string, x: number, y: number, pointerId = 1) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperty(event, 'pointerId', { value: pointerId });
  target.dispatchEvent(event);
}

describe('numeric drag inputs', () => {
  it('previews horizontal steps and commits only once after release', () => {
    const field = input();
    const start = vi.fn(), commit = vi.fn(), change = vi.fn(), preview = vi.fn();
    field.addEventListener('change', change);
    field.addEventListener('input', preview);
    cleanups.push(bindNumericDrag(field, { onStart: start, onCommit: commit }));
    pointer(field, 'pointerdown', 100, 100);
    pointer(window, 'pointermove', 116, 100);
    expect(field.value).toBe('96');
    pointer(window, 'pointermove', 124, 100);
    expect(field.value).toBe('97');
    expect(start).toHaveBeenCalledExactlyOnceWith(94);
    expect(change).not.toHaveBeenCalled();
    expect(preview).toHaveBeenCalledTimes(2);
    pointer(window, 'pointerup', 124, 100);
    expect(change).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledExactlyOnceWith(97);
  });

  it('locks the dominant axis and supports up increase and down decrease', () => {
    const field = input('1', { step: '0.25', min: '1', max: '4' });
    cleanups.push(bindNumericDrag(field));
    pointer(field, 'pointerdown', 100, 100);
    pointer(window, 'pointermove', 102, 84);
    expect(field.value).toBe('1.5');
    pointer(window, 'pointermove', 180, 76);
    expect(field.value).toBe('1.75');
    pointer(window, 'pointerup', 180, 76);
    pointer(field, 'pointerdown', 100, 100);
    pointer(window, 'pointermove', 100, 108);
    expect(field.value).toBe('1.5');
    pointer(window, 'pointerup', 100, 108);
  });

  it('uses updated field bounds, step, and min as the step base', () => {
    const field = input('0.1', { min: '0.1', max: '2', step: '0.2' });
    cleanups.push(bindNumericDrag(field));
    field.max = '0.5';
    pointer(field, 'pointerdown', 100, 100);
    pointer(window, 'pointermove', 180, 100);
    expect(field.value).toBe('0.5');
    pointer(window, 'pointermove', 0, 100);
    expect(field.value).toBe('0.1');
    pointer(window, 'pointerup', 0, 100);
    field.step = '0.1';
    pointer(field, 'pointerdown', 100, 100);
    pointer(window, 'pointermove', 116, 100);
    expect(field.value).toBe('0.3');
  });

  it('keeps values on the step grid and ends unchanged drags without a change event', () => {
    const field = input('0.5', { min: '0.1', max: '0.55', step: '0.2' });
    const commit = vi.fn(), change = vi.fn();
    field.addEventListener('change', change);
    cleanups.push(bindNumericDrag(field, { onCommit: commit }));
    pointer(field, 'pointerdown', 100, 100);
    pointer(window, 'pointermove', 180, 100);
    pointer(window, 'pointerup', 180, 100);
    expect(field.value).toBe('0.5');
    expect(change).not.toHaveBeenCalled();
    expect(commit).toHaveBeenCalledExactlyOnceWith(0.5);
  });

  it.each(['pointercancel', 'escape', 'blur'])('restores the original value without commit on %s', reason => {
    const field = input('12');
    const commit = vi.fn(), cancel = vi.fn(), preview = vi.fn();
    field.addEventListener('input', preview);
    cleanups.push(bindNumericDrag(field, { onCommit: commit, onCancel: cancel }));
    pointer(field, 'pointerdown', 100, 100);
    pointer(window, 'pointermove', 124, 100);
    expect(field.value).toBe('15');
    if (reason === 'pointercancel') pointer(window, 'pointercancel', 124, 100);
    else if (reason === 'escape') field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    else window.dispatchEvent(new Event('blur'));
    expect(field.value).toBe('12');
    expect(commit).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledExactlyOnceWith(12);
    expect(preview).toHaveBeenCalledTimes(2);
    pointer(window, 'pointerup', 124, 100);
    expect(commit).not.toHaveBeenCalled();
  });

  it('allows a tap but suppresses the click generated after a drag', () => {
    const field = input('50', { type: 'text', readonly: '', min: '0', max: '100' });
    const tap = vi.fn(), start = vi.fn();
    cleanups.push(bindNumericDrag(field, { onTap: tap, onStart: start }));
    pointer(field, 'pointerdown', 100, 100);
    pointer(window, 'pointermove', 102, 102);
    pointer(window, 'pointerup', 102, 102);
    field.click();
    expect(tap).toHaveBeenCalledTimes(1);
    expect(start).not.toHaveBeenCalled();
    pointer(field, 'pointerdown', 100, 100);
    pointer(window, 'pointermove', 116, 100);
    pointer(window, 'pointerup', 116, 100);
    field.click();
    expect(tap).toHaveBeenCalledTimes(1);
    expect(field.value).toBe('52');
  });

  it('supports accessible keyboard stepping on readonly fields and valid typed changes', () => {
    const field = input('50', { type: 'text', readonly: '', min: '0', max: '100' });
    const commit = vi.fn();
    cleanups.push(bindNumericDrag(field, { onCommit: commit }));
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true }));
    expect(field.value).toBe('51');
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true }));
    expect(field.value).toBe('50');
    expect(commit.mock.calls).toEqual([[51], [50]]);
    field.removeAttribute('readonly');
    field.value = '36';
    field.dispatchEvent(new Event('change', { bubbles: true }));
    expect(commit).toHaveBeenLastCalledWith(36);
    field.value = '';
    field.dispatchEvent(new Event('change'));
    expect(commit).toHaveBeenCalledTimes(3);
  });

  it('activates the tap action with Enter or Space without leaking a playback shortcut', () => {
    const field = input('50', { type: 'text', readonly: '' });
    const tap = vi.fn(), bubblingKey = vi.fn();
    document.body.addEventListener('keydown', bubblingKey);
    cleanups.push(() => document.body.removeEventListener('keydown', bubblingKey));
    cleanups.push(bindNumericDrag(field, { onTap: tap }));
    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      field.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    }
    field.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', repeat: true }));
    expect(tap).toHaveBeenCalledTimes(2);
    expect(bubblingKey).not.toHaveBeenCalled();
  });

  it.each([false, true])('cancels a second pointer without committing or activating (dragging: %s)', moveFirst => {
    const field = input('50');
    const tap = vi.fn(), commit = vi.fn(), cancel = vi.fn();
    cleanups.push(bindNumericDrag(field, { onTap: tap, onCommit: commit, onCancel: cancel }));
    pointer(field, 'pointerdown', 100, 100);
    if (moveFirst) pointer(window, 'pointermove', 116, 100);
    pointer(document.body, 'pointerdown', 160, 100, 2);
    pointer(window, 'pointermove', 124, 100);
    pointer(window, 'pointerup', 124, 100);
    field.click();
    pointer(window, 'pointerup', 160, 100, 2);
    field.click();
    expect(field.value).toBe('50');
    expect(commit).not.toHaveBeenCalled();
    expect(tap).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledTimes(moveFirst ? 1 : 0);
    pointer(field, 'pointerdown', 100, 100);
    pointer(window, 'pointerup', 100, 100);
    field.click();
    expect(tap).toHaveBeenCalledTimes(1);
  });

  it('ignores other pointer ids and disabled fields', () => {
    const field = input();
    cleanups.push(bindNumericDrag(field));
    pointer(field, 'pointerdown', 100, 100);
    pointer(window, 'pointermove', 124, 100, 2);
    pointer(window, 'pointerup', 124, 100, 2);
    expect(field.value).toBe('94');
    pointer(window, 'pointermove', 108, 100);
    expect(field.value).toBe('95');
    field.disabled = true;
    pointer(window, 'pointermove', 124, 100);
    expect(field.value).toBe('94');
    pointer(field, 'pointerdown', 100, 100);
    pointer(window, 'pointermove', 124, 100);
    expect(field.value).toBe('94');
  });

  it('automatically binds new numeric fields while respecting exclusions and explicit callbacks', async () => {
    const original = input('1');
    const excluded = input('1', { 'data-numeric-drag': 'off' });
    const cleanup = installNumericInputs(document.body);
    cleanups.push(cleanup);
    expect(original.dataset.numericDragBound).toBe('true');
    expect(excluded.dataset.numericDragBound).toBeUndefined();
    const added = input('2');
    await Promise.resolve();
    expect(added.dataset.numericDragBound).toBe('true');
    const commit = vi.fn();
    cleanups.push(bindNumericDrag(added, { onCommit: commit }));
    pointer(added, 'pointerdown', 0, 0);
    pointer(window, 'pointermove', 8, 0);
    pointer(window, 'pointerup', 8, 0);
    expect(commit).toHaveBeenCalledExactlyOnceWith(3);
    original.remove();
    await Promise.resolve();
    expect(original.dataset.numericDragBound).toBeUndefined();
    cleanup();
    // Replacing an automatic binding must leave the explicit owner's binding intact.
    expect(added.dataset.numericDragBound).toBe('true');
  });

  it('disposes on final pagehide but keeps controls usable during a bfcache pause', async () => {
    const field = input('2');
    cleanups.push(installNumericInputs(document.body));
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    expect(field.dataset.numericDragBound).toBe('true');
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }));
    expect(field.dataset.numericDragBound).toBeUndefined();
    const later = input('3');
    await Promise.resolve();
    expect(later.dataset.numericDragBound).toBeUndefined();
  });

  it('can remove detached fields after the window method slots are cleared at teardown', async () => {
    const field = input('2');
    cleanups.push(installNumericInputs(document.body));
    const originalRemove = window.removeEventListener;
    try {
      (window as unknown as { removeEventListener: unknown }).removeEventListener = undefined;
      field.remove();
      await Promise.resolve();
      expect(field.dataset.numericDragBound).toBeUndefined();
      disposeNumericInputs(document.body);
    } finally {
      window.removeEventListener = originalRemove;
    }
    expect(input('3').dataset.numericDragBound).toBeUndefined();
  });
});

describe('meter controls', () => {
  it('uses supported denominators for drag, wheel and arrow keys', () => {
    const field = input('4');
    cleanups.push(bindNumericDrag(field, { allowedValues: [2,4,8,16], wheel: true }));
    pointer(field, 'pointerdown', 100, 100);
    pointer(window, 'pointermove', 108, 100);
    pointer(window, 'pointerup', 108, 100);
    expect(field.value).toBe('8');
    field.dispatchEvent(new WheelEvent('wheel', {deltaY: -30, cancelable:true}));
    expect(field.value).toBe('16');
    field.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight'}));
    expect(field.value).toBe('16');
    field.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowLeft'}));
    expect(field.value).toBe('8');
  });
  it('keeps zoom gestures and disabled fields unchanged', () => {
    const field = input('4', {min:'1', max:'16'});
    cleanups.push(bindNumericDrag(field, {wheel:true}));
    const zoom = new WheelEvent('wheel', {deltaY:-10, ctrlKey:true, cancelable:true});
    field.dispatchEvent(zoom);
    expect(zoom.defaultPrevented).toBe(false);
    expect(field.value).toBe('4');
    field.disabled = true;
    field.dispatchEvent(new WheelEvent('wheel', {deltaY:-10}));
    expect(field.value).toBe('4');
  });
});
