import fs from "node:fs";
import assert from "node:assert/strict";
import ts from "@typescript/typescript6";
import { resolveSource } from "./source-files.mjs";
// Keep host adapters from reacquiring playback ownership. Audit actual call expressions.
const owned = [
  "renderMeasure",
  "measureWidth",
  "measurePosition",
  "scoreLayout",
  "renderScoreRows",
  "layoutScoreLyrics",
  "buildScoreTrack",
  "updateScoreFrame",
  "installScoreScroll",
  "attachPlaybackGestures",
  "beginPlaybackScrub",
  "finishPlaybackScrub",
  "movePlaybackScrub",
  "seekPlaybackFreely",
  "installPlaybackWheel",
  "installPlaybackKeys",
  "repeatPreset",
  "updateRepeatControls",
  "changePlaybackLoop",
  "playbackPosition",
  "copyPosition",
  "mountLoopSlots",
  "toggleMeasureMarker",
  "createPlaybackWakeLock",
];
const retired = ["repeatPoint", "fillRepeatFields", "markMeasure"];
const screenHelpers = [
  "createPlaybackTrack",
  "createPlaybackDisplay",
  "createPlaybackNavigation",
];
function calls(file) {
  const s = fs.readFileSync(file, "utf8"),
    ast = ts.createSourceFile(file, s, ts.ScriptTarget.Latest, true),
    out = [];
  function visit(n) {
    if (ts.isCallExpression(n))
      out.push({
        name: n.expression.getText(ast),
        line: ast.getLineAndCharacterOfPosition(n.getStart(ast)).line + 1,
      });
    ts.forEachChild(n, visit);
  }
  visit(ast);
  return out;
}
const report = {};
for (const file of [
  "src/apps/editor/main.ts",
  "src/modules/playback/playback-runtime.ts",
]) {
  const sites = calls(file);
  assert.equal(
    sites.filter((c) => c.name === "createPlaybackScreen").length,
    1,
    `${file}: must mount exactly one common screen`,
  );
  for (const name of [...owned, ...retired, ...screenHelpers])
    assert(
      !sites.some((c) => c.name === name),
      `${file}: playback ownership escaped into host: ${name}`,
    );
  const source = fs.readFileSync(file, "utf8");
  assert(
    !/<input[^>]*id=\\?["'](?:loop-a|loop-b|loop-ab|loop-bb|music-volume|click-volume)/.test(
      source,
    ),
    `${file}: copied playback form`,
  );
  report[file] = sites.filter(
    (c) => c.name === "createPlaybackScreen" || c.name.startsWith("playback."),
  );
}
for (const file of ["src/apps/player/player-app.ts"]) {
  const sites = calls(file);
  assert.equal(
    sites.filter((c) => c.name === "mountPlaybackRuntime").length,
    1,
    `${file}: shared runtime mount`,
  );
  for (const name of [...owned, ...retired, ...screenHelpers])
    assert(
      !sites.some((c) => c.name === name),
      `${file}: playback ownership escaped`,
    );
}
const screenFile = "src/modules/playback/playback-screen.ts";
const trackFile = "src/modules/playback/playback-track.ts";
const displayFile = "src/modules/playback/playback-display.ts";
const navigationFile = "src/modules/playback/playback-navigation.ts";
// These helpers are mounted by the single screen owner, never by app hosts.
const delegated = new Map(
  [
    "renderMeasure",
    "measureWidth",
    "measurePosition",
    "scoreLayout",
    "renderScoreRows",
    "layoutScoreLyrics",
  ].map((name) => [name, trackFile]),
);
for (const name of [
  "attachPlaybackGestures",
  "installPlaybackWheel",
  "installScoreScroll",
  "installPlaybackKeys",
  "movePlaybackScrub",
])
  delegated.set(name, navigationFile);
const ownerCalls = new Map(
  [screenFile, trackFile, displayFile, navigationFile].map((file) => [
    file,
    calls(file),
  ]),
);
const core = ownerCalls.get(screenFile);
assert(core);
for (const name of screenHelpers)
  assert.equal(
    core.filter((c) => c.name === name).length,
    1,
    `${screenFile}: must mount exactly one ${name}`,
  );
for (const name of retired)
  assert(
    ![...ownerCalls.values()].flat().some((c) => c.name === name),
    `Retired playback operation restored: ${name}`,
  );
for (const name of owned) {
  const owner = delegated.get(name) ?? screenFile;
  const sites = ownerCalls.get(owner);
  assert(sites);
  assert(
    sites.some((c) => c.name === name),
    `Missing common owner call: ${owner}: ${name}`,
  );
  for (const [file, sites] of ownerCalls)
    if (file !== owner)
      assert(
        !sites.some((c) => c.name === name),
        `Playback operation escaped its owner: ${file}: ${name} (owner: ${owner})`,
      );
}
for (const file of [
  screenFile,
  trackFile,
  displayFile,
  navigationFile,
  "src/modules/playback/playback-forms.ts",
  "src/modules/playback/playback-settings.ts",
  "src/modules/playback/playback-settings-layout.ts",
]) {
  const source = fs.readFileSync(file, "utf8"),
    ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  // App imports are checked for all source files by check-source-boundaries.
  function imports(n) {
    if (
      ts.isStringLiteral(n) &&
      resolveSource(file, n.text) === "src/platform/storage/storage.ts"
    )
      assert.fail(`${file}: storage dependency ${n.text}`);
    ts.forEachChild(n, imports);
  }
  imports(ast);
}
if (process.argv.includes("--audit")) {
  fs.mkdirSync("docs/experiments", { recursive: true });
  fs.writeFileSync(
    "docs/experiments/playback-call-sites.json",
    JSON.stringify(report, null, 2),
  );
}
console.log(
  `PASS: 2 hosts / 1 playback owner / ${owned.length} owned operations`,
);
