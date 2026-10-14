import {estimateAudioBarOne, nearestAudioBeat} from "./audio-bar-one";
import {analyzeAudioBeats} from "./audio-beat-analysis";
import {trackedAudioMeasures, validBeatTimes} from "./audio-beat-grid";
import { clamp, defaults, uid, validateSong, type Song } from "./model";
import { estimatePracticeTempo } from "./audio-tempo";
import { t } from "./i18n";
import type { RecordData } from "./storage";
import { audioMetadata } from "./audio-metadata";
import {audioFileHash,loadAudioAnalysis,storeAudioAnalysis} from "./audio-analysis-cache";
import {ANALYZER_VERSION,type AudioAnalysis} from "./audio-analysis-contract";
import {AUDIO_DECODE_SAMPLE_RATE,checkAudioBeforeDecode,checkAudioFormat} from './audio-import-limits';

// iOS maps audio/* to a movie picker. WebM can also resolve to video/webm.
// Audio-only extensions let Safari open the Files document picker directly.
export const AUDIO_FILE_ACCEPT = ".mp3,.m4a,.wav,.aac,.ogg,.flac,.aif,.aiff";
export function practiceFileKind(file: Pick<File, "name" | "type">): "score" | "audio" {
  if (/\.(drumscore|zip)$/i.test(file.name)) return "score";
  if (/\.(mp3|m4a|wav|aac|ogg|flac|aif|aiff|webm)$/i.test(file.name) || file.type.startsWith("audio/")) return "audio";
  throw Error(t("audioPractice.unsupported"));
}
export function audioMeasures(duration: number, bpm: number, firstBeat: number, beats: number, denominator: number) {
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(bpm) || bpm < 20 || bpm > 300 ||
      !Number.isFinite(firstBeat) || firstBeat < 0 || firstBeat >= duration ||
      !Number.isInteger(beats) || beats < 1 || beats > 16 || ![2,4,8,16].includes(denominator))
    throw Error(t("audioPractice.invalidTiming"));
  const seconds = beats * 60 / bpm * 4 / denominator;
  const count = Math.ceil((duration - firstBeat) / seconds);
  if (count > 10000) throw Error(t("audioPractice.tooLong"));
  return Array.from({length: count}, (_, i) => ({
    id: `audio-bar-${i}`, regionId: "", label: String(i + 1), beats, denominator,
    start: firstBeat + i * seconds, end: firstBeat + (i + 1) * seconds,
  }));
}
export function retimeAudio(song: Song, bpm: number, firstBeat: number, beats: number, denominator: number): Song {
  if (!song.audioPractice) throw Error(t("audioPractice.invalidTiming"));
  const measures = audioMeasures(song.audioPractice.duration, bpm, firstBeat, beats, denominator);
  if(song.audioPractice.barOne && firstBeat>0) measures.unshift({id:'audio-prelude',regionId:'',label:'0',beats:1,denominator:4,start:0,end:firstBeat,audioPrelude:true} as typeof measures[number]);
  return {...structuredClone(song), bpm, firstBeat, measures,
    audioPractice: {...song.audioPractice, beats, denominator, followTempo:false, ...(song.audioPractice.barOne ? {barOne:{time:firstBeat,source:song.audioPractice.barOne.source}} : {})},
    settings: {...song.settings, rate: 1, tempoMode:"original"}};
}
export function followAudioTempo(song: Song): Song {
  const a=structuredClone(song.audioPractice);
  if(!a?.beatTimes || !validBeatTimes(a.beatTimes,a.duration))throw Error(t("audioPractice.trackingUnavailable"));
  if (!Number.isFinite(song.bpm) || song.bpm < 20 || song.bpm > 300) throw Error(t("audioPractice.invalidTiming"));
  if(a.barOne)a.barOne.time=nearestAudioBeat(a.beatTimes,a.barOne.time);
  return {...structuredClone(song), firstBeat:a.barOne?.time ?? a.beatTimes[0], measures:trackedAudioMeasures(a.duration,a.beatTimes,a.barOne?.time,a.beats,a.denominator),
    audioPractice:{...a,followTempo:true},settings:{...song.settings,rate:1,tempoMode:"original"}};
}
/** Anchor only changes grouping; original media, beat map, markers and loops stay intact. */
export function setAudioBarOne(song: Song, time: number): Song {
  const a=song.audioPractice;
  if(!a || !Number.isFinite(time) || time<0 || time>=a.duration)throw Error(t('audioPractice.invalidTiming'));
  const at=a.followTempo && a.beatTimes ? nearestAudioBeat(a.beatTimes,time) : time;
  const next={...structuredClone(song),audioPractice:{...a,barOne:{time:at,source:'manual' as const},startAnalyzed:true}};
  return a.followTempo ? followAudioTempo(next) : retimeAudio(next,song.bpm,at,a.beats,a.denominator);
}
/** Upgrade pre-tracking records once; retain user tags, media and practice state. */
export async function ensureAudioBeatTracking(record: RecordData, progress?: (text:string)=>void): Promise<RecordData> {
  const a = record.song.audioPractice;
  if (record.preserveAudioTiming) return record;
  if (!a || a.duration < 4 || a.duration > 1800) return record;
  if (a.beatTimes) {
    if(a.startAnalyzed || a.barOne)return record;
    progress?.(t("audioPractice.startAnalyzing"));
    const context=new AudioContext({sampleRate:32000});
    try {
      const buffer=await context.decodeAudioData(await record.audio.arrayBuffer());
      const barOne=a.followTempo ? estimateAudioBarOne(buffer,a.beatTimes) : undefined;
      const song={...structuredClone(record.song),audioPractice:{...a,startAnalyzed:true,...(barOne ? {barOne} : {})}};
      const next=a.followTempo ? followAudioTempo(song) : song;
      next.settings={...record.song.settings};
      validateSong(next); return {...record,song:next};
    } finally {await context.close().catch(()=>{});}
  }
  progress?.(t("audioPractice.tracking"));
  const analyzed = await readAudioPractice(new File([record.audio],record.song.audioName || 'audio.mp3'),progress);
  if (!analyzed.song.audioPractice?.beatTimes) throw Error(t("audioPractice.trackingUnavailable"));
  const song = followAudioTempo({...structuredClone(record.song),bpm:analyzed.song.bpm,
    audioPractice:{...a,...analyzed.song.audioPractice,barOne:a.barOne ?? analyzed.song.audioPractice.barOne}});
  // Preserve explicit practice speed as a target BPM when the base estimate changes.
  const old = record.song;
  song.settings = {...old.settings};
  if (old.settings.tempoMode === 'practice' || (!old.settings.tempoMode && old.settings.rate !== 1))
    song.settings.rate = clamp(old.bpm * old.settings.rate / song.bpm, .5, 1.2);
  validateSong(song);
  return {...record,song};
}
/** Existing audio can be reanalyzed without changing its identity or practice state. */
export async function reanalyzeAudioPractice(record: RecordData, progress?: (text:string)=>void, signal?:AbortSignal): Promise<RecordData> {
  const analyzed=await readAudioPractice(new File([record.audio],record.song.audioName || 'audio.mp3'),progress,{force:true,signal});
  if(!analyzed.song.audioPractice?.beatTimes)throw Error(t("audioPractice.trackingUnavailable"));
  const song={...structuredClone(record.song),bpm:analyzed.song.bpm,
    audioPractice:{...record.song.audioPractice!,...analyzed.song.audioPractice,
      barOne:record.song.audioPractice?.barOne?.source==='manual'
        ? {source:'manual' as const,time:nearestAudioBeat(analyzed.song.audioPractice.beatTimes,record.song.audioPractice.barOne.time)}
        : analyzed.song.audioPractice.barOne}};
  return {...record,song:followAudioTempo(song)};
}
export function waveformPeaks(buffer: AudioBuffer): number[] {
  const samples = buffer.getChannelData(0), count = Math.min(4096, samples.length);
  const channels = Array.from({length: buffer.numberOfChannels}, (_, i) => buffer.getChannelData(i));
  return Array.from({length:count}, (_, i) => {
    let peak = 0;
    const end = Math.floor((i + 1) * samples.length / count);
    for (const channel of channels)
      for (let j = Math.floor(i * samples.length / count); j < end; j++) peak = Math.max(peak, Math.abs(channel[j]));
    return Math.min(1, peak);
  });
}
/** Combine channel energy, avoiding silent-left and opposite-phase stereo cancellation. */
export function audioAnalysisSamples(buffer: AudioBuffer): Float32Array {
  const channels = Array.from({length: buffer.numberOfChannels}, (_, i) => buffer.getChannelData(i));
  const samples = new Float32Array(Math.min(channels[0].length, buffer.sampleRate * 90));
  for (let i = 0; i < samples.length; i++) {
    let energy = 0;
    for (const channel of channels) energy += channel[i] ** 2;
    samples[i] = Math.sqrt(energy / channels.length);
  }
  return samples;
}
/** Audio, identity and beat analysis stay in this browser. */
export async function readAudioPractice(file: File, progress?: (text:string)=>void, options:{force?:boolean;signal?:AbortSignal} = {}): Promise<RecordData> {
  await checkAudioBeforeDecode(file);
  options.signal?.throwIfAborted();
  const context = new AudioContext({sampleRate:AUDIO_DECODE_SAMPLE_RATE});
  try {
    const bytes = await file.arrayBuffer();
    const hash = await audioFileHash(bytes).catch(() => undefined);
    const [buffer, cached, tags] = await Promise.all([
      context.decodeAudioData(bytes), hash && !options.force ? loadAudioAnalysis(hash) : undefined,
      audioMetadata(file),
    ]);
    options.signal?.throwIfAborted();
    checkAudioFormat(buffer.duration,buffer.numberOfChannels);
    let analysis: AudioAnalysis;
    if (cached && Math.abs(cached.duration - buffer.duration) < .1 &&
        (buffer.duration < 4 || buffer.duration > 1800 || validBeatTimes(cached.beatTimes,buffer.duration))) {
      analysis = cached;
    } else {
      const guess = estimatePracticeTempo(audioAnalysisSamples(buffer), buffer.sampleRate);
      const confident = guess.confidence >= .08 && Number.isFinite(guess.bpm);
      progress?.(t("audioPractice.tracking"));
      const detected = confident ? await analyzeAudioBeats(buffer,guess.bpm,options.signal) : undefined;
      options.signal?.throwIfAborted();
      const beatTimes = validBeatTimes(detected,buffer.duration) ? detected : undefined;
      if (confident && buffer.duration >= 4 && buffer.duration <= 1800 && !beatTimes)
        throw Error(t("audioPractice.trackingUnavailable"));
      analysis = {analyzerVersion:ANALYZER_VERSION,sha256:hash || '',title:tags.title,artist:tags.artist,
        duration:buffer.duration,bpm:confident ? guess.bpm : 120,
        firstBeat:beatTimes?.[0] ?? (confident && guess.firstBeat < buffer.duration ? guess.firstBeat : 0),
        beats:4,denominator:4,confidence:guess.confidence,...(beatTimes ? {beatTimes} : {})};
      // Complete the local cache transaction before allowing an immediate reimport.
      if(hash && confident) await storeAudioAnalysis(analysis);
    }
    const {bpm,firstBeat,beats,denominator,beatTimes}=analysis;
    const metadata={title:tags.title || analysis.title || file.name.replace(/\.[^.]+$/, ''),artist:tags.artist || analysis.artist};
    const song: Song = {
      // Re-read tags even on cache hits so older caches need no beat reanalysis.
      version:1, id:uid(), ...metadata, bpm:tags.bpm ?? bpm, firstBeat,
      audioPractice: {duration:buffer.duration, beats, denominator, peaks:waveformPeaks(buffer),...(beatTimes ? {beatTimes,followTempo:true} : {})},
      measures:beatTimes ? trackedAudioMeasures(buffer.duration,beatTimes) : audioMeasures(buffer.duration,bpm,firstBeat,beats,denominator), regions:[], lyrics:[], markers:[], loops:[],
      settings:defaults(), audioName:file.name, pdfName:"", pageCount:0,
    };
    if(beatTimes) {
      const barOne=estimateAudioBarOne(buffer,beatTimes);
      song.audioPractice!.startAnalyzed=true;
      if(barOne) {
        song.audioPractice!.barOne=barOne;
        song.firstBeat=barOne.time;
        song.measures=trackedAudioMeasures(buffer.duration,beatTimes,barOne.time);
      }
    }
    validateSong(song);
    return {song, audio:file, pdf:new Blob(), pages:[]};
  } catch (error) {
    throw new Error(t("audioPractice.decodeError", {detail:error instanceof Error ? `${error.name}: ${error.message}` : String(error)}));
  } finally { await context.close().catch(() => {}); }
}
