import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
// Run after `npm run portable`: inspect generated code, not only visible controls.
for (const format of ['combined']) {
 const html=await readFile(`public/portable-${format}.html`,'utf8');
 const runtime=html.match(/id="portable-runtime">([\s\S]*?)<\/script>/)[1];
 const meta=JSON.parse(await readFile(`docs/experiments/html-playback/${format}-metafile.json`,'utf8'));
 const used=Object.values(meta.outputs).flatMap(o=>Object.entries(o.inputs).filter(([,v])=>v.bytesInOutput>0).map(([name])=>name));
 assert(!used.some(n=>/src\/(main|storage|workspace|score-management|canonical-xml|musicxml|pdf|library-backup|editor-session|edit-history|portable)\.ts$|node_modules\/(opensheetmusicdisplay|pdfjs-dist|jszip)\//.test(n)),used.join('\n'));
 for(const banned of ['localStorage','indexedDB','saveRecord','library-button','song-export-dialog','export-selected','import-vocal'])assert(!runtime.includes(banned),`${format}: ${banned}`);
 assert(!/<(?:script|link)[^>]+(?:src|href)=/.test(html),'External runtime resource');
 assert(html.includes("connect-src 'none'"));
 console.log(`PASS ${format}: ${Buffer.byteLength(html)} bytes; ${used.length} included modules; no management/storage/source renderer`);
}
