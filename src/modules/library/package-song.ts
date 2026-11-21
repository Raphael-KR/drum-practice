import type { Song } from "../../model/model";

/** Playback packages contain display groups, never the author's raw lyric sources. */
export function packageSong(song: Song): Song {
  const copy = structuredClone(song);
  delete copy.lyricText;
  delete copy.lyricArchive;
  return copy;
}

/** Geometry is a disposable browser cache; MusicXML packages carry its source only. */
export function packageRecord(record: import("../../model/record").RecordData) {
  const song = packageSong(record.song);
  const currentXML = song.scoreFormat === "musicxml";
  if (currentXML) {
    song.pageCount = 0;
    song.regions = [];
    song.measures = song.measures.map((m) => ({ ...m, regionId: "" }));
  }
  return {
    ...record,
    song,
    pages: currentXML ? [] : record.pages,
    otherScores: record.otherScores?.map((score) =>
      score.format === "musicxml"
        ? {
            ...score,
            pages: [],
            regions: [],
            measures: score.measures.map((m) => ({ ...m, regionId: "" })),
          }
        : score,
    ),
  };
}
