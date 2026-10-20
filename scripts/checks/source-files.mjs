import fs from "node:fs";
import path from "node:path";

/** The same complete, stable source inventory is used by all static guards. */
export function sourceFiles(root = "src") {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const file = `${root}/${entry.name}`;
    return entry.isDirectory() ? sourceFiles(file) : file.endsWith(".ts") ? [file] : [];
  }).sort();
}

export function resolveSource(from, specifier) {
  if (!specifier.startsWith(".")) return undefined;
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(from), specifier));
  return [target, `${target}.ts`, `${target}/index.ts`].find(file =>
    fs.existsSync(file) && fs.statSync(file).isFile());
}
