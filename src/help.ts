import { showDialogFromButton } from "./dialog-transition";
import { scoreLegendHelp } from "./help-legend";
import { createDialog } from "./dialog-ui";
import { t } from "./i18n";
import { helpItems } from "./help-content";

/** Shared contextual help, including modal/top-layer and fullscreen surfaces. */
export function installHelp(root: HTMLElement) {
  if (root.querySelector("#app-help-button")) return;
  const button = document.createElement("button");
  button.id = "app-help-button";
  button.type = "button";
  button.textContent = "?";
  button.title = button.ariaLabel = t("help.title");
  button.setAttribute("aria-haspopup", "dialog");
  root.append(button);
  let help: HTMLDialogElement | undefined;
  const activeDialog = () => {
    const focused =
      document.activeElement?.closest<HTMLDialogElement>("dialog[open]");
    if (focused && focused !== help && root.contains(focused)) return focused;
    return [...root.querySelectorAll<HTMLDialogElement>("dialog[open]")]
      .filter((d) => d !== help)
      .at(-1);
  };
  const relocate = () => {
    if (!button.isConnected) {
      observer.disconnect();
      if (help?.open) help.close();
      return;
    }
    if (help?.open) return;
    const parent = activeDialog() || root.querySelector("header .actions") || root;
    if (button.parentElement !== parent) parent.append(button);
  };
  const observer = new MutationObserver(relocate);
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["open"],
  });
  button.onclick = () => {
    if (help) return;
    const context = activeDialog();
    const items = helpItems(context).filter((i) => {
      const el = (context || root).querySelector(i.target);
      return el && el.getClientRects().length;
    });
    help = createDialog(
      "app-help-dialog",
      t("help.title"),
      "context-help",
      root,
    );
    const dialog = help;
    dialog.addEventListener("keydown", (e) => e.stopPropagation());
    const layout = document.createElement("div");
    layout.className = "help-content";
    const marks = document.createElement("div");
    marks.className = "help-marks";
    marks.ariaHidden = "true";
    const cards = document.createElement("div");
    cards.className = "help-cards";
    cards.setAttribute("aria-live", "polite");
    const shortcuts = document.createElement("p");
    shortcuts.className = "help-shortcuts";
    shortcuts.textContent = t(
      !context && root.querySelector("#practice")?.getClientRects().length
        ? "help.playKeys"
        : "help.closeKey",
    );
    const nav = document.createElement("nav");
    nav.className = "help-pages";
    nav.ariaLabel = t("help.pages");
    const prev = document.createElement("button"),
      next = document.createElement("button"),
      count = document.createElement("span");
    prev.textContent = "←";
    next.textContent = "→";
    prev.ariaLabel = t("help.previous");
    next.ariaLabel = t("help.next");
    nav.append(prev, count, next);
    layout.append(cards, shortcuts, nav);
    const legendButton = document.createElement("button");
    legendButton.type = "button";
    legendButton.className = "help-legend-button";
    legendButton.textContent = t("help.legend.button");
    legendButton.setAttribute("aria-haspopup", "dialog");
    const header = dialog.querySelector(".dialoghead")!;
    header.insertBefore(legendButton, header.querySelector("button"));
    let legend: HTMLDialogElement | undefined;
    legendButton.onclick = () => {
      if (legend) return;
      legend = createDialog(
        "app-legend-dialog",
        t("help.legend.title"),
        "score-legend-dialog",
        root,
      );
      const modal = legend;
      modal.querySelector(".dialoghead")?.remove();
      modal.append(scoreLegendHelp());
      modal.addEventListener("keydown", (e) => e.stopPropagation());
      modal.addEventListener(
        "close",
        () => {
          modal.remove();
          legend = undefined;
          if (dialog.open) legendButton.focus({ preventScroll: true });
        },
        { once: true },
      );
      const closeLegend = showDialogFromButton(modal, legendButton);
      modal.addEventListener("click", (event) => {
        event.stopPropagation();
        closeLegend();
      });
      modal.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          closeLegend();
        }
      });
    };
    dialog.append(marks, layout);
    let page = 0,
      perPage = items.length || 1;
    const paint = () => {
      perPage = innerWidth < 640 || innerHeight < 560 ? 1 : items.length || 1;
      const pages = Math.max(1, Math.ceil(items.length / perPage));
      page = Math.min(page, pages - 1);
      cards.replaceChildren();
      marks.replaceChildren();
      items.slice(page * perPage, (page + 1) * perPage).forEach((item, j) => {
        const number = page * perPage + j + 1;
        const card = document.createElement("section"),
          title = document.createElement("h3"),
          body = document.createElement("p");
        title.textContent = `${number}. ${t(item.title)}`;
        body.textContent = t(item.body);
        card.append(title, body);
        cards.append(card);
        const el = (context || root).querySelector(item.target);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const mark = document.createElement("div");
        mark.className = "help-target";
        mark.style.cssText = `left:${Math.max(0, rect.left)}px;top:${Math.max(0, rect.top)}px;width:${Math.min(rect.right, innerWidth) - Math.max(0, rect.left)}px;height:${Math.min(rect.bottom, innerHeight) - Math.max(0, rect.top)}px`;
        const badge = document.createElement("span");
        badge.textContent = String(number);
        mark.append(badge);
        marks.append(mark);
      });
      nav.hidden = pages === 1;
      count.textContent = `${page + 1} / ${pages}`;
      prev.disabled = page === 0;
      next.disabled = page === pages - 1;
    };
    const move = (delta: number) => {
      page = Math.max(
        0,
        Math.min(Math.ceil(items.length / perPage) - 1, page + delta),
      );
      paint();
    };
    prev.onclick = () => move(-1);
    next.onclick = () => move(1);
    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        move(e.key === "ArrowLeft" ? -1 : 1);
      }
    });
    let start: { x: number; y: number } | undefined;
    layout.addEventListener("pointerdown", (e) => {
      start = { x: e.clientX, y: e.clientY };
    });
    layout.addEventListener("pointerup", (e) => {
      if (
        start &&
        Math.abs(e.clientX - start.x) > 60 &&
        Math.abs(e.clientY - start.y) < 40
      )
        move(e.clientX < start.x ? 1 : -1);
      start = undefined;
    });
    layout.addEventListener("pointercancel", () => {
      start = undefined;
    });
    const resize = new ResizeObserver(paint);
    resize.observe(context || root);
    const scroll = (event: Event) => {
      if (!(event.target instanceof Node) || !dialog.contains(event.target))
        paint();
    };
    window.addEventListener("resize", paint);
    window.addEventListener("scroll", scroll, true);
    dialog.addEventListener(
      "close",
      () => {
        if (legend?.open) legend.close();
        resize.disconnect();
        window.removeEventListener("resize", paint);
        window.removeEventListener("scroll", scroll, true);
        dialog.remove();
        help = undefined;
        relocate();
        button.focus({ preventScroll: true });
      },
      { once: true },
    );
    showDialogFromButton(dialog, button, paint);
  };
  relocate();
}
