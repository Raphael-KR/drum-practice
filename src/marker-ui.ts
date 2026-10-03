import { sortedMarkerSlots, markedMeasureIndices } from "./marker-slots";
import { locate, type Song } from "./model";
import { t } from "./i18n";
import { escapeHTML as escape } from './html';
export function markerSlotsHTML(s: Song, attribute: string, byIndex = false) {
  return sortedMarkerSlots(s)
    .map((m, i) => {
      const label = m ? (locate(s, m.time).measure?.label ?? "") : "";
      return m
        ? `<button type="button" ${attribute}="${escape(byIndex ? String(i) : m.id)}" aria-label="${escape(t("main.message272", { value2: label }))}">${escape(label)}</button>`
        : `<button type="button" class="empty-marker-slot" disabled aria-label="${escape(t("main.message273", { value1: i + 1 }))}">—</button>`;
    })
    .join("");
}
export function syncMarkerBadges(root: HTMLElement, s: Song) {
  const marked = markedMeasureIndices(s);
  root.querySelectorAll<HTMLElement>("[data-index]").forEach((el) => {
    const badge = el.querySelector<HTMLElement>(".measure-marker");
    const isMarked = marked.has(Number(el.dataset.index));
    el.classList.toggle("is-marked", isMarked);
    if (badge) badge.hidden = !isMarked;
  });
}
export function bindMarkerSlots(
  root: HTMLElement,
  song: () => Song,
  seek: (time: number) => void,
  attribute: string,
  byIndex = false,
) {
  const listener = (e: MouseEvent) => {
    const button = (e.target as Element).closest<HTMLElement>(`[${attribute}]`);
    if (!button || !root.contains(button)) return;
    const s = song(),
      value = button.getAttribute(attribute),
      marker = byIndex
        ? sortedMarkerSlots(s)[Number(value)]
        : s.markers.find((m) => m.id === value);
    if (marker) seek(locate(s, marker.time).measure.start);
  };
  root.addEventListener("click", listener);
  return () => root.removeEventListener("click", listener);
}
