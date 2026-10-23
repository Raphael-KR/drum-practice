import {
  GraphicalLabel,
  Label,
  TextAlignmentEnum,
  type OpenSheetMusicDisplay,
} from "opensheetmusicdisplay";
import type { MultiExpression } from "opensheetmusicdisplay/build/dist/src/MusicalScore/VoiceData/Expressions/MultiExpression";
import type { StaffLine } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/StaffLine";
import type { GraphicalMeasure } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalMeasure";
import type { PointF2D } from "opensheetmusicdisplay/build/dist/src/Common/DataObjects/PointF2D";
import type { FontStyles } from "opensheetmusicdisplay/build/dist/src/Common/Enums/FontStyles";
import type { RehearsalBounds } from "./rehearsal-layout";

interface Calculator {
  calculateRehearsalMarks(): void;
  calculateMoodAndUnknownExpression(
    multi: MultiExpression,
    measure: number,
    staff: number,
  ): void;
  calculateLabel(
    staff: StaffLine,
    point: PointF2D,
    text: string,
    style: FontStyles,
    placement: number,
    height: number,
    alignment?: TextAlignmentEnum,
    spacing?: number,
  ): GraphicalLabel;
}
interface Item {
  label: GraphicalLabel;
  measure: GraphicalMeasure;
  anchor: number;
  placement: number;
  descent: number;
}
type SectionBounds = (
  measure: GraphicalMeasure,
  textWidth: (
    text: string,
    font: { family: string; size: number; weight: string },
  ) => number,
) => RehearsalBounds | undefined;

/** Match section typography and flow native words before SVG drawing.
 * XML offsets still supply the native anchor; no source or SVG node is changed.
 */
export function installPlaybackWords(
  osmd: OpenSheetMusicDisplay,
  sectionBounds: SectionBounds,
  cropLabels: WeakSet<GraphicalLabel>,
  fitToMeasure = true,
) {
  const calculator = osmd.GraphicSheet.GetCalculator as unknown as Calculator;
  const items: Item[] = [];
  const calculate = calculator.calculateMoodAndUnknownExpression;
  calculator.calculateMoodAndUnknownExpression = (multi, index, staff) => {
    const original = calculator.calculateLabel;
    calculator.calculateLabel = (...args) => {
      const anchor = args[1].x;
      const label = original.apply(calculator, args);
      const shape = label.PositionAndShape;
      const sourceLeft = shape.RelativePosition.x + shape.BorderLeft;
      // Resize around the source left edge. Section size is points;
      // OSMD label height is ten SVG pixels.
      label.Label.fontHeight =
        (osmd.EngravingRules.RehearsalMarkFontSize * (96 / 72)) / 10;
      label.setLabelPositionAndShapeBorders();
      shape.RelativePosition.x = sourceLeft - shape.BorderLeft;
      const measure = osmd.GraphicSheet.MeasureList[index]?.[staff];
      if (fitToMeasure && measure)
        items.push({ label, measure, anchor, placement: args[4], descent: 0 });
      return label;
    };
    try {
      calculate.call(calculator, multi, index, staff);
    } finally {
      calculator.calculateLabel = original;
    }
  };
  if (!fitToMeasure) return;
  const marks = calculator.calculateRehearsalMarks;
  calculator.calculateRehearsalMarks = () => {
    marks.call(calculator);
    const context = document.createElement("canvas").getContext("2d");
    if (!context) return;
    const fontWidth = (
      text: string,
      font: { family: string; size: number; weight: string },
    ) => {
      context.font = `${font.weight} ${font.size * (96 / 72)}px "${font.family}"`;
      return context.measureText(text).width;
    };
    for (const item of items) {
      const font = item.label.Label;
      context.font = `${font.fontHeight * 10}px "${font.fontFamily || osmd.EngravingRules.DefaultFontFamily}"`;
      const metrics = context.measureText(font.text);
      item.descent =
        (metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent) /
        10;
    }
    for (const item of items) {
      if (item.placement !== 0) continue;
      if (
        layoutWords(osmd, item, sectionBounds(item.measure, fontWidth), items)
      )
        cropLabels.add(item.label);
    }
    items.length = 0;
  };
}

