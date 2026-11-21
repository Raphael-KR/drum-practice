import type { RecordData } from "../../model/record";
import { migrateLyricPositions, projectLyrics } from "../lyrics/lyric-score";
import { canonicalManifest } from "./canonical-metadata";
import { readCanonicalLyrics } from "./canonical-lyric-read";
import { groupLyrics } from "./lyric-groups";
import { loadScoreTextFonts, SCORE_TEXT_FONT_FAMILY } from "./score-text-font";
import {
  SCORE_LYRIC_POINTS,
  timeMeasureWidth,
  timePosition,
} from "./time-spacing";

/** Group newly authored lyrics once; metadata saves retain existing canonical groups. */
export async function prepareLyricGroups(
  record: RecordData,
  preserveFinalGroups = false,
) {
  const song = record.song;
  migrateLyricPositions(song);
  if (song.lyricText) {
    record.lyricWork = { ...record.lyricWork, text: song.lyricText };
    delete song.lyricText;
  }
  if (!song.lyrics.length || preserveFinalGroups) return;
  if (record.canonicalXML) {
    const d = new DOMParser().parseFromString(
      record.canonicalXML,
      "application/xml",
    );
    const data = canonicalManifest(d);
    const prior = data && readCanonicalLyrics(d, data);
    const identity = (items: typeof song.lyrics) =>
      JSON.stringify(
        items.map(({ id, text, scorePosition }) => ({
          id,
          text,
          scorePosition,
        })),
      );
    // Confirmation changes do not change text boxes or musical positions.
    // Re-grouping final text could merge it with the following group again.
    if (prior && identity(prior) === identity(song.lyrics)) return;
  }
  await loadScoreTextFonts();
  const context = document.createElement("canvas").getContext("2d");
  if (!context) throw new Error("Lyric measurement canvas unavailable");
  context.font = `${SCORE_LYRIC_POINTS}pt "${SCORE_TEXT_FONT_FAMILY}"`;
  let quarter = 0,
    x = 0;
  const starts = song.measures.map((m) => {
    const value = { quarter, x };
    const duration = (m.beats * 4) / m.denominator;
    quarter += duration;
    x += timeMeasureWidth(duration);
    return value;
  });
  const originals = structuredClone(song.lyrics);
  const groups = groupLyrics(
    originals.map((lyric) => {
      const p = lyric.scorePosition!;
      const i = song.measures.findIndex((m) => m.id === p.measureId);
      if (i < 0) throw new Error(`Unknown lyric measure: ${p.measureId}`);
      const start = starts[i].quarter + p.quarterOffset;
      return {
        id: lyric.id,
        text: lyric.text,
        x: starts[i].x + timePosition(p.quarterOffset),
        start,
        end: start + p.durationQuarters,
      };
    }),
    (text) => context.measureText(text).width,
  );
  record.lyricWork = { ...record.lyricWork, lyrics: originals };
  const byId = new Map(originals.map((lyric) => [lyric.id, lyric]));
  record.lyricWork.groups = Object.fromEntries(
    groups
      .filter((group) => group.sourceIds.length > 1)
      .map((group) => [
        group.id,
        group.sourceIds.map((id) => {
          const lyric = byId.get(id)!;
          const p = lyric.scorePosition!;
          const index = song.measures.findIndex((m) => m.id === p.measureId);
          return {
            lyric: structuredClone(lyric),
            offsetQuarters:
              starts[index].quarter + p.quarterOffset - group.start,
          };
        }),
      ]),
  );
  song.lyrics = groups.map((group) => {
    const first = byId.get(group.id)!;
    return {
      ...first,
      text: group.text,
      confirmed: group.sourceIds.every((id) => byId.get(id)!.confirmed),
      scorePosition: {
        ...first.scorePosition!,
        durationQuarters: group.end - group.start,
      },
    };
  });
  projectLyrics(song);
}
