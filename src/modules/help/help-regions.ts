import catalog from "../../shared/ui/ui-catalog.json";
import { componentName } from "../../shared/ui/ui-standard";

/** Help-only outlines use the same component names as accessibility and documentation. */
export function createHelpRegions(host: HTMLElement, root: HTMLElement) {
  const layer = document.createElement("div");
  layer.className = "help-regions";
  host.append(layer);
  return {
    paint(selected: boolean) {
      layer.hidden = selected;
      if (selected) return;
      const marks: HTMLElement[] = [];
      for (const entry of catalog.components) {
        if (!("helpRegion" in entry) || !entry.helpRegion) continue;
        const selector = [...new Set(Object.values(entry.selectors))]
          .filter(Boolean)
          .join(",");
        for (const target of root.querySelectorAll<HTMLElement>(selector)) {
          let r = target.getBoundingClientRect();
          // Flex spacers and absolutely positioned transport buttons extend beyond their wrappers.
          if ("helpBounds" in entry && entry.helpBounds === "children") {
            const boxes = [...target.children]
              .map((child) => child.getBoundingClientRect())
              .filter((box) => box.width && box.height);
            if (!boxes.length) continue;
            const left = Math.min(...boxes.map((box) => box.left));
            const top = Math.min(...boxes.map((box) => box.top));
            r = new DOMRect(
              left,
              top,
              Math.max(...boxes.map((box) => box.right)) - left,
              Math.max(...boxes.map((box) => box.bottom)) - top,
            );
          }
          if (
            target.closest("[hidden],dialog:not([open])") ||
            !r.width ||
            !r.height ||
            r.bottom <= 0 ||
            r.top >= innerHeight ||
            r.right <= 0 ||
            r.left >= innerWidth
          )
            continue;
          const mark = document.createElement("div");
          mark.className = "help-region";
          mark.dataset.component = entry.id;
          const left = Math.max(2, r.left),
            top = Math.max(12, r.top);
          mark.style.cssText = `left:${left}px;top:${top}px;width:${Math.max(0, Math.min(innerWidth - 2, r.right) - left)}px;height:${Math.max(0, Math.min(innerHeight - 2, r.bottom) - top)}px`;
          const name = document.createElement("span");
          name.className = "help-region-name";
          name.textContent = componentName(entry.id);
          mark.append(name);
          marks.push(mark);
        }
      }
      layer.replaceChildren(...marks);
    },
  };
}
