import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const source = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(process.argv[2] || '../drum-practice-sites');
if (target === source) throw new Error('Sites mirror must differ from source');
await mkdir(target, { recursive: true });
await mkdir(resolve(target,'docs'), {recursive:true});
await cp(resolve(source,'docs/UI-COMPONENTS.md'),resolve(target,'docs/UI-COMPONENTS.md'));
for (const entry of ['src','scripts','index.html','package.json','package-lock.json','tsconfig.json','vite.config.ts']) {
  await cp(resolve(source,entry),resolve(target,entry),{recursive:true});
}
for (const folder of ['public/licenses','dist/assets','dist/licenses']) {
  await cp(resolve(source,folder),resolve(target,folder),{recursive:true});
}
for (const name of ['song.json','score.pdf','audio.mp3','score.musicxml','page-1.png','page-2.png','page-3.png']) {
  for (const base of ['public','dist']) {
    await mkdir(resolve(target,base,'demo'),{recursive:true});
    await cp(resolve(source,base,'demo',name),resolve(target,base,'demo',name));
  }
}
await cp(resolve(source,'dist/index.html'),resolve(target,'dist/index.html'));
for (const name of ['portable-combined.html','portable-template.html','portable-musicxml.html','portable-pdf.html']) {
  for (const base of ['public','dist']) await cp(resolve(source,base,name),resolve(target,base,name));
}
const digests = [];
async function check(dir) {
 for (const e of await readdir(resolve(source,dir),{withFileTypes:true})) {
  const path=dir+'/'+e.name;
  if(e.isDirectory()) { await check(path); continue; }
  const a=await readFile(resolve(source,path)), b=await readFile(resolve(target,path));
  if(!a.equals(b)) throw new Error('Mirror mismatch: '+path);
  digests.push({path,sha256:createHash('sha256').update(a).digest('hex')});
 }
}
await check('src');
await writeFile(resolve(target,'source-parity.json'),JSON.stringify({canonicalProject:source,files:digests},null,2)+'\n');
console.log(JSON.stringify({target,verifiedSourceFiles:digests.length}));
