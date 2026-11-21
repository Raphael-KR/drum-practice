/** Local editor/producer contract. It is not part of Song or .drumscore. */
export const SCORE_PRODUCER_THREAD = "01a0fd08-ba73-7482-b10e-40e637a1efc0";
export interface ProductionAttachment {
  name: string;
  path: string;
  sha256: string;
  size: number;
}
export interface ProductionRequest {
  version: 1;
  id: string;
  createdAt: string;
  targetThreadId: typeof SCORE_PRODUCER_THREAD;
  kind: "create" | "correct";
  title: string;
  instruction: string;
  source?: {
    songId: string;
    canonicalSHA256: string;
    measureIds: string[];
  };
  attachments: ProductionAttachment[];
}
export interface ProductionArtifact extends ProductionAttachment {
  kind: "musicxml" | "drumscore" | "svg" | "report";
  primary?: boolean;
}
export interface ProductionProgress {
  version: 1;
  requestId: string;
  updatedAt: string;
  phase: "working" | "question" | "completed" | "failed";
  message: string;
  question?: { id: string; text: string };
  result?: {
    summary: string;
    checks: {
      name: string;
      status: "passed" | "not-run" | "failed";
      detail?: string;
    }[];
    artifacts: ProductionArtifact[];
  };
}
export interface ProductionAnswer {
  id: string;
  questionId: string;
  text: string;
  createdAt: string;
}
export interface ProductionAttempt {
  id: string;
  questionId?: string;
  text: string;
  startedAt: string;
  status: "attempting" | "accepted" | "unknown" | "not_sent";
  error?: string;
}
export interface ProductionDispatch {
  version: 1;
  requestId: string;
  attempts: ProductionAttempt[];
  applied?: ProductionReceipt;
}
/** Written with the accepted score, so a failed server receipt can be retried alone. */
export interface ProductionReceipt {
  requestId: string;
  artifactSHA256: string;
  songId: string;
  appliedAt: string;
}
export interface ProductionRequestView {
  request: ProductionRequest;
  dispatch: ProductionDispatch;
  progress?: ProductionProgress;
  answers: ProductionAnswer[];
}

const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown, max = 20000): v is string =>
  typeof v === "string" && !!v.trim() && v.length <= max;
const hash = (v: unknown) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
const date = (v: unknown) =>
  typeof v === "string" && Number.isFinite(Date.parse(v));
