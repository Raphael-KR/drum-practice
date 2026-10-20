import fs from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
import { sourceFiles, resolveSource } from "./source-files.mjs";

let edges = 0;
for (const file of sourceFiles()) {
  const ast = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (ts.isStringLiteral(node)) {
      const target = resolveSource(file, node.text);
      if (target) {
        edges++;
        const app = file.match(/^src\/apps\/(editor|player)\//)?.[1];
        const targetApp = target.match(/^src\/apps\/(editor|player)\//)?.[1];
        assert(!(targetApp && app !== targetApp), `${file}: app dependency ${target}`);
        if (file.startsWith("src/model/"))
          assert(target.startsWith("src/model/") || target.startsWith("src/shared/i18n/"),
            `${file}: model dependency ${target}`);
        if (file.startsWith("src/shared/"))
          assert(!target.startsWith("src/modules/"), `${file}: shared UI/domain dependency ${target}`);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}
console.log(`PASS: ${sourceFiles().length} source files, ${edges} resolved references; app/model/shared boundaries`);
