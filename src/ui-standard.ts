import { t, type MessageKey } from "./i18n";
import catalog from "./ui-catalog.json";
export type UILocale = "ko" | "en";
export type UIMessage = keyof typeof catalog.messages;
/** Locale is explicit: incomplete application translations must never follow browser locale. */
export function uiText(key: UIMessage, locale: UILocale = "ko"): string {
  return locale === "ko"
    ? t(catalog.messages[key].ko as MessageKey)
    : catalog.messages[key].en;
}
export function componentName(
  id: string,
  locale: UILocale = "ko",
  accessible = false,
): string {
  const entry = catalog.components.find((item) => item.id === id);
  if (!entry) throw new Error(`Unknown UI component: ${id}`);
  const value = accessible ? entry.accessible : entry.name;
  return locale === "ko" ? t(value.ko as MessageKey) : value.en;
}
export function uiNameForId(id: string, fallback: string): string {
  const item = catalog.components.find((entry) =>
    Object.values(entry.selectors).includes(`#${id}`),
  );
  return item ? t(item.name.ko as MessageKey) : fallback;
}
/** Shared layout/semantics for the web application and standalone playback export. */
export function installUIStandard(
  surface: "web" | "portable",
  root: HTMLElement,
) {
  const primary = root.querySelector<HTMLElement>(".transport");
  const secondary = root.querySelector<HTMLElement>(
    surface === "web" ? "#repeat-controls" : ".repeat-controls",
  );
  if (primary && secondary && !primary.closest(".playback-group")) {
    const group = document.createElement("section");
    group.className = "playback-group";
    primary.before(group);
    group.append(primary, secondary);
    const practice = root.querySelector("#practice");
    if (practice && group.parentElement !== practice) practice.append(group);
  }
  for (const entry of catalog.components) {
    const selector = entry.selectors[surface];
    if (!selector) continue;
    for (const element of root.querySelectorAll<HTMLElement>(selector)) {
      element.dataset.uiId = entry.id;
      const caption = element.querySelector<HTMLElement>(".icon-caption");
      if (entry.id.startsWith("settings.") && caption)
        caption.textContent = t(entry.name.ko as MessageKey);
      const label = element.closest("label");
      const title = label?.querySelector<HTMLElement>("strong");
      if (entry.parent === "settings" && title)
        title.textContent = t(entry.name.ko as MessageKey);
      const description = label?.querySelector<HTMLElement>("small");
      if (description && element.id) {
        description.id ||= `${element.id}-description`;
        element.setAttribute("aria-describedby", description.id);
      }
      if (entry.role) element.setAttribute("role", entry.role);
      // Stateful labels are managed by the state owner after initialization.
      if (!["play", "fullscreen", "tempo", "footer"].includes(entry.id))
        element.setAttribute("aria-label", componentName(entry.id, "ko", true));
    }
  }
  const stage = root.querySelector<HTMLElement>("#stage");
  if (stage) {
    let help = root.querySelector<HTMLElement>("#score-gesture-hint");
    if (!help) {
      help = document.createElement("p");
      help.id = "score-gesture-hint";
      help.className = "ui-sr-only";
      stage.after(help);
    }
    help.textContent = uiText("scoreHelp");
    stage.setAttribute("aria-describedby", help.id);
  }
  // Native dialogs provide focus trapping/Escape. Supply a programmatic name for each.
  const triggers: Record<string, string[]> = {
    "settings-dialog": ["open-settings-dialog", "settings"],
    "tempo-dialog": ["original-tempo", "bpm"],
    "sound-dialog": ["open-sound-dialog", "sound"],
    "loop-dialog": ["open-loop-dialog", "adjust"],
  };
  for (const dialog of root.querySelectorAll<HTMLDialogElement>("dialog")) {
    if (!dialog.dataset.uiFocusBound) {
      dialog.dataset.uiFocusBound = "true";
      let origin: HTMLElement | undefined;
      for (const id of triggers[dialog.id] || []) {
        root.querySelector<HTMLElement>(`#${id}`)?.addEventListener(
          "click",
          (event) => {
            origin = event.currentTarget as HTMLElement;
          },
          { capture: true },
        );
      }
      dialog.addEventListener("close", () =>
        queueMicrotask(() => {
          if (origin?.isConnected && !root.querySelector("dialog[open]"))
            origin.focus({ preventScroll: true });
        }),
      );
    }
    const heading = dialog.querySelector<HTMLElement>("h2");
    if (!heading || dialog.hasAttribute("aria-labelledby")) continue;
    heading.id ||= `${dialog.id}-title`;
    dialog.setAttribute("aria-labelledby", heading.id);
  }
}
