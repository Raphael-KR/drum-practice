import {expect,it} from 'vitest';
import {mkdtempSync,mkdirSync,rmSync,readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {localAnalysisStore} from '../server/audio-analysis-local';
import {exportReviewedAnalysis} from '../scripts/export-reviewed-analysis.mjs';
it('exports only explicitly approved records and only the credential digest',async()=>{
 mkdirSync('.tmp',{recursive:true});const root=mkdtempSync(resolve('.tmp/export-review-'));const target=resolve(root,'target');mkdirSync(resolve(target,'server'),{recursive:true});
 const store=localAnalysisStore(resolve(root,'data/runtime/audio-analysis.sqlite'));
 const value={analyzerVersion:4,sha256:'a'.repeat(64),title:'승인',artist:'가수',duration:10,bpm:120,firstBeat:.2,beats:4,denominator:4,confidence:.8};
 try {
  store.approve(value);await store.putPending({...value,sha256:'b'.repeat(64)},Math.floor(Date.now()/1000));
  expect(exportReviewedAnalysis(root,target)).toBe(1);
  expect(readdirSync(resolve(target,'player-assets/analysis-approved'))).toEqual([value.sha256+'.json']);
  expect(JSON.parse(readFileSync(resolve(target,'player-assets/analysis-approved',value.sha256+'.json'),'utf8'))).toEqual(value);
  const token=readFileSync(resolve(root,'data/runtime/analysis-review-token'),'utf8');const generated=readFileSync(resolve(target,'server/approved-analysis.ts'),'utf8');
  expect(generated).not.toContain(token);expect(generated).toContain(createHash('sha256').update(token).digest('hex'));expect(generated).not.toContain('b'.repeat(64));
 }finally{store.close();rmSync(root,{recursive:true,force:true});}
});
