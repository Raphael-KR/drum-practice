import { readFile, writeFile } from 'node:fs/promises';
const [target, kind = 'patch'] = process.argv.slice(2);
if (!['editor', 'player', 'both'].includes(target) || !['major', 'minor', 'patch'].includes(kind)) {
  throw new Error('Usage: npm run version:app -- editor|player|both patch|minor|major');
}
const file = new URL('../src/app-versions.json', import.meta.url);
const apps = JSON.parse(await readFile(file, 'utf8'));
for (const key of target === 'both' ? ['editor', 'player'] : [target]) {
  const parts = apps[key].version.split('.').map(Number);
  const index = {major:0, minor:1, patch:2}[kind];
  parts[index]++;
  for(let i=index+1;i<3;i++) parts[i]=0;
  apps[key].version=parts.join('.');
  console.log(`${apps[key].name}: ${apps[key].version}`);
}
await writeFile(file, JSON.stringify(apps, null, 2)+'\n');
