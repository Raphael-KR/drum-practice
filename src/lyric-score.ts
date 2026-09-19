import { beatTime, type Song, type Lyric } from "./model";
import { nearestQuarterBeat } from "./lyric-grid";
export function projectLyrics(s: Song) {
  const offsets: number[] = [];
  let total = 0;
  for (const m of s.measures) {
    offsets.push(total);
    total += (m.beats * 4) / m.denominator;
  }
  const at = (q: number) => {
    for (let i = 0; i < s.measures.length; i++) {
      const m = s.measures[i],
        length = (m.beats * 4) / m.denominator;
      if (q < offsets[i] + length - 1e-9 || i === s.measures.length - 1)
        return beatTime(
          m,
          Math.min(m.beats, (Math.max(0, q - offsets[i]) * m.denominator) / 4),
        );
    }
    return 0;
  };
  for (const l of s.lyrics) {
    const p = l.scorePosition;
    if (!p) continue;
    const i = s.measures.findIndex((m) => m.id === p.measureId);
    if (i < 0)
      throw Error("가사가 연결된 마디가 없습니다. 마디 구성을 확인하세요.");
    const m = s.measures[i];
    if (
      p.quarterOffset < 0 ||
      p.quarterOffset > (m.beats * 4) / m.denominator ||
      p.durationQuarters <= 0 ||
      !Number.isFinite(p.durationQuarters)
    )
      throw Error("가사 리듬 위치 또는 길이가 올바르지 않습니다.");
    l.grid = { measureId: m.id, tick: p.quarterOffset * m.denominator };
    l.freeTiming = false;
    l.time = at(offsets[i] + p.quarterOffset);
    l.end = at(offsets[i] + p.quarterOffset + p.durationQuarters);
  }
  s.lyrics.sort((a, b) => a.time - b.time);
}
/** One-time conversion only. Playback seconds are never used to edit an existing score position. */
export function migrateLyricPositions(s: Song) {
  if (!s.measures.length) return;
  for (const l of s.lyrics) {
    if (l.scorePosition) continue;
    const nearest = nearestQuarterBeat(s, l.time),
      p =
        l.grid && !l.freeTiming
          ? l.grid
          : { measureId: nearest.measure.id, tick: nearest.tick };
    let index = s.measures.findIndex((m) => m.id === p.measureId),
      m = s.measures[index];
    let offset = p.tick / m.denominator;
    if (
      offset >= (m.beats * 4) / m.denominator &&
      index + 1 < s.measures.length
    ) {
      m = s.measures[++index];
      offset = 0;
    }
    const duration = Math.max(
      1 / m.denominator,
      Math.round(((l.end - l.time) / (m.end - m.start)) * m.beats * 4) /
        m.denominator,
    );
    l.scorePosition = {
      measureId: m.id,
      quarterOffset: offset,
      durationQuarters: duration,
    };
  }
  projectLyrics(s);
}
export function lyricDurationBeats(s: Song, l: Lyric) {
  const p = l.scorePosition,
    m = s.measures.find((m) => m.id === p?.measureId);
  return p && m ? (p.durationQuarters * m.denominator) / 4 : 0.25;
}
export function advanceLyricPosition(s:Song,p:NonNullable<Lyric['scorePosition']>,quarters:number){let i=s.measures.findIndex(m=>m.id===p.measureId);if(i<0)throw Error('가사 마디를 찾을 수 없습니다.');let offset=p.quarterOffset+quarters;while(i<s.measures.length-1&&offset>=s.measures[i].beats*4/s.measures[i].denominator){offset-=s.measures[i].beats*4/s.measures[i].denominator;i++;}return {measureId:s.measures[i].id,quarterOffset:offset,durationQuarters:p.durationQuarters};}
