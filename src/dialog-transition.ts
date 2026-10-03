/** Only the surface snapshot moves; trigger buttons are geometry anchors. */
let transitioning = false;
export function transitionSurface(surface: HTMLElement, opener: HTMLElement, opening: boolean, update: () => void, motion: "modal" | "drawer" = "modal") {
    if (transitioning) { update(); return; }
    if (
      !document.startViewTransition ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      update();
      return;
    }
    transitioning = true;
    const anchor = opener.getBoundingClientRect();
    const isDrawer = motion === "drawer";
    const previousName = surface.style.viewTransitionName;
    const html = document.documentElement;
    const measure = () => {
      const bounds = surface.getBoundingClientRect();
      const scale = Math.min(
        anchor.width / Math.max(bounds.width, 1),
        anchor.height / Math.max(bounds.height, 1),
      );
      html.style.setProperty(
        "--help-modal-collapsed",
        `translate(${anchor.x + anchor.width / 2 - bounds.x - bounds.width / 2}px, ${anchor.y + anchor.height / 2 - bounds.y - bounds.height / 2}px) scale(${scale})`,
      );
    };
    if (!opening && !isDrawer) measure();
    if (isDrawer) html.classList.add("surface-drawer-transition");
    surface.style.viewTransitionName = "help-modal-morph";
    html.classList.add(
      "help-modal-transition",
      opening ? "help-modal-opening" : "help-modal-closing",
    );
    let updated = false;
    const apply = () => {
      if (updated) return;
      updated = true;
      update();
      if (opening && !isDrawer) measure();
    };
    const cleanup = () => {
      surface.style.viewTransitionName = previousName;
      html.classList.remove(
        "help-modal-transition",
        "help-modal-opening",
        "help-modal-closing",
      );
      html.classList.remove("surface-drawer-transition");
      html.style.removeProperty("--help-modal-collapsed");
      // Removing a view-transition name changes the backdrop root. Invalidate
      // the glass layers now instead of leaving their first repaint to a tap.
      if (surface.isConnected && !surface.hidden) {
        surface.classList.add("glass-repaint");
        const glass =
          surface.querySelector<HTMLElement>(".help-content") || surface;
        void getComputedStyle(glass).backdropFilter;
        surface.classList.remove("glass-repaint");
        void getComputedStyle(glass).backdropFilter;
      }
      transitioning = false;
    };
    try {
      const transition = document.startViewTransition(apply);
      // Start expansion only after the new snapshot (including SVG filters) is
      // ready. A CSS animation may have advanced while that snapshot is built.
      void transition.ready
        .then(() => {
          if (!opening) return;
          html.animate(
            isDrawer ? [
              { clipPath: "inset(0 0 100% 0)" },
              { clipPath: "inset(0 0 0% 0)" },
            ] : [
              {
                transform: html.style.getPropertyValue(
                  "--help-modal-collapsed",
                ),
                opacity: 0,
              },
              { transform: "none", opacity: 1 },
            ],
            {
              pseudoElement: "::view-transition-new(help-modal-morph)",
              duration: parseFloat(getComputedStyle(html).getPropertyValue("--surface-expand-ms")) || 320,
              easing: getComputedStyle(html).getPropertyValue("--surface-expand-easing").trim() || "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "both",
            },
          );
        })
        .catch(() => {});
      void transition.finished.then(cleanup, cleanup);
    } catch {
      try {
        apply();
      } finally {
        cleanup();
      }
    }
}
export function showDialogFromButton(dialog: HTMLDialogElement, opener: HTMLButtonElement, afterOpen: () => void = () => {}) {
  const change = (opening: boolean) => transitionSurface(dialog, opener, opening, () => {
    if (opening) {dialog.showModal(); afterOpen();}
    else {dialog.close(); opener.focus({preventScroll:true});}
  });
  const closeButton = dialog.querySelector<HTMLButtonElement>(".close-button");
  if (closeButton) closeButton.onclick = () => change(false);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    change(false);
  });
  change(true);
  return () => change(false);
}
