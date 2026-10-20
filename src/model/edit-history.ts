import type { Song } from "./model";
export interface EditSnapshot {
  song: Song;
  canonicalXML?: string;
}
export interface EditorForm {
  selected: number;
  fields: Record<string, string>;
}
export interface EditDraft extends EditSnapshot {
  form?: EditorForm;
  savedAt: string;
}
export interface SavedRevision extends EditSnapshot {
  savedAt: string;
}
export const snapshot = (r: EditSnapshot): EditSnapshot =>
  structuredClone({ song: r.song, canonicalXML: r.canonicalXML });
export class EditHistory {
  base: EditSnapshot;
  undoStack: EditSnapshot[] = [];
  redoStack: EditSnapshot[] = [];
  constructor(r: EditSnapshot) {
    this.base = snapshot(r);
  }
  changed(r: EditSnapshot) {
    const clean = (s: EditSnapshot) => {
      const c = snapshot(s);
      c.song.settings = this.base.song.settings;
      return JSON.stringify(c);
    };
    return clean(r) !== clean(this.base);
  }
  push(before: EditSnapshot) {
    this.undoStack.push(snapshot(before));
    this.undoStack = this.undoStack.slice(-50);
    this.redoStack = [];
  }
  undo(current: EditSnapshot) {
    const next = this.undoStack.pop();
    if (next) this.redoStack.push(snapshot(current));
    return next;
  }
  redo(current: EditSnapshot) {
    const next = this.redoStack.pop();
    if (next) this.undoStack.push(snapshot(current));
    return next;
  }
}
export function retainRevision(
  list: SavedRevision[] = [],
  r: EditSnapshot,
): SavedRevision[] {
  return [...list, { ...snapshot(r), savedAt: new Date().toISOString() }].slice(
    -10,
  );
}
