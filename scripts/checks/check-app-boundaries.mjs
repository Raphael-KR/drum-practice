import fs from "node:fs";
import assert from "node:assert/strict";
const base = "docs/experiments/editor-player-separation/";
const modules = JSON.parse(
  fs.readFileSync(base + "player-modules.json", "utf8"),
);
const forbidden =
  /\/src\/apps\/editor\/|\/src\/platform\/storage\/storage\.ts$|\/src\/modules\/score\/(canonical-xml|pdf)\.ts$|\/src\/modules\/library\/library-backup\.ts$|node_modules\/pdfjs-dist\//;
assert(
  !modules.some((x) => forbidden.test(x)),
  "Player contains authoring modules: " +
    modules.filter((x) => forbidden.test(x)).join(", "),
);
for (const name of [
  "apps/player/player-app",
  "platform/storage/practice-library",
  "modules/library/score-package",
  "modules/playback/playback-runtime",
  "modules/playback/playback-screen",
  "modules/playback/playback-shell",
  "modules/score/musicxml",
  "modules/score/browser-score",
  "modules/score/score-render-cache",
])
  assert(
    modules.some((x) => x.endsWith("/src/" + name + ".ts")),
    "Missing player module " + name,
  );
const editor = JSON.parse(
  fs.readFileSync(base + "editor-modules.json", "utf8"),
);
for (const name of [
  "apps/editor/main",
  "apps/editor/workspace",
  "modules/library/score-package",
  "modules/playback/playback-screen",
])
  assert(
    editor.some((x) => x.endsWith("/src/" + name + ".ts")),
    "Missing editor module " + name,
  );
console.log(
  "PASS: separate editor/player builds; player has common playback and MusicXML renderer/cache; no authoring or PDF renderer",
);
