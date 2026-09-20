import { songScores, type ScoreFormat } from './song-scores';
import type { RecordData } from './storage';
const KEY = 'drum-practice.prefer-pdf';
let fallback = false;
export function preferPDF() {
  try { return localStorage.getItem(KEY) === 'true'; } catch { return fallback; }
}
export function savePreferPDF(value: boolean) {
  fallback = value;
  try { localStorage.setItem(KEY, String(value)); } catch { /* Session fallback. */ }
}
export function scorePreference(record: RecordData, preferred = preferPDF()) {
  const formats = songScores(record).map(s => s.format);
  const pdf = formats.includes('pdf'), xml = formats.includes('musicxml');
  const format: ScoreFormat = pdf && (preferred || !xml) ? 'pdf' : 'musicxml';
  return { format, checked: format === 'pdf', disabled: !pdf || !xml,
    message: !pdf ? 'PDF 악보 없음' : !xml ? 'PDF 악보만 있어 PDF로 표시합니다.' : '모든 곡에 공통으로 적용합니다.' };
}
