import { timeMeasureWidth, timePosition } from "./time-spacing";
import type { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import type { VexFlowMeasure } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/VexFlow/VexFlowMeasure";
import { type Region } from "../../model/model";
import { t as i18nText } from "../../shared/i18n/i18n";
import { MUSICXML_TOP_SPACES } from "./practice-staff-layout";
import type { RibbonSpacing } from "./ribbon-engraving";
import { gridPhase } from "./ribbon-timeline";
import { fullScoreSystemTransform } from "./full-score-width";
import type { installWordsPositions } from "./words-position";
import type { installScoreLyrics } from "./score-lyrics";

import type { XMLScore } from "./musicxml-parse";

export function interpolateX(
  points: { beat: number; x: number }[],
  beat: number,
): number {
  if (beat <= points[0].beat) return points[0].x;
  if (beat >= points.at(-1)!.beat) return points.at(-1)!.x;
  for (let i = 1; i < points.length; i++)
    if (beat <= points[i].beat) {
      const a = points[i - 1],
        b = points[i];
      return a.x + ((b.x - a.x) * (beat - a.beat)) / (b.beat - a.beat);
    }
  return points.at(-1)!.x;
}

/** Bounds and viewBox use native SVG units; preserve one origin for crops and staff anchors. */
export function measureMusicXMLSystems(
  osmd: OpenSheetMusicDisplay,
  svgs: SVGSVGElement[],
  positionedWords: ReturnType<typeof installWordsPositions>,
  lyricLabels: ReturnType<typeof installScoreLyrics> = new Map(),
) {
  // Crop against actual system ink, not a fixed nine-space lower margin.
  const systemBounds = svgs.map(
    () => new Map<number, { top: number; bottom: number }>(),
  );
  const pageTops = svgs.map(() => 0);
  // OSMD 2.3 nests staff paths inside .vf-stave. Use the native measure
  // group and staff coordinate instead of depending on direct path children.
  for (const row of osmd.GraphicSheet.MeasureList)
    for (const g of row) {
      const measure = g?.getSVGGElement();
      if (!measure) continue;
      const pi = g.ParentMusicSystem.Parent.PageNumber - 1;
      const rows = systemBounds[pi];
      const stave = (g as VexFlowMeasure).getVFStave();
      const transform = fullScoreSystemTransform(g.ParentMusicSystem);
      const key = Math.round(stave.getYForLine(0) * 100);
      pageTops[pi] = Math.min(
        pageTops[pi],
        (stave.getYForLine(0) -
          MUSICXML_TOP_SPACES * stave.getSpacingBetweenLines()) *
          transform.scale +
          transform.y,
      );
      const box = measure.getBBox(),
        previous = rows.get(key);
      rows.set(key, {
        top: Math.min(previous?.top ?? Infinity, box.y),
        bottom: Math.max(previous?.bottom ?? -Infinity, box.y + box.height),
      });
    }
  // Native expressions and lyrics live outside .vf-measure. Include only
  // this staff's ink so crops neither cut lyrics nor reveal adjacent systems.
  for (const row of osmd.GraphicSheet.MeasureList)
    for (const g of row) {
      if (!g) continue;
      const page = g.ParentMusicSystem.Parent;
      const key = Math.round(
        (g as VexFlowMeasure).getVFStave().getYForLine(0) * 100,
      );
      const bounds = systemBounds[page.PageNumber - 1].get(key);
      if (!bounds) continue;
      const include = (node: Node | undefined) => {
        const box = (node as SVGGraphicsElement)?.getBBox?.();
        if (!box) return;
        bounds.top = Math.min(bounds.top, box.y - 1);
        bounds.bottom = Math.max(bounds.bottom, box.y + box.height + 1);
      };
      for (const entry of g.staffEntries)
        for (const lyric of entry.LyricsEntries)
          include(lyric.GraphicalLabel.SVGNode);
      const staff = g.ParentStaffLine;
      for (const label of [
        ...staff.LyricsDashes,
        ...(lyricLabels.get(staff) ?? []),
      ])
        include(label.SVGNode);
      for (const line of staff.LyricLines) include(line.SVGElement);
      for (const expression of g.ParentStaffLine.AbstractExpressions) {
        if (expression.Label && positionedWords.has(expression.Label)) {
          include(expression.Label.SVGNode);
        }
        const wedge = expression as unknown as {
          Lines?: { SVGElement?: SVGGraphicsElement }[];
          lines?: { SVGElement?: SVGGraphicsElement }[];
        };
        for (const line of wedge.Lines ?? wedge.lines ?? []) {
          include(line.SVGElement);
        }
      }
    }
  // Extend the viewBox above zero when the first system's marks need room.
  // Keep native glyph coordinates and XML system breaks; normalize the page
  // origin for regions, staff positions and highlight projection below.
  for (const [pi, svg] of svgs.entries()) {
    const ink = svg.getBBox(),
      view = svg.viewBox.baseVal;
    const top = Math.floor(Math.min(view.y, pageTops[pi], ink.y - 5));
    const bottom = Math.min(
      view.y + view.height,
      Math.ceil(ink.y + ink.height + 30),
    );
    if (bottom > top) {
      svg.setAttribute(
        "viewBox",
        `${view.x} ${top} ${view.width} ${bottom - top}`,
      );
      svg.setAttribute("height", String(bottom - top));
    }
  }

  return systemBounds;
}

/** Normalize only after page bounds are final; beat positions retain the existing interpolation. */
export function extractMusicXMLRegions(
  osmd: OpenSheetMusicDisplay,
  parsed: XMLScore,
  svgs: SVGSVGElement[],
  systemBounds: ReturnType<typeof measureMusicXMLSystems>,
  timeline?: RibbonSpacing,
) {
  const regions: Region[] = [];
  for (let i = 0; i < parsed.measures.length; i++) {
    const g = osmd.GraphicSheet.MeasureList[i]?.[0];
    if (!g) throw Error(i18nText("musicxml.message415", { value1: i + 1 }));
    const page = g.ParentMusicSystem.Parent,
      pi = page.PageNumber - 1,
      svg = svgs[pi];
    if (!svg) throw Error(i18nText("musicxml.message416"));
    const box = g.PositionAndShape,
      p = box.AbsolutePosition,
      pp = page.PositionAndShape.AbsolutePosition;
    // OSMD SVG viewBox coordinates use ten units per engraving unit.
    const view = svg.viewBox.baseVal;
    const width = view.width,
      height = view.height;
    if (!(width > 0 && height > 0))
      throw Error(i18nText("musicxml.message417"));
    const transform = fullScoreSystemTransform(g.ParentMusicSystem);
    const px = (x: number) => x * transform.scale + transform.x;
    const py = (y: number) => y * transform.scale + transform.y;
    const x = Math.max(0, px((p.x - pp.x + box.BorderLeft) * 10)),
      right = timeline
        ? x +
          timeMeasureWidth(
            (parsed.measures[i].beats * 4) / parsed.measures[i].denominator,
            timeline,
          )
        : Math.min(width, px((p.x - pp.x + box.BorderRight) * 10));
    const stave = (g as VexFlowMeasure).getVFStave();
    const staffY = stave.getYForLine(0);
    const bounds = systemBounds[pi].get(Math.round(staffY * 100));
    const y = Math.max(
        view.y,
        bounds
          ? py(bounds.top - 5)
          : py(staffY - MUSICXML_TOP_SPACES * stave.getSpacingBetweenLines()),
      ),
      bottom = Math.min(
        view.y + height,
        py(bounds ? bounds.bottom + 5 : staffY + 95),
      );
    const w = right - x,
      h = bottom - y;
    if (w <= 0 || h <= 0)
      throw Error(
        `${i18nText("musicxml.message418")} measure=${i + 1}, page=${pi + 1}, bounds=${x},${y},${right},${bottom}, size=${w}x${h}, viewBox=${view.x},${view.y},${width},${height}`,
      );
    const meta = parsed.measures[i];
    const entries = g.staffEntries
      .map((e) => ({
        beat: e.relInMeasureTimestamp.RealValue * meta.denominator,
        x: (px((e.PositionAndShape.AbsolutePosition.x - pp.x) * 10) - x) / w,
      }))
      .filter((e) => e.beat >= 0 && e.beat < meta.beats && e.x >= 0 && e.x < 1);
    entries.sort((a, b) => a.beat - b.beat);
    const wholeRest = g.hasOnlyRests && g.staffEntries.length === 1;
    const points = wholeRest
      ? [{ beat: 0, x: 0.04 }]
      : entries.filter((e, j) => !j || e.beat > entries[j - 1].beat + 1e-8);
    if (!points.length) points.push({ beat: 0, x: 0.08 });
    points.push({ beat: meta.beats, x: 1 });
    const start = timeline ? timePosition(0, timeline) : 0;
    if (timeline && !(Number.isFinite(start) && start >= 0 && start < w))
      throw Error(
        `Invalid shared grid start: measure=${i + 1}, start=${start}, width=${w}`,
      );
    const beatXs = Array.from({ length: meta.beats + 1 }, (_, b) =>
      timeline
        ? gridPhase(
            (b * 4) / meta.denominator,
            (meta.beats * 4) / meta.denominator,
            start / w,
          )
        : interpolateX(points, b),
    );
    if (
      beatXs.some(
        (v, j) =>
          !Number.isFinite(v) ||
          v < 0 ||
          v > 1 ||
          (j > 0 && v <= beatXs[j - 1]),
      )
    )
      throw Error(i18nText("musicxml.message419", { value1: i + 1 }));
    regions.push({
      id: `xml-r${i + 1}`,
      page: pi,
      x: x / width,
      y: (y - view.y) / height,
      w: w / width,
      h: h / height,
      beatXs,
    });
  }
  const staffs = regions.map((r, i) => {
    const transform = fullScoreSystemTransform(
      osmd.GraphicSheet.MeasureList[i][0].ParentMusicSystem,
    );
    const stave = (
      osmd.GraphicSheet.MeasureList[i][0] as VexFlowMeasure
    ).getVFStave();
    const view = svgs[r.page].viewBox.baseVal;
    return {
      top:
        (stave.getYForLine(0) * transform.scale + transform.y - view.y) /
        view.height,
      gap:
        ((stave.getYForLine(1) - stave.getYForLine(0)) * transform.scale) /
        view.height,
    };
  });

  return { regions, staffs };
}
