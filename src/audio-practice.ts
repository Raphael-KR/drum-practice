import { defaults, uid, validateSong, type Song } from "./model";
import { estimateTempo } from "./analysis";
import { t } from "./i18n";
import type { RecordData } from "./storage";

export const PRACTICE_FILE_ACCEPT = ".drumscore,.zip,application/zip,audio/*,.mp3,.m4a,.wav,.aac,.ogg,.flac";
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
  return Array.from({length:count}, (_, i) => {
    let peak = 0;
    const end = Math.floor((i + 1) * samples.length / count);
    for (let j = Math.floor(i * samples.length / count); j < end; j++) peak = Math.max(peak, Math.abs(samples[j]));
    return Math.min(1, peak);
  });
}
/** Decode only on this device. No fetch, upload or score conversion. */
export async function readAudioPractice(file: File): Promise<RecordData> {
  if (!file.size) throw Error(t("audioPractice.empty"));
  const context = new AudioContext({sampleRate:32000});
  try {
    const buffer = await context.decodeAudioData(await file.arrayBuffer());
    const guess = estimateTempo(buffer.getChannelData(0).subarray(0, buffer.sampleRate * 90), buffer.sampleRate);
    const bpm = guess.confidence >= .08 && Number.isFinite(guess.bpm) ? guess.bpm : 120;
    const firstBeat = guess.confidence >= .08 && guess.firstBeat < buffer.duration ? guess.firstBeat : 0;
    const song: Song = {
      version:1, id:uid(), title:file.name.replace(/\.[^.]+$/, ""), artist:"", bpm, firstBeat,
      audioPractice: {duration:buffer.duration, beats:4, denominator:4, peaks:waveformPeaks(buffer)},
      measures:audioMeasures(buffer.duration,bpm,firstBeat,4,4), regions:[], lyrics:[], markers:[], loops:[],
      settings:{...defaults(), click:false}, audioName:file.name, pdfName:"", pageCount:0,
    };
    validateSong(song);
    return {song, audio:file, pdf:new Blob(), pages:[]};
  } catch (error) {
    throw new Error(t("audioPractice.decodeError", {detail:error instanceof Error ? `${error.name}: ${error.message}` : String(error)}));
  } finally { await context.close().catch(() => {}); }
}
