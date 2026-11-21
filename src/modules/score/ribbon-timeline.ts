import type { Region } from "../../model/model";
import type { StaffPosition } from "./practice-staff-layout";
export const RIBBON_TIMELINE_VERSION = 2;

/** Keep the shared start fraction and distribute the remaining width by time. */
export function gridPhase(quarter: number, duration: number, start: number) {
  return start + ((1 - start) * quarter) / duration;
}
export interface RibbonTimeline {
  version: number;
  quarter: number;
  offset: number;
  regions: Region[];
  staffs: StaffPosition[];
  printStaffs?: StaffPosition[];
  pages: string[];
}
export function validateRibbonTimeline(
  data: unknown,
  count: number,
): asserts data is RibbonTimeline {
  const d = data as RibbonTimeline;
  if (
    !d ||
    d.version !== RIBBON_TIMELINE_VERSION ||
    !Number.isFinite(d.quarter) ||
    d.quarter <= 0 ||
    !Number.isFinite(d.offset) ||
    d.offset < 0 ||
    !Array.isArray(d.pages) ||
    !d.pages.length ||
    d.pages.length > count ||
    d.pages.some((p) => typeof p !== "string") ||
    !Array.isArray(d.regions) ||
    d.regions.length !== count ||
    !Array.isArray(d.staffs) ||
    d.staffs.length !== count
  )
    throw Error("Invalid SVG ribbon timeline");
  d.regions.forEach((r, i) => {
    const s = d.staffs[i];
    if (
      !r ||
      typeof r.id !== "string" ||
      !Number.isInteger(r.page) ||
      r.page < 0 ||
      r.page >= d.pages.length ||
      ![r.x, r.y, r.w, r.h].every(Number.isFinite) ||
      r.x < 0 ||
      r.y < 0 ||
      r.w <= 0 ||
      r.h <= 0 ||
      r.x + r.w > 1.000001 ||
      r.y + r.h > 1.000001 ||
      !Array.isArray(r.beatXs) ||
      r.beatXs.length < 2 ||
      !r.beatXs.every(Number.isFinite) ||
      !s ||
      !Number.isFinite(s.top) ||
      !Number.isFinite(s.gap) ||
      s.gap <= 0
    )
      throw Error("Invalid ribbon measure geometry");
  });
  if (new Set(d.regions.map((r) => r.page)).size !== d.pages.length)
    throw Error("Unused ribbon page");
}
