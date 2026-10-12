import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {ANALYZER_VERSION} from '../src/audio-analysis-contract';
import {ANALYSIS_SCHEMA,GET_ANALYSIS,PUT_ANALYSIS} from './audio-analysis-store';
import type {AnalysisStore} from './audio-analysis-api';
export function localAnalysisStore(path: string): AnalysisStore & {close(): void} {
  if(path !== ':memory:') mkdirSync(dirname(path),{recursive:true});
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode=WAL;');
  db.exec(ANALYSIS_SCHEMA);
  return {
    async get(hash) {
      const row=db.prepare(GET_ANALYSIS).get(hash,ANALYZER_VERSION) as {result_json:string}|undefined;
      return row ? JSON.parse(row.result_json) : undefined;
    },
    async put(value) {
      db.prepare(PUT_ANALYSIS).run(value.sha256,ANALYZER_VERSION,JSON.stringify(value));
      if(!db.prepare(GET_ANALYSIS).get(value.sha256,ANALYZER_VERSION)) throw Error('Analysis cache capacity reached');
    },
    close(){db.close();},
  };
}
