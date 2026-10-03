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
for(const entry of ['src','scripts','public/demo','dist','index.html','package.json','package-lock.json','tsconfig.json','vite.config.ts','source-parity.json'])
  await rm(resolve(target,entry),{recursive:true,force:true});
await mkdir(resolve(target,'dist'),{recursive:true});
await cp(resolve(source,'dist/player'),resolve(target,'dist'),{recursive:true});
await cp(resolve(target,'dist/player.html'),resolve(target,'dist/index.html'));
await writeFile(resolve(target,'.gitignore'),'node_modules/\n.sites-runtime/\n.env*\n*.log\n');
await writeFile(resolve(target,'README.md'),'# 드럼연습실\n\nCanonical source: /Users/raphael/Playground/drum-practice\n\nPlayer-only static release. Authoring app is local-only. Rebuild canonical player and run scripts/prepare-sites.mjs.\n');
const digests=[];
async function scan(dir='') {for(const e of await readdir(resolve(target,'dist',dir),{withFileTypes:true})) {const p=dir?`${dir}/${e.name}`:e.name;if(e.isDirectory()) await scan(p);else digests.push({path:p,sha256:createHash('sha256').update(await readFile(resolve(target,'dist',p))).digest('hex')});}}
await scan();
await writeFile(resolve(target,'source-parity.json'),JSON.stringify({canonicalProject:source,app:'player',version:JSON.parse(await readFile(resolve(source,'src/app-versions.json'),'utf8')).player.version,files:digests},null,2)+'\n');
console.log(JSON.stringify({target,files:digests.length}));
