import { secureResponse } from "./security-headers";
import { playerDocument } from "./player-document";
export default {
  async fetch(
    request: Request,
    env: { ASSETS: { fetch(request: Request): Promise<Response> } },
  ) {
    const url = new URL(request.url);
    // This player has no API. Never fall back to a document for retired endpoints.
    if (url.pathname.startsWith("/api/"))
      return secureResponse(
        new Response("Not found", { status: 404 }),
        request,
      );
    // Sites can serve matching static files before invoking the Worker.
    // HTML entrypoints are embedded here and omitted from deployed static files.
    if (["/", "/index.html", "/player.html"].includes(url.pathname)) {
      return secureResponse(
        new Response(playerDocument || "Player build unavailable", {
          status: playerDocument ? 200 : 503,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        }),
        request,
      );
    }
    return secureResponse(
      await env.ASSETS.fetch(new Request(url, request)),
      request,
    );
  },
};
