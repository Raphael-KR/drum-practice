// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { autoFullscreenEnabled, saveAutoFullscreen, enterFullscreen, installScreenControls } from '../src/fullscreen';
afterEach(()=>{localStorage.clear();vi.restoreAllMocks();delete (document.documentElement as Partial<HTMLElement>).requestFullscreen;});
it('persists opt-in independently of the current song',()=>{
  expect(autoFullscreenEnabled()).toBe(false);
  saveAutoFullscreen(true);expect(autoFullscreenEnabled()).toBe(true);
  saveAutoFullscreen(false);expect(autoFullscreenEnabled()).toBe(false);
});
it('requests native fullscreen and reports browser rejection without failing song loading',async()=>{
  const report=vi.fn();
  document.documentElement.requestFullscreen=vi.fn().mockRejectedValue(new Error('activation required'));
  expect(await enterFullscreen(report)).toBe(false);
  expect(report).toHaveBeenCalledWith(expect.stringContaining('옵션을 껐다가'));
  document.documentElement.requestFullscreen=vi.fn().mockResolvedValue(undefined);
  expect(await enterFullscreen(report)).toBe(true);
});
it('keeps unavailable fullscreen optional',async()=>{
  const report=vi.fn();
  expect(await enterFullscreen(report)).toBe(false);
  expect(report).toHaveBeenCalledWith(expect.stringContaining('지원하지'));
});

it('keeps the existing modal above fullscreen without firing dismissal cleanup', async () => {
  const dialog = document.createElement('dialog');
  dialog.innerHTML = '<div><input value="draft"></div>';
  document.body.append(dialog);
  // jsdom lacks the dialog top layer; device QA verifies the real compositor.
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; setTimeout(() => dialog.dispatchEvent(new Event('close')), 0); };
  const query = document.querySelectorAll.bind(document);
  vi.spyOn(document, 'querySelectorAll').mockImplementation(selector => query(selector === 'dialog:modal' ? 'dialog[open]' : selector));
  dialog.showModal();
  const input = dialog.querySelector('input')!;
  input.focus(); dialog.scrollTop = 23;
  const closed = vi.fn(); dialog.addEventListener('close', closed);
  const request = vi.fn().mockResolvedValue(undefined);
  document.documentElement.requestFullscreen = request;
  const reopen = vi.spyOn(dialog, 'showModal');
  await enterFullscreen(vi.fn());
  await new Promise(resolve => setTimeout(resolve, 20));
  expect(request).toHaveBeenCalledOnce(); expect(reopen).toHaveBeenCalledOnce();
  expect(dialog.open).toBe(true); expect(document.activeElement).toBe(input);
  expect(input.value).toBe('draft'); expect(dialog.scrollTop).toBe(23);
  expect(closed).not.toHaveBeenCalled();
  dialog.close();
  await new Promise(resolve => setTimeout(resolve, 20));
  expect(closed).toHaveBeenCalledOnce();
  dialog.remove();
});

it('adds icon controls before settings and limits touch suppression to fullscreen', () => {
  document.body.innerHTML='<header><button id="settings">settings</button></header>';
  const cleanup=installScreenControls(document.getElementById('settings')!,vi.fn());
  expect([...document.querySelectorAll('button')].map(b=>b.id)).toEqual(['header-fullscreen','header-reload','settings']);
  expect(document.getElementById('header-fullscreen')!.querySelector('svg')).not.toBeNull();
  const gesture=new Event('gesturestart',{cancelable:true});document.dispatchEvent(gesture);
  expect(gesture.defaultPrevented).toBe(false);
  Object.defineProperty(document,'fullscreenElement',{configurable:true,value:document.documentElement});
  document.dispatchEvent(new Event('fullscreenchange'));
  expect(document.getElementById('header-fullscreen')!.getAttribute('aria-label')).toBe('전체화면 해제');
  const pinch=new Event('gesturechange',{cancelable:true});document.dispatchEvent(pinch);expect(pinch.defaultPrevented).toBe(true);
  const keyboard=new KeyboardEvent('keydown',{key:'-',metaKey:true,cancelable:true});document.dispatchEvent(keyboard);expect(keyboard.defaultPrevented).toBe(false);
  delete (document as unknown as {fullscreenElement?:Element}).fullscreenElement;
  cleanup();document.body.innerHTML='';
});
