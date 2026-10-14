// @vitest-environment jsdom
import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import {bindAudioPreviewMetronome} from '../src/audio-preview-metronome';
import {audioMeasures, followAudioTempo, setAudioBarOne} from '../src/audio-practice';
import {defaults, type Song} from '../src/model';

const mocks = vi.hoisted(() => ({pulse: vi.fn(), pause: vi.fn(), close: vi.fn(), resume: vi.fn(), volumes: vi.fn(), countGain: {value: 1}}));
vi.mock('../src/audio-core', () => ({Player: class {
  ctx = {state: 'running', currentTime: 10, close: mocks.close, resume: mocks.resume};
  countOff = {gain: mocks.countGain}; song?: Song;
  pulse = mocks.pulse; pause = mocks.pause; volumes() {mocks.volumes(this.song?.settings);}
}}));
beforeEach(() => {vi.useFakeTimers();vi.clearAllMocks();mocks.close.mockResolvedValue(undefined);
 vi.stubGlobal('structuredClone',(v:unknown)=>JSON.parse(JSON.stringify(v)));
});
afterEach(() => {vi.useRealTimers();vi.unstubAllGlobals();document.body.replaceChildren();});
function setup() {
 const root=document.createElement('div');
 root.innerHTML='<audio></audio><input type="checkbox" checked>';
 document.body.append(root);
 const audio=root.querySelector('audio')!, checkbox=root.querySelector('input')!;
 let paused=false, seeking=false;
 Object.defineProperty(audio,'paused',{get:()=>paused});
 Object.defineProperty(audio,'seeking',{get:()=>seeking});
 const song=setAudioBarOne(followAudioTempo({version:1,id:'preview',title:'live',bpm:120,firstBeat:.2,audioName:'live.mp3',pdfName:'',pageCount:0,regions:[],lyrics:[],markers:[],loops:[],settings:defaults(),audioPractice:{duration:21,beats:4,denominator:4,peaks:[.2,.8],beatTimes:Array.from({length:40},(_,i)=>.2+i*.5)},measures:audioMeasures(21,120,.2,4,4)}),2.2);
 const error=vi.fn();
 const binding=bindAudioPreviewMetronome(audio,checkbox,root,()=>song,error);
 return {audio,checkbox,binding,song,error,setPaused:(v:boolean)=>paused=v,setSeeking:(v:boolean)=>seeking=v};
}
async function event(audio: EventTarget, name: string) {audio.dispatchEvent(new Event(name));await Promise.resolve();await Promise.resolve();}
it('plays intro count-off then accented first beat on the native source clock',async()=>{
 const x=setup(); x.audio.currentTime=.15; await event(x.audio,'playing');
 expect(mocks.pulse).toHaveBeenLastCalledWith(10.05,false,true);
 x.audio.currentTime=2.15;vi.advanceTimersByTime(25);
 expect(mocks.pulse).toHaveBeenLastCalledWith(10.05,true,false);
 vi.advanceTimersByTime(100);expect(mocks.pulse).toHaveBeenCalledTimes(2);
 expect(x.error).not.toHaveBeenCalled();x.binding.dispose();
});
it('stops on seek and pause, and resumes at the new position without old clicks',async()=>{
 const x=setup();x.audio.currentTime=2.15;await event(x.audio,'playing');
 x.setSeeking(true);await event(x.audio,'seeking');const before=mocks.pulse.mock.calls.length;
 vi.advanceTimersByTime(100);expect(mocks.pulse).toHaveBeenCalledTimes(before);
 x.audio.currentTime=3.65;x.setSeeking(false);await event(x.audio,'seeked');
 expect(mocks.pulse).toHaveBeenLastCalledWith(10.05,false,false);
 x.setPaused(true);await event(x.audio,'pause');const after=mocks.pulse.mock.calls.length;
 vi.advanceTimersByTime(100);expect(mocks.pulse).toHaveBeenCalledTimes(after);x.binding.dispose();
});
it('checkbox controls both voices immediately and closing cancels all scheduling',async()=>{
 const x=setup();x.audio.currentTime=.15;await event(x.audio,'playing');
 x.checkbox.checked=false;await event(x.checkbox,'change');
 mocks.pulse.mockClear();vi.advanceTimersByTime(100);expect(mocks.pulse).not.toHaveBeenCalled();
 x.checkbox.checked=true;await event(x.checkbox,'change');await Promise.resolve();
 expect(mocks.pulse).toHaveBeenCalledWith(10.05,false,true);
 x.binding.dispose();mocks.pulse.mockClear();await event(x.audio,'playing');vi.advanceTimersByTime(100);
 expect(mocks.pulse).not.toHaveBeenCalled();expect(mocks.close).toHaveBeenCalledTimes(1);
});
it('uses media playback speed and does not change saved metronome settings',async()=>{
 const x=setup();x.song.settings.click=false;x.song.settings.clickVolume=.2;x.audio.currentTime=2.1;x.audio.playbackRate=2;
 await event(x.audio,'playing');expect(mocks.pulse).toHaveBeenLastCalledWith(10.05,true,false);
 expect(mocks.countGain.value).toBe(3);
 expect(mocks.volumes).toHaveBeenCalledWith(expect.objectContaining({click:true,clickVolume:1}));
 expect(x.song.settings.click).toBe(false);expect(x.song.settings.clickVolume).toBe(.2);x.binding.dispose();
});
