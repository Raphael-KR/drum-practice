import { helpItems } from "./help-content";
import { t } from "../../shared/i18n/i18n";
import type { ControlHelp } from "../../shared/ui/help-bubble";
import catalog from "../../shared/ui/ui-catalog.json";
import { componentName } from "../../shared/ui/ui-standard";
import type { MessageKey } from "../../shared/i18n/i18n";
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
  const entry = catalog.components.find((item) =>
    Object.values(item.selectors).some(
      (selector) => selector && control.matches(selector),
    ),
  );
  const explanations: Record<string, MessageKey> = {
    home: "help.control.home",
    play: "help.control.play",
    rewind: "help.control.rewind",
    rewindCount: "help.control.rewindCount",
    progress: "help.control.progress",
    loop: "help.control.loop",
    markerSlot: "help.control.marker",
    sectionShortcut: "help.control.section",
    loopSlot: "help.control.range",
    repeatPreset: "help.control.repeat",
  };
  const label =
    control.getAttribute("aria-label") ||
    control.textContent?.trim() ||
    (control as HTMLInputElement).labels?.[0]?.textContent?.trim() ||
    control.title;
  const name =
    control.dataset.helpTitle ||
    (entry
      ? entry.id === "play" || entry.id === "fullscreen"
        ? control.ariaLabel || componentName(entry.id)
        : componentName(entry.id)
      : label);
  const explicit =
    control.dataset.help || control.getAttribute("aria-description");
  if (explicit) return { title: name || t("help.current"), body: explicit };
  if (entry && explanations[entry.id]) {
    const detail = control.title || control.closest("label")?.title;
    const body = t(explanations[entry.id]);
    return {
      title: name!,
      body:
        "dynamicLabel" in entry &&
        entry.dynamicLabel &&
        detail &&
        detail !== name
          ? detail
          : body,
    };
  }
  const items = helpItems(context || undefined);
  const exact = items.find((item) => control.matches(item.target));
  // Prefer the button's own tooltip to broad section descriptions.
  const match =
    exact ||
    (!control.title && items.find((item) => control.closest(item.target)));
  if (match)
    return {
      title: exact ? t(match.title) : name || t(match.title),
      body: t(match.body),
    };
  return {
    title: name || t("help.current"),
    body: control.title || control.closest("label")?.title || "",
  };
}
