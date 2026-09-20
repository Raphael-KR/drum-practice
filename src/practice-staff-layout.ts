import { displayPage } from "./score-pages";
import { detectStaff } from './staff-geometry';
import type { Region } from './model';
export interface StaffPosition { top: number; gap: number }
/** Positions are fractions of source-page height, independent of a crop's width. */
export function measurePageStaff(image: HTMLImageElement, regions: Region[]): Map<string, StaffPosition> {
  const result = new Map<string, StaffPosition>();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  for (const r of regions) {
    canvas.width = Math.max(1, Math.round(r.w * image.naturalWidth));
    canvas.height = Math.max(1, Math.round(r.h * image.naturalHeight));
    ctx.drawImage(image, r.x * image.naturalWidth, r.y * image.naturalHeight,
      r.w * image.naturalWidth, r.h * image.naturalHeight, 0, 0, canvas.width, canvas.height);
    const staff = detectStaff(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
    if (!staff) throw Error(`${r.id}: SVG 오선 위치를 찾지 못했습니다.`);
    result.set(r.id, { top: r.y + staff.top / canvas.height * r.h, gap: staff.gap / canvas.height * r.h });
  }
  return result;
}
export function practiceStaffLayout(region: Region, staff: StaffPosition, width: number, budget: number) {
  const gap = Math.min(Math.max(50, budget) / 15, width / 25);
  const pageWidth = width / region.w, pageHeight = gap / staff.gap;
  return { height: gap * 15, size: `${pageWidth}px ${pageHeight}px`, position: `${-region.x * pageWidth}px ${7 * gap - staff.top * pageHeight}px` };
}

/** CSS scales page width and height independently to align variable-width bars. */
export async function practicePage(blob: Blob): Promise<Blob> {
  const page = await displayPage(blob);
  if (page.type !== 'image/svg+xml') return page;
  const doc = new DOMParser().parseFromString(await page.text(), 'image/svg+xml');
  doc.documentElement.setAttribute('preserveAspectRatio', 'none');
  doc.querySelectorAll('[data-score-heading]').forEach(e => e.remove());
  return new Blob([new XMLSerializer().serializeToString(doc)], { type: page.type });
}
