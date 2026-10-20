// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {setupAudioPractice} from "../../src/modules/audio/audio-practice-setup";
import {audioMeasures,followAudioTempo} from "../../src/modules/audio/audio-practice";
import {defaults,validateSong} from "../../src/model/model";
import type { RecordData } from "../../src/model/record";
vi.mock("../../src/modules/audio/audio-preview-metronome", () => ({bindAudioPreviewMetronome: vi.fn(() => ({refresh: vi.fn(), dispose: vi.fn()}))}));
const times=Array.from({length:40},(_,i)=>.2+i*.5);
function record():RecordData{return {song:followAudioTempo({version:1,id:'ui-anchor',title:'live',bpm:120,firstBeat:.2,audioName:'live.mp3',pdfName:'',pageCount:0,regions:[],lyrics:[],markers:[],loops:[],settings:defaults(),audioPractice:{duration:21,beats:4,denominator:4,peaks:[.2,.8],beatTimes:times},measures:audioMeasures(21,120,.2,4,4)}),audio:new Blob(),pdf:new Blob(),pages:[]};}
beforeEach(()=>{
 vi.stubGlobal('structuredClone',(v:unknown)=>JSON.parse(JSON.stringify(v)));
 vi.stubGlobal('URL',{createObjectURL:vi.fn(()=> 'blob:test'),revokeObjectURL:vi.fn()});
 HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new Event('close'));};
 vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
 vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{});
});
afterEach(()=>{document.body.replaceChildren();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('chooses an observed beat on waveform, sets bar one while following tempo, and persists only on save',async()=>{
 const original=record(),pending=setupAudioPractice(original);
 const first=document.querySelector<HTMLInputElement>('[name=first]')!;
 expect(first.disabled).toBe(false);
 expect(document.querySelector('[name=follow], [data-reanalyze], [data-tap]')).toBeNull();
 const audio=document.querySelector('audio')!;audio.currentTime=8;audio.dispatchEvent(new Event('seeking'));
 document.querySelector<HTMLButtonElement>('[data-beat="8.7"]')!.click();
 expect(document.querySelector('audio')!.currentTime).toBe(8.7);
 document.querySelector<HTMLButtonElement>('[data-first]')!.click();
 expect(first.value).toBe('8.700');expect(document.querySelector('[data-anchor-info]')).toBeNull();
 expect(original.song.audioPractice!.barOne).toBeUndefined();
 const save=document.querySelector<HTMLButtonElement>('.dialoghead button[type=submit]')!;
 expect(save.form).toBe(document.querySelector('form'));
 expect(save.nextElementSibling?.classList.contains('close-button')).toBe(true);
 expect(document.querySelector('form .actions')).toBeNull();
 save.click();
 const saved=await pending;validateSong(saved!.song);
 expect(saved!.song.audioPractice!.followTempo).toBe(true);expect(saved!.song.audioPractice!.barOne).toEqual({time:8.7,source:'manual'});
 expect(saved!.audio).toBe(original.audio);expect(document.querySelector('dialog')).toBeNull();
});
it('cancel leaves original grouping intact and bad typed time shows an error',async()=>{
 const original=record(),pending=setupAudioPractice(original);
 const first=document.querySelector<HTMLInputElement>('[name=first]')!;
 first.value='22';first.dispatchEvent(new Event('input'));
 document.querySelector('form')!.dispatchEvent(new Event('submit',{cancelable:true}));
 expect(document.querySelector('.audio-error')!.textContent).not.toBe('');
 document.querySelector<HTMLButtonElement>('.dialoghead .close-button')!.click();
 document.querySelector<HTMLButtonElement>('#discard-changes-dialog .close-button')!.click();
 await Promise.resolve();
 expect(first.value).toBe('22');
 document.querySelector<HTMLButtonElement>('.dialoghead .close-button')!.click();
 document.querySelector<HTMLButtonElement>('#discard-changes-dialog [data-answer=discard]')!.click();
 expect(await pending).toBeUndefined();expect(original.song.audioPractice!.barOne).toBeUndefined();
});

it('places the player below the waveform and follows beginning, middle and end',async()=>{
 const pending=setupAudioPractice(record());
 const wave=document.querySelector<HTMLElement>('[data-wave]')!;
 const audio=document.querySelector('audio')!;
 expect(wave.nextElementSibling).toBe(audio);
 expect(document.querySelector('[name=browse]')).toBeNull();
 for(const [time,start,cursor] of [[0,0,0],[1.25,0,25],[10,7.5,50],[19.75,16,75],[21,16,100]]){
   audio.currentTime=time;audio.dispatchEvent(new Event('seeking'));
   expect(Number(wave.dataset.start)).toBeCloseTo(start);
   expect(parseFloat(wave.querySelector<HTMLElement>('.audio-anchor-cursor')!.style.left)).toBeCloseTo(cursor);
 }
 document.querySelector<HTMLButtonElement>('.dialoghead .close-button')!.click();await pending;
});
it('browses without seeking and restores following when the player seeks',async()=>{
 const pending=setupAudioPractice(record());
 const wave=document.querySelector<HTMLElement>('[data-wave]')!;
 const audio=document.querySelector('audio')!;
 vi.spyOn(wave,'getBoundingClientRect').mockReturnValue({width:600,left:0} as DOMRect);
 wave.dispatchEvent(new WheelEvent('wheel',{deltaX:300,cancelable:true}));
 expect(Number(wave.dataset.start)).toBeCloseTo(2.5);
 expect(audio.currentTime).toBe(0);
 expect(wave.querySelector<HTMLElement>('.audio-anchor-cursor')!.hidden).toBe(true);
 audio.dispatchEvent(new Event('timeupdate'));
 expect(Number(wave.dataset.start)).toBeCloseTo(2.5);
 audio.currentTime=15;audio.dispatchEvent(new Event('seeking'));
 expect(Number(wave.dataset.start)).toBeCloseTo(12.5);
 expect(wave.querySelector<HTMLElement>('.audio-anchor-cursor')!.hidden).toBe(false);
 document.querySelector<HTMLButtonElement>('.dialoghead .close-button')!.click();await pending;
});
it('dragging pans the waveform without selecting a beat',async()=>{
 const pending=setupAudioPractice(record());
 const wave=document.querySelector<HTMLElement>('[data-wave]')!;
 const audio=document.querySelector('audio')!;
 vi.spyOn(wave,'getBoundingClientRect').mockReturnValue({width:600,left:0} as DOMRect);
 wave.setPointerCapture=vi.fn();wave.hasPointerCapture=()=>true;wave.releasePointerCapture=vi.fn();
 const pointer=(type:string,x:number)=>{
   const event=new MouseEvent(type,{clientX:x,clientY:20,button:0,bubbles:true});
   Object.defineProperties(event,{pointerId:{value:1},isPrimary:{value:true}});
   wave.dispatchEvent(event);
 };
 pointer('pointerdown',400);pointer('pointermove',100);pointer('pointerup',100);
 wave.dispatchEvent(new MouseEvent('click',{clientX:100,bubbles:true}));
 expect(Number(wave.dataset.start)).toBeCloseTo(2.5);expect(audio.currentTime).toBe(0);
 document.querySelector<HTMLButtonElement>('.dialoghead .close-button')!.click();await pending;
});
it('Space toggles preview playback but leaves input typing and held keys alone',async()=>{
 const pending=setupAudioPractice(record());
 const dialog=document.querySelector('dialog')!,audio=document.querySelector('audio')!;
 const play=vi.spyOn(audio,'play').mockResolvedValue();
 const pause=vi.mocked(audio.pause);pause.mockClear();
 const paused=vi.spyOn(audio,'paused','get').mockReturnValue(true);
 const space=(target:Element,repeat=false)=>target.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',repeat,bubbles:true,cancelable:true}));
 space(dialog);expect(play).toHaveBeenCalledTimes(1);
 paused.mockReturnValue(false);space(dialog);expect(pause).toHaveBeenCalledTimes(1);
 space(dialog,true);expect(pause).toHaveBeenCalledTimes(1);
 space(document.querySelector('[name=title]')!);space(document.querySelector('[name=first]')!);
 expect(pause).toHaveBeenCalledTimes(1);
 document.querySelector<HTMLButtonElement>('.dialoghead .close-button')!.click();await pending;
});
it('automatically uses available beats on save without a follow toggle',async()=>{
 const original=record();original.song.audioPractice!.followTempo=false;
 const pending=setupAudioPractice(original);
 expect(document.querySelector('[name=follow]')).toBeNull();
 document.querySelector('form')!.dispatchEvent(new Event('submit',{cancelable:true}));
 const saved=await pending;
 expect(saved!.song.audioPractice!.followTempo).toBe(true);
 expect(original.song.audioPractice!.followTempo).toBe(false);
});
it('Left and Right step by one waveform column, follow the cursor and protect text input',async()=>{
 const pending=setupAudioPractice(record());
 const audio=document.querySelector('audio')!,wave=document.querySelector<HTMLElement>('[data-wave]')!;
 const key=(target:Element,code:string)=>{
   const event=new KeyboardEvent('keydown',{code,bubbles:true,cancelable:true});
   target.dispatchEvent(event);return event.defaultPrevented;
 };
 audio.currentTime=8.7;
 expect(key(audio,'ArrowRight')).toBe(true);expect(audio.currentTime).toBeCloseTo(8.73125);
 expect(Number(wave.dataset.start)).toBeCloseTo(6.23125);
 key(audio,'ArrowLeft');expect(audio.currentTime).toBeCloseTo(8.7);
 audio.currentTime=8.70001;key(audio,'ArrowLeft');expect(audio.currentTime).toBeCloseTo(8.66876);
 audio.currentTime=8.9;key(audio,'ArrowRight');expect(audio.currentTime).toBeCloseTo(8.93125);
 expect(key(document.querySelector('[name=title]')!,'ArrowLeft')).toBe(false);
 expect(audio.currentTime).toBeCloseTo(8.93125);
 audio.currentTime=0;key(audio,'ArrowLeft');expect(audio.currentTime).toBe(0);
 audio.currentTime=21;key(audio,'ArrowRight');expect(audio.currentTime).toBe(21);
 document.querySelector<HTMLButtonElement>('.dialoghead .close-button')!.click();await pending;
});

it('preview metronome is independent of the saved playback setting',async()=>{
 for (const savedClick of [false,true]) {
  const original=record();original.song.settings.click=savedClick;
  const pending=setupAudioPractice(original);
  const checkbox=document.querySelector<HTMLInputElement>('[name=click]')!;
  expect(checkbox.closest('.metronome-toggle')).toBe(document.querySelector('.audio-anchor-setting')!.lastElementChild);
  expect(checkbox.closest('.metronome-toggle')!.querySelector('svg')).not.toBeNull();
  expect(checkbox.getAttribute('aria-label')).toBe('박자 맞추기 메트로놈');
  expect(checkbox.checked).toBe(true);
  checkbox.checked=!savedClick;checkbox.dispatchEvent(new Event('change'));
  document.querySelector('form')!.dispatchEvent(new Event('submit',{cancelable:true}));
  expect((await pending)!.song.settings.click).toBe(savedClick);
  expect(original.song.settings.click).toBe(savedClick);
 }
});

it('marks the chosen first beat and leaves it fixed during seeking and playback',async()=>{
 const pending=setupAudioPractice(record());
 const audio=document.querySelector('audio')!,wave=document.querySelector<HTMLElement>('[data-wave]')!;
 const marker=()=>wave.querySelector<HTMLElement>('.audio-anchor-first')!;
 expect(marker().style.width).toBe('0.625%');
 expect(Number(marker().dataset.time)).toBe(.2);expect(marker().hidden).toBe(false);
 audio.currentTime=8;audio.dispatchEvent(new Event('seeking'));
 wave.querySelector<HTMLButtonElement>('[data-beat="8.7"]')!.click();
 expect(Number(marker().dataset.time)).toBe(.2);expect(marker().hidden).toBe(true);
 document.querySelector<HTMLButtonElement>('[data-first]')!.click();
 expect(Number(marker().dataset.time)).toBe(8.7);expect(marker().hidden).toBe(false);
 for (const time of [8.9,9.2]) {
  audio.currentTime=time;audio.dispatchEvent(new Event('timeupdate'));
  expect(Number(marker().dataset.time)).toBe(8.7);
 }
 const first=document.querySelector<HTMLInputElement>('[name=first]')!;
 first.value='8.830';first.dispatchEvent(new Event('input'));
 expect(Number(marker().dataset.time)).toBe(8.83);
 expect(wave.querySelector('[aria-current]')).toBeNull();
 first.value='';first.dispatchEvent(new Event('input'));expect(marker().hidden).toBe(true);
 document.querySelector<HTMLButtonElement>('.dialoghead .close-button')!.click();
 document.querySelector<HTMLButtonElement>('#discard-changes-dialog [data-answer=discard]')!.click();await pending;
});

it('edits score BPM and one meter selector while preserving observed timing and user state',async()=>{
 const original=record();
 original.song.markers=[{id:'marker',name:'M',time:3}];
 original.song.loops=[{id:'loop',name:'L',start:3,end:6}];
 const pending=setupAudioPractice(original);
 const bpm=document.querySelector<HTMLInputElement>('[name=bpm]')!;
 const meter=document.querySelector<HTMLSelectElement>('[name=meter]')!;
 expect(bpm.disabled).toBe(false);expect(meter.disabled).toBe(false);
 expect(meter.value).toBe('4/4');
 expect(document.querySelector('[name=beats], [name=denominator]')).toBeNull();
 bpm.value='96';meter.value='6/8';
 const first=document.querySelector<HTMLInputElement>('[name=first]')!;
 first.value='2.2';first.dispatchEvent(new Event('input'));
 document.querySelector('form')!.dispatchEvent(new Event('submit',{cancelable:true}));
 const saved=(await pending)!;validateSong(saved.song);
 expect(saved.song.bpm).toBe(96);
 expect(saved.song.audioPractice).toMatchObject({beats:6,denominator:8,beatTimes:times,barOne:{time:2.2}});
 const measure=saved.song.measures.find(m=>!m.audioPrelude)!;
 expect(measure).toMatchObject({beats:6,denominator:8,beatTimes:times.slice(4,10)});
 expect(saved.song.markers).toEqual(original.song.markers);expect(saved.song.loops).toEqual(original.song.loops);
 expect(saved.audio).toBe(original.audio);expect(original.song.bpm).toBe(120);
 const reopened=setupAudioPractice(saved);
 expect(document.querySelector<HTMLSelectElement>('[name=meter]')!.value).toBe('6/8');
 document.querySelector<HTMLButtonElement>('.dialoghead .close-button')!.click();await reopened;
});
it('rejects invalid score BPM and meter without saving',async()=>{
 const pending=setupAudioPractice(record());
 const bpm=document.querySelector<HTMLInputElement>('[name=bpm]')!;
 const meter=document.querySelector<HTMLSelectElement>('[name=meter]')!;
 for(const [tempo,signature] of [['0','4/4'],['301','4/4'],['120','invalid']]){
  bpm.value=tempo;meter.value=signature;
  document.querySelector('form')!.dispatchEvent(new Event('submit',{cancelable:true}));
  expect(document.querySelector('.audio-error')!.textContent).not.toBe('');
  expect(document.querySelector('dialog')!.open).toBe(true);
 }
 document.querySelector<HTMLButtonElement>('.dialoghead .close-button')!.click();
 document.querySelector<HTMLButtonElement>('#discard-changes-dialog [data-answer=discard]')!.click();expect(await pending).toBeUndefined();
});
