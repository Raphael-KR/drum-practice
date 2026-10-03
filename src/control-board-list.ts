import { t } from "./i18n";
/** Fixed-height saved-item browsing without a scroll container. */
export function paginateControlBoardList(list: HTMLElement) {
  const items = [...list.children] as HTMLElement[];
  let page = Math.min(Number(list.dataset.page || 0), Math.max(0, items.length - 1));
  let frame = list.parentElement!;
  if (!frame.classList.contains("control-board-list")) {
    frame = document.createElement("div");
    frame.className = "control-board-list";
    list.before(frame); frame.append(list);
  }
  frame.querySelector(".control-board-pages")?.remove();
  const nav = document.createElement("div"); nav.className = "control-board-pages";
  const previous = document.createElement("button"), next = document.createElement("button");
  previous.type = next.type = "button";
  previous.textContent = "‹"; next.textContent = "›";
  previous.setAttribute("aria-label", t("workspace.message572"));
  next.setAttribute("aria-label", t("workspace.message573"));
  nav.append(previous, next); frame.append(nav);
  const render = () => {
    list.dataset.page = String(page);
    items.forEach((item, i) => {item.hidden = i !== page;});
    nav.hidden = items.length <= 1;
    previous.disabled = page === 0;
    next.disabled = page >= items.length - 1;
  };
  previous.onclick = () => {page--; render();};
  next.onclick = () => {page++; render();};
  render();
}
