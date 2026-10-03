import "fake-indexeddb/auto";
import { expect, it, vi } from "vitest";
import { cachedScoreRender, scoreRenderKey } from "../src/score-render-cache";
const value = () => ({
  pages: [new Blob(["svg"], { type: "image/svg+xml" })],
  regions: [{ id: "r1", page: 0, x: 0, y: 0, w: 1, h: 1, beatXs: [0, 1] }],
});
it("keys source, part and engraving policy independently", async () => {
  const keys = await Promise.all(
    [
      ["xml", "P1", "v1"],
      ["xml2", "P1", "v1"],
      ["xml", "P2", "v1"],
      ["xml", "P1", "v2"],
    ].map((a) => scoreRenderKey(...(a as [string, string, string]))),
  );
  expect(new Set(keys).size).toBe(4);
  expect(await scoreRenderKey("xml", "P1", "v1")).toBe(keys[0]);
});
it("coalesces cold work and reopens persisted owned bytes without engraving", async () => {
  const render = vi.fn(async () => value());
  const [a, b] = await Promise.all([
    cachedScoreRender("shared", render),
    cachedScoreRender("shared", render),
  ]);
  expect(render).toHaveBeenCalledTimes(1);
  expect(a.hit).toBe(false);
  expect(b.value).toEqual(a.value);
  const warm = await cachedScoreRender("shared", render);
  expect(warm.hit).toBe(true);
  expect(await warm.value.pages[0].text()).toBe("svg");
  expect(render).toHaveBeenCalledTimes(1);
});
it("does not cache failures and permits retry", async () => {
  await expect(
    cachedScoreRender("failure", async () => {
      throw Error("render");
    }),
  ).rejects.toThrow("render");
  expect((await cachedScoreRender("failure", async () => value())).hit).toBe(
    false,
  );
});
it("renders even if storage is unavailable", async () => {
  const spy = vi.spyOn(indexedDB, "open").mockImplementation(() => {
    throw Error("unavailable");
  });
  try {
    expect((await cachedScoreRender("private", async () => value())).hit).toBe(
      false,
    );
  } finally {
    spy.mockRestore();
  }
});
it("bounds cache retention to four results", async () => {
  for (let i = 0; i < 6; i++)
    await cachedScoreRender("limit" + i, async () => value());
  expect((await cachedScoreRender("limit0", async () => value())).hit).toBe(
    false,
  );
});
it('rejects corrupted cached bytes and regenerates', async () => {
  await cachedScoreRender('corrupt',async()=>value());
  const db = await new Promise<IDBDatabase>((ok,no)=>{const r=indexedDB.open('drum-score-render-cache',1);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});
  await new Promise<void>((ok,no)=>{const tx=db.transaction('renders','readwrite'),s=tx.objectStore('renders'),r=s.get('corrupt');r.onsuccess=()=>{const v=r.result;v.pages[0].bytes=new TextEncoder().encode('bad').buffer;s.put(v);};tx.oncomplete=()=>ok();tx.onerror=()=>no(tx.error);});db.close();
  const render=vi.fn(async()=>value());
  expect((await cachedScoreRender('corrupt',render)).hit).toBe(false);
  expect(render).toHaveBeenCalledTimes(1);
});
