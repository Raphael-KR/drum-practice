// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { createPlaybackWakeLock } from "../../src/modules/playback/playback-wake-lock";
class Lock extends EventTarget {
  released = false;
  release = vi.fn(async () => {
    this.released = true;
    this.dispatchEvent(new Event("release"));
  });
}
const controllers: ReturnType<typeof createPlaybackWakeLock>[] = [];
const create = () => {
  const c = createPlaybackWakeLock();
  controllers.push(c);
  return c;
};
const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};
function visibility(value: string) {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}
function api(request = vi.fn(async () => new Lock())) {
  Object.defineProperty(navigator, "wakeLock", {
    configurable: true,
    value: { request },
  });
  return request;
}
afterEach(() => {
  controllers.splice(0).forEach((c) => c.dispose());
  delete (navigator as any).wakeLock;
  delete (document as any).visibilityState;
  vi.restoreAllMocks();
});
it("requests once while playing on any OS, then releases on pause/end", async () => {
  visibility("visible");
  const lock = new Lock();
  const request = api(vi.fn(async () => lock));
  const c = create();
  c.setPlaying(false);
  expect(request).not.toHaveBeenCalled();
  c.setPlaying(true);
  c.setPlaying(true);
  await settle();
  expect(request).toHaveBeenCalledExactlyOnceWith("screen");
  c.setPlaying(true);
  expect(request).toHaveBeenCalledTimes(1);
  c.setPlaying(false);
  await settle();
  expect(lock.release).toHaveBeenCalledTimes(1);
});
it("releases hidden screens and reacquires on return only while playing", async () => {
  visibility("visible");
  const first = new Lock(),
    second = new Lock();
  const request = api(
    vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second),
  );
  const c = create();
  c.setPlaying(true);
  await settle();
  visibility("hidden");
  await settle();
  expect(first.release).toHaveBeenCalledTimes(1);
  visibility("visible");
  await settle();
  expect(request).toHaveBeenCalledTimes(2);
  c.setPlaying(false);
  visibility("hidden");
  visibility("visible");
  await settle();
  expect(request).toHaveBeenCalledTimes(2);
});
it("releases a late response after pause or disposal", async () => {
  for (const dispose of [false, true]) {
    visibility("visible");
    let resolve!: (v: Lock) => void;
    const request = api(
      vi.fn(
        () =>
          new Promise<Lock>((r) => {
            resolve = r;
          }),
      ),
    );
    const c = create();
    c.setPlaying(true);
    dispose ? c.dispose() : c.setPlaying(false);
    const lock = new Lock();
    resolve(lock);
    await settle();
    expect(lock.release).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(1);
  }
});
it("keeps one pending request across a rapid pause and restart", async () => {
  visibility("visible");
  let resolve!: (v: Lock) => void;
  const request = api(
    vi.fn(
      () =>
        new Promise<Lock>((r) => {
          resolve = r;
        }),
    ),
  );
  const c = create();
  c.setPlaying(true);
  c.setPlaying(false);
  c.setPlaying(true);
  const lock = new Lock();
  resolve(lock);
  await settle();
  expect(lock.release).not.toHaveBeenCalled();
  expect(request).toHaveBeenCalledTimes(1);
  c.dispose();
  await settle();
  expect(lock.release).toHaveBeenCalledTimes(1);
});
it("does not retry an OS release in a loop, but handles a later visible event", async () => {
  visibility("visible");
  const first = new Lock(),
    second = new Lock();
  const request = api(
    vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second),
  );
  const c = create();
  c.setPlaying(true);
  await settle();
  await first.release();
  await settle();
  expect(request).toHaveBeenCalledTimes(1);
  visibility("visible");
  await settle();
  expect(request).toHaveBeenCalledTimes(2);
});
it("ignores unavailable APIs and rejected requests without stopping playback", async () => {
  visibility("visible");
  const c = create();
  expect(() => c.setPlaying(true)).not.toThrow();
  const request = api(
    vi.fn().mockRejectedValue(new DOMException("Denied", "NotAllowedError")),
  );
  c.setPlaying(true);
  await settle();
  expect(request).toHaveBeenCalledTimes(1);
  c.setPlaying(false);
  c.dispose();
  visibility("visible");
  await settle();
  expect(request).toHaveBeenCalledTimes(1);
});
it("does not request while hidden and forgets events after disposal", async () => {
  visibility("hidden");
  const request = api();
  const c = create();
  c.setPlaying(true);
  await settle();
  expect(request).not.toHaveBeenCalled();
  c.dispose();
  visibility("visible");
  await settle();
  expect(request).not.toHaveBeenCalled();
});
