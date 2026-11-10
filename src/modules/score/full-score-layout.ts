import {
  FontStyles,
  GraphicalLabel,
  Label,
  TextAlignmentEnum,
  type OpenSheetMusicDisplay,
} from "opensheetmusicdisplay";
import type { GraphicalMusicPage } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalMusicPage";
import type { GraphicalMeasure } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalMeasure";
import type { MusicSystem } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/MusicSystem";
import type { StaffLine } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/StaffLine";
import type { Song } from "../../model/model";
import { formatNumber, t } from "../../shared/i18n/i18n";
import { SCORE_TEXT_FONT_FAMILY } from "./score-text-font";

// OSMD units are staff spaces. Keep two spaces between adjacent content bounds.
const CLEARANCE = 2;

/** Keep XML rows intact when native note/lyric spacing exceeds the normal engraving width. */
export function fitFullScoreSystems(
  osmd: OpenSheetMusicDisplay,
  host: HTMLElement,
) {
  const measures = osmd.GraphicSheet.MeasureList;
  const starts = new Set([0]);
  for (const [index, row] of measures.entries()) {
    const source = row[0]?.parentSourceMeasure;
    if (source?.printNewSystemXml || source?.printNewPageXml) starts.add(index);
  }
  // Without explicit XML row boundaries, leave automatic wrapping to OSMD.
  if (starts.size === 1) return;
  const extraBreak = osmd.GraphicSheet.MusicPages.some((page) =>
    page.MusicSystems.some((system) => {
      const first = system.StaffLines[0]?.Measures[0];
      return first && !starts.has(first.parentSourceMeasure.measureListIndex);
    }),
  );
  if (!extraBreak) return;

  let width = 0;
  let rowWidth = 0;
  let lookahead = 0;
  for (const [index, row] of measures.entries()) {
    if (starts.has(index)) {
      width = Math.max(width, rowWidth);
      rowWidth = 0;
    }
    rowWidth += Math.max(
      ...row.map(
        (measure) =>
          measure.minimumStaffEntriesWidth +
          measure.beginInstructionsWidth +
          measure.endInstructionsWidth,
      ),
    );
    lookahead = Math.max(
      lookahead,
      ...row.map((measure) => measure.beginInstructionsWidth),
    );
  }
  const rules = osmd.EngravingRules;
  // The native builder also reserves the next measure's opening instructions.
  width =
    Math.max(width, rowWidth) +
    lookahead +
    rules.MeasureLeftMargin +
    rules.PageLeftMargin +
    rules.PageRightMargin +
    rules.SystemLeftMargin +
    rules.SystemRightMargin;
  host.style.width = `${Math.ceil(Math.max(width, osmd.Sheet.pageWidth) * 10 * osmd.Zoom)}px`;
  osmd.render();
}

