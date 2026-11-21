import { beatTime as audioBeatTime, type Song } from "../../model/model";
import { audioMeasureHTML } from "../audio/audio-practice-view";
import { gridPhase } from "../score/ribbon-timeline";
import { displayRegion } from "../score/score-view";
import { timeMeasureWidth, rowScale } from "../score/time-spacing";
import {
  measurePosition,
  measureWidth,
  renderScoreRows,
  scoreLayout,
} from "./playback-layout";
import { renderMeasure } from "./playback-measure";
import type { PlaybackScreenHost } from "./playback-screen";

interface TrackControls {
  stage: HTMLElement;
  ribbon: HTMLElement;
  scrubbing(): boolean;
  resuming(): boolean;
}

/** Screen-local geometry. Read current assets/settings on demand; never cache Song globally. */
export function createPlaybackTrack(
  h: Pick<PlaybackScreenHost, "song" | "assets" | "player">,
  controls: TrackControls,
) {
  const { stage, ribbon } = controls;
  const rows = {
    rowWindow: -1,
    pausedBrowseIndex: -1,
    renderedBrowseWidth: NaN,
    playbackRowOrigin: 0,
  };
  let fittedRowWidth: number | undefined;
  let fittedStageWidth: number | undefined;

  function position(index: number, beat: number, width: number) {
    const s = h.song(),
      asset = ribbonAsset(index);
    if (asset) {
      const m = s.measures[index];
      return (
        width *
        gridPhase(
          (beat * 4) / m.denominator,
          (m.beats * 4) / m.denominator,
          asset.region.beatXs[0],
        )
      );
    }
    if (s.audioPractice) {
      const m = s.measures[index];
      return (width * (audioBeatTime(m, beat) - m.start)) / (m.end - m.start);
    }
    return measurePosition(s, index, beat, width, widthOf);
  }
  function ribbonAsset(index: number) {
    if (h.song().scoreFormat !== "musicxml") return undefined;
    return h.assets().ribbon?.get(index);
  }

  function widthOf(m: Song["measures"][number]) {
    if (h.song().audioPractice)
      return Math.max(120, (stage.clientWidth / 4) * h.song().settings.zoom);
    const s = h.song(),
      a = h.assets(),
      timeline =
        s.scoreFormat === "musicxml"
          ? a.ribbon?.get(s.measures.indexOf(m))
          : undefined,
      r =
        timeline?.region ??
        displayRegion(
          s,
          s.regions.find((r) => r.id === m.regionId)!,
        );
    return measureWidth(
      s,
      r,
      stage.clientWidth,
      timeline?.ratio ?? a.ratios[r.page] ?? 1.294,
      timeline?.staff ?? a.staffs.get(r.id),
    );
  }
  function measureHTML(m: Song["measures"][number], i: number, width: number) {
    if (h.song().audioPractice) return audioMeasureHTML(h.song(), m, i, width);
    const s = h.song(),
      a = h.assets(),
      timeline = ribbonAsset(s.measures.indexOf(m)),
      r =
        timeline?.region ??
        displayRegion(
          s,
          s.regions.find((r) => r.id === m.regionId)!,
        );
    const staff = timeline?.staff ?? a.staffs.get(r.id),
      isSVG = s.scoreFormat === "musicxml";
    return renderMeasure({
      s,
      m,
      i,
      width,
      r,
      layout: staff
        ? scoreLayout(s, r, width, stage.clientWidth, staff)
        : undefined,
      highlight: timeline?.highlight ?? a.highlights[r.page],
      pageURL: timeline?.url ?? a.urls[r.page],
      pageRatio: timeline?.ratio ?? a.ratios[r.page] ?? 1.294,
      isSVG,
    });
  }

  function rowCellWidth() {
    if (fittedRowWidth !== undefined && fittedStageWidth === stage.clientWidth)
      return fittedRowWidth;
    const song = h.song();
    const s: Song = { ...song, settings: { ...song.settings, view: "rows" } };
    const assets = h.assets();
    // Reserve the same one-space overhang at the outer viewport edges. The
    // rhythmic unit stays the same across meters; overflowing rows scale together.
    const inkRatio =
      s.scoreFormat === "musicxml"
        ? Math.max(
            0,
            ...Array.from(
              assets.ribbon?.entries() ?? [],
              ([i, asset]) =>
                (((asset.staff.gap * asset.ratio) / asset.region.w) *
                  timeMeasureWidth(
                    (s.measures[i].beats * 4) / s.measures[i].denominator,
                  )) /
                timeMeasureWidth(4),
            ),
          )
        : 0;
    const base = stage.clientWidth / (4 + 2 * inkRatio);
    if (!stage.clientHeight) return base;
    const naturalHeight = Math.max(
      s.audioPractice ? 100 : 1,
      ...(s.scoreFormat === "musicxml" ? [] : s.regions).map((region) => {
        const staff = assets.staffs.get(region.id);
        return staff
          ? scoreLayout(
              s,
              displayRegion(s, region),
              base,
              stage.clientWidth,
              staff,
            )?.height || 100
          : 100;
      }),
    );
    // Size rows from the full available width; surrounding UI must not shrink notation.
    const width = base;
    const selectedHeight =
      s.scoreFormat === "musicxml"
        ? Math.max(
            ...s.measures.map((m, i) => {
              const asset = assets.ribbon?.get(i);
              return asset
                ? scoreLayout(
                    s,
                    asset.region,
                    (base * timeMeasureWidth((m.beats * 4) / m.denominator)) /
                      timeMeasureWidth(4),
                    stage.clientWidth,
                    asset.staff,
                  )!.height
                : naturalHeight;
            }),
          )
        : naturalHeight;
    const fittedHeight =
      Math.max(naturalHeight, selectedHeight) + (s.audioPractice ? 30 : 0);
    stage.style.setProperty(
      "--two-row-stage-height",
      `${Math.ceil(fittedHeight * 2 + 56 + 2)}px`,
    );
    stage.style.setProperty("--fitted-row-width", `${width * 4}px`);
    stage.style.setProperty("--row-content-height", `${fittedHeight}px`);
    stage.style.setProperty("--browse-row-pitch", `${fittedHeight + 28}px`);
    fittedRowWidth = width;
    fittedStageWidth = stage.clientWidth;
    return width;
  }
  function rowWidths(start: number) {
    const s = h.song();
    const base = rowCellWidth();
    if (s.scoreFormat !== "musicxml") return Array(4).fill(base) as number[];
    const widths = s.measures
      .slice(start, start + 4)
      .map(
        (m) =>
          (base * timeMeasureWidth((m.beats * 4) / m.denominator)) /
          timeMeasureWidth(4),
      );
    const scale = rowScale(widths, base * 4);
    return widths.map((width) => width * scale);
  }
  function renderRows(index: number) {
    renderScoreRows(
      {
        stage,
        ribbon,
        song: h.song,
        playing: h.player().playing,
        scrubbing: controls.scrubbing(),
        resume: controls.resuming(),
        measureHTML,
        cellWidth: rowCellWidth(),
        rowWidths,
      },
      rows,
      index,
    );
  }

  return {
    rows,
    position,
    ribbonAsset,
    widthOf,
    measureHTML,
    rowCellWidth,
    renderRows,
    invalidate() {
      fittedRowWidth = undefined;
    },
  };
}
