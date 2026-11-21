// @vitest-environment jsdom
// Current authoring entry points. Shared playback gestures/tempo/repeats are covered
// by playback-screen.test.ts and integration/playback-actions.test.ts.
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import type { Song } from "../../src/model/model";
import type { RecordData } from "../../src/model/record";
import type { Player } from "../../src/modules/audio/audio-core";
import { editorHTML } from "../../src/apps/editor/editor-view";
import {
  arrangeWorkspace,
  openEditorDialog,
} from "../../src/apps/editor/workspace";
import { createPlaybackScreen } from "../../src/modules/playback/playback-screen";
import { webPlaybackBindings } from "../../src/modules/playback/playback-ui";
import { createLyricEditor } from "../../src/apps/editor/editor-lyrics";
import { createEditorForm } from "../../src/apps/editor/editor-form";
import { installEditorImport } from "../../src/apps/editor/editor-import";
const disposers: (() => void)[] = [];
function readSong(): Song {
  return JSON.parse(readFileSync("public/demo/song.json", "utf8"));
}
beforeEach(() => {
  document.body.innerHTML = `<div id="app">${editorHTML()}</div>`;
  arrangeWorkspace();
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 1),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});
afterEach(() => {
  disposers
    .splice(0)
    .reverse()
    .forEach((dispose) => dispose());
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});
const input = (id: string) => document.getElementById(id) as HTMLInputElement;
it("composes the shared score, transport and always-open workbench with the restored grid", () => {
  for (const id of ["library-button", "home", "play", "jump"]) {
    const button = document.getElementById(id)!;
    expect(button.querySelector("svg")).not.toBeNull();
    expect(button.getAttribute("aria-label")).toBeTruthy();
  }
  const practice = document.getElementById("practice")!;
  expect([...practice.children].map((el) => el.id || el.className)).toEqual(
    expect.arrayContaining(["stage", "editor-dialog"]),
  );
  const stage = document.getElementById("stage")!;
  const transport = practice.querySelector(".transport")!;
  const workbench = document.getElementById("editor-dialog")!;
  expect(
    stage.compareDocumentPosition(transport) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(
    transport.compareDocumentPosition(workbench) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(workbench.tagName).toBe("SECTION");
  expect(
    [...document.querySelectorAll<HTMLOptionElement>("#lyric-grid option")].map(
      (o) => o.value,
    ),
  ).toEqual(["8", "16", "32", "64"]);
  expect(
    document.querySelector(
      "#settings-dialog, #score-workspace-tabs, #rate, #loop-slots, #click, #marker-dialog",
    ),
  ).toBeNull();
  expect(document.getElementById("editor-meta")!.parentElement).toBe(
    document.getElementById("editor-lyrics")!.parentElement,
  );
  const child = document.getElementById("original-dialog") as HTMLDialogElement;
  openEditorDialog(child);
  expect(child.open).toBe(true);
});
it("mounts authoring on the actual reduced markup without requiring removed practice inputs", () => {
  const song = readSong();
  song.settings.view = "ribbon";
  const root = document.getElementById("app")!;
  const p = {
    playing: false,
    position: 0,
    duration: 300,
    current: () => 0,
    count: () => 0,
    volumes: vi.fn(),
    updateMetronome: vi.fn(),
    pause: vi.fn(),
    seek: vi.fn(),
    play: vi.fn(async () => {}),
    setRate: vi.fn(async () => {}),
  };
  const fail = vi.fn(),
    changed = vi.fn();
  const screen = createPlaybackScreen({
    root,
    environment: "web",
    authoring: true,
    ids: {
      ...webPlaybackBindings,
      rewindButton: "jump",
      radiusAttribute: "data-loop-radius",
      settings: undefined,
    },
    song: () => song,
    player: () => p as unknown as Player,
    ready: () => true,
    busy: () => false,
    setBusy: () => {},
    assets: () => ({ urls: [], ratios: [], staffs: new Map(), highlights: [] }),
    highlight: () => false,
    formats: () => ["musicxml"],
    fail,
    changed,
    preferences: {
      restartId: "",
      countoffId: "",
      read: () => ({ restartMeasure: false, countOff: false }),
      write: vi.fn(),
    },
    display: {
      highlightId: "",
      fullscreenId: "",
      fullscreen: () => false,
      setFullscreen: vi.fn(),
      setHighlight: vi.fn(),
      report: vi.fn(),
    },
  });
  disposers.push(screen.dispose);
  screen.sync();
  expect(document.getElementById("song-title")!.textContent).toBe(
    `${song.title} - ${song.artist}`,
  );
  const markers = structuredClone(song.markers);
  screen.mark();
  expect(song.markers).toEqual(markers);
  expect(p.setRate).not.toHaveBeenCalled();
  song.settings.view = "compare";
  screen.syncDisplay();
  expect(input("zoom").disabled).toBe(false);
  song.settings.view = "rows";
  screen.syncDisplay();
  expect(input("zoom").disabled).toBe(true);
  expect(fail).not.toHaveBeenCalled();
});
function mountLyrics() {
  let r: RecordData = {
    song: readSong(),
    pdf: new Blob(),
    audio: new Blob(),
    pages: [],
  };
  let selected = r.song.measures.findIndex(
    (m) => m.id === r.song.lyrics[0].scorePosition!.measureId,
  );
  const edit = vi.fn(
    (mut: (s: Song) => void, work?: RecordData["lyricWork"]) => {
      r = { ...r, song: structuredClone(r.song) };
      mut(r.song);
      if (work !== undefined) r.lyricWork = work;
    },
  );
  const error = vi.fn();
  const lyrics = createLyricEditor({
    song: () => r.song,
    record: () => r,
    selected: () => selected,
    selectMeasure: (index) => {
      selected = index;
    },
    flush: () => {},
    edit,
    selectionChanged: vi.fn(),
    error,
  });
  disposers.push(lyrics.dispose);
  lyrics.render();
  return { lyrics, edit, error, record: () => r, selected: () => selected };
}
it("shows current-measure cards and retains exact onsets when changing grid", () => {
  const { lyrics, record } = mountLyrics();
  const song = record().song;
  const positions = song.lyrics.map((l) => structuredClone(l.scorePosition));
  expect(document.querySelectorAll(".lyric-card")).toHaveLength(
    song.lyrics.filter(
      (l) =>
        l.scorePosition?.measureId === song.lyrics[0].scorePosition!.measureId,
    ).length,
  );
  input("lyric-grid").value = "8";
  input("lyric-grid").dispatchEvent(new Event("change", { bubbles: true }));
  expect(lyrics.grid()).toBe(8);
  expect(song.lyrics.map((l) => l.scorePosition)).toEqual(positions);
});
it("merges a contiguous selection and splits only its saved components; inputs keep ordinary M/S typing", () => {
  const { lyrics, record, edit, error } = mountLyrics();
  const initial = structuredClone(record().song.lyrics);
  lyrics.selection(initial[0].id);
  lyrics.selection(initial[1].id, true);
  const pane = document.getElementById("editor-lyrics")!;
  pane.dispatchEvent(
    new KeyboardEvent("keydown", { key: "m", bubbles: true, cancelable: true }),
  );
  expect(record().song.lyrics).toHaveLength(initial.length - 1);
  expect(record().song.lyrics[0].id).toBe(initial[0].id);
  pane.dispatchEvent(
    new KeyboardEvent("keydown", { key: "s", bubbles: true, cancelable: true }),
  );
  expect(record().song.lyrics).toEqual(initial);
  const calls = edit.mock.calls.length;
  document.querySelector<HTMLInputElement>(".lyric-card input")!.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "m",
      bubbles: true,
      cancelable: true,
    }),
  );
  expect(edit).toHaveBeenCalledTimes(calls);
  expect(error).not.toHaveBeenCalled();
});
it("flushes card text and metadata without the removed location-input fields", () => {
  const { lyrics, record, edit, selected } = mountLyrics();
  const form = createEditorForm({
    song: () => record().song,
    selected,
    edit,
    renderLyricEditor: lyrics.render,
    updateSongHeading: vi.fn(),
  });
  form.fillMetadata();
  const lyric = record().song.lyrics[0];
  const position = structuredClone(lyric.scorePosition);
  document.querySelector<HTMLInputElement>(
    ".lyric-card input[data-field=text]",
  )!.value += " corrected";
  input("edit-artist").value += " corrected";
  form.flushEditorForm();
  expect(record().song.lyrics[0].text).toBe(lyric.text + " corrected");
  expect(record().song.lyrics[0].scorePosition).toEqual(position);
  expect(form.pendingEditorValues().lyrics).toEqual([]);
});
it("imports through the existing file form and hands the record to file-project activation", async () => {
  const song = readSong(),
    activate = vi.fn<(record: RecordData) => Promise<void>>(async () => {}),
    openEditor = vi.fn(async () => {}),
    error = vi.fn();
  const h = {
    busy: false,
    status: vi.fn(),
    tell: vi.fn(),
    error,
    activate,
    openEditor,
    renderScore: vi.fn(async () => ({
      pages: [new Blob()],
      regions: song.regions,
    })),
  };
  installEditorImport(h);
  const form = document.getElementById("new-form")!;
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await vi.waitFor(() => expect(error).toHaveBeenCalledOnce());
  expect(activate).not.toHaveBeenCalled();
  Object.defineProperty(input("pdf-file"), "files", {
    value: [
      new File([readFileSync("public/demo/score.pdf")], "score.pdf", {
        type: "application/pdf",
      }),
    ],
  });
  Object.defineProperty(input("audio-file"), "files", {
    value: [
      new File([readFileSync("public/demo/audio.mp3")], "audio.mp3", {
        type: "audio/mpeg",
      }),
    ],
  });
  input("new-title").value = song.title;
  input("new-artist").value = song.artist ?? "";
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await vi.waitFor(() => expect(openEditor).toHaveBeenCalledOnce());
  expect(activate.mock.calls[0][0].song.title).toBe(song.title);
  expect(h.busy).toBe(false);
});
