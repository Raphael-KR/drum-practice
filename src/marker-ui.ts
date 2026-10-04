import { markerIcon, markerButtonBackground } from "./marker-icon";
import { sortedMarkerSlots, markedMeasureIndices } from "./marker-slots";
import { locate, type Song } from "./model";
import { t } from "./i18n";
import { escapeHTML as escape } from './html';
export function markerSlotsHTML(s: Song, attribute: string, byIndex = false) {
  return sortedMarkerSlots(s)
    .map((m, i) => {
      const label = m ? (locate(s, m.time).measure?.label ?? "") : "";
      return m
        ? `<button type="button" ${attribute}="${escape(byIndex ? String(i) : m.id)}" aria-label="${escape(t("main.message272", { value2: label }))}"><span>${escape(label)}</span>${markerButtonBackground}</button>`
        : `<button type="button" class="empty-marker-slot" aria-label="${escape(t("marker.current.add"))}" title="${escape(t("marker.current.add"))}">${markerIcon}</button>`;
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
  selection?: { current(): number; remove(id: string): void; toggleCurrent?(): void },
) {
  const listener = (e: MouseEvent) => {
    const empty = (e.target as Element).closest<HTMLElement>(".empty-marker-slot");
    if (empty && root.contains(empty)) {
      if (selection && !markedMeasureIndices(song()).has(locate(song(), selection.current()).index))
        selection.toggleCurrent?.();
      return;
    }
    const button = (e.target as Element).closest<HTMLElement>(`[${attribute}]`);
    if (!button || !root.contains(button)) return;
    const s = song(),
      value = button.getAttribute(attribute),
      marker = byIndex
        ? sortedMarkerSlots(s)[Number(value)]
        : s.markers.find((m) => m.id === value);
    if (marker) {
      const target = locate(s, marker.time);
      if (selection && locate(s, selection.current()).index === target.index) selection.remove(marker.id);
      else seek(target.measure.start);
    }
  };
  root.addEventListener("click", listener);
  return () => root.removeEventListener("click", listener);
}
