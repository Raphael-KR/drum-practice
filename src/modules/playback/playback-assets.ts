import {
  RIBBON_TIMELINE_VERSION,
  validateRibbonTimeline,
} from "../score/ribbon-timeline";
import { displayPage } from "../score/score-pages";
import { parsePlaybackSVG } from "./playback-svg";
import type { Song, Region } from "../../model/model";
import { displayRegion } from "../score/score-view";
import { highlightPage, type HighlightPage } from "../score/note-highlight";
import {
  practicePage,
  measurePageStaff,
  framePracticeStaffs,
  MUSICXML_TOP_SPACES,
  type StaffPosition,
} from "../score/practice-staff-layout";
export interface RibbonAsset {
  region: Region;
  staff: StaffPosition;
  url: string;
  ratio: number;
  highlight?: HighlightPage;
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
    Array.from(assets.ribbon?.values() ?? [], (asset) => asset.url),
  ).forEach((url) => URL.revokeObjectURL(url));
}
/** Prepare transactionally: callers retain their current assets until this succeeds. */
export async function preparePlaybackAssets(
  pages: Blob[],
  song: Song,
  options: {
    validate?: (page: Blob, svg?: Document) => Promise<void>;
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
    let firstSVG: Document | undefined;
    if (allowRibbon && song.scoreFormat === "musicxml" && pages[0]) {
      const doc = parsePlaybackSVG(await pages[0].text());
      firstSVG = doc;
      const metadata = doc.querySelector(
        `metadata[data-ribbon-timeline="${RIBBON_TIMELINE_VERSION}"]`,
      );
      if (metadata) {
        const parsed: unknown = JSON.parse(metadata.textContent || "{}");
        validateRibbonTimeline(parsed, song.measures.length);
        timeline = parsed;
        metadata.remove();
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
      const svg =
        index === 0 && firstSVG
          ? firstSVG
          : blob.type === "image/svg+xml"
            ? parsePlaybackSVG(await blob.text())
            : undefined;
      firstSVG = undefined;
      // Extract highlights before practice-only heading/prefix adjustments.
      const highlight = await highlightPage(blob, svg);
      const page = await practicePage(
        blob,
        song.regions
          .filter((r) => r.page === index)
          .map((r) => ({ source: r, display: displayRegion(song, r) })),
        svg,
      );
      // Drop the large decoded metadata container once the practice copy exists.
      // This array is local; stored/source pages remain untouched.
      pages[index] = page;
      await options.validate?.(page, svg);
      result.highlightPages.push(highlight);
      const url = URL.createObjectURL(page);
      result.urls.push(url);
      const regions = song.regions.filter((r) => r.page === index);
      if (
        song.scoreFormat === "musicxml" &&
        nativeStaffs &&
        regions.every((r) => nativeStaffs.has(r.id))
      ) {
        const view = (svg?.documentElement.getAttribute("viewBox") || "")
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
      const ribbonSong = { ...song, regions: timeline.regions };
      const prepared = await preparePlaybackAssets(
        timeline.pages.map(
          (s: string) => new Blob([s], { type: "image/svg+xml" }),
        ),
        ribbonSong,
        {
          ...options,
          nativeStaffs: new Map(
            timeline.regions.map((r: Region, i: number) => [
              r.id,
              timeline.staffs[i],
            ]),
          ),
        },
        false,
      );
      try {
        const ratios = prepared.pageRatios;
        // Native words can extend above the minimum eight-space frame.
        // Keep complete source-system crops visible without changing glyph scale.
        framePracticeStaffs(
          timeline.regions,
          prepared.practiceStaffs,
          MUSICXML_TOP_SPACES,
        );
        timeline.regions.forEach((region: Region, index: number) => {
          const staff = prepared.practiceStaffs.get(region.id);
          if (!staff || !Number.isFinite(staff.top) || !(staff.gap > 0))
            throw Error("Missing ribbon staff geometry");
          const asset: RibbonAsset = {
            region,
            staff: {
              ...staff,
              nativePageRatio: ratios[region.page],
              ribbonQuarterInGaps:
                timeline.quarter /
                (staff.gap * prepared.highlightPages[region.page]!.height),
            },
            url: prepared.urls[region.page],
            ratio: ratios[region.page],
            highlight: prepared.highlightPages[region.page],
          };
          result.ribbon!.set(index, asset);
        });
      } catch (error) {
        releasePlaybackAssets(prepared);
        throw error;
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
