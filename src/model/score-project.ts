import type { PackedRecord, SerializedRecord } from "./serialized-record";
import type { EditDraft } from "./edit-history";

/** The editor and producer share these project files; the player keeps its own storage. */
export interface LocalProjectHead {
  version: 1;
  songId: string;
  revision: string;
  savedAt: string;
  author: "editor" | "producer";
  title: string;
  artist?: string;
}
export interface LocalProjectView {
  head?: LocalProjectHead;
  directory: string;
  record: PackedRecord;
  draft?: {
    id: string;
    base: LocalProjectHead | null;
    editDraft?: EditDraft;
    record: PackedRecord;
  };
  work: ProjectWork;
}
export interface ProjectAsset {
  path: string;
  type: string;
  size: number;
  sha256: string;
}
export interface ProjectFileRecord extends Omit<
  SerializedRecord<ProjectAsset>,
  "canonicalXML"
> {
  canonical?: ProjectAsset;
}
export interface ProjectSavedState {
  consumedDraft?: string;
  head: LocalProjectHead;
  parent: string | null;
  record: ProjectFileRecord;
}
export interface ProjectDraft {
  version: 1;
  id: string;
  base: LocalProjectHead | null;
  savedAt: string;
  record: ProjectFileRecord;
  editDraft?: EditDraft;
}
export type ProjectInputRecord = SerializedRecord<
  PackedRecord["pdf"] | ProjectAsset
>;
export interface ProjectWrite {
  base: LocalProjectHead | null;
  expectedDraft: string | null;
  record: ProjectInputRecord;
  editDraft?: EditDraft;
}
export interface ProjectWriteResult {
  head?: LocalProjectHead;
  draft?: { id: string; base: LocalProjectHead | null };
  record: ProjectFileRecord;
}
export interface ProjectWorkEntry {
  id: string;
  at: string;
  author: "editor" | "producer";
  kind: "progress" | "question" | "answer" | "request";
  text: string;
  questionId?: string;
  revision?: string;
  delivery?: "accepted" | "unknown" | "not_sent";
  error?: string;
}
export interface ProjectWork {
  version: 1;
  entries: ProjectWorkEntry[];
}
export function scoreProjectId(value: unknown): asserts value is string {
  if (
    typeof value !== "string" ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/.test(value)
  )
    throw Error(`Invalid score project ID: actual=${JSON.stringify(value)}`);
}
export function projectRevision(value: unknown): asserts value is string {
  if (
    typeof value !== "string" ||
    !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(value)
  )
    throw Error(
      `Invalid score project revision: actual=${JSON.stringify(value)}`,
    );
}
export function validateProjectHead(
  value: unknown,
): asserts value is LocalProjectHead {
  const v = value as LocalProjectHead;
  if (
    !v ||
    v.version !== 1 ||
    !["editor", "producer"].includes(v.author) ||
    typeof v.title !== "string" ||
    typeof v.savedAt !== "string" ||
    !Number.isFinite(Date.parse(v.savedAt))
  )
    throw Error(
      "Invalid score project head: expected version=1, author, title and savedAt",
    );
  scoreProjectId(v.songId);
  projectRevision(v.revision);
}
/** Full Song and canonical validation stays in the existing pack/unpack and score-reader paths. */
export function validateProjectRecord(
  value: unknown,
  songId: string,
): asserts value is ProjectInputRecord {
  const r = value as ProjectInputRecord;
  if (
    !r ||
    r.version !== 2 ||
    r.song?.id !== songId ||
    !Array.isArray(r.pages) ||
    r.pages.length !== r.song.pageCount ||
    (r.otherScores !== undefined && !Array.isArray(r.otherScores)) ||
    (r.revisions !== undefined && !Array.isArray(r.revisions)) ||
    (r.canonicalXML !== undefined && typeof r.canonicalXML !== "string") ||
    "editDraft" in r
  )
    throw Error(
      `Invalid project record: expected songId=${songId}, packed version=2 and confirmed record; actual songId=${r?.song?.id}, version=${r?.version}, pages=${r?.pages?.length}, pageCount=${r?.song?.pageCount}`,
    );
}
export function validateProjectWrite(value: ProjectWrite, songId: string) {
  validateProjectRecord(value?.record, songId);
  if (value.base !== null) {
    validateProjectHead(value.base);
    if (value.base.songId !== songId)
      throw Error(`Project base belongs to another song: id=${songId}`);
  }
  if (value.expectedDraft !== null) projectRevision(value.expectedDraft);
  if (
    value.editDraft &&
    (value.editDraft.song?.id !== songId ||
      typeof value.editDraft.savedAt !== "string")
  )
    throw Error(`Invalid project draft: id=${songId}`);
}
