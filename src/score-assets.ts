import type { RecordData } from "./storage";
import { songScores } from "./song-scores";
export function hasLyrics(r?: RecordData): boolean {
  if (!r) return false;
  if (r.song.lyricText?.trim() || r.song.lyrics.some((l) => l.text.trim()))
    return true;
  if (!r.canonicalXML) return false;
  const doc = new DOMParser().parseFromString(
    r.canonicalXML,
    "application/xml",
  );
  return [...doc.querySelectorAll("lyric > text")].some((n) =>
    n.textContent?.trim(),
  );
}
export function scoreAssets(r?: RecordData) {
  const formats = r ? songScores(r).map((s) => s.format) : [];
  return {
    musicxml: !!r?.canonicalXML || formats.includes("musicxml"),
    pdf: formats.includes("pdf"),
    lyrics: hasLyrics(r),
    audio: !!r?.audio.size,
  };
}
