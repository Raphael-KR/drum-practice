import { it, expect } from "vitest";
import { mediaIdentity } from "../../src/modules/audio/media";
it("distinguishes a different file even when its byte length matches", async () => {
  const pdf = new Blob(["pdf-a"]),
    audio = new Blob(["audio-a"]);
  const hashes = await mediaIdentity(pdf, audio);
  await expect(mediaIdentity(pdf, audio)).resolves.toEqual(hashes);
  const changed = await mediaIdentity(new Blob(["pdf-b"]), audio);
  expect(changed.pdf).not.toBe(hashes.pdf);
  expect(changed.audio).toBe(hashes.audio);
});
