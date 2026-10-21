import {
  readPreference,
  writePreference,
} from "../../platform/storage/preference-storage";
export type TitleOrder = "title-first" | "artist-first";
const KEY = "drum-practice.title-order";
let cached: TitleOrder | undefined;
export function readTitleOrder(): TitleOrder {
  if (cached) return cached;
  try {
    cached =
      readPreference(KEY) === "artist-first" ? "artist-first" : "title-first";
  } catch {
    cached = "title-first";
  }
  return cached;
}
export function saveTitleOrder(order: TitleOrder) {
  writePreference(KEY, order);
  cached = order;
}
export function formatSongTitle(
  song: { title: string; artist?: string },
  order = readTitleOrder(),
) {
  return (
    order === "artist-first"
      ? [song.artist, song.title]
      : [song.title, song.artist]
  )
    .filter(Boolean)
    .join(" - ");
}
