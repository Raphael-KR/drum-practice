import {cp,readFile,readdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
// Preserve the canonical player build byte-for-byte. Vite builds only the document/security Worker.
await cp('player-assets','dist/client',{recursive:true});
const parity=JSON.parse(await readFile('source-parity.json','utf8'));
for(const {path,sha256} of parity.files){
  const actual=createHash('sha256').update(await readFile(`dist/client/${path}`)).digest('hex');
  if(actual!==sha256) throw Error(`Player asset mismatch: ${path}`);
}
const worker=await readFile('dist/server/index.js','utf8');
if(worker.includes('audio_analysis') || worker.includes('audio-analysis-review')) throw Error('Retired analysis code in Worker');
const manifest=JSON.parse(await readFile('dist/.openai/hosting.json','utf8'));
if(manifest.static || manifest.d1!=='DB' || manifest.r2) throw Error('Invalid retirement hosting configuration');
if(!(await readdir('dist/.openai/drizzle')).some(f=>f.endsWith('.sql'))) throw Error('Missing migration');
// Force document requests through the Worker, where CSP/frame headers are set.
for(const entry of ['index.html','player.html'])await rm(`dist/client/${entry}`);
console.log(`PASS: Player Worker and ${parity.files.length} matching player files (HTML delivered by Worker); no analysis API; D1 retained for table-removal migration`);
