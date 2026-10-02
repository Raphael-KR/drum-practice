import { t as i18nText } from "./i18n";
import { validateSong, type Song, type Region } from "./model";
import type { RecordData } from "./storage";
export type ScoreFormat = "pdf" | "musicxml";
export interface ScoreVariant {
  format: ScoreFormat;
  name: string;
  partId?: string;
  source: Blob;
  pages: Blob[];
  regions: Region[];
  measures: {
    id: string;
    regionId: string;
    beats: number;
    denominator: number;
  }[];
}
export function activeScore(record: RecordData): ScoreVariant {
  const s = record.song;
  return {
    format: s.scoreFormat ?? "pdf",
    name: s.pdfName,
    partId: s.scorePartId,
    source: record.pdf,
    pages: record.pages,
    regions: structuredClone(s.regions),
    measures: s.measures.map(({ id, regionId, beats, denominator }) => ({
      id,
      regionId,
      beats,
      denominator,
    })),
  };
}
export function songScores(record: RecordData): ScoreVariant[] {
  const active = activeScore(record);
  return [
    active,
    ...(record.otherScores ?? []).filter((s) => s.format !== active.format),
  ].sort((a, b) => (a.format === b.format ? 0 : a.format === "pdf" ? -1 : 1));
}
/** Change only score geometry. Audio timing, lyrics and practice state belong to the song. */
export function useScore(record: RecordData, target: ScoreVariant): RecordData {
  const song = structuredClone(record.song);
  if (
    target.measures.length !== song.measures.length ||
    target.measures.some(
      (m, i) =>
        m.id !== song.measures[i].id ||
        m.beats !== song.measures[i].beats ||
        m.denominator !== song.measures[i].denominator,
    )
  )
    throw Error(i18nText("song-scores.message541"));
  song.regions = structuredClone(target.regions);
  song.measures.forEach((m, i) => {
    m.regionId = target.measures[i].regionId;
  });
  song.scoreFormat = target.format;
  song.scorePartId = target.partId;
  song.pdfName = target.name;
  song.pageCount = target.pages.length;
  validateSong(song);
  return {
    ...record,
    song,
    canonicalXML: record.canonicalXML,
    pdf: target.source,
    pages: target.pages,
    audio: record.audio,
    otherScores: songScores(record).filter((s) => s.format !== target.format),
  };
}
