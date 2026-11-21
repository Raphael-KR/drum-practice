import {
  MusicSystemBuilder,
  type OpenSheetMusicDisplay,
} from "opensheetmusicdisplay";
import type { VexFlowMeasure } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/VexFlow/VexFlowMeasure";
import type { VexFlowVoiceEntry } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/VexFlow/VexFlowVoiceEntry";
import type { MusicSheetCalculator } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/MusicSheetCalculator";
import type { MusicSystem } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/MusicSystem";
import { visibleBeginInstructions } from "./score-instructions";
import {
  expandFullWidthSystem,
  scoreMeasureSpacing,
} from "./full-score-spacing";
import {
  timeMeasureWidth,
  timePosition,
  RIBBON_HEAD_ANCHOR,
  type TimeSpacing,
} from "./time-spacing";
export type RibbonSpacing = TimeSpacing;
type LayoutCalculator = Omit<
  MusicSheetCalculator,
  "calculateMeasureXLayout" | "calculateMeasureWidthFromStaffEntries"
> & {
  calculateMeasureXLayout(row: VexFlowMeasure[]): number;
  calculateMeasureWidthFromStaffEntries(
    row: VexFlowMeasure[],
    width: number,
  ): number;
};

/** Reuse native tick contexts, beams, labels and drawing; replace only the time axis. */
export function installRibbonEngraving(
  osmd: OpenSheetMusicDisplay,
  spacing: RibbonSpacing,
  playback = true,
) {
  const calculator = osmd.GraphicSheet
    .GetCalculator as unknown as LayoutCalculator;
  if (playback) installMeasureEndWedges(osmd);
  // Width factors scale rhythmic space; retain authored rhythm, not old print stretching.
  osmd.Sheet.MeasureWidthFactor = 1;
  for (const measure of osmd.Sheet.SourceMeasures) measure.WidthFactor = 1;
  const calculate = calculator.calculateMeasureXLayout.bind(calculator);
  const widthOf = (row: VexFlowMeasure[]) =>
    timeMeasureWidth(
      row[0].parentSourceMeasure.Duration.RealValue * 4,
      spacing,
    ) / 10;
  // Native lyric and symbol minimum widths must not stretch the musical axis.
  calculator.calculateMeasureWidthFromStaffEntries = widthOf;
  calculator.calculateMeasureXLayout = (row) => {
    calculate(row);
    for (const measure of row) {
      if (!measure?.formatVoices) continue;
      const format = measure.formatVoices;
      measure.formatVoices = (width, parent) => {
        const duration = measure.parentSourceMeasure.Duration.RealValue * 4;
        if (playback)
          measure.setWidth(timeMeasureWidth(duration, spacing) / 10);
        format(width, parent);
        const stave = measure.getVFStave();
        const prefix = playback ? 0 : measure.beginInstructionsWidth * 10;
        const axis = scoreMeasureSpacing(measure, spacing);
        const contexts = new Set();
        for (const entry of measure.staffEntries)
          for (const voice of entry.graphicalVoiceEntries) {
            if (voice.parentVoiceEntry.IsGrace) continue;
            const note = (voice as VexFlowVoiceEntry).vfStaveNote;
            if (!note) continue;
            note.setStave(stave);
            const context = note.getTickContext();
            if (contexts.has(context)) continue;
            contexts.add(context);
            const x =
              stave.getX() +
              prefix +
              timePosition(entry.relInMeasureTimestamp.RealValue * 4, axis) -
              RIBBON_HEAD_ANCHOR;
            context.setX(context.getX() + x - note.getAbsoluteX());
          }
      };
    }
    return widthOf(row);
  };
}

/** OSMD builds systems inside render(). Scope its native width policy to this render,
 * retaining source row breaks and native barlines. Only authored full-width rows expand. */
