import {
  ANALYSIS_PATH,
  MAX_ANALYSIS_BYTES,
  isAudioHash,
  validAudioAnalysis,
  type AudioAnalysis,
} from "../src/audio-analysis-contract";
import type { AnalysisStore } from "./audio-analysis-store";
export type { AnalysisStore } from "./audio-analysis-store";
export const analysisReply = (
  value: unknown,
  status = 200,
  extra: Record<string, string> = {},
) =>
  Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    },
  });
export async function readBoundedJSON(
  request: Request,
  max = MAX_ANALYSIS_BYTES,
): Promise<unknown> {
  if (Number(request.headers.get("content-length")) > max)
    throw Error("Too large");
  const reader = request.body?.getReader();
  if (!reader) throw Error("Missing body");
  let length = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > max) {
      await reader.cancel();
      throw Error("Too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
export interface AnalysisAPIOptions {
  approved: (
    hash: string,
  ) => AudioAnalysis | undefined | Promise<AudioAnalysis | undefined>;
  address: string;
  now?: number;
}
export async function audioAnalysisAPI(
  request: Request,
  store: AnalysisStore,
  options: AnalysisAPIOptions,
): Promise<Response> {
  const url = new URL(request.url),
    hash = url.pathname.slice(ANALYSIS_PATH.length);
  try {
    // Every write attempt under this API consumes allowance, including bad input.
    if (request.method !== "GET" && request.method !== "HEAD") {
      const retry = await store.allowRequest(
        options.address,
        options.now ?? Math.floor(Date.now() / 1000),
      );
      if (retry)
        return analysisReply({ error: "Too many requests" }, 429, {
          "Retry-After": String(retry),
        });
    }
    if (
      !url.pathname.startsWith(ANALYSIS_PATH) ||
      !isAudioHash(hash) ||
      url.search
    )
      return analysisReply({ error: "Not found" }, 404);
    if (request.method === "GET") {
      const value = await options.approved(hash);
      return value && validAudioAnalysis(value, hash)
        ? analysisReply(value)
        : analysisReply({ error: "Not found" }, 404);
    }
    if (request.method !== "PUT")
      return analysisReply({ error: "Method not allowed" }, 405);
    if (
      request.headers.get("sec-fetch-site") === "cross-site" ||
      (request.headers.has("origin") &&
        request.headers.get("origin") !== url.origin)
    )
      return analysisReply({ error: "Forbidden" }, 403);
    if (
      request.headers.get("content-type")?.split(";")[0].trim() !==
      "application/json"
    )
      return analysisReply({ error: "JSON only" }, 415);
    if (await options.approved(hash))
      return analysisReply({ error: "Approved record is read-only" }, 409);
    let value: unknown;
    try {
      value = await readBoundedJSON(request);
    } catch (error) {
      return analysisReply(
        {
          error:
            error instanceof Error && error.message === "Too large"
              ? "Too large"
              : "Invalid JSON",
        },
        error instanceof Error && error.message === "Too large" ? 413 : 400,
      );
    }
    if (!validAudioAnalysis(value, hash))
      return analysisReply({ error: "Invalid analysis" }, 400);
    const result = await store.putPending(
      value,
      options.now ?? Math.floor(Date.now() / 1000),
    );
    return result === "pending"
      ? analysisReply({ status: "pending" }, 202)
      : analysisReply({ error: "Review queue full" }, 503, {
          "Retry-After": "3600",
        });
  } catch {
    return analysisReply({ error: "Cache unavailable" }, 503);
  }
}
