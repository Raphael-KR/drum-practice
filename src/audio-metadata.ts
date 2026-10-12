/** Read embedded tags locally. Missing/broken tags must not block playable audio. */
export async function audioMetadata(file: File, fallbackToFilename = true): Promise<{title: string; artist: string}> {
  const fallback = {title: fallbackToFilename ? file.name.replace(/\.[^.]+$/, "") : "", artist: ""};
  try {
    const {parseBlob} = await import("music-metadata");
    const {common} = await parseBlob(file, {skipCovers: true, duration: false});
    return {title: common.title?.trim() || fallback.title,
      artist: common.artist?.trim() || common.artists?.map(a => a.trim()).filter(Boolean).join(", ") || ""};
  } catch { return fallback; }
}
