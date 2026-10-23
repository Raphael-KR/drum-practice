import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { projectFiles } from "./project-files.mjs";

const sourceFiles = projectFiles();
const available = new Set(sourceFiles);
for (const file of sourceFiles) {
  let directory = path.posix.dirname(file);
  while (directory !== ".") {
    available.add(directory);
    directory = path.posix.dirname(directory);
  }
}
available.add(".");
const files = sourceFiles.filter((file) => file.endsWith(".md"));
const missing = [];
for (const file of files) {
  // Check inline relative file links, not remote URLs, absolute local paths or anchors.
  // Keep code examples out of the document-link contract.
  const text = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, (block) =>
    block.replace(/[^\n]/g, " "),
  );
  for (const [index, line] of text.split("\n").entries()) {
    for (const match of line.matchAll(/\]\(([^)]+)\)/g)) {
      const target = decodeURIComponent(
        match[1].split(' "')[0].replace(/^<|>$/g, "").split("#")[0],
      );
      if (!target || /^(?:[a-z][\w+.-]*:|\/)/i.test(target)) continue;
      const resolved = path.resolve(path.dirname(file), target);
      const relative =
        path.relative(process.cwd(), resolved).split(path.sep).join("/") || ".";
      if (!existsSync(resolved))
        missing.push(`${file}:${index + 1}: missing ${target}`);
      else if (!available.has(relative))
        missing.push(
          `${file}:${index + 1}: target not in source snapshot ${target}`,
        );
    }
  }
}
if (missing.length) {
  console.error(
    `Missing relative document targets (${missing.length}):\n${missing.join("\n")}`,
  );
  process.exitCode = 1;
} else
  console.log(
    `PASS: relative file links in ${files.length} Markdown files (URLs/anchors not checked)`,
  );
