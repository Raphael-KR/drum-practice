import type { RecordData } from "../../model/record";
import type {
  LocalProjectHead,
  LocalProjectView,
  ProjectAsset,
  ProjectFileRecord,
  ProjectInputRecord,
  ProjectWriteResult,
  ProjectWork,
} from "../../model/score-project";
import { encodeAsset } from "../../platform/storage/binary-asset";
import {
  serializeSong,
  unpackSong,
} from "../../platform/storage/record-serialization";

const api = "/api/score-projects";
const assets = new WeakMap<Blob, { songId: string; asset: ProjectAsset }>();
export async function projectRequest<T>(path = "", body?: unknown): Promise<T> {
  const response = await fetch(
    api + path,
    body === undefined
      ? { cache: "no-store" }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  const value = await response.json();
  if (!response.ok)
    throw Error(
      value.error ||
        `Project request failed: status=${response.status}, path=${path}`,
    );
  return value;
}
export const listProjects = () =>
  projectRequest<{
    projects: LocalProjectHead[];
    errors: { id: string; error: string }[];
  }>();
export const readProject = (id: string) =>
  projectRequest<LocalProjectView>(`/${encodeURIComponent(id)}`);
function remember(record: RecordData, saved: ProjectFileRecord) {
  const rememberOne = (blob: Blob, asset: ProjectAsset) =>
    assets.set(blob, { songId: record.song.id, asset });
  rememberOne(record.pdf, saved.pdf);
  rememberOne(record.audio, saved.audio);
  record.pages.forEach((page, i) => rememberOne(page, saved.pages[i]));
  record.otherScores?.forEach((score, i) => {
    const value = saved.otherScores?.[i];
    if (!value) return;
    rememberOne(score.source, value.source);
    score.pages.forEach((page, j) => rememberOne(page, value.pages[j]));
  });
}
export function projectRecord(view: LocalProjectView): RecordData {
  // Keep a stale draft on its own base. The CAS error explains the newer confirmed save.
  const draft = view.draft;
  const record = unpackSong(draft ? draft.record : view.record);
  record.localProject = draft ? (draft.base ?? undefined) : view.head;
  record.localDraft = draft && { id: draft.id, base: draft.base };
  record.editDraft = draft?.editDraft;
  record.localDraftChanges =
    !!draft &&
    ["pdf", "audio", "canonicalXML", "lyricWork"].some(
      (key) =>
        JSON.stringify(draft.record[key as keyof typeof draft.record]) !==
        JSON.stringify(view.record[key as keyof typeof view.record]),
    );
  return record;
}
export async function writeProject(
  record: RecordData,
  confirmed: boolean,
): Promise<ProjectWriteResult> {
  const encoded: ProjectInputRecord = await serializeSong(
    record,
    async (blob) => {
      const known = assets.get(blob);
      return known?.songId === record.song.id
        ? known.asset
        : encodeAsset(blob, "application/octet-stream");
    },
  );
  const result = await projectRequest<ProjectWriteResult>(
    `/${encodeURIComponent(record.song.id)}/${confirmed ? "save" : "draft"}`,
    {
      base: record.localProject ?? null,
      expectedDraft: record.localDraft?.id ?? null,
      record: encoded,
      editDraft: confirmed ? undefined : record.editDraft,
    },
  );
  remember(record, result.record);
  if (result.head) record.localProject = result.head;
  record.localDraft = result.draft;
  return result;
}
/** Restore an authoring archive through the same CAS path, keeping previous saves and drafts. */
export async function restoreProject(
  record: RecordData,
  current?: LocalProjectView,
) {
  const encoded = await serializeSong(record, (blob) =>
    encodeAsset(blob, "application/octet-stream"),
  );
  await projectRequest(`/${encodeURIComponent(record.song.id)}/save`, {
    base: current?.head ?? null,
    expectedDraft: current?.draft?.id ?? null,
    record: encoded,
    editDraft: record.editDraft,
  });
}
/** First-edit import preserves the complete old record and draft; the old browser entry is untouched. */
export async function openProject(record: RecordData): Promise<RecordData> {
  const { projects } = await listProjects();
  if (projects.some((p) => p.songId === record.song.id))
    return projectRecord(await readProject(record.song.id));
  const encoded = await serializeSong(record, (blob) =>
    encodeAsset(blob, "application/octet-stream"),
  );
  await projectRequest(`/${encodeURIComponent(record.song.id)}/save`, {
    base: null,
    expectedDraft: null,
    record: encoded,
    editDraft: record.editDraft,
  });
  const view = await readProject(record.song.id);
  // The server readback verifies media bytes; verify authoring metadata and the canonical text too.
  for (const key of [
    "song",
    "canonicalXML",
    "lyricWork",
    "lyricCorrections",
    "lyricCorrectionDelivery",
    "revisions",
    "productionReceipts",
    "preserveAudioTiming",
  ] as const)
    if (JSON.stringify(view.record[key]) !== JSON.stringify(encoded[key]))
      throw Error(
        `Project import readback differs: id=${record.song.id}, field=${key}`,
      );
  if (
    JSON.stringify(view.draft?.editDraft) !== JSON.stringify(record.editDraft)
  )
    throw Error(`Project import draft differs: id=${record.song.id}`);
  return projectRecord(view);
}
export function observeProject(
  id: string,
  receive: (value: { head: LocalProjectHead; work: ProjectWork }) => void,
) {
  const events = new EventSource(`${api}/${encodeURIComponent(id)}/events`);
  events.onmessage = (event) => receive(JSON.parse(event.data));
  return () => events.close();
}
