import type { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import type { VexFlowGraphicalNote } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/VexFlow/VexFlowGraphicalNote";

export interface TechnicalPosition {
  type: "ah" | "a+";
  x?: number;
  y?: number;
  relativeX: number;
  relativeY: number;
}

/** Read only the native technical glyphs whose XML position is explicit. */
export function technicalPositions(note: Element): TechnicalPosition[] {
  return Array.from(
    note.querySelectorAll(
      "notations > technical > harmonic, notations > technical > stopped",
    ),
  ).flatMap((element) => {
    const values = ["default-x", "default-y", "relative-x", "relative-y"].map(
      (name) => {
        const value = element.getAttribute(name);
        const number = value?.trim() ? Number(value) : NaN;
        return Number.isFinite(number) ? number : undefined;
      },
    );
    if (values.every((value) => value === undefined)) return [];
    const [x, y, relativeX = 0, relativeY = 0] = values;
    return [
      {
        type: element.localName === "harmonic" ? "ah" : "a+",
        x,
        y,
        relativeX,
        relativeY,
      },
    ];
  });
}

interface NativeArticulation {
  type: string;
  position: number;
  glyph: { setOrigin(x: number, y: number): void };
  setIndex(index: number): void;
  getCategory(): string;
  getXShift(): number;
  getRenderY(): number;
}
interface NativeNote {
  note_heads: { setX(x: number): void; getAbsoluteX(): number }[];
  getNoteHeadBeginX(): number;
  getModifierStartXY(position: number, index: number): { x: number };
  getStave(): {
    getSpacingBetweenLines(): number;
    getYForLine(line: number): number;
  };
  getModifiers(): NativeArticulation[];
}

/** OSMD 2.2.x reads harmonic/stopped but drops their standard position attrs.
 * Adapt native glyphs before geometric skyline and native SVG drawing.
 */
export function installTechnicalPositions(
  osmd: OpenSheetMusicDisplay,
  decorations: ReadonlyMap<string, { technical?: TechnicalPosition[] }>,
) {
  if (![...decorations.values()].some((rule) => rule.technical?.length)) return;
  const calculator = osmd.GraphicSheet.GetCalculator as unknown as {
    calculateSkyBottomLines(): void;
  };
  const calculate = calculator.calculateSkyBottomLines.bind(calculator);
  const installed = new WeakSet<NativeArticulation>();
  calculator.calculateSkyBottomLines = () => {
    for (const row of osmd.GraphicSheet.MeasureList)
      for (const measure of row)
        for (const entry of measure.staffEntries)
          for (const voice of entry.graphicalVoiceEntries)
            for (const graphical of voice.notes as VexFlowGraphicalNote[]) {
              const token = String(
                graphical.sourceNote.NoteheadColorXml || "",
              ).toLowerCase();
              const positions = decorations.get(token)?.technical;
              if (!positions) continue;
              const [vf, index] = graphical.vfnote as unknown as [
                NativeNote,
                number,
              ];
              for (const position of positions) {
                const articulation = vf
                  .getModifiers()
                  .find(
                    (modifier) =>
                      modifier.getCategory() === "articulations" &&
                      modifier.type === position.type,
                  );
                if (!articulation || installed.has(articulation)) continue;
                installed.add(articulation);
                articulation.setIndex(index);
                const nativeX = articulation.getXShift.bind(articulation);
                const nativeY = articulation.getRenderY.bind(articulation);
                articulation.getXShift = () => {
                  const scale = vf.getStave().getSpacingBetweenLines() / 10;
                  if (position.x === undefined)
                    return nativeX() + position.relativeX * scale;
                  const head = vf.note_heads[index];
                  head.setX(vf.getNoteHeadBeginX());
                  return (
                    head.getAbsoluteX() +
                    (position.x + position.relativeX) * scale -
                    vf.getModifierStartXY(articulation.position, index).x
                  );
                };
                articulation.getRenderY = () => {
                  const stave = vf.getStave();
                  const scale = stave.getSpacingBetweenLines() / 10;
                  if (position.y === undefined)
                    return nativeY() - position.relativeY * scale;
                  // Equal XML Y aligns the centers of different native glyphs.
                  articulation.glyph.setOrigin(0.5, 0.5);
                  return (
                    stave.getYForLine(0) -
                    (position.y + position.relativeY) * scale
                  );
                };
              }
            }
    calculate();
  };
}
