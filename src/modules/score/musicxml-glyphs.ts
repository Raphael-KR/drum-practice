import type { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
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
  omitPercussionClefs(host, renderDocument);
  alignRehearsalBoxes(osmd);
  if (timeline)
    host.querySelectorAll(".vf-timesignature").forEach((e) => e.remove());
  const svgs = Array.from(host.querySelectorAll("svg"));
  if (!svgs.length) throw Error(i18nText("musicxml.message413"));
  applyHollowNoteheads(osmd);
  centerWholeMeasureRests(osmd, timeline);
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

function omitPercussionClefs(host: HTMLElement, renderDocument: Document) {
  // This drum practice viewer omits percussion clef glyphs, including system
  // repeats. Keep source XML and all barline/repeat glyphs unchanged.
  const clefSigns = Array.from(
    renderDocument.querySelectorAll(
      "part > measure > attributes > clef > sign",
    ),
  );
  if (
    clefSigns.length &&
    clefSigns.every((sign) => sign.textContent?.trim() === "percussion")
  ) {
    host.querySelectorAll(".vf-clef").forEach((clef) => clef.remove());
  }
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

function centerWholeMeasureRests(
  osmd: OpenSheetMusicDisplay,
  timeline?: RibbonSpacing,
) {
  // Explicit rest display pitches bypass OSMD's automatic whole-rest centering.
  // Move only full-bar silence glyphs; keep staff entries and playback anchors intact.
  for (const row of osmd.GraphicSheet.MeasureList)
    for (const g of row) {
      if (!g?.hasOnlyRests || g.staffEntries.length !== 1) continue;
      if (
        timeline &&
        !g.staffEntries.every((e) =>
          e.graphicalVoiceEntries.every((v) =>
            v.notes.every((n) => n.sourceNote.isRest()),
          ),
        )
      )
        continue;
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
      for (const voice of g.staffEntries[0].graphicalVoiceEntries)
        for (const note of voice.notes) {
          if (
            !note.sourceNote.isRest() ||
            (!timeline && !note.sourceNote.Pitch) ||
            !(
              note.sourceNote.IsWholeMeasureRest ||
              note.sourceNote.Length.RealValue ===
                note.sourceNote.SourceMeasure.ActiveTimeSignature.RealValue
            )
          )
            continue;
          const glyph = (
            note as unknown as { getSVGGElement(): SVGGElement }
          ).getSVGGElement();
          if (!glyph) continue;
          const bounds = glyph.getBBox();
          const nativeLeft = timeline
            ? (g as unknown as { getVFStave(): { getX(): number } })
                .getVFStave()
                .getX()
            : left;
          // Full-bar rests represent the whole measure, not its first grid tick.
          // VexFlow's rest offset can put them left of the cropped grid region.
          const dx = timeline
            ? restCenterShift(
                nativeLeft,
                nativeLeft +
                  (timeline.uniformQuarters && timeline.rowWidth
                    ? timeline.rowWidth
                    : g.parentSourceMeasure.Duration.RealValue *
                      4 *
                      timeline.quarter),
                bounds.x,
                bounds.width,
              )
            : restCenterShift(left, right, bounds.x, bounds.width);
          glyph.setAttribute(
            "transform",
            `translate(${dx} 0) ${glyph.getAttribute("transform") || ""}`,
          );
          glyph.setAttribute("data-full-measure-rest", "centered");
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
