/** Shared production boundary; the app owns correction identity and merge semantics. */
import {
  applyLyricCorrections,
  validateLyricCorrectionEnvelope,
} from "../../../../src/modules/lyrics/lyric-corrections.ts";
import { sha256 } from "../../../../src/platform/browser/sha256.ts";

export function correctionComponent(songId) {
  if (
    typeof songId !== "string" ||
    !songId ||
    songId === "." ||
    songId === ".."
  )
    throw Error("A stable song ID is required for lyric corrections");
  return encodeURIComponent(songId);
}

/** Absence is explicit; malformed or unreadable input must never mean 'no corrections'. */
export async function applyConfirmedCorrections(song, envelope, idMap) {
  correctionComponent(song.id);
  if (envelope === undefined)
    return { status: "none", applied: [], alreadyApplied: [], conflicts: [] };
  validateLyricCorrectionEnvelope(envelope);
  if (envelope.songId !== song.id)
    throw Error(
      `Lyric correction song mismatch: expected=${song.id}, actual=${envelope.songId}`,
    );
  const actual = await sha256(
    new TextEncoder().encode(envelope.canonicalXML).buffer,
  );
  if (actual !== envelope.canonicalSHA256)
    throw Error(
      `Lyric correction SHA mismatch: expected=${envelope.canonicalSHA256}, actual=${actual}`,
    );
  const result = applyLyricCorrections(song, envelope.corrections, idMap);
  return {
    status: result.conflicts.length ? "conflict" : "applied",
    confirmedSHA256: envelope.canonicalSHA256,
    correctionIds: envelope.corrections.map((event) => event.id),
    ...result,
  };
}

export async function loadBrowserCorrections(songId, projectBase) {
  const project = await fetch(
    `${projectBase}api/score-projects/${correctionComponent(songId)}/corrections`,
    { cache: "no-store" },
  );
  if (project.ok) return (await project.json()) ?? undefined;
  if (project.status !== 404)
    throw Error(
      `Project correction read failed: song=${songId}, status=${project.status}`,
    );
  const url = `${projectBase}data/production/lyric-corrections/${correctionComponent(songId)}/latest.json`;
  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 404) return undefined;
  if (!response.ok)
    throw Error(
      `Lyric correction read failed: song=${songId}, status=${response.status}`,
    );
  return response.json();
}

export class LyricCorrectionConflict extends Error {
  constructor(report) {
    super(
      `Confirmed lyric corrections need review: ${report.conflicts.length} conflict(s); ${report.conflicts
        .slice(0, 5)
        .map((item) => `${item.lyricId}: ${item.reason}`)
        .join(", ")}`,
    );
    this.name = "LyricCorrectionConflict";
    this.report = report;
  }
}
