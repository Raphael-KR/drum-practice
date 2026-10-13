/** Player-only onset periodicity estimate. Tempo octave remains ambiguous in music. */
export function estimatePracticeTempo(samples: Float32Array, sampleRate: number) {
  const hop = Math.max(1, Math.round(sampleRate / 100)), rate = sampleRate / hop;
  const envelope: number[] = [], onset: number[] = [];
  let previous = 0;
  for (let start = 0; start + hop <= Math.min(samples.length, sampleRate * 90); start += hop) {
    let energy = 0;
    for (let i = start; i < start + hop; i++) energy += samples[i] ** 2;
    const rms = Math.sqrt(energy / hop);
    envelope.push(rms); onset.push(Math.max(0, rms - previous)); previous = rms;
  }
  if (!onset.length || Math.max(...onset) < 1e-6) return {bpm:120, firstBeat:0, confidence:0};
  const mean = onset.reduce((a,b)=>a+b,0) / onset.length;
  const a = onset.map(value => Math.max(0, value - mean));
  const minLag = Math.floor(rate * 60 / 240), maxLag = Math.ceil(rate * 60 / 40);
  const correlationLimit = maxLag * 4;
  const correlation = new Float64Array(correlationLimit + 2);
  // Normalize each 15-second segment so a loud intro cannot dominate the whole song.
  let windows = 0;
  for (let start = 0; start < a.length; start += Math.round(rate * 15)) {
    const end = Math.min(a.length, start + Math.round(rate * 15));
    if (end - start < rate * 3) continue;
    let energy = 0; for(let i=start;i<end;i++) energy += a[i] ** 2;
    if (energy < 1e-12) continue;
    windows++;
    for(let lag=minLag-1;lag<=Math.min(correlationLimit+1,end-start-1);lag++) {
      let sum=0;for(let i=start+lag;i<end;i++) sum+=a[i]*a[i-lag];
      correlation[lag] += sum / energy * (end-start) / (end-start-lag);
    }
  }
  if (!windows) return {bpm:120,firstBeat:0,confidence:0};
  let best=-1, chosen=minLag;
  for(let lag=minLag;lag<=maxLag;lag++) {
    if(correlation[lag]<correlation[lag-1] || correlation[lag]<correlation[lag+1]) continue;
    const bpm=60*rate/lag;
    // Soft musical pulse prior, not a fixed clamp: compare all 40–240 BPM candidates.
    const prior=Math.exp(-.5*(Math.log2(bpm/110)/.65)**2);
    const score=correlation[lag]*prior;
    if(score>best){best=score;chosen=lag;}
  }
  // A dotted-quarter pattern can outrank the quarter pulse at a 3:2 ratio.
  // Only reconsider close competing peaks; require stronger evidence across
  // four pulse intervals, rather than multiplying every slow estimate by 1.5.
  // Only test the faster quarter candidate: slower multiples can represent
  // multi-bar repetition and are not evidence of a dotted-quarter mistake.
  const pulseSupport = (lag: number) => {
    const prior = Math.exp(-.5 * (Math.log2(60 * rate / lag / 110) / .65) ** 2);
    return [1, 2, 3, 4].reduce((sum, multiple) => sum + correlation[lag * multiple], 0) * prior;
  };
  const initial = chosen;
  let support = pulseSupport(initial);
  {
    const target = initial * 2 / 3;
    for (let lag = Math.max(minLag, Math.floor(target - 1)); lag <= Math.min(maxLag, Math.ceil(target + 1)); lag++) {
      if (Math.abs(lag - target) > Math.max(1, target * .02)) continue;
      if (correlation[lag] < correlation[lag - 1] || correlation[lag] < correlation[lag + 1]) continue;
      const prior = Math.exp(-.5 * (Math.log2(60 * rate / lag / 110) / .65) ** 2);
      const candidateSupport = pulseSupport(lag);
      if (correlation[lag] * prior >= best * .7 && candidateSupport > support * 1.2) {
        chosen = lag; support = candidateSupport;
      }
    }
  }
  const left=correlation[chosen-1], middle=correlation[chosen],right=correlation[chosen+1];
  const curve=left-2*middle+right;
  const shift=curve<0?Math.max(-.5,Math.min(.5,.5*(left-right)/curve)):0;
  let period=chosen+shift;
  let refinedScore=-1;
  const interpolate=(lag:number)=>{const i=Math.floor(lag),f=lag-i;return (correlation[i]||0)*(1-f)+(correlation[i+1]||0)*f;};
  const center=period;
  for(let candidate=center*.98;candidate<=center*1.02;candidate+=.01){
    let score=0;
    for(let multiple=1;multiple<=4;multiple++)score+=interpolate(candidate*multiple);
    if(score>refinedScore){refinedScore=score;period=candidate;}
  }
  // Isolated regular clicks provide an unambiguous shortest pulse, including slow/fast exercises.
  const peak=Math.max(...onset), events:number[]=[];
  for(let i=1;i<onset.length-1;i++)if(onset[i]>.25*peak && onset[i]>=onset[i-1] && onset[i]>onset[i+1] && (!events.length||i-events.at(-1)!>rate*.15))events.push(i);
  const intervals=events.slice(1).map((p,i)=>p-events[i]);
  if(intervals.length>=5) {
    const sorted=[...intervals].sort((a,b)=>a-b),median=sorted[Math.floor(sorted.length/2)];
    const regular=intervals.filter(x=>Math.abs(x-median)<=1).length/intervals.length;
    const envelopePeak=Math.max(...envelope);
    const occupied=envelope.filter(x=>x>envelopePeak*.15).length/envelope.length;
    if(regular>.95 && occupied<.18 && median>=minLag && median<=maxLag)period=intervals.reduce((sum,value)=>sum+value,0)/intervals.length;
  }
  const bpm=Math.round(60*rate/period*10)/10;
  // Detect the start of audible content from an early window, not the loudest later chorus.
  // This is an onset estimate, not guaranteed bar/downbeat recognition.
  const early=envelope.slice(0,Math.min(envelope.length,Math.round(rate*4)));
  const threshold=Math.max(...early)*.08;
  let first=early.findIndex((value,i)=>value>=threshold && (early[i+1]||0)>=threshold);
  if(first<0)first=0;
  return {bpm,firstBeat:Math.max(0,first/rate),confidence:Math.max(0,Math.min(1,middle/windows))};
}
