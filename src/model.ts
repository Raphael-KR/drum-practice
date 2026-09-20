export interface Region {
  id: string;
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
  beatXs: number[];
}
export interface Measure {
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
  scorePosition?: { measureId: string; quarterOffset: number; durationQuarters: number };
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
  rate: number;
  click: boolean;
  musicVolume: number;
  clickVolume: number;
  countIn: number;
  countEach: boolean;
  zoom: number;
  view: "ribbon" | "rows" | "compare";
  position: number;
}
export interface Song {
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
  lyricRevision?: string;
  lyricGridEnabled?: boolean;
  lyricShifts?: string[];
  lyricArchive?: { revision: string; lyrics: Lyric[] }[];
  markers: Marker[];
  loops: Loop[];
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
  musicVolume: 0.8,
  clickVolume: 0.3,
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
      ? clamp(((time - m.start) / (m.end - m.start)) * m.beats, 0, m.beats)
      : 0,
  };
}
export function beatTime(m: Measure, beat: number) {
  return m.start + ((m.end - m.start) * beat) / m.beats;
}
export function reflow(song: Song) {
  let t = song.firstBeat;
  for (const m of song.measures) {
    m.start = t;
    m.end = t + (((m.beats * 60) / song.bpm) * 4) / m.denominator;
    t = m.end;
  }
}
export function beatEvents(song: Song, start: number, end: number) {
  const out: { time: number; accent: boolean; beat: number }[] = [];
  for (const m of song.measures)
    for (let b = 0; b < m.beats; b++) {
      const t = beatTime(m, b);
      if (t >= start - 1e-7 && t < end - 1e-7)
        out.push({ time: t, accent: b === 0, beat: b + 1 });
    }
  return out;
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
): Cycle {
  const bs = (m.end - m.start) / m.beats / rate * (quarterCountOff ? m.denominator / 4 : 1);
  const count = quarterCountOff ? 4 : countBars * m.beats;
  const musicAt = at + count * bs;
  const originalBeat = (m.end - m.start) / m.beats;
  const nextBeat =
    m.start +
    Math.max(0, Math.ceil((from - m.start) / originalBeat - 1e-8)) *
      originalBeat;
  const countAt = quarterCountOff ? at : at + Math.max(0, nextBeat - from) / rate;
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
    s.pageCount < 1 ||
    s.pageCount > 500 ||
    typeof s.audioName !== "string" ||
    typeof s.pdfName !== "string" ||
    (s.scoreFormat !== undefined && !["pdf", "musicxml"].includes(s.scoreFormat)) ||
    (s.scorePartId !== undefined && typeof s.scorePartId !== "string")
  )
    throw Error("곡 정보 또는 BPM이 올바르지 않습니다.");
  for (const k of [
    "measures",
    "regions",
    "lyrics",
    "markers",
    "loops",
  ] as const)
    if (!Array.isArray(s[k]) || s[k].length > 100000)
      throw Error("곡 데이터가 누락되었습니다.");
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
      throw Error("악보 영역이 올바르지 않습니다.");
    ids.add(r.id);
    if (
      r.beatXs.some(
        (v, i) =>
          !finite(v) || v < 0 || v > 1 || (i > 0 && v <= r.beatXs[i - 1]),
      )
    )
      throw Error("박 위치는 왼쪽에서 오른쪽 순서여야 합니다.");
  }
  let end = -1;
  const mids = new Set<string>();
  for (const m of s.measures) {
    if (
      !m ||
      typeof m.id !== "string" ||
      !ids.has(m.regionId) ||
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
      throw Error("마디 순서·시각·박자표를 확인하세요.");
    mids.add(m.id);
    end = m.end;
  }
  for (const l of s.lyrics)
    if (
      typeof l.text !== "string" ||
      !finite(l.time) ||
      !finite(l.end) ||
      l.time < 0 ||
      l.end < l.time
    )
      throw Error("가사 시각이 올바르지 않습니다.");
  for (const m of s.markers)
    if (typeof m.name !== "string" || !finite(m.time) || m.time < 0)
      throw Error("마커가 올바르지 않습니다.");
  for (const l of s.loops)
    if (
      typeof l.name !== "string" ||
      !finite(l.start) ||
      !finite(l.end) ||
      l.start < 0 ||
      l.end <= l.start
    )
      throw Error("반복 구간이 올바르지 않습니다.");
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
    t.zoom > 2 ||
    !["ribbon", "rows", "compare"].includes(t.view)
  )
    throw Error("연습 설정이 올바르지 않습니다.");
}
