/** A local bar-one reference; it never changes the observed beat timestamps. */
export type { AudioBarOne } from "../../model/audio-bar-one";
import type { AudioBarOne } from "../../model/audio-bar-one";
export function nearestAudioBeat(times: number[], time: number) {
  return times.reduce((best, value) => Math.abs(value-time) < Math.abs(best-time) ? value : best, times[0]);
}
/** Conservative energy/recurring-accent candidate, not recognition of spoken count-in. */
export function estimateAudioBarOne(buffer: AudioBuffer, times: number[]): AudioBarOne | undefined {
  const beats = times.filter(t => t < Math.min(60, buffer.duration));
  if (beats.length < 16) return;
  const channels = Array.from({length:buffer.numberOfChannels}, (_, i) => buffer.getChannelData(i));
  const rms = (start:number, end:number) => {
    let energy=0, count=0;
    for (const data of channels) for (let j=Math.max(0,Math.floor(start*buffer.sampleRate)); j<Math.min(data.length,Math.ceil(end*buffer.sampleRate)); j+=4) {
      energy+=data[j]*data[j]; count++;
    }
    return Math.sqrt(energy/Math.max(1,count));
  };
  const energy=beats.map((t,i)=>rms(t,Math.min(beats[i+1] ?? buffer.duration,t+.35)));
  const attack=beats.map((t,i)=>rms(Math.max(0,t-.025),Math.min(beats[i+1] ?? buffer.duration,t+.10)));
  const sorted=[...energy].sort((a,b)=>a-b), level=sorted[Math.floor(sorted.length*.65)];
  if(level < .002)return;
  // A sustained entrance after quiet/count-in is stronger evidence than one loud shout.
  let entry:number|undefined;
  for(let i=4;i<energy.length-12;i++) {
    const before=energy.slice(Math.max(0,i-8),i),after=energy.slice(i,i+8);
    if(before.reduce((a,b)=>a+b,0)/before.length < level*.35 &&
       after.slice(0,4).every(v=>v>level*.6) &&
       after.reduce((a,b)=>a+b,0)/after.length>level*.65) {entry=i;break;}
  }
  if(entry===undefined && energy.slice(0,8).reduce((a,b)=>a+b,0)/8<level*.6)return;
  const start=entry ?? 0, end=Math.min(attack.length,start+32);
  const phases=[0,1,2,3].map(phase=>{
    const values=attack.slice(start,end).filter((_,i)=>i%4===phase);
    values.sort((a,b)=>a-b);
    return {phase,score:values[Math.floor(values.length/2)]};
  }).sort((a,b)=>b.score-a.score);
  if(entry !== undefined) return {time:beats[entry],source:'estimated'};
  if(phases[0].score < phases[1].score*1.3)return;
  return {time:beats[phases[0].phase],source:'estimated'};
}
