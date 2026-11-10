import fs from "node:fs";
import assert from "node:assert/strict";
import ts from "@typescript/typescript6";
import { sourceFiles } from "./source-files.mjs";
// This browser-side production helper shares the app's package and byte codecs.
const files = [
  ...sourceFiles(),
  "tools/score-production/musicxml/common/package.mjs",
];
const audit = process.argv.includes("--audit");
const report = {
  files,
  primitives: [],
  duplicates: [],
};
const fingerprints = new Map();
for (const file of files) {
  const source = fs.readFileSync(file, "utf8"),
    ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  function visit(n) {
    if (ts.isCallExpression(n) || ts.isNewExpression(n)) {
      const name = n.expression.getText(ast);
      if (
        name === "mountPlaybackShell" ||
        (audit &&
          /createElement|createObjectURL|revokeObjectURL|Image|btoa|atob|preparePlaybackAssets|setIconButton|download/.test(
            name,
          ))
      )
        report.primitives.push({
          file,
          line: ast.getLineAndCharacterOfPosition(n.getStart(ast)).line + 1,
          call: name,
        });
      if (name === "btoa" || name === "atob")
        assert(
          file === "src/platform/storage/binary-asset.ts",
          `${file}: binary codec bypass`,
        );
      if (name === "crypto.subtle.digest" && n.arguments[0]?.text === "SHA-256")
        assert(
          file === "src/platform/browser/sha256.ts",
          `${file}: use the shared SHA-256 implementation`,
        );
      if (name === "svgFromPath")
        assert(
          file === "src/shared/ui/icon-svg.ts",
          `${file}: define action icons in the shared icon catalog`,
        );
      if (
        [
          "transportHTML",
          "repeatBarHTML",
          "soundFieldsHTML",
          "progressFieldHTML",
          "tempoFieldsHTML",
          "playbackBrandHTML",
          "metronomeControlHTML",
          "screenSettingsHTML",
          "playbackPreferenceFieldsHTML",
        ].includes(name)
      ) {
        // settingsLayoutHTML is the shared form composite, not a host copy.
        let owner = n.parent;
        while (owner && !ts.isFunctionDeclaration(owner)) owner = owner.parent;
        const sharedSoundComposite =
          file === "src/modules/playback/playback-forms.ts" &&
          name === "soundFieldsHTML" &&
          owner?.name?.text === "settingsLayoutHTML";
        assert(
          file === "src/modules/playback/playback-shell.ts" ||
            sharedSoundComposite,
          `${file}: independently assembled playback UI`,
        );
      }
    }
    // Compare function token structure, ignoring local identifier spelling. Candidates require human review.
    if (
      audit &&
      (ts.isFunctionDeclaration(n) ||
        ts.isArrowFunction(n) ||
        ts.isFunctionExpression(n)) &&
      n.body
    ) {
      const scanner = ts.createScanner(
        ts.ScriptTarget.Latest,
        true,
        ts.LanguageVariant.Standard,
        n.body.getText(ast),
      );
      let token,
        parts = [];
      while ((token = scanner.scan()) !== ts.SyntaxKind.EndOfFileToken)
        parts.push(
          token === ts.SyntaxKind.Identifier ? "ID" : scanner.getTokenText(),
        );
      if (parts.length >= 100) {
        const key = parts.join(" ");
        const at = {
          file,
          line: ast.getLineAndCharacterOfPosition(n.getStart(ast)).line + 1,
        };
        const prior = fingerprints.get(key);
        if (prior && prior.file !== file)
          report.duplicates.push({ a: prior, b: at });
        else fingerprints.set(key, at);
      }
    }
    ts.forEachChild(n, visit);
  }
  visit(ast);
  if (file !== "src/shared/ui/html.ts")
    assert(!source.includes('"&": "&amp;"'), `${file}: copied escaping table`);
  if (file !== "src/shared/ui/icon-button.ts")
    assert(
      !/class=.["']?icon-caption/.test(source),
      `${file}: copied icon button caption markup`,
    );
}
for (const file of [
  "src/apps/editor/workspace.ts",
  "src/modules/playback/playback-runtime.ts",
])
  assert.equal(
    report.primitives.filter(
      (x) => x.file === file && x.call === "mountPlaybackShell",
    ).length,
    1,
    `${file}: common shell mount`,
  );
console.log(`PASS: ${files.length} source files; shared component boundaries`);
if (audit) {
  fs.mkdirSync("docs/experiments", { recursive: true });
  fs.writeFileSync(
    "docs/experiments/common-components-audit.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    `AUDIT: ${report.primitives.length} primitive call sites inventoried; ${report.duplicates.length} normalized duplicate function candidates (manual review required)`,
  );
}