export function renderTimeSpacedScore(
  osmd: OpenSheetMusicDisplay,
  {
    printHost,
    alignSystems,
    fullWidthSystems = new Set<number>(),
  }: {
    printHost?: HTMLElement;
    alignSystems: boolean;
    fullWidthSystems?: ReadonlySet<number>;
  },
) {
  const prototype = MusicSystemBuilder.prototype as unknown as {
    rules: typeof osmd.EngravingRules;
    currentSystemParams: {
      currentSystem: MusicSystem;
      currentWidth: number;
      currentSystemFixWidth: number;
      currentSystemVarWidth: number;
    };
    addBeginInstructions(
      row: VexFlowMeasure[],
      systemStart: boolean,
      firstSource: boolean,
    ): number;
    calculateXScalingFactor(fixed: number, variable: number): number;
    stretchMusicSystem(last: boolean): void;
  };
  const scaling = prototype.calculateXScalingFactor;
  const stretch = prototype.stretchMusicSystem;
  const instructions = prototype.addBeginInstructions;
  let systemStartWidth: number | undefined;
  prototype.addBeginInstructions = function (row, systemStart, firstSource) {
    const width = instructions.call(this, row, systemStart, firstSource);
    if (this.rules !== osmd.EngravingRules) return width;
    for (const measure of row)
      if (measure)
        measure.beginInstructionsWidth = visibleBeginInstructions(measure);
    let visibleWidth = Math.max(
      0,
      ...row.map((measure) => measure?.beginInstructionsWidth ?? 0),
    );
    if (alignSystems && systemStart) {
      // Share only the first row's visible instruction space. Clefs omitted
      // before native layout contribute nothing to this alignment gutter.
      systemStartWidth ??= visibleWidth;
      visibleWidth = Math.max(visibleWidth, systemStartWidth);
      for (const measure of row)
        if (measure) measure.beginInstructionsWidth = visibleWidth;
    }
    return visibleWidth;
  };
  prototype.calculateXScalingFactor = function (fixed, variable) {
    return this.rules === osmd.EngravingRules
      ? 1
      : scaling.call(this, fixed, variable);
  };
  let regularSystemWidth: number | undefined;
  let firstSystemWidth: number | undefined;
  let expandedBeforeReference = false;
  prototype.stretchMusicSystem = function (last) {
    if (this.rules === osmd.EngravingRules && alignSystems) {
      const { currentSystem } = this.currentSystemParams;
      const measures = currentSystem.StaffLines[0].Measures;
      const realMeasures = measures.filter((m) => !m.IsExtraGraphicalMeasure);
      let width = measures.reduce(
        (sum, m) =>
          sum +
          m.beginInstructionsWidth +
          m.minimumStaffEntriesWidth +
          m.endInstructionsWidth,
        0,
      );
      firstSystemWidth ??= width;
      if (
        realMeasures.length === 4 &&
        realMeasures.every(
          (m) => m.parentSourceMeasure.Duration.RealValue === 1,
        )
      ) {
        regularSystemWidth ??= width;
        const tail = Math.max(0, regularSystemWidth - width);
        // Starts already align; absorb any remaining native end-instruction
        // width difference here without stretching the rhythmic axis.
        for (const staff of currentSystem.StaffLines)
          staff.Measures.filter((m) => !m.IsExtraGraphicalMeasure).at(
            -1,
          )!.endInstructionsWidth += tail;
        this.currentSystemParams.currentWidth += tail;
        this.currentSystemParams.currentSystemFixWidth += tail;
        width += tail;
      }
      if (
        fullWidthSystems.size &&
        realMeasures.length &&
        fullWidthSystems.has(
          realMeasures[0].parentSourceMeasure.measureListIndex,
        )
      ) {
        expandedBeforeReference ||= regularSystemWidth === undefined;
        const extra = expandFullWidthSystem(
          currentSystem,
          (regularSystemWidth ?? firstSystemWidth) - width,
        );
        this.currentSystemParams.currentWidth += extra;
        this.currentSystemParams.currentSystemVarWidth += extra;
      }
    }
    stretch.call(this, this.rules === osmd.EngravingRules || last);
  };
  try {
    osmd.render();
    // A declared row can precede the first normal reference row. Reuse the
    // measured reference once; ordinary scores and ending rows need no extra pass.
    if (expandedBeforeReference && regularSystemWidth !== undefined)
      osmd.render();
    if (printHost && fitPrintedSystemWidth(osmd, printHost)) osmd.render();
  } finally {
    prototype.addBeginInstructions = instructions;
    prototype.calculateXScalingFactor = scaling;
    prototype.stretchMusicSystem = stretch;
  }
}

