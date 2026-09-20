// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { readPlaybackPreferences, savePlaybackPreferences } from '../src/playback-preferences';
afterEach(()=>{vi.unstubAllGlobals();savePlaybackPreferences({restartMeasure:true,countOff:true});localStorage.clear();});
it('defaults both preferences on, persists explicit off, and ignores song data',()=>{
  expect(readPlaybackPreferences()).toEqual({restartMeasure:true,countOff:true});
  expect(savePlaybackPreferences({restartMeasure:false,countOff:false})).toBe(true);
  expect(readPlaybackPreferences()).toEqual({restartMeasure:false,countOff:false});
  localStorage.setItem('drum-practice.playback','{"restartMeasure":"false","countOff":false}');
  expect(readPlaybackPreferences()).toEqual({restartMeasure:true,countOff:false});
});
it('keeps the current session preference if storage is unavailable',()=>{
  vi.stubGlobal('localStorage',{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}});
  expect(savePlaybackPreferences({restartMeasure:false,countOff:true})).toBe(false);
  expect(readPlaybackPreferences()).toEqual({restartMeasure:false,countOff:true});
});

it('uses in-memory changes when reads work but writes fail',()=>{
  vi.stubGlobal('localStorage',{getItem:()=>null,setItem(){throw Error('quota');}});
  expect(savePlaybackPreferences({restartMeasure:false,countOff:false})).toBe(false);
  expect(readPlaybackPreferences()).toEqual({restartMeasure:false,countOff:false});
});
