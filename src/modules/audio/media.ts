import { sha256 } from "../../platform/browser/sha256";
export interface MediaIdentity {
  pdf: string;
  audio: string;
}
async function digest(blob: Blob) {
  return sha256(await blob.arrayBuffer());
}
export async function mediaIdentity(
  pdf: Blob,
  audio: Blob,
): Promise<MediaIdentity> {
  const [p, a] = await Promise.all([digest(pdf), digest(audio)]);
  return { pdf: p, audio: a };
}
