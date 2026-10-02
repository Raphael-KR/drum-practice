import ts from "typescript";
import fs from "node:fs";
const ko = JSON.parse(fs.readFileSync("src/locales/ko.json"));
const exceptions = JSON.parse(
  fs.readFileSync("scripts/i18n-content-exceptions.json"),
);
const errors = [];
let refs = 0,
  content = 0;
for (const file of fs.readdirSync("src").filter((x) => x.endsWith(".ts"))) {
  const source = fs.readFileSync("src/" + file, "utf8"),
    ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  function walk(n) {
    if (
      (ts.isStringLiteral(n) ||
        ts.isNoSubstitutionTemplateLiteral(n) ||
        ts.isTemplateExpression(n)) &&
      /[가-힣]/.test(n.getText(ast))
    ) {
      if (
        exceptions[file]?.literals.includes(n.text ?? n.getText(ast)) &&
        !/Error/.test(n.parent.getText(ast).slice(0, 30))
      )
        content++;
      else
        errors.push(
          `${file}:${ast.getLineAndCharacterOfPosition(n.getStart()).line + 1} unregistered Korean literal`,
        );
    }
    if (
      ts.isCallExpression(n) &&
      ["i18nText", "t"].includes(n.expression.getText(ast)) &&
      n.arguments[0] &&
      ts.isStringLiteral(n.arguments[0])
    ) {
      const key = n.arguments[0].text;
      if (!(key in ko)) errors.push(`${file}: unknown ${key}`);
      else {
        refs++;
        const needed = [...ko[key].matchAll(/\{([a-zA-Z_$][\w$]*)\}/g)].map(
          (x) => x[1],
        );
        const arg = n.arguments[1];
        const supplied =
          arg && ts.isObjectLiteralExpression(arg)
            ? arg.properties.map((p) => p.name?.getText(ast))
            : [];
        for (const name of needed)
          if (!supplied.includes(name))
            errors.push(`${file}: missing ${name} in ${key}`);
      }
    }
    ts.forEachChild(n, walk);
  }
  walk(ast);
}
const ui = JSON.parse(fs.readFileSync("src/ui-catalog.json"));
for (const item of ui.components)
  for (const f of ["name", "accessible"])
    if (!(item[f].ko in ko)) errors.push(`Component ${item.id} missing ${f}`);
for (const [key, value] of Object.entries(ko))
  if (/<\/?[a-z][^>]*>/i.test(value)) errors.push(`Markup in message ${key}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    JSON.stringify({
      messages: Object.keys(ko).length,
      references: refs,
      preservedContentLiterals: content,
      unregisteredKoreanUI: 0,
    }),
  );
