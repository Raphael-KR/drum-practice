import {
  RIBBON_HEAD_ANCHOR,
  RIBBON_TIMELINE_VERSION,
  validateRibbonTimeline,
} from "../score/ribbon-timeline";
import { displayPage } from "../score/score-pages";
import type { Song, Region } from "../../model/model";
import { displayRegion } from "../score/score-view";
import { highlightPage, type HighlightPage } from "../score/note-highlight";
import {
  practicePage,
  measurePageStaff,
  framePracticeStaffs,
  type StaffPosition,
} from "../score/practice-staff-layout";
export interface RibbonAsset {
  row?: RibbonAsset;
  grid?: RibbonAsset;
  region: Region;
  phase: number;
  staff: StaffPosition;
  url: string;
  ratio: number;
  highlight?: HighlightPage;
}
/** Select native geometry matching the view's bar widths; retain legacy fallbacks. */
export function selectPlaybackEngraving(
  asset: RibbonAsset | undefined,
  uniform = false,
  view = "rows",
) {
  return (
    (uniform ? asset?.grid : undefined) ??
    (view === "ribbon" ? asset : (asset?.row ?? asset))
  );
}
export interface PlaybackAssets {
  urls: string[];
  pageRatios: number[];
  highlightPages: (HighlightPage | undefined)[];
  practiceStaffs: Map<string, StaffPosition>;
  ribbon?: Map<number, RibbonAsset>;
}
export function releasePlaybackAssets(
  assets: Pick<PlaybackAssets, "urls" | "ribbon">,
) {
  assets.urls.forEach((url) => URL.revokeObjectURL(url));
  new Set(
    Array.from(assets.ribbon?.values() ?? []).flatMap((a) => [
      a.url,
      ...(a.row ? [a.row.url] : []),
      ...(a.grid ? [a.grid.url] : []),
    ]),
  ).forEach((url) => URL.revokeObjectURL(url));
}
/** Prepare transactionally: callers retain their current assets until this succeeds. */
export async function preparePlaybackAssets(
  pages: Blob[],
  song: Song,
  options: {
    validate?: (page: Blob) => Promise<void>;
    decodeError?: (cause: unknown, index: number) => Error;
    nativeStaffs?: Map<string, StaffPosition>;
  } = {},
  allowRibbon = true,
): Promise<PlaybackAssets> {
  const result: PlaybackAssets = {
    urls: [],
    pageRatios: [],
    highlightPages: [],
    practiceStaffs: new Map(),
    ribbon: new Map(),
  };
  try {
    pages = await Promise.all(pages.map(displayPage));
    let timeline: import("../score/ribbon-timeline").RibbonTimeline | undefined;
    let nativeStaffs = options.nativeStaffs;
    if (allowRibbon && song.scoreFormat === "musicxml" && pages[0]) {
      const source = await displayPage(pages[0]);
      const doc = new DOMParser().parseFromString(
        await source.text(),
        "image/svg+xml",
      );
      const metadata = doc.querySelector(
        `metadata[data-ribbon-timeline="${RIBBON_TIMELINE_VERSION}"]`,
      );
      if (metadata) {
        const parsed: unknown = JSON.parse(metadata.textContent || "{}");
        validateRibbonTimeline(parsed, song.measures.length);
        timeline = parsed;
        metadata.remove();
        pages[0] = new Blob([new XMLSerializer().serializeToString(doc)], {
          type: "image/svg+xml",
        });
        const printStaffs = timeline.printStaffs;
        if (
          Array.isArray(printStaffs) &&
          printStaffs.length === song.regions.length &&
          printStaffs.every(
            (s: StaffPosition) =>
              Number.isFinite(s.top) && Number.isFinite(s.gap) && s.gap > 0,
          )
        )
          nativeStaffs = new Map(
            song.regions.map((r, i) => [r.id, printStaffs[i]]),
          );
      }
    }
    for (const [index, blob] of pages.entries()) {
      const page = await practicePage(
        blob,
        song.regions
          .filter((r) => r.page === index)
          .map((r) => ({ source: r, display: displayRegion(song, r) })),
      );
      await options.validate?.(page);
      result.highlightPages.push(await highlightPage(blob));
      const url = URL.createObjectURL(page);
      result.urls.push(url);
      const regions = song.regions.filter((r) => r.page === index);
      if (
        song.scoreFormat === "musicxml" &&
        nativeStaffs &&
        regions.every((r) => nativeStaffs.has(r.id))
      ) {
        const svg = new DOMParser().parseFromString(
          await page.text(),
          "image/svg+xml",
        ).documentElement;
        const view = (svg.getAttribute("viewBox") || "")
          .trim()
          .split(/\s+/)
          .map(Number);
        if (view.length !== 4 || !(view[2] > 0 && view[3] > 0))
          throw Error("Invalid score viewBox");
        result.pageRatios.push(view[3] / view[2]);
        for (const r of regions)
          result.practiceStaffs.set(r.id, nativeStaffs.get(r.id)!);
        continue;
      }
      const img = new Image();
      img.src = url;
      try {
        await img.decode();
      } catch (cause) {
        throw options.decodeError?.(cause, index) ?? cause;
      }
      result.pageRatios.push(img.naturalHeight / img.naturalWidth);
      for (const [id, staff] of measurePageStaff(
        img,
        song.regions.filter((r) => r.page === index),
        song.scoreFormat !== "musicxml",
      ))
        result.practiceStaffs.set(id, staff);
    }
    if (song.scoreFormat !== "musicxml")
      framePracticeStaffs(song.regions, result.practiceStaffs);
    if (timeline) {
      for (const data of [
        timeline,
        ...(timeline.rows ? [timeline.rows] : []),
        ...(timeline.grid ? [timeline.grid] : []),
      ]) {
        const ribbonSong = { ...song, regions: data.regions };
        const pageHeights: number[] = [];
        const ratios = data.pages.map((text: string) => {
          const svg = new DOMParser().parseFromString(
            text,
            "image/svg+xml",
          ).documentElement;
          const view = (svg.getAttribute("viewBox") || "")
            .trim()
            .split(/\s+/)
            .map(Number);
          if (view.length !== 4 || !(view[2] > 0 && view[3] > 0))
            throw Error("Invalid ribbon viewBox");
          pageHeights.push(view[3]);
          return view[3] / view[2];
        });
        const prepared = await preparePlaybackAssets(
          data.pages.map(
            (s: string) => new Blob([s], { type: "image/svg+xml" }),
          ),
          ribbonSong,
          {
            ...options,
            nativeStaffs: new Map(
              data.regions.map((r: Region, i: number) => [
                r.id,
                data.staffs[i],
              ]),
            ),
          },
          false,
        );
        try {
          // Native words can extend above the default seven-space frame.
          // Keep complete source-system crops visible without changing glyph scale.
          framePracticeStaffs(data.regions, prepared.practiceStaffs);
          data.regions.forEach((region: Region, index: number) => {
            const staff = prepared.practiceStaffs.get(region.id);
            if (!staff || !Number.isFinite(staff.top) || !(staff.gap > 0))
              throw Error("Missing ribbon staff geometry");
            const asset: RibbonAsset = {
              region,
              staff: {
                ...staff,
                nativePageRatio: ratios[region.page],
                ribbonQuarterInGaps:
                  data.quarter / (staff.gap * pageHeights[region.page]),
              },
              phase:
                (data.offset + RIBBON_HEAD_ANCHOR) /
                ((data.uniformQuarters ??
                  (song.measures[index].beats * 4) /
                    song.measures[index].denominator) *
                  data.quarter),
              url: prepared.urls[region.page],
              ratio: ratios[region.page],
              highlight: prepared.highlightPages[region.page],
            };
            if (data === timeline) result.ribbon!.set(index, asset);
            else if (data === timeline.grid)
              result.ribbon!.get(index)!.grid = asset;
            else result.ribbon!.get(index)!.row = asset;
          });
        } catch (error) {
          releasePlaybackAssets(prepared);
          throw error;
        }
      }
    }
    return result;
  } catch (error) {
    releasePlaybackAssets(result);
    throw error;
  }
}
/** Preserve array/map identities for readers already holding references. */
export function replacePlaybackAssets(
  current: PlaybackAssets,
  next: PlaybackAssets,
) {
  releasePlaybackAssets(current);
  current.urls.splice(0, current.urls.length, ...next.urls);
  current.pageRatios.splice(0, current.pageRatios.length, ...next.pageRatios);
  current.highlightPages.splice(
    0,
    current.highlightPages.length,
    ...next.highlightPages,
  );
  current.ribbon?.clear();
  next.ribbon?.forEach((v, k) => current.ribbon?.set(k, v));
  current.practiceStaffs.clear();
  next.practiceStaffs.forEach((v, k) => current.practiceStaffs.set(k, v));
}
