import {
  xAtBeat,
  type Measure,
  type Region,
  type Song,
} from "../../model/model";
import { t } from "../../shared/i18n/i18n";
import { escapeHTML } from "../../shared/ui/html";
import { lyricMeasureId } from "./lyric-grid";

/** The same lyric ownership and projection serve practice and printed-page views. */
export function lyricsForMeasure(song: Song, measure: Measure) {
  return song.lyrics.filter(
    (lyric) => lyricMeasureId(song, lyric) === measure.id,
  );
}

export function scoreLyricsHTML({
  song,
  measure,
  region,
  width,
  lyrics = lyricsForMeasure(song, measure),
  isSVG,
  positionAtBeat = (beat) => xAtBeat(region, measure, beat),
}: {
  song: Song;
  measure: Measure;
  region: Region;
  width: number;
  lyrics?: Song["lyrics"];
  isSVG: boolean;
  positionAtBeat?: (beat: number) => number;
}) {
  const centered = song.measureLyrics?.find((l) => l.measureId === measure.id);
  const syllables = lyrics
    .map((lyric) => {
      const beat =
        ((lyric.time - measure.start) / (measure.end - measure.start)) *
        measure.beats;
      // A changed musical position invalidates its reviewed PDF display anchor.
      const anchor =
        !isSVG && lyric.scorePosition?.measureId === measure.id
          ? region.lyricAnchors?.find(
              (a) =>
                a.lyricId === lyric.id &&
                Math.abs(a.quarterOffset - lyric.scorePosition!.quarterOffset) <
                  1e-8,
            )
          : undefined;
      const x = anchor ? anchor.x : positionAtBeat(beat);
      const left = anchor ? `${x * width}px` : `${x * 100}%`;
      return `<span class="syllable${lyric.text.length > 4 ? " syllable-long" : ""}"${anchor ? ' data-pdf-lyric-anchor="true"' : ""} title="${lyric.confirmed ? t("main.message232") : t("main.message233")}" style="left:${left};">${escapeHTML(lyric.text)}</span>`;
    })
    .join("");
  return (
    syllables +
    (centered
      ? `<span class="measure-lyric">${escapeHTML(centered.text)}</span>`
      : "")
  );
}
