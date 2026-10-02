import { t as i18nText } from "./i18n";
import { displayPage } from "./score-pages";
import { detectStaff } from "./staff-geometry";
import type { Region } from "./model";
export interface StaffPosition {
  top: number;
  gap: number;
  frame?: { above: number; below: number };
}
/** Positions are fractions of source-page height, independent of a crop's width. */
export function measurePageStaff(
  image: HTMLImageElement,
  regions: Region[],
  optional = false,
): Map<string, StaffPosition> {
  const result = new Map<string, StaffPosition>();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const rows = new Map<string, StaffPosition | undefined>();
  for (const r of regions) {
    const rowKey = `${r.page}:${r.y}:${r.h}`;
    if (optional && rows.has(rowKey)) {
      const cached = rows.get(rowKey);
      if (cached) result.set(r.id, cached);
      continue;
    }
    const row = optional ? regions.filter(other =>
      other.page === r.page && Math.abs(other.y-r.y) < 1e-6 && Math.abs(other.h-r.h) < 1e-6,
    ) : [r];
    const left = Math.min(...row.map(other => other.x));
    const width = Math.max(...row.map(other => other.x + other.w)) - left;
    canvas.width = Math.max(1, Math.round(width * image.naturalWidth));
    canvas.height = Math.max(1, Math.round(r.h * image.naturalHeight));
    ctx.drawImage(
      image,
      left * image.naturalWidth,
      r.y * image.naturalHeight,
      width * image.naturalWidth,
      r.h * image.naturalHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    const staff = detectStaff(
      ctx.getImageData(0, 0, canvas.width, canvas.height).data,
      canvas.width,
      canvas.height,
    );
    if (!staff && optional) { rows.set(rowKey, undefined); continue; }
    if (!staff)
      throw Error(
        i18nText("practice-staff-layout.message478", { value1: r.id }),
      );
    const position = {
      top: r.y + (staff.top / canvas.height) * r.h,
      gap: (staff.gap / canvas.height) * r.h,
    };
    result.set(r.id, position);
    if (optional) rows.set(rowKey, position);
  }
  return result;
}
/** Keep every PDF crop (including printed lyrics) inside one shared staff frame.
 * Partial detection falls back for the whole score to avoid mixed scales. */
export function framePDFStaffs(regions: Region[], staffs: Map<string, StaffPosition>) {
  if (regions.some(r => !staffs.has(r.id))) {
    staffs.clear();
    return;
  }
  const frame = { above: 7, below: 8 };
  for (const r of regions) {
    const s = staffs.get(r.id)!;
    frame.above = Math.max(frame.above, (s.top - r.y) / s.gap);
    frame.below = Math.max(frame.below, (r.y + r.h - s.top) / s.gap);
  }
  staffs.forEach(s => { s.frame = frame; });
}
export function staffFrameHeight(staff: StaffPosition) {
  return staff.frame ? staff.frame.above + staff.frame.below : 15;
}
export function practiceStaffLayout(
  region: Region,
  staff: StaffPosition,
  width: number,
  budget: number,
) {
  const frameHeight = staffFrameHeight(staff);
  const gap = Math.min(Math.max(50, budget) / frameHeight, width / 25);
  const pageWidth = width / region.w,
    pageHeight = gap / staff.gap;
  return {
    height: gap * frameHeight,
    size: `${pageWidth}px ${pageHeight}px`,
    position: `${-region.x * pageWidth}px ${(staff.frame?.above ?? 7) * gap - staff.top * pageHeight}px`,
  };
}

/** CSS scales page width and height independently to align variable-width bars. */
export async function practicePage(blob: Blob): Promise<Blob> {
  const page = await displayPage(blob);
  if (page.type !== "image/svg+xml") return page;
  const doc = new DOMParser().parseFromString(
    await page.text(),
    "image/svg+xml",
  );
  doc.documentElement.setAttribute("preserveAspectRatio", "none");
  doc.querySelectorAll("[data-score-heading]").forEach((e) => e.remove());
  return new Blob([new XMLSerializer().serializeToString(doc)], {
    type: page.type,
  });
}
