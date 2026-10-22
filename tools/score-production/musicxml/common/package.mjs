/* global DOMParser, XMLSerializer */
import {
  writeCanonical,
  readCanonical,
} from "../../../../src/modules/score/canonical-xml.ts";
/** Shared production helpers. Uses the app's canonical package contract. */
import {
  createScorePackage,
  readScorePackage,
} from "../../../../src/modules/library/score-package.ts";

// Vite's transformed directory URL may omit its final slash. Every song path
// below is repository-relative, so retain the directory boundary explicitly.
export const projectBase = new URL(
  "../../../../",
  import.meta.url,
).pathname.replace(/\/?$/, "/");
export async function sha(blob) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()),
    ),
    (n) => n.toString(16).padStart(2, "0"),
  ).join("");
}
export async function base64(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let text = "";
  for (let i = 0; i < bytes.length; i += 8192)
    text += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(text);
}
export async function saveEvidence(endpoint, data, port) {
  const response = await fetch(`http://127.0.0.1:${port}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok)
    throw Error(
      `Evidence receiver: endpoint=${endpoint}, port=${port}, status=${response.status}`,
    );
}
function equal(actual, expected, field) {
  const a = JSON.stringify(actual),
    e = JSON.stringify(expected);
  if (a !== e) {
    let firstDifference = 0;
    while (
      firstDifference < Math.min(a?.length ?? 0, e?.length ?? 0) &&
      a[firstDifference] === e[firstDifference]
    )
      firstDifference++;
    throw Error(
      `Package roundtrip differs: ${field}; expected type=${typeof expected}, JSON length=${e?.length ?? 0}; actual type=${typeof actual}, JSON length=${a?.length ?? 0}; first difference=${firstDifference}; content omitted`,
    );
  }
}
async function sameBlob(actual, expected, field) {
  const a = await sha(actual),
    e = await sha(expected);
  if (a !== e)
    throw Error(
      `Package roundtrip ${field}: expected SHA256=${e}, actual=${a}`,
    );
}
/** Check every asset, not only the first alternate score or audio. */
export async function verifyPackage(record, loaded) {
  equal(loaded.song, record.song, "song");
  equal(loaded.canonicalXML, record.canonicalXML, "canonicalXML");
  await sameBlob(loaded.pdf, record.pdf, "source");
  await sameBlob(loaded.audio, record.audio, "audio");
  const pages = async (a, e, name) => {
    equal(a.length, e.length, `${name}.length`);
    for (let i = 0; i < e.length; i++)
      await sameBlob(a[i], e[i], `${name}[${i}]`);
  };
  await pages(loaded.pages, record.pages, "pages");
  const a = loaded.otherScores ?? [],
    e = record.otherScores ?? [];
  equal(a.length, e.length, "otherScores.length");
  for (let i = 0; i < e.length; i++) {
    const { source: as, pages: ap, ...am } = a[i];
    const { source: es, pages: ep, ...em } = e[i];
    equal(am, em, `otherScores[${i}]`);
    await sameBlob(as, es, `otherScores[${i}].source`);
    await pages(ap, ep, `otherScores[${i}].pages`);
  }
}
export async function createVerifiedPackage(record) {
  const blob = await createScorePackage(record);
  await verifyPackage(record, await readScorePackage(blob));
  return blob;
}

/** Preserve canonical writer semantics; source-specific metadata is a callback. */
export function prepareCanonical(song, sourceXML, audioHash, editDocument) {
  const doc = new DOMParser().parseFromString(
    writeCanonical(song, sourceXML, audioHash),
    "application/xml",
  );
  const movement = doc.querySelector("movement-title");
  if (
    movement &&
    movement.textContent === doc.querySelector("work > work-title")?.textContent
  )
    movement.remove();
  editDocument?.(doc);
  const canonicalXML = new XMLSerializer().serializeToString(doc);
  const restored = structuredClone(song);
  readCanonical(canonicalXML, restored);
  equal(restored.measures, song.measures, "canonical measures");
  return { canonicalXML, restored };
}

/** Bind renderer output to existing musical IDs without changing timings. */
export function bindRenderedScore(song, rendered) {
  equal(
    rendered.regions.length,
    song.measures.length,
    "rendered measure count",
  );
  song.regions = rendered.regions;
  song.pageCount = rendered.pages.length;
  song.measures.forEach((m, i) => {
    m.regionId = rendered.regions[i].id;
  });
}
