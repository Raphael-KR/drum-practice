import { readFile } from "node:fs/promises";
import * as prettier from "prettier";
import { projectFiles } from "./project-files.mjs";

const files = projectFiles().filter((file) =>
  /\.(?:ts|mts|js|mjs|json|css|html|ya?ml)$/.test(file),
);
const failures = [];
for (const file of files) {
  if (
    !(await prettier.check(await readFile(file, "utf8"), {
      ...(await prettier.resolveConfig(file)),
      filepath: file,
    }))
  )
    failures.push(file);
}
if (failures.length) {
  console.error(
    `Formatting differs from Prettier in ${failures.length}/${files.length} files:\n${failures.join("\n")}`,
  );
  process.exitCode = 1;
} else console.log(`PASS: ${files.length} code/configuration files formatted`);
