import { expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, readFileSync } from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { resolve } from "node:path";
import { audioAnalysisAPI } from "../server/audio-analysis-api";
import { localAnalysisStore } from "../server/audio-analysis-local";
import { analysisPolicy, windowEnd } from "../server/analysis-policy";
import {
  d1AnalysisStore,
  type AnalysisDatabase,
} from "../server/audio-analysis-store";
import type { AudioAnalysis } from "../src/audio-analysis-contract";
import worker from "../server/audio-analysis-worker";
const hash = "a".repeat(64),
  url = `http://localhost:5173/api/audio-analysis/v4/${hash}`;
const value: AudioAnalysis = {
  analyzerVersion: 4,
  sha256: hash,
  title: "곡",
  artist: "가수",
  duration: 10,
  bpm: 120,
  firstBeat: 0.2,
  beats: 4,
  denominator: 4,
  confidence: 0.8,
};
const put = (body: unknown, headers: Record<string, string> = {}) =>
  new Request(url, {
    method: "PUT",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
function setup() {
  const db = new DatabaseSync(":memory:");
  for (const file of [
    "0000_fluffy_hobgoblin.sql",
    "0001_whole_doctor_faustus.sql",
  ])
    db.exec(readFileSync(`hosting/drizzle/${file}`, "utf8"));
  const database: AnalysisDatabase = {
    prepare(sql) {
      let values: SQLInputValue[] = [];
      return {
        bind(...args) {
          values = args as SQLInputValue[];
          return this;
        },
        async first<T>() {
          return (db.prepare(sql).get(...values) ?? null) as T | null;
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
  return { db, database, store: d1AnalysisStore(database) };
}
it("keeps legacy and anonymous values private until local approval, persisted across reopening", async () => {
  mkdirSync(".tmp", { recursive: true });
  const dir = mkdtempSync(resolve(".tmp/review-"));
  const path = resolve(dir, "cache.sqlite");
  let store = localAnalysisStore(path);
  const options = {
    address: "local",
    approved: (h: string) => store.getApproved(h),
  };
  try {
    const legacy = new DatabaseSync(path);
    legacy
      .prepare("INSERT INTO audio_analysis VALUES (?,4,?)")
      .run(hash, JSON.stringify(value));
    legacy.close();
    expect(
      (await audioAnalysisAPI(new Request(url), store, options)).status,
    ).toBe(404);
    expect((await store.candidates()).length).toBe(1);
    expect((await audioAnalysisAPI(put(value), store, options)).status).toBe(
      202,
    );
    await audioAnalysisAPI(put({ ...value, bpm: 80 }), store, options);
    expect(JSON.parse((await store.candidates())[0].result_json).bpm).toBe(120);
    store.approve({ ...value, title: "검토한 곡" });
    store.close();
    store = localAnalysisStore(path);
    expect(
      await (await audioAnalysisAPI(new Request(url), store, options)).json(),
    ).toMatchObject({ title: "검토한 곡" });
    expect(
      (await audioAnalysisAPI(put({ ...value, bpm: 80 }), store, options))
        .status,
    ).toBe(409);
    expect(await store.candidates()).toEqual([]);
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
it("Worker migrates pending storage, never serves it publicly, and wraps asset responses", async () => {
  const { db, database } = setup();
  const env = {
    DB: database,
    ASSETS: {
      async fetch() {
        return new Response("assets");
      },
    },
  };
  try {
    expect((await worker.fetch(put(value), env)).status).toBe(202);
    expect((await worker.fetch(new Request(url), env)).status).toBe(404);
    const asset = await worker.fetch(
      new Request("https://local/icons/app.svg"),
      env,
    );
    expect(await asset.text()).toBe("assets");
    expect(asset.headers.get("x-content-type-options")).toBe("nosniff");
  } finally {
    db.close();
  }
});
it("counts malformed attempts and rejects media, private fields, oversized bodies and foreign writes", async () => {
  const store = localAnalysisStore(":memory:");
  const options = { address: "one", approved: () => undefined };
  try {
    for (const body of [
      { ...value, audio: "bytes" },
      { ...value, filename: "a.mp3" },
      { ...value, analyzerVersion: 1 },
      { ...value, sha256: "../x" },
    ])
      expect((await audioAnalysisAPI(put(body), store, options)).status).toBe(
        400,
      );
    expect(
      (
        await audioAnalysisAPI(
          put(value, { "content-type": "audio/mpeg" }),
          store,
          options,
        )
      ).status,
    ).toBe(415);
    expect(
      (
        await audioAnalysisAPI(
          put(value, { origin: "https://foreign.test" }),
          store,
          options,
        )
      ).status,
    ).toBe(403);
    expect(
      (await audioAnalysisAPI(put("x".repeat(300000)), store, options)).status,
    ).toBe(413);
    for (let i = 0; i < 3; i++)
      expect((await audioAnalysisAPI(put(value), store, options)).status).toBe(
        202,
      );
    expect((await audioAnalysisAPI(put(value), store, options)).status).toBe(
      429,
    );
    expect(
      (await audioAnalysisAPI(new Request(url), store, options)).status,
    ).toBe(404);
  } finally {
    store.close();
  }
});
it("allows exactly ten concurrent attempts per IP and resets at KST midnight, not UTC midnight", async () => {
  const { db, store } = setup();
  const before = Date.parse("2026-10-14T23:59:59+09:00") / 1000;
  try {
    const results = await Promise.all(
      Array.from({ length: 20 }, () => store.allowRequest("ip", before)),
    );
    expect(results.filter((v) => v === 0)).toHaveLength(10);
    expect(results.filter((v) => v !== 0)).toEqual(Array(10).fill(1));
    expect(await store.allowRequest("ip", before + 1)).toBe(0);
    const morning = Date.parse("2026-10-15T08:59:59+09:00") / 1000;
    for (let i = 0; i < 9; i++)
      expect(await store.allowRequest("ip", morning)).toBe(0);
    expect(await store.allowRequest("ip", morning + 1)).toBe(15 * 3600);
    expect(await store.allowRequest("other", morning + 1)).toBe(0);
    expect(
      db
        .prepare(
          "SELECT bucket FROM audio_analysis_limits WHERE bucket LIKE 'address:%'",
        )
        .all()
        .every((row) => !String(row.bucket).includes("other")),
    ).toBe(true);
  } finally {
    db.close();
  }
});
it("enforces global burst, hourly and daily ceilings with exact retry deadlines", async () => {
  const { db, store } = setup();
  const now = Date.parse("2026-10-15T10:23:12+09:00") / 1000;
  try {
    for (const name of ["burst", "global", "daily"] as const) {
      db.exec("DELETE FROM audio_analysis_limits");
      const p = analysisPolicy[name];
      db.prepare("INSERT INTO audio_analysis_limits VALUES (?,?,?)").run(
        name,
        p.limit,
        windowEnd(now, p.seconds),
      );
      expect(await store.allowRequest("ip", now)).toBe(
        windowEnd(now, p.seconds) - now,
      );
      expect(await store.allowRequest("ip", windowEnd(now, p.seconds))).toBe(0);
    }
  } finally {
    db.close();
  }
});
it("atomically caps pending count, keeps first duplicate unchanged, and expires old entries", async () => {
  const { db, store } = setup();
  const now = 10000000;
  try {
    const results = await Promise.all(
      Array.from({ length: 510 }, (_, i) =>
        store.putPending(
          { ...value, sha256: i.toString(16).padStart(64, "0") },
          now,
        ),
      ),
    );
    expect(results.filter((v) => v === "pending")).toHaveLength(500);
    const first = "0".repeat(64);
    await store.putPending(
      { ...value, sha256: first, title: "changed" },
      now + 1,
    );
    expect(
      db
        .prepare(
          "SELECT created_at,result_json FROM audio_analysis_pending WHERE sha256=?",
        )
        .get(first),
    ).toMatchObject({
      created_at: now,
      result_json: JSON.stringify({ ...value, sha256: first }),
    });
    expect(
      await store.putPending(value, now + analysisPolicy.pendingSeconds),
    ).toBe("pending");
    expect(
      db.prepare("SELECT COUNT(*) AS n FROM audio_analysis_pending").get()?.n,
    ).toBe(1);
  } finally {
    db.close();
  }
});
it("caps serialized pending storage independently of the record count", async () => {
  const { db, store } = setup();
  const now = 10000000;
  try {
    // Capacity accounting boundary, without allocating 32 MiB of test payloads.
    db.prepare("INSERT INTO audio_analysis_pending VALUES (?,4,?,?,?)").run(
      "b".repeat(64),
      JSON.stringify(value),
      analysisPolicy.pendingBytes,
      now,
    );
    expect(await store.putPending(value, now)).toBe("full");
  } finally {
    db.close();
  }
});
