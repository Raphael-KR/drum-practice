import { setIconButton } from "./icon-button";
import { t as i18nText } from "./i18n";
import { uiText } from "./ui-standard";
import { icon } from "./icons";
const KEY = "drum-practice.auto-fullscreen";
export function autoFullscreenEnabled() {
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}
export function saveAutoFullscreen(enabled: boolean) {
  try {
    localStorage.setItem(KEY, String(enabled));
  } catch {
    /* Private/file origins may reject persistence. */
  }
}
export async function enterFullscreen(report: (message: string) => void) {
  if (document.fullscreenElement) return true;
  if (!document.documentElement.requestFullscreen) {
    report(i18nText("fullscreen.message048"));
    return false;
  }
  try {
    await document.documentElement.requestFullscreen();
    restoreModalLayer();
    report("");
    return true;
  } catch {
    report(i18nText("fullscreen.message049"));
    return false;
  }
}

/** Fullscreen joins the top layer after an already-open settings dialog.
 * Re-enter modal mode above it without running user-dismissal cleanup. */
function restoreModalLayer() {
  const focused =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  const dialogs = Array.from(
    document.querySelectorAll<HTMLDialogElement>("dialog:modal"),
  );
  // The focused modal was on top, even when its DOM order differs.
  dialogs.sort(
    (a, b) => Number(a.contains(focused)) - Number(b.contains(focused)),
  );
  for (const dialog of dialogs) {
    const scroll = [dialog, ...dialog.querySelectorAll<HTMLElement>("*")]
      .filter((el) => el.scrollTop || el.scrollLeft)
      .map((el) => ({ el, top: el.scrollTop, left: el.scrollLeft }));
    dialog.addEventListener(
      "close",
      (event) => event.stopImmediatePropagation(),
      { once: true, capture: true },
    );
    dialog.close();
    dialog.showModal();
    for (const { el, top, left } of scroll) {
      el.scrollTop = top;
      el.scrollLeft = left;
    }
  }
  if (dialogs.some((dialog) => dialog.contains(focused)))
    focused?.focus({ preventScroll: true });
}

/** Browser-owned exit controls cannot be locked by a web page. */
export function installScreenControls(
  settings: HTMLElement,
  report: (message: string) => void,
) {
  const full = document.createElement("button");
  full.id = "header-fullscreen";
  full.className = "icon-button screen-action";
  full.type = "button";
  const reload = document.createElement("button");
  reload.id = "header-reload";
  reload.className = "icon-button screen-action";
  reload.type = "button";
  setIconButton(reload, icon("reload"), uiText("reload"));
  reload.onclick = () => window.location.reload();
  const sync = () => {
    const active = !!document.fullscreenElement;
    setIconButton(full, icon(active ? "collapse" : "expand"), uiText(active ? "exitFullscreen" : "fullscreen"));
    full.setAttribute("aria-pressed", String(active));
  };
  full.onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await enterFullscreen(report);
    } catch {
      report(i18nText("fullscreen.message050"));
    }
    sync();
  };
  settings.before(full, reload);
  document.addEventListener("fullscreenchange", sync);
  sync();
  const preventPinch = (event: Event) => {
    if (document.fullscreenElement && event.cancelable) event.preventDefault();
  };
  const touch = (event: TouchEvent) => {
    if (event.touches.length > 1) preventPinch(event);
  };
  document.addEventListener("touchstart", touch, { passive: false });
  document.addEventListener("touchmove", touch, { passive: false });
  document.addEventListener("gesturestart", preventPinch, { passive: false });
  document.addEventListener("gesturechange", preventPinch, { passive: false });
  return () => {
    document.removeEventListener("fullscreenchange", sync);
    document.removeEventListener("touchstart", touch);
    document.removeEventListener("touchmove", touch);
    document.removeEventListener("gesturestart", preventPinch);
    document.removeEventListener("gesturechange", preventPinch);
    full.remove();
    reload.remove();
  };
}
