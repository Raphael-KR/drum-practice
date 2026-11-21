// @vitest-environment jsdom
import { afterEach, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { editorSession } from "../../src/apps/editor/editor-session";
import type { RecordData } from "../../src/model/record";
vi.mock("../../src/apps/editor/lyric-correction-save", () => ({
  prepareLyricCorrectionSave: vi.fn(async () => {}),
}));
afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});
function setup() {
  vi.useFakeTimers();
  document.body.innerHTML =
    '<div id="editor-controls"></div><section id="editor-dialog"></section>';
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  let r: RecordData = { song, pdf: new Blob(), audio: new Blob(), pages: [] };
  let selected = 0;
  const persist = vi.fn<(confirmed?: RecordData) => Promise<void>>(
      async () => {},
    ),
    error = vi.fn();
  const session = editorSession({
    get: () => r,
    pending: () => false,
    form: () => ({ selected, fields: {} }),
    restoreForm: () => {},
    apply: (s) => {
      r = { ...r, ...structuredClone(s) };
    },
    flush: () => {},
    persist,
    error,
  });
  session.begin();
  return {
    session,
    persist,
    error,
    record: () => r,
    select: (i: number) => {
      selected = i;
    },
  };
}
it("keeps navigation clean and saves unconfirmed edits separately in the permanent workbench", async () => {
  const { session, persist, error, record, select } = setup();
  select(4);
  record().song.settings.position = 4;
  expect(session.dirty()).toBe(false);
  const title = record().song.title;
  session.before();
  record().song.title += " draft";
  session.changed();
  expect(session.forStorage()!.song.title).toBe(title);
  expect(session.forStorage()!.editDraft!.song.title).toBe(title + " draft");
  await vi.advanceTimersByTimeAsync(180);
  expect(persist).toHaveBeenCalledExactlyOnceWith();
  expect(session.active()).toBe(true);
  expect(document.querySelector("#edit-exit-dialog")).toBeNull();
  expect(error).not.toHaveBeenCalled();
  session.reset();
});
it("undo and redo restore lyrics and their split evidence together", () => {
  const { session, record } = setup();
  const before = structuredClone(record().song.lyrics);
  session.before();
  const components = before.slice(0, 2).map((lyric) => ({
    lyric,
    offsetQuarters:
      lyric.scorePosition!.quarterOffset -
      before[0].scorePosition!.quarterOffset,
  }));
  record().lyricWork = { groups: { [before[0].id]: components } };
  record().song.lyrics = before.slice(1);
  session.changed();
  document
    .querySelector<HTMLButtonElement>(
      '.editor-history-tools button[aria-label^="되돌리기"]',
    )!
    .click();
  expect(record().song.lyrics).toEqual(before);
  expect(record().lyricWork).toBeUndefined();
  document
    .querySelector<HTMLButtonElement>(
      '.editor-history-tools button[aria-label^="다시 실행"]',
    )!
    .click();
  expect(record().lyricWork?.groups?.[before[0].id]).toEqual(components);
  session.reset();
});
it("a failed confirmed save retains the editable draft and dirty state", async () => {
  const { session, persist, record } = setup();
  session.before();
  record().song.title += " draft";
  session.changed();
  const draft = record().editDraft;
  persist.mockRejectedValueOnce(new Error("head conflict"));
  await expect(session.commit()).rejects.toThrow("head conflict");
  expect(session.dirty()).toBe(true);
  expect(record().editDraft).toEqual(draft);
  expect(session.saving()).toBe(false);
  session.reset();
});
