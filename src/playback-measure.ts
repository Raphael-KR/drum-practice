import { markerIcon } from "./marker-icon";
import { t as i18nText } from "./i18n";
import { xAtBeat, type Song, type Measure, type Region } from "./model";
import { markedMeasureIndices } from "./marker-slots";
import type { HighlightPage } from "./note-highlight";
import type { practiceStaffLayout } from "./practice-staff-layout";
import { escapeHTML as esc } from './html';
export interface MeasureView {
  s: Song;
  m: Measure;
  i: number;
  width: number;
  r: Region;
  ly: Song["lyrics"];
  layout?: ReturnType<typeof practiceStaffLayout>;
  highlight?: HighlightPage;
  pageURL: string;
  pageRatio: number;
  isSVG: boolean;
  positionInMeasure: (index: number, beat: number, width: number) => number;
}
export function renderMeasure({
  s,
  m,
  i,
  width,
  r,
  ly,
  layout,
  highlight,
  pageURL,
  pageRatio,
  isSVG,
  positionInMeasure,
}: MeasureView) {
  const height =
    layout?.height ?? (width > 1 ? (width / r.w) * r.h * pageRatio : 165);
  // Two-row alignment keeps a shared height; mask ink outside this source system.
  let trim = "";
  if (layout) {
    const pageHeight = parseFloat(layout.size.split(" ")[1]);
    const offset = parseFloat(layout.position.split(" ")[1]);
    const top = Math.max(0, r.y * pageHeight + offset);
    const bottom = Math.max(0, height - ((r.y + r.h) * pageHeight + offset));
    trim = `clip-path:inset(${top}px 0 ${bottom}px 0);`;
  }
  let overlay = "";
  if (isSVG && highlight?.measures.has(i)) {
    const scaledHeight = layout
      ? Number(layout.size.split(" ")[1].replace("px", ""))
      : height / r.h;
    const offsetY = layout
      ? Number(layout.position.split(" ")[1].replace("px", ""))
      : -r.y * scaledHeight;
    overlay = `<svg class="note-highlight" aria-hidden="true" data-highlight-measure="${i}" preserveAspectRatio="none" viewBox="${r.x * highlight.width} ${(-offsetY / scaledHeight) * highlight.height} ${r.w * highlight.width} ${(height / scaledHeight) * highlight.height}">${highlight.measures.get(i)}</svg>`;
  }
  const syl = ly
    .map((l) => {
      const b = ((l.time - m.start) / (m.end - m.start)) * m.beats;
      const x =
        s.settings.view === "ribbon"
          ? positionInMeasure(i, b, width) / width
          : xAtBeat(r, m, b);
      return `<span class="syllable" title="${l.confirmed ? i18nText("main.message232") : i18nText("main.message233")}" style="left:${x * 100}%;${l.text.length > 4 ? "font-size:14px;white-space:normal;max-width:95%;transform:none;" : ""}">${esc(l.text)}</span>`;
    })
    .join("");
  return (
    '<div class="measure" data-index="' +
    String(i) +
    '" style="width:' +
    String(width) +
    'px"><span class="label"><span class="measure-marker" aria-label="' +
    i18nText("main.message234") +
    '" ' +
    String(markedMeasureIndices(s).has(i) ? "" : "hidden") +
    ">" +
    markerIcon +
    "</span>" +
    i18nText("main.message235", { value4: esc(m.label) }) +
    '<span class="measure-beat" aria-label="' +
    i18nText("main.message236") +
    '">1</span><small class="measure-signature">' +
    String(m.beats) +
    "/" +
    String(m.denominator) +
    '</small></span><div class="crop" style="' +
    String(trim) +
    "width:" +
    String(width) +
    "px;height:" +
    String(height) +
    "px;background-image:url('" +
    String(pageURL) +
    "');background-size:" +
    String(layout?.size ?? `${100 / r.w}% ${100 / r.h}%`) +
    ";background-position:" +
    String(
      layout?.position ??
        `${(r.x / (1 - r.w || 1)) * 100}% ${(r.y / (1 - r.h || 1)) * 100}%`,
    ) +
    '">' +
    String(overlay) +
    '</div><div class="lyrics" style="top:' +
    String(height + 6) +
    'px">' +
    String(syl) +
    "</div></div>"
  );
}
