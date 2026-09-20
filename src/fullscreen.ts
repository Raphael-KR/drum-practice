const KEY = 'drum-practice.auto-fullscreen';
export function autoFullscreenEnabled() {
  try { return localStorage.getItem(KEY) === 'true'; } catch { return false; }
}
export function saveAutoFullscreen(enabled: boolean) {
  try { localStorage.setItem(KEY, String(enabled)); } catch { /* Private/file origins may reject persistence. */ }
}
export async function enterFullscreen(report: (message: string) => void) {
  if (document.fullscreenElement) return true;
  if (!document.documentElement.requestFullscreen) {
    report('이 브라우저는 전체화면을 지원하지 않습니다.'); return false;
  }
  try {
    await document.documentElement.requestFullscreen();
    restoreModalLayer();
    report(''); return true;
  } catch {
    report('전체화면 전환이 제한되었습니다. 옵션을 껐다가 다시 켜 주세요.'); return false;
  }
}

/** Fullscreen joins the top layer after an already-open settings dialog.
 * Re-enter modal mode above it without running user-dismissal cleanup. */
function restoreModalLayer() {
  const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const dialogs = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog:modal'));
  // The focused modal was on top, even when its DOM order differs.
  dialogs.sort((a, b) => Number(a.contains(focused)) - Number(b.contains(focused)));
  for (const dialog of dialogs) {
    const scroll = [dialog, ...dialog.querySelectorAll<HTMLElement>('*')]
      .filter(el => el.scrollTop || el.scrollLeft)
      .map(el => ({ el, top: el.scrollTop, left: el.scrollLeft }));
    dialog.addEventListener('close', event => event.stopImmediatePropagation(), { once: true, capture: true });
    dialog.close();
    dialog.showModal();
    for (const { el, top, left } of scroll) { el.scrollTop = top; el.scrollLeft = left; }
  }
  if (dialogs.some(dialog => dialog.contains(focused))) focused?.focus({ preventScroll: true });
}
