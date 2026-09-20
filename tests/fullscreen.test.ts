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
