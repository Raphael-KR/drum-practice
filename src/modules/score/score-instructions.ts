import type { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import type { VexFlowMeasure } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/VexFlow/VexFlowMeasure";

/** Hide instructions before native layout so their glyphs reserve no space. */
export function configureScoreInstructions(
  osmd: OpenSheetMusicDisplay,
  document: Document,
  playback: boolean,
) {
  const signs = Array.from(
    document.querySelectorAll("part > measure > attributes > clef > sign"),
  );
  const percussionOnly =
    signs.length > 0 &&
    signs.every((sign) => sign.textContent?.trim() === "percussion");
  const rules = osmd.EngravingRules;
  rules.RenderClefsAtBeginningOfStaffline = !percussionOnly;
  rules.RenderTimeSignatures = !playback;
  // timePosition already owns the gap from the last instruction to the note.
  rules.MeasureLeftMargin = 0;
  rules.RhythmRightMargin = 0;
  if (!percussionOnly) return;
  const calculator = osmd.GraphicSheet.GetCalculator as unknown as {
    calculateMeasureXLayout(row: VexFlowMeasure[]): number;
  };
  const calculate = calculator.calculateMeasureXLayout.bind(calculator);
  calculator.calculateMeasureXLayout = (row) => {
    for (const measure of row) {
      // The native beginning-clef option does not cover end-of-measure clefs.
      if (measure) measure.addClefAtEnd = () => {};
    }
    return calculate(row);
  };
}

/** Read formatted native instruction extents, not padding of absent/hidden glyphs. */
export function visibleBeginInstructions(measure: VexFlowMeasure) {
  const stave = measure.getVFStave();
  // VexFlow's first modifier is its beginning barline; retain its native enum.
  const begin = stave.getModifiers()[0].getPosition();
  let right = stave.getX();
  for (const modifier of stave.getModifiers()) {
    // OSMD bundles getX(), which its older VexFlow declaration omits.
    const native = modifier as typeof modifier & {
      getX(): number;
      hidden?: boolean;
    };
    if (
      modifier.getPosition() !== begin ||
      modifier.getCategory() === "barlines" ||
      modifier.getWidth() <= 0 ||
      native.hidden
    )
      continue;
    right = Math.max(right, native.getX() + modifier.getWidth());
  }
  return (right - stave.getX()) / 10;
}
