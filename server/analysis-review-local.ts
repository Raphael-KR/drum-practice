import { randomBytes, createHash } from "node:crypto";
import type { IncomingMessage } from "node:http";
import { analysisReply, readBoundedJSON } from "./audio-analysis-api";
import { reviewCredential } from "./analysis-review-credential";
import { localAnalysisStore } from "./audio-analysis-local";
import {
  isAudioHash,
  MAX_ANALYSIS_BYTES,
  validAudioAnalysis,
} from "../src/audio-analysis-contract";
import { REVIEW_PATH, analysisPolicy } from "./analysis-policy";
export const LOCAL_REVIEW_PATH = "/api/local-analysis-review";
const SITE = "https://drum-practice-studio.dgkma.chatgpt.site";
export function localRequestAllowed(req: IncomingMessage) {
  const address = req.socket.remoteAddress;
  if (!address || !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address))
    return false;
  if (
    !["127.0.0.1:5173", "localhost:5173", "[::1]:5173"].includes(
      req.headers.host || "",
    )
  )
    return false;
  if (req.headers["sec-fetch-site"] === "cross-site") return false;
  return (
    !req.headers.origin || req.headers.origin === `http://${req.headers.host}`
  );
}
export function localReviewHandler(
  root: string,
  store: ReturnType<typeof localAnalysisStore>,
  remoteFetch: typeof fetch = fetch,
) {
  const csrf = randomBytes(32).toString("hex");
  const revision = (value: unknown) =>
    createHash("sha256").update(JSON.stringify(value)).digest("hex");
  async function remote(hash?: string, removeRevision?: string) {
    const { token } = reviewCredential(root);
    const response = await remoteFetch(
      `${SITE}${REVIEW_PATH}${hash ? `?hash=${hash}` : ""}`,
      {
        method: removeRevision ? "DELETE" : "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          ...(removeRevision ? { "If-Match": removeRevision } : {}),
        },
        redirect: "error",
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      },
    );
    if (!response.ok) throw Error("Remote review unavailable");
    return readBoundedJSON(
      new Request("http://local", {
        method: "POST",
        body: response.body,
        duplex: "half",
      } as RequestInit),
      hash ? MAX_ANALYSIS_BYTES : 512 * 1024,
    );
  }
  async function candidate(hash: string) {
    if (store.getApproved(hash) || store.decided(hash))
      throw Error("Already reviewed");
    const row = (await store.candidates()).find(
      (value) => value.sha256 === hash,
    );
    const value = row ? JSON.parse(row.result_json) : await remote(hash);
    if (!validAudioAnalysis(value, hash)) throw Error("Invalid analysis");
    return value;
  }
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url),
      action = url.pathname.slice(LOCAL_REVIEW_PATH.length);
    try {
      if (request.method === "GET" && action === "/summary") {
        const local = await store.candidates();
        let remoteAvailable = true;
        let rows: unknown[] = [];
        try {
          const payload = (await remote()) as { rows?: unknown };
          if (
            !Array.isArray(payload.rows) ||
            payload.rows.length > analysisPolicy.pendingCount
          )
            throw Error();
          rows = payload.rows;
        } catch {
          remoteAvailable = false;
        }
        const merged = new Map<
          string,
          {
            sha256: string;
            title: string;
            artist: string;
            bpm: number;
            source: string;
          }
        >();
        for (const raw of rows) {
          const row = raw as {
            sha256: string;
            title: string;
            artist: string;
            bpm: number;
          };
          if (
            !row ||
            !isAudioHash(row.sha256) ||
            typeof row.title !== "string" ||
            row.title.length > 300 ||
            typeof row.artist !== "string" ||
            row.artist.length > 300 ||
            !Number.isFinite(row.bpm)
          )
            continue;
          if (!store.decided(row.sha256) && !store.getApproved(row.sha256))
            merged.set(row.sha256, { ...row, source: "site" });
        }
        for (const row of local) {
          const value = JSON.parse(row.result_json);
          merged.set(row.sha256, {
            sha256: row.sha256,
            title: value.title,
            artist: value.artist,
            bpm: value.bpm,
            source: "local",
          });
        }
        return analysisReply({
          csrf,
          remoteAvailable,
          rows: [...merged.values()],
        });
      }
      const hash = url.searchParams.get("hash") || "";
      if (!isAudioHash(hash))
        return analysisReply({ error: "Invalid hash" }, 400);
      if (request.method === "GET" && action === "/item") {
        const value = await candidate(hash);
        return analysisReply({ value, revision: revision(value) });
      }
      if (
        request.method !== "POST" ||
        !["/approve", "/reject"].includes(action)
      )
        return analysisReply({ error: "Not found" }, 404);
      if (request.headers.get("x-review-csrf") !== csrf)
        return analysisReply({ error: "Forbidden" }, 403);
      const body = (await readBoundedJSON(
        request,
        MAX_ANALYSIS_BYTES + 1024,
      )) as { value?: unknown; revision?: string; reviewed?: boolean };
      const original = await candidate(hash);
      if (body.revision !== revision(original))
        return analysisReply({ error: "Review changed; reload" }, 409);
      if (action === "/approve") {
        if (body.reviewed !== true || !validAudioAnalysis(body.value, hash))
          return analysisReply({ error: "Invalid review" }, 400);
        store.approve(body.value);
      } else store.reject(hash);
      let cleanupPending = false;
      try {
        await remote(hash, revision(original));
      } catch {
        cleanupPending = true;
      }
      return analysisReply({
        status: action === "/approve" ? "approved" : "rejected",
        cleanupPending,
      });
    } catch {
      return analysisReply(
        { error: "Review unavailable or invalid data" },
        400,
      );
    }
  };
}
