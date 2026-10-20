import { helpItems } from "./help-content";
import { t } from "../../shared/i18n/i18n";
import type { ControlHelp } from "../../shared/ui/help-bubble";
export const helpControlSelector =
  "button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=slider], [role=tab]";
export function helpControl(
  target: EventTarget | null,
): HTMLElement | undefined {
  if (!(target instanceof Element)) return;
  const control = target.closest<HTMLElement>(helpControlSelector);
  if (control) return control;
  // The metronome and custom switches put an invisible input inside their visible label.
  return (
    target.closest("label")?.querySelector<HTMLElement>("input") || undefined
  );
}
export function helpControlAnchor(control: HTMLElement): HTMLElement {
  return control.closest<HTMLElement>(".metronome-toggle") || control;
}
export function describeHelpControl(control: HTMLElement): ControlHelp {
  const context = control.closest<HTMLElement>("dialog");
  const label =
    control.getAttribute("aria-label") ||
    control.textContent?.trim() ||
    (control as HTMLInputElement).labels?.[0]?.textContent?.trim() ||
    control.title;
  const explicit =
    control.dataset.help || control.getAttribute("aria-description");
  if (explicit) return { title: label || "", body: explicit };
  const items = helpItems(context || undefined);
  const exact = items.find((item) => control.matches(item.target));
  // Prefer the button's own tooltip to broad section descriptions.
  const match =
    exact ||
    (!control.title && items.find((item) => control.closest(item.target)));
  if (match) return { title: label || t(match.title), body: t(match.body) };
  return { title: label || t("help.current"), body: control.title || "" };
}
