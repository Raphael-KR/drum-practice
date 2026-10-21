import labels from "../../content/bundled-practice-metadata.json";
import type { RecordData } from "../../model/record";

/** Repair known old labels only when the recording matches its documented kit. */
export async function practiceMetadataUpgrade(
  record: RecordData,
): Promise<RecordData | undefined> {
  const meta = (
    labels as Record<
      string,
      {
        title: string;
        artist: string;
        originalTitle: string;
        measures: number;
        audioSHA256: string;
        oldTitles: string[];
        oldArtists: string[];
      }
    >
  )[record.song.id];
  if (
    !meta ||
    record.song.measures.length !== meta.measures ||
    (record.song.title === meta.title && record.song.artist === meta.artist)
  )
    return;
  // Custom user labels remain user-owned.
  if (
    !meta.oldTitles.includes(record.song.title) ||
    !meta.oldArtists.includes(record.song.artist || "")
  )
    return;
  const hash = await crypto.subtle.digest(
    "SHA-256",
    await record.audio.arrayBuffer(),
  );
  const hex = [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  if (hex !== meta.audioSHA256) return;
  let canonicalXML = record.canonicalXML;
  if (canonicalXML) {
    if (/<!ENTITY/i.test(canonicalXML)) return;
    const document = new DOMParser().parseFromString(
      canonicalXML,
      "application/xml",
    );
    if (document.querySelector("parsererror")) return;
    const identification = document.querySelector("identification");
    if (!identification) return;
    let artist = identification.querySelector('creator[type="artist"]');
    if (!artist) {
      artist = document.createElement("creator");
      artist.setAttribute("type", "artist");
      identification.prepend(artist);
    }
    artist.textContent = meta.artist;
    const workTitle = document.querySelector("work > work-title");
    if (workTitle) workTitle.textContent = meta.originalTitle;
    let movement = document.querySelector("score-partwise > movement-title");
    if (!movement) {
      movement = document.createElement("movement-title");
      identification.before(movement);
    }
    movement.textContent = meta.title;
    document
      .querySelectorAll(
        'miscellaneous-field[name="drum-practice:display-title"]',
      )
      .forEach((node) => (node.textContent = meta.title));
    canonicalXML = new XMLSerializer().serializeToString(document);
  }
  return {
    ...record,
    canonicalXML,
    song: {
      ...record.song,
      title: meta.title,
      originalTitle: meta.originalTitle,
      artist: meta.artist,
    },
  };
}
