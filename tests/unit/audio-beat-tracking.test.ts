import {expect,it} from 'vitest';
import {trackAudioBeats} from "../../src/modules/audio/audio-beat-tracking";
import {beatAnalysisSamples} from "../../src/modules/audio/audio-beat-analysis";
import {validBeatTimes} from "../../src/model/audio-beat-grid";
it.each([false,true])('tracks known accelerating/decelerating pulses, slowing=%s',slowing=>{
 const sr=16000,duration=60,samples=new Float32Array(sr*duration),truth:number[]=[];
 for(let time=.4;time<duration-.3;){
  truth.push(time);
  const at=Math.round(time*sr);
  for(let j=0;j<sr*.035&&at+j<samples.length;j++) samples[at+j]+=Math.exp(-j/(sr*.006))*Math.cos(j*2*Math.PI*900/sr);
  const bpm=slowing?150-50*time/duration:100+50*time/duration;time+=60/bpm;
 }
 const beats=trackAudioBeats(samples,sr,125)!;
 expect(validBeatTimes(beats,duration)).toBe(true);
 const hit=(a:number[],b:number[])=>a.filter(t=>b.some(v=>Math.abs(t-v)<.05)).length/a.length;
 expect(hit(truth,beats)).toBeGreaterThan(.98);expect(hit(beats,truth)).toBeGreaterThan(.98);
 expect(Math.abs((beats[2]-beats[1])-(beats.at(-2)!-beats.at(-3)!))).toBeGreaterThan(.12);
});
it('rejects silence and keeps the active channel in opposite-phase stereo',()=>{
 expect(trackAudioBeats(new Float32Array(160000),16000,120)).toBeUndefined();
 const c=new Float32Array(32000).fill(.7);
 const samples=beatAnalysisSamples({duration:1,sampleRate:32000,numberOfChannels:2,getChannelData:(i:number)=>i?c.map(v=>-v):c} as AudioBuffer).samples;
 expect(samples).toHaveLength(16000);expect(Math.abs(samples[0])).toBeCloseTo(.7);
});
