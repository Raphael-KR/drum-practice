// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { autoFullscreenEnabled, saveAutoFullscreen, enterFullscreen } from '../src/fullscreen';
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
