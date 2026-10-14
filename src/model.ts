import {trackedAudioMeasures, validBeatTimes} from "./audio-beat-grid";
import { t as i18nText } from "./i18n";
export interface Region {
  id: string;
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
  beatXs: number[];
  /** Reviewed PDF note centers, independent of playback beat interpolation. */
  lyricAnchors?: { lyricId: string; quarterOffset: number; x: number }[];
}
export interface Measure {
  audioPrelude?: boolean;
  /** Recording beat positions, one per notated beat; absent means uniform timing. */
  beatTimes?: number[];
  id: string;
  regionId: string;
  label: string;
  beats: number;
  denominator: number;
  start: number;
  end: number;
}
export interface Lyric {
  id: string;
  text: string;
  time: number;
  end: number;
  confirmed: boolean;
  /** Authoritative musical position; time/end above are playback projections. */
  scorePosition?: {
    measureId: string;
    quarterOffset: number;
    durationQuarters: number;
  };
  originalTime?: number;
  grid?: { measureId: string; tick: number };
  freeTiming?: boolean;
}
export interface Marker {
  id: string;
  name: string;
  time: number;
}
export interface Loop {
  id: string;
  name: string;
  start: number;
  end: number;
}
export interface Settings {
  tempoMode?: "original" | "practice";
  rate: number;
  click: boolean;
  musicVolume: number;
  clickVolume: number;
  countIn: number;
  countEach: boolean;
  zoom: number;
  uniformSpacing?: boolean;
  view: "ribbon" | "rows" | "compare";
  position: number;
}
/** Printed text assigned to a measure, without an asserted vocal onset or duration. */
export interface MeasureLyric {
  id: string;
  measureId: string;
  text: string;
  placement: "measure-center";
}
export interface Song {
  /** Local audio practice has timing but no score pages or regions. */
  audioPractice?: { duration: number; beats: number; denominator: number; peaks: number[]; beatTimes?: number[]; followTempo?: boolean; barOne?: import("./audio-bar-one").AudioBarOne; startAnalyzed?: boolean };
  version: 1;
  id: string;
  title: string;
  artist?: string;
  originalTitle?: string;
  composer?: string;
  lyricist?: string;
  /** Untimed full lyric document, canonical MusicXML miscellaneous-field. */
  lyricText?: string;
  bpm: number;
  firstBeat: number;
  measures: Measure[];
  regions: Region[];
  lyrics: Lyric[];
  measureLyrics?: MeasureLyric[];
  lyricRevision?: string;
  lyricGridEnabled?: boolean;
  lyricShifts?: string[];
  lyricArchive?: { revision: string; lyrics: Lyric[] }[];
  markers: Marker[];
  /** Visible marker IDs; empty strings preserve deleted slots. */
  markerSlots?: string[];
  loops: Loop[];
  /** Nine visible loop IDs sorted by start measure; past hidden slots stay preserved. */
  repeatSlots?: string[];
  settings: Settings;
  audioName: string;
  /** Original score filename; legacy name retained for saved-record compatibility. */
  pdfName: string;
  scoreFormat?: "pdf" | "musicxml";
  scorePartId?: string;
  pageCount: number;
}
export const uid = () => crypto.randomUUID();
export const defaults = (): Settings => ({
  rate: 1,
  click: true,
  musicVolume: 0.5,
  clickVolume: 1,
  countIn: 1,
  countEach: false,
  zoom: 1,
  view: "ribbon",
  position: 0,
});
export const clamp = (x: number, a: number, b: number) =>
  Math.max(a, Math.min(b, x));
