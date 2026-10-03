import { normalizeDrumScore } from "./drum-legend";
import { t } from "./i18n";
import type { RecordData } from "./storage";
import { songScores } from "./song-scores";
/** Resolve geometry from MusicXML without mutating sources, timing or library state. */
export async function prepareBrowserScore(
  record: RecordData,
  progress: (s: string) => void = () => {},
) {
  const xml = songScores(record).find((score) => score.format === "musicxml");
  if (!xml) return record;
  const { renderMusicXML, readMusicXML } = await import("./musicxml");
  const source = record.canonicalXML
    ? new Blob([record.canonicalXML], {
        type: "application/vnd.recordare.musicxml+xml",
      })
    : xml.source;
  const canonicalXML = normalizeDrumScore(await readMusicXML(source));
  record = {...record, canonicalXML};
  const rendered = await renderMusicXML(new Blob([canonicalXML], {type:"application/vnd.recordare.musicxml+xml"}), progress, xml.partId);
  if (
    rendered.parsed.measures.length !== record.song.measures.length ||
    rendered.parsed.measures.some(
      (m, i) =>
        m.beats !== record.song.measures[i].beats ||
        m.denominator !== record.song.measures[i].denominator,
    )
  )
    throw Error(t("browser-score.structureMismatch"));
  const geometry = {
    pages: rendered.pages,
    regions: rendered.regions,
    measures: xml.measures.map((m, i) => ({
      ...m,
      regionId: rendered.regions[i].id,
    })),
  };
  if (record.song.scoreFormat === "musicxml")
    return {
      ...record,
      pages: geometry.pages,
      song: {
        ...structuredClone(record.song),
        pageCount: geometry.pages.length,
        regions: geometry.regions,
        measures: record.song.measures.map((m, i) => ({
          ...m,
          regionId: geometry.measures[i].regionId,
        })),
      },
    };
  return {
    ...record,
    otherScores: record.otherScores?.map((s) =>
      s.format === "musicxml" ? { ...s, ...geometry } : s,
    ),
  };
}
