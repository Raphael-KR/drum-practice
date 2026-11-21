import { readFileSync } from "node:fs";
import JSZip from "jszip";
import type { RecordData, ScoreVariant } from "../../src/model/record";

interface Asset {
  path: string;
  type: string;
}
type StoredScore = Omit<ScoreVariant, "source" | "pages"> & {
  source: Asset;
  pages: Asset[];
};

/** Read preserved production output for parser/DOM fixtures only.
 * This does not exercise or restore the retired v1 app package reader.
 */
export async function preservedScoreLayout(path: string): Promise<RecordData> {
  const zip = await JSZip.loadAsync(readFileSync(path));
  const m = JSON.parse(await zip.file("manifest.json")!.async("string"));
  const asset = async (a: Asset) =>
    new Blob([new Uint8Array(await zip.file(a.path)!.async("uint8array"))], {
      type: a.type,
    });
  return {
    song: m.song,
    canonicalXML: m.canonicalXML,
    pdf: await asset(m.source),
    audio: await asset(m.audio),
    pages: await Promise.all(m.pages.map(asset)),
    otherScores: await Promise.all(
      (m.otherScores ?? []).map(async (s: StoredScore) => ({
        ...s,
        source: await asset(s.source),
        pages: await Promise.all(s.pages.map(asset)),
      })),
    ),
  };
}
