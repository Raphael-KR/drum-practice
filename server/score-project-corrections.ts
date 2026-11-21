import { randomUUID } from "node:crypto";
import { diffLyricCorrections } from "../src/model/lyric-correction.ts";
import type { ProjectFileRecord } from "../src/model/score-project.ts";

/** Producer saves extend the same confirmed lyric history as direct editor saves. */
export function recordProducerChanges(
  previous: ProjectFileRecord,
  next: ProjectFileRecord,
  savedAt: string,
) {
  const history = previous.lyricCorrections ?? [];
  const incoming = next.lyricCorrections ?? [];
  if (
    history.some(
      (event, i) => JSON.stringify(event) !== JSON.stringify(incoming[i]),
    )
  )
    throw Error(
      "Producer save would discard or rewrite confirmed lyric history; reread the project before saving",
    );
  const changes = diffLyricCorrections(previous.song.lyrics, next.song.lyrics);
  if (!changes.length) return;
  if (!previous.canonical || !next.canonical)
    throw Error("Lyric correction requires canonical MusicXML on both saves");
  next.lyricCorrections = [
    ...incoming,
    {
      id: randomUUID(),
      songId: next.song.id,
      savedAt,
      source: "producer",
      baseXMLSHA256: previous.canonical.sha256,
      resultXMLSHA256: next.canonical.sha256,
      changes,
    },
  ];
}
