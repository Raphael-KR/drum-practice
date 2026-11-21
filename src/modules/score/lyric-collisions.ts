import type { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import type { VexFlowMeasure } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/VexFlow/VexFlowMeasure";
import type { VexFlowVoiceEntry } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/VexFlow/VexFlowVoiceEntry";
import { lyricVoiceNotes } from "./canonical-lyric-voice";
import { xmlChild, xmlChildren } from "./canonical-xml-dom";

interface CollisionFormatter {
  CATEGORY: string;
  format(notes: object[] | undefined, ...args: unknown[]): unknown;
}
interface ModifierContext {
  PREFORMAT: CollisionFormatter[];
}
interface CollisionNote {
  addToModifierContext(context: ModifierContext): CollisionNote;
}

/** Resolve owned lanes per measure; a lane shared with unowned notes stays native. */
function ownedLyricVoices(document: Document) {
  const parts = new Map<string, Set<number>[]>();
  for (const part of document.querySelectorAll("score-partwise > part")) {
    const owned = lyricVoiceNotes(part);
    if (!owned.size) continue;
    const voiceId = (note: Element) =>
      Number(xmlChild(note, "voice")?.textContent || "1");
    parts.set(
      part.id,
      xmlChildren(part, "measure").map((measure) => {
        const notes = xmlChildren(measure, "note");
        const voices = new Set(notes.filter((n) => owned.has(n)).map(voiceId));
        for (const note of notes)
          if (!owned.has(note)) voices.delete(voiceId(note));
        return voices;
      }),
    );
  }
  return parts;
}

/** OSMD 2.3/VexFlow includes transparent lyric notes in multi-voice collisions.
 * Filter that calculation only: retain tickables, lyric anchors and post-format.
 */
export function installLyricCollisions(
  osmd: OpenSheetMusicDisplay,
  document: Document,
) {
  const owned = ownedLyricVoices(document);
  if (!owned.size) return;
  const calculator = osmd.GraphicSheet.GetCalculator as unknown as {
    calculateMeasureXLayout(row: VexFlowMeasure[]): number;
  };
  const calculate = calculator.calculateMeasureXLayout.bind(calculator);
  const ignored = new WeakSet<object>();
  const contexts = new WeakSet<ModifierContext>();
  calculator.calculateMeasureXLayout = (row) => {
    for (const measure of row) {
      if (!measure) continue;
      const index = measure.parentSourceMeasure.measureListIndex;
      for (const staff of measure.staffEntries)
        for (const entry of staff.graphicalVoiceEntries) {
          const voice = entry.parentVoiceEntry.ParentVoice;
          if (
            !owned.get(voice.Parent.IdString)?.[index]?.has(voice.VoiceId) ||
            !entry.notes.length ||
            !entry.notes.every((note) => note.sourceNote.PrintObject === false)
          )
            continue;
          const note = (entry as VexFlowVoiceEntry).vfStaveNote as unknown as
            CollisionNote | undefined;
          if (!note || ignored.has(note)) continue;
          ignored.add(note);
          const register = note.addToModifierContext;
          note.addToModifierContext = function (context) {
            const result = register.call(this, context);
            if (!contexts.has(context)) {
              contexts.add(context);
              // Replace only this context's formatter, never the global class.
              context.PREFORMAT = context.PREFORMAT.map((formatter) =>
                formatter.CATEGORY === "stavenotes"
                  ? {
                      CATEGORY: formatter.CATEGORY,
                      format: (notes, ...args) =>
                        formatter.format(
                          notes?.filter((n) => !ignored.has(n)),
                          ...args,
                        ),
                    }
                  : formatter,
              );
            }
            return result;
          };
        }
    }
    return calculate(row);
  };
}
