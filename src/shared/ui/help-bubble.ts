import { placeHelpBubble, type HelpRect } from "./help-placement";
export type HelpAction = { label: string; run: () => void };
// Actions belong to live controls; replacing a control also retires its action.
const actions = new WeakMap<HTMLElement, HelpAction>();
export const setHelpAction = (target: HTMLElement, action: HelpAction) =>
  actions.set(target, action);
export const getHelpAction = (target: HTMLElement) => actions.get(target);
export type ControlHelp = { title: string; body: string };
const rectOf = (r: DOMRect): HelpRect => ({
  x: r.left,
  y: r.top,
  width: r.width,
  height: r.height,
});
/** One reusable bubble in viewport coordinates, shared by help mode and hold hints. */
export function createHelpBubble(host: HTMLElement, action?: HelpAction) {
  const mark = document.createElement("div");
  mark.className = "help-target";
  mark.ariaHidden = "true";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("help-tail");
  svg.ariaHidden = "true";
  const tail = document.createElementNS(svg.namespaceURI, "polygon");
  svg.append(tail);
  const card = document.createElement("section");
  card.className = "help-bubble";
  card.id = "active-control-help";
  card.setAttribute("role", "tooltip");
  const title = document.createElement("h3"),
    body = document.createElement("p");
  card.append(title, body);
  let actionButton: HTMLButtonElement | undefined;
  if (action) {
    card.setAttribute("role", "group");
    title.id = "active-control-help-title";
    card.setAttribute("aria-labelledby", title.id);
    actionButton = document.createElement("button");
    actionButton.type = "button";
    actionButton.className = "danger help-action";
    actionButton.textContent = action.label;
    actionButton.onclick = action.run;
    // Keyboard activation must not also invoke playback/range shortcuts.
    actionButton.addEventListener("keydown", (event) =>
      event.stopPropagation(),
    );
    card.append(actionButton);
  }
  host.append(mark, svg, card);
  const hide = () => {
    mark.hidden = card.hidden = true;
    svg.style.display = "none";
  };
  hide();
  return {
    hide,
    focusAction: () => actionButton?.focus({ preventScroll: true }),
    show(
      target: HTMLElement,
      info: ControlHelp,
      bottom = 12,
      obstacles: HelpRect[] = [],
    ) {
      const r = rectOf(target.getBoundingClientRect());
      if (
        !target.isConnected ||
        r.y + r.height <= 0 ||
        r.y >= innerHeight ||
        r.x + r.width <= 0 ||
        r.x >= innerWidth
      ) {
        hide();
        return;
      }
      title.textContent = info.title;
      body.textContent = info.body;
      body.hidden = !info.body || info.body === info.title;
      card.hidden = mark.hidden = false;
      svg.style.display = "";
      const viewport = {
        x: 12,
        y: 12,
        width: Math.max(1, innerWidth - 24),
        height: Math.max(1, innerHeight - bottom - 24),
      };
      card.style.width = `${Math.min(300, viewport.width)}px`;
      card.style.maxHeight = `${Math.max(60, viewport.height / 2)}px`;
      const width = card.offsetWidth || Math.min(300, viewport.width),
        height = card.offsetHeight || 100;
      const p = placeHelpBubble(r, width, height, viewport, [r, ...obstacles]);
      // On a very small viewport, use a bounded card without a misleading tail.
      const x = p?.x ?? viewport.x,
        y = p?.y ?? viewport.y;
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
      mark.style.cssText = `left:${r.x - 3}px;top:${r.y - 3}px;width:${r.width + 6}px;height:${r.height + 6}px`;
      if (!p) {
        svg.style.display = "none";
        return;
      }
      const clamp = (n: number, lo: number, hi: number) =>
        Math.max(lo, Math.min(hi, n));
      const horizontal = p.side === "top" || p.side === "bottom";
      const bx = horizontal
        ? clamp(r.x + r.width / 2, p.x + 20, p.x + p.width - 20)
        : p.side === "left"
          ? p.x
          : p.x + p.width;
      const by = horizontal
        ? p.side === "top"
          ? p.y
          : p.y + p.height
        : clamp(r.y + r.height / 2, p.y + 20, p.y + p.height - 20);
      const tx = horizontal
        ? clamp(bx, r.x, r.x + r.width)
        : p.side === "left"
          ? r.x + r.width
          : r.x;
      const ty = horizontal
        ? p.side === "top"
          ? r.y + r.height
          : r.y
        : clamp(by, r.y, r.y + r.height);
      tail.setAttribute(
        "points",
        horizontal
          ? `${bx - 8},${by} ${tx},${ty} ${bx + 8},${by}`
          : `${bx},${by - 8} ${tx},${ty} ${bx},${by + 8}`,
      );
    },
  };
}
