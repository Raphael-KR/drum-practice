import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
const out='docs/experiments/renderer-benchmark';
await mkdir(out,{recursive:true});
await copyFile(process.argv[2]||'public/demo/qa/musicxml-candidate.musicxml',`${out}/score.musicxml`);
await copyFile('scripts/benchmark-renderer.html',`${out}/index.html`);
await build({entryPoints:['scripts/benchmark-renderer.ts'],bundle:true,format:'iife',outfile:`${out}/bench.js`,minify:true});
console.log('Run python3 scripts/benchmark-renderer-server.py, then open http://127.0.0.1:5187/?run=desktop or ?run=simulator.');
