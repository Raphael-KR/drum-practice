import fs from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
const files = fs
  .readdirSync("src")
  .filter((x) => x.endsWith(".ts"))
  .map((x) => "src/" + x);
const report = {
  primitives: [],
  duplicates: [],
  exceptions: {
    "src/main.ts":
      "Editor canvas image decoding uses selected page URL; authoring dialogs remain distinct bodies.",
    "src/score-review.ts":
      "Comparison canvas loads original pages rather than practice crops.",
    "src/licenses.ts":
      "download attribute is link metadata; execution calls shared download.",
  },
};
const fingerprints = new Map();
for (const file of files) {
  const source = fs.readFileSync(file, "utf8"),
    ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  function visit(n) {
    if (ts.isCallExpression(n) || ts.isNewExpression(n)) {
      const name = n.expression.getText(ast);
      if (
        /createElement|createObjectURL|revokeObjectURL|Image|btoa|atob|mountPlaybackShell|preparePlaybackAssets|setIconButton|download/.test(
          name,
        )
      )
        report.primitives.push({
          file,
          line: ast.getLineAndCharacterOfPosition(n.getStart(ast)).line + 1,
          call: name,
        });
      if (name === "btoa" || name === "atob")
        assert(file === "src/binary-asset.ts", `${file}: binary codec bypass`);
      if (
        [
          "transportHTML",
          "repeatBarHTML",
          "soundFieldsHTML",
          "loopFieldsHTML",
          "tempoFieldsHTML",
          "playbackBrandHTML",
          "metronomeControlHTML",
          "screenSettingsHTML",
          "playbackPreferenceFieldsHTML",
        ].includes(name)
      )
        assert(
          file === "src/playback-shell.ts",
          `${file}: independently assembled playback UI`,
        );
    }
    // Compare function token structure, ignoring local identifier spelling. Candidates require human review.
    if (
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
  if (file !== "src/html.ts")
    assert(!source.includes('"&": "&amp;"'), `${file}: copied escaping table`);
  if (file !== "src/icon-button.ts")
    assert(
      !/class=.["']?icon-caption/.test(source),
      `${file}: copied icon button caption markup`,
    );
}
for (const file of ["src/workspace.ts", "src/portable-player.ts"])
  assert.equal(
    report.primitives.filter(
      (x) => x.file === file && x.call === "mountPlaybackShell",
    ).length,
    1,
    `${file}: common shell mount`,
  );
fs.mkdirSync("docs/experiments", { recursive: true });
fs.writeFileSync(
  "docs/experiments/common-components-audit.json",
  JSON.stringify(report, null, 2),
);
console.log(
  `PASS: ${files.length} source files scanned; ${report.primitives.length} primitive call sites inventoried; ${report.duplicates.length} normalized duplicate function candidates (manual review required)`,
);
