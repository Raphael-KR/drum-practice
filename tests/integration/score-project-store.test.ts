import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import {
  createScoreProjectStore,
  ProjectConflict,
} from "../../server/score-project-store";
import { defaults } from "../../src/model/model";
import type { PackedRecord } from "../../src/model/serialized-record";

let root: string;
let store: ReturnType<typeof createScoreProjectStore>;
const id = "release-project-test";
function record(): PackedRecord {
  const asset = {
    type: "text/plain",
    base64: Buffer.from("original bytes").toString("base64"),
  };
  return {
    version: 2,
    song: {
      version: 1,
      id,
      title: "Project",
      bpm: 120,
      firstBeat: 0,
      measures: [],
      regions: [],
      lyrics: [],
      markers: [],
      loops: [],
      settings: defaults(),
      audioName: "audio",
      pdfName: "score",
      pageCount: 0,
    },
    pdf: asset,
    audio: asset,
    pages: [],
    canonicalXML: "<score-partwise/>",
    lyricWork: { text: "authoring source" },
  };
}
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "drum-project-test-"));
  store = createScoreProjectStore(root);
});
afterEach(async () => rm(root, { recursive: true, force: true }));

it("keeps drafts separate, rejects stale writes and preserves an editor draft through producer saves", async () => {
  const initial = await store.save(
    id,
    { base: null, expectedDraft: null, record: record() },
    "editor",
  );
  const pending = record();
  pending.song.title = "Unconfirmed";
  const draft = await store.saveDraft(id, {
    base: initial.head!,
    expectedDraft: null,
    record: pending,
  });
  expect((await store.read(id)).record.song.title).toBe("Project");
  expect((await store.read(id)).draft?.record.song.title).toBe("Unconfirmed");
  await expect(
    store.save(
      id,
      { base: initial.head!, expectedDraft: null, record: record() },
      "editor",
    ),
  ).rejects.toBeInstanceOf(ProjectConflict);
  const producer = record();
  producer.song.title = "Producer correction";
  const second = await store.save(
    id,
    { base: initial.head!, expectedDraft: draft.draft!.id, record: producer },
    "producer",
  );
  const view = await store.read(id);
  expect(view.draft?.id).toBe(draft.draft!.id);
  expect(view.draft?.base?.revision).toBe(initial.head!.revision);
  expect(view.record.song.title).toBe("Producer correction");
  await expect(
    store.save(
      id,
      { base: initial.head!, expectedDraft: draft.draft!.id, record: pending },
      "editor",
    ),
  ).rejects.toBeInstanceOf(ProjectConflict);
  const confirmed = await store.save(
    id,
    { base: second.head!, expectedDraft: draft.draft!.id, record: pending },
    "editor",
  );
  expect((await store.read(id)).draft).toBeUndefined();
  expect((await store.read(id)).record).toMatchObject(pending);
  expect((await store.history(id)).map((h) => h.revision)).toEqual([
    confirmed.head!.revision,
    second.head!.revision,
    initial.head!.revision,
  ]);
  const archived = JSON.parse(
    await readFile(
      join(store.directory(id), "work/drafts", `${draft.draft!.id}.json`),
      "utf8",
    ),
  );
  expect(archived.record.song.title).toBe("Unconfirmed");
});

it("returns the confirmed correction snapshot after metadata saves and rejects rewritten correction history", async () => {
  const first = record();
  first.song.lyrics = [
    {
      id: "lyric",
      text: "before",
      time: 0,
      end: 1,
      confirmed: true,
      scorePosition: { measureId: "m1", quarterOffset: 0, durationQuarters: 1 },
    },
  ];
  const initial = await store.save(
    id,
    { base: null, expectedDraft: null, record: first },
    "editor",
  );
  const next = structuredClone(first);
  next.song.lyrics[0].text = "after";
  next.canonicalXML =
    "<score-partwise><work><work-title>correction snapshot</work-title></work></score-partwise>";
  await store.save(
    id,
    { base: initial.head!, expectedDraft: null, record: next },
    "producer",
  );
  const edited = await store.read(id);
  expect(edited.record.lyricCorrections).toHaveLength(1);
  const metadata = structuredClone(edited.record);
  metadata.song.title = "Later title";
  metadata.canonicalXML =
    "<score-partwise><work><work-title>Later title</work-title></work></score-partwise>";
  await store.save(
    id,
    { base: edited.head!, expectedDraft: null, record: metadata },
    "producer",
  );
  const envelope = await store.corrections(id);
  expect(envelope?.canonicalXML).toBe(next.canonicalXML);
  expect(envelope?.canonicalSHA256).toBe(
    edited.record.lyricCorrections![0].resultXMLSHA256,
  );
  const latest = await store.read(id);
  const stripped = structuredClone(latest.record);
  stripped.lyricCorrections = [];
  await expect(
    store.save(
      id,
      { base: latest.head!, expectedDraft: null, record: stripped },
      "producer",
    ),
  ).rejects.toThrow("discard or rewrite");
  expect((await store.head(id))?.revision).toBe(latest.head!.revision);
});

it("refuses escaped asset paths and detects corrupted immutable media without advancing the head", async () => {
  const initial = await store.save(
    id,
    { base: null, expectedDraft: null, record: record() },
    "editor",
  );
  await expect(
    store.save(
      id,
      {
        base: initial.head!,
        expectedDraft: null,
        record: {
          ...record(),
          pdf: { ...initial.record.pdf, path: "../outside" },
        },
      },
      "editor",
    ),
  ).rejects.toThrow("Invalid project asset path");
  await writeFile(
    join(store.directory(id), initial.record.pdf.path),
    "corrupted",
  );
  await expect(store.read(id)).rejects.toThrow("Project asset differs");
  expect((await store.head(id))?.revision).toBe(initial.head!.revision);
});
