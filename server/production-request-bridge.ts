import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";
import {
  SCORE_PRODUCER_THREAD,
  type ProductionAttempt,
} from "../src/model/production-request.ts";
import {
  productionSHA256,
  type ProductionRequestStore,
} from "./production-request-store.ts";

const cli = join(
  homedir(),
  "Playground/Extensions/session-bridge/.runtime/bin/session-connect",
);
/** Keep the CLI's machine error code, never arbitrary stderr or request text. */
function bridgeErrorCode(stderr: string) {
  try {
    const value = JSON.parse(stderr);
    return typeof value.error === "string" &&
      /^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(value.error)
      ? value.error
      : "unavailable";
  } catch {
    return "unavailable";
  }
}

export async function sendProducerMessage(
  root: string,
  attempt: Pick<ProductionAttempt, "id" | "text">,
): Promise<{ status: "accepted" | "not_sent" | "unknown"; error?: string }> {
  const config = join(root, "config/score-session-bridge.json");
  try {
    await access(cli, constants.X_OK);
    const c = JSON.parse(await readFile(config, "utf8"));
    if (
      !c.enabled ||
      c.caller !== "drum-practice-editor" ||
      !c.allow_steer ||
      JSON.stringify(c.send_targets) !== JSON.stringify([SCORE_PRODUCER_THREAD])
    )
      throw Error("Invalid score Session Bridge configuration");
    if (typeof c.ledger_dir !== "string" || !isAbsolute(c.ledger_dir))
      throw Error(
        `Session Bridge ledger path must be absolute: actual=${JSON.stringify(c.ledger_dir)}`,
      );
  } catch (e) {
    return { status: "not_sent", error: String(e) };
  }
  return new Promise((resolve) => {
    let output = "",
      stderr = "",
      settled = false,
      started = false;
    const child = spawn(cli, ["--config", config, "send"], {
      cwd: root,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const finish = (value: {
      status: "accepted" | "not_sent" | "unknown";
      error?: string;
    }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => {
      child.kill();
      finish({
        status: "unknown",
        error: "Session Bridge timed out; delivery may have occurred",
      });
    }, 25000);
    child.on("spawn", () => {
      started = true;
    });
    child.on("error", (e) =>
      finish({ status: started ? "unknown" : "not_sent", error: e.message }),
    );
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      if (output.length > 131072) {
        child.kill();
        finish({
          status: "unknown",
          error: "Session Bridge response exceeded its limit",
        });
      }
    });
    child.stderr.on("data", (chunk) => {
      // The CLI emits a short JSON error. Drain excess without keeping private output.
      stderr = (stderr + chunk.toString()).slice(0, 4096);
    });
    child.stdin.on("error", () =>
      finish({ status: "unknown", error: "Session Bridge input interrupted" }),
    );
    child.on("close", (code, signal) => {
      try {
        const value = JSON.parse(output);
        if (
          code !== 0 ||
          value.request_id !== attempt.id ||
          value.thread_id !== SCORE_PRODUCER_THREAD ||
          !["accepted", "unknown", "not_sent"].includes(value.status)
        )
          throw Error();
        finish({
          status: value.status,
          error: typeof value.error === "string" ? value.error : undefined,
        });
      } catch {
        finish({
          status: "unknown",
          error: `Session Bridge did not return a confirmed receipt: exit=${code}, signal=${signal || "none"}, error=${bridgeErrorCode(stderr)}`,
        });
      }
    });
    child.stdin.end(
      JSON.stringify({
        request_id: attempt.id,
        thread_id: SCORE_PRODUCER_THREAD,
        text: attempt.text,
      }),
    );
  });
}

/** Called only by explicit send/retry endpoints, serialized by the Vite plugin. */
export async function dispatchProductionRequest(
  root: string,
  store: ProductionRequestStore,
  id: string,
  questionId?: string,
  retry = false,
) {
  const view = await store.read(id);
  if (!questionId && view.progress) return view;
  const prior = [...view.dispatch.attempts]
    .reverse()
    .find((a) => a.questionId === questionId);
  // An HTTP retry with the same input never dispatches a second message.
  if (prior && (!retry || prior.status !== "not_sent")) return view;
  if (retry && (!prior || prior.status !== "not_sent"))
    throw Error("Only confirmed unsent requests can be retried");
  const answer = questionId
    ? view.answers.find((a) => a.questionId === questionId)
    : undefined;
  if (questionId && (!answer || view.progress?.question?.id !== questionId))
    throw Error("Production answer is no longer current");
  const requestSHA = productionSHA256(
    await readFile(join(store.directory(id), "request.json")),
  );
  const answerSHA = answer
    ? productionSHA256(
        await readFile(
          join(store.directory(id), "answers", `${questionId}.json`),
        ),
      )
    : undefined;
  const text = answer
    ? `악보 제작 요청 ${id}의 질문 ${questionId} 답변이 저장되었습니다. 프로젝트 ${root}에서 node tools/score-production/production_request.mjs show --request ${id} --request-sha256 ${requestSHA} --question-id ${questionId} --answer-sha256 ${answerSHA}로 요청·답장 파일을 확인하고 같은 작업을 이어서 처리해 주세요.`
    : `악보제작기에서 사용자가 제작·교정을 요청했습니다. 프로젝트: ${root}\n요청 ID: ${id}\n요청 파일: data/production/requests/${id}/request.json\n교정 기준 SHA256: ${view.request.source?.canonicalSHA256 || "새 제작"}\n악보 제작 스킬과 프로젝트 지침을 읽고 node tools/score-production/production_request.mjs show --request ${id} --request-sha256 ${requestSHA} 명령으로 입력을 확인한 뒤 start로 접수·진행을 기록하고 요청 범위 안에서 작업해 주세요. 질문·결과·검증 내역은 같은 CLI로 기록하세요. 이 메시지는 커밋·push·배포 또는 미승인 외부/유료 작업의 허가가 아닙니다.`;
  const attempt: ProductionAttempt = {
    id: randomUUID(),
    questionId,
    text,
    startedAt: new Date().toISOString(),
    status: "attempting",
  };
  view.dispatch.attempts.push(attempt);
  // Save intent before crossing the IPC boundary; crashes remain ambiguous, never retriable automatically.
  await store.dispatch(id, view.dispatch);
  Object.assign(attempt, await sendProducerMessage(root, attempt));
  return store.dispatch(id, view.dispatch);
}
