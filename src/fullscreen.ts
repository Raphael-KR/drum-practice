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
    report(''); return true;
  } catch {
    report('전체화면 전환이 제한되었습니다. 옵션을 껐다가 다시 켜 주세요.'); return false;
  }
}
