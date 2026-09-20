// @vitest-environment jsdom
import { it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { editorSession } from "../src/editor-session";
import type { RecordData } from "../src/storage";
it("keeps drafts separate, does not mark navigation dirty, and discards safely", async () => {
  document.body.innerHTML =
    '<dialog id="editor-dialog"><div class="editor-tabs"></div><button data-close="editor-dialog">close</button></dialog>';
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  let r: RecordData = { song, pdf: new Blob(), audio: new Blob(), pages: [] },
    pending = false,
    selected = 0;
  const persist = vi.fn(async () => {}),
    error = vi.fn();
  const session = editorSession({
    get: () => r,
    pending: () => pending,
    form: () => ({ selected, fields: { title: r.song.title } }),
    restoreForm: () => {},
    apply: (s) => {
      r = { ...r, ...structuredClone(s) };
    },
    flush: () => {
      pending = false;
    },
    persist,
    error,
  });
  session.begin();
  selected = 4;
  document.querySelector<HTMLButtonElement>("[data-close]")!.click();
  expect(
    (document.getElementById("edit-exit-dialog") as HTMLDialogElement).open,
  ).toBe(false);
  session.begin();
  const title = r.song.title;
  session.before();
  r.song.title = "draft";
  session.changed();
  expect(session.forStorage()!.song.title).toBe(title);
  expect(session.forStorage()!.editDraft!.song.title).toBe("draft");
  document.querySelector<HTMLButtonElement>("[data-close]")!.click();
  expect(
    (document.getElementById("edit-exit-dialog") as HTMLDialogElement).open,
  ).toBe(true);
  document.querySelector<HTMLButtonElement>('[data-answer="discard"]')!.click();
  await vi.waitFor(() => expect(session.active()).toBe(false));
  expect(r.song.title).toBe(title);
  expect(r.editDraft).toBeUndefined();
  expect(error).not.toHaveBeenCalled();
});
