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
    throw Error("백업의 원본 파일 확인 정보가 올바르지 않습니다.");
  const actual = await mediaIdentity(pdf, audio);
  if (actual.pdf !== expected.pdf || actual.audio !== expected.audio)
    throw Error(
      "백업에 사용한 원본 PDF·음원과 다릅니다. 같은 파일을 선택하세요.",
    );
}
