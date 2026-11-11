import { t } from "../i18n/i18n";
import { copyText } from "./clipboard";
import "../styles/error-notice.css";

let popup: HTMLDivElement | undefined;
let popupTimer: ReturnType<typeof setTimeout> | undefined;

function showCopyResult(message: string, source: HTMLElement) {
  clearTimeout(popupTimer);
  popup?.remove();
  const notice = document.createElement("div");
  notice.className = "clipboard-notice";
  notice.setAttribute("role", "status");
  notice.setAttribute("aria-live", "polite");
  notice.popover = "manual";
  const dialog = source.isConnected ? source.closest("dialog[open]") : null;
  (dialog || document.fullscreenElement || document.body).append(notice);
  // The top layer keeps feedback visible above an open modal without taking focus.
  notice.showPopover?.();
  notice.textContent = message;
  popup = notice;
  popupTimer = setTimeout(() => {
    notice.remove();
    popup = undefined;
    popupTimer = undefined;
  }, 2500);
}

/** Copy the complete error, independently of truncation and the dismiss action. */
export function showCopyableError(target: HTMLElement, message: string) {
  target.replaceChildren();
  target.onclick = null;
  if (!message) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "error-copy";
  button.textContent = message;
  button.title = t("error.copy", { message });
  button.setAttribute("aria-label", button.title);
  // Keep playback shortcuts from handling the focused copy button's keystrokes.
  button.onkeydown = (event) => event.stopPropagation();
  button.onclick = async (event) => {
    event.stopPropagation();
    try {
      await copyText(message);
    } catch (error) {
      console.warn("Clipboard copy failed", {
        error,
        secureContext: window.isSecureContext,
        clipboardAvailable: !!navigator.clipboard?.writeText,
      });
      showCopyResult(t("clipboard.copyFailed"), button);
      return;
    }
    showCopyResult(t("clipboard.copied"), button);
  };
  target.onclick = (event) => {
    const copy = target.querySelector<HTMLButtonElement>(".error-copy");
    if (!copy) return;
    event.stopPropagation();
    copy.click();
  };
  target.append(button);
}
