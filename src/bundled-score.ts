import type { RecordData } from "./storage";
import { activeScore, songScores } from "./song-scores";
import { replaceWithMusicXML } from "./score-import";
import { writeCanonical, hasDrumNotation } from "./canonical-xml";
const sourcePDFHash =
  "33a98caa89daee7c5d9d56f272f73f0f8f6e9cb6526fe80af6c5f798807bcefd";
const bundledXMLHash =
  "d5033d473bef0a63d2ded5f2e09234b168b7306d1872fdce9981d9864516f8f6";
async function hash(blob: Blob) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()),
    ),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
}
/** Add the app's own conversion to the known source song, never replace user XML. */
export async function attachBundledScore(
  record: RecordData,
  progress: (s: string) => void,
): Promise<RecordData> {
  if (
    record.song.id !== "real-paradis" ||
    songScores(record).some((s) => s.format === "musicxml")
  )
    return record;
  if ((await hash(record.pdf)) !== sourcePDFHash) return record;
  progress("이 곡의 MusicXML 악보를 준비하는 중입니다.");
  let text: string;
  if (record.canonicalXML && hasDrumNotation(record.canonicalXML))
    text = record.canonicalXML;
  else {
    const response = await fetch("/demo/score.musicxml");
    if (!response.ok)
      throw Error("앱에 포함된 MusicXML 악보를 불러오지 못했습니다.");
    const blob = await response.blob();
    if ((await hash(blob)) !== bundledXMLHash)
      throw Error("앱에 포함된 MusicXML 악보의 버전이 다릅니다.");
    text = await blob.text();
  }
  const source = new Blob([text], {
    type: "application/vnd.recordare.musicxml+xml",
  });
  const { renderMusicXML } = await import("./musicxml");
  const rendered = await renderMusicXML(source, progress);
  const song = replaceWithMusicXML(
    record.song,
    rendered,
    "바람과 언덕의 발라드.musicxml",
  );
  const xml = activeScore({
    ...record,
    song,
    pdf: source,
    pages: rendered.pages,
  });
  return {
    ...record,
    otherScores: [...(record.otherScores ?? []), xml],
    canonicalXML: writeCanonical(structuredClone(record.song), text),
  };
}
