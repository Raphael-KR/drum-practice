interface TrackMetadata {
  title: string;
  artist: string;
  bpm?: number;
}
const clean = (text: string) =>
  text
    .normalize("NFC")
    .trim()
    .replace(
      /\s*\[(?:가사\s*\/?\s*Lyrics?|Lyrics?\s*\/?\s*가사|가사|Lyrics?|Official\s+(?:Audio|Video|MV))\]\s*/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
/** Accept explicit artist/title separators; don't invent an artist from an unstructured filename. */
export function splitTrackName(text: string): TrackMetadata | undefined {
  const name = clean(
    text.replace(/\.(mp3|m4a|wav|aac|ogg|flac|aif|aiff|webm)$/i, ""),
  );
  const separator =
    /\s+[-–—]\s+|[–—]/.exec(name) ??
    (name.split("-").length === 2 ? /-/.exec(name) : null);
  if (!separator || !separator.index) return;
  const artist = name
    .slice(0, separator.index)
    .trim()
    .replace(/\s*\d+집$/, "")
    .trim();
  const title = name.slice(separator.index + separator[0].length).trim();
  if (!artist || !title || artist.length > 150 || title.length > 300) return;
  return { title, artist };
}
const validBpm = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 20 &&
  value <= 300;
/** Only explicitly labelled filename tempos count; track numbers and years do not. */
function filenameMetadata(filename: string) {
  const stem = filename.replace(/\.[^.]+$/, "");
  const tempo =
    /(?:^|[\s_([{\-])(?:BPM\s*[:=]?\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*BPM)(?:\s*[)\]}])?(?=$|[\s_)\]}\-])/i.exec(
      stem,
    );
  const value = tempo ? Number(tempo[1] ?? tempo[2]) : undefined;
  const bpm = validBpm(value) ? value : undefined;
  const name =
    bpm === undefined
      ? stem
      : (
          stem.slice(0, tempo!.index) +
          " " +
          stem.slice(tempo!.index + tempo![0].length)
        )
          .replace(/^[\s_()[\]{}-]+|[\s_()[\]{}-]+$/g, "")
          .trim();
  return { name, bpm };
}
export function resolveAudioMetadata(
  filename: string,
  tags: Partial<TrackMetadata>,
  includeUnstructuredFilename = true,
): TrackMetadata {
  const file = filenameMetadata(filename),
    pair = splitTrackName(file.name);
  const title =
    clean(tags.title || "") ||
    pair?.title ||
    (includeUnstructuredFilename ? clean(file.name) : "");
  const artist = clean(tags.artist || "") || pair?.artist || "";
  const bpm = validBpm(tags.bpm) ? tags.bpm : file.bpm;
  return {
    title: title.slice(0, 300),
    artist: artist.slice(0, 300),
    ...(bpm === undefined ? {} : { bpm }),
  };
}
/** Read embedded tags and filename locally, without a remote lookup. */
export async function audioMetadata(
  file: File,
  includeUnstructuredFilename = true,
): Promise<TrackMetadata> {
  try {
    const { parseBlob } = await import("music-metadata");
    const { common } = await parseBlob(file, {
      skipCovers: true,
      duration: false,
    });
    return resolveAudioMetadata(
      file.name,
      {
        title: common.title,
        artist: common.artist || common.artists?.join(", "),
        bpm: common.bpm,
      },
      includeUnstructuredFilename,
    );
  } catch {
    return resolveAudioMetadata(file.name, {}, includeUnstructuredFilename);
  }
}
