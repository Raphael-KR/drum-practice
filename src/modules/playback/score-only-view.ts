import { mountLiquidGlass } from "../../shared/ui/liquid-glass";
import { PHONE_LANDSCAPE_QUERY } from "../../platform/browser/phone-layout";

/** Automatic phone landscape layout shared by both hosts; no fullscreen API. */
export function installScoreOnlyView(root: HTMLElement, ready: () => boolean) {
  const main = root.querySelector<HTMLElement>("main")!;
  const practice = root.querySelector<HTMLElement>("#practice")!;
  const stage = root.querySelector<HTMLElement>("#stage")!;
  const soundFields = root.querySelector<HTMLElement>(
    "#settings-dialog .playback-sound-fields",
  );
  const soundHome = soundFields?.parentElement;
  const settingsClose = root.querySelector<HTMLButtonElement>(
    "#settings-dialog > .dialoghead > .close-button",
  );
  const phoneLandscape = window.matchMedia?.(PHONE_LANDSCAPE_QUERY);
  let normalScrollTop = 0;
  const buttonGlass: ReturnType<typeof mountLiquidGlass>[] = [];
  const clearButtonGlass = () => {
    for (const glass of buttonGlass.splice(0)) glass.dispose();
  };
  const placeVolume = (inHeader: boolean) => {
    if (!soundFields || !soundHome || !settingsClose) return;
    // Keep the close button as the initial focus after moving the slider before it.
    settingsClose.autofocus = inHeader;
    if (inHeader) settingsClose.before(soundFields);
    else soundHome.append(soundFields);
  };

  function alignStaff() {
    if (
      !root.classList.contains("score-only-view") ||
      practice.classList.contains("two-rows") ||
      practice.classList.contains("score-review") ||
      stage.dataset.staffMiddle === undefined ||
      !main.clientHeight
    )
      return;
    const crop = stage.querySelector<HTMLElement>(".crop[data-staff-middle]");
    if (!crop) return;
    const staffY =
      crop.getBoundingClientRect().top + Number(stage.dataset.staffMiddle);
    const centerY = main.getBoundingClientRect().top + main.clientHeight / 2;
    // Keep the complete crop reachable instead of clipping a negative row top.
    main.scrollTop += staffY - centerY;
  }

  function sync() {
    const active = ready() && !!phoneLandscape?.matches;
    const focused = document.activeElement;
    const wasActive = root.classList.contains("score-only-view");
    if (active && !wasActive) normalScrollTop = main.scrollTop;
    root.classList.toggle("score-only-view", active);
    if (active && !wasActive) {
      placeVolume(true);
      for (const button of root.querySelectorAll<HTMLButtonElement>(
        "header .actions > :is(#settings, #open-settings-dialog, #app-help-button)",
      ))
        buttonGlass.push(mountLiquidGlass(button));
      alignStaff();
    } else if (!active && wasActive) {
      placeVolume(false);
      clearButtonGlass();
      main.scrollTop = normalScrollTop;
    }
    if (
      active &&
      focused instanceof HTMLElement &&
      root.contains(focused) &&
      focused.closest("header, .playback-dock, #review-tools") &&
      !focused.getClientRects().length
    )
      stage.focus({ preventScroll: true });
  }

  phoneLandscape?.addEventListener("change", sync);
  sync();

  return {
    sync,
    active: () => ready() && !!phoneLandscape?.matches,
    media: phoneLandscape,
    alignStaff,
    dispose() {
      phoneLandscape?.removeEventListener("change", sync);
      clearButtonGlass();
      placeVolume(false);
      root.classList.remove("score-only-view");
    },
  };
}
