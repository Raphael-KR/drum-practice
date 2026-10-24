import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const source = resolve(
  process.env.PNPM_SHARED_CATALOG ||
    resolve(homedir(), "Library/Preferences/pnpm/shared-catalog.yaml"),
);
const snapshot = resolve(root, "config/shared-catalog.yaml");
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function main() {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 1 || args[0] !== "--check"))
    throw new Error(
      `Expected no arguments or --check; received ${JSON.stringify(args)}`,
    );
  const bytes = await readFile(source);
  if (args[0] === "--check") {
    const saved = await readFile(snapshot);
    if (!bytes.equals(saved))
      throw new Error(
        `Catalog differs: source=${source} sha256=${digest(bytes)}; snapshot=${snapshot} sha256=${digest(saved)}. Run pnpm run catalog:sync.`,
      );
    console.log(
      `PASS: central catalog matches ${snapshot}; sha256=${digest(bytes)}`,
    );
    return;
  }

  // Reuse pnpm's YAML/include validation without adding a parser dependency.
  // Read the captured bytes, so an edit during validation cannot change the copy.
  await mkdir(resolve(root, ".tmp"), { recursive: true });
  const temporary = await mkdtemp(resolve(root, ".tmp/catalog-"));
  try {
    const candidate = resolve(temporary, "catalog.yaml");
    await writeFile(candidate, bytes);
    await writeFile(
      resolve(temporary, "pnpm-workspace.yaml"),
      "include:\n  ./catalog.yaml: [catalog]\n",
    );
    const manifest = JSON.parse(
      await readFile(resolve(root, "package.json"), "utf8"),
    );
    await writeFile(
      resolve(temporary, "package.json"),
      JSON.stringify({
        private: true,
        packageManager: manifest.packageManager,
      }),
    );
    const catalog = JSON.parse(
      execFileSync("pnpm", ["config", "get", "catalog", "--json"], {
        cwd: temporary,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }),
    );
    for (const file of ["package.json", "hosting/package.json"]) {
      const pkg = JSON.parse(await readFile(resolve(root, file), "utf8"));
      for (const field of [
        "dependencies",
        "devDependencies",
        "optionalDependencies",
        "peerDependencies",
      ])
        for (const [name, specifier] of Object.entries(pkg[field] || {})) {
          if (specifier !== "catalog:" && specifier !== "catalog:default")
            continue;
          if (typeof catalog?.[name] !== "string" || !catalog[name].trim())
            throw new Error(
              `${file} ${field}.${name}: expected a catalog version string in ${source}; received ${JSON.stringify(catalog?.[name] ?? null)}`,
            );
        }
    }
    await mkdir(resolve(root, "config"), { recursive: true });
    await rename(candidate, snapshot);
    console.log(`Synced ${source} -> ${snapshot}; sha256=${digest(bytes)}`);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  console.error(
    `Catalog synchronization failed: source=${source}; snapshot=${snapshot}; ${error.message}`,
  );
  if (error.stdout?.length) console.error(error.stdout.toString().trim());
  if (error.stderr?.length) console.error(error.stderr.toString().trim());
  process.exitCode = 1;
}