export function locate(song: Song, time: number) {
  let i = song.measures.findIndex((m) => time < m.end - 1e-8);
  if (i < 0) i = song.measures.length - 1;
  const m = song.measures[i];
  return {
    index: i,
    measure: m,
    beat: m
      ? measureBeatAt(m, time)
      : 0,
  };
}
export function measureBeatAt(m: Measure, time: number) {
  if (!m.beatTimes) return clamp(((time - m.start) / (m.end - m.start)) * m.beats, 0, m.beats);
  if(time <= m.start)return 0;
  for(let b=0;b<m.beats;b++) {
    const next=m.beatTimes[b+1] ?? m.end;
    if(time<next)return b+(time-m.beatTimes[b])/(next-m.beatTimes[b]);
  }
  return m.beats;
}
export function beatTime(m: Measure, beat: number) {
  if(m.beatTimes) {
    const b=clamp(beat,0,m.beats),i=Math.floor(b);
    if(i>=m.beats)return m.end;
    const from=m.beatTimes[i],to=m.beatTimes[i+1] ?? m.end;
    return from+(to-from)*(b-i);
  }
  return m.start + ((m.end - m.start) * beat) / m.beats;
}
export function validMeasureBeatTimes(m: Pick<Measure, "beats" | "start" | "end" | "beatTimes">) {
  const times = m.beatTimes;
  return times === undefined || (Array.isArray(times) && times.length === m.beats &&
    times[0] === m.start && times.every((time, i) => Number.isFinite(time) &&
      time >= m.start && time < m.end && (i === 0 || time > times[i - 1])));
}
/** Preserve the relative recording tempo when an editor changes a measure boundary. */
export function setMeasureTiming(m: Measure, start: number, end: number) {
  if (m.beatTimes) m.beatTimes = m.beatTimes.map(time =>
    start + (time - m.start) / (m.end - m.start) * (end - start));
  m.start = start;
  m.end = end;
}
export function reflow(song: Song) {
  let t = song.firstBeat;
  for (const m of song.measures) {
    m.start = t;
    m.end = t + (((m.beats * 60) / song.bpm) * 4) / m.denominator;
    // Explicit uniform-tempo editing replaces the recording grid.
    delete m.beatTimes;
    t = m.end;
  }
}
export function beatEvents(song: Song, start: number, end: number) {
  const out: { time: number; accent: boolean; beat: number }[] = [];
  for (const m of song.measures.filter(m => !m.audioPrelude))
    for (let b = 0; b < m.beats; b++) {
      const t = beatTime(m, b);
      if (t >= start - 1e-7 && t < end - 1e-7)
        out.push({ time: t, accent: (!song.audioPractice?.followTempo || !!song.audioPractice.barOne) && b === 0, beat: b + 1 });
    }
  return out;
}
// Source times: count along with the retained intro, never delay the recording.
export function preludeCountBeats(song: Song) {
  const prelude = song.measures[0];
  if (!song.audioPractice || !prelude?.audioPrelude) return [];
  const end = prelude.end;
  if (song.audioPractice.followTempo && song.audioPractice.beatTimes)
    return song.audioPractice.beatTimes.filter(t => t < end - 1e-7).slice(-4);
  return [4, 3, 2, 1].map(n => end - n * 60 / song.bpm).filter(t => t >= 0);
}
export function xAtBeat(region: Region, m: Measure, beat: number) {
  const xs = region.beatXs;
  if (xs.length !== m.beats + 1) return beat / m.beats;
  const b = Math.min(m.beats - 1, Math.floor(beat));
  return xs[b] + (xs[b + 1] - xs[b]) * (beat - b);
}
// The next downbeat may sit after a printed margin. Traverse that margin
// during the preceding beat instead of jumping over it at the bar boundary.
export function continuousX(
  region: Region,
  m: Measure,
  beat: number,
  width: number,
  nextFirstX = width,
) {
  if (beat <= m.beats - 1) return width * xAtBeat(region, m, beat);
  const last = width * xAtBeat(region, m, m.beats - 1);
  return last + (nextFirstX - last) * (beat - m.beats + 1);
}
export interface Cycle {
  preludeClicks?: number[];
  at: number;
  countAt: number;
  musicAt: number;
  endAt: number;
  from: number;
  to: number;
  rate: number;
  count: number;
  countBeatSeconds: number;
  beats: number;
}
export function makeCycle(
  at: number,
  from: number,
  to: number,
  rate: number,
  countBars: number,
  m: Measure,
  quarterCountOff = false,
  observedBeatSeconds?: number,
): Cycle {
  const bs =
    ((observedBeatSeconds ?? (beatTime(m, 1) - m.start)) / rate) *
    (quarterCountOff ? m.denominator / 4 : 1);
  const count = quarterCountOff ? 4 : countBars * m.beats;
  // Count-off ends on the score's first beat, not the beginning of leading audio.
  // Preserve that audio and never schedule its buffer before the requested start.
  const leadingSeconds = quarterCountOff ? Math.max(0, m.start - from) / rate : 0;
  const musicAt = at + Math.max(0, count * bs - leadingSeconds);
  const nextBeat = beatTime(m, Math.max(0, Math.ceil(measureBeatAt(m, from) - 1e-8)));
  const countAt = quarterCountOff
    ? at + Math.max(0, leadingSeconds - count * bs)
    : at + Math.max(0, nextBeat - from) / rate;
  return {
    at,
    countAt,
    musicAt,
    endAt: musicAt + (to - from) / rate,
    from,
    to,
    rate,
    count,
    countBeatSeconds: bs,
    beats: quarterCountOff ? 4 : m.beats,
  };
}
export function cyclePosition(c: Cycle, now: number) {
  return clamp(c.from + Math.max(0, now - c.musicAt) * c.rate, c.from, c.to);
}
export function validateSong(x: unknown): asserts x is Song {
  const s = x as Song;
  const finite = (n: unknown) => typeof n === "number" && Number.isFinite(n);
  if (
    !s ||
    s.version !== 1 ||
    (s.lyricText !== undefined && typeof s.lyricText !== "string") ||
    typeof s.id !== "string" ||
    typeof s.title !== "string" ||
    (s.artist !== undefined && typeof s.artist !== "string") ||
    !finite(s.bpm) ||
    s.bpm < 20 ||
    s.bpm > 300 ||
    !finite(s.firstBeat) ||
    s.firstBeat < 0 ||
    !Number.isInteger(s.pageCount) ||
    s.pageCount < (s.audioPractice ? 0 : 1) ||
    s.pageCount > 500 ||
    typeof s.audioName !== "string" ||
    typeof s.pdfName !== "string" ||
    (s.scoreFormat !== undefined &&
      !["pdf", "musicxml"].includes(s.scoreFormat)) ||
    (s.scorePartId !== undefined && typeof s.scorePartId !== "string")
  )
    throw Error(i18nText("model.message381"));
  for (const k of [
    "measures",
    "regions",
    "lyrics",
    "markers",
    "loops",
  ] as const)
    if (!Array.isArray(s[k]) || s[k].length > 100000)
      throw Error(i18nText("model.message382"));
  if (s.audioPractice !== undefined) {
    const a = s.audioPractice;
    if (!a || !finite(a.duration) || a.duration <= 0 || s.firstBeat >= a.duration ||
        !Number.isInteger(a.beats) || a.beats < 1 || a.beats > 16 || ![2,4,8,16].includes(a.denominator) ||
        !Array.isArray(a.peaks) || a.peaks.length > 4096 || a.peaks.some(p => !finite(p) || p < 0 || p > 1) ||
        (a.startAnalyzed !== undefined && typeof a.startAnalyzed !== 'boolean') ||
        (a.barOne !== undefined && (!a.barOne || !finite(a.barOne.time) || a.barOne.time < 0 || a.barOne.time >= a.duration || !['manual','estimated'].includes(a.barOne.source))) ||
        (a.followTempo !== undefined && typeof a.followTempo !== 'boolean') ||
        (a.beatTimes !== undefined && !validBeatTimes(a.beatTimes,a.duration)) ||
        (a.followTempo && (!a.beatTimes || a.beats !== 4 || a.denominator !== 4)) ||
        s.pageCount !== 0 || s.regions.length !== 0 || s.pdfName !== "" || s.scoreFormat !== undefined ||
        !s.measures.length || s.measures.length > 10000)
      throw Error(i18nText("audioPractice.invalidTiming"));
    if(a.followTempo) {
      const expected=trackedAudioMeasures(a.duration,a.beatTimes!,a.barOne?.time);
      if(s.firstBeat!==(a.barOne?.time ?? a.beatTimes![0]) || s.measures.length!==expected.length || s.measures.some((m,i)=>{
        const e=expected[i];
        return !m || !!m.audioPrelude!==!!e.audioPrelude || m.label!==e.label || m.start!==e.start || m.end!==e.end || m.beats!==e.beats || m.denominator!==4 ||
          !Array.isArray(m.beatTimes) || m.beatTimes.length!==e.beatTimes.length || m.beatTimes.some((t,b)=>t!==e.beatTimes[b]);
      }))throw Error(i18nText("audioPractice.invalidTiming"));
    } else if((a.barOne && (s.firstBeat!==a.barOne.time || (s.firstBeat>0 &&
      (!s.measures[0].audioPrelude || s.measures[0].start!==0 || s.measures[0].end!==s.firstBeat)))) ||
      s.measures.some((m,i)=>m.audioPrelude && (!a.barOne || i!==0 || m.beats!==1 || m.label!=='0' || m.beatTimes!==undefined)) || s.measures.filter(m=>!m.audioPrelude).some((m,i)=>!m || m.beatTimes !== undefined || m.beats!==a.beats || m.denominator!==a.denominator ||
        Math.abs(m.start-(s.firstBeat+i*a.beats*60/s.bpm*4/a.denominator))>1e-6 ||
        Math.abs(m.end-(s.firstBeat+(i+1)*a.beats*60/s.bpm*4/a.denominator))>1e-6) ||
        s.measures.at(-1)!.start >= a.duration || s.measures.at(-1)!.end < a.duration-1e-6)
      throw Error(i18nText("audioPractice.invalidTiming"));
  }
  if (s.settings?.tempoMode !== undefined && !['original','practice'].includes(s.settings.tempoMode)) throw Error('Invalid tempo mode');
  const ids = new Set<string>();
  for (const r of s.regions) {
    if (
      !r ||
      typeof r.id !== "string" ||
      ids.has(r.id) ||
      !Number.isInteger(r.page) ||
      r.page < 0 ||
      r.page >= s.pageCount ||
      ![r.x, r.y, r.w, r.h].every(finite) ||
      r.x < 0 ||
      r.y < 0 ||
      r.w <= 0 ||
      r.h <= 0 ||
      r.x + r.w > 1.001 ||
      r.y + r.h > 1.001 ||
      !Array.isArray(r.beatXs)
    )
      throw Error(i18nText("model.message383"));
    ids.add(r.id);
    if (r.lyricAnchors !== undefined) {
      const lyricIds = new Set<string>();
      if (!Array.isArray(r.lyricAnchors) || r.lyricAnchors.length > 100000)
        throw Error(i18nText("model.message383"));
      for (const a of r.lyricAnchors) {
        if (!a || typeof a.lyricId !== "string" || !a.lyricId || lyricIds.has(a.lyricId) ||
            !finite(a.quarterOffset) || a.quarterOffset < 0 || !finite(a.x) || a.x < 0 || a.x > 1)
          throw Error(i18nText("model.message383"));
        lyricIds.add(a.lyricId);
      }
    }
    if (
      r.beatXs.some(
        (v, i) =>
          !finite(v) || v < 0 || v > 1 || (i > 0 && v <= r.beatXs[i - 1]),
      )
    )
      throw Error(i18nText("model.message384"));
  }
  let end = -1;
  const mids = new Set<string>();
  for (const m of s.measures) {
    if (
      !m ||
      (!s.audioPractice && m.audioPrelude !== undefined) ||
      !validMeasureBeatTimes(m) ||
      typeof m.id !== "string" ||
      (s.audioPractice ? m.regionId !== "" : !ids.has(m.regionId)) ||
      mids.has(m.id) ||
      typeof m.label !== "string" ||
      !Number.isInteger(m.beats) ||
      m.beats < 1 ||
      m.beats > 16 ||
      ![2, 4, 8, 16].includes(m.denominator) ||
      !finite(m.start) ||
      !finite(m.end) ||
      m.start < 0 ||
      m.end <= m.start ||
      m.start < end - 1e-5
    )
      throw Error(i18nText("model.message385"));
    mids.add(m.id);
    end = m.end;
  }
  validateMeasureLyrics(s.measureLyrics, mids);
  for (const l of s.lyrics)
    if (
      typeof l.text !== "string" ||
      !finite(l.time) ||
      !finite(l.end) ||
      l.time < 0 ||
      l.end < l.time
    )
      throw Error(i18nText("model.message386"));
  for (const m of s.markers)
    if (typeof m.name !== "string" || !finite(m.time) || m.time < 0)
      throw Error(i18nText("model.message387"));
  for (const l of s.loops)
    if (
      typeof l.name !== "string" ||
      !finite(l.start) ||
      !finite(l.end) ||
      l.start < 0 ||
      l.end <= l.start
    )
      throw Error(i18nText("model.message388"));
  const t = s.settings;
  if (
    !t ||
    !finite(t.rate) ||
    t.rate < 0.5 ||
    t.rate > 1.2 ||
    ![t.musicVolume, t.clickVolume].every(
      (v) => finite(v) && v >= 0 && v <= 1,
    ) ||
    ![0, 1, 2].includes(t.countIn) ||
    !finite(t.position) ||
    t.position < 0 ||
    !finite(t.zoom) ||
    t.zoom < 0.5 ||
    t.zoom > 3 ||
    !["ribbon", "rows", "compare"].includes(t.view)
  )
    throw Error(i18nText("model.message389"));
}

export function validateMeasureLyrics(value: unknown, measureIds: Set<string>): asserts value is MeasureLyric[] | undefined {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length > 100000) throw Error(i18nText("model.message386"));
  const ids = new Set<string>();
  const assigned = new Set<string>();
  for (const l of value) {
    if (!l || typeof l.id !== "string" || !l.id || ids.has(l.id) ||
      typeof l.text !== "string" || !l.text.trim() ||
      !measureIds.has(l.measureId) || assigned.has(l.measureId) || l.placement !== "measure-center")
      throw Error(i18nText("model.message386"));
    ids.add(l.id); assigned.add(l.measureId);
  }
}
