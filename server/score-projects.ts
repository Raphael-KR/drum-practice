import { watch } from "node:fs";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Plugin } from "vite";
import {
  createScoreProjectStore,
  ProjectConflict,
} from "./score-project-store.ts";
import {
  localEditorRequest,
  respond,
  webRequest,
} from "./local-editor-http.ts";
import { sendProducerMessage } from "./production-request-bridge.ts";
import { hydrateProjectRecord } from "./score-project-assets.ts";
import type { ProjectWorkEntry } from "../src/model/score-project.ts";

const api = "/api/score-projects";
const execute = promisify(execFile);
export function scoreProjectsPlugin(): Plugin {
  return {
    name: "local-score-projects",
    apply: "serve",
    configureServer(server) {
      const store = createScoreProjectStore(server.config.root);
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url || "/", "http://127.0.0.1:5173");
        if (url.pathname !== api && !url.pathname.startsWith(api + "/"))
          return next();
        if (!localEditorRequest(req))
          return respond(res, 403, {
            error: "Local same-origin editor request required",
          });
        const [id, action, revision] = url.pathname
          .slice(api.length)
          .split("/")
          .filter(Boolean);
        async function run() {
          if (req.method === "GET") {
            if (!id) return respond(res, 200, await store.list());
            if (action === "events") {
              if (!(await store.head(id)))
                return respond(res, 404, {
                  error: `Project missing: id=${id}`,
                });
              res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-store",
                Connection: "keep-alive",
              });
              const emit = () =>
                void Promise.all([store.head(id), store.work(id)])
                  .then(([head, work]) => {
                    if (!res.destroyed)
                      res.write(`data: ${JSON.stringify({ head, work })}\n\n`);
                  })
                  .catch(() => {
                    if (!res.destroyed)
                      res.write("event: unavailable\ndata: {}\n\n");
                  });
              const watcher = watch(store.directory(id), (_event, name) => {
                if (name === "project.json" || name === "work.json") emit();
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
              return;
            }
            if (action === "history")
              return respond(res, 200, await store.history(id));
            if (action === "corrections") {
              if (!(await store.head(id)))
                return respond(res, 404, {
                  error: `Project missing: id=${id}`,
                });
              return respond(res, 200, (await store.corrections(id)) ?? null);
            }
            if (action === "save" && revision) {
              const saved = await store.saved(id, revision);
              return respond(res, 200, {
                ...saved,
                record: await hydrateProjectRecord(
                  store.directory(id),
                  saved.record,
                ),
              });
            }
            if (!action) return respond(res, 200, await store.read(id));
          } else if (req.method === "POST" && id) {
            if (action === "draft" || action === "save") {
              const value = await webRequest(req, 512 * 1024 * 1024).json();
              return respond(
                res,
                200,
                action === "save"
                  ? await store.save(id, value, "editor")
                  : await store.saveDraft(id, value),
              );
            }
            if (action === "folder") {
              if (!(await store.head(id)))
                throw Error(`Project missing: id=${id}`);
              await execute("/usr/bin/open", [store.directory(id)]);
              return respond(res, 200, { opened: true });
            }
            if (action === "request" || action === "answer") {
              const head = await store.head(id);
              if (!head) throw Error(`Project has no confirmed save: id=${id}`);
              const entry: ProjectWorkEntry = {
                id: randomUUID(),
                at: new Date().toISOString(),
                author: "editor",
                kind: action,
                text: store.directory(id),
                revision: head.revision,
                delivery: "unknown",
              };
              if (action === "answer") {
                const value = await webRequest(req, 65536).json();
                if (
                  typeof value.text !== "string" ||
                  !value.text.trim() ||
                  typeof value.questionId !== "string"
                )
                  throw Error("Project answer requires text and question ID");
                entry.text = value.text;
                entry.questionId = value.questionId;
              }
              await store.appendWork(id, entry);
              const receipt = await sendProducerMessage(server.config.root, {
                id: entry.id,
                text: `악보 제작 프로젝트를 확인해 주세요.\n프로젝트 ID: ${id}\n폴더: ${store.directory(id)}\n작업 항목: ${entry.id}\n최신 확정 저장본과 work.json을 읽고 이어서 처리해 주세요. draft.json은 미확정 초안입니다.`,
              });
              return respond(
                res,
                200,
                await store.updateDelivery(id, entry.id, {
                  delivery: receipt.status,
                  error: receipt.error,
                }),
              );
            }
          }
          respond(res, 404, { error: "Unknown project endpoint" });
        }
        void run().catch((error) => {
          if (res.headersSent) {
            res.end();
            return;
          }
          respond(res, error instanceof ProjectConflict ? 409 : 400, {
            error: String(error),
          });
        });
      });
    },
  };
}
