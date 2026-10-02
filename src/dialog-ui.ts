import { iconButtonHTML } from "./icon-button";
import { icon } from "./icon-svg";
import { t } from "./i18n";
import { escapeHTML as escape } from "./html";
export function dialogHeader(
  title: string,
  closeId = "",
  targetId = "",
  headingId = "",
  actions = "",
) {
  const close = iconButtonHTML(
    closeId,
    icon("close"),
    t("editor-session.message042"),
    "",
    "close-button",
  );
  return `<div class="dialoghead"><h2${headingId ? ` id="${escape(headingId)}"` : ""}>${escape(title)}</h2>${actions}${targetId ? close.replace("<button ", `<button data-close="${escape(targetId)}" `) : close}</div>`;
}
export function createDialog(
  id: string,
  title: string,
  className: string,
  parent: HTMLElement = document.body,
  closeId = "",
) {
  const d = document.createElement("dialog");
  d.id = id;
  d.className = className;
  d.setAttribute("aria-label", title);
  d.innerHTML = dialogHeader(title, closeId, id);
  d.querySelector("button")!.onclick = () => d.close();
  parent.append(d);
  return d;
}
const backdrops = new WeakMap<HTMLDialogElement, () => void>();
export function closeDialogOnBackdrop(d: HTMLDialogElement) {
  backdrops.get(d)?.();
  let outsideStart = false;
  const outside = (e: MouseEvent) => {
    const r = d.getBoundingClientRect();
    return (
      e.target === d &&
      (e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom)
    );
  };
  const start = (e: PointerEvent) => {
    outsideStart = outside(e);
  };
  const listener = (e: MouseEvent) => {
    if (outsideStart && outside(e)) {
      e.preventDefault();
      e.stopPropagation();
      d.close();
    }
    outsideStart = false;
  };
  d.addEventListener("pointerdown", start);
  d.addEventListener("click", listener);
  const dispose = () => {
    d.removeEventListener("pointerdown", start);
    d.removeEventListener("click", listener);
    backdrops.delete(d);
  };
  backdrops.set(d, dispose);
  return dispose;
}
