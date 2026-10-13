import {expect,it} from 'vitest';
import {estimatePracticeTempo} from '../src/audio-tempo';
function clicks(bpm:number,subdivision=false) {
  const rate=4000, samples=new Float32Array(rate*30);
  for(let t=.2,index=0;t<30;t+=60/bpm,index++){
    const amplitude=subdivision && index%2 ? .35 : 1;
    for(let i=0;i<rate*.025;i++)samples[Math.floor(t*rate)+i]=amplitude*Math.exp(-i/(rate*.005));
  }
  return {samples,rate};
}
it.each([40,60,94,100,136,180,200,240])('recognizes isolated regular clicks at %s BPM without forcing a normal tempo',bpm=>{
  const {samples,rate}=clicks(bpm),actual=estimatePracticeTempo(samples,rate);
  expect(Math.abs(actual.bpm-bpm)).toBeLessThanOrEqual(1.5);
  expect(Math.abs(actual.firstBeat-.2)).toBeLessThan(.03);expect(actual.confidence).toBeGreaterThan(.08);
});
it('rejects silence and clips shorter than a useful periodic sample',()=>{
  expect(estimatePracticeTempo(new Float32Array(20000),4000).confidence).toBe(0);
  expect(estimatePracticeTempo(new Float32Array(),4000).confidence).toBe(0);
});
it('chooses the accented quarter pulse over quieter eighth notes',()=>{
  const {samples,rate}=clicks(188,true);expect(estimatePracticeTempo(samples,rate).bpm).toBeCloseTo(94,0);
});

it('keeps short non-silent clips finite when long correlation lags do not fit',()=>{
  const {samples,rate}=clicks(100), result=estimatePracticeTempo(samples.slice(0,rate*3),rate);
  expect(Number.isFinite(result.bpm)).toBe(true);expect(Number.isFinite(result.confidence)).toBe(true);
  expect(result.bpm).toBeCloseTo(100,0);
});

function syncopated(bpm: number, ghost = .15) {
  const rate = 4000, samples = new Float32Array(rate * 60), beat = 60 / bpm;
  // Strong 3+3+2 eighth-note accents, with quieter quarter-note pulses.
  for (let bar = .2; bar < 59; bar += 4 * beat)
    for (const [position, amplitude] of [[0, 1], [1, ghost], [1.5, 1], [2, ghost], [3, 1]])
      for (let i = 0; i < rate * .025; i++) {
        const index = Math.floor((bar + position * beat) * rate) + i;
        if (index < samples.length) samples[index] += amplitude * Math.exp(-i / (rate * .005));
      }
  return {samples, rate};
}
it('uses multi-pulse repetition to resolve 120 BPM against strong 80 BPM accents', () => {
  const {samples, rate} = syncopated(120);
  expect(estimatePracticeTempo(samples, rate).bpm).toBeCloseTo(120, 0);
});
it('does not turn a slower multi-bar repetition into the pulse', () => {
  const {samples, rate} = syncopated(90, .35);
  expect(estimatePracticeTempo(samples, rate).bpm).toBeCloseTo(90, 0);
});
it.each([60,80,90])('preserves genuine %s BPM regular pulses', bpm => {
  const {samples, rate} = clicks(bpm);
  expect(estimatePracticeTempo(samples, rate).bpm).toBeCloseTo(bpm, 0);
});
it('does not blindly speed up an ambiguous accent-only pattern', () => {
  const {samples, rate} = syncopated(120, 0);
  expect(estimatePracticeTempo(samples, rate).bpm).toBeCloseTo(80, 0);
});
