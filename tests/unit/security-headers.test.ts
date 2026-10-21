import { expect, it } from "vitest";
import { secureResponse } from "../../server/security-headers";

it("preserves the asset/error response while enforcing framing and MIME protections", async () => {
  const response = secureResponse(
    new Response("missing", {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-store",
        ETag: "original",
      },
    }),
    new Request("https://practice.example/missing"),
  );
  expect(response.status).toBe(404);
  expect(await response.text()).toBe("missing");
  expect(response.headers.get("Content-Type")).toBe("text/plain");
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(response.headers.get("ETag")).toBe("original");
  expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  expect(response.headers.get("Content-Security-Policy")).toContain(
    "frame-ancestors 'none'",
  );
  expect(response.headers.get("Strict-Transport-Security")).toBe(
    "max-age=31536000",
  );
});

it("does not require HTTPS on the local server; media/worker resource policy remains report-only", () => {
  const response = secureResponse(
    new Response(null, { status: 304 }),
    new Request("http://127.0.0.1:5173/"),
  );
  expect(response.status).toBe(304);
  expect(response.headers.has("Strict-Transport-Security")).toBe(false);
  expect(response.headers.get("Content-Security-Policy")).not.toContain(
    "script-src",
  );
  expect(response.headers.get("Content-Security-Policy-Report-Only")).toContain(
    "media-src 'self' blob:",
  );
  expect(response.headers.get("Content-Security-Policy-Report-Only")).toContain(
    "worker-src 'self' blob:",
  );
});
