import {
  selectPlaybackSettings,
  type SettingsCategory,
} from "./playback-forms";

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
