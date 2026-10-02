import { t as i18nText } from "./i18n";
export interface MediaIdentity {
  pdf: string;
  audio: string;
}
async function digest(blob: Blob) {
  const bytes = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export async function mediaIdentity(
  pdf: Blob,
  audio: Blob,
): Promise<MediaIdentity> {
  const [p, a] = await Promise.all([digest(pdf), digest(audio)]);
  return { pdf: p, audio: a };
}
export async function verifyMedia(
  expected: MediaIdentity | undefined,
  pdf: Blob,
  audio: Blob,
) {
  if (!expected) return;
  if (
    ![expected.pdf, expected.audio].every(
      (v) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v),
    )
  )
    throw Error(i18nText("media.message379"));
  const actual = await mediaIdentity(pdf, audio);
  if (actual.pdf !== expected.pdf || actual.audio !== expected.audio)
    throw Error(i18nText("media.message380"));
}
