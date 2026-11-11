import { t } from "../i18n/i18n";

/** Invoke from the user's click/key gesture, including on Safari. */
export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* Keep the existing selection-based fallback when clipboard access fails. */
    }
  }
  const active = document.activeElement as HTMLElement | null;
  const field = document.createElement("textarea");
  field.value = text;
  field.readOnly = true;
  field.style.cssText =
    "position:fixed;left:0;top:0;opacity:0;pointer-events:none";
  // A modal makes elements outside it inert, including the fallback textarea.
  (active?.closest("dialog[open]") || document.body).append(field);
  try {
    field.select();
    field.setSelectionRange(0, text.length);
    if (!document.execCommand("copy")) throw Error(t("clipboard.copyFailed"));
  } finally {
    field.remove();
    active?.focus({ preventScroll: true });
  }
}
