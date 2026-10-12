import { afterAll, expect, it } from 'vitest';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
const root=resolve('.');mkdirSync(join(root,'.tmp'),{recursive:true});
const fixture=mkdtempSync(join(root,'.tmp','architecture-guards-'));
cpSync(join(root,'src'),join(fixture,'src'),{recursive:true});
mkdirSync(join(fixture,'docs/plans'),{recursive:true});
cpSync(join(root,'docs/plans/PLAYBACK-SCREEN-INVENTORY.md'),join(fixture,'docs/plans/PLAYBACK-SCREEN-INVENTORY.md'));
afterAll(()=>rmSync(fixture,{recursive:true,force:true}));
const run=(script:string)=>spawnSync(process.execPath,[join(root,'scripts',script)],{cwd:fixture,encoding:'utf8'});
it('accepts the current shared composition but rejects host ownership, retired actions, and copied forms',()=>{
 for(const script of ['check-playback-architecture.mjs','check-common-components.mjs'])expect(run(script).status).toBe(0);
 const cases=[
  ['src/main.ts','\ncreatePlaybackWakeLock();','check-playback-architecture.mjs','playback ownership escaped'],
  ['src/playback-screen.ts','\nrepeatPoint();','check-playback-architecture.mjs','Retired playback operation restored'],
  ['src/workspace.ts','\nsoundFieldsHTML();','check-common-components.mjs','independently assembled playback UI'],
  ['src/playback-forms.ts','\nfunction copiedSettings(){soundFieldsHTML();}','check-common-components.mjs','independently assembled playback UI'],
 ];
 for(const [file,extra,script,message] of cases){
  const path=join(fixture,file),original=readFileSync(path,'utf8');
  try {writeFileSync(path,original+extra);const result=run(script);expect(result.status).not.toBe(0);expect(result.stderr).toContain(message);}
  finally {writeFileSync(path,original);}
 }
});