/** Reposition native systems once, after all ink bounds and before absolute coordinates/drawing. */
export function installFullScoreLayout(
  osmd: OpenSheetMusicDisplay,
  song: Song,
) {
  const calculator = osmd.GraphicSheet.GetCalculator as unknown as {
    calculateMusicSystems(): void;
    calculateMeasureNumberPlacement(system: MusicSystem): void;
    calculateSingleMeasureNumberPlacement(
      measure: GraphicalMeasure,
      staff: StaffLine,
      system: MusicSystem,
    ): void;
  };
  // OSMD 2.3 skips the initial 1 in its outer placement loop. Use its native
  // single-label path for every row start; XML numbers, position and skyline stay native.
  calculator.calculateMeasureNumberPlacement = (system) => {
    const staff = system.StaffLines[0];
    const measure = staff?.Measures[0];
    if (!measure) {
      console.warn("Full-score row has no first measure", {
        system: system.Id,
      });
      return;
    }
    calculator.calculateSingleMeasureNumberPlacement(measure, staff, system);
  };
  const calculate = calculator.calculateMusicSystems.bind(calculator);
  calculator.calculateMusicSystems = () => {
    calculate();
    const page = osmd.GraphicSheet.MusicPages[0];
    if (!page?.MusicSystems.length) return;
    const systems = page.MusicSystems;
    let bottom = addMetadata(osmd, page, song);
    const pixelPhase = osmd.EngravingRules.SnapStafflinesToCrispPixels
      ? 0.05
      : 0;
    for (const system of systems) {
      const offset = system.StaffLines[0].PositionAndShape.RelativePosition.y;
      // Keep staff-relative skyline coordinates; system/page margins are not ink.
      const bounds = system.StaffLines.map((staff) => ({
        top:
          staff.PositionAndShape.RelativePosition.y -
          offset +
          staff.SkyBottomLineCalculator.getSkyLineMin(),
        bottom:
          staff.PositionAndShape.RelativePosition.y -
          offset +
          staff.SkyBottomLineCalculator.getBottomLineMax(),
      }));
      const top = Math.min(...bounds.map((b) => b.top));
      const staffY =
        Math.ceil((bottom + CLEARANCE - top - pixelPhase) * 10) / 10 +
        pixelPhase;
      system.PositionAndShape.RelativePosition.y = staffY - offset;
      bottom = staffY + Math.max(...bounds.map((b) => b.bottom));
    }
    for (const label of page.Labels) {
      if (label.AnchoredToPageBottom)
        label.PositionAndShape.RelativePosition.y =
          bottom + CLEARANCE - label.PositionAndShape.BorderTop;
    }
    // Recompute only the page envelope; keep native system/ink bounds intact.
    const box = page.PositionAndShape;
    box.BorderTop = box.BorderMarginTop = 0;
    box.BorderBottom = box.BorderMarginBottom = bottom;
    box.calculateTopBottomBorders(false);
  };
}

/** Header labels use the native drawer and embedded score font, so they scale with the score. */
function addMetadata(
  osmd: OpenSheetMusicDisplay,
  page: GraphicalMusicPage,
  song: Song,
) {
  const rules = osmd.EngravingRules;
  const headings = page.Labels.filter((label) => !label.AnchoredToPageBottom);
  const headingBottom = Math.max(
    rules.TitleTopDistance,
    ...headings.map(
      (label) =>
        label.PositionAndShape.RelativePosition.y +
        label.PositionAndShape.BorderBottom,
    ),
  );
  const firstSystem = page.MusicSystems[0];
  const staff = firstSystem.StaffLines[0];
  const left =
    firstSystem.PositionAndShape.RelativePosition.x +
    staff.PositionAndShape.RelativePosition.x;
  const right = left + staff.PositionAndShape.Size.width;
  const height = rules.SheetSubtitleHeight;
  const label = (text: string, x: number, alignment: TextAlignmentEnum) => {
    const result = new GraphicalLabel(
      new Label(text),
      height,
      alignment,
      rules,
      page.PositionAndShape,
    );
    result.Label.fontFamily = SCORE_TEXT_FONT_FAMILY;
    result.Label.fontStyle = FontStyles.Bold;
    result.SVGClass = "osmd-score-metadata";
    result.setLabelPositionAndShapeBorders();
    result.PositionAndShape.RelativePosition.x = x;
    page.Labels.push(result);
    return result;
  };
  const metadata = [
    label(`♩ = ${formatNumber(song.bpm)}`, left, TextAlignmentEnum.LeftTop),
  ];
  if (song.artist?.trim())
    metadata.push(
      label(
        t("fullScore.artistCredit", { artist: song.artist.trim() }),
        right,
        TextAlignmentEnum.RightTop,
      ),
    );
  for (const item of metadata)
    item.PositionAndShape.RelativePosition.y = headingBottom + CLEARANCE;
  return Math.max(
    ...metadata.map(
      (item) =>
        item.PositionAndShape.RelativePosition.y +
        item.PositionAndShape.BorderBottom,
    ),
  );
}
