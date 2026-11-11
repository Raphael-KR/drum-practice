import {
  GraphicalLabel,
  GraphicalLayers,
  Label,
  TextAlignmentEnum,
  type OpenSheetMusicDisplay,
} from "opensheetmusicdisplay";
import type { StaffLine } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/StaffLine";
import type { GraphicalStaffEntry } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalStaffEntry";
import type { Song } from "../../model/model";
import { parseMusicXML } from "./musicxml-parse";
import { readCanonicalLyrics } from "./canonical-lyric-read";
import { canonicalManifest } from "./canonical-metadata";
import { writeLyricVoices } from "./canonical-lyric-voice";
import { SCORE_TEXT_FONT_FAMILY } from "./score-text-font";

/** Shared SVG lyric colour; embedded images cannot inherit the host CSS accent. */
export const SCORE_LYRIC_COLOR = "#3f74d4";

/** Read once before engraving passes; legacy voices are upgraded only in this copy. */
export function prepareScoreLyrics(
  source: string,
  partId: string,
  song?: Pick<Song, "measures" | "measureLyrics">,
) {
  const parsed = parseMusicXML(source, partId, true);
  const data = canonicalManifest(parsed.document);
  const model = song ?? data;
  const texts = new Map(
    (model?.measureLyrics ?? []).map((lyric) => [
      model!.measures.findIndex((measure) => measure.id === lyric.measureId),
      lyric.text,
    ]),
  );
  if (data?.version !== 1) return { xml: source, texts };
  const part = Array.from(
    parsed.document.querySelectorAll("score-partwise > part"),
  ).find((part) => part.id === partId)!;
  // v1's independent part superseded any imported drum-note lyrics.
  const lyrics = readCanonicalLyrics(parsed.document, data);
  part.querySelectorAll("note > lyric").forEach((lyric) => lyric.remove());
  writeLyricVoices(part, { measures: data.measures, lyrics });
  return { xml: new XMLSerializer().serializeToString(parsed.document), texts };
}

interface LyricsCalculator {
  calculateSingleStaffLineLyricsPosition(
    staff: StaffLine,
    verses: string[],
  ): GraphicalStaffEntry[];
}

/** Lay out native syllables and optional measure text before SVG drawing. */
export function installScoreLyrics(
  osmd: OpenSheetMusicDisplay,
  textByIndex: Map<number, string>,
  timeline = false,
) {
  const measureLabels = new Map<StaffLine, GraphicalLabel[]>();
  if (!textByIndex.size && !timeline) return measureLabels;
  const calculator = osmd.GraphicSheet
    .GetCalculator as unknown as LyricsCalculator;
  const calculate =
    calculator.calculateSingleStaffLineLyricsPosition.bind(calculator);
  calculator.calculateSingleStaffLineLyricsPosition = (staff, verses) => {
    const inkBottom = staff.SkyBottomLineCalculator.getBottomLineMax();
    const entries = calculate(staff, verses);
    if (staff.ParentStaff.idInMusicSheet !== 0) return entries;
    if (timeline) {
      // Time-spaced lyrics can fall between narrow stems in OSMD's X-range
      // sampling. Reserve the measure's ink floor, retaining native verse gaps.
      const labels = entries.flatMap((entry) =>
        entry.LyricsEntries.map((lyric) => lyric.GraphicalLabel),
      );
      const top = Math.min(
        ...labels.map((label) => {
          const box = label.PositionAndShape;
          return box.RelativePosition.y + box.BorderTop;
        }),
      );
      const shift = Math.max(
        0,
        inkBottom + osmd.EngravingRules.LyricsYMarginToBottomLine - top,
      );
      for (const label of labels) {
        const box = label.PositionAndShape;
        box.RelativePosition.y += shift;
        const x = box.Parent.RelativePosition.x + box.RelativePosition.x;
        staff.SkyBottomLineCalculator.updateBottomLineWithLabel(
          x + box.BorderMarginLeft,
          x + box.BorderMarginRight,
          box.RelativePosition.y + box.BorderMarginBottom,
        );
      }
    }
    measureLabels.set(staff, measureTextLabels(osmd, staff, textByIndex));
    return entries;
  };
  if (!textByIndex.size) return measureLabels;
  // render() creates a fresh backend after layout. Attach labels to that drawer
  // so its normal per-page coordinate transform and SVG text writer are reused.
  const renderer = osmd as unknown as { createOrRefreshRenderBackend(): void };
  const createBackend = renderer.createOrRefreshRenderBackend.bind(renderer);
  renderer.createOrRefreshRenderBackend = () => {
    createBackend();
    const drawer = osmd.Drawer;
    const expressions = drawer as unknown as {
      drawExpressions(staff: StaffLine): void;
    };
    const drawExpressions = expressions.drawExpressions.bind(drawer);
    expressions.drawExpressions = (staff) => {
      drawExpressions(staff);
      for (const label of measureLabels.get(staff) ?? [])
        label.SVGNode = drawer.drawLabel(label, GraphicalLayers.Notes);
    };
  };
  return measureLabels;
}

/** Untimed measure text is a native label, not an invented note or sung syllable. */
function measureTextLabels(
  osmd: OpenSheetMusicDisplay,
  staff: StaffLine,
  texts: Map<number, string>,
) {
  const rules = osmd.EngravingRules;
  const labels = staff.Measures.flatMap((measure) => {
    // End-of-system cautionary symbols have no source measure or measure text.
    if (measure.IsExtraGraphicalMeasure) return [];
    const text = texts.get(measure.parentSourceMeasure.measureListIndex);
    if (!text) return [];
    const label = new GraphicalLabel(
      new Label(text),
      rules.LyricsHeight,
      TextAlignmentEnum.CenterBottom,
      rules,
      staff.PositionAndShape,
    );
    label.Label.fontFamily = SCORE_TEXT_FONT_FAMILY;
    label.Label.colorDefault = rules.DefaultColorLyrics;
    label.SVGClass = "osmd-measure-lyrics";
    const width = Math.max(1, measure.PositionAndShape.Size.width - 1);
    wrapLabel(label, width);
    label.PositionAndShape.RelativePosition.x =
      measure.PositionAndShape.RelativePosition.x +
      measure.PositionAndShape.Size.width / 2;
    return [label];
  });
  if (!labels.length) return [];
  const bottom = staff.SkyBottomLineCalculator.getBottomLineMax();
  const height = Math.max(
    ...labels.map(
      (label) =>
        label.PositionAndShape.BorderBottom - label.PositionAndShape.BorderTop,
    ),
  );
  for (const label of labels) {
    label.PositionAndShape.RelativePosition.y =
      bottom + height + rules.LyricsYMarginToBottomLine;
    const box = label.PositionAndShape;
    staff.SkyBottomLineCalculator.updateBottomLineWithLabel(
      box.RelativePosition.x + box.BorderMarginLeft,
      box.RelativePosition.x + box.BorderMarginRight,
      box.RelativePosition.y + box.BorderMarginBottom,
    );
  }
  return labels;
}

function wrapLabel(label: GraphicalLabel, width: number) {
  const lines: string[] = [];
  for (const paragraph of label.Label.text.split("\n")) {
    let line = "";
    for (const character of paragraph) {
      label.Label.text = line + character;
      label.setLabelPositionAndShapeBorders();
      const box = label.PositionAndShape;
      if (line && box.BorderRight - box.BorderLeft > width) {
        lines.push(line);
        line = character;
      } else line += character;
    }
    lines.push(line);
  }
  label.Label.text = lines.join("\n");
  label.setLabelPositionAndShapeBorders();
}
