import JSZip from "jszip";
import { validateSong, type Song } from "./model";
import type { RecordData } from "./storage";
import type { ScoreVariant } from "./song-scores";

export const SCORE_PACKAGE_EXTENSION = ".drumscore";
const MAX_BYTES = 512 * 1024 * 1024;
const MAX_ENTRY = 256 * 1024 * 1024;
const MAX_ENTRIES = 1100;
interface Asset {
  path: string;
  type: string;
  size: number;
}
interface Variant extends Omit<ScoreVariant, "source" | "pages"> {
  source: Asset;
  pages: Asset[];
}
interface Manifest {
  format: "drumscore";
  version: 1;
  song: Song;
  source: Asset;
  audio: Asset;
  pages: Asset[];
  canonicalXML?: string;
  otherScores: Variant[];
}
function invalid(): never {
  throw new Error("Invalid or unsupported .drumscore package");
}
export function scoreStructureSignature(song: Song): string {
  return JSON.stringify(
    song.measures.map((m) => [m.id, m.beats, m.denominator]),
  );
}
function safePath(path: string): boolean {
  return (
    /^[a-zA-Z0-9._/-]+$/.test(path) &&
    !path.startsWith("/") &&
    path.split("/").every((p) => p && p !== "." && p !== "..")
  );
}
/** Read central-directory limits before JSZip allocates decompressed assets. ZIP64/multidisk are not part of v1. */
function inspectZip(bytes: Uint8Array, nestedMXL = false) {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = bytes.length - 22;
  while (
    end >= Math.max(0, bytes.length - 65557) &&
    v.getUint32(end, true) !== 0x06054b50
  )
    end--;
  if (
    end < 0 ||
    end < bytes.length - 65557 ||
    end + 22 + v.getUint16(end + 20, true) !== bytes.length
  )
    invalid();
  const count = v.getUint16(end + 10, true),
    start = v.getUint32(end + 16, true),
    length = v.getUint32(end + 12, true);
  if (
    v.getUint16(end + 4, true) ||
    v.getUint16(end + 6, true) ||
    v.getUint16(end + 8, true) !== count ||
    !count ||
    count > MAX_ENTRIES ||
    start + length !== end
  )
    invalid();
  let pos = start,
    total = 0;
  const entries = new Map<string, number>();
  for (let i = 0; i < count; i++) {
    if (pos + 46 > end || v.getUint32(pos, true) !== 0x02014b50) invalid();
    const flags = v.getUint16(pos + 8, true),
      method = v.getUint16(pos + 10, true),
      size = v.getUint32(pos + 24, true);
    const names = v.getUint16(pos + 28, true),
      extra = v.getUint16(pos + 30, true),
      comment = v.getUint16(pos + 32, true);
    const next = pos + 46 + names + extra + comment;
    if (
      next > end ||
      flags & 1 ||
      ![0, 8].includes(method) ||
      size > MAX_ENTRY ||
      (total += size) > MAX_BYTES
    )
      invalid();
    const name = new TextDecoder("utf-8", { fatal: true }).decode(
      bytes.subarray(pos + 46, pos + 46 + names),
    );
    const nestedPath = name.replace(/\/$/, "");
    const pathValid = nestedMXL
      ? !!nestedPath &&
        !/^[\/]|[\\\x00-\x1f]/.test(nestedPath) &&
        nestedPath.split("/").every((p) => p && p !== "." && p !== "..")
      : safePath(name);
    if (!pathValid || entries.has(name)) invalid();
    entries.set(name, size);
    pos = next;
  }
  if (pos !== end) invalid();
  return entries;
}
const xmlTypes = [
  "application/vnd.recordare.musicxml+xml",
  "application/vnd.recordare.musicxml",
  "application/xml",
  "text/xml",
];
function pageTypes(format: string) {
  return format === "pdf"
    ? ["image/png", "image/jpeg", "image/webp"]
    : ["image/svg+xml", "application/vnd.drum-practice.svg+gzip"];
}
function validateManifest(m: Manifest) {
  if (!m || m.format !== "drumscore" || m.version !== 1) invalid();
  validateSong(m.song);
  if (
    !m.song.id ||
    !m.song.measures.length ||
    !Array.isArray(m.pages) ||
    m.pages.length !== m.song.pageCount ||
    !Array.isArray(m.otherScores) ||
    m.otherScores.length > 1 ||
    (m.canonicalXML !== undefined && typeof m.canonicalXML !== "string")
  )
    invalid();
  const seen = new Set<string>();
  const check = (a: Asset, types: string[] | RegExp) => {
    if (
      !a ||
      typeof a.path !== "string" ||
      !safePath(a.path) ||
      a.path === "manifest.json" ||
      seen.has(a.path) ||
      typeof a.type !== "string" ||
      !(types instanceof RegExp
        ? types.test(a.type)
        : types.includes(a.type)) ||
      !Number.isSafeInteger(a.size) ||
      a.size <= 0 ||
      a.size > MAX_ENTRY
    )
      invalid();
    seen.add(a.path);
  };
  const format = m.song.scoreFormat ?? "pdf";
  check(m.source, format === "pdf" ? ["application/pdf"] : xmlTypes);
  check(m.audio, /^audio\/[a-zA-Z0-9.+-]+$/);
  m.pages.forEach((a) => check(a, pageTypes(format)));
  for (const s of m.otherScores) {
    if (
      !s ||
      !["pdf", "musicxml"].includes(s.format) ||
      s.format === format ||
      typeof s.name !== "string" ||
      !Array.isArray(s.pages) ||
      !s.pages.length ||
      s.pages.length > 500 ||
      !Array.isArray(s.measures) ||
      scoreStructureSignature({ measures: s.measures } as Song) !==
        scoreStructureSignature(m.song)
    )
      invalid();
    const song = {
      ...m.song,
      scoreFormat: s.format,
      pageCount: s.pages.length,
      regions: s.regions,
      measures: m.song.measures.map((v, i) => ({
        ...v,
        regionId: s.measures[i].regionId,
      })),
    };
    validateSong(song);
    check(s.source, s.format === "pdf" ? ["application/pdf"] : xmlTypes);
    s.pages.forEach((a) => check(a, pageTypes(s.format)));
  }
  return seen;
}
const MXL_TYPE = "application/vnd.recordare.musicxml";
const unknownTypes = ["", "application/octet-stream", "binary/octet-stream"];
async function sourceType(blob: Blob, format: string): Promise<string> {
  const head = new Uint8Array(await blob.slice(0, 1024).arrayBuffer());
  if (format === "musicxml" && head[0] === 0x50 && head[1] === 0x4b) {
    // The original .mxl stays compressed; only inspect its MusicXML root.
    if (blob.size > 12 * 1024 * 1024) invalid();
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const entries = inspectZip(bytes, true);
    const metaSize = entries.get("META-INF/container.xml");
    if (!metaSize || metaSize > 64 * 1024) invalid();
    const zip = await JSZip.loadAsync(bytes);
    const meta = new TextDecoder().decode(
      await readEntry(zip, "META-INF/container.xml", metaSize),
    );
    const path = /<rootfile\b[^>]*\bfull-path\s*=\s*(["'])(.*?)\1/s.exec(
      meta,
    )?.[2];
    if (!path || !entries.has(path) || entries.get(path)! > 12 * 1024 * 1024)
      invalid();
    const xml = new TextDecoder().decode(
      await readEntry(zip, path, entries.get(path)!),
    );
    if (!/<score-partwise(?:\s|>)/.test(xml) || /<!ENTITY/i.test(xml))
      invalid();
    return MXL_TYPE;
  }
  if (!unknownTypes.includes(blob.type)) return blob.type;
  const text = new TextDecoder().decode(head);
  if (format === "pdf" && text.startsWith("%PDF-")) return "application/pdf";
  if (
    format === "musicxml" &&
    /<score-partwise(?:\s|>)/.test(text) &&
    !/<!ENTITY/i.test(text)
  )
    return "application/vnd.recordare.musicxml+xml";
  invalid();
}
async function audioType(blob: Blob): Promise<string> {
  if (!unknownTypes.includes(blob.type)) return blob.type;
  const h = new Uint8Array(await blob.slice(0, 4096).arrayBuffer());
  const text = new TextDecoder("latin1").decode(h);
  if (text.startsWith("ID3") && h.length >= 10 && [2, 3, 4].includes(h[3]))
    return "audio/mpeg";
  if (
    h.length >= 4 &&
    h[0] === 0xff &&
    (h[1] & 0xe0) === 0xe0 &&
    (h[1] & 0x18) !== 0x08 &&
    (h[1] & 6) !== 0 &&
    (h[2] & 0xf0) !== 0 &&
    (h[2] & 0xf0) !== 0xf0 &&
    (h[2] & 0x0c) !== 0x0c
  )
    return "audio/mpeg";
  if (text.startsWith("RIFF") && text.slice(8, 12) === "WAVE")
    return "audio/wav";
  if (text.startsWith("fLaC")) return "audio/flac";
  if (
    text.startsWith("OggS") &&
    (text.includes("OpusHead") || text.includes("vorbis"))
  )
    return "audio/ogg";
  if (text.startsWith("FORM") && ["AIFF", "AIFC"].includes(text.slice(8, 12)))
    return "audio/aiff";
  if (
    text.slice(4, 8) === "ftyp" &&
    ["M4A ", "M4B ", "M4P ", "F4A "].includes(text.slice(8, 12))
  )
    return "audio/mp4";
  if (
    h.length >= 7 &&
    h[0] === 0xff &&
    (h[1] & 0xf6) === 0xf0 &&
    ((h[2] >> 2) & 15) < 13
  )
    return "audio/aac";
  invalid();
}
export async function createScorePackage(record: RecordData): Promise<Blob> {
  const zip = new JSZip();
  let total = 0;
  const asset = async (
    blob: Blob,
    path: string,
    type = blob.type,
  ): Promise<Asset> => {
    if (blob.size > MAX_ENTRY || (total += blob.size) > MAX_BYTES) invalid();
    zip.file(path, await blob.arrayBuffer(), { createFolders: false });
    return { path, type, size: blob.size };
  };
  const pages = (items: Blob[], prefix: string) =>
    Promise.all(items.map((p, i) => asset(p, `${prefix}/${i}`)));
  const manifest: Manifest = {
    format: "drumscore",
    version: 1,
    song: structuredClone(record.song),
    source: await asset(
      record.pdf,
      "score/source",
      await sourceType(record.pdf, record.song.scoreFormat ?? "pdf"),
    ),
    audio: await asset(
      record.audio,
      "audio/source",
      await audioType(record.audio),
    ),
    pages: await pages(record.pages, "score/pages"),
    canonicalXML: record.canonicalXML,
    otherScores: await Promise.all(
      (record.otherScores ?? []).map(async (s, i) => ({
        ...structuredClone({ ...s, source: undefined, pages: undefined }),
        source: await asset(
          s.source,
          `alternates/${i}/source`,
          await sourceType(s.source, s.format),
        ),
        pages: await pages(s.pages, `alternates/${i}/pages`),
      })),
    ),
  };
  validateManifest(manifest);
  const json = JSON.stringify(manifest);
  const manifestSize = new TextEncoder().encode(json).length;
  if (manifestSize > 16 * 1024 * 1024 || total + manifestSize > MAX_BYTES)
    invalid();
  zip.file("manifest.json", json);
  const bytes = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  if (bytes.length > MAX_BYTES) invalid();
  return new Blob([bytes as Uint8Array<ArrayBuffer>], {
    type: "application/vnd.drum-practice.score+zip",
  });
}
/** Stop inflating as soon as actual output exceeds the declared, bounded size. */
async function readEntry(
  zip: JSZip,
  path: string,
  size: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const file = zip.file(path);
  if (!file) invalid();
  return new Promise((resolve, reject) => {
    // JSZip 3 exposes internalStream on ZipObject; bundled typings omit it.
    const stream = (
      file as typeof file & {
        internalStream(type: "uint8array"): {
          on(event: "data", callback: (chunk: Uint8Array) => void): void;
          on(event: "error", callback: (error: Error) => void): void;
          on(event: "end", callback: () => void): void;
          pause(): void;
          resume(): void;
        };
      }
    ).internalStream("uint8array");
    const chunks: Uint8Array[] = [];
    let length = 0,
      failed = false;
    stream.on("data", (chunk) => {
      if (failed) return;
      length += chunk.length;
      if (length > size) {
        failed = true;
        stream.pause();
        reject(new Error("Package entry exceeds declared size"));
        return;
      }
      chunks.push(chunk);
    });
    stream.on("error", reject);
    stream.on("end", () => {
      if (failed) return;
      if (length !== size) {
        reject(new Error("Package entry size mismatch"));
        return;
      }
      const result = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      resolve(result);
    });
    stream.resume();
  });
}
export async function readScorePackage(blob: Blob): Promise<RecordData> {
  if (!blob.size || blob.size > MAX_BYTES) invalid();
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (bytes.length < 22) invalid();
  const entries = inspectZip(bytes);
  if (
    !entries.has("manifest.json") ||
    entries.get("manifest.json")! > 16 * 1024 * 1024
  )
    invalid();
  const zip = await JSZip.loadAsync(bytes);
  const manifest: Manifest = JSON.parse(
    new TextDecoder("utf-8", { fatal: true }).decode(
      await readEntry(zip, "manifest.json", entries.get("manifest.json")!),
    ),
  );
  const expected = validateManifest(manifest);
  if (
    entries.size !== expected.size + 1 ||
    [...expected].some((p) => !entries.has(p))
  )
    invalid();
  const asset = async (a: Asset) => {
    if (entries.get(a.path) !== a.size) invalid();
    const data = await readEntry(zip, a.path, a.size);
    if (data.length !== a.size) invalid();
    return new Blob([data as Uint8Array<ArrayBuffer>], { type: a.type });
  };
  return {
    song: manifest.song,
    canonicalXML: manifest.canonicalXML,
    pdf: await asset(manifest.source),
    audio: await asset(manifest.audio),
    pages: await Promise.all(manifest.pages.map(asset)),
    otherScores: await Promise.all(
      manifest.otherScores.map(async (s) => ({
        ...s,
        source: await asset(s.source),
        pages: await Promise.all(s.pages.map(asset)),
      })),
    ),
  };
}
