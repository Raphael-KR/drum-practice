import { it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
it("allows a file-origin song to run when browser storage is unavailable", async () => {
  vi.resetModules();
  vi.stubGlobal("document", {
    getElementById: (id: string) => (id === "portable-data" ? {} : null),
  });
  const open = vi.fn(() => {
    throw Error("Storage denied for file origin");
  });
  vi.stubGlobal("indexedDB", { open });
  try {
    const { saveRecord, allRecords } = await import("../src/storage");
    const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
    const blob = new Blob(["test"]);
    await saveRecord({
      song,
      pdf: blob,
      audio: blob,
      pages: [blob, blob, blob],
    });
    expect((await allRecords())[0].song.id).toBe(song.id);
    expect(open).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});
