import { readFileSync } from "node:fs";
import type { Song } from "../../src/model/model";

/** Read preserved authoring history, not the final display groups shipped in v3. */
export function songBeforeLyricFeedback(revision: string): Song {
  const song = JSON.parse(
    readFileSync(
      "data/production/time-proportional-app-20261113/demo-before-song.json",
      "utf8",
    ),
  ) as Song;
  const archive = song.lyricArchive?.find(
    (entry) => entry.revision === revision + "-before",
  );
  if (archive) song.lyrics = structuredClone(archive.lyrics);
  song.lyricShifts = song.lyricShifts?.filter((entry) => entry !== revision);
  return song;
}
