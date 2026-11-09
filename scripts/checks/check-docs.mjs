import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { markdownDocument } from "./markdown-document.mjs";
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
const documents = new Map();
for (const file of files) {
  try {
    documents.set(file, await markdownDocument(readFileSync(file, "utf8")));
  } catch (error) {
    missing.push(`${file}: Markdown parse failed: ${error.message}`);
  }
}
let localLinks = 0;
let fragmentLinks = 0;
for (const file of files) {
  for (const { url, line } of documents.get(file)?.links ?? []) {
    // No network requests or access to absolute paths outside the source snapshot.
    if (!url || /^(?:[a-z][\w+.-]*:|\/)/i.test(url)) continue;
    const hash = url.indexOf("#");
    let target;
    let fragment;
    try {
      target = decodeURIComponent(hash < 0 ? url : url.slice(0, hash));
      fragment = hash < 0 ? "" : decodeURIComponent(url.slice(hash + 1));
    } catch (error) {
      missing.push(
        `${file}:${line}: invalid local URL ${url}: ${error.message}`,
      );
      continue;
    }
    const resolved = target
      ? path.resolve(path.dirname(file), target)
      : path.resolve(file);
    const relative =
      path.relative(process.cwd(), resolved).split(path.sep).join("/") || ".";
    localLinks++;
    if (!available.has(relative)) {
      missing.push(
        `${file}:${line}: target not in source snapshot: ${url} -> ${relative}`,
      );
    } else if (!existsSync(resolved)) {
      missing.push(`${file}:${line}: missing file: ${url} -> ${relative}`);
    } else if (fragment && relative.endsWith(".md")) {
      fragmentLinks++;
      const document = documents.get(relative);
      if (!document) {
        missing.push(
          `${file}:${line}: anchor target could not be parsed: ${relative}`,
        );
      } else if (!document.anchors.has(fragment)) {
        missing.push(
          `${file}:${line}: missing anchor: ${url} -> ${relative}#${fragment} (${document.anchors.size} available anchors)`,
        );
      }
    }
  }
}
if (missing.length) {
  console.error(
    `Invalid document targets (${missing.length}):\n${missing.join("\n")}`,
  );
  process.exitCode = 1;
} else
  console.log(
    `PASS: ${files.length} Markdown files, ${localLinks} local links, ${fragmentLinks} Markdown anchor links (external URLs/absolute paths/non-Markdown fragments not checked)`,
  );
