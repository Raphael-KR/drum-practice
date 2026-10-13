// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {setupAudioPractice} from '../src/audio-practice-setup';
import {audioMeasures,followAudioTempo} from '../src/audio-practice';
import {defaults,validateSong} from '../src/model';
import type {RecordData} from '../src/storage';
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
 document.querySelector<HTMLButtonElement>('[data-beat="8.7"]')!.click();
 expect(document.querySelector('audio')!.currentTime).toBe(8.7);
 document.querySelector<HTMLButtonElement>('[data-first]')!.click();
 expect(first.value).toBe('8.7');expect(document.querySelector('[data-anchor-info]')!.textContent).toContain('직접 지정');
 expect(original.song.audioPractice!.barOne).toBeUndefined();
 document.querySelector('form')!.dispatchEvent(new Event('submit',{cancelable:true}));
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
 document.querySelector<HTMLButtonElement>('[data-cancel]')!.click();
 expect(await pending).toBeUndefined();expect(original.song.audioPractice!.barOne).toBeUndefined();
});
