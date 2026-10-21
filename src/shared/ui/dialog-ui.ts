import { iconButtonHTML } from "./icon-button";
import { icon } from "./icon-svg";
import { t } from "../i18n/i18n";
import { escapeHTML as escape } from "./html";
function dialogCloseButton(closeId = "") {
  return iconButtonHTML(
    closeId,
    icon("close"),
    t("editor-session.message042"),
    "",
    "close-button",
  );
}
export function dialogHeader(
  title: string,
  closeId = "",
  targetId = "",
  headingId = "",
  actions = "",
) {
  const close = dialogCloseButton(closeId);
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
  d.querySelector("button")!.onclick = () => requestDialogCancel(d);
  parent.append(d);
  return d;
}
const backdrops = new WeakMap<HTMLDialogElement, () => void>();
/** Use the same cancellable path as Escape, including each dialog's draft guard. */
export function requestDialogCancel(d: HTMLDialogElement) {
  if (d.dispatchEvent(new Event("cancel", { cancelable: true }))) d.close();
}
/** Shared compact popup: app icon, title/message, then full-width stacked actions. */
export function createConfirmationDialog(options: {
  id: string;
  label: string;
  title: string;
  message: string;
  actions: {
    answer: string;
    label: string;
    className?: string;
    autofocus?: boolean;
  }[];
  parent?: HTMLElement;
}) {
  const d = document.createElement("dialog");
  d.id = options.id;
  d.className = "confirmation-dialog";
  d.setAttribute("aria-label", options.label);
  d.setAttribute("aria-describedby", `${options.id}-message`);
  d.tabIndex = -1;
  const body = document.createElement("div");
  body.className = "confirmation-body";
  const appIcon = document.createElement("img");
  appIcon.className = "confirmation-app-icon";
  appIcon.src = `${import.meta.env.BASE_URL}icons/icon-192.png`;
  appIcon.alt = "";
  appIcon.width = appIcon.height = 64;
  const heading = document.createElement("div");
  heading.className = "confirmation-heading";
  heading.innerHTML = dialogCloseButton();
  heading.querySelector<HTMLButtonElement>(".close-button")!.onclick = () =>
    requestDialogCancel(d);
  heading.prepend(appIcon);
  const message = document.createElement("p");
  message.id = `${options.id}-message`;
  const title = document.createElement("strong");
  title.className = "confirmation-title";
  title.textContent = options.title;
  const detail = document.createElement("span");
  detail.textContent = options.message;
  message.append(title, detail);
  const actions = document.createElement("div");
  actions.className = "confirmation-actions";
  for (const action of options.actions) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.answer = action.answer;
    button.textContent = action.label;
    button.className = action.className || "";
    button.autofocus = !!action.autofocus;
    actions.append(button);
  }
  body.append(heading, message, actions);
  d.append(body);
  (options.parent || document.body).append(d);
  return d;
}
export function confirmDiscardChanges(
  parent: HTMLDialogElement,
): Promise<boolean> {
  return new Promise((resolve) => {
    const previous = document.activeElement as HTMLElement | null;
    const d = createConfirmationDialog({
      id: "discard-changes-dialog",
      label: t("dialog.unsavedTitle"),
      title: t("dialog.unsavedTitle"),
      message: t("dialog.discardQuestion"),
      parent,
      actions: [
        {
          answer: "discard",
          label: t("dialog.discardChanges"),
          className: "primary",
        },
        { answer: "keep", label: t("dialog.keepEditing"), autofocus: true },
      ],
    });
    d.querySelectorAll<HTMLButtonElement>("[data-answer]").forEach((button) => {
      button.onclick = () => {
        d.returnValue = button.dataset.answer!;
        d.close();
      };
    });
    d.addEventListener(
      "close",
      () => {
        const discard = d.returnValue === "discard";
        d.remove();
        previous?.focus({ preventScroll: true });
        resolve(discard);
      },
      { once: true },
    );
    d.showModal();
    d.querySelector<HTMLButtonElement>('[data-answer="keep"]')!.focus();
  });
}
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
    outsideStart = e.button === 0 && e.isPrimary !== false && outside(e);
  };
  const listener = (e: MouseEvent) => {
    if (outsideStart && outside(e)) {
      e.preventDefault();
      e.stopPropagation();
      requestDialogCancel(d);
    }
    outsideStart = false;
  };
  d.addEventListener("pointerdown", start);
  d.addEventListener("click", listener);
  const reset = () => {
    outsideStart = false;
  };
  d.addEventListener("pointercancel", reset);
  d.addEventListener("close", reset);
  const dispose = () => {
    d.removeEventListener("pointerdown", start);
    d.removeEventListener("click", listener);
    d.removeEventListener("pointercancel", reset);
    d.removeEventListener("close", reset);
    backdrops.delete(d);
  };
  backdrops.set(d, dispose);
  return dispose;
}
