import { sourceFiles } from "./source-files.mjs";
import ts from "typescript";
import fs from "node:fs";
let all = [];
for (const file of sourceFiles().map((file) => file.slice(4))) {
  const source = fs.readFileSync("src/" + file, "utf8"),
    ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  function visit(n) {
    if (
      (ts.isStringLiteral(n) ||
        ts.isNoSubstitutionTemplateLiteral(n) ||
        ts.isTemplateExpression(n)) &&
      /[가-힣]/.test(n.getText(ast))
    )
      all.push({
        file,
        line: ast.getLineAndCharacterOfPosition(n.getStart()).line + 1,
        kind: ts.SyntaxKind[n.kind],
        parent: ts.SyntaxKind[n.parent.kind],
        text: n.getText(ast).slice(0, 200),
      });
    ts.forEachChild(n, visit);
  }
  visit(ast);
}
fs.mkdirSync("docs/experiments/i18n", { recursive: true });
fs.writeFileSync(
  "docs/experiments/i18n/inventory.json",
  JSON.stringify(all, null, 2),
);
console.log(all.length);
console.log(
  Object.entries(Object.groupBy(all, (x) => x.file)).map(([k, v]) => [
    k,
    v.length,
  ]),
);
