import { showDialogFromButton } from "../../shared/ui/dialog-transition";
import { scoreLegendHelp } from "./help-legend";
import {
  createDialog,
  dialogHeader,
  closeDialogOnBackdrop,
} from "../../shared/ui/dialog-ui";
import { t } from "../../shared/i18n/i18n";
import { createHelpBubble } from "../../shared/ui/help-bubble";
import {
  helpControl,
  helpControlAnchor,
  describeHelpControl,
} from "./help-controls";
import { bindHelpHold } from "../../shared/ui/help-hold";

let disposeHelp: (() => void) | undefined;
/** A transparent top-layer guide leaves real controls focusable without executing them. */
export function installHelp(root: HTMLElement) {
  if (root.querySelector("#app-help-button")) return;
  disposeHelp?.();
  const abort = new AbortController();
  const button = document.createElement("button");
  button.id = "app-help-button";
  button.type = "button";
  button.textContent = "?";
  button.title = button.ariaLabel = t("help.title");
  button.setAttribute("aria-haspopup", "dialog");
  root.append(button);
  let surface: HTMLElement | undefined,
    selected: HTMLElement | undefined,
    context: HTMLElement | undefined;
  let bubble: ReturnType<typeof createHelpBubble> | undefined;
  let legend: HTMLDialogElement | undefined;
  let oldDescription: string | null = null;
  let hint: HTMLElement | undefined;
  let held: HTMLElement | undefined;
  let heldDescription: string | null = null;
  const dismissible = new Map<HTMLDialogElement, () => void>();
  const activeDialog = () =>
    [...document.querySelectorAll<HTMLDialogElement>("dialog[open]")]
      .filter((d) => d !== legend)
      .at(-1);
  const belongs = (target: HTMLElement) =>
    root.contains(target) || !!target.closest("dialog[open]");
  const targetFor = (event: Event) => {
    const control = helpControl(event.target);
    return control &&
      belongs(control) &&
      !control.closest("#app-help-dialog,#app-legend-dialog,#control-hold-help")
      ? control
      : undefined;
  };
  const restoreDescription = (
    target: HTMLElement | undefined,
    value: string | null,
  ) => {
    if (!target) return;
    if (value === null) target.removeAttribute("aria-describedby");
    else target.setAttribute("aria-describedby", value);
  };
  const describe = (target: HTMLElement) => {
    const old = target.getAttribute("aria-describedby");
    target.setAttribute(
      "aria-describedby",
      [old, "active-control-help"].filter(Boolean).join(" "),
    );
    return old;
  };
  const hideHold = () => {
    restoreDescription(held, heldDescription);
    held = undefined;
    hint?.remove();
    hint = undefined;
  };
  const unbindHold = bindHelpHold({
    target: targetFor,
    enabled: () => !surface && !legend,
    show: (target) => {
      hideHold();
      held = target;
      heldDescription = describe(target);
      hint = document.createElement("div");
      hint.id = "control-hold-help";
      hint.className = "speech-help hold-help";
      hint.setAttribute("popover", "manual");
      (target.closest("dialog[open]") || root).append(hint);
      hint.showPopover();
      createHelpBubble(hint).show(
        helpControlAnchor(target),
        describeHelpControl(target),
      );
    },
    hide: hideHold,
  });
  const relocate = () => {
    if (!button.isConnected) {
      const home = root.isConnected && root.querySelector("header .actions");
      if (home) home.append(button);
      else {
        disposeHelp?.();
        return;
      }
    }
    if (surface) return;
    const modal = activeDialog();
    const destination = root.querySelector("header .actions") || root;
    if (button.parentElement !== destination) destination.append(button);
    button.hidden = !!modal;
    for (const [dialog, dispose] of dismissible) {
      if (!dialog.isConnected) {
        dispose();
        dismissible.delete(dialog);
      }
    }
    if (
      modal &&
      !modal.classList.contains("score-reader-dialog") &&
      !dismissible.has(modal)
    ) {
      modal.classList.add("backdrop-dismissible");
      dismissible.set(modal, closeDialogOnBackdrop(modal));
    }
  };
  const close = () => {
    if (!surface) return;
    legend?.close();
    restoreDescription(selected, oldDescription);
    selected = undefined;
    surface.remove();
    surface = undefined;
    bubble = undefined;
    context = undefined;
    button.setAttribute("aria-expanded", "false");
    relocate();
    button.focus({ preventScroll: true });
  };
  const paint = () => {
    if (!surface) return;
    if (context && !context.isConnected) {
      close();
      return;
    }
    const header = surface.querySelector<HTMLElement>(".dialoghead")!;
    const r = button.getBoundingClientRect();
    header.style.left = `${Math.max(0, Math.min(innerWidth - 48, r.left))}px`;
    header.style.top = `${Math.max(0, Math.min(innerHeight - 48, r.top))}px`;
    const footer = surface.querySelector<HTMLElement>(".help-footer")!;
    const stage =
      !context && root.querySelector<HTMLElement>("#practice #stage");
    const scoreRect = stage && stage.getBoundingClientRect();
    if (scoreRect && scoreRect.width > 0 && scoreRect.height > 0) {
      // Keep the guide inside the score, just above the transport controls.
      footer.style.left = `${Math.max(12, scoreRect.left + 12)}px`;
      footer.style.right = `${Math.max(12, innerWidth - scoreRect.right + 12)}px`;
      footer.style.bottom = `${Math.max(12, innerHeight - scoreRect.bottom + 8)}px`;
    } else {
      footer.style.left = footer.style.right = footer.style.bottom = "";
    }
    if (selected) {
      const cr = header.getBoundingClientRect();
      const fr = footer.getBoundingClientRect();
      bubble?.show(
        helpControlAnchor(selected),
        describeHelpControl(selected),
        12,
        [cr, fr].map((rect) => ({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        })),
      );
    }
  };
  const select = (control: HTMLElement) => {
    if (
      !surface ||
      control === button ||
      !belongs(control) ||
      control.closest("#app-help-dialog,#app-legend-dialog")
    )
      return;
    if (context && !context.contains(control)) return;
    if (selected !== control) {
      restoreDescription(selected, oldDescription);
      selected = control;
      oldDescription = describe(control);
    }
    paint();
  };
  button.onclick = () => {
    if (surface || activeDialog()) return;
    hideHold();
    context = activeDialog();
    surface = document.createElement("div");
    surface.id = "app-help-dialog";
    surface.className = "speech-help focus-help";
    surface.setAttribute("popover", "manual");
    surface.setAttribute("role", "dialog");
    surface.ariaLabel = t("help.title");
    surface.innerHTML = dialogHeader(t("help.title"));
    surface.querySelector("h2")?.remove();
    surface.querySelector<HTMLButtonElement>(".close-button")!.onclick = close;
    const footer = document.createElement("div");
    footer.className = "help-footer";
    const instruction = document.createElement("p");
    instruction.textContent = t("help.holdHint");
    const legendButton = document.createElement("button");
    legendButton.className = "help-legend-button";
    legendButton.type = "button";
    legendButton.textContent = t("help.legend.button");
    legendButton.title = t("help.legend.title");
    legendButton.setAttribute("aria-haspopup", "dialog");
    legendButton.hidden = root.classList.contains("audio-practice");
    footer.append(instruction, legendButton);
    surface.append(footer);
    bubble = createHelpBubble(surface);
    (context || root).append(surface);
    surface.showPopover();
    button.setAttribute("aria-expanded", "true");
    legendButton.onclick = () => {
      if (legend) return;
      legend = createDialog(
        "app-legend-dialog",
        t("help.legend.title"),
        "score-legend-dialog",
        root,
      );
      const modal = legend;
      modal.querySelector(".dialoghead h2")?.remove();
      modal.append(scoreLegendHelp());
      modal.addEventListener("keydown", (e) => e.stopPropagation());
      modal.addEventListener(
        "close",
        () => {
          modal.remove();
          legend = undefined;
          if (surface) legendButton.focus({ preventScroll: true });
        },
        { once: true },
      );
      const closeLegend = showDialogFromButton(modal, legendButton);
      modal.addEventListener("click", (event) => {
        event.stopPropagation();
        if ((event.target as Element).closest(".close-button")) return;
        closeLegend();
      });
      modal.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          closeLegend();
        }
      });
    };
    paint();
    surface
      .querySelector<HTMLButtonElement>(".close-button")!
      .focus({ preventScroll: true });
  };
  const listen = (type: string, fn: EventListener) =>
    window.addEventListener(type, fn, { capture: true, signal: abort.signal });
  const owned = (event: Event) =>
    event.target instanceof Node &&
    (!!surface?.contains(event.target) ||
      root.contains(event.target) ||
      !!(event.target as Element).closest?.("dialog[open]"));
  const guideEvent = (event: Event) =>
    !!surface &&
    !legend &&
    owned(event) &&
    !(event.target instanceof Node && surface.contains(event.target));
  listen("focusin", (event) => {
    if (guideEvent(event)) {
      const target = targetFor(event);
      if (target) select(target);
    }
  });
  listen("pointerover", (event) => {
    if (guideEvent(event) && (event as PointerEvent).pointerType !== "touch") {
      const target = targetFor(event);
      if (target) select(target);
    }
  });
  for (const type of [
    "pointerdown",
    "pointerup",
    "click",
    "dblclick",
    "contextmenu",
  ])
    listen(type, (event) => {
      if (!guideEvent(event)) return;
      const target = targetFor(event);
      if (target) {
        select(target);
        if (type === "pointerdown") target.focus({ preventScroll: true });
      }
      // Scroll gestures retain their default, while actual controls cannot activate in help mode.
      if (type !== "pointerdown" || target) event.preventDefault();
      event.stopImmediatePropagation();
    });
  listen("keydown", (event) => {
    if (!surface || legend || !owned(event)) return;
    const e = event as KeyboardEvent;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopImmediatePropagation();
      close();
      return;
    }
    if (surface.contains(e.target as Node)) return;
    if (e.key === "Tab") return;
    e.preventDefault();
    e.stopImmediatePropagation();
  });
  for (const type of ["resize", "scroll"])
    listen(type, () => {
      hideHold();
      paint();
    });
  const observer = new MutationObserver(() => {
    if (held && !held.isConnected) hideHold();
    relocate();
    if (surface && selected && !selected.isConnected) {
      restoreDescription(selected, oldDescription);
      selected = undefined;
      bubble?.hide();
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["open"],
  });
  disposeHelp = () => {
    disposeHelp = undefined;
    observer.disconnect();
    for (const [modal, dispose] of dismissible) {
      dispose();
      modal.classList.remove("backdrop-dismissible");
    }
    unbindHold();
    abort.abort();
    close();
    button.remove();
  };
  relocate();
}
