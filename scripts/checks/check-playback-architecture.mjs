import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { resolveSource } from './source-files.mjs';
// Keep host adapters from reacquiring playback ownership. Audit actual call expressions.
const owned=['renderMeasure','measureWidth','measurePosition','scoreLayout','renderScoreRows','layoutScoreLyrics','buildScoreTrack','updateScoreFrame','installScoreScroll','attachPlaybackGestures','beginPlaybackScrub','finishPlaybackScrub','movePlaybackScrub','seekPlaybackFreely','installPlaybackWheel','installPlaybackKeys','repeatPreset','updateRepeatControls','changePlaybackLoop','playbackPosition','copyPosition','mountLoopSlots','toggleMeasureMarker','createPlaybackWakeLock'];
const retired=['repeatPoint','fillRepeatFields','markMeasure'];
function calls(file){const s=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,s,ts.ScriptTarget.Latest,true),out=[];function visit(n){if(ts.isCallExpression(n))out.push({name:n.expression.getText(ast),line:ast.getLineAndCharacterOfPosition(n.getStart(ast)).line+1});ts.forEachChild(n,visit)}visit(ast);return out}
const report={};
for(const file of ["src/apps/editor/main.ts","src/modules/playback/playback-runtime.ts"]){
 const sites=calls(file);assert.equal(sites.filter(c=>c.name==='createPlaybackScreen').length,1,`${file}: must mount exactly one common screen`);
 for(const name of [...owned,...retired])assert(!sites.some(c=>c.name===name),`${file}: playback ownership escaped into host: ${name}`);
 const source=fs.readFileSync(file,'utf8');
 assert(!/<input[^>]*id=\\?["'](?:loop-a|loop-b|loop-ab|loop-bb|music-volume|click-volume)/.test(source),`${file}: copied playback form`);
 report[file]=sites.filter(c=>c.name==='createPlaybackScreen'||c.name.startsWith('playback.'));
}
for(const file of ["src/apps/player/player-app.ts"]) {
 const sites=calls(file); assert.equal(sites.filter(c=>c.name==='mountPlaybackRuntime').length,1,`${file}: shared runtime mount`);
 for(const name of [...owned,...retired])assert(!sites.some(c=>c.name===name),`${file}: playback ownership escaped`);
}
const core=calls("src/modules/playback/playback-screen.ts");for(const name of retired)assert(!core.some(c=>c.name===name),`Retired playback operation restored: ${name}`);for(const name of owned)assert(core.some(c=>c.name===name),`Missing central owner call: ${name}`);
for(const file of ["src/modules/playback/playback-screen.ts","src/modules/playback/playback-forms.ts"]){
 const source=fs.readFileSync(file,'utf8'), ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
 const forbidden=new Set(["src/platform/storage/storage.ts","src/apps/editor/workspace.ts","src/apps/editor/score-management.ts","src/apps/editor/editor-session.ts","src/apps/editor/main.ts","src/apps/player/player-app.ts"]);
 function imports(n) {
  if (ts.isStringLiteral(n) && forbidden.has(resolveSource(file,n.text))) assert.fail(`${file}: host dependency ${n.text}`);
  ts.forEachChild(n,imports);
 }
 imports(ast);
}
const inventory=fs.readFileSync('docs/plans/PLAYBACK-SCREEN-INVENTORY.md','utf8');for(const id of [...Array.from({length:25},(_,i)=>`P${String(i+1).padStart(2,'0')}`),...Array.from({length:6},(_,i)=>`E${String(i+1).padStart(2,'0')}`)])assert(inventory.includes(`| ${id} |`),`Missing inventory item ${id}`);
fs.mkdirSync('docs/experiments',{recursive:true});fs.writeFileSync('docs/experiments/playback-call-sites.json',JSON.stringify(report,null,2));
console.log(`PASS: 2 hosts / 1 playback owner / ${owned.length} owned operations / 31 inventory entries`);
