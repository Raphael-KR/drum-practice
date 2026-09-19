import { type Song, type Region } from "./model";
import type { XMLScore } from "./musicxml";
export const scoreFormat = (name: string): "pdf" | "musicxml" =>
  /\.(musicxml|xml|mxl)$/i.test(name) ? "musicxml" : "pdf";
export const scoreArchivePath = (song: Song) =>
  song.scoreFormat === "musicxml" ? "media/score.musicxml" : "media/score.pdf";
export function applyXMLTiming(song: Song, parsed: XMLScore) {
  if (song.measures.length !== parsed.measures.length)
    throw Error("MusicXML 마디 수가 다릅니다.");
  let at = song.firstBeat,
    bpm = song.bpm;
  song.measures.forEach((m, i) => {
    const xml = parsed.measures[i];
    bpm = xml.bpm ?? bpm;
    m.label = xml.label;
    m.beats = xml.beats;
    m.denominator = xml.denominator;
    m.start = at;
    m.end = at + (((xml.beats * 60) / bpm) * 4) / xml.denominator;
    at = m.end;
  });
}
/** Geometry-only replacement: never alter the user's audio timeline or lyrics. */
export function replaceWithMusicXML(
  song: Song,
  result: { regions: Region[]; pages: Blob[]; parsed: XMLScore },
  name: string,
): Song {
  if (song.measures.length !== result.parsed.measures.length)
    throw Error(
      `마디 수가 다릅니다 (현재 ${song.measures.length}, MusicXML ${result.parsed.measures.length}). 새 악보로 추가해 주세요.`,
    );
  if (
    song.measures.some(
      (m, i) =>
        m.beats !== result.parsed.measures[i].beats ||
        m.denominator !== result.parsed.measures[i].denominator,
    )
  )
    throw Error(
      "마디별 박자표가 달라 싱크를 보존할 수 없습니다. 새 악보로 추가해 주세요.",
    );
  const next = structuredClone(song);
  next.regions = result.regions;
  next.pageCount = result.pages.length;
  next.measures.forEach((m, i) => (m.regionId = result.regions[i].id));
  next.scoreFormat = "musicxml";
  next.scorePartId = result.parsed.partId;
  next.pdfName = name;
  return next;
}
