import { analysisReply } from "./audio-analysis-api";
import type { AnalysisDatabase } from "./audio-analysis-store";
import { ANALYZER_VERSION, isAudioHash } from "../src/audio-analysis-contract";
import { analysisPolicy } from "./analysis-policy";
export async function reviewAPI(
  request: Request,
  db: AnalysisDatabase,
  expectedHash: string,
): Promise<Response> {
  const bearer = request.headers
    .get("authorization")
    ?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (!bearer || !isAudioHash(expectedHash))
    return analysisReply({ error: "Not found" }, 404);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(bearer),
  );
  const actual = Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  let difference = 0;
  for (let i = 0; i < 64; i++)
    difference |= actual.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  if (difference) return analysisReply({ error: "Not found" }, 404);
  if (!["GET", "DELETE"].includes(request.method))
    return analysisReply({ error: "Method not allowed" }, 405);
  const url = new URL(request.url),
    hash = url.searchParams.get("hash");
  if (
    (hash !== null && !isAudioHash(hash)) ||
    Array.from(url.searchParams.keys()).some((key) => key !== "hash")
  )
    return analysisReply({ error: "Bad query" }, 400);
  const cutoff = Math.floor(Date.now() / 1000) - analysisPolicy.pendingSeconds;
  try {
    if (request.method === "DELETE") {
      if (!hash) return analysisReply({ error: "Hash required" }, 400);
      const row = await db
        .prepare(
          "SELECT result_json FROM audio_analysis_pending WHERE sha256=? AND analyzer_version=?",
        )
        .bind(hash, ANALYZER_VERSION)
        .first<{ result_json: string }>();
      if (!row) return analysisReply({ status: "removed" });
      const bytes = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(row.result_json),
      );
      const revision = Array.from(new Uint8Array(bytes), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      if (request.headers.get("if-match") !== revision)
        return analysisReply({ error: "Review changed" }, 409);
      await db
        .prepare(
          "DELETE FROM audio_analysis_pending WHERE sha256=? AND analyzer_version=? AND result_json=?",
        )
        .bind(hash, ANALYZER_VERSION, row.result_json)
        .run();
      return analysisReply({ status: "removed" });
    }
    if (hash) {
      const row = await db
        .prepare(
          "SELECT result_json FROM audio_analysis_pending WHERE sha256=? AND analyzer_version=? AND created_at>?",
        )
        .bind(hash, ANALYZER_VERSION, cutoff)
        .first<{ result_json: string }>();
      return row
        ? analysisReply(JSON.parse(row.result_json))
        : analysisReply({ error: "Not found" }, 404);
    }
    const { results } = await db
      .prepare(
        `SELECT sha256,created_at,json_extract(result_json,'$.title') AS title,
      json_extract(result_json,'$.artist') AS artist,json_extract(result_json,'$.bpm') AS bpm
      FROM audio_analysis_pending WHERE analyzer_version=? AND created_at>? ORDER BY created_at,sha256 LIMIT ?`,
      )
      .bind(ANALYZER_VERSION, cutoff, analysisPolicy.pendingCount)
      .all();
    return analysisReply({ rows: results });
  } catch {
    return analysisReply({ error: "Review unavailable" }, 503);
  }
}
