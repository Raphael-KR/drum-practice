/** Production v2 -> v3 adapter. No renderer, browser, package or database writes. */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { JSDOM } from "jsdom";
import {
  correctionAPI,
  readProjectCorrections,
  correctCanonicalLyrics,
} from "./common/lyric-correction-node.mjs";
import { groupProductionLyrics } from "./common/lyric-group-data.mjs";
import { SCORE_LYRIC_POINTS } from "../../../src/modules/score/time-spacing.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { "song-id": { type: "string" } },
});
const directories = positionals.map((p) => resolve(p));
if (!directories.length)
  throw Error(
    "Usage: node group_canonical_lyrics.mjs /prepared/work/directory [...] [--song-id ID for one directory without before-song.json]",
  );
if (values["song-id"] && directories.length !== 1)
  throw Error("--song-id requires exactly one work directory");
const fontPath = resolve(
  root,
  "src/modules/score/vendor/pretendard/Pretendard-Regular.woff2",
);
const fontName = "DrumProductionPretendard";
if (!GlobalFonts.registerFromPath(fontPath, fontName))
  throw Error(`Could not register production font: path=${fontPath}`);
const context = createCanvas(1, 1).getContext("2d");
context.font = `${(SCORE_LYRIC_POINTS * 96) / 72}px ${fontName}`;
const width = (text) => context.measureText(text).width;
const { api, bundleSHA256 } = await correctionAPI();
const { writeLyricVoices, removeLyricVoices } = api;
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
let failures = 0;
for (const directory of directories) {
  try {
    const output = resolve(directory, "score.musicxml");
    if (existsSync(output)) throw Error(`Output already exists: ${output}`);
    const work = JSON.parse(
      readFileSync(resolve(directory, "work.json"), "utf8"),
    );
    const preservedSong = resolve(directory, "before-song.json");
    const songId =
      values["song-id"] ??
      (existsSync(preservedSong)
        ? JSON.parse(readFileSync(preservedSong, "utf8")).id
        : undefined);
    const correctionInput = await readProjectCorrections(songId);
    const source = readFileSync(resolve(directory, "before.musicxml"), "utf8");
    if (sha(source) !== work.input.sha256)
      throw Error(
        `Source SHA mismatch: expected=${work.input.sha256}, actual=${sha(source)}`,
      );
    const number = (fraction) => {
      const [a, b = "1"] = String(fraction).split("/");
      return Number(a) / Number(b);
    };
    const originalLyrics = work.lyrics.map((row) => ({
      id: row.id,
      text: row.text,
      confirmed: row.confirmed,
      scorePosition: {
        measureId: row.measureId,
        quarterOffset: number(row.quarterOffset),
        durationQuarters: number(row.durationQuarters),
      },
    }));
    const { sources, groups, lyrics } = groupProductionLyrics(
      work.sourceManifest.measures,
      originalLyrics,
      width,
    );
    const window = new JSDOM(source, { contentType: "application/xml" }).window;
    try {
      const document = window.document;
      const part = [...document.querySelectorAll("score-partwise > part")].find(
        (p) => p.id === work.sourceManifest.partId,
      );
      if (!part)
        throw Error(`Missing lyric part: ${work.sourceManifest.partId}`);
      removeLyricVoices(
        part,
        work.sourceManifest.lyrics.map((l) => l.voice),
      );
      const identities = writeLyricVoices(part, {
        measures: work.sourceManifest.measures,
        lyrics,
      });
      for (const note of part.querySelectorAll('note[print-lyric="yes"]'))
        for (const lyric of note.querySelectorAll("lyric"))
          lyric.setAttribute("justify", "left");
      const names = new Set(work.removedFields.map((f) => f.name));
      for (const field of [...document.querySelectorAll("miscellaneous-field")])
        if (names.has(field.getAttribute("name"))) field.remove();
      const field = document.querySelector(
        'miscellaneous-field[name="drum-practice:score:v2"]',
      );
      if (!field) throw Error("Missing v2 manifest field in preserved source");
      field.setAttribute("name", "drum-practice:score:v3");
      field.textContent = JSON.stringify({
        ...work.sourceManifest,
        version: 3,
        lyrics: identities,
      });
      const groupedXML = new window.XMLSerializer().serializeToString(document);
      const corrected = await correctCanonicalLyrics(
        groupedXML,
        songId,
        correctionInput.envelope,
      );
      const xml = corrected.canonicalXML;
      const evidence = {
        sourceSHA256: work.input.sha256,
        outputSHA256: sha(xml),
        font: {
          path: fontPath,
          sha256: sha(readFileSync(fontPath)),
          points: SCORE_LYRIC_POINTS,
          css: context.font,
        },
        code: {
          groupSHA256: sha(
            readFileSync(resolve(root, "src/modules/score/lyric-groups.ts")),
          ),
          spacingSHA256: sha(
            readFileSync(resolve(root, "src/modules/score/time-spacing.ts")),
          ),
          writerBundleSHA256: bundleSHA256,
        },
        sources: sources.map((s) => ({ ...s, width: width(s.text) })),
        groups,
        corrections: corrected.report,
        correctionInput: {
          path: correctionInput.path,
          sha256: correctionInput.sha256 ?? null,
        },
      };
      if (correctionInput.envelope)
        writeFileSync(
          resolve(directory, "corrections.json"),
          correctionInput.bytes,
          { flag: "wx" },
        );
      writeFileSync(
        resolve(directory, "groups.json"),
        JSON.stringify(evidence, null, 2) + "\n",
        { flag: "wx" },
      );
      writeFileSync(
        corrected.report.conflicts.length
          ? resolve(directory, "candidate.musicxml")
          : output,
        xml,
        { flag: "wx" },
      );
      if (corrected.report.conflicts.length)
        throw Error(
          `Confirmed lyric correction conflicts: directory=${directory}, count=${corrected.report.conflicts.length}; see groups.json and candidate.musicxml`,
        );
      console.log(
        JSON.stringify({
          directory,
          sourceLyrics: sources.length,
          groups: groups.length,
          outputSHA256: sha(xml),
        }),
      );
    } finally {
      window.close();
    }
  } catch (error) {
    failures++;
    console.error(JSON.stringify({ directory, error: String(error) }));
  }
}
if (failures) process.exitCode = 1;
