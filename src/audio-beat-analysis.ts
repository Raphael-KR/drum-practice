/** Memory-bounded 16kHz input; the original File/AudioBuffer remains untouched. */
export function beatAnalysisSamples(buffer: AudioBuffer) {
  const rate = 16000;
  let channel = buffer.getChannelData(0), best = -1;
  for (let c=0;c<buffer.numberOfChannels;c++) {
    const data=buffer.getChannelData(c);let energy=0;
    for(let i=0;i<data.length;i+=64)energy+=data[i]*data[i];
    if(energy>best){best=energy;channel=data;}
  }
  const ratio=buffer.sampleRate/rate;
  const samples=new Float32Array(Math.floor(buffer.duration*rate));
  // Area averaging reduces aliasing and does not allocate full-size channel copies.
  for(let i=0;i<samples.length;i++) {
    const from=Math.floor(i*ratio),to=Math.min(channel.length,Math.max(from+1,Math.floor((i+1)*ratio)));
    let sum=0;for(let j=from;j<to;j++)sum+=channel[j];samples[i]=sum/(to-from);
  }
  return {samples,sampleRate:rate};
}
export async function analyzeAudioBeats(buffer: AudioBuffer, bpm: number, signal?:AbortSignal): Promise<number[] | undefined> {
  if(buffer.duration<4 || buffer.duration>1800 || typeof Worker==='undefined')return;
  signal?.throwIfAborted();
  let cancel:(()=>void) | undefined;
  let worker:Worker | undefined;
  let timeout:ReturnType<typeof setTimeout> | undefined;
  try {
    const input=beatAnalysisSamples(buffer);
    worker=new Worker(new URL('./audio-beat-worker.ts',import.meta.url),{type:'module'});
    return await new Promise<number[] | undefined>((resolve,reject)=>{
      cancel=()=>reject(new DOMException('Analysis cancelled','AbortError'));
      signal?.addEventListener('abort',cancel,{once:true});
      timeout=setTimeout(()=>reject(Error('Beat analysis timed out')),120000);
      worker!.onerror=e=>reject(Error(e.message));
      worker!.onmessage=e=>e.data.error ? reject(Error(e.data.error)) : resolve(e.data.beatTimes);
      worker!.postMessage({...input,bpm},[input.samples.buffer]);
    });
  } catch { return undefined; }
  finally { if(cancel)signal?.removeEventListener('abort',cancel);if(timeout)clearTimeout(timeout);worker?.terminate(); }
}
