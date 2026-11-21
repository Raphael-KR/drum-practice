/** Report actual producer work through the same store used by the local editor. */
import { randomUUID } from "node:crypto";
import { readFile, realpath, stat } from "node:fs/promises";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  createProductionRequestStore,
  productionSHA256,
} from "../../server/production-request-store.ts";
import { validateProductionProgress } from "../../src/model/production-request.ts";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const store = createProductionRequestStore(projectRoot);
const usage = `Usage (Node 26):
  node tools/score-production/production_request.mjs list
  node tools/score-production/production_request.mjs show --request UUID [--request-sha256 SHA256]
    [--question-id UUID --answer-sha256 SHA256]
  node tools/score-production/production_request.mjs start --request UUID --message TEXT
  node tools/score-production/production_request.mjs question --request UUID --message TEXT [--question-id UUID]
  node tools/score-production/production_request.mjs complete --request UUID --result /path/to/result.json [--message TEXT]
  node tools/score-production/production_request.mjs fail --request UUID --message TEXT

result.json: {summary, checks:[{name,status,detail?}], artifacts:[{path:"result/...",kind,primary?}]}
Allowed check status: passed | not-run | failed. Put real files in result/ first.
Artifact name/sha256/size are computed from those files. Only drumscore can be primary.
No command sends messages, changes app storage, or applies an artifact.`;

const output = (value) => console.log(JSON.stringify(value, null, 2));
async function confinedFile(directory, path) {
  if (typeof path !== "string" || isAbsolute(path))
    throw Error("Expected a relative request asset path");
  const root = await realpath(directory);
  const actual = await realpath(join(root, path));
  const inside = relative(root, actual);
  if (
    !inside ||
    inside === ".." ||
    inside.startsWith(`..${sep}`) ||
    isAbsolute(inside)
  )
    throw Error("Asset leaves the request directory");
  if (!(await stat(actual)).isFile())
    throw Error("Asset is not a regular file");
  return readFile(actual);
}

async function readVerified(id, expectedHash) {
  const directory = store.directory(id);
  const root = await realpath(join(projectRoot, "data/production/requests"));
  if ((await realpath(directory)) !== join(root, id))
    throw Error("Request directory must not be a symlink");
  const bytes = await confinedFile(directory, "request.json");
  const requestSHA256 = productionSHA256(bytes);
  if (expectedHash !== undefined && expectedHash !== requestSHA256)
    throw Error("Request snapshot hash does not match the received message");
  const view = await store.read(id);
  // Read actual source bytes again: a valid JSON manifest alone is not input integrity.
  for (const asset of view.request.attachments) {
    const input = await confinedFile(directory, asset.path);
    if (input.length !== asset.size || productionSHA256(input) !== asset.sha256)
      throw Error(`Input integrity mismatch: ${asset.path}`);
  }
  if (view.request.source) {
    const canonical = view.request.attachments.find(
      (a) => a.path === "input/canonical.musicxml",
    );
    if (!canonical || canonical.sha256 !== view.request.source.canonicalSHA256)
      throw Error("Correction source does not match the canonical snapshot");
  }
  return { directory, requestSHA256, ...view };
}

async function resultManifest(directory, path) {
  const value = JSON.parse(await readFile(resolve(path), "utf8"));
  if (!value || !Array.isArray(value.artifacts))
    throw Error("Missing result artifacts");
  const artifacts = [];
  for (const asset of value.artifacts) {
    if (
      !asset ||
      typeof asset.path !== "string" ||
      !asset.path.startsWith("result/")
    )
      throw Error("Result artifacts must be inside result/");
    const bytes = await confinedFile(directory, asset.path);
    artifacts.push({
      name: basename(asset.path),
      path: asset.path,
      kind: asset.kind,
      ...(asset.primary === undefined ? {} : { primary: asset.primary }),
      sha256: productionSHA256(bytes),
      size: bytes.length,
    });
  }
  return { summary: value.summary, checks: value.checks, artifacts };
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      request: { type: "string" },
      "request-sha256": { type: "string" },
      "answer-sha256": { type: "string" },
      message: { type: "string" },
      "question-id": { type: "string" },
      result: { type: "string" },
      help: { type: "boolean" },
    },
  });
  if (values.help) {
    console.log(usage);
    return;
  }
  const [command] = positionals;
  if (
    positionals.length !== 1 ||
    !["list", "show", "start", "question", "complete", "fail"].includes(command)
  )
    throw Error(usage);
  if (command === "list") {
    output(
      (await store.list()).map((view) => ({
        id: view.request.id,
        title: view.request.title,
        kind: view.request.kind,
        createdAt: view.request.createdAt,
        phase: view.progress?.phase ?? null,
        dispatch: view.dispatch.attempts.at(-1)?.status ?? null,
      })),
    );
    return;
  }
  if (!values.request) throw Error("--request UUID is required");
  const view = await readVerified(values.request, values["request-sha256"]);
  if (values["answer-sha256"] !== undefined) {
    if (command !== "show" || !values["question-id"])
      throw Error("Answer integrity checking requires show and --question-id");
    const answer = view.answers.find(
      (item) => item.questionId === values["question-id"],
    );
    if (!answer) throw Error("The received question has no saved answer");
    const bytes = await confinedFile(
      view.directory,
      `answers/${answer.questionId}.json`,
    );
    if (productionSHA256(bytes) !== values["answer-sha256"])
      throw Error("Answer snapshot hash does not match the received message");
  }
  if (command === "show") {
    // Dispatch text duplicates the original prompt. Keep actual task, replies and state.
    output({
      ...view,
      dispatch: {
        ...view.dispatch,
        attempts: view.dispatch.attempts.map((attempt) => ({
          id: attempt.id,
          questionId: attempt.questionId,
          startedAt: attempt.startedAt,
          status: attempt.status,
          error: attempt.error,
        })),
      },
    });
    return;
  }
  if (view.progress?.phase === "completed")
    throw Error(
      "This request is already completed; create a new request for further work",
    );
  if (command !== "complete" && !values.message?.trim())
    throw Error(
      "--message is required to describe actual work or the question",
    );
  if (command === "complete" && !values.result)
    throw Error("--result manifest.json is required");
  const result =
    command === "complete"
      ? await resultManifest(view.directory, values.result)
      : undefined;
  const progress = {
    version: 1,
    requestId: values.request,
    updatedAt: new Date().toISOString(),
    phase: {
      start: "working",
      question: "question",
      complete: "completed",
      fail: "failed",
    }[command],
    message: values.message || result.summary,
    ...(command === "question"
      ? {
          question: {
            id:
              values["question-id"] ||
              (view.progress?.question?.text === values.message
                ? view.progress.question.id
                : randomUUID()),
            text: values.message,
          },
        }
      : {}),
    ...(result ? { result } : {}),
  };
  validateProductionProgress(progress);
  const saved = await store.progress(values.request, progress);
  if (JSON.stringify(saved.progress) !== JSON.stringify(progress))
    throw Error(
      "Saved production progress does not match the submitted report",
    );
  output({
    requestId: values.request,
    directory: view.directory,
    progress: saved.progress,
  });
}

await main().catch((error) => {
  console.error(
    JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exitCode = 1;
});
