import { locate, type Song } from "./model";

/** Show the containing sixteenth-note slot; copy the exact audio time as well. */
export function playbackPosition(song: Song, time: number) {
  const { measure, beat } = locate(song, time);
  if (!measure) throw Error("복사할 마디가 없습니다.");
  const slot = Math.min(Math.ceil(measure.beats * 4) - 1, Math.floor(beat * 4 + 1e-7));
  const fraction = ["", " + ¼", " + ½", " + ¾"][slot % 4];
  const label = `${measure.label}마디 · ${Math.floor(slot / 4) + 1}박${fraction}`;
  const eighth = measure.denominator === 4 && slot % 2 === 0
    ? ` · ${Math.floor(slot / 2) + 1}번째 8분음표 구간` : "";
  const text = `${song.artist ? song.artist + " - " : ""}${song.title}\n${label}${eighth} (${measure.beats}/${measure.denominator})\n음원 ${time.toFixed(3)}초 · 마디 시작 후 ${Math.max(0, time - measure.start).toFixed(3)}초 · 박 위치 ${(beat + 1).toFixed(3)} (1부터)\n표시는 현재 ¼박 구간 기준입니다.`;
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