/** Fit authored rows once without disabling vertical pagination. Native widths
 * include instruction space; only the canvas grows, never notes or rhythm. */
function fitPrintedSystemWidth(
  osmd: OpenSheetMusicDisplay,
  host: HTMLElement,
): boolean {
  if (
    !osmd.Sheet.SourceMeasures.some(
      (m) => m.printNewSystemXml || m.printNewPageXml,
    )
  )
    return false;
  let width = 0,
    maximum = 0;
  for (const [index, row] of osmd.GraphicSheet.MeasureList.entries()) {
    const measure = row[0],
      source = measure.parentSourceMeasure;
    if (!index || source.printNewSystemXml || source.printNewPageXml) {
      maximum = Math.max(maximum, width);
      width =
        measure.PositionAndShape.AbsolutePosition.x -
        measure.ParentMusicSystem.Parent.PositionAndShape.AbsolutePosition.x;
    }
    width += measure.PositionAndShape.Size.width;
  }
  const pixels = Math.ceil(
    (Math.max(maximum, width) + osmd.EngravingRules.PageRightMargin) *
      10 *
      osmd.Zoom,
  );
  if (pixels <= host.getBoundingClientRect().width) return false;
  host.style.width = `${pixels}px`;
  return true;
}

/** Barline stops were interpreted as the next system's x=0 in OSMD 2.1.x.
 * For playback's one-measure systems, anchor that stop to the last timed entry;
 * native wedge layout then extends it to this measure's right boundary.
 * Retain this layout contract until native barline-stop rendering is verified.
 * Scope the adaptation to the calculation; never mutate the canonical input.
 */
export function installMeasureEndWedges(osmd: OpenSheetMusicDisplay) {
  const calculator = osmd.GraphicSheet
    .GetCalculator as unknown as LayoutCalculator;
  if (!calculator.calculateGraphicalContinuousDynamic) return;
  const calculate =
    calculator.calculateGraphicalContinuousDynamic.bind(calculator);
  calculator.calculateGraphicalContinuousDynamic = (expression, position) => {
    const end = expression.ContinuousDynamic.EndMultiExpression as Omit<
      typeof expression.ContinuousDynamic.EndMultiExpression,
      "EndOffsetFraction"
    > & {
      EndOffsetFraction?: import("opensheetmusicdisplay/build/dist/src/Common/DataObjects/Fraction").Fraction;
    };
    const offset = end?.EndOffsetFraction;
    const source = end?.SourceMeasureParent;
    const timestamp = end?.Timestamp;
    const atBarline =
      offset &&
      timestamp &&
      source &&
      Math.abs(
        timestamp.RealValue + offset.RealValue - source.Duration.RealValue,
      ) < 1e-8;
    const measure =
      atBarline &&
      osmd.GraphicSheet.MeasureList[source.measureListIndex]?.find(
        (m) => m?.ParentStaff === expression.StartMeasure.ParentStaff,
      );
    const last = (measure || undefined)?.staffEntries
      ?.filter(
        (entry) =>
          entry.relInMeasureTimestamp.RealValue < source.Duration.RealValue &&
          entry.graphicalVoiceEntries.some((v) => !v.parentVoiceEntry.IsGrace),
      )
      .at(-1);
    if (!last || expression.IsSoftAccent)
      return calculate(expression, position);
    end.Timestamp = last.relInMeasureTimestamp;
    end.EndOffsetFraction = undefined;
    try {
      return calculate(expression, position);
    } finally {
      end.Timestamp = timestamp;
      end.EndOffsetFraction = offset;
    }
  };
}
