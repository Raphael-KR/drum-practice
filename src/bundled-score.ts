import { t as i18nText } from "./i18n";
import { matchBundledPDFLayout } from "./score-system-layout";
import type { RecordData } from "./storage";
import { activeScore, songScores } from "./song-scores";
import { replaceWithMusicXML } from "./score-import";
import {
  writeCanonical,
  hasDrumNotation,
  metadataFromXML,
} from "./canonical-xml";
const sourcePDFHash =
  "33a98caa89daee7c5d9d56f272f73f0f8f6e9cb6526fe80af6c5f798807bcefd";
const bundledXMLHash =
  "31d6e7d3eec6655950abf74679595b4b8bfb721d584a1acd3fafd10e7aa3727a";
async function hash(blob: Blob) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()),
    ),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
}
/** Repair only the identifiable legacy demo metadata, preserving later user edits. */
export async function repairBundledMetadata(
  record: RecordData,
): Promise<boolean> {
  const s = record.song;
  if (
    s.id !== "real-paradis" ||
    s.composer ||
    s.lyricist ||
    (s.artist && s.artist !== "Real Paradis")
  )
    return false;
  const pdf = songScores(record).find((score) => score.format === "pdf");
  if (!pdf || (await hash(pdf.source)) !== sourcePDFHash) return false;
  const response = await fetch("/demo/score.musicxml");
  if (!response.ok) return false;
  const blob = await response.blob();
  if ((await hash(blob)) !== bundledXMLHash) return false;
  const meta = metadataFromXML(await blob.text());
  if (s.originalTitle && s.originalTitle !== meta.title) return false;
  s.originalTitle = meta.originalTitle;
  s.artist = meta.artist;
  s.composer = meta.composer;
  s.lyricist = meta.lyricist;
  record.canonicalXML = writeCanonical(structuredClone(s), record.canonicalXML);
  return true;
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
  progress(i18nText("bundled-score.message007"));
  let text: string;
  if (record.canonicalXML && hasDrumNotation(record.canonicalXML))
    text = record.canonicalXML;
  else {
    const response = await fetch("/demo/score.musicxml");
    if (!response.ok) throw Error(i18nText("bundled-score.message008"));
    const blob = await response.blob();
    if ((await hash(blob)) !== bundledXMLHash)
      throw Error(i18nText("bundled-score.message009"));
    text = await blob.text();
  }
  const metadata = metadataFromXML(text);
  for (const key of [
    "originalTitle",
    "artist",
    "composer",
    "lyricist",
  ] as const)
    record.song[key] ||= metadata[key];
  text = matchBundledPDFLayout(text).text;
  const source = new Blob([text], {
    type: "application/vnd.recordare.musicxml+xml",
  });
  const { renderMusicXML } = await import("./musicxml");
  const rendered = await renderMusicXML(source, progress);
  const song = replaceWithMusicXML(
    record.song,
    rendered,
    i18nText("bundled-score.message010"),
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
