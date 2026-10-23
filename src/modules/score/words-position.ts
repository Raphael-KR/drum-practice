import type { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import type { MultiExpression } from "opensheetmusicdisplay/build/dist/src/MusicalScore/VoiceData/Expressions/MultiExpression";
import type { StaffLine } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/StaffLine";
import type { GraphicalLabel } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalLabel";
import type { PointF2D } from "opensheetmusicdisplay/build/dist/src/Common/DataObjects/PointF2D";
import type { FontStyles } from "opensheetmusicdisplay/build/dist/src/Common/Enums/FontStyles";
import type { TextAlignmentEnum } from "opensheetmusicdisplay/build/dist/src/Common/Enums/TextAlignment";

interface Position {
  y?: number;
  relativeY: number;
}
interface PositionedWords extends Position {
  element: Element;
  color: string | null;
  measure: string | null;
}

function position(element: Element): Position | undefined {
  const coordinates = ["default-y", "relative-y"].map((name) => {
    const value = element.getAttribute(name);
    const number = value?.trim() ? Number(value) : NaN;
    return Number.isFinite(number) ? number : undefined;
  });
  if (coordinates.every((value) => value === undefined)) return;
  const [y, relativeY = 0] = coordinates;
  return { y, relativeY };
}

function samePosition(a: Position | undefined, b: Position | undefined) {
  return a?.y === b?.y && a?.relativeY === b?.relativeY;
}

/** Bind positioned XML words to the exact native expression, even for repeated text. */
export function prepareWordsPositions(document: Document) {
  const positions = new Map<string, PositionedWords>();
  const colors = new Set(
    Array.from(document.querySelectorAll("[color]"), (e) =>
      e.getAttribute("color")!.toLowerCase(),
    ),
  );
  let serial = 0x720000;
  for (const direction of document.querySelectorAll(
    "direction > direction-type",
  )) {
    const words = Array.from(direction.children).filter(
      (e) => e.localName === "words",
    );
    const values = words.map(position);
    if (!values.some(Boolean)) continue;
    const first = values[0];
    const measure =
      direction.closest("measure")?.getAttribute("number") ?? null;
    if (Array.from(direction.children).some((e) => e.localName === "symbol")) {
      console.warn(
        `Words positions retain their combined native layout: ${JSON.stringify({ measure, expected: "words-only native label", actual: "words and symbol children" })}`,
      );
      continue;
    }
    // OSMD combines these children into one native label. Do not move an
    // unpositioned sibling or silently discard a different requested height.
    if (!first || values.some((value) => !samePosition(first, value))) {
      console.warn(
        `Words positions cannot share one native label: ${JSON.stringify({ measure, expected: "equal Y on words children", actual: values })}`,
      );
      continue;
    }
    const element = words[0];
    let token: string;
    do token = "#" + (serial++).toString(16);
    while (colors.has(token));
    colors.add(token);
    positions.set(token, {
      ...first,
      element,
      color: element.getAttribute("color"),
      measure,
    });
    element.setAttribute("color", token);
  }
  return positions;
}

interface Calculator {
  calculateMoodAndUnknownExpression(
    multi: MultiExpression,
    measureIndex: number,
    staffIndex: number,
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

/** Apply XML Y before native label placement and its skyline update, never to SVG. */
export function installWordsPositions(
  osmd: OpenSheetMusicDisplay,
  positions: ReadonlyMap<string, PositionedWords>,
) {
  const labels = new WeakSet<GraphicalLabel>();
  if (!positions.size) return labels;
  const bound = new WeakMap<MultiExpression, Position>();
  const found = new Set<string>();
  const otherKinds = new Set<string>();
  for (const source of osmd.Sheet.SourceMeasures) {
    // Recognized tempo words use a different native renderer. Restore their
    // original colors too, even while their Y is outside this label hook.
    for (const tempo of source.TempoExpressions)
      for (const { Expression: expression } of tempo.EntriesList) {
        const token = expression.ColorXML?.toLowerCase();
        const value = token && positions.get(token);
        if (!value) continue;
        otherKinds.add(token);
        if (value.color === null)
          Reflect.deleteProperty(expression, "ColorXML");
        else expression.ColorXML = value.color;
      }
    for (const multi of source.StaffLinkedExpressions.flat()) {
      const values = multi.EntriesList.map(({ expression }) => {
        const token = expression.ColorXML?.toLowerCase();
        const value = token && positions.get(token);
        if (!value) return;
        found.add(token);
        if (value.color === null)
          Reflect.deleteProperty(expression, "ColorXML");
        else expression.ColorXML = value.color;
        return value;
      });
      const first = values.find((value) => value !== undefined);
      if (!first) continue;
      if (!multi.UnknownList.length && !multi.MoodList.length) {
        console.warn(
          `Positioned words retain their native layout: ${JSON.stringify({ measure: first.measure, expected: "mood/unknown expression", actual: "non-text staff expression" })}`,
        );
        continue;
      }
      if (values.some((value) => !samePosition(first, value))) {
        console.warn(
          `Words expressions cannot share one native label: ${JSON.stringify({ measure: first.measure, expected: "equal Y on combined expressions", actual: values.map((value) => value && { y: value.y, relativeY: value.relativeY }) })}`,
        );
        continue;
      }
      bound.set(multi, first);
    }
  }
  for (const [token, value] of positions) {
    if (value.color === null) value.element.removeAttribute("color");
    else value.element.setAttribute("color", value.color);
    if (!found.has(token))
      console.warn(
        `Positioned words retain their native layout: ${JSON.stringify({ measure: value.measure, y: value.y, relativeY: value.relativeY, expected: "mood/unknown expression", actual: otherKinds.has(token) ? "tempo expression" : "not found" })}`,
      );
  }
  const calculator = osmd.GraphicSheet.GetCalculator as unknown as Calculator;
  const calculate = calculator.calculateMoodAndUnknownExpression;
  calculator.calculateMoodAndUnknownExpression = (
    multi,
    measure,
    staffIndex,
  ) => {
    const value = bound.get(multi);
    if (!value) return calculate.call(calculator, multi, measure, staffIndex);
    const nativeLabel = calculator.calculateLabel;
    const unknown = multi.UnknownList[0];
    const defaultY = unknown?.defaultYXml;
    // Prevent OSMD's optional integer-only, inside-staff default-y shortcut
    // from overwriting the standard position after native label calculation.
    if (unknown) unknown.defaultYXml = NaN;
    calculator.calculateLabel = (...args) => {
      const [staff, , , , placement, , , spacing = 0] = args;
      const skyline = staff.SkyBottomLineCalculator;
      const sky = skyline.getSkyLineMinForLabel;
      const bottom = skyline.getBottomLineMaxForLabel;
      const y = (native: number) =>
        value.y === undefined
          ? native - value.relativeY / 10
          : staff.TopLineOffset -
            (value.y + value.relativeY) / 10 +
            (placement === 1 ? -spacing : spacing);
      skyline.getSkyLineMinForLabel = (...range) =>
        y(sky.apply(skyline, range));
      skyline.getBottomLineMaxForLabel = (...range) =>
        y(bottom.apply(skyline, range));
      try {
        const label = nativeLabel.apply(calculator, args);
        labels.add(label);
        return label;
      } finally {
        skyline.getSkyLineMinForLabel = sky;
        skyline.getBottomLineMaxForLabel = bottom;
      }
    };
    try {
      calculate.call(calculator, multi, measure, staffIndex);
    } finally {
      calculator.calculateLabel = nativeLabel;
      if (unknown) unknown.defaultYXml = defaultY;
    }
  };
  return labels;
}
