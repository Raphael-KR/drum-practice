import { cp, readFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
// Preserve the canonical player build byte-for-byte. Vite builds only the document/security Worker.
await cp("player-assets", "dist/client", { recursive: true });
const parity = JSON.parse(await readFile("source-parity.json", "utf8"));
for (const { path, sha256 } of parity.files) {
  const actual = createHash("sha256")
    .update(await readFile(`dist/client/${path}`))
    .digest("hex");
  if (actual !== sha256) throw Error(`Player asset mismatch: ${path}`);
}
const manifest = JSON.parse(
  await readFile("dist/.openai/hosting.json", "utf8"),
);
if (manifest.static || manifest.d1 || manifest.r2)
  throw Error(
    `Invalid player hosting configuration: static=${manifest.static} d1=${manifest.d1} r2=${manifest.r2}`,
  );
// Force document requests through the Worker, where CSP/frame headers are set.
for (const entry of ["index.html", "player.html"])
  await rm(`dist/client/${entry}`);
console.log(
  `PASS: ${parity.files.length} matching player files; HTML delivered by Worker, no database binding`,
);
