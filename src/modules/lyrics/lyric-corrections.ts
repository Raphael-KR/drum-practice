import type { Lyric, Song } from "../../model/model";
import type { RecordData } from "../../model/record";
import { t } from "../../shared/i18n/i18n";
import {
  validateLyricCorrections,
  correctedLyricState as state,
  sameCorrectedLyric as equal,
  type CorrectedLyric,
  type LyricCorrection,
  type LyricCorrectionEnvelope,
} from "../../model/lyric-correction";
import { projectLyrics } from "./lyric-score";
export {
  validateLyricCorrectionEnvelope,
  diffLyricCorrections,
} from "../../model/lyric-correction";

export interface LyricCorrectionResult {
  applied: string[];
  alreadyApplied: string[];
  conflicts: { lyricId: string; correctionId: string; reason: string }[];
}
/** Mutates only accepted lyrics; the caller writes the resulting canonical XML. */
export function applyLyricCorrections(
  song: Pick<Song, "id" | "measures" | "lyrics">,
  events: LyricCorrection[],
  idMap: Readonly<Record<string, string>> = {},
): LyricCorrectionResult {
  validateLyricCorrections(events, song.id);
  const chains = new Map<
    string,
    {
      states: (CorrectedLyric | undefined)[];
      after?: CorrectedLyric;
      correctionId: string;
      broken: boolean;
    }
  >();
  const targetId = (id: string) => (Object.hasOwn(idMap, id) ? idMap[id] : id);
  const mapped = (s?: CorrectedLyric) => s && { ...s, id: targetId(s.id) };
  const targets = new Map<string, string>();
  for (const e of events)
    for (const change of e.changes) {
      const key = (change.before || change.after)!.id;
      const before = mapped(change.before),
        after = mapped(change.after);
      const target = (before || after)!.id;
      const chain = chains.get(key);
      const other = targets.get(target);
      targets.set(target, key);
      if (other && other !== key) chains.get(other)!.broken = true;
      chains.set(key, {
        states: [...(chain?.states ?? [before]), after],
        after,
        correctionId: e.id,
        broken:
          !!(other && other !== key) ||
          !!chain?.broken ||
          (!!chain && !equal(chain.after, before)),
      });
    }
  const result: LyricCorrectionResult = {
    applied: [],
    alreadyApplied: [],
    conflicts: [],
  };
  const current = new Map<string, Lyric>();
  const duplicates = new Set<string>();
  for (const lyric of song.lyrics) {
    if (current.has(lyric.id)) duplicates.add(lyric.id);
    current.set(lyric.id, lyric);
  }
  const existingIds = new Set(current.keys());
  const appliedTargets = new Set<string>();
  for (const [key, chain] of chains) {
    const target = targetId(key);
    const existing = current.get(target);
    const actual = existing?.scorePosition ? state(existing) : undefined;
    const conflict = (reason: string) =>
      result.conflicts.push({
        lyricId: key,
        correctionId: chain.correctionId,
        reason,
      });
    if (!target || chain.broken || duplicates.has(target)) {
      conflict("ambiguous-history-or-id");
      continue;
    }
    if (existing && !existing.scorePosition) {
      conflict("missing-score-position");
      continue;
    }
    if (equal(actual, chain.after)) {
      result.alreadyApplied.push(key);
      continue;
    }
    if (!chain.states.some((known) => equal(actual, known))) {
      conflict("source-state-changed");
      continue;
    }
    const p = chain.after?.scorePosition;
    const measure = p && song.measures.find((m) => m.id === p.measureId);
    if (
      p &&
      (!measure || p.quarterOffset >= (measure.beats * 4) / measure.denominator)
    ) {
      conflict("missing-measure-or-invalid-position");
      continue;
    }
    if (chain.after)
      current.set(target, {
        ...(existing || { time: 0, end: 0 }),
        ...structuredClone(chain.after),
      });
    else current.delete(target);
    appliedTargets.add(target);
    result.applied.push(key);
  }
  if (!result.applied.length) return result;
  // Preserve unresolved items, including duplicate IDs, in the diagnostic candidate.
  song.lyrics = song.lyrics.flatMap((lyric) =>
    !appliedTargets.has(lyric.id)
      ? [lyric]
      : current.has(lyric.id)
        ? [current.get(lyric.id)!]
        : [],
  );
  for (const id of appliedTargets)
    if (!existingIds.has(id) && current.has(id))
      song.lyrics.push(current.get(id)!);
  projectLyrics(song);
  return result;
}

/** An older retry is accepted without replacing a newer confirmed snapshot. */
export function reconcileLyricCorrectionEnvelopes(
  stored: LyricCorrectionEnvelope | undefined,
  incoming: LyricCorrectionEnvelope,
): LyricCorrectionEnvelope {
  if (!stored) return incoming;
  if (stored.songId !== incoming.songId)
    throw Error("Lyric correction song mismatch");
  return newestHistory(stored.corrections, incoming.corrections) ===
    incoming.corrections
    ? incoming
    : stored;
}

function newestHistory(stored: LyricCorrection[], incoming: LyricCorrection[]) {
  const count = Math.min(stored.length, incoming.length);
  for (let i = 0; i < count; i++) {
    const a = stored[i],
      b = incoming[i];
    if (
      a.id !== b.id ||
      a.savedAt !== b.savedAt ||
      a.source !== b.source ||
      a.baseXMLSHA256 !== b.baseXMLSHA256 ||
      a.resultXMLSHA256 !== b.resultXMLSHA256 ||
      a.changes.length !== b.changes.length ||
      a.changes.some(
        (c, j) =>
          !equal(c.before, b.changes[j].before) ||
          !equal(c.after, b.changes[j].after),
      )
    )
      throw Error(`Divergent lyric correction history: ${a.id} / ${b.id}`);
  }
  return incoming.length > stored.length ? incoming : stored;
}

type CorrectionRecord = Pick<
  RecordData,
  "song" | "lyricCorrections" | "lyricCorrectionDelivery"
>;
/** Package replacement must not erase the separate authoring journal/outbox. */
export function preserveLyricCorrections(
  incoming: CorrectionRecord,
  stored: CorrectionRecord | undefined,
) {
  if (!stored) return;
  if (stored.song.id !== incoming.song.id)
    throw Error("Lyric correction song mismatch");
  const previous = stored.lyricCorrections ?? [];
  const next = incoming.lyricCorrections ?? [];
  const history = newestHistory(previous, next);
  if (!history.length) return;
  const comparison = applyLyricCorrections(
    {
      id: incoming.song.id,
      measures: incoming.song.measures,
      lyrics: structuredClone(incoming.song.lyrics),
    },
    history,
  );
  if (comparison.applied.length || comparison.conflicts.length)
    throw Error(t("lyric-corrections.importConflict"));
  const deliveries = [
    stored.lyricCorrectionDelivery,
    incoming.lyricCorrectionDelivery,
  ].filter((d) => {
    if (!d || d.envelope.corrections.length !== history.length) return false;
    newestHistory(history, d.envelope.corrections);
    return true;
  });
  incoming.lyricCorrections = structuredClone(history);
  incoming.lyricCorrectionDelivery = structuredClone(
    deliveries.find((d) => d?.receipt) ?? deliveries[0],
  );
}
