import { type Song } from "./model";
import { nearestQuarterBeat, gridLabel } from "./lyric-grid";

/** The nearest quarter beat is the reporting/display coordinate, not a containing bin. */
export function playbackPosition(song: Song, time: number) {
  const point = nearestQuarterBeat(song, time);
  const label = gridLabel(point.measure, point.tick);
  const text = `${song.artist ? song.artist + " - " : ""}${song.title}\n${label} (${point.measure.beats}/${point.measure.denominator})\n가장 가까운 ¼박 격자 기준\n참고: 원본 재생 시각 ${time.toFixed(3)}초 · 격자 시각 ${point.time.toFixed(3)}초`;
  return { label, text };
}

export async function copyPosition(text: string) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return; } catch { /* Local HTML may deny Clipboard API. */ }
  }
  const active = document.activeElement as HTMLElement | null;
  const field = document.createElement("textarea");
  field.value = text;
  field.readOnly = true;
  field.style.cssText = "position:fixed;left:0;top:0;opacity:0;pointer-events:none";
  document.body.append(field);
  try {
    field.select();
    field.setSelectionRange(0, text.length);
    if (!document.execCommand("copy")) throw Error("위치를 복사하지 못했습니다. 클립보드 접근을 확인하세요.");
  } finally {
    field.remove();
    active?.focus({ preventScroll: true });
  }
}
