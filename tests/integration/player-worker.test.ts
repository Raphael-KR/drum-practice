import { expect, it, vi } from "vitest";
vi.mock("../../server/player-document", () => ({
  playerDocument: "<!doctype html><title>Player</title>",
}));
import worker from "../../server/player-worker";
it("serves HTML with security headers without a database or asset lookup", async () => {
  const assets = vi.fn();
  for (const path of ["/", "/index.html", "/player.html"]) {
    const response = await worker.fetch(
      new Request("https://site.test" + path),
      { ASSETS: { fetch: assets } },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(await response.text()).toContain("<title>Player</title>");
  }
  expect(assets).not.toHaveBeenCalled();
});
it("retired analysis and review endpoints never read or write assets", async () => {
  const assets = vi.fn();
  for (const path of [
    "/api/audio-analysis/v4/" + "a".repeat(64),
    "/api/audio-analysis-review",
    "/api/local-analysis-review/summary",
  ])
    for (const method of ["GET", "PUT", "POST", "DELETE"]) {
      const response = await worker.fetch(
        new Request("https://site.test" + path, { method }),
        { ASSETS: { fetch: assets } },
      );
      expect(response.status).toBe(404);
    }
  expect(assets).not.toHaveBeenCalled();
});
it("still downloads server drumscore packages unchanged", async () => {
  const data = new Uint8Array([80, 75, 3, 4, 1, 2, 3]);
  const assets = vi.fn(async (req: Request) => {
    expect(new URL(req.url).pathname).toBe("/demo/exercise.drumscore");
    return new Response(data, {
      headers: { "Content-Type": "application/zip" },
    });
  });
  const response = await worker.fetch(
    new Request("https://site.test/demo/exercise.drumscore"),
    { ASSETS: { fetch: assets } },
  );
  expect(response.status).toBe(200);
  expect(new Uint8Array(await response.arrayBuffer())).toEqual(data);
});
