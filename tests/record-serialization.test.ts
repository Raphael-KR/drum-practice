import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { packSong, unpackSong } from "../src/record-serialization";
it("packs independent binary files, lyrics and practice state without changing their bytes", async () => {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  song.title = "한 곡 </script><script>alert(1)</script>";
  song.markers.push({ id: "backup-marker", name: "연습", time: 12 });
  song.settings.rate = 0.81;
  const pdf = new Blob([new Uint8Array([0, 255, 17])], {
    type: "application/pdf",
  });
  const audio = new Blob([new Uint8Array([8, 0, 255])], { type: "audio/mpeg" });
  const data = await packSong({ song, pdf, audio, pages: [pdf, pdf, pdf] });
  const restored = unpackSong(JSON.parse(JSON.stringify(data)));
  expect(restored.song).toEqual(song);
  expect(new Uint8Array(await restored.pdf.arrayBuffer())).toEqual(
    new Uint8Array([0, 255, 17]),
  );
  expect(restored.audio.type).toBe("audio/mpeg");

});
it("rejects missing pages rather than producing a silently incomplete song", async () => {
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  const a = { type: "application/pdf", base64: "AA==" };
  expect(() =>
    unpackSong({ version: 1, song, pdf: a, audio: a, pages: [] }),
  ).toThrow("페이지");
});
