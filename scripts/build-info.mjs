import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';

// Identify actual inputs, including uncommitted edits; exclude generated metadata.
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(e => e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`]));
  return nested.flat();
}
export async function writeBuildInfo() {
  const inputs = [...await files('src'), ...await files('scripts'), ...await files('public/icons'), 'package.json', 'package-lock.json', 'tsconfig.json', 'index.html', 'editor.html', 'player.html', 'vite.config.ts']
    .filter(p => p !== 'src/build-info.generated.json').sort();
  const hash = createHash('sha256');
  for (const path of inputs) { hash.update(path); hash.update(await readFile(path)); }
  const builtAt = new Date().toISOString();
  const info = { builtAt, source: hash.digest('hex').slice(0, 12) };
  await writeFile('src/build-info.generated.json', JSON.stringify(info, null, 2) + '\n');
  return info;
}
if (process.argv[1]?.endsWith('/build-info.mjs')) await writeBuildInfo();
