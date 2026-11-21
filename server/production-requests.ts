import { watch } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Plugin } from "vite";
import { createProductionRequestStore } from "./production-request-store.ts";
import { dispatchProductionRequest } from "./production-request-bridge.ts";
import {
  validateProductionAnswer,
  validateProductionRequest,
  validateProductionReceipt,
} from "../src/model/production-request.ts";

const api = "/api/score-requests";
const MAX_UPLOAD = 512 * 1024 * 1024;
const executeFile = promisify(execFile);
import {
  localEditorRequest,
  respond,
  webRequest,
} from "./local-editor-http.ts";
/** Local Vite only. Preview and the public player Worker have no producer connection. */
export function productionRequestsPlugin(): Plugin {
  return {
    name: "local-score-production-requests",
    apply: "serve",
    configureServer(server) {
      const root = server.config.root,
        store = createProductionRequestStore(root);
      let writes: Promise<unknown> = Promise.resolve();
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url || "/", "http://127.0.0.1:5173");
        if (!(url.pathname === api || url.pathname.startsWith(api + "/")))
          return next();
        if (!localEditorRequest(req)) {
          respond(res, 403, {
            error: "Local same-origin editor request required",
          });
          return;
        }
        const parts = url.pathname.slice(api.length).split("/").filter(Boolean);
        const [id, action] = parts;
        const read = async () => {
          if (!id) {
            respond(res, 200, await store.list());
            return;
          }
          const view = await store.read(id);
          if (action === "events") {
            res.writeHead(200, {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-store",
              Connection: "keep-alive",
            });
            const emit = () =>
              void store
                .read(id)
                .then((v) => {
                  if (!res.destroyed)
                    res.write(`data: ${JSON.stringify(v)}\n\n`);
                })
                .catch(() => {
                  if (!res.destroyed)
                    res.write("event: unavailable\ndata: {}\n\n");
                });
            const watcher = watch(store.directory(id), (_event, name) => {
              if (name === "progress.json" || name === "dispatch.json") emit();
            });
            const heartbeat = setInterval(
              () => res.write(": keepalive\n\n"),
              15000,
            );
            watcher.on("error", () => res.end());
            res.on("close", () => {
              watcher.close();
              clearInterval(heartbeat);
            });
            emit();
          } else if (action === "artifact") {
            const { bytes, asset } = await store.artifact(
              id,
              url.searchParams.get("path") || "",
            );
            res.writeHead(200, {
              "Content-Type": "application/octet-stream",
              "Cache-Control": "no-store",
              "X-Content-Type-Options": "nosniff",
              "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(asset.name)}`,
            });
            res.end(bytes);
          } else if (!action) respond(res, 200, view);
          else respond(res, 404, { error: "Unknown request endpoint" });
        };
        const write = async () => {
          if (!id) {
            const form = await webRequest(req, MAX_UPLOAD).formData();
            const value = JSON.parse(String(form.get("request")));
            validateProductionRequest(value);
            const files = new Map<string, Blob>();
            for (const [key, file] of form) {
              if (key === "request") continue;
              if (typeof file === "string" || files.has(key))
                throw Error("Invalid production upload");
              files.set(key, file);
            }
            await store.create(value, files);
            respond(
              res,
              200,
              await dispatchProductionRequest(root, store, value.id),
            );
            return;
          }
          const value = await webRequest(req, 64 * 1024).json();
          if (action === "open-result-folder") {
            if (
              parts.length !== 2 ||
              url.search ||
              !value ||
              typeof value !== "object" ||
              Array.isArray(value) ||
              Object.keys(value).length !== 0
            )
              throw Error(
                "Result folder endpoint accepts only the request ID and an empty JSON object",
              );
            if (process.platform !== "darwin")
              throw Error(
                `Opening Finder requires macOS: platform=${process.platform}`,
              );
            const directory = await store.resultDirectory(id);
            // No client path or shell command: only this request's owned result directory.
            await executeFile("/usr/bin/open", ["-a", "Finder", directory], {
              timeout: 10000,
            });
            respond(res, 200, { opened: true });
          } else if (action === "send") {
            respond(res, 200, await dispatchProductionRequest(root, store, id));
          } else if (action === "answer") {
            validateProductionAnswer(value);
            await store.answer(id, value);
            respond(
              res,
              200,
              await dispatchProductionRequest(
                root,
                store,
                id,
                value.questionId,
              ),
            );
          } else if (action === "retry") {
            if (
              value.questionId !== undefined &&
              typeof value.questionId !== "string"
            )
              throw Error("Invalid question ID");
            respond(
              res,
              200,
              await dispatchProductionRequest(
                root,
                store,
                id,
                value.questionId,
                true,
              ),
            );
          } else if (action === "applied") {
            validateProductionReceipt(value);
            const view = await store.read(id);
            const asset = view.progress?.result?.artifacts.find(
              (a) => a.primary && a.sha256 === value.artifactSHA256,
            );
            if (
              !asset ||
              view.progress?.phase !== "completed" ||
              value.requestId !== id ||
              (view.request.source &&
                view.request.source.songId !== value.songId)
            )
              throw Error("Invalid applied result receipt");
            const receipt = {
              requestId: value.requestId,
              artifactSHA256: value.artifactSHA256,
              songId: value.songId,
              appliedAt: value.appliedAt,
            };
            if (
              view.dispatch.applied &&
              JSON.stringify(view.dispatch.applied) !== JSON.stringify(receipt)
            )
              throw Error("Applied result receipt conflict");
            view.dispatch.applied = receipt;
            respond(res, 200, await store.dispatch(id, view.dispatch));
          } else respond(res, 404, { error: "Unknown request endpoint" });
        };
        const operation =
          req.method === "GET"
            ? read()
            : req.method === "POST"
              ? (writes = writes.catch(() => {}).then(write))
              : Promise.resolve(
                  respond(res, 405, { error: "Method not allowed" }),
                );
        void operation.catch((e: unknown) => {
          if (res.headersSent) {
            res.end();
            return;
          }
          respond(
            res,
            (e as NodeJS.ErrnoException).code === "ENOENT" ? 404 : 409,
            {
              error:
                e instanceof Error ? e.message : "Production request failed",
            },
          );
        });
      });
    },
  };
}
