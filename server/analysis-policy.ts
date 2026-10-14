export const analysisPolicy = {
  perAddress: { limit: 10, seconds: 86400 },
  global: { limit: 1000, seconds: 3600 },
  daily: { limit: 3000, seconds: 86400 },
  burst: { limit: 60, seconds: 60 },
  pendingCount: 500,
  pendingBytes: 32 * 1024 * 1024,
  pendingSeconds: 30 * 86400,
} as const;
export const REVIEW_PATH = "/api/audio-analysis-review";
export interface PendingAnalysis {
  sha256: string;
  result_json: string;
  created_at: number;
}

export const KST_OFFSET_SECONDS = 9 * 3600;
export const windowEnd = (now: number, seconds: number) =>
  (Math.floor((now + KST_OFFSET_SECONDS) / seconds) + 1) * seconds -
  KST_OFFSET_SECONDS;
