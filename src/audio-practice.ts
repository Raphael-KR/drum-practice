import { defaults, uid, validateSong, type Song } from "./model";
import { estimateTempo } from "./analysis";
import { t } from "./i18n";
import type { RecordData } from "./storage";
import { audioMetadata } from "./audio-metadata";
import {audioFileHash,loadAudioAnalysis,storeAudioAnalysis} from "./audio-analysis-cache";
import {ANALYZER_VERSION,type AudioAnalysis} from "./audio-analysis-contract";

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
  return {...structuredClone(song), bpm, firstBeat, measures,
    audioPractice: {...song.audioPractice, beats, denominator},
    settings: {...song.settings, rate: 1}};
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
/** Audio bytes stay local; only a hash and bounded analysis metadata may be sent. */
export async function readAudioPractice(file: File): Promise<RecordData> {
  if (!file.size) throw Error(t("audioPractice.empty"));
  const context = new AudioContext({sampleRate:32000});
  try {
    const bytes = await file.arrayBuffer();
    const hash = await audioFileHash(bytes).catch(() => undefined);
    const [buffer, cached] = await Promise.all([
      context.decodeAudioData(bytes), hash ? loadAudioAnalysis(hash) : undefined,
    ]);
    let analysis: AudioAnalysis;
    if (cached && Math.abs(cached.duration - buffer.duration) < .1) {
      analysis = cached;
    } else {
      const metadata = await audioMetadata(file, false);
      const guess = estimateTempo(audioAnalysisSamples(buffer), buffer.sampleRate);
      const confident = guess.confidence >= .08 && Number.isFinite(guess.bpm);
      analysis = {analyzerVersion:ANALYZER_VERSION,sha256:hash || '',...metadata,
        duration:buffer.duration,bpm:confident ? guess.bpm : 120,
        firstBeat:confident && guess.firstBeat < buffer.duration ? guess.firstBeat : 0,
        beats:4,denominator:4,confidence:guess.confidence};
      // Best-effort metadata-only write. Never hold up playback for the server.
      if(hash && confident) void storeAudioAnalysis(analysis);
    }
    const {bpm,firstBeat,beats,denominator}=analysis;
    const metadata={title:analysis.title || file.name.replace(/\.[^.]+$/, ''),artist:analysis.artist};
    const song: Song = {
      version:1, id:uid(), ...metadata, bpm, firstBeat,
      audioPractice: {duration:buffer.duration, beats, denominator, peaks:waveformPeaks(buffer)},
      measures:audioMeasures(buffer.duration,bpm,firstBeat,beats,denominator), regions:[], lyrics:[], markers:[], loops:[],
      settings:{...defaults(), click:false}, audioName:file.name, pdfName:"", pageCount:0,
    };
    validateSong(song);
    return {song, audio:file, pdf:new Blob(), pages:[]};
  } catch (error) {
    throw new Error(t("audioPractice.decodeError", {detail:error instanceof Error ? `${error.name}: ${error.message}` : String(error)}));
  } finally { await context.close().catch(() => {}); }
}
