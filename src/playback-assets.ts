import type { Song } from "./model";
import { highlightPage, type HighlightPage } from "./note-highlight";
import {
  practicePage,
  measurePageStaff,
  framePDFStaffs,
  type StaffPosition,
} from "./practice-staff-layout";
export interface PlaybackAssets {
  urls: string[];
  pageRatios: number[];
  highlightPages: (HighlightPage | undefined)[];
  practiceStaffs: Map<string, StaffPosition>;
}
export function releasePlaybackAssets(assets: Pick<PlaybackAssets, "urls">) {
  assets.urls.forEach((url) => URL.revokeObjectURL(url));
}
/** Prepare transactionally: callers retain their current assets until this succeeds. */
export async function preparePlaybackAssets(
  pages: Blob[],
  song: Song,
  options: {
    validate?: (page: Blob) => Promise<void>;
    decodeError?: (cause: unknown, index: number) => Error;
  } = {},
): Promise<PlaybackAssets> {
  const result: PlaybackAssets = {
    urls: [],
    pageRatios: [],
    highlightPages: [],
    practiceStaffs: new Map(),
  };
  try {
    for (const [index, blob] of pages.entries()) {
      const page = await practicePage(blob);
      await options.validate?.(page);
      result.highlightPages.push(await highlightPage(blob));
      const url = URL.createObjectURL(page);
      result.urls.push(url);
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
      framePDFStaffs(song.regions, result.practiceStaffs);
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
  current.practiceStaffs.clear();
  next.practiceStaffs.forEach((v, k) => current.practiceStaffs.set(k, v));
}
