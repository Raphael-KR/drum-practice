/** Node adapters only. Identity, replay, MusicXML reading and writing stay in shared modules. */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import { createScoreProjectStore } from "../../../../server/score-project-store.ts";

export const productionRoot = fileURLToPath(
  new URL("../../../../", import.meta.url),
);
export const correctionSHA = (value) =>
  createHash("sha256").update(value).digest("hex");
let shared;
export function correctionAPI() {
  shared ??= build({
    absWorkingDir: productionRoot,
    stdin: {
      contents: [
        'export * from "./tools/score-production/musicxml/common/lyric-correction-input.mjs";',
        'export { diffLyricCorrections } from "./src/modules/lyrics/lyric-corrections.ts";',
        'export { canonicalManifest, CANONICAL_FIELD } from "./src/modules/score/canonical-metadata.ts";',
        'export { readCanonicalLyrics } from "./src/modules/score/canonical-lyric-read.ts";',
        'export { writeLyricVoices, removeLyricVoices } from "./src/modules/score/canonical-lyric-voice.ts";',
      ].join("\n"),
      resolveDir: productionRoot,
    },
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  }).then(async ({ outputFiles }) => ({
    api: await import(
      `data:text/javascript;base64,${Buffer.from(outputFiles[0].contents).toString("base64")}`
    ),
    bundleSHA256: correctionSHA(outputFiles[0].contents),
  }));
  return shared;
}

export async function readProjectCorrections(songId, explicitPath) {
  if (!explicitPath) {
    const store = createScoreProjectStore(productionRoot);
    if (await store.head(songId)) {
      const envelope = await store.corrections(songId);
      const projectDirectory = store.directory(songId);
      if (!envelope) return { projectDirectory, envelope: undefined };
      const bytes = Buffer.from(JSON.stringify(envelope));
      return {
        projectDirectory,
        sha256: correctionSHA(bytes),
        bytes,
        envelope,
      };
    }
  }
  const { api } = await correctionAPI();
  const path = explicitPath
    ? resolve(explicitPath)
    : resolve(
        productionRoot,
        "data/production/lyric-corrections",
        api.correctionComponent(songId),
        "latest.json",
      );
  try {
    const bytes = await readFile(path);
    return {
      path,
      sha256: correctionSHA(bytes),
      bytes,
      envelope: JSON.parse(bytes.toString("utf8")),
    };
  } catch (error) {
    if (!explicitPath && error.code === "ENOENT")
      return { path, envelope: undefined };
    throw error;
  }
}

/** Keep final groups and all unrelated metadata; never regroup an already canonical score. */
export async function correctCanonicalLyrics(
  sourceXML,
  songId,
  envelope,
  idMap,
) {
  const { api, bundleSHA256 } = await correctionAPI();
  const window = new JSDOM(sourceXML, { contentType: "application/xml" })
    .window;
  try {
    const document = window.document;
    const manifest = api.canonicalManifest(document);
    if (!manifest) throw Error("A v3 canonical MusicXML input is required");
    const song = {
      id: songId,
      measures: manifest.measures,
      lyrics: api.readCanonicalLyrics(document, manifest),
    };
    const before = structuredClone(song.lyrics);
    const report = await api.applyConfirmedCorrections(song, envelope, idMap);
    let canonicalXML = sourceXML;
    if (report.applied.length) {
      const part = [...document.querySelectorAll("score-partwise > part")].find(
        (p) => p.id === manifest.partId,
      );
      if (!part) throw Error(`Missing canonical part: ${manifest.partId}`);
      // Explicit ownership also supports XML serializers that stripped block comments.
      api.removeLyricVoices(
        part,
        manifest.lyrics.map((lyric) => lyric.voice),
      );
      const lyrics = api.writeLyricVoices(part, song);
      const field = [...document.querySelectorAll("miscellaneous-field")].find(
        (f) => f.getAttribute("name") === api.CANONICAL_FIELD,
      );
      field.textContent = JSON.stringify({ ...manifest, lyrics });
      canonicalXML = new window.XMLSerializer().serializeToString(document);
      const reread = new JSDOM(canonicalXML, { contentType: "application/xml" })
        .window;
      try {
        const restored = api.readCanonicalLyrics(
          reread.document,
          api.canonicalManifest(reread.document),
        );
        if (api.diffLyricCorrections(song.lyrics, restored).length)
          throw Error(
            "Corrected lyric positions changed during MusicXML roundtrip",
          );
      } finally {
        reread.close();
      }
    }
    return {
      canonicalXML,
      report: {
        ...report,
        songId,
        bundleSHA256,
        inputSHA256: correctionSHA(sourceXML),
        outputSHA256: correctionSHA(canonicalXML),
        changes: api.diffLyricCorrections(before, song.lyrics),
      },
    };
  } finally {
    window.close();
  }
}
