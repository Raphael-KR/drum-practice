import assert from "node:assert/strict";
import { readFile, realpath } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { Script } from "node:vm";

const require = createRequire(import.meta.url);
const osmdManifest = await realpath(
  require.resolve("opensheetmusicdisplay/package.json"),
);
const appZip = await realpath(require.resolve("jszip/package.json"));
const osmdZip = await realpath(
  createRequire(osmdManifest).resolve("jszip/package.json"),
);
assert.equal(
  osmdZip,
  appZip,
  `Expected app and OSMD to share JSZip; app=${appZip}; OSMD=${osmdZip}`,
);

const osmd = JSON.parse(await readFile(osmdManifest, "utf8"));
const zip = JSON.parse(await readFile(appZip, "utf8"));
const entry = resolve(dirname(osmdManifest), osmd.main);
const source = await readFile(entry, "utf8");
// Parse the installed artifact without executing browser or renderer code.
new Script(source, { filename: entry });
assert.match(
  source,
  /require\(["']jszip["']\)/,
  `Expected OSMD ${osmd.version} to import shared JSZip; entry=${entry}`,
);
const embeddedVersions = Array.from(
  source.matchAll(/\.version=["']([^"']+)["'],\w+\.loadAsync=/g),
  (match) => match[1],
);
assert.equal(
  embeddedVersions.length,
  0,
  `Expected no embedded JSZip copy; entry=${entry}; found=${JSON.stringify(embeddedVersions)}`,
);

const notices = JSON.parse(
  await readFile("src/generated/third-party.generated.json", "utf8"),
).entries.filter((entry) => entry.name === "jszip");
assert.deepEqual(
  notices.map((entry) => entry.version),
  [zip.version],
  `Expected one JSZip ${zip.version} notice; found=${JSON.stringify(notices.map((entry) => entry.version))}`,
);
console.log(
  `PASS: app/OSMD share JSZip ${zip.version}; OSMD has no embedded JSZip copy; one license notice`,
);
