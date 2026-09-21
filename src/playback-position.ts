import { t as i18nText } from "./i18n";
import { type Song } from "./model";
import { nearestQuarterBeat, gridLabel } from "./lyric-grid";

/** The nearest quarter beat is the reporting/display coordinate, not a containing bin. */
export function playbackPosition(song: Song, time: number) {
  const point = nearestQuarterBeat(song, time);
  const label = gridLabel(point.measure, point.tick);
  const text = i18nText("playback-position.message433", {
    value1: song.artist ? song.artist + " - " : "",
    value2: song.title,
    label: label,
    value4: point.measure.beats,
    value5: point.measure.denominator,
    value6: time.toFixed(3),
    value7: point.time.toFixed(3),
  });
  return { label, text };
}

export async function copyPosition(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* Local HTML may deny Clipboard API. */
    }
  }
  const active = document.activeElement as HTMLElement | null;
  const field = document.createElement("textarea");
  field.value = text;
  field.readOnly = true;
  field.style.cssText =
    "position:fixed;left:0;top:0;opacity:0;pointer-events:none";
  document.body.append(field);
  try {
    field.select();
    field.setSelectionRange(0, text.length);
    if (!document.execCommand("copy"))
      throw Error(i18nText("playback-position.message434"));
  } finally {
    field.remove();
    active?.focus({ preventScroll: true });
  }
}
