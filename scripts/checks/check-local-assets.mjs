import fs from "node:fs";
const catalog = JSON.parse(
  fs.readFileSync("src/content/bundled-scores.json", "utf8"),
);
const needed = new Set([
  ...catalog.map((score) => `public/${score.file}`),
  "public/demo/song.json",
  "public/demo/score.pdf",
  "public/demo/score.musicxml",
  "public/demo/audio.mp3",
  "data/reference/grid_verified.json",
  "data/reference/test-fixtures/musicxml-candidate.musicxml",
  "data/reference/test-fixtures/tom-moving-28-portland.drumscore",
]);
if (fs.existsSync("public/demo/song.json")) {
  const song = JSON.parse(fs.readFileSync("public/demo/song.json", "utf8"));
  for (let i = 1; i <= song.pageCount; i++)
    needed.add(`public/demo/page-${i}.png`);
}
const missing = [...needed].filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error(
    "Missing local assets; local-media tests/build are NOT verified. See docs/operations/TESTING.md.\n" +
      missing.join("\n"),
  );
  process.exitCode = 1;
} else
  console.log(
    `PASS: ${needed.size} local assets available (presence only; tests verify contents)`,
  );
