import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { installDrumBeams } from "./drum-beams";
import { applyDrumDecorations, prepareDrumDecorations } from "./drum-notation";
import { installPlaybackWedges } from "./playback-wedges";
import { installPlaybackWords } from "./playback-words";
import { installRehearsalLayout } from "./rehearsal-layout";
import { installRibbonEngraving, type RibbonSpacing } from "./ribbon-engraving";
import { SCORE_TEXT_FONT_FAMILY } from "./score-text-font";
import { installTechnicalPositions } from "./technical-position";
import { installWedgeEndpoints } from "./wedge-endpoints";
import { installWordsPositions, prepareWordsPositions } from "./words-position";

import type { XMLScore } from "./musicxml-parse";

/** Configure and render one disposable engraving copy in the existing hook order. */
export async function renderMusicXMLEngine(
  host: HTMLElement,
  parsed: XMLScore,
  timeline?: RibbonSpacing,
) {
  const osmd = new OpenSheetMusicDisplay(host, {
    backend: "svg",
    autoResize: false,
    pageFormat: "A4_P",
    drawTitle: true,
    drawComposer: false,
    drawLyricist: false,
    drawMetronomeMarks: false,
    drawMeasureNumbers: false,
    drawLyrics: false,
    drawPartNames: false,
    drawPartAbbreviations: false,
  });
  // XML owns system boundaries; do not impose a fixed measure count.
  osmd.EngravingRules.DefaultFontFamily = SCORE_TEXT_FONT_FAMILY;
  osmd.EngravingRules.VexFlowTextFontFamily = SCORE_TEXT_FONT_FAMILY;
  osmd.EngravingRules.RenderXMeasuresPerLineAkaSystem = 0;
  osmd.EngravingRules.NewSystemAtXMLNewSystemAttribute = true;
  osmd.EngravingRules.NewPageAtXMLNewPageAttribute = true;
  // Keep rehearsal boxes above cymbal stems at their seven-space anchor.
  osmd.EngravingRules.RehearsalMarkYOffset = 25;
  osmd.EngravingRules.StemWidth = 0.1;
  osmd.EngravingRules.RenderMultipleRestMeasures = false;
  osmd.EngravingRules.AutoGenerateMultipleRestMeasuresFromRestMeasures = false;
  osmd.EngravingRules.TupletNumberLimitConsecutiveRepetitions = false;
  const renderDocument = parsed.document.cloneNode(true) as Document;
  // Suppress textual BPM labels only in the engraving copy; keep tempo data.
  for (const words of renderDocument.querySelectorAll(
    "direction-type > words",
  )) {
    if (/^\s*BPM\s*[:=]?\s*\d+(?:\.\d+)?\s*$/i.test(words.textContent || ""))
      words.remove();
  }
  if (timeline) {
    renderDocument.querySelectorAll("print").forEach((e) => e.remove());
    osmd.EngravingRules.RenderXMeasuresPerLineAkaSystem = 1;
    osmd.EngravingRules.NewSystemAtXMLNewSystemAttribute = false;
    osmd.EngravingRules.NewPageAtXMLNewPageAttribute = false;
    osmd.EngravingRules.RenderTitle = false;
    host.style.width = `${Math.max(1500, ...parsed.measures.map((m) => ((m.beats * 4) / m.denominator) * timeline.quarter + 200))}px`;
  }

  const decorations = prepareDrumDecorations(renderDocument);
  const wordsPositions = prepareWordsPositions(renderDocument);
  await osmd.load(renderDocument);
  // Translate canonical XML tenths into the engine title-spacing units.
  // Introduced for OSMD 2.1.2; this adapter remains part of the rendering
  // contract and must not supply missing values or rewrite the source XML.
  const firstMeasure = renderDocument.querySelector("part > measure");
  const topDistance =
    firstMeasure?.querySelector(
      "print > system-layout > top-system-distance",
    ) ??
    renderDocument.querySelector(
      "defaults > system-layout > top-system-distance",
    );
  const tenths = topDistance ? Number(topDistance.textContent) : NaN;
  if (
    Number.isFinite(tenths) &&
    tenths >= 0 &&
    osmd.EngravingRules.RenderTitle
  ) {
    const rules = osmd.EngravingRules;
    rules.TitleBottomDistance = Math.max(
      0,
      tenths / 10 - rules.TitleTopDistance - rules.SheetTitleHeight,
    );
  }
  installDrumBeams(osmd);
  installWedgeEndpoints(osmd);
  const rehearsalBounds = installRehearsalLayout(osmd, renderDocument);
  installTechnicalPositions(osmd, decorations);
  const positionedWords = installWordsPositions(osmd, wordsPositions);
  if (timeline) {
    installRibbonEngraving(osmd, timeline);
    installPlaybackWedges(osmd, timeline);
  }
  installPlaybackWords(osmd, rehearsalBounds, positionedWords, !!timeline);
  osmd.render();
  applyDrumDecorations(host, osmd, decorations);

  return { osmd, renderDocument, positionedWords };
}
