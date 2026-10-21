import { createHash } from "node:crypto";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";

// Identify actual inputs, including uncommitted edits; exclude generated metadata.
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((e) => e.name !== "__pycache__" && !e.name.endsWith(".pyc"))
      .map((e) =>
        e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
      ),
  );
  return nested.flat();
}
export async function writeBuildInfo() {
  const hosting = [
    ...(await files("hosting/build")),
    ...(await files("hosting/scripts")),
    ...(await files("hosting/db")),
    ...(await files("hosting/drizzle")),
    "hosting/package.json",
    "hosting/package-lock.json",
    "hosting/vite.config.ts",
    "hosting/drizzle.config.ts",
  ];
  const inputs = [
    ...(await files("src")),
    ...(await files("server")),
    ...(await files("scripts")),
    ...(await files("tools")),
    ...(await files("public/icons")),
    ...hosting,
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "index.html",
    "editor.html",
    "player.html",
    "vite.config.ts",
  ]
    .filter((p) => p !== "src/generated/build-info.generated.json")
    .sort();
  const hash = createHash("sha256");
  for (const path of inputs) {
    hash.update(path);
    hash.update(await readFile(path));
  }
  const builtAt = new Date().toISOString();
  const info = { builtAt, source: hash.digest("hex").slice(0, 12) };
  await mkdir("src/generated", { recursive: true });
  await writeFile(
    "src/generated/build-info.generated.json",
    JSON.stringify(info, null, 2) + "\n",
  );
  return info;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await writeBuildInfo();
