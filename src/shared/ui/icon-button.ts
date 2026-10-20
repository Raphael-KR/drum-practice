import { escapeHTML as esc } from "./html";
export function iconButtonHTML(
  id: string,
  svg: string,
  label: string,
  caption = "",
  extraClass = "",
) {
  return `<button type="button"${id ? ` id="${esc(id)}"` : ""} data-common-icon class="${esc(["icon-button", extraClass].filter(Boolean).join(" "))}" aria-label="${esc(label)}" title="${esc(label)}">${svg}${caption ? `<span class="icon-caption">${esc(caption)}</span>` : ""}</button>`;
}
export function setIconButton(
  button: HTMLElement,
  svg: string,
  label: string,
  caption = "",
) {
  const template = document.createElement("template");
  template.innerHTML = iconButtonHTML("", svg, label, caption);
  const model = template.content.firstElementChild!;
  button.replaceChildren(...model.childNodes);
  button.setAttribute("aria-label", label);
  button.title = label;
  button.classList.add("icon-button");
  button.dataset.commonIcon = "";
}
