/** Shared binary codec. Format-specific validation and MIME defaults stay at boundaries. */
export interface BinaryAsset {
  type: string;
  base64: string;
}
export async function encodeAsset(
  blob: Blob,
  fallbackType = "",
): Promise<BinaryAsset> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 32768)
    binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return { type: blob.type || fallbackType, base64: btoa(binary) };
}
export function decodeAsset(asset: BinaryAsset): Blob {
  return new Blob(
    [Uint8Array.from(atob(asset.base64), (c) => c.charCodeAt(0))],
    { type: asset.type },
  );
}
