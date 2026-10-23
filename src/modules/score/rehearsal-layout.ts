import type { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import type { SourceMeasure } from "opensheetmusicdisplay/build/dist/src/MusicalScore/VoiceData/SourceMeasure";
import type { GraphicalMeasure } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalMeasure";
import { SCORE_TEXT_FONT_FAMILY } from "./score-text-font";

type Alignment = "left" | "center" | "right";
export const REHEARSAL_TOP = 7;
export interface RehearsalBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
interface Position {
  x?: number;
  relativeX: number;
  alignment: Alignment;
}
interface Stave {
  getX(): number;
  getSpacingBetweenLines(): number;
  getModifiers(): Section[];
  checkContext(): {
    save(): void;
    restore(): void;
    setFont(family: string, size: number, weight: string): void;
    measureText(text: string): { width: number };
  };
}
interface Section {
  section?: string;
  x: number;
  font: { family: string; size: number; weight: string };
  draw(stave: Stave, modifierXShift: number): unknown;
}

function coordinate(element: Element, name: string): number | undefined {
  const value = element.getAttribute(name);
  if (value === null || !value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

/** OSMD 2.1.x reads rehearsal text but drops its horizontal XML attributes.
 * Keep them on this rendering instance; source XML and SVG nodes stay untouched.
 */
export function installRehearsalLayout(
  osmd: OpenSheetMusicDisplay,
  document: Document,
) {
  const positions = new Map<number, Position>();
  const part = document.querySelector("score-partwise > part");
  Array.from(part?.children ?? []).forEach((measure, index) => {
    const rehearsal = Array.from(
      measure.querySelectorAll("direction-type > rehearsal"),
    ).at(-1);
    if (
      !rehearsal ||
      !["default-x", "relative-x", "halign", "justify"].some((name) =>
        rehearsal.hasAttribute(name),
      )
    )
      return;
    const align =
      rehearsal.getAttribute("halign") ?? rehearsal.getAttribute("justify");
    positions.set(index, {
      x: coordinate(rehearsal, "default-x"),
      relativeX: coordinate(rehearsal, "relative-x") ?? 0,
      alignment: align === "center" || align === "right" ? align : "left",
    });
  });
  const calculator = osmd.GraphicSheet.GetCalculator as unknown as {
    calculateRehearsalMark(measure: SourceMeasure): void;
  };
  const calculate = calculator.calculateRehearsalMark.bind(calculator);
  calculator.calculateRehearsalMark = (measure) => {
    calculate(measure);
    const position = positions.get(measure.measureListIndex);
    for (const graphical of osmd.GraphicSheet.MeasureList[
      measure.measureListIndex
    ] ?? []) {
      const stave = (
        graphical as unknown as { getVFStave(): Stave | undefined }
      ).getVFStave();
      if (!stave) continue;
      // Native calculation creates one StaveSection on the visible staff.
      const section = stave
        .getModifiers()
        .slice()
        .reverse()
        .find((modifier) => typeof modifier.section === "string");
      if (!section) continue;
      section.font.family = SCORE_TEXT_FONT_FAMILY;
      // Legacy marks without positioning attributes also need stable metrics.
      // Keep their native position while using the same font for frame/text.
      if (!position) continue;
      const draw = section.draw.bind(section);
      section.draw = (currentStave, modifierXShift) => {
        const context = currentStave.checkContext();
        context.save();
        let width: number;
        try {
          const { family, size, weight } = section.font;
          context.setFont(family, size, weight);
          width = Math.max(context.measureText(section.section!).width + 6, 18);
        } finally {
          context.restore();
        }
        const scale = currentStave.getSpacingBetweenLines() / 10;
        // Native frames have a 2-unit stroke. The app's section anchor is
        // the enclosure's outer edge, including its padding and stroke.
        const nativeLeft = section.x + modifierXShift - 1;
        const anchor =
          (position.x === undefined
            ? nativeLeft
            : currentStave.getX() + position.x * scale) +
          position.relativeX * scale;
        const factor = { left: 0, center: 0.5, right: 1 }[position.alignment];
        const frameX = anchor - (width + 2) * factor + 1;
        // Native draw adds the clef/time-signature prefix to section.x.
        return draw(currentStave, frameX - section.x);
      };
    }
  };
  // Native sections exist after calculateRehearsalMarks and before SVG drawing.
  // Use their real font metrics and the same XML frame anchor as native draw.
  return (
    measure: GraphicalMeasure,
    textWidth: (text: string, font: Section["font"]) => number,
  ): RehearsalBounds | undefined => {
    const position = positions.get(
      measure.parentSourceMeasure.measureListIndex,
    );
    if (!position || position.x === undefined) return;
    const stave = (
      measure as unknown as { getVFStave(): Stave | undefined }
    ).getVFStave();
    const section = stave?.getModifiers().find((item) => item.section);
    if (!stave || !section?.section) return;
    const scale = stave.getSpacingBetweenLines() / 10;
    const width =
      Math.max(textWidth(section.section, section.font) + 6, 18) + 2;
    const anchor = stave.getX() + (position.x + position.relativeX) * scale;
    const factor = { left: 0, center: 0.5, right: 1 }[position.alignment];
    const staffX =
      measure.ParentStaffLine.PositionAndShape.AbsolutePosition.x * 10;
    const left = (anchor - width * factor - staffX) / 10;
    return {
      left,
      right: left + width / 10,
      top: -REHEARSAL_TOP - 0.1,
      // VexFlow's native frame is 1.6 * point-size SVG units, plus its stroke.
      bottom: -REHEARSAL_TOP + (section.font.size * 1.6 + 1) / 10,
    };
  };
}
