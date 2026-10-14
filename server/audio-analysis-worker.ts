import { audioAnalysisAPI } from "./audio-analysis-api";
import { d1AnalysisStore, type AnalysisDatabase } from "./audio-analysis-store";
import {
  ANALYSIS_PATH,
  validAudioAnalysis,
} from "../src/audio-analysis-contract";
import { secureResponse } from "./security-headers";
import { approvedHashes, reviewTokenHash } from "./approved-analysis";
import { reviewAPI } from "./analysis-review-api";
import { REVIEW_PATH } from "./analysis-policy";
const approved = new Set(approvedHashes);
export default {
  async fetch(
    request: Request,
    env: {
      DB: AnalysisDatabase;
      ASSETS: { fetch(request: Request): Promise<Response> };
    },
  ) {
    const url = new URL(request.url);
    if (url.pathname === REVIEW_PATH)
      return secureResponse(
        await reviewAPI(request, env.DB, reviewTokenHash),
        request,
      );
    if (url.pathname.startsWith(ANALYSIS_PATH))
      return secureResponse(
        await audioAnalysisAPI(request, d1AnalysisStore(env.DB), {
          approved: async (hash) => {
            if (!approved.has(hash)) return;
            const response = await env.ASSETS.fetch(
              new Request(new URL(`/analysis-approved/${hash}.json`, url)),
            );
            if (!response.ok) throw Error("Approved snapshot unavailable");
            const value: unknown = await response.json();
            if (!validAudioAnalysis(value, hash))
              throw Error("Invalid approved snapshot");
            return value;
          },
          address: request.headers.get("CF-Connecting-IP") || "unknown",
        }),
        request,
      );
    if (url.pathname === "/") url.pathname = "/index.html";
    return secureResponse(
      await env.ASSETS.fetch(new Request(url, request)),
      request,
    );
  },
};
