import { DatabaseSync } from "node:sqlite";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  chmodSync,
} from "node:fs";
import { resolve } from "node:path";
import { randomBytes, createHash } from "node:crypto";
export function exportReviewedAnalysis(root, target) {
  const runtime = resolve(root, "data/runtime");
  mkdirSync(runtime, { recursive: true });
  const key = resolve(runtime, "analysis-review-token");
  try {
    writeFileSync(key, randomBytes(32).toString("hex"), {
      flag: "wx",
      mode: 0o600,
    });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
  }
  chmodSync(key, 0o600);
  const token = readFileSync(key, "utf8").trim();
  if (!/^[a-f0-9]{64}$/.test(token)) throw Error("Invalid review credential");
  const path = resolve(runtime, "audio-analysis.sqlite");
  let rows = [];
  if (existsSync(path)) {
    const db = new DatabaseSync(path, { readOnly: true });
    try {
      if (
        db
          .prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='audio_analysis_approved'",
          )
          .get()
      )
        rows = db
          .prepare(
            "SELECT sha256,result_json FROM audio_analysis_approved ORDER BY sha256",
          )
          .all();
    } finally {
      db.close();
    }
  }
  if (rows.length > 10000)
    throw Error("Approved index exceeds deployment limit");
  const directory = resolve(target, "player-assets/analysis-approved");
  mkdirSync(directory, { recursive: true });
  const hashes = [];
  for (const row of rows) {
    const value = JSON.parse(row.result_json);
    if (
      !/^[a-f0-9]{64}$/.test(row.sha256) ||
      value.sha256 !== row.sha256 ||
      Buffer.byteLength(row.result_json) > 256 * 1024
    )
      throw Error("Invalid approved snapshot");
    if (value.analyzerVersion !== 4) continue;
    writeFileSync(resolve(directory, `${row.sha256}.json`), row.result_json);
    hashes.push(row.sha256);
  }
  const digest = createHash("sha256").update(token).digest("hex");
  writeFileSync(
    resolve(target, "server/approved-analysis.ts"),
    `// Generated from explicitly approved local records. No pending records or credentials.\nexport const approvedHashes: string[]=${JSON.stringify(hashes)};\nexport const reviewTokenHash=${JSON.stringify(digest)};\n`,
  );
  return hashes.length;
}
