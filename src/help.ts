import { createDialog } from "./dialog-ui";
import { t as i18nText } from "./i18n";

/** Shared entry point; contextual help pages will replace the placeholder. */
export function installHelp(root: HTMLElement) {
  if (document.getElementById("app-help-button")) return;
  const style = document.createElement("style");
  style.textContent = `
    #app-help-button{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:20;width:44px;height:44px;border-radius:50%;border:1px solid #c7d4e8;background:#fff;color:#304563;font:600 22px -apple-system,sans-serif;box-shadow:0 2px 8px #24304418;cursor:pointer}
    #app-help-button:focus-visible{outline:3px solid #2563eb;outline-offset:3px}
    #app-help-dialog{width:min(360px,calc(100vw - 48px));padding:24px;border:1px solid #d5dfed;border-radius:20px;background:#f7f9fd;color:#243044}
    #app-help-dialog::backdrop{background:#15243c66}
    #app-help-dialog .dialoghead{display:flex;align-items:center;justify-content:space-between;gap:16px}
    #app-help-dialog h2{margin:0;font-size:20px}
    #app-help-dialog button{width:44px;height:44px;border-radius:50%;border:1px solid #d5dfed;background:white;font-size:24px;color:#243044}
  `;
  const button = document.createElement("button");
  button.id = "app-help-button";
  button.type = "button";
  button.textContent = "?";
  button.title = button.ariaLabel = i18nText("help.title");
  button.setAttribute("aria-haspopup", "dialog");
  const dialog = createDialog(
    "app-help-dialog",
    i18nText("help.title"),
    "",
    root,
  );
  dialog.querySelector("h2")!.id = "app-help-title";
  dialog.setAttribute("aria-labelledby", "app-help-title");
  const text = document.createElement("p");
  text.textContent = i18nText("help.pending");
  dialog.append(text);
  dialog.addEventListener("close", () => button.focus({ preventScroll: true }));
  button.onclick = () => dialog.showModal();
  root.append(style, button, dialog);
}
