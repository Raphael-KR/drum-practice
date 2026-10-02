import { encodeAsset, decodeAsset as decode } from "./binary-asset";
import { t as i18nText } from "./i18n";
import { validateSong, type Song } from "./model";
import type { ScoreVariant } from "./song-scores";
import type { RecordData } from "./storage";

export const isPortable =
  typeof document !== "undefined" && !!document.getElementById("portable-data");
interface Asset {
  type: string;
  base64: string;
}
export interface PackedScore extends Omit<ScoreVariant, "source" | "pages"> {
  source: Asset;
  pages: Asset[];
}
export interface PortableSong {
  canonicalXML?: string;
  otherScores?: PackedScore[];
  version: 1;
  song: Song;
  pdf: Asset;
  audio: Asset;
  pages: Asset[];
}
export interface PortableShell {
  runtime: string;
  css: string;
  worker: string;
  licenses: string;
}
const encode = (blob: Blob) => encodeAsset(blob, "application/octet-stream");
export async function packScores(
  scores: ScoreVariant[] = [],
): Promise<PackedScore[]> {
  return Promise.all(
    scores.map(async (s) => ({
      ...s,
      source: await encode(s.source),
      pages: await Promise.all(s.pages.map(encode)),
    })),
  );
}
export function unpackScores(scores: PackedScore[] = []): ScoreVariant[] {
  return scores.map((s) => {
    if (!["pdf", "musicxml"].includes(s.format) || !s.pages.length)
      throw Error(i18nText("portable.message470"));
    return { ...s, source: decode(s.source), pages: s.pages.map(decode) };
  });
}
export async function packSong(record: RecordData): Promise<PortableSong> {
  validateSong(record.song);
  return {
    version: 1,
    otherScores: await packScores(record.otherScores),
    song: structuredClone(record.song),
    canonicalXML: record.canonicalXML,
    pdf: await encode(record.pdf),
    audio: await encode(record.audio),
    pages: await Promise.all(record.pages.map(encode)),
  };
}
export function unpackSong(data: PortableSong): RecordData {
  if (data.version !== 1) throw Error(i18nText("portable.message471"));
  validateSong(data.song);
  if (data.pages.length !== data.song.pageCount)
    throw Error(i18nText("playback-export.message423"));
  return {
    song: data.song,
    canonicalXML: data.canonicalXML,
    otherScores: unpackScores(data.otherScores),
    pdf: decode(data.pdf),
    audio: decode(data.audio),
    pages: data.pages.map(decode),
  };
}
function json(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
export function makePortableHTML(
  shell: PortableShell,
  data: PortableSong | null,
) {
  if (/<\/script/i.test(shell.runtime) || /<\/style/i.test(shell.css))
    throw Error(i18nText("portable.message472"));
  return (
    '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>' +
    i18nText("portable.message473") +
    '</title><style id="portable-style">' +
    String(shell.css) +
    '</style></head><body>\n<div id="app"><main><h1>' +
    i18nText("portable.message474") +
    "</h1><p>" +
    i18nText("portable.message475") +
    "</p><p>" +
    i18nText("portable.message476") +
    '</p></main></div>\n<script id="portable-data" type="application/json">' +
    String(json(data)) +
    '</script>\n<script id="portable-worker" type="application/json">' +
    String(json(shell.worker)) +
    '</script>\n<script id="portable-licenses" type="application/json">' +
    String(json(shell.licenses)) +
    '</script>\n<script id="portable-runtime">' +
    String(shell.runtime) +
    "</script></body></html>"
  );
}
export function shellFromDocument(doc: Document): PortableShell {
  return {
    runtime: doc.getElementById("portable-runtime")!.textContent!,
    css: doc.getElementById("portable-style")!.textContent!,
    worker: JSON.parse(doc.getElementById("portable-worker")!.textContent!),
    licenses: JSON.parse(doc.getElementById("portable-licenses")!.textContent!),
  };
}
export { portableWorkerURL } from "./audio-worker";
