import { afterEach, expect, it, vi } from "vitest";
import { downloadScore } from "../src/download-score";
let request: any;
class FakeXHR {
  status = 200;
  response = new Blob(["score"]);
  open = vi.fn(); setRequestHeader = vi.fn(); send = vi.fn();
  constructor() { request = this; }
}
afterEach(() => vi.unstubAllGlobals());
it("reports byte-based progress and only completes on successful response", async () => {
  vi.stubGlobal("XMLHttpRequest", FakeXHR);
  const progress = vi.fn();
  const result = downloadScore("/score", progress);
  expect(progress).toHaveBeenLastCalledWith(null);
  request.onprogress({ lengthComputable: true, loaded: 40, total: 100 });
  expect(progress).toHaveBeenLastCalledWith(40);
  request.onprogress({ lengthComputable: true, loaded: 100, total: 100 });
  expect(progress).toHaveBeenLastCalledWith(99);
  request.onload();
  expect(progress).toHaveBeenLastCalledWith(100);
  expect(await result).toBe(request.response);
});
it("keeps unknown totals indeterminate and rejects errors for retry", async () => {
  vi.stubGlobal("XMLHttpRequest", FakeXHR);
  const progress = vi.fn();
  const result = downloadScore("/score", progress);
  request.onprogress({ lengthComputable: false, loaded: 40, total: 0 });
  expect(progress).toHaveBeenLastCalledWith(null);
  request.status = 503; request.onload();
  await expect(result).rejects.toThrow("503");
  expect(progress).not.toHaveBeenCalledWith(100);
});
it.each(["onerror", "ontimeout", "onabort"])("rejects %s", async event => {
  vi.stubGlobal("XMLHttpRequest", FakeXHR);
  const result = downloadScore("/score", vi.fn());
  request[event]();
  await expect(result).rejects.toThrow();
});
