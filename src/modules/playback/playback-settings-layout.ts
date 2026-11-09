import type { SettingsCategory } from "./playback-forms";
import { t } from "../../shared/i18n/i18n";
import { componentName } from "../../shared/ui/ui-standard";

/** Move the existing inputs, including their listeners and in-progress values. */
export function installPhoneLandscapeSettings(
  root: HTMLElement,
  selected?: (category: SettingsCategory) => void,
) {
  const dialog = root.querySelector<HTMLDialogElement>("#settings-dialog");
  const tempoDialog = root.querySelector<HTMLDialogElement>("#tempo-dialog");
  const tempo = tempoDialog?.querySelector<HTMLElement>(".tool-body");
  const metronome = root.querySelector<HTMLElement>(".settings-metronome-row");
  const placements = [
    { content: tempo, panel: root.querySelector("#tempo-settings") },
    { content: metronome, panel: root.querySelector("#metronome-settings") },
  ].map(({ content, panel }) => ({
    content,
    panel,
    home: content?.parentElement,
    next: content?.nextSibling,
  }));
  let active = false;
  function sync(phone: boolean) {
    if (!dialog || phone === active) return;
    const focused = document.activeElement;
    const tempoOpen = !!tempoDialog?.open;
    if (phone && tempoOpen) tempoDialog!.close();
    active = phone;
    dialog.classList.toggle("settings-phone-landscape", phone);
    for (const { content, panel, home, next } of placements) {
      if (!content || !panel || !home) continue;
      if (phone) panel.append(content);
      else home.insertBefore(content, next ?? null);
    }
    const category =
      phone && tempoOpen
        ? "tempo"
        : ((dialog.dataset.settingsCurrent ?? "screen") as SettingsCategory);
    const current = selectPlaybackSettings(dialog, category);
    if (current !== category || (phone && tempoOpen)) selected?.(current);
    if (phone && tempoOpen) dialog.showModal();
    if (
      dialog.open &&
      focused instanceof HTMLElement &&
      !focused.getClientRects().length
    )
      dialog
        .querySelector<HTMLButtonElement>(
          `[data-settings-category="${current}"]`,
        )
        ?.focus({ preventScroll: true });
  }
  return { sync, dispose: () => sync(false) };
}

export function selectPlaybackSettings(
  root: ParentNode,
  category: SettingsCategory,
) {
  const detail = root.querySelector<HTMLElement>(".settings-detail")!;
  const dialog = detail.closest<HTMLElement>("#settings-dialog")!;
  const phone = dialog.classList.contains("settings-phone-landscape");
  const available = (name: string) =>
    dialog.classList.contains("settings-phone-landscape")
      ? ["screen", "playback", "metronome", "tempo"].includes(name)
      : !["metronome", "tempo"].includes(name);
  const panels = [
    ...detail.querySelectorAll<HTMLElement>("[data-settings-panel]"),
  ];
  const mark = (current: string) => {
    dialog.dataset.settingsCurrent = current;
    root
      .querySelectorAll<HTMLElement>("[data-settings-category]")
      .forEach((button) => {
        button.hidden = !available(button.dataset.settingsCategory!);
        const active = button.dataset.settingsCategory === current;
        button.classList.toggle("primary", active);
        button.setAttribute("aria-current", active ? "location" : "false");
      });
  };
  if (
    !available(category) ||
    !panels.some((panel) => panel.dataset.settingsPanel === category)
  )
    category = "screen";
  panels.forEach((panel) => {
    panel.hidden =
      !available(panel.dataset.settingsPanel!) ||
      (phone && panel.dataset.settingsPanel !== category);
    if (!panel.querySelector(".settings-section-heading")) {
      const heading = document.createElement("h3");
      heading.className = "settings-section-heading";
      heading.textContent = componentName(
        `settings.${panel.dataset.settingsPanel}`,
      );
      panel.prepend(heading);
    }
  });
  if (!root.querySelector(".settings-nav")) return category;
  if (!detail.dataset.scrollNavigation) {
    detail.dataset.scrollNavigation = "true";
    detail.addEventListener("scroll", () => {
      if (dialog.classList.contains("settings-phone-landscape")) return;
      const top = detail.getBoundingClientRect().top;
      const sections = [
        ...detail.querySelectorAll<HTMLElement>("[data-settings-panel]"),
      ];
      const current = sections.find(
        (panel) =>
          !panel.hidden && panel.getBoundingClientRect().bottom > top + 32,
      );
      if (current) mark(current.dataset.settingsPanel!);
    });
  }
  const scroll = () => {
    const panel = panels.find(
      (panel) => panel.dataset.settingsPanel === category,
    );
    if (phone) detail.scrollTop = 0;
    else if (panel)
      detail.scrollTop +=
        panel.getBoundingClientRect().top - detail.getBoundingClientRect().top;
    mark(category);
  };
  scroll();
  const heading = root.querySelector<HTMLElement>("#settings-detail-heading")!;
  heading.textContent =
    category === "info"
      ? t("main.message097")
      : componentName(`settings.${category}`);
  heading.hidden = true;
  return category;
}
