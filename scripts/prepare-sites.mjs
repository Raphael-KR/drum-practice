import { cp, mkdir, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const source = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2] ? resolve(process.argv[2]) : resolve(source, 'deployment/sites');
if (target === source) throw new Error('Sites checkout must differ from source');
const manifest = JSON.parse(await readFile(resolve(target,'.openai/hosting.json'),'utf8'));
if (manifest.project_id !== 'appgprj_6ab0790baa048191aaee49f58c1ffe7b') throw new Error('Wrong Site');
// Replace only the previous generated mirror; its history is retained in Site Git.
for(const entry of ['src','server','scripts','build','db','drizzle','player-assets','public/demo','dist','index.html','package.json','package-lock.json','tsconfig.json','vite.config.ts','drizzle.config.ts','source-parity.json'])
  await rm(resolve(target,entry),{recursive:true,force:true});
await mkdir(resolve(target,'player-assets'),{recursive:true});
await cp(resolve(source,'dist/player'),resolve(target,'player-assets'),{recursive:true});
await cp(resolve(target,'player-assets/player.html'),resolve(target,'player-assets/index.html'));
for(const entry of ['build','scripts','db','drizzle','index.html','package.json','package-lock.json','vite.config.ts','drizzle.config.ts'])
  await cp(resolve(source,'hosting',entry),resolve(target,entry),{recursive:true});
await mkdir(resolve(target,'server'),{recursive:true});
await mkdir(resolve(target,'src'),{recursive:true});
for(const entry of ['player-worker.ts','security-headers.ts'])
  await cp(resolve(source,'server',entry),resolve(target,'server',entry));
const playerDocument=await readFile(resolve(source,'dist/player/player.html'),'utf8');
await writeFile(resolve(target,'server/player-document.ts'),`// Generated HTML response; kept out of public static routing.\nexport const playerDocument=${JSON.stringify(playerDocument)};\n`);
delete manifest.static;manifest.d1='DB';manifest.r2=null;
await writeFile(resolve(target,'.openai/hosting.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(resolve(target,'.gitignore'),'node_modules/\ndist/\n.wrangler/\n.sites-runtime/\n.env*\n*.log\n');
await writeFile(resolve(target,'README.md'),'# 드럼연습실\n\nCanonical source: /Users/raphael/Playground/drum-practice\n\nPlayer-only assets with security headers. Audio and analysis stay on each device. The D1 binding is retained only to apply the final table-removal migration. Authoring app remains local-only. Run scripts/prepare-sites.mjs in the canonical project, install dependencies, then npm run build here.\n');
const digests=[];
async function scan(dir='') {for(const e of await readdir(resolve(target,'player-assets',dir),{withFileTypes:true})) {const p=dir?`${dir}/${e.name}`:e.name;if(e.isDirectory()) await scan(p);else digests.push({path:p,sha256:createHash('sha256').update(await readFile(resolve(target,'player-assets',p))).digest('hex')});}}
await scan();
await writeFile(resolve(target,'source-parity.json'),JSON.stringify({canonicalProject:source,app:'player',version:JSON.parse(await readFile(resolve(source,'src/app-versions.json'),'utf8')).player.version,files:digests},null,2)+'\n');
console.log(JSON.stringify({target,files:digests.length}));
