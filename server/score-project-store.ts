import { createHash, randomUUID } from "node:crypto";
import { access, mkdir, readFile, readdir, rmdir } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { join, resolve } from "node:path";
import { atomicJSON } from "./production-request-store.ts";
import { recordProducerChanges } from "./score-project-corrections.ts";
import {
  hydrateProjectRecord,
  readProjectAsset,
  storeProjectRecord,
} from "./score-project-assets.ts";
import {
  scoreProjectId,
  projectRevision,
  validateProjectHead,
  validateProjectWrite,
  type LocalProjectHead,
  type LocalProjectView,
  type ProjectDraft,
  type ProjectSavedState,
  type ProjectWrite,
  type ProjectWriteResult,
  type ProjectWork,
  type ProjectWorkEntry,
} from "../src/model/score-project.ts";
import {
  validateLyricCorrectionEnvelope,
  type LyricCorrectionEnvelope,
} from "../src/model/lyric-correction.ts";

export class ProjectConflict extends Error {
  status = 409;
}
async function json<T>(path: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return;
    throw e;
  }
}
/** Shared by Vite and the producer CLI. No browser DB or public-player writes. */
export function createScoreProjectStore(root: string) {
  const baseDirectory = resolve(root, "data/production/projects");
  const directory = (id: string) => {
    scoreProjectId(id);
    return join(baseDirectory, id);
  };
  const head = async (id: string) => {
    const value = await json<LocalProjectHead>(
      join(directory(id), "project.json"),
    );
    if (value) {
      validateProjectHead(value);
      if (value.songId !== id)
        throw Error(
          `Project identity mismatch: expected=${id}, actual=${value.songId}`,
        );
    }
    return value;
  };
  async function locked<T>(id: string, work: () => Promise<T>): Promise<T> {
    const dir = directory(id);
    await mkdir(dir, { recursive: true });
    const lock = join(dir, ".write-lock");
    try {
      await mkdir(lock);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "EEXIST")
        throw new ProjectConflict(`Project write in progress: id=${id}`);
      throw e;
    }
    try {
      return await work();
    } finally {
      await rmdir(lock);
    }
  }
  async function draft(id: string, current?: LocalProjectHead) {
    const pending = await json<ProjectDraft>(join(directory(id), "draft.json"));
    current ??= await head(id);
    if (pending) {
      projectRevision(pending.id);
      if (pending.base) validateProjectHead(pending.base);
      if (
        pending.version !== 1 ||
        pending.record.song.id !== id ||
        (pending.base && pending.base.songId !== id)
      )
        throw Error(`Invalid stored project draft: id=${id}`);
    }
    if (
      pending &&
      current &&
      (await saved(id, current.revision)).consumedDraft === pending.id
    )
      return;
    return pending;
  }
  async function checkDraft(id: string, expected: string | null) {
    const actual = await draft(id);
    if ((actual?.id ?? null) !== expected)
      throw new ProjectConflict(
        `Project draft changed: id=${id}, expected=${expected}, actual=${actual?.id ?? null}`,
      );
  }
  async function saved(
    id: string,
    revision: string,
  ): Promise<ProjectSavedState> {
    projectRevision(revision);
    const value = await json<ProjectSavedState>(
      join(directory(id), "saves", revision, "record.json"),
    );
    if (!value || value.head.songId !== id || value.head.revision !== revision)
      throw Error(
        `Project save missing or mismatched: id=${id}, revision=${revision}`,
      );
    validateProjectHead(value.head);
    if (value.parent !== null) projectRevision(value.parent);
    return value;
  }
  async function preserveDraft(id: string) {
    const previous = await draft(id);
    if (!previous) return;
    const dir = join(directory(id), "work", "drafts");
    await mkdir(dir, { recursive: true });
    await atomicJSON(join(dir, `${previous.id}.json`), previous);
  }
  async function history(id: string) {
    const values: LocalProjectHead[] = [];
    let revision = (await head(id))?.revision;
    const visited = new Set<string>();
    while (revision && !visited.has(revision)) {
      visited.add(revision);
      const state = await saved(id, revision);
      values.push(state.head);
      revision = state.parent ?? undefined;
    }
    return values;
  }
  async function corrections(
    id: string,
  ): Promise<LyricCorrectionEnvelope | undefined> {
    const current = await head(id);
    if (!current) return;
    let state = await saved(id, current.revision);
    const events = state.record.lyricCorrections ?? [];
    if (!events.length) return;
    const hash = events.at(-1)!.resultXMLSHA256;
    const visited = new Set<string>();
    // Metadata-only saves may follow the last lyric edit. Replay uses that edit's
    // immutable XML snapshot, never an unconfirmed draft or a different hash.
    while (!visited.has(state.head.revision)) {
      visited.add(state.head.revision);
      const candidates = [
        state.record.lyricCorrectionDelivery?.envelope.canonicalXML,
        ...(state.record.revisions ?? []).map((r) => r.canonicalXML),
      ];
      if (state.record.canonical?.sha256 === hash)
        candidates.unshift(
          (
            await readProjectAsset(directory(id), state.record.canonical)
          ).toString("utf8"),
        );
      const canonicalXML = candidates.find(
        (xml) =>
          xml !== undefined &&
          createHash("sha256").update(xml).digest("hex") === hash,
      );
      if (canonicalXML !== undefined) {
        const envelope: LyricCorrectionEnvelope = {
          format: "drum-practice-lyric-corrections",
          version: 1,
          songId: id,
          canonicalXML,
          canonicalSHA256: hash,
          corrections: events,
        };
        validateLyricCorrectionEnvelope(envelope);
        return envelope;
      }
      if (!state.parent) break;
      state = await saved(id, state.parent);
    }
    throw Error(
      `Confirmed lyric XML snapshot missing: id=${id}, sha256=${hash}`,
    );
  }
  async function save(
    id: string,
    input: ProjectWrite,
    author: LocalProjectHead["author"],
  ): Promise<ProjectWriteResult> {
    return locked(id, async () => {
      validateProjectWrite(input, id);
      const previous = await head(id);
      if ((previous?.revision ?? null) !== (input.base?.revision ?? null))
        throw new ProjectConflict(
          `Project save changed: id=${id}, expected=${input.base?.revision ?? null}, actual=${previous?.revision ?? null}; draft preserved`,
        );
      await checkDraft(id, input.expectedDraft);
      const revision = randomUUID(),
        savedAt = new Date().toISOString(),
        dir = directory(id);
      const next: LocalProjectHead = {
        version: 1,
        songId: id,
        revision,
        savedAt,
        author,
        title: input.record.song.title,
        artist: input.record.song.artist,
      };
      await mkdir(join(dir, "saves", revision), { recursive: true });
      const record = await storeProjectRecord(dir, input.record, revision);
      if (author === "producer" && previous)
        recordProducerChanges(
          (await saved(id, previous.revision)).record,
          record,
          savedAt,
        );
      const consumedDraft =
        author === "editor" && input.expectedDraft
          ? input.expectedDraft
          : previous && (await saved(id, previous.revision)).consumedDraft;
      await atomicJSON(join(dir, "saves", revision, "record.json"), {
        head: next,
        parent: previous?.revision ?? null,
        record,
        consumedDraft,
      });
      // Readback before publishing the head also checks every asset's content hash.
      await hydrateProjectRecord(dir, (await saved(id, revision)).record);
      await preserveDraft(id);
      let nextDraft: ProjectDraft | undefined;
      if (input.editDraft) {
        nextDraft = {
          version: 1,
          id: randomUUID(),
          base: next,
          savedAt,
          record,
          editDraft: input.editDraft,
        };
        await atomicJSON(join(dir, "draft.json"), nextDraft);
      } else if (author === "producer") nextDraft = await draft(id);
      // Publishing one head is the commit point. A consumed draft stays on disk
      // and in work/drafts, but is no longer offered as an unconfirmed edit.
      await atomicJSON(join(dir, "project.json"), next);
      return {
        head: next,
        record,
        draft: nextDraft && { id: nextDraft.id, base: nextDraft.base },
      };
    });
  }
  async function saveDraft(
    id: string,
    input: ProjectWrite,
  ): Promise<ProjectWriteResult> {
    return locked(id, async () => {
      validateProjectWrite(input, id);
      if (!(await head(id)))
        throw Error(`Project has no confirmed save: id=${id}`);
      await checkDraft(id, input.expectedDraft);
      const dir = directory(id),
        record = await storeProjectRecord(dir, input.record);
      const value: ProjectDraft = {
        version: 1,
        id: randomUUID(),
        base: input.base,
        savedAt: new Date().toISOString(),
        record,
        editDraft: input.editDraft,
      };
      const previous = await draft(id);
      if (
        previous &&
        (previous.base?.revision !== input.base?.revision ||
          previous.record.pdf.sha256 !== record.pdf.sha256 ||
          previous.record.audio.sha256 !== record.audio.sha256)
      )
        await preserveDraft(id);
      // A stale-base draft is retained for conflict review; only confirmed saves require current head.
      await atomicJSON(join(dir, "draft.json"), value);
      return { record, draft: { id: value.id, base: value.base } };
    });
  }
  async function work(id: string): Promise<ProjectWork> {
    return (
      (await json<ProjectWork>(join(directory(id), "work.json"))) ?? {
        version: 1,
        entries: [],
      }
    );
  }
  async function appendWork(id: string, entry: ProjectWorkEntry) {
    return locked(id, async () => {
      projectRevision(entry.id);
      if (
        !["progress", "question", "answer", "request"].includes(entry.kind) ||
        !["editor", "producer"].includes(entry.author) ||
        typeof entry.text !== "string" ||
        !Number.isFinite(Date.parse(entry.at))
      )
        throw Error(`Invalid project work entry: id=${id}`);
      if (!(await head(id)))
        throw Error(`Project has no confirmed save: id=${id}`);
      const value = await work(id);
      if (value.entries.some((e) => e.id === entry.id))
        throw new ProjectConflict(`Duplicate work entry: id=${entry.id}`);
      if (
        entry.kind === "answer" &&
        (!value.entries.some(
          (e) => e.id === entry.questionId && e.kind === "question",
        ) ||
          value.entries.some(
            (e) => e.questionId === entry.questionId && e.kind === "answer",
          ))
      )
        throw new ProjectConflict(
          `Question absent or already answered: id=${entry.questionId}`,
        );
      value.entries.push(entry);
      await atomicJSON(join(directory(id), "work.json"), value);
      return value;
    });
  }
  async function updateDelivery(
    id: string,
    entryId: string,
    delivery: Pick<ProjectWorkEntry, "delivery" | "error">,
  ) {
    return locked(id, async () => {
      const value = await work(id),
        entry = value.entries.find((e) => e.id === entryId);
      if (!entry) throw Error(`Work entry missing: id=${entryId}`);
      Object.assign(entry, delivery);
      await atomicJSON(join(directory(id), "work.json"), value);
      return value;
    });
  }
  async function read(id: string): Promise<LocalProjectView> {
    const dir = directory(id);
    const writing = async () => {
      try {
        await access(join(dir, ".write-lock"));
        return true;
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === "ENOENT") return false;
        throw e;
      }
    };
    // Assets are immutable. Retry the small mutable pointers when a writer
    // overlaps a read, so an imported draft is never paired with an old head.
    for (let attempt = 0; attempt < 50; attempt++) {
      if (await writing()) {
        await delay(100);
        continue;
      }
      const current = await head(id);
      if (!current) throw Error(`Project missing: id=${id}`);
      const pending = await draft(id, current),
        state = await saved(id, current.revision);
      const value = {
        head: current,
        directory: dir,
        record: await hydrateProjectRecord(dir, state.record),
        draft: pending && {
          id: pending.id,
          base: pending.base,
          record: await hydrateProjectRecord(dir, pending.record),
          editDraft: pending.editDraft,
        },
        work: await work(id),
      };
      if (
        !(await writing()) &&
        (await head(id))?.revision === current.revision &&
        (await draft(id, current))?.id === pending?.id
      )
        return value;
    }
    throw new ProjectConflict(
      `Project is being updated; retry reading: id=${id}`,
    );
  }
  async function list() {
    const projects: LocalProjectHead[] = [],
      errors: { id: string; error: string }[] = [];
    let names: string[];
    try {
      names = await readdir(baseDirectory);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT")
        return { projects, errors };
      throw e;
    }
    for (const id of names)
      try {
        const value = await head(id);
        if (value) projects.push(value);
      } catch (e) {
        errors.push({ id, error: String(e) });
      }
    return { projects, errors };
  }
  return {
    directory,
    head,
    read,
    saved,
    history,
    corrections,
    save,
    saveDraft,
    list,
    work,
    appendWork,
    updateDelivery,
  };
}
