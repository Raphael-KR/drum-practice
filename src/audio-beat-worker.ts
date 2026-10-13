import {trackAudioBeats} from './audio-beat-tracking';
self.onmessage = (event: MessageEvent<{samples:Float32Array;sampleRate:number;bpm:number}>) => {
  try {
    const {samples,sampleRate,bpm}=event.data;
    self.postMessage({beatTimes:trackAudioBeats(samples,sampleRate,bpm)});
  } catch (error) {
    self.postMessage({error:error instanceof Error ? error.message : String(error)});
  }
};
