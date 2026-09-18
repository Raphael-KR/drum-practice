import { it, expect } from "vitest";
import { mediaIdentity, verifyMedia } from "../src/media";
it("rejects a different file even when its byte length matches", async () => {
  const pdf = new Blob(["pdf-a"]),
    audio = new Blob(["audio-a"]);
  const hashes = await mediaIdentity(pdf, audio);
  await expect(verifyMedia(hashes, pdf, audio)).resolves.toBeUndefined();
  await expect(verifyMedia(hashes, new Blob(["pdf-b"]), audio)).rejects.toThrow(
    "원본",
  );
});
