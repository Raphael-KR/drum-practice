import type { EditSnapshot } from "../../model/edit-history";
import type { RecordData } from "../../model/record";
import { diffLyricCorrections } from "../../modules/lyrics/lyric-corrections";
import {
  ensureCanonical,
  saveCanonical,
} from "../../modules/score/canonical-xml";
import { sha256 } from "../../platform/browser/sha256";

/** Called only by confirmed save, before its single record write. */
export async function prepareLyricCorrectionSave(
  record: RecordData,
  base: EditSnapshot,
) {
  const previous: RecordData = { ...record, ...structuredClone(base) };
  await ensureCanonical(previous, true);
  await ensureCanonical(record, true);
  await saveCanonical(record, true);
  await recordConfirmedLyricChanges(record, previous);
}

/** Record only confirmed edits; producer saves use the shared model diff. */
async function recordConfirmedLyricChanges(
  record: RecordData,
  previous: RecordData,
) {
  const changes = diffLyricCorrections(
    previous.song.lyrics,
    record.song.lyrics,
  );
  if (!changes.length) return;
  const encode = new TextEncoder();
  const [baseXMLSHA256, resultXMLSHA256] = await Promise.all([
    sha256(encode.encode(previous.canonicalXML!)),
    sha256(encode.encode(record.canonicalXML!)),
  ]);
  const correction = {
    id: crypto.randomUUID(),
    songId: record.song.id,
    savedAt: new Date().toISOString(),
    source: "editor" as const,
    baseXMLSHA256,
    resultXMLSHA256,
    changes,
  };
  record.lyricCorrections = [...(record.lyricCorrections || []), correction];
  if (record.localProject) return;
  record.lyricCorrectionDelivery = {
    envelope: {
      format: "drum-practice-lyric-corrections",
      version: 1,
      songId: record.song.id,
      canonicalXML: record.canonicalXML!,
      canonicalSHA256: resultXMLSHA256,
      corrections: structuredClone(record.lyricCorrections),
    },
  };
}
