import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import type { Plugin } from "vite";
import {
  validateLyricCorrectionEnvelope,
  type LyricCorrectionEnvelope,
} from "../src/model/lyric-correction";
import { reconcileLyricCorrectionEnvelopes } from "../src/modules/lyrics/lyric-corrections";

function verify(value: unknown): LyricCorrectionEnvelope {
  validateLyricCorrectionEnvelope(value);
  if (
    createHash("sha256").update(value.canonicalXML).digest("hex") !==
    value.canonicalSHA256
  )
    throw Error("Canonical XML hash mismatch");
  return value;
}
async function readEnvelope(path: string) {
  try {
    return verify(JSON.parse(await readFile(path, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}
/** Dev-only local authoring receipt, never installed in preview or public Worker. */
export function lyricCorrectionsPlugin(): Plugin {
  let writes = Promise.resolve();
  return {
    name: "local-lyric-corrections",
    apply: "serve",
    configureServer(server) {
      const root = join(
        server.config.root,
        "data/production/lyric-corrections",
      );
      server.middlewares.use((req, res, next) => {
        const read = req.url?.match(
          /^\/data\/production\/lyric-corrections\/([^/]+)\/latest\.json$/,
        );
        if (!read && req.url !== "/api/lyric-corrections") return next();
        const host = req.headers.host;
        const respond = (status: number, value: unknown) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify(value));
        };
        if (
          !["127.0.0.1:5173", "localhost:5173"].includes(host || "") ||
          (read
            ? req.method !== "GET"
            : req.method !== "POST" ||
              req.headers.origin !== `http://${host}` ||
              req.headers["content-type"]?.split(";")[0] !== "application/json")
        ) {
          res.statusCode = 403;
          res.end("Local editor request required");
          return;
        }
        void (async () => {
          if (read) {
            const component = encodeURIComponent(decodeURIComponent(read[1]));
            if (component === "." || component === "..")
              throw Error("Invalid song ID");
            const envelope = await readEnvelope(
              join(root, component, "latest.json"),
            );
            respond(
              envelope ? 200 : 404,
              envelope || { error: "No lyric corrections" },
            );
            return;
          }
          const chunks: Buffer[] = [];
          let size = 0;
          for await (const chunk of req) {
            size += chunk.length;
            if (size > 32 * 1024 * 1024) {
              respond(413, { error: "Correction envelope exceeds 32 MiB" });
              return;
            }
            chunks.push(Buffer.from(chunk));
          }
          const incoming = verify(
            JSON.parse(Buffer.concat(chunks).toString("utf8")),
          );
          const component = encodeURIComponent(incoming.songId);
          if (component === "." || component === "..")
            throw Error("Invalid song ID");
          const directory = join(root, component),
            path = join(directory, "latest.json");
          const write = writes.then(async () => {
            const stored = await readEnvelope(path);
            const selected = reconcileLyricCorrectionEnvelopes(
              stored,
              incoming,
            );
            if (selected !== stored) {
              await mkdir(directory, { recursive: true });
              const temporary = join(directory, `.latest-${randomUUID()}.tmp`);
              try {
                await writeFile(
                  temporary,
                  JSON.stringify(selected, null, 2) + "\n",
                  { flag: "wx", mode: 0o600 },
                );
                await rename(temporary, path);
              } finally {
                await rm(temporary, { force: true });
              }
            }
            respond(200, {
              correctionId: incoming.corrections.at(-1)!.id,
              canonicalSHA256: incoming.canonicalSHA256,
              receivedAt: new Date().toISOString(),
            });
          });
          writes = write.catch(() => {});
          await write;
        })().catch((error: unknown) =>
          respond(409, {
            error:
              error instanceof Error
                ? error.message
                : "Lyric correction receipt failed",
          }),
        );
      });
    },
  };
}
