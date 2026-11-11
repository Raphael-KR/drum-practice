import { markerIcon } from "../../shared/ui/marker-icon";
import { t as i18nText } from "../../shared/i18n/i18n";
import { type Song, type Measure, type Region } from "../../model/model";
import { markedMeasureIndices } from "./marker-slots";
import type { HighlightPage } from "../score/note-highlight";
import type { practiceStaffLayout } from "../score/practice-staff-layout";
import { escapeHTML as esc } from "../../shared/ui/html";
export interface MeasureView {
  s: Song;
  m: Measure;
  i: number;
  width: number;
  r: Region;
  layout?: ReturnType<typeof practiceStaffLayout>;
  highlight?: HighlightPage;
  pageURL: string;
  pageRatio: number;
  isSVG: boolean;
}
export function renderMeasure({
  s,
  m,
  i,
  width,
  r,
  layout,
  highlight,
  pageURL,
  pageRatio,
  isSVG,
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
  // CSS background images can round large SVG pages and their offsets
  // independently. A shared SVG viewport keeps the third staff line aligned.
  let engraving = "";
  if (isSVG && layout) {
    const [pageWidth, pageHeight] = layout.size.split(" ").map(parseFloat);
    const [x, y] = layout.position.split(" ").map(parseFloat);
    engraving = `<svg class="score-engraving" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 ${width} ${height}"><image href="${esc(pageURL)}" x="${x}" y="${y}" width="${pageWidth}" height="${pageHeight}" preserveAspectRatio="none"/></svg>`;
  }
  let overlay = "";
  if (isSVG && highlight?.measures.has(i)) {
    const scaledHeight = layout
      ? Number(layout.size.split(" ")[1].replace("px", ""))
      : height / r.h;
    const offsetY = layout
      ? Number(layout.position.split(" ")[1].replace("px", ""))
      : -r.y * scaledHeight;
    overlay = `<svg class="note-highlight" aria-hidden="true" data-highlight-measure="${i}" preserveAspectRatio="none" viewBox="${r.x * highlight.width} ${(highlight.originY ?? 0) + (-offsetY / scaledHeight) * highlight.height} ${r.w * highlight.width} ${(height / scaledHeight) * highlight.height}">${highlight.measures.get(i)}</svg>`;
  }
  return (
    '<div class="measure' +
    (markedMeasureIndices(s).has(i) ? " is-marked" : "") +
    '" data-index="' +
    String(i) +
    '" style="width:' +
    String(width) +
    'px"><span class="measure-state-layer" aria-hidden="true"></span><span class="label"><span class="measure-marker" aria-label="' +
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
    '</small></span><div class="crop"' +
    (layout ? ` data-staff-middle="${layout.staffMiddle}"` : "") +
    ' style="' +
    String(trim) +
    "width:" +
    String(width) +
    "px;height:" +
    String(height) +
    "px;" +
    (engraving ? "" : `background-image:url('${pageURL}');`) +
    "background-size:" +
    String(layout?.size ?? `${100 / r.w}% ${100 / r.h}%`) +
    ";background-position:" +
    String(
      layout?.position ??
        `${(r.x / (1 - r.w || 1)) * 100}% ${(r.y / (1 - r.h || 1)) * 100}%`,
    ) +
    '">' +
    engraving +
    String(overlay) +
    "</div></div>"
  );
}
