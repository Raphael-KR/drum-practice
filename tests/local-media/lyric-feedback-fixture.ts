import { readFileSync } from "node:fs";
import type { Song } from "../../src/model/model";

/** Reopen the real demo at the state before one feedback revision. */
export function songBeforeLyricFeedback(revision: string): Song {
  const song = JSON.parse(
    readFileSync("public/demo/song.json", "utf8"),
  ) as Song;
  const archive = song.lyricArchive?.find(
    (entry) => entry.revision === revision + "-before",
  );
  if (archive) song.lyrics = structuredClone(archive.lyrics);
  song.lyricShifts = song.lyricShifts?.filter((entry) => entry !== revision);
  return song;
}