export function productionRequestId(value: unknown): asserts value is string {
  if (
    typeof value !== "string" ||
    !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(value)
  )
    throw Error("Invalid production request ID");
}
function attachment(v: unknown, directory: "input" | "result"): boolean {
  return (
    object(v) &&
    text(v.name, 255) &&
    typeof v.path === "string" &&
    v.path.startsWith(`${directory}/`) &&
    v.path.split("/").every((p) => !!p && p !== "." && p !== "..") &&
    !Array.from(v.path).some((c) => c === "\\" || c.charCodeAt(0) < 32) &&
    hash(v.sha256) &&
    Number.isSafeInteger(v.size) &&
    Number(v.size) > 0
  );
}
export function validateProductionRequest(
  v: unknown,
): asserts v is ProductionRequest {
  if (!object(v)) throw Error("Invalid production request");
  productionRequestId(v.id);
  if (
    v.version !== 1 ||
    !date(v.createdAt) ||
    v.targetThreadId !== SCORE_PRODUCER_THREAD ||
    !["create", "correct"].includes(String(v.kind)) ||
    !text(v.title, 200) ||
    !text(v.instruction) ||
    !Array.isArray(v.attachments) ||
    v.attachments.length > 16 ||
    !v.attachments.every((a) => attachment(a, "input")) ||
    new Set(v.attachments.map((a) => a.path)).size !== v.attachments.length
  )
    throw Error("Invalid production request");
  if (v.kind === "correct") {
    const s = v.source;
    if (
      !object(s) ||
      !text(s.songId, 200) ||
      !hash(s.canonicalSHA256) ||
      !Array.isArray(s.measureIds) ||
      !s.measureIds.every((m) => text(m, 200)) ||
      new Set(s.measureIds).size !== s.measureIds.length
    )
      throw Error("Invalid correction source");
  } else if (v.source !== undefined)
    throw Error("Unexpected correction source");
}
export function validateProductionProgress(
  v: unknown,
): asserts v is ProductionProgress {
  if (!object(v)) throw Error("Invalid production progress");
  productionRequestId(v.requestId);
  if (
    v.version !== 1 ||
    !date(v.updatedAt) ||
    !text(v.message) ||
    !["working", "question", "completed", "failed"].includes(String(v.phase))
  )
    throw Error("Invalid production progress");
  if (v.phase === "question") {
    if (!object(v.question) || !text(v.question.text))
      throw Error("Missing production question");
    productionRequestId(v.question.id);
  } else if (v.question !== undefined)
    throw Error("Unexpected production question");
  if (v.result !== undefined) {
    const r = v.result;
    if (
      !object(r) ||
      !text(r.summary) ||
      !Array.isArray(r.checks) ||
      !r.checks.every(
        (c) =>
          object(c) &&
          text(c.name) &&
          ["passed", "not-run", "failed"].includes(String(c.status)) &&
          (c.detail === undefined || text(c.detail)),
      ) ||
      !Array.isArray(r.artifacts) ||
      !r.artifacts.length ||
      !r.artifacts.every(
        (a) =>
          attachment(a, "result") &&
          object(a) &&
          ["musicxml", "drumscore", "svg", "report"].includes(String(a.kind)) &&
          (a.primary === undefined || typeof a.primary === "boolean") &&
          (!a.primary || a.kind === "drumscore"),
      ) ||
      r.artifacts.filter((a) => a.primary).length > 1 ||
      new Set(r.artifacts.map((a) => a.path)).size !== r.artifacts.length
    )
      throw Error("Invalid production result");
  }
  if (v.phase === "completed" && !v.result)
    throw Error("Missing production result");
}
export function validateProductionAnswer(
  v: unknown,
): asserts v is ProductionAnswer {
  if (!object(v) || !date(v.createdAt) || !text(v.text))
    throw Error("Invalid production answer");
  productionRequestId(v.id);
  productionRequestId(v.questionId);
}
export function validateProductionDispatch(
  v: unknown,
): asserts v is ProductionDispatch {
  if (!object(v) || v.version !== 1 || !Array.isArray(v.attempts))
    throw Error("Invalid production dispatch");
  productionRequestId(v.requestId);
  const ids = new Set<string>();
  for (const a of v.attempts) {
    if (
      !object(a) ||
      !text(a.text) ||
      !date(a.startedAt) ||
      !["attempting", "accepted", "unknown", "not_sent"].includes(
        String(a.status),
      ) ||
      (a.error !== undefined && !text(a.error))
    )
      throw Error("Invalid production attempt");
    productionRequestId(a.id);
    if (ids.has(a.id)) throw Error("Duplicate production attempt ID");
    ids.add(a.id);
    if (a.questionId !== undefined) productionRequestId(a.questionId);
  }
  if (v.applied !== undefined) {
    validateProductionReceipt(v.applied);
    if (v.applied.requestId !== v.requestId)
      throw Error("Applied result request mismatch");
  }
}
export function validateProductionReceipt(
  v: unknown,
): asserts v is ProductionReceipt {
  if (
    !object(v) ||
    !hash(v.artifactSHA256) ||
    !text(v.songId, 200) ||
    !date(v.appliedAt)
  )
    throw Error("Invalid applied result receipt");
  productionRequestId(v.requestId);
}
export function validateProductionReceipts(
  v: unknown,
  songId: string,
): asserts v is ProductionReceipt[] {
  if (!Array.isArray(v)) throw Error("Invalid applied result receipts");
  const ids = new Set<string>();
  for (const receipt of v) {
    validateProductionReceipt(receipt);
    if (receipt.songId !== songId || ids.has(receipt.requestId))
      throw Error("Applied result receipt mismatch");
    ids.add(receipt.requestId);
  }
}
