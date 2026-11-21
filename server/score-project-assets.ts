import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  BinaryAsset,
  PackedRecord,
} from "../src/model/serialized-record.ts";
import type {
  ProjectAsset,
  ProjectFileRecord,
  ProjectInputRecord,
} from "../src/model/score-project.ts";

const digest = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");
export async function readProjectAsset(directory: string, asset: ProjectAsset) {
  if (
    !/^(assets\/[a-f0-9]{64}|saves\/[a-f0-9-]{36}\/canonical\.musicxml)$/.test(
      asset.path,
    )
  )
    throw Error(`Invalid project asset path: actual=${asset.path}`);
  const bytes = await readFile(join(directory, asset.path));
  const actual = digest(bytes);
  if (bytes.length !== asset.size || actual !== asset.sha256)
    throw Error(
      `Project asset differs: path=${asset.path}, expected=${asset.sha256}/${asset.size}, actual=${actual}/${bytes.length}`,
    );
  return bytes;
}
export async function storeProjectAsset(
  directory: string,
  input: BinaryAsset | ProjectAsset,
): Promise<ProjectAsset> {
  if ("path" in input) {
    await readProjectAsset(directory, input);
    return input;
  }
  if (typeof input?.base64 !== "string" || typeof input.type !== "string")
    throw Error("Invalid project asset: expected base64 and MIME type");
  const bytes = Buffer.from(input.base64, "base64");
  const sha256 = digest(bytes),
    path = `assets/${sha256}`;
  await mkdir(join(directory, "assets"), { recursive: true });
  try {
    await writeFile(join(directory, path), bytes, { flag: "wx" });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
  }
  const asset = { path, type: input.type, size: bytes.length, sha256 };
  await readProjectAsset(directory, asset);
  return asset;
}
export async function storeProjectRecord(
  directory: string,
  input: ProjectInputRecord,
  revision?: string,
): Promise<ProjectFileRecord> {
  const { canonicalXML, ...record } = input;
  const encode = (asset: BinaryAsset | ProjectAsset) =>
    storeProjectAsset(directory, asset);
  const result: ProjectFileRecord = {
    ...record,
    pdf: await encode(record.pdf),
    audio: await encode(record.audio),
    pages: await Promise.all(record.pages.map(encode)),
    otherScores: await Promise.all(
      (record.otherScores ?? []).map(async (score) => ({
        ...score,
        source: await encode(score.source),
        pages: await Promise.all(score.pages.map(encode)),
      })),
    ),
  };
  if (canonicalXML !== undefined) {
    const bytes = Buffer.from(canonicalXML);
    if (revision) {
      const path = `saves/${revision}/canonical.musicxml`;
      await writeFile(join(directory, path), bytes, { flag: "wx" });
      result.canonical = {
        path,
        type: "application/vnd.recordare.musicxml+xml",
        size: bytes.length,
        sha256: digest(bytes),
      };
    } else
      result.canonical = await encode({
        type: "application/vnd.recordare.musicxml+xml",
        base64: bytes.toString("base64"),
      });
  }
  return result;
}
export async function hydrateProjectRecord(
  directory: string,
  record: ProjectFileRecord,
): Promise<PackedRecord> {
  const decode = async (asset: ProjectAsset) => ({
    type: asset.type,
    base64: (await readProjectAsset(directory, asset)).toString("base64"),
  });
  const { canonical, ...rest } = record;
  return {
    ...rest,
    canonicalXML: canonical
      ? (await readProjectAsset(directory, canonical)).toString("utf8")
      : undefined,
    pdf: await decode(record.pdf),
    audio: await decode(record.audio),
    pages: await Promise.all(record.pages.map(decode)),
    otherScores: await Promise.all(
      (record.otherScores ?? []).map(async (score) => ({
        ...score,
        source: await decode(score.source),
        pages: await Promise.all(score.pages.map(decode)),
      })),
    ),
  };
}
