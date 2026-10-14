import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import {
  ANALYZER_VERSION,
  MAX_ANALYSIS_BYTES,
  validAudioAnalysis,
  type AudioAnalysis,
} from "../src/audio-analysis-contract";
import {
  ANALYSIS_SCHEMA,
  REVIEW_SCHEMA,
  d1AnalysisStore,
  type AnalysisDatabase,
} from "./audio-analysis-store";
import { analysisPolicy, type PendingAnalysis } from "./analysis-policy";
export function localAnalysisStore(path: string) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode=WAL;");
  db.exec(ANALYSIS_SCHEMA);
  db.exec(REVIEW_SCHEMA);
  db.exec(`CREATE TABLE IF NOT EXISTS audio_analysis_approved (
    sha256 TEXT PRIMARY KEY, result_json TEXT NOT NULL, reviewed_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS audio_analysis_decisions (
    sha256 TEXT PRIMARY KEY, decision TEXT NOT NULL, decided_at INTEGER NOT NULL);`);
  const adapter: AnalysisDatabase = {
    prepare(sql) {
      let values: SQLInputValue[] = [];
      return {
        bind(...args) {
          values = args as SQLInputValue[];
          return this;
        },
        async first<T>() {
          return (db.prepare(sql).get(...values) || null) as T | null;
        },
        async run() {
          return db.prepare(sql).run(...values);
        },
        async all<T>() {
          return { results: db.prepare(sql).all(...values) as T[] };
        },
      };
    },
  };
  const store = d1AnalysisStore(adapter);
  const getApproved = (hash: string): AudioAnalysis | undefined => {
    const row = db
      .prepare("SELECT result_json FROM audio_analysis_approved WHERE sha256=?")
      .get(hash) as { result_json: string } | undefined;
    if (!row) return;
    const value = JSON.parse(row.result_json);
    return validAudioAnalysis(value, hash) ? value : undefined;
  };
  return {
    ...store,
    getApproved,
    approved() {
      return db
        .prepare(
          "SELECT sha256,result_json FROM audio_analysis_approved ORDER BY sha256",
        )
        .all() as { sha256: string; result_json: string }[];
    },
    decided(hash: string) {
      return !!db
        .prepare("SELECT sha256 FROM audio_analysis_decisions WHERE sha256=?")
        .get(hash);
    },
    async candidates() {
      const now = Math.floor(Date.now() / 1000);
      await db
        .prepare("DELETE FROM audio_analysis_pending WHERE created_at<=?")
        .run(now - analysisPolicy.pendingSeconds);
      const pending = db
        .prepare(
          "SELECT sha256,result_json,created_at FROM audio_analysis_pending WHERE analyzer_version=?",
        )
        .all(ANALYZER_VERSION) as unknown as PendingAnalysis[];
      // Legacy values remain untrusted; do not silently approve or delete them.
      const legacy = db
        .prepare(
          "SELECT sha256,result_json,0 AS created_at FROM audio_analysis WHERE analyzer_version=? LIMIT ?",
        )
        .all(
          ANALYZER_VERSION,
          analysisPolicy.pendingCount,
        ) as unknown as PendingAnalysis[];
      return [
        ...new Map(
          [...legacy, ...pending].map((row) => [row.sha256, row]),
        ).values(),
      ].filter((row) => {
        try {
          return (
            !this.decided(row.sha256) &&
            !getApproved(row.sha256) &&
            validAudioAnalysis(JSON.parse(row.result_json), row.sha256)
          );
        } catch {
          return false;
        }
      });
    },
    approve(value: AudioAnalysis) {
      if (
        !validAudioAnalysis(value, value.sha256) ||
        new TextEncoder().encode(JSON.stringify(value)).length >
          MAX_ANALYSIS_BYTES
      )
        throw Error("Invalid analysis");
      const now = Math.floor(Date.now() / 1000);
      db.exec("BEGIN IMMEDIATE");
      try {
        db.prepare(
          "INSERT INTO audio_analysis_approved VALUES (?,?,?) ON CONFLICT(sha256) DO UPDATE SET result_json=excluded.result_json,reviewed_at=excluded.reviewed_at",
        ).run(value.sha256, JSON.stringify(value), now);
        db.prepare(
          "INSERT INTO audio_analysis_decisions VALUES (?,'approved',?) ON CONFLICT(sha256) DO UPDATE SET decision=excluded.decision,decided_at=excluded.decided_at",
        ).run(value.sha256, now);
        db.prepare("DELETE FROM audio_analysis_pending WHERE sha256=?").run(
          value.sha256,
        );
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    reject(hash: string) {
      db.prepare(
        "INSERT INTO audio_analysis_decisions VALUES (?,'rejected',?) ON CONFLICT(sha256) DO UPDATE SET decision=excluded.decision,decided_at=excluded.decided_at",
      ).run(hash, Math.floor(Date.now() / 1000));
      db.prepare("DELETE FROM audio_analysis_pending WHERE sha256=?").run(hash);
    },
    close() {
      db.close();
    },
  };
}
