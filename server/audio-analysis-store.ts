import {
  ANALYZER_VERSION,
  type AudioAnalysis,
} from "../src/audio-analysis-contract";
import { analysisPolicy, windowEnd } from "./analysis-policy";

// Keep the legacy cache intact. It is never a source of approved public data.
export const ANALYSIS_SCHEMA = `CREATE TABLE IF NOT EXISTS audio_analysis (
  sha256 TEXT NOT NULL, analyzer_version INTEGER NOT NULL, result_json TEXT NOT NULL,
  PRIMARY KEY (sha256, analyzer_version));`;
export const REVIEW_SCHEMA = `CREATE TABLE IF NOT EXISTS audio_analysis_pending (
  sha256 TEXT NOT NULL, analyzer_version INTEGER NOT NULL, result_json TEXT NOT NULL,
  payload_bytes INTEGER NOT NULL, created_at INTEGER NOT NULL,
  PRIMARY KEY(sha256,analyzer_version));
CREATE INDEX IF NOT EXISTS pending_created_at ON audio_analysis_pending(created_at);
CREATE TABLE IF NOT EXISTS audio_analysis_limits (
  bucket TEXT PRIMARY KEY NOT NULL, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS limits_expiry ON audio_analysis_limits(expires_at);`;
export interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
  all<T>(): Promise<{ results: T[] }>;
}
export interface AnalysisDatabase {
  prepare(sql: string): D1Statement;
}
export interface AnalysisStore {
  allowRequest(address: string, now: number): Promise<number>;
  putPending(value: AudioAnalysis, now: number): Promise<"pending" | "full">;
}
const take = `INSERT INTO audio_analysis_limits(bucket,count,expires_at) VALUES (?,1,?)
 ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END,
 expires_at=excluded.expires_at WHERE expires_at<=? OR count<? RETURNING count`;
export function d1AnalysisStore(db: AnalysisDatabase): AnalysisStore {
  async function allowance(
    bucket: string,
    limit: number,
    seconds: number,
    now: number,
  ) {
    const end = windowEnd(now, seconds);
    const result = await db
      .prepare(take)
      .bind(bucket, end, now, now, limit)
      .first();
    return result ? 0 : end - now;
  }
  return {
    async allowRequest(address, now) {
      // Global allowance is consumed first, bounding per-address row creation.
      for (const name of ["daily", "burst", "global"] as const) {
        const policy = analysisPolicy[name];
        const retry = await allowance(name, policy.limit, policy.seconds, now);
        if (retry) return retry;
      }
      await db
        .prepare("DELETE FROM audio_analysis_limits WHERE expires_at<=?")
        .bind(now)
        .run();
      // Short-lived pseudonymous key: no raw address is stored or returned.
      const bytes = new TextEncoder().encode(
        `${windowEnd(now, analysisPolicy.perAddress.seconds)}:${address}`,
      );
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const key = Array.from(new Uint8Array(digest), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      return allowance(
        `address:${key}`,
        analysisPolicy.perAddress.limit,
        analysisPolicy.perAddress.seconds,
        now,
      );
    },
    async putPending(value, now) {
      await db
        .prepare("DELETE FROM audio_analysis_pending WHERE created_at<=?")
        .bind(now - analysisPolicy.pendingSeconds)
        .run();
      const json = JSON.stringify(value),
        bytes = new TextEncoder().encode(json).length;
      // One atomic insert enforces both quotas, even across concurrent Workers.
      await db
        .prepare(
          `INSERT OR IGNORE INTO audio_analysis_pending
        (sha256,analyzer_version,result_json,payload_bytes,created_at)
        SELECT ?,?,?,?,? WHERE
        (SELECT COUNT(*)<? AND COALESCE(SUM(payload_bytes),0)+?<=? FROM audio_analysis_pending)`,
        )
        .bind(
          value.sha256,
          ANALYZER_VERSION,
          json,
          bytes,
          now,
          analysisPolicy.pendingCount,
          bytes,
          analysisPolicy.pendingBytes,
        )
        .run();
      const row = await db
        .prepare(
          "SELECT sha256 FROM audio_analysis_pending WHERE sha256=? AND analyzer_version=?",
        )
        .bind(value.sha256, ANALYZER_VERSION)
        .first();
      return row ? "pending" : "full";
    },
  };
}
