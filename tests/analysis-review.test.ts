import { expect, it, vi } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import type { IncomingMessage } from "node:http";
import { localAnalysisStore } from "../server/audio-analysis-local";
import {
  localReviewHandler,
  localRequestAllowed,
  LOCAL_REVIEW_PATH,
} from "../server/analysis-review-local";
import { reviewAPI } from "../server/analysis-review-api";
import { reviewCredential } from "../server/analysis-review-credential";
import {
  ANALYSIS_SCHEMA,
  REVIEW_SCHEMA,
  type AnalysisDatabase,
} from "../server/audio-analysis-store";
import type { AudioAnalysis } from "../src/audio-analysis-contract";
const hash = "a".repeat(64);
const value: AudioAnalysis = {
  analyzerVersion: 4,
  sha256: hash,
  title: "후보",
  artist: "가수",
  duration: 10,
  bpm: 120,
  firstBeat: 0.2,
  beats: 4,
  denominator: 4,
  confidence: 0.8,
};
const req = (suffix: string, init?: RequestInit) =>
  new Request("http://localhost:5173" + LOCAL_REVIEW_PATH + suffix, init);
function temp() {
  mkdirSync(".tmp", { recursive: true });
  return mkdtempSync(resolve(".tmp/review-test-"));
}
it("denies cross-origin, non-loopback and rebinding access to local review", () => {
  const request = (
    host: string,
    address: string,
    origin?: string,
    site?: string,
  ) =>
    ({
      headers: { host, origin, "sec-fetch-site": site },
      socket: { remoteAddress: address },
    }) as IncomingMessage;
  expect(localRequestAllowed(request("localhost:5173", "::1"))).toBe(true);
  expect(
    localRequestAllowed(
      request("127.0.0.1:5173", "127.0.0.1", "http://127.0.0.1:5173"),
    ),
  ).toBe(true);
  for (const r of [
    request("attacker.test:5173", "127.0.0.1"),
    request("localhost:5173", "192.168.1.1"),
    request("localhost:5173", "::1", "https://evil.test"),
    request("localhost:5173", "::1", undefined, "cross-site"),
  ])
    expect(localRequestAllowed(r)).toBe(false);
});
it("requires CSRF, explicit review and fresh revision; persists corrected approval and suppresses replay", async () => {
  const root = temp(),
    store = localAnalysisStore(
      resolve(root, "data/runtime/audio-analysis.sqlite"),
    );
  const remote = vi.fn<typeof fetch>(
    async () => new Response("", { status: 404 }),
  );
  const handle = localReviewHandler(root, store, remote);
  try {
    await store.putPending(value, Math.floor(Date.now() / 1000));
    const summary = await (await handle(req("/summary"))).json();
    expect(summary.remoteAvailable).toBe(false);
    expect(summary.rows).toHaveLength(1);
    const item = await (await handle(req("/item?hash=" + hash))).json();
    const post = (body: unknown, csrf = summary.csrf) =>
      handle(
        req("/approve?hash=" + hash, {
          method: "POST",
          headers: { "X-Review-CSRF": csrf },
          body: JSON.stringify(body),
        }),
      );
    expect(
      (await post({ value, revision: item.revision, reviewed: true }, "bad"))
        .status,
    ).toBe(403);
    expect(
      (await post({ value, revision: item.revision, reviewed: false })).status,
    ).toBe(400);
    expect(
      (await post({ value, revision: "stale", reviewed: true })).status,
    ).toBe(409);
    expect(
      (
        await post({
          value: { ...value, title: "승인곡", bpm: 123 },
          revision: item.revision,
          reviewed: true,
        })
      ).status,
    ).toBe(200);
    expect(store.getApproved(hash)).toMatchObject({
      title: "승인곡",
      bpm: 123,
    });
    expect(
      (await post({ value, revision: item.revision, reviewed: true })).status,
    ).toBe(400);
    expect((await (await handle(req("/summary"))).json()).rows).toHaveLength(0);
    expect(
      readFileSync(resolve(root, "data/runtime/analysis-review-token"), "utf8"),
    ).toHaveLength(64);
  } finally {
    store.close();
    rmSync(root, { recursive: true, force: true });
  }
});
it("loads remote candidates without promoting them; rejects them locally and never exposes the credential", async () => {
  const root = temp(),
    store = localAnalysisStore(":memory:");
  const remote = vi.fn<typeof fetch>(async (input) =>
    Response.json(
      String(input).includes("?hash=")
        ? value
        : {
            rows: [
              {
                sha256: hash,
                title: value.title,
                artist: value.artist,
                bpm: 120,
              },
            ],
          },
    ),
  );
  const handle = localReviewHandler(root, store, remote);
  try {
    const summary = await (await handle(req("/summary"))).json();
    expect(summary.remoteAvailable).toBe(true);
    expect(summary.rows).toHaveLength(1);
    expect(store.getApproved(hash)).toBeUndefined();
    const { token } = reviewCredential(root);
    expect(JSON.stringify(summary)).not.toContain(token);
    const item = await (await handle(req("/item?hash=" + hash))).json();
    expect(
      (
        await handle(
          req("/reject?hash=" + hash, {
            method: "POST",
            headers: { "X-Review-CSRF": summary.csrf },
            body: JSON.stringify({ revision: item.revision }),
          }),
        )
      ).status,
    ).toBe(200);
    expect((await (await handle(req("/summary"))).json()).rows).toEqual([]);
    expect(store.getApproved(hash)).toBeUndefined();
    expect(remote.mock.calls.some((call) => call[1]?.method === "DELETE")).toBe(
      true,
    );
  } finally {
    store.close();
    rmSync(root, { recursive: true, force: true });
  }
});
it("remote review requires a credential; deletion needs the exact reviewed revision", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(ANALYSIS_SCHEMA + REVIEW_SCHEMA);
  const database: AnalysisDatabase = {
    prepare(sql) {
      let args: SQLInputValue[] = [];
      return {
        bind(...v) {
          args = v as SQLInputValue[];
          return this;
        },
        async first<T>() {
          return (db.prepare(sql).get(...args) || null) as T | null;
        },
        async all<T>() {
          return { results: db.prepare(sql).all(...args) as T[] };
        },
        async run() {
          return db.prepare(sql).run(...args);
        },
      };
    },
  };
  const token = "b".repeat(64),
    digest = createHash("sha256").update(token).digest("hex");
  const request = (query = "", method = "GET", auth = token) =>
    new Request("https://site.test/api/audio-analysis-review" + query, {
      method,
      headers: { Authorization: "Bearer " + auth },
    });
  try {
    db.prepare("INSERT INTO audio_analysis_pending VALUES (?,4,?,?,?)").run(
      hash,
      JSON.stringify(value),
      100,
      Math.floor(Date.now() / 1000),
    );
    expect(
      (await reviewAPI(request("", "GET", "c".repeat(64)), database, digest))
        .status,
    ).toBe(404);
    expect(
      (await reviewAPI(request("", "POST"), database, digest)).status,
    ).toBe(405);
    const summary = await (await reviewAPI(request(), database, digest)).json();
    expect(summary.rows).toHaveLength(1);
    expect(summary.rows[0].result_json).toBeUndefined();
    expect(
      await (
        await reviewAPI(request("?hash=" + hash), database, digest)
      ).json(),
    ).toEqual(value);
    const removal = request("?hash=" + hash, "DELETE");
    expect((await reviewAPI(removal, database, digest)).status).toBe(409);
    removal.headers.set(
      "if-match",
      createHash("sha256").update(JSON.stringify(value)).digest("hex"),
    );
    expect((await reviewAPI(removal, database, digest)).status).toBe(200);
    expect(
      db.prepare("SELECT COUNT(*) AS n FROM audio_analysis_pending").get()?.n,
    ).toBe(0);
    db.prepare("INSERT INTO audio_analysis_pending VALUES (?,4,?,100,0)").run(
      hash,
      JSON.stringify(value),
    );
    expect(
      (await reviewAPI(request("?hash=" + hash), database, digest)).status,
    ).toBe(404);
  } finally {
    db.close();
  }
});
