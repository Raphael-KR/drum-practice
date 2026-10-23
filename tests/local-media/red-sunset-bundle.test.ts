import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import JSZip from "jszip";
import { JSDOM } from "jsdom";

it("ships the approved 112/2 to 113/2.5 crescendo in both source and canonical XML", async () => {
  const zip = await JSZip.loadAsync(
    readFileSync("public/scores/red-sunset.drumscore"),
  );
  const manifest = JSON.parse(await zip.file("manifest.json")!.async("string"));
  const source = await zip.file(manifest.source.path)!.async("nodebuffer");
  expect(createHash("sha256").update(source).digest("hex")).toBe(
    "27cd2812c64eaa455399a7e8400e5feb4d26ffe06cdd6b5e233eb64bbebd1a68",
  );
  expect(manifest.canonicalXML).toBe(source.toString("utf8"));
  expect(manifest.song.id).toBe("yb-red-sunset-20f9b136");
  expect(manifest.song.bpm).toBe(134);
  expect(manifest.song.firstBeat).toBe(11.27);
  expect(manifest.song.measures).toHaveLength(137);
  expect(manifest.pages).toHaveLength(4);
  const document = new JSDOM(source.toString("utf8"), {
    contentType: "application/xml",
  }).window.document;
  const part = document.querySelector('part[id="P1"]')!;
  const divisions = Number(
    part.querySelector("attributes > divisions")!.textContent,
  );
  const first = part.querySelector('measure[number="112"]')!;
  const last = part.querySelector('measure[number="113"]')!;
  const start = first.querySelector(
    'direction-type > wedge[type="crescendo"]',
  )!;
  const stop = last.querySelector('direction-type > wedge[type="stop"]')!;
  expect(
    Number(start.closest("direction")!.querySelector("offset")!.textContent) /
      divisions,
  ).toBe(1);
  expect(
    Number(stop.closest("direction")!.querySelector("offset")!.textContent) /
      divisions,
  ).toBe(1.5);
  expect(first.querySelector('wedge[type="diminuendo"]')).toBeNull();
  expect(first.querySelector('wedge[type="stop"]')).toBeNull();
});
