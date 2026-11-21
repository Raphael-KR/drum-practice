/** Reapply editor-confirmed lyric corrections to an existing canonical score. */
import { parseArgs } from "node:util";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  readProjectCorrections,
  correctCanonicalLyrics,
  correctionSHA,
} from "./common/lyric-correction-node.mjs";

async function main() {
  const { values } = parseArgs({
    options: {
      xml: { type: "string" },
      "song-id": { type: "string" },
      out: { type: "string" },
      corrections: { type: "string" },
      "id-map": { type: "string" },
      help: { type: "boolean" },
    },
  });
  if (values.help || !values.xml || !values["song-id"] || !values.out) {
    console.log(
      "Usage: node apply_lyric_corrections.mjs --xml /current.musicxml --song-id ID --out /new/directory [--corrections /latest.json] [--id-map /approved-id-map.json]",
    );
    if (!values.help) process.exitCode = 1;
  } else {
    const sourcePath = resolve(values.xml);
    const sourceXML = await readFile(sourcePath, "utf8");
    const input = await readProjectCorrections(
      values["song-id"],
      values.corrections,
    );
    const idMapText = values["id-map"]
      ? await readFile(values["id-map"], "utf8")
      : undefined;
    const idMap = idMapText === undefined ? undefined : JSON.parse(idMapText);
    if (
      idMap !== undefined &&
      (!idMap ||
        Array.isArray(idMap) ||
        typeof idMap !== "object" ||
        Object.entries(idMap).some(
          ([key, value]) => !key || typeof value !== "string" || !value,
        ))
    )
      throw Error("ID map must contain explicit old-ID to current-ID strings");
    const result = await correctCanonicalLyrics(
      sourceXML,
      values["song-id"],
      input.envelope,
      idMap,
    );
    const directory = resolve(values.out);
    // A fresh directory prevents replacing the prior score or an earlier review report.
    await mkdir(directory);
    const outputName = result.report.conflicts.length
      ? "candidate.musicxml"
      : "score.musicxml";
    const save = (name, content) =>
      writeFile(resolve(directory, name), content, { flag: "wx" });
    await save("before.musicxml", sourceXML);
    if (input.envelope) await save("corrections.json", input.bytes);
    if (idMapText) await save("id-map.json", idMapText);
    await save(outputName, result.canonicalXML);
    await save(
      "correction-report.json",
      JSON.stringify(
        {
          ...result.report,
          generatedAt: new Date().toISOString(),
          sourcePath,
          correctionInput: {
            path: input.path ?? null,
            projectDirectory: input.projectDirectory ?? null,
            // Hash of the saved corrections.json snapshot; a project envelope
            // is derived from immutable saves, not the bytes of project.json.
            sha256: input.sha256 ?? null,
          },
          idMapSHA256: idMapText ? correctionSHA(idMapText) : null,
          outputName,
        },
        null,
        2,
      ) + "\n",
    );
    console.log(
      JSON.stringify({
        directory,
        outputName,
        status: result.report.status,
        applied: result.report.applied.length,
        alreadyApplied: result.report.alreadyApplied.length,
        conflicts: result.report.conflicts.length,
        outputSHA256: result.report.outputSHA256,
      }),
    );
    if (result.report.conflicts.length) process.exitCode = 2;
  }
}

await main().catch((error) => {
  // Bundled shared code uses a data URL. Do not print its entire source in a stack trace.
  console.error(
    JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exitCode = 1;
});
