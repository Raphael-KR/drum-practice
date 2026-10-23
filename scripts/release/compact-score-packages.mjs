import JSZip from "jszip";
import { gzipSync, gunzipSync } from "node:zlib";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

const SVG_GZIP = "application/vnd.drum-practice.svg+gzip";
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** Omit only this renderer's disposable v1 timeline, retaining exact print ink. */
export async function compactScorePackage(input) {
  const zip = await JSZip.loadAsync(input);
  const manifestEntry = zip.file("manifest.json");
  if (!manifestEntry)
    throw Error(
      "Cannot compact package: expected manifest.json, actual missing",
    );
  const manifest = JSON.parse(await manifestEntry.async("string"));
  if (
    manifest.format !== "drumscore" ||
    manifest.version !== 1 ||
    !manifest.canonicalXML?.trim()
  )
    throw Error(
      `Cannot compact package: ${JSON.stringify({ expected: "v1 drumscore with canonical XML", format: manifest.format, version: manifest.version, hasCanonical: !!manifest.canonicalXML })}`,
    );
  const changes = [];
  for (const score of [
    { format: manifest.song.scoreFormat, pages: manifest.pages },
    ...(manifest.otherScores ?? []),
  ]) {
    if (score.format !== "musicxml") continue;
    for (const page of score.pages) {
      if (![SVG_GZIP, "image/svg+xml"].includes(page.type)) continue;
      const entry = zip.file(page.path);
      if (!entry) throw Error(`Missing package page: ${page.path}`);
      const before = await entry.async("nodebuffer");
      const svg = (
        page.type === SVG_GZIP ? gunzipSync(before) : before
      ).toString("utf8");
      let removed = 0;
      // The native serializer marks this cache explicitly. Source MusicXML,
      // fonts, print geometry and all other SVG metadata remain byte-identical.
      const printed = svg.replace(
        /<metadata\b[^>]*\bdata-ribbon-timeline=(["'])1\1[^>]*>[\s\S]*?<\/metadata\s*>/g,
        () => {
          removed++;
          return "";
        },
      );
      if (!removed) continue;
      const bytes = Buffer.from(printed);
      const after = page.type === SVG_GZIP ? gzipSync(bytes) : bytes;
      zip.file(page.path, after, { date: entry.date, createFolders: false });
      page.size = after.length;
      changes.push({
        path: page.path,
        removed,
        before: before.length,
        after: after.length,
      });
    }
  }
  if (!changes.length) return { bytes: input, changes };
  zip.file("manifest.json", JSON.stringify(manifest), {
    date: manifestEntry.date,
  });
  const bytes = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  return { bytes, changes };
}

async function main() {
  const [output, ...inputs] = process.argv.slice(2);
  if (!output || !inputs.length)
    throw Error(
      "Usage: compact-score-packages.mjs <new-output-directory> <package>...",
    );
  await mkdir(output, { recursive: false });
  for (const input of inputs) {
    const before = await readFile(input);
    const { bytes, changes } = await compactScorePackage(before);
    const destination = path.join(output, path.basename(input));
    await writeFile(destination, bytes, { flag: "wx" });
    console.log(
      JSON.stringify({
        input,
        destination,
        before: before.length,
        after: bytes.length,
        beforeSha256: sha(before),
        afterSha256: sha(bytes),
        changes,
      }),
    );
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main();
