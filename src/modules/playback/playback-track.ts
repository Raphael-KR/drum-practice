import {
  beatTime as audioBeatTime,
  xAtBeat,
  type Song,
} from "../../model/model";
import { audioMeasureHTML } from "../audio/audio-practice-view";
import { gridPhase } from "../score/ribbon-timeline";
import { displayRegion } from "../score/score-view";
import { selectPlaybackEngraving } from "./playback-assets";
import {
  measurePosition,
  measureWidth,
  renderScoreRows,
  ribbonPosition,
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

  function position(index: number, beat: number, width: number) {
    const s = h.song(),
      asset = ribbonAsset(index);
    if (asset) {
      if (s.settings.uniformSpacing) {
        const m = s.measures[index];
        return (
          width *
          gridPhase((beat * 4) / m.denominator, (m.beats * 4) / m.denominator)
        );
      }
      if (s.settings.view === "rows")
        return width * xAtBeat(asset.region, s.measures[index], beat);
      // Ribbon motion retains the continuous musical timeline.
      const timeline = h.assets().ribbon!.get(index)!;
      return ribbonPosition(
        width,
        beat,
        s.measures[index].beats,
        timeline.phase,
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
    const asset = h.assets().ribbon?.get(index);
    return selectPlaybackEngraving(
      asset,
      h.song().settings.uniformSpacing,
      h.song().settings.view,
    );
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
    if (s.settings.uniformSpacing && timeline?.grid)
      return (
        (stage.clientWidth / 4) *
        (s.settings.view === "ribbon" ? s.settings.zoom : 1)
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
    if (
      fittedRowWidth !== undefined &&
      fittedRowWidth === stage.clientWidth / 4
    )
      return fittedRowWidth;
    const song = h.song();
    const s: Song = { ...song, settings: { ...song.settings, view: "rows" } };
    const base = stage.clientWidth / 4;
    if (!stage.clientHeight) return base;
    const assets = h.assets();
    const naturalHeight = Math.max(
      s.audioPractice ? 100 : 1,
      ...s.regions.map((region) => {
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
            ...s.measures.map((_, i) => {
              const asset = selectPlaybackEngraving(
                assets.ribbon?.get(i),
                s.settings.uniformSpacing,
                "rows",
              );
              return asset
                ? scoreLayout(
                    s,
                    asset.region,
                    base,
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
    stage.style.setProperty("--fitted-row-width", `${stage.clientWidth}px`);
    stage.style.setProperty("--row-content-height", `${fittedHeight}px`);
    stage.style.setProperty("--browse-row-pitch", `${fittedHeight + 28}px`);
    fittedRowWidth = width;
    return width;
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
