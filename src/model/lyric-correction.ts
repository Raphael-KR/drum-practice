import type { Lyric } from "./model";

/** Musical positions, not audio seconds or SVG coordinates. */
export interface CorrectedLyric {
  id: string;
  text: string;
  confirmed: boolean;
  scorePosition: NonNullable<Lyric["scorePosition"]>;
}
export interface LyricChange {
  before?: CorrectedLyric;
  after?: CorrectedLyric;
}
export interface LyricCorrection {
  id: string;
  songId: string;
  savedAt: string;
  source: "editor" | "producer";
  baseXMLSHA256: string;
  resultXMLSHA256: string;
  changes: LyricChange[];
}
export interface LyricCorrectionEnvelope {
  format: "drum-practice-lyric-corrections";
  version: 1;
  songId: string;
  canonicalXML: string;
  canonicalSHA256: string;
  corrections: LyricCorrection[];
}
export interface LyricCorrectionReceipt {
  correctionId: string;
  canonicalSHA256: string;
  receivedAt: string;
}
export interface LyricCorrectionDelivery {
  /** Frozen confirmed save, safe to resend while another draft is open. */
  envelope: LyricCorrectionEnvelope;
  receipt?: LyricCorrectionReceipt;
}

const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const id = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const hash = (v: unknown) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
const date = (v: unknown) =>
  typeof v === "string" && Number.isFinite(Date.parse(v));
function lyric(v: unknown): v is CorrectedLyric {
  if (!object(v) || !object(v.scorePosition)) return false;
  const p = v.scorePosition;
  return (
    id(v.id) &&
    typeof v.text === "string" &&
    typeof v.confirmed === "boolean" &&
    id(p.measureId) &&
    typeof p.quarterOffset === "number" &&
    Number.isFinite(p.quarterOffset) &&
    p.quarterOffset >= 0 &&
    typeof p.durationQuarters === "number" &&
    Number.isFinite(p.durationQuarters) &&
    p.durationQuarters > 0
  );
}
export function validateLyricCorrections(
  value: unknown,
  songId: string,
): asserts value is LyricCorrection[] {
  if (!Array.isArray(value)) throw Error("Invalid lyric correction history");
  const ids = new Set<string>();
  for (const e of value) {
    if (
      !object(e) ||
      !id(e.id) ||
      ids.has(e.id) ||
      e.songId !== songId ||
      (e.source !== "editor" && e.source !== "producer") ||
      !date(e.savedAt) ||
      !hash(e.baseXMLSHA256) ||
      !hash(e.resultXMLSHA256) ||
      !Array.isArray(e.changes) ||
      !e.changes.length
    )
      throw Error("Invalid lyric correction event");
    ids.add(e.id);
    const lyrics = new Set<string>();
    for (const c of e.changes) {
      if (
        !object(c) ||
        (!c.before && !c.after) ||
        (c.before !== undefined && !lyric(c.before)) ||
        (c.after !== undefined && !lyric(c.after))
      )
        throw Error(`Invalid lyric correction change: ${e.id}`);
      const before = c.before as CorrectedLyric | undefined;
      const after = c.after as CorrectedLyric | undefined;
      const key = (before || after)!.id;
      if ((before && after && before.id !== after.id) || lyrics.has(key))
        throw Error(`Ambiguous lyric correction ID: ${e.id}`);
      lyrics.add(key);
    }
  }
}
export function validateLyricCorrectionEnvelope(
  value: unknown,
): asserts value is LyricCorrectionEnvelope {
  if (
    !object(value) ||
    value.format !== "drum-practice-lyric-corrections" ||
    value.version !== 1 ||
    !id(value.songId) ||
    typeof value.canonicalXML !== "string" ||
    !value.canonicalXML.length ||
    !hash(value.canonicalSHA256)
  )
    throw Error("Invalid lyric correction envelope");
  validateLyricCorrections(value.corrections, value.songId);
  if (
    !value.corrections.length ||
    value.corrections.at(-1)!.resultXMLSHA256 !== value.canonicalSHA256
  )
    throw Error("Lyric correction snapshot does not match its latest save");
}
export function validateLyricCorrectionDelivery(
  value: unknown,
  songId: string,
): asserts value is LyricCorrectionDelivery {
  if (!object(value)) throw Error("Invalid lyric correction delivery");
  validateLyricCorrectionEnvelope(value.envelope);
  if (value.envelope.songId !== songId)
    throw Error("Lyric correction belongs to another song");
  const receipt = value.receipt;
  if (
    receipt !== undefined &&
    (!object(receipt) ||
      receipt.correctionId !== value.envelope.corrections.at(-1)!.id ||
      receipt.canonicalSHA256 !== value.envelope.canonicalSHA256 ||
      !date(receipt.receivedAt))
  )
    throw Error("Invalid lyric correction receipt");
}

export function correctedLyricState(lyric: Lyric): CorrectedLyric {
  if (!lyric.scorePosition) throw Error(`Missing lyric position: ${lyric.id}`);
  return {
    id: lyric.id,
    text: lyric.text,
    confirmed: lyric.confirmed,
    scorePosition: { ...lyric.scorePosition },
  };
}
export function sameCorrectedLyric(a?: CorrectedLyric, b?: CorrectedLyric) {
  if (!a || !b) return a === b;
  return (
    a.id === b.id &&
    a.text === b.text &&
    a.confirmed === b.confirmed &&
    a.scorePosition.measureId === b.scorePosition.measureId &&
    a.scorePosition.quarterOffset === b.scorePosition.quarterOffset &&
    a.scorePosition.durationQuarters === b.scorePosition.durationQuarters
  );
}
/** Stable IDs only; never infer identity from matching text or nearby positions. */
export function diffLyricCorrections(
  before: Lyric[],
  after: Lyric[],
): LyricChange[] {
  const index = (items: Lyric[]) => {
    const result = new Map(items.map((l) => [l.id, correctedLyricState(l)]));
    if (result.size !== items.length) throw Error("Duplicate lyric IDs");
    return result;
  };
  const old = index(before),
    next = index(after);
  const changes: LyricChange[] = [];
  for (const key of new Set([...old.keys(), ...next.keys()])) {
    const a = old.get(key),
      b = next.get(key);
    if (!sameCorrectedLyric(a, b))
      changes.push({ ...(a ? { before: a } : {}), ...(b ? { after: b } : {}) });
  }
  return changes;
}
