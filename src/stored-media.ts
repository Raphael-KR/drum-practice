/** IndexedDB media format shared by the editor and practice library. */
export interface StoredMedia {
  bytes: ArrayBuffer;
  type: string;
}

export interface ScoreMedia<T> {
  pdf: T;
  audio: T;
  pages: T[];
}

export async function storeMedia(blob: Blob): Promise<StoredMedia> {
  return { bytes: await blob.arrayBuffer(), type: blob.type };
}

export function restoreMedia(media: StoredMedia): Blob {
  return new Blob([media.bytes], { type: media.type });
}

/** Materialize media before opening a write transaction. */
export async function storeScoreMedia(
  record: ScoreMedia<Blob>,
): Promise<ScoreMedia<StoredMedia>> {
  const [pdf, audio, pages] = await Promise.all([
    storeMedia(record.pdf),
    storeMedia(record.audio),
    Promise.all(record.pages.map(storeMedia)),
  ]);
  return { pdf, audio, pages };
}

export function restoreScoreMedia(
  record: ScoreMedia<StoredMedia>,
): ScoreMedia<Blob> {
  return {
    pdf: restoreMedia(record.pdf),
    audio: restoreMedia(record.audio),
    pages: record.pages.map(restoreMedia),
  };
}
