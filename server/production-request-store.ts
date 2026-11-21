import { createHash, randomUUID } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { join, sep } from "node:path";
import { realpathSync } from "node:fs";
import {
  productionRequestId,
  validateProductionAnswer,
  validateProductionProgress,
  validateProductionRequest,
  validateProductionDispatch,
  type ProductionAnswer,
  type ProductionArtifact,
  type ProductionDispatch,
  type ProductionProgress,
  type ProductionRequest,
  type ProductionRequestView,
} from "../src/model/production-request.ts";

export const productionSHA256 = (bytes: Uint8Array | string) =>
  createHash("sha256").update(bytes).digest("hex");
async function json(path: string): Promise<unknown | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw e;
  }
}
export async function atomicJSON(path: string, value: unknown) {
  const temp = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temp, JSON.stringify(value, null, 2) + "\n", {
      flag: "wx",
      mode: 0o600,
    });
    await rename(temp, path);
  } finally {
    await rm(temp, { force: true });
  }
}

/** request/input are immutable; only the app writes dispatch/answers, only the producer writes progress. */
export function createProductionRequestStore(projectRoot: string) {
  const root = join(realpathSync(projectRoot), "data/production/requests");
  const directory = (id: string) => {
    productionRequestId(id);
    return join(root, id);
  };
  async function ownedDirectory(id: string) {
    const path = directory(id);
    if ((await realpath(path)) !== path)
      throw Error("Request directory must not be a symbolic link");
    return path;
  }
  async function ownedJSON(dir: string, name: string) {
    const path = join(dir, name);
    try {
      if (!(await realpath(path)).startsWith(dir + sep))
        throw Error("Request file leaves its directory");
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return undefined;
      throw e;
    }
    return json(path);
  }
  async function read(id: string): Promise<ProductionRequestView> {
    const dir = await ownedDirectory(id);
    const request = await ownedJSON(dir, "request.json");
    if (!request)
      throw Object.assign(Error("Production request not found"), {
        code: "ENOENT",
      });
    validateProductionRequest(request);
    if (request.id !== id) throw Error("Production request ID mismatch");
    const progress = await ownedJSON(dir, "progress.json");
    if (progress) {
      validateProductionProgress(progress);
      if (progress.requestId !== id)
        throw Error("Production progress ID mismatch");
    }
    const dispatch = (await ownedJSON(dir, "dispatch.json")) || {
      version: 1,
      requestId: id,
      attempts: [],
    };
    validateProductionDispatch(dispatch);
    if (dispatch.requestId !== id)
      throw Error("Invalid production dispatch record");
    const answers: ProductionAnswer[] = [];
    if ((await realpath(join(dir, "answers"))) !== join(dir, "answers"))
      throw Error("Invalid answer directory");
    for (const name of await readdir(join(dir, "answers"))) {
      if (!name.endsWith(".json")) continue;
      const value = await ownedJSON(dir, `answers/${name}`);
      validateProductionAnswer(value);
      answers.push(value);
    }
    return {
      request,
      dispatch,
      progress: progress as ProductionProgress | undefined,
      answers,
    };
  }
  async function artifactBytes(id: string, asset: ProductionArtifact) {
    const dir = await ownedDirectory(id);
    const path = await realpath(join(dir, asset.path));
    if (!path.startsWith(dir + sep))
      throw Error("Result path leaves the request directory");
    const bytes = await readFile(path);
    if (bytes.length !== asset.size || productionSHA256(bytes) !== asset.sha256)
      throw Error("Production artifact hash mismatch");
    return { bytes, asset };
  }
  return {
    directory,
    read,
    async list() {
      let entries;
      try {
        if ((await realpath(root)) !== root)
          throw Error("Request root must not be a symbolic link");
        entries = await readdir(root, { withFileTypes: true });
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
        throw e;
      }
      const result: ProductionRequestView[] = [];
      for (const entry of entries) {
        if (entry.name.startsWith(".") || !entry.isDirectory()) continue;
        result.push(await read(entry.name));
      }
      return result.sort((a, b) =>
        b.request.createdAt.localeCompare(a.request.createdAt),
      );
    },
    async create(request: ProductionRequest, files: Map<string, Blob>) {
      validateProductionRequest(request);
      if (files.size !== request.attachments.length)
        throw Error("Input file count mismatch");
      await mkdir(root, { recursive: true });
      if ((await realpath(root)) !== root)
        throw Error("Request root must not be a symbolic link");
      const staging = join(root, `.new-${request.id}-${randomUUID()}`);
      await mkdir(staging);
      try {
        for (const name of ["input", "result", "answers"])
          await mkdir(join(staging, name));
        for (const asset of request.attachments) {
          // Browser uploads use flat input names; result subdirectories are handled separately.
          if (asset.path.split("/").length !== 2)
            throw Error("Invalid input path");
          const file = files.get(asset.path);
          if (!file) throw Error("Missing production input");
          const bytes = new Uint8Array(await file.arrayBuffer());
          if (
            bytes.length !== asset.size ||
            productionSHA256(bytes) !== asset.sha256
          )
            throw Error("Production input hash mismatch");
          await writeFile(join(staging, asset.path), bytes, {
            flag: "wx",
            mode: 0o600,
          });
        }
        if (request.source) {
          const source = files.get("input/canonical.musicxml");
          if (
            !source ||
            productionSHA256(new Uint8Array(await source.arrayBuffer())) !==
              request.source.canonicalSHA256
          )
            throw Error("Correction source hash mismatch");
        }
        await atomicJSON(join(staging, "request.json"), request);
        try {
          await rename(staging, directory(request.id));
        } catch (e) {
          if (
            !["EEXIST", "ENOTEMPTY"].includes(
              (e as NodeJS.ErrnoException).code || "",
            )
          )
            throw e;
          if (
            JSON.stringify((await read(request.id)).request) !==
            JSON.stringify(request)
          )
            throw Error("Request ID already belongs to different input", {
              cause: e,
            });
        }
      } finally {
        await rm(staging, { recursive: true, force: true });
      }
      return read(request.id);
    },
    async progress(id: string, value: ProductionProgress) {
      await read(id);
      validateProductionProgress(value);
      if (value.requestId !== id)
        throw Error("Production progress ID mismatch");
      for (const asset of value.result?.artifacts || [])
        await artifactBytes(id, asset);
      await atomicJSON(join(directory(id), "progress.json"), value);
      return read(id);
    },
    async artifact(id: string, path: string) {
      const view = await read(id);
      const asset = view.progress?.result?.artifacts.find(
        (a) => a.path === path,
      );
      if (!asset) throw Error("Unknown production artifact");
      return artifactBytes(id, asset);
    },
    async resultDirectory(id: string) {
      const view = await read(id);
      if (!view.progress?.result)
        throw Error(
          `Production result unavailable: request=${id}, phase=${view.progress?.phase}`,
        );
      const path = join(await ownedDirectory(id), "result");
      const resolved = await realpath(path);
      if (resolved !== path)
        throw Error(
          `Result directory must not be a symbolic link: expected=${path}, actual=${resolved}`,
        );
      if (!(await stat(path)).isDirectory())
        throw Error(
          `Result path is not a directory: request=${id}, path=${path}`,
        );
      return path;
    },
    async answer(id: string, value: ProductionAnswer) {
      validateProductionAnswer(value);
      const view = await read(id);
      if (
        view.progress?.phase !== "question" ||
        view.progress.question?.id !== value.questionId
      )
        throw Error("This production question is no longer current");
      const old = view.answers.find((a) => a.questionId === value.questionId);
      if (old) {
        if (JSON.stringify(old) !== JSON.stringify(value))
          throw Error("Question already answered");
        return view;
      }
      await atomicJSON(
        join(directory(id), "answers", `${value.questionId}.json`),
        value,
      );
      return read(id);
    },
    async dispatch(id: string, value: ProductionDispatch) {
      await read(id);
      validateProductionDispatch(value);
      if (value.version !== 1 || value.requestId !== id)
        throw Error("Production dispatch ID mismatch");
      await atomicJSON(join(directory(id), "dispatch.json"), value);
      return read(id);
    },
  };
}
export type ProductionRequestStore = ReturnType<
  typeof createProductionRequestStore
>;
