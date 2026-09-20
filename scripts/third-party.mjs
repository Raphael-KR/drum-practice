import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
const seen = new Set();
const entries = [];
async function collect(root) {
  const p = JSON.parse(await readFile(`${root}/package.json`, 'utf8'));
  const key = `${p.name}@${p.version}`;
  if (seen.has(key)) return;
  seen.add(key);
  const names = (await readdir(root)).filter(n => /^(licen[sc]e|copying|notice)(\.|$)/i.test(n));
  const notices = await Promise.all(names.map(async n => `${n}\n${await readFile(`${root}/${n}`, 'utf8')}`));
  if (!notices.length) {
    const readme = (await readdir(root)).find(n=>/^readme/i.test(n));
    const text = readme ? await readFile(`${root}/${readme}`, 'utf8') : '';
    const at = text.search(/^#+ (?:License|Copyright)/im);
    if (at < 0) throw Error(`Missing license: ${key}`);
    notices.push(text.slice(at));
  }
  let url = typeof p.repository === 'string' ? p.repository : p.repository?.url || p.homepage || '';
  url = url.replace(/^git\+/, '').replace(/^git:\/\//,'https://').replace(/\.git$/,'');
  if (!url.startsWith('https://')) url = '';
  entries.push({name:p.name,version:p.version,license:p.name==='jszip'?'MIT (선택)':p.license || 'See license',url,text:notices.join('\n\n')});
  const require = createRequire(resolve(root, 'package.json'));
  for (const name of Object.keys(p.dependencies || {}).filter(n=>!n.startsWith('@types/'))) {
    const path = require.resolve(`${name}/package.json`);
    await collect(dirname(path));
  }
}
export async function writeThirdParty() {
  seen.clear(); entries.length=0;
  const pkg=JSON.parse(await readFile('package.json','utf8'));
  for (const name of Object.keys(pkg.dependencies)) await collect(`node_modules/${name}`);
  // PDF.js ships these notices for bundled font, CMap and image decoder assets.
  for (const dir of ['standard_fonts','cmaps','wasm','iccs']) {
    const root=`node_modules/pdfjs-dist/${dir}`;
    for (const name of (await readdir(root)).filter(n=>/^LICENSE/.test(n)))
      entries.push({name:`PDF.js ${dir}/${name}`,version:'',license:'See license',url:'https://github.com/mozilla/pdf.js',text:await readFile(`${root}/${name}`,'utf8')});
  }
  entries.sort((a,b)=>a.name.localeCompare(b.name));
  const source = await readFile('node_modules/soundtouchjs/dist/soundtouch.js','utf8');
  await writeFile('src/third-party.generated.json', JSON.stringify({entries, soundtouchSource:source}));
}
if (process.argv[1]?.endsWith('/third-party.mjs')) await writeThirdParty();