function intersects(a: RehearsalBounds, b: RehearsalBounds, gap: number) {
  return (
    a.left < b.right + gap &&
    a.right + gap > b.left &&
    a.top < b.bottom + gap &&
    a.bottom + gap > b.top
  );
}

function layoutWords(
  osmd: OpenSheetMusicDisplay,
  item: Item,
  section: RehearsalBounds | undefined,
  all: Item[],
) {
  const { label, measure, anchor } = item;
  const shape = label.PositionAndShape;
  const left =
    measure.PositionAndShape.AbsolutePosition.x -
    measure.ParentStaffLine.PositionAndShape.AbsolutePosition.x;
  const right = left + measure.PositionAndShape.Size.width;
  // Leave readable clearance beyond Canvas/SVG text-metric rounding.
  const gap = 0.5;
  const inset = 0.25;
  const box = (): RehearsalBounds => ({
    left: shape.RelativePosition.x + shape.BorderLeft,
    right: shape.RelativePosition.x + shape.BorderRight,
    top: shape.RelativePosition.y + shape.BorderTop,
    // Native bottom alignment is the baseline; SVG text also has descent.
    bottom: shape.RelativePosition.y + shape.BorderBottom + item.descent,
  });
  const current = box();
  const desiredLeft = anchor + shape.BorderLeft;
  const overlapsSection = section && intersects(current, section, gap);
  if (
    !overlapsSection &&
    desiredLeft >= left - 0.01 &&
    desiredLeft + current.right - current.left <= right + 0.01 &&
    current.left >= left - 0.01 &&
    current.right <= right + 0.01
  )
    return;

  const metrics = (text: string) => {
    const source = label.Label;
    const copy = new Label(text, source.textAlignment);
    Object.assign(copy, source, { text });
    const result = new GraphicalLabel(
      copy,
      source.fontHeight,
      source.textAlignment,
      osmd.EngravingRules,
    );
    result.setLabelPositionAndShapeBorders();
    return (
      result.PositionAndShape.BorderRight - result.PositionAndShape.BorderLeft
    );
  };
  const width = Math.max(inset, right - left - inset * 2);
  const lines: string[] = [];
  // Preserve explicit source line breaks. Only add a break when a whole line
  // exceeds the complete measure, not the symmetric space around its anchor.
  for (const paragraph of label.Label.text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (line && metrics(`${line} ${word}`) > width) {
        lines.push(line);
        line = word;
      } else line = line ? `${line} ${word}` : word;
    }
    lines.push(line);
  }
  label.Label.text = lines.join("\n");
  label.Label.textAlignment = TextAlignmentEnum.LeftBottom;
  label.setLabelPositionAndShapeBorders();
  const labelWidth = shape.BorderRight - shape.BorderLeft;
  shape.RelativePosition.x =
    Math.max(left + inset, Math.min(desiredLeft, right - inset - labelWidth)) -
    shape.BorderLeft;
  if (section && intersects(box(), section, gap)) {
    const beside = Math.max(box().left, section.right + gap);
    if (beside + labelWidth <= right - inset)
      shape.RelativePosition.x = beside - shape.BorderLeft;
  }
  // Keep text readable at its source font size. Sections reserve vertical
  // space rather than forcing narrow centered columns or deep indentation.
  const obstacles = [
    ...(section ? [section] : []),
    ...all
      .filter((other) => other !== item && other.measure === measure)
      .map((other) => {
        const s = other.label.PositionAndShape;
        return {
          left: s.RelativePosition.x + s.BorderLeft,
          right: s.RelativePosition.x + s.BorderRight,
          top: s.RelativePosition.y + s.BorderTop,
          bottom: s.RelativePosition.y + s.BorderBottom + other.descent,
        };
      }),
  ];
  for (let attempt = 0; attempt <= obstacles.length; attempt++) {
    const collision = obstacles.find((other) => intersects(box(), other, gap));
    if (!collision) break;
    shape.RelativePosition.y = Math.min(
      shape.RelativePosition.y,
      collision.top - gap - shape.BorderBottom - item.descent,
    );
  }
  const final = box();
  measure.ParentStaffLine.SkyBottomLineCalculator.updateSkyLineInRange(
    Math.max(left, final.left),
    Math.min(right, final.right),
    final.top - gap,
  );
  return true;
}
