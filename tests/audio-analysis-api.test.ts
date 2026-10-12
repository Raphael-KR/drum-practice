import {expect,it} from 'vitest';
import {mkdirSync,mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {DatabaseSync,type SQLInputValue} from 'node:sqlite';
import {resolve} from 'node:path';
import {audioAnalysisAPI} from '../server/audio-analysis-api';
import {localAnalysisStore} from '../server/audio-analysis-local';
import type {AudioAnalysis} from '../src/audio-analysis-contract';
import worker from '../server/audio-analysis-worker';
import type {AnalysisDatabase} from '../server/audio-analysis-store';
const hash='a'.repeat(64), url=`http://localhost:5173/api/audio-analysis/v1/${hash}`;
const value:AudioAnalysis={analyzerVersion:1,sha256:hash,title:'곡',artist:'가수',duration:10,bpm:120,firstBeat:.2,beats:4,denominator:4,confidence:.8};
const put=(body:unknown,headers:Record<string,string>={})=>new Request(url,{method:'PUT',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)});
it('persists across server reopening and protects the first result from replacement',async()=>{
  mkdirSync(resolve('.tmp'),{recursive:true});
  const dir=mkdtempSync(resolve('.tmp/analysis-db-test-'));const path=resolve(dir,'cache.sqlite');
  let store=localAnalysisStore(path);
  try {
    expect((await audioAnalysisAPI(new Request(url),store)).status).toBe(404);
    expect((await audioAnalysisAPI(put(value),store)).status).toBe(200);
    await audioAnalysisAPI(put({...value,bpm:90}),store);
    store.close();store=localAnalysisStore(path);
    expect(await (await audioAnalysisAPI(new Request(url),store)).json()).toEqual(value);
  }finally{store.close();rmSync(dir,{recursive:true,force:true});}
});
it('uses the migration schema through the Worker D1 adapter and delegates static assets',async()=>{
  const db=new DatabaseSync(':memory:');
  db.exec(readFileSync('hosting/drizzle/0000_fluffy_hobgoblin.sql','utf8'));
  const database:AnalysisDatabase={prepare(sql){
    let values:SQLInputValue[]=[];
    return {bind(...args){values=args as SQLInputValue[];return this;},
      async first<T>(){return (db.prepare(sql).get(...values) ?? null) as T|null;},
      async run(){return db.prepare(sql).run(...values);}};
  }};
  const env={DB:database,ASSETS:{async fetch(){return new Response('player assets');}}};
  try {
    expect((await worker.fetch(put(value),env)).status).toBe(200);
    await worker.fetch(put({...value,bpm:80}),env);
    expect(await (await worker.fetch(new Request(url),env)).json()).toEqual(value);
    expect(await (await worker.fetch(new Request('http://localhost/player.html'),env)).text()).toBe('player assets');
  }finally{db.close();}
});
it('rejects raw media, extra/private fields, oversized bodies, foreign writes and bad versions',async()=>{
  const store=localAnalysisStore(':memory:');
  try {
    for(const body of [{...value,audio:'bytes'},{...value,filename:'a.mp3'},{...value,analyzerVersion:2},{...value,sha256:'../x'}])
      expect((await audioAnalysisAPI(put(body),store)).status).toBe(400);
    expect((await audioAnalysisAPI(put(value,{'content-type':'audio/mpeg'}),store)).status).toBe(415);
    expect((await audioAnalysisAPI(put(value,{'origin':'https://other.example'}),store)).status).toBe(403);
    expect((await audioAnalysisAPI(put('x'.repeat(5000)),store)).status).toBe(413);
    expect((await audioAnalysisAPI(new Request(url,{method:'DELETE'}),store)).status).toBe(405);
    expect((await audioAnalysisAPI(new Request(url),store)).status).toBe(404);
  }finally{store.close();}
});
