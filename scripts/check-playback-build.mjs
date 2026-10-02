import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
// Run after `npm run portable`: inspect generated code, not only visible controls.
for (const format of ['combined']) {
 const html=await readFile(`public/portable-${format}.html`,'utf8');
 const runtime=html.match(/id="portable-runtime">([\s\S]*?)<\/script>/)[1];
 const meta=JSON.parse(await readFile(`docs/experiments/html-playback/${format}-metafile.json`,'utf8'));
 const used=Object.values(meta.outputs).flatMap(o=>Object.entries(o.inputs).filter(([,v])=>v.bytesInOutput>0).map(([name])=>name));
 for(const module of ['src/playback-shell.ts','src/playback-assets.ts','src/icon-button.ts','src/binary-asset.ts','src/playback-screen.ts','src/playback-forms.ts','src/playback-position.ts','src/html.ts','src/playback-ui.ts','src/playback-measure.ts','src/icon-svg.ts','src/marker-icon.ts','src/playback-layout.ts','src/playback-actions.ts','src/dialog-ui.ts','src/playback-frame.ts','src/repeat-ui.ts','src/marker-ui.ts','src/settings-ui.ts'])
   assert(used.includes(module), 'Missing shared UI module: '+module);
 for(const selector of ['#editor-dialog','#library-dialog','#new-dialog'])
   assert(!html.includes(selector), 'Authoring CSS bundled: '+selector);
 assert(!used.some(n=>/src\/(main|storage|workspace|score-management|canonical-xml|musicxml|pdf|library-backup|editor-session|edit-history|portable)\.ts$|node_modules\/(opensheetmusicdisplay|pdfjs-dist|jszip)\//.test(n)),used.join('\n'));
 for(const banned of ['localStorage','indexedDB','saveRecord','library-button','song-export-dialog','export-selected','import-vocal'])assert(!runtime.includes(banned),`${format}: ${banned}`);
 assert(!/<(?:script|link)[^>]+(?:src|href)=/.test(html),'External runtime resource');
 assert(html.includes("connect-src 'none'"));
 console.log(`PASS ${format}: ${Buffer.byteLength(html)} bytes; ${used.length} included modules; no management/storage/source renderer`);
}
