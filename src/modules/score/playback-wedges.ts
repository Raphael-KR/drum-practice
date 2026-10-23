import type { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import type { GraphicalMeasure } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalMeasure";
import type { GraphicalContinuousDynamicExpression } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalContinuousDynamicExpression";
import type { ContinuousDynamicExpression } from "opensheetmusicdisplay/build/dist/src/MusicalScore/VoiceData/Expressions/ContinuousExpressions/ContinuousDynamicExpression";
import type { RibbonSpacing } from "./ribbon-engraving";
import { RIBBON_HEAD_ANCHOR } from "./ribbon-timeline";

interface Piece {
  expression: GraphicalContinuousDynamicExpression;
  measure: GraphicalMeasure;
}

/** OSMD 2.1.x finishes expression alignment before sizing/drawing systems.
 * Adapt this one calculator instance; OSMD recreates its SVG drawer on render.
 */
export function installPlaybackWedges(
  osmd: OpenSheetMusicDisplay,
  spacing: RibbonSpacing,
) {
  const calculator = osmd.GraphicSheet.GetCalculator as unknown as {
    calculateExpressionAlignements(): void;
  };
  const align = calculator.calculateExpressionAlignements.bind(calculator);
  calculator.calculateExpressionAlignements = () => {
    align();
    layoutPlaybackWedges(osmd, spacing);
  };
}

/** Use the same native timed entries as beatXs; interpolate interior offsets. */
function anchor(measure: GraphicalMeasure, time: number, width: number) {
  const duration = measure.parentSourceMeasure.Duration.RealValue;
  if (time >= duration - 1e-8) return width;
  const staffX = measure.ParentStaffLine.PositionAndShape.AbsolutePosition.x;
  const points = measure.staffEntries
    .filter((entry) =>
      entry.graphicalVoiceEntries.some(
        (voice) => !voice.parentVoiceEntry.IsGrace,
      ),
    )
    .map((entry) => ({
      time: entry.relInMeasureTimestamp.RealValue,
      x:
        entry.PositionAndShape.AbsolutePosition.x -
        staffX +
        RIBBON_HEAD_ANCHOR / 10,
    }));
  points.push({ time: duration, x: width });
  points.sort((a, b) => a.time - b.time);
  const right = points.findIndex((p) => p.time >= time - 1e-8);
  const b = points[Math.max(0, right)];
  const a = points[Math.max(0, right - 1)];
  const x =
    a.time === b.time
      ? b.x
      : a.x + ((b.x - a.x) * (time - a.time)) / (b.time - a.time);
  return Math.max(0, Math.min(width, x));
}

/** Playback engraves one measure per native system, then joins those cells.
 * Rejoin only multi-measure native wedges before the native SVG drawer runs.
 * Printed layout, canonical expressions, single-bar wedges and soft accents stay native.
 */
export function layoutPlaybackWedges(
  osmd: OpenSheetMusicDisplay,
  spacing: RibbonSpacing,
) {
  const groups = new Map<ContinuousDynamicExpression, Piece[]>();
  for (const row of osmd.GraphicSheet.MeasureList)
    for (const measure of row) {
      if (!measure) continue;
      for (const value of measure.ParentStaffLine.AbstractExpressions) {
        if (!("ContinuousDynamic" in value)) continue;
        const expression = value as GraphicalContinuousDynamicExpression;
        const dynamic = expression.ContinuousDynamic;
        const start = dynamic.StartMultiExpression;
        const end = dynamic.EndMultiExpression;
        if (
          expression.IsVerbal ||
          expression.IsSoftAccent ||
          !dynamic.isWedge() ||
          !start ||
          !end ||
          start.SourceMeasureParent.measureListIndex >=
            end.SourceMeasureParent.measureListIndex
        )
          continue;
        const pieces = groups.get(dynamic) ?? [];
        if (!pieces.some((p) => p.expression === expression))
          pieces.push({ expression, measure });
        groups.set(dynamic, pieces);
      }
    }
  for (const [dynamic, pieces] of groups) {
    pieces.sort(
      (a, b) =>
        a.measure.parentSourceMeasure.measureListIndex -
        b.measure.parentSourceMeasure.measureListIndex,
    );
    const start = dynamic.StartMultiExpression;
    const end = dynamic.EndMultiExpression;
    const segments = pieces.map((piece, i) => {
      const duration = piece.measure.parentSourceMeasure.Duration.RealValue * 4;
      // Native coordinates are engraving units, ten SVG units per unit.
      const width =
        (spacing.uniformQuarters && spacing.rowWidth
          ? spacing.rowWidth
          : duration * spacing.quarter) / 10;
      return {
        ...piece,
        left:
          i === 0 ? anchor(piece.measure, start.Timestamp.RealValue, width) : 0,
        right:
          i === pieces.length - 1
            ? anchor(
                piece.measure,
                end.Timestamp.RealValue +
                  (end.EndOffsetFraction?.RealValue ?? 0),
                width,
              )
            : width,
      };
    });
    const length = segments.reduce((sum, p) => sum + p.right - p.left, 0);
    if (!(length > 0) || pieces.some((p) => p.expression.Lines.length !== 2))
      throw Error(
        `Invalid playback wedge: start=${start.SourceMeasureParent.measureListIndex + 1}, end=${end.SourceMeasureParent.measureListIndex + 1}, length=${length}, lines=${pieces.map((p) => p.expression.Lines.length).join(",")}`,
      );
    const centers = pieces.map(
      ({ expression: e }) =>
        (e.Lines[0].Start.y +
          e.Lines[0].End.y +
          e.Lines[1].Start.y +
          e.Lines[1].End.y) /
        4,
    );
    // Keep native collision clearance, shared in staff-relative coordinates.
    const center =
      dynamic.Placement === 0 ? Math.min(...centers) : Math.max(...centers);
    const opening = osmd.EngravingRules.WedgeOpeningLength / 2;
    const crescendo = dynamic.DynamicType === 0;
    let distance = 0;
    for (const { expression, left, right } of segments) {
      const from = distance / length;
      distance += right - left;
      const to = distance / length;
      expression.Lines.forEach((line, edge) => {
        const sign = edge === 0 ? -1 : 1;
        // Native tips share one PointF2D between both lines. Detach them with
        // the native constructor, keeping OSMD lazy-loaded by musicxml.ts.
        const Point = line.Start.constructor as new (
          x: number,
          y: number,
        ) => typeof line.Start;
        const leftY = center + sign * opening * (crescendo ? from : 1 - from);
        const rightY = center + sign * opening * (crescendo ? to : 1 - to);
        // OSMD's bounding-box/skyline contract orients falling wedges right→left.
        line.Start = crescendo
          ? new Point(left, leftY)
          : new Point(right, rightY);
        line.End = crescendo
          ? new Point(right, rightY)
          : new Point(left, leftY);
      });
      expression.calcPsi();
      expression.updateSkyBottomLine();
    }
  }
}
