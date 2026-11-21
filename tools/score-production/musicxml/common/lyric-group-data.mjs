/** Shared production projection; the app owns grouping and time spacing rules. */
import { groupLyrics } from "../../../../src/modules/score/lyric-groups.ts";
import {
  timePosition,
  timeMeasureWidth,
} from "../../../../src/modules/score/time-spacing.ts";

export function groupProductionLyrics(measures, lyrics, textWidth) {
  const positions = new Map();
  let start = 0,
    x = 0;
  for (const measure of measures) {
    positions.set(measure.id, { start, x });
    const duration = (measure.beats * 4) / measure.denominator;
    start += duration;
    x += timeMeasureWidth(duration);
  }
  const originals = new Map(lyrics.map((lyric) => [lyric.id, lyric]));
  const sources = lyrics.map((lyric) => {
    const p = lyric.scorePosition;
    const measure = positions.get(p?.measureId);
    if (!measure)
      throw Error(
        `Missing production lyric measure: lyric=${lyric.id}, measure=${p?.measureId}`,
      );
    const start = measure.start + p.quarterOffset;
    return {
      id: lyric.id,
      text: lyric.text,
      x: measure.x + timePosition(p.quarterOffset),
      start,
      end: start + p.durationQuarters,
    };
  });
  const groups = groupLyrics(sources, textWidth);
  return {
    sources: sources.map((source) => ({
      ...source,
      width: textWidth(source.text),
    })),
    groups,
    lyrics: groups.map((group) => ({
      id: group.id,
      text: group.text,
      confirmed: group.sourceIds.every((id) => originals.get(id).confirmed),
      time: 0,
      end: 0,
      scorePosition: {
        ...originals.get(group.id).scorePosition,
        durationQuarters: group.end - group.start,
      },
    })),
  };
}
