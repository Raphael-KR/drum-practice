import { Readable, Transform } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";

export function localEditorRequest(req: IncomingMessage) {
  const host = req.headers.host;
  return (
    ["127.0.0.1:5173", "localhost:5173"].includes(host || "") &&
    req.headers["sec-fetch-site"] !== "cross-site" &&
    (!req.headers.origin || req.headers.origin === `http://${host}`) &&
    (req.method !== "POST" || req.headers.origin === `http://${host}`)
  );
}
export function webRequest(req: IncomingMessage, limit: number) {
  let size = 0;
  const limiter = new Transform({
    transform(chunk, _encoding, callback) {
      size += chunk.length;
      callback(
        size > limit
          ? Error(
              `Local editor upload limit exceeded: maximum=${limit}, received=${size}`,
            )
          : null,
        chunk,
      );
    },
  });
  req.pipe(limiter);
  req.on("aborted", () => limiter.destroy(Error("Upload aborted")));
  return new Request("http://127.0.0.1:5173" + req.url, {
    method: "POST",
    headers: { "content-type": req.headers["content-type"] || "" },
    body: Readable.toWeb(limiter) as ReadableStream<Uint8Array>,
    duplex: "half",
  } as RequestInit & { duplex: string });
}
export function respond(res: ServerResponse, status: number, value: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(value));
}
