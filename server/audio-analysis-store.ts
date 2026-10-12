import {ANALYZER_VERSION, type AudioAnalysis} from '../src/audio-analysis-contract';
import type {AnalysisStore} from './audio-analysis-api';
export const ANALYSIS_SCHEMA = `CREATE TABLE IF NOT EXISTS audio_analysis (
  sha256 TEXT NOT NULL,
  analyzer_version INTEGER NOT NULL,
  result_json TEXT NOT NULL,
  PRIMARY KEY (sha256, analyzer_version)
);`;
export const GET_ANALYSIS = 'SELECT result_json FROM audio_analysis WHERE sha256 = ? AND analyzer_version = ?';
export const PUT_ANALYSIS = `INSERT OR IGNORE INTO audio_analysis (sha256, analyzer_version, result_json)
  SELECT ?, ?, ? WHERE (SELECT COUNT(*) FROM audio_analysis) < 10000`;
interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
}
export interface AnalysisDatabase {prepare(sql: string): D1Statement;}
export function d1AnalysisStore(db: AnalysisDatabase): AnalysisStore {
  return {
    async get(hash) {
      const row = await db.prepare(GET_ANALYSIS).bind(hash,ANALYZER_VERSION).first<{result_json:string}>();
      return row ? JSON.parse(row.result_json) : undefined;
    },
    async put(value: AudioAnalysis) {
      await db.prepare(PUT_ANALYSIS).bind(value.sha256,ANALYZER_VERSION,JSON.stringify(value)).run();
      if(!await db.prepare(GET_ANALYSIS).bind(value.sha256,ANALYZER_VERSION).first()) throw Error('Analysis cache capacity reached');
    },
  };
}
