import { TIME_SPACING, timeMeasureWidth, timePosition } from "./time-spacing";
import { scoreMeasureSpacing } from "./full-score-spacing";
import { NoteType, type OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import type { VexFlowMeasure } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/VexFlow/VexFlowMeasure";
import { t as i18nText } from "../../shared/i18n/i18n";
import {
  annotateNoteHighlights,
  NOTE_HIGHLIGHT_VERSION,
} from "./note-highlight";
import { REHEARSAL_TOP } from "./rehearsal-layout";
import { type RibbonSpacing } from "./ribbon-engraving";
import { REST_LAYOUT_VERSION, restCenterShift } from "./whole-rest-layout";

import type { XMLScore } from "./musicxml-parse";

/** Apply shared display rules after native rendering, before measuring or serializing SVG. */
export function finishMusicXMLGlyphs(
  host: HTMLElement,
  osmd: OpenSheetMusicDisplay,
  renderDocument: Document,
  parsed: XMLScore,
  timeline?: RibbonSpacing,
) {
  alignRehearsalBoxes(osmd);
  const svgs = Array.from(host.querySelectorAll("svg"));
  if (!svgs.length) throw Error(i18nText("musicxml.message413"));
  applyHollowNoteheads(osmd);
  centerRestGlyphs(osmd, timeline);
  annotateNoteHighlights(
    osmd,
    parsed.measures.map((m) => m.denominator),
  );
  for (const svg of svgs) {
    svg.setAttribute("data-rest-layout", REST_LAYOUT_VERSION);
    svg.setAttribute("data-note-highlight", NOTE_HIGHLIGHT_VERSION);
  }
  identifyScoreHeadings(svgs, renderDocument);

  return svgs;
}

function alignRehearsalBoxes(osmd: OpenSheetMusicDisplay) {
  // VexFlow places rehearsal boxes differently at system starts. Normalize
  // their top edge to the shared seven-space section anchor.
  for (const row of osmd.GraphicSheet.MeasureList)
    for (const g of row) {
      const measure = g?.getSVGGElement();
      if (!measure) continue;
      const stave = (g as VexFlowMeasure).getVFStave();
      // OSMD 2.3 encloses each section in its own native SVG group.
      for (const section of measure.querySelectorAll(".vf-stavesection")) {
        const frame = section.querySelector("rect");
        const text = section.querySelector("text");
        if (!frame || !text) continue;
        const dy =
          stave.getYForLine(0) -
          REHEARSAL_TOP * stave.getSpacingBetweenLines() -
          Number(frame.getAttribute("y"));
        for (const element of [frame, text]) {
          element.setAttribute(
            "y",
            String(Number(element.getAttribute("y")) + dy),
          );
          element.setAttribute("data-section-top", "safe");
        }
      }
    }
}

function applyHollowNoteheads(osmd: OpenSheetMusicDisplay) {
  // Compatibility for short-note filled="no" omissions first observed in OSMD 2.1.2.
  // Keep this shared glyph rule until the engine output passes the existing notation checks.
  // Select the specific chord member so neighboring snare/tom heads stay filled.
  for (const row of osmd.GraphicSheet.MeasureList)
    for (const g of row) {
      for (const entry of g.staffEntries)
        for (const voice of entry.graphicalVoiceEntries)
          for (const note of voice.notes) {
            const head = note.sourceNote.Notehead;
            if (
              note.sourceNote.PrintObject === false ||
              !head ||
              head.Shape !== 2 ||
              head.Filled !== false ||
              note.sourceNote.Length.RealValue >= 0.5 ||
              note.sourceNote.isRest()
            )
              continue;
            const vf = note as unknown as {
              vfnote: [unknown, number];
              getNoteheadSVGs(): HTMLElement[];
            };
            const glyph = vf.getNoteheadSVGs()[vf.vfnote[1]];
            if (!glyph) throw Error(i18nText("musicxml.message414"));
            glyph.setAttribute("data-hollow-notehead", "true");
            for (const path of glyph.querySelectorAll("path")) {
              path.setAttribute("fill", "white");
              path.setAttribute(
                "stroke",
                note.sourceNote.NoteheadColor || "#000000",
              );
              path.setAttribute("stroke-width", "1.1");
              (path as SVGElement).style.fill = "white";
              (path as SVGElement).style.stroke =
                note.sourceNote.NoteheadColor || "#000000";
            }
          }
    }
}

function centerRestGlyphs(
  osmd: OpenSheetMusicDisplay,
  timeline?: RibbonSpacing,
) {
  // Move rest glyphs independently of their rhythmic anchors and lyric positions.
  for (const row of osmd.GraphicSheet.MeasureList)
    for (const g of row) {
      if (!g) continue;
      const notes = g.staffEntries.flatMap((entry) =>
        entry.graphicalVoiceEntries.flatMap((voice) =>
          voice.notes
            .filter((note) => note.sourceNote.PrintObject !== false)
            .map((note) => ({
              note,
              quarter: entry.relInMeasureTimestamp.RealValue * 4,
            })),
        ),
      );
      // Hidden lyric rhythm must not turn an otherwise silent drum bar into notes.
      const fullBarSilence =
        notes.length > 0 &&
        notes.every(
          ({ note }) =>
            note.sourceNote.isRest() &&
            (note.sourceNote.IsWholeMeasureRest ||
              note.sourceNote.Length.RealValue ===
                g.parentSourceMeasure.Duration.RealValue),
        );
      const page = g.ParentMusicSystem.Parent;
      const box = g.PositionAndShape;
      const left =
        (box.AbsolutePosition.x -
          page.PositionAndShape.AbsolutePosition.x +
          box.BorderLeft) *
        10;
      const right =
        (box.AbsolutePosition.x -
          page.PositionAndShape.AbsolutePosition.x +
          box.BorderRight) *
        10;
      for (const { note, quarter } of notes) {
        const halfRest =
          note.sourceNote.isRest() &&
          note.sourceNote.NoteTypeXml === NoteType.HALF &&
          note.sourceNote.DotsXml === 0;
        if (!fullBarSilence && !halfRest) continue;
        const glyph = (
          note as unknown as { getSVGGElement(): SVGGElement }
        ).getSVGGElement();
        if (!glyph) continue;
        const bounds = glyph.getBBox();
        const staveX = (g as VexFlowMeasure).getVFStave().getX();
        let start = timeline ? staveX : left;
        let end = timeline
          ? start +
            timeMeasureWidth(
              g.parentSourceMeasure.Duration.RealValue * 4,
              timeline,
            )
          : right;
        if (!fullBarSilence) {
          // Center a half rest between its first and second quarter starts:
          // a rest starting at beat 1 is drawn at beat 1.5, as requested.
          const spacing = scoreMeasureSpacing(g, timeline ?? TIME_SPACING);
          const prefix = timeline ? 0 : g.beginInstructionsWidth * 10;
          start = staveX + prefix + timePosition(quarter, spacing);
          end = start + spacing.quarter;
        }
        const dx = restCenterShift(start, end, bounds.x, bounds.width);
        glyph.setAttribute(
          "transform",
          `translate(${dx} 0) ${glyph.getAttribute("transform") || ""}`,
        );
        glyph.setAttribute(
          fullBarSilence ? "data-full-measure-rest" : "data-half-rest",
          "centered",
        );
      }
    }
}

function identifyScoreHeadings(
  svgs: SVGSVGElement[],
  renderDocument: Document,
) {
  // Retain titles in whole-score SVG, but identify them for practice-only removal.
  const headings = new Set(
    Array.from(
      renderDocument.querySelectorAll(
        "work-title, movement-title, credit-words",
      ),
    )
      .map((e) => e.textContent?.trim())
      .filter(Boolean),
  );
  for (const svg of svgs)
    for (const text of svg.querySelectorAll("text")) {
      if (
        headings.has(text.textContent?.trim()) &&
        !text.closest(".vf-measure")
      )
        text.setAttribute("data-score-heading", "true");
    }
}
