import {cp,readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
// Preserve the canonical player build byte-for-byte. Vite builds only the API Worker.
await cp('player-assets','dist/client',{recursive:true});
const parity=JSON.parse(await readFile('source-parity.json','utf8'));
for(const {path,sha256} of parity.files){
  const actual=createHash('sha256').update(await readFile(`dist/client/${path}`)).digest('hex');
  if(actual!==sha256) throw Error(`Player asset mismatch: ${path}`);
}
const worker=await readFile('dist/server/index.js','utf8');
if(!worker.includes('audio_analysis')) throw Error('Missing analysis API');
const manifest=JSON.parse(await readFile('dist/.openai/hosting.json','utf8'));
if(manifest.static || manifest.d1!=='DB' || manifest.r2) throw Error('Invalid metadata-only hosting configuration');
if(!(await readdir('dist/.openai/drizzle')).some(f=>f.endsWith('.sql'))) throw Error('Missing migration');
console.log(`PASS: Worker/D1 and ${parity.files.length} unchanged player assets; no audio upload binding`);
