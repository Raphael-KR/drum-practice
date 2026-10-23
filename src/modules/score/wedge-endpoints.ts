import type { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import type { GraphicalMeasure } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalMeasure";
import type { GraphicalContinuousDynamicExpression } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalContinuousDynamicExpression";
import { RIBBON_HEAD_ANCHOR } from "./ribbon-timeline";

/** Native timed entries anchor the note's right edge; interpolate fractional stops. */
export function wedgeAnchor(
  measure: GraphicalMeasure,
  time: number,
  right: number,
) {
  const duration = measure.parentSourceMeasure.Duration.RealValue;
  if (time >= duration - 1e-8) return right;
  const measureX = measure.PositionAndShape.RelativePosition.x;
  const points = measure.staffEntries
    .filter((entry) =>
      entry.graphicalVoiceEntries.some(
        (voice) => !voice.parentVoiceEntry.IsGrace,
      ),
    )
    .map((entry) => ({
      time: entry.relInMeasureTimestamp.RealValue,
      x:
        entry.PositionAndShape.RelativePosition.x +
        measureX +
        RIBBON_HEAD_ANCHOR / 10,
    }));
  points.push({ time: duration, x: right });
  points.sort((a, b) => a.time - b.time);
  const index = points.findIndex((p) => p.time >= time - 1e-8);
  const b = points[Math.max(0, index)];
  const a = points[Math.max(0, index - 1)];
  const x =
    a.time === b.time
      ? b.x
      : a.x + ((b.x - a.x) * (time - a.time)) / (b.time - a.time);
  return Math.max(0, Math.min(right, x));
}

/** OSMD 2.2.1 blends a stop offset with the preceding note's duration.
 * Bind explicit interior stops to native timed entries before alignment/drawing.
 * Keep barline handling, verbal dynamics, soft accents and source times native.
 */
export function installWedgeEndpoints(osmd: OpenSheetMusicDisplay) {
  const calculator = osmd.GraphicSheet.GetCalculator;
  const calculate =
    calculator.calculateGraphicalContinuousDynamic.bind(calculator);
  calculator.calculateGraphicalContinuousDynamic = (expression, position) => {
    const result = calculate(expression, position);
    const dynamic = expression.ContinuousDynamic;
    const end = dynamic.EndMultiExpression;
    if (
      expression.IsVerbal ||
      expression.IsSoftAccent ||
      !dynamic.isWedge() ||
      !end?.EndOffsetFraction
    )
      return result;
    const time = end.Timestamp.RealValue + end.EndOffsetFraction.RealValue;
    const duration = end.SourceMeasureParent.Duration.RealValue;
    if (!(time > 1e-8 && time < duration - 1e-8)) return result;
    const measure = osmd.GraphicSheet.MeasureList[
      end.SourceMeasureParent.measureListIndex
    ]?.find((m) => m?.ParentStaff === expression.ParentStaffLine.ParentStaff);
    if (!measure) return result;
    const last = measure.ParentStaffLine.AbstractExpressions.find(
      (value) =>
        "ContinuousDynamic" in value &&
        (value as GraphicalContinuousDynamicExpression).ContinuousDynamic ===
          dynamic,
    ) as GraphicalContinuousDynamicExpression | undefined;
    if (!last || last.Lines.length !== 2) return result;
    const right =
      measure.PositionAndShape.RelativePosition.x +
      measure.PositionAndShape.BorderRight;
    const x = wedgeAnchor(measure, time, right);
    const crescendo = dynamic.DynamicType === 0;
    const left = Math.min(
      ...last.Lines.flatMap((line) => [line.Start.x, line.End.x]),
    );
    if (x <= left) return result;
    for (const line of last.Lines) {
      const point = crescendo ? line.End : line.Start;
      const Point = point.constructor as new (
        x: number,
        y: number,
      ) => typeof point;
      if (crescendo) line.End = new Point(x, point.y);
      else line.Start = new Point(x, point.y);
    }
    last.calcPsi();
    last.updateSkyBottomLine();
    return result;
  };
}
