// @vitest-environment jsdom
import { it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { Blob as NodeBlob } from "node:buffer";
import { webcrypto } from "node:crypto";
import JSZip from "jszip";
import {
  readRecordingTempo,
  recordingTempoUpgrade,
} from "../../src/content/recording-tempo";
import type { RecordData } from "../../src/model/record";

afterEach(() => vi.unstubAllGlobals());
it("migrates only the verified Loveholic recording and preserves song/timing/settings", async () => {
  vi.stubGlobal("crypto", webcrypto);
  const zip = await JSZip.loadAsync(
    readFileSync("public/scores/loveholic.drumscore"),
  );
  const manifest = JSON.parse(await zip.file("manifest.json")!.async("string"));
  const current = manifest.canonicalXML as string;
  const original = current.replace(
    /<miscellaneous-field name="drum-practice:recording-tempo:v1">[\s\S]*?<\/miscellaneous-field>/,
    "",
  );
  const audio = new NodeBlob([
    await zip.file(manifest.audio.path)!.async("uint8array"),
  ]);
  const record = {
    song: manifest.song,
    canonicalXML: original,
    audio,
  } as unknown as RecordData;
  const snapshot = structuredClone(record.song);
  const result = await recordingTempoUpgrade(record);
  expect(readRecordingTempo(result)?.bpmEstimate).toBe(136.232);
  expect(
    result!.replace(
      /<miscellaneous-field name="drum-practice:recording-tempo:v1">[\s\S]*?<\/miscellaneous-field>/,
      "",
    ),
  ).toBe(original);
  expect(record.song).toEqual(snapshot);
  expect(
    await recordingTempoUpgrade({ ...record, canonicalXML: result }),
  ).toBeUndefined();
  expect(
    await recordingTempoUpgrade({
      ...record,
      audio: new NodeBlob(["different audio"]) as unknown as Blob,
    }),
  ).toBeUndefined();
  expect(
    await recordingTempoUpgrade({
      ...record,
      song: { ...record.song, id: "other" },
    }),
  ).toBeUndefined();
});
it("ignores invalid estimates and malformed XML", () => {
  expect(readRecordingTempo("<invalid>")).toBeUndefined();
  expect(
    readRecordingTempo(
      '<score-partwise><identification><miscellaneous><miscellaneous-field name="drum-practice:recording-tempo:v1">{"version":2}</miscellaneous-field></miscellaneous></identification></score-partwise>',
    ),
  ).toBeUndefined();
});
