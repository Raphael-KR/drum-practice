/** Automatic phone landscape layout shared by both hosts; no fullscreen API. */
export function installScoreOnlyView(root: HTMLElement, ready: () => boolean) {
  const main = root.querySelector<HTMLElement>("main")!;
  const practice = root.querySelector<HTMLElement>("#practice")!;
  const stage = root.querySelector<HTMLElement>("#stage")!;
  const settingsDialog =
    root.querySelector<HTMLDialogElement>("#settings-dialog");
  // Match the phone landscape breakpoint in styles/06-responsive.css, not a device UA.
  const phoneLandscape = window.matchMedia?.(
    "(orientation: landscape) and (max-width: 1023px) and (max-height: 480px)",
  );
  let normalScrollTop = 0;

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
    if (active && !wasActive) alignStaff();
    else if (!active && wasActive) main.scrollTop = normalScrollTop;
    if (
      active &&
      focused instanceof HTMLElement &&
      root.contains(focused) &&
      focused.closest("header, .playback-dock, #review-tools") &&
      !focused.getClientRects().length
    )
      stage.focus({ preventScroll: true });
  }

  const restoreFocus = () => {
    if (
      ready() &&
      root.classList.contains("score-only-view") &&
      !root.querySelector("dialog[open]")
    )
      stage.focus({ preventScroll: true });
  };
  settingsDialog?.addEventListener("close", restoreFocus);
  phoneLandscape?.addEventListener("change", sync);
  sync();

  return {
    sync,
    alignStaff,
    dispose() {
      settingsDialog?.removeEventListener("close", restoreFocus);
      phoneLandscape?.removeEventListener("change", sync);
      root.classList.remove("score-only-view");
    },
  };
}
