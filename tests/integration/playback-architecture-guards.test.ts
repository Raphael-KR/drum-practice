import { afterAll, expect, it } from 'vitest';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
const root=resolve(".");mkdirSync(join(root,'.tmp'),{recursive:true});
const fixture=mkdtempSync(join(root,'.tmp','architecture-guards-'));
cpSync(join(root,'src'),join(fixture,'src'),{recursive:true});
mkdirSync(join(fixture,'docs/plans'),{recursive:true});
cpSync(join(root,'docs/plans/PLAYBACK-SCREEN-INVENTORY.md'),join(fixture,'docs/plans/PLAYBACK-SCREEN-INVENTORY.md'));
mkdirSync(join(fixture,'scripts/checks'),{recursive:true});
cpSync(join(root,'scripts/checks/i18n-content-exceptions.json'),join(fixture,'scripts/checks/i18n-content-exceptions.json'));
afterAll(()=>rmSync(fixture,{recursive:true,force:true}));
const run=(script:string)=>spawnSync(process.execPath,[join(root,'scripts/checks',script)],{cwd:fixture,encoding:'utf8'});
it('accepts the current shared composition but rejects host ownership, retired actions, and copied forms',()=>{
 const resolution=spawnSync(process.execPath,['--input-type=module','-e',`
   import assert from 'node:assert/strict';
   import {resolveSource} from './scripts/checks/source-files.mjs';
   assert.equal(resolveSource('src/modules/playback/playback-screen.ts','./playback-tempo'), 'src/modules/playback/playback-tempo.ts');
   assert.equal(resolveSource('src/modules/playback/playback-screen.ts','../../model/model'), 'src/model/model.ts');
   assert.equal(resolveSource('src/modules/playback/playback-screen.ts','missing-package'), undefined);
 `],{cwd:root,encoding:'utf8'});
 expect(resolution.status, resolution.stderr).toBe(0);
 for(const script of ['check-playback-architecture.mjs','check-common-components.mjs','check-i18n.mjs','check-source-boundaries.mjs'])expect(run(script).status).toBe(0);
});
const cases=[
  ["src/apps/editor/main.ts",'\ncreatePlaybackWakeLock();','check-playback-architecture.mjs','playback ownership escaped'],
  ["src/modules/playback/playback-screen.ts",'\nrepeatPoint();','check-playback-architecture.mjs','Retired playback operation restored'],
  ["src/apps/editor/workspace.ts",'\nsoundFieldsHTML();','check-common-components.mjs','independently assembled playback UI'],
  ["src/modules/playback/playback-forms.ts",'\nfunction copiedSettings(){soundFieldsHTML();}','check-common-components.mjs','independently assembled playback UI'],
  ["src/modules/audio/audio-tempo.ts",'\nbtoa("nested");','check-common-components.mjs','binary codec bypass'],
  ["src/modules/audio/audio-tempo.ts",'\nconst untranslated = "검사 누락 금지";','check-i18n.mjs','unregistered Korean literal'],
  ["src/modules/playback/playback-screen.ts",'\nimport "../../apps/editor/workspace";','check-playback-architecture.mjs','host dependency'],
  ["src/model/model.ts",'\nimport "../platform/storage/storage";','check-source-boundaries.mjs','model dependency'],
  ["src/apps/player/player-app.ts",'\nimport "../editor/main";','check-source-boundaries.mjs','app dependency'],
 ];
it.each(cases)('rejects a violation in %s with %s', (file,extra,script,message) => {
  const path=join(fixture,file),original=readFileSync(path,'utf8');
  try {writeFileSync(path,original+extra);const result=run(script);expect(result.status).not.toBe(0);expect(result.stderr).toContain(message);}
  finally {writeFileSync(path,original);}
});
