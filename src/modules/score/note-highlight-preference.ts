const KEY = 'drum-practice.note-highlight';
let fallback = true;
let sessionOnly = false;
export function readNoteHighlight(): boolean {
  if (sessionOnly) return fallback;
  try { return localStorage.getItem(KEY) !== 'false'; }
  catch { return fallback; }
}
export function saveNoteHighlight(enabled: boolean): boolean {
  fallback = enabled;
  try { localStorage.setItem(KEY, String(enabled)); sessionOnly = false; return true; }
  catch { sessionOnly = true; return false; }
}
