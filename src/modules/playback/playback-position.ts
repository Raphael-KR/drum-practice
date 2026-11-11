import { formatSongTitle } from "../library/song-title";
import { t as i18nText } from "../../shared/i18n/i18n";
import { type Song } from "../../model/model";
import { nearestQuarterBeat, gridLabel } from "../lyrics/lyric-grid";

/** The nearest quarter beat is the reporting/display coordinate, not a containing bin. */
export function playbackPosition(song: Song, time: number) {
  const point = nearestQuarterBeat(song, time);
  const label = point.measure.audioPrelude
    ? i18nText("audioPractice.prelude")
    : gridLabel(point.measure, point.tick);
  const text = i18nText("playback-position.message433", {
    value1: formatSongTitle(song),
    value2: "",
    label: label,
    value4: point.measure.beats,
    value5: point.measure.denominator,
    value6: time.toFixed(3),
    value7: point.time.toFixed(3),
  });
  return { label, text };
}
