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
import type { XMLScore } from "./musicxml-parse";
import { canonicalManifest } from "./canonical-metadata";
import { writeLyricVoices } from "./canonical-lyric-voice";
import { SCORE_TEXT_FONT_FAMILY, scoreTextHeight } from "./score-text-font";

/** Upgrade legacy storage in a read-only copy with the same voice writer used by saving. */
export function prepareFullScoreLyrics(parsed: XMLScore, song: Song) {
  // Selecting the drum part preserves the document-level canonical manifest.
  const data = canonicalManifest(parsed.document);
  if (data?.version !== 1) return;
  const part = parsed.document.querySelector("score-partwise > part")!;
  // v1's separate lyric part superseded the imported drum-note lyrics.
  part.querySelectorAll("note > lyric").forEach((lyric) => lyric.remove());
  writeLyricVoices(part, song);
}

interface LyricsCalculator {
  calculateSingleStaffLineLyricsPosition(
    staff: StaffLine,
    verses: string[],
  ): GraphicalStaffEntry[];
}

/** Add untimed measure text below OSMD's native syllable lyrics. */
export function installFullScoreMeasureLyrics(
  osmd: OpenSheetMusicDisplay,
  song: Song,
) {
  if (!song.measureLyrics?.length) return;
  const textByIndex = new Map(
    song.measureLyrics.map((lyric) => [
      song.measures.findIndex((m) => m.id === lyric.measureId),
      lyric.text,
    ]),
  );
  const calculator = osmd.GraphicSheet
    .GetCalculator as unknown as LyricsCalculator;
  const measureLabels = new Map<StaffLine, GraphicalLabel[]>();
  const calculate =
    calculator.calculateSingleStaffLineLyricsPosition.bind(calculator);
  calculator.calculateSingleStaffLineLyricsPosition = (staff, verses) => {
    const entries = calculate(staff, verses);
    if (staff.ParentStaff.idInMusicSheet !== 0) return entries;
    measureLabels.set(staff, measureTextLabels(osmd, staff, textByIndex));
    return entries;
  };
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
      scoreTextHeight(rules.RehearsalMarkFontSize),
      TextAlignmentEnum.CenterBottom,
      rules,
      staff.PositionAndShape,
    );
    label.Label.fontFamily = SCORE_TEXT_FONT_FAMILY;
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
