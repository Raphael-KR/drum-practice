/* Existing local common APIs, no library/catalog or IndexedDB record writes. */
import { renderMusicXML } from "/src/modules/score/musicxml.ts";
import {
  writeCanonical,
  readCanonical,
} from "/src/modules/score/canonical-xml.ts";
import {
  createScorePackage,
  readScorePackage,
} from "/src/modules/library/score-package.ts";
import { defaults, validateSong } from "/src/model/model.ts";
import { displayPage } from "/src/modules/score/score-pages.ts";
const ROOT =
  "/@fs/Users/raphael/Playground/drum-practice/data/production/red-sunset/";
const get = async (p) => {
  const r = await fetch(ROOT + p);
  if (!r.ok) throw Error("Missing " + p);
  return r;
};
const blob = async (p, type) =>
  new Blob([await (await get(p)).arrayBuffer()], { type });
const sha = async (b) =>
  [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", await b.arrayBuffer()),
    ),
  ]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
const b64 = async (b) => {
  const a = new Uint8Array(await b.arrayBuffer());
  let s = "";
  for (let i = 0; i < a.length; i += 8192)
    s += String.fromCharCode(...a.subarray(i, i + 8192));
  return btoa(s);
};
export async function build() {
  const alignment = await (await get("audio/audio-alignment.json")).json();
  const source = await blob(
    "source/red-sunset-source.musicxml",
    "application/vnd.recordare.musicxml+xml",
  );
  const audio = await blob("audio/source.mp3", "audio/mpeg");
  if ((await sha(audio)) !== alignment.audioSHA256)
    throw Error("Source audio mismatch");
  const first = await renderMusicXML(
    source,
    (s) => (window.redSunsetProgress = s),
    "P1",
  );
  if (first.regions.length !== 137) throw Error("Expected 137 source measures");
  const song = {
    version: 1,
    id: "yb-red-sunset-20f9b136",
    title: "붉은 노을",
    originalTitle: "붉은 노을",
    artist: "YB",
    bpm: 134,
    firstBeat: 11.27,
    measures: alignment.measures.map((m, i) => ({
      id: "red-sunset-m" + m.label,
      regionId: first.regions[i].id,
      label: m.label,
      beats: m.beats,
      denominator: 4,
      start: m.start,
      end: m.end,
    })),
    regions: first.regions,
    lyrics: [],
    markers: [
      { id: "count", name: "기보된 카운트", time: 11.27 },
      { id: "intro", name: "Intro", time: 12.99 },
      { id: "verse1", name: "Verse 1", time: alignment.measures[17].start },
      { id: "chorus1", name: "Chorus 1", time: alignment.measures[25].start },
      { id: "ending", name: "Ending · 연결 추정", time: 244.1 },
    ],
    loops: [],
    settings: { ...defaults(), countIn: 0, tempoMode: "original" },
    audioName: "YB - 붉은 노을.mp3",
    pdfName: "red-sunset-final.musicxml",
    scoreFormat: "musicxml",
    scorePartId: "P1",
    pageCount: first.pages.length,
  };
  validateSong(song);
  const d = new DOMParser().parseFromString(
    writeCanonical(song, await source.text(), await sha(audio)),
    "application/xml",
  );
  if (
    d.querySelector("movement-title")?.textContent ===
    d.querySelector("work > work-title")?.textContent
  )
    d.querySelector("movement-title").remove();
  const misc = d.querySelector("identification > miscellaneous");
  const e = d.createElement("miscellaneous-field");
  e.setAttribute("name", "drum-practice:recording-grid:v1");
  e.textContent = JSON.stringify(alignment);
  misc.append(e);
  const canonicalXML = new XMLSerializer().serializeToString(d),
    canonical = new Blob([canonicalXML], { type: source.type });
  const restored = structuredClone(song);
  readCanonical(canonicalXML, restored);
  if (
    JSON.stringify(restored.measures) !== JSON.stringify(song.measures) ||
    restored.bpm !== 134 ||
    restored.artist !== "YB"
  )
    throw Error("Canonical timeline/metadata changed");
  const final = await renderMusicXML(
    canonical,
    (s) => (window.redSunsetProgress = s),
    "P1",
  );
  song.regions = final.regions;
  song.pageCount = final.pages.length;
  song.measures.forEach((m, i) => (m.regionId = final.regions[i].id));
  if (
    final.regions.length !== 137 ||
    final.pages.length !== 4 ||
    final.parsed.warnings.length
  )
    throw Error("Final rendering structure");
  validateSong(song);
  const pdf = await blob("source/source.pdf", "application/pdf");
  const pdfRegions = await (await get("source/pdf-regions.json")).json();
  const pdfPages = await Promise.all(
    [1, 2, 3, 4].map((i) => blob("review/source-" + i + ".png", "image/png")),
  );
  const variant = {
    format: "pdf",
    name: "YB - 붉은 노을(Lv2).pdf",
    source: pdf,
    pages: pdfPages,
    regions: pdfRegions,
    measures: song.measures.map((m, i) => ({
      id: m.id,
      regionId: pdfRegions[i].id,
      beats: m.beats,
      denominator: m.denominator,
    })),
  };
  const record = {
    song,
    canonicalXML,
    pdf: canonical,
    audio,
    pages: final.pages,
    otherScores: [variant],
  };
  const pack = await createScorePackage(record),
    loaded = await readScorePackage(pack);
  if (
    JSON.stringify(loaded.song) !== JSON.stringify(song) ||
    loaded.canonicalXML !== canonicalXML ||
    (await sha(loaded.audio)) !== (await sha(audio)) ||
    (await sha(loaded.otherScores[0].source)) !== (await sha(pdf))
  )
    throw Error("Package roundtrip changed data");
  const audit = {
    status: "PASS",
    scope:
      "source schema separately; common rendering/structure/canonical/package readback and source media hashes",
    measures: 137,
    quarters: 550,
    svgPages: 4,
    artist: "YB",
    bpm: 134,
    firstBeat: 11.27,
    performanceStart: 12.99,
    endingStatus:
      "provisional correspondence; nonlinear slowing candidate stored in metadata; current app uses uniform within each measure",
    notVerified: [
      "actual listening",
      "iPad stored analysis equivalence",
      "actual iPad playback",
      "unique alignment of freely improvised ending",
    ],
    canonicalSHA256: await sha(canonical),
    audioSHA256: await sha(audio),
    sourcePDFSHA256: await sha(pdf),
    packageSHA256: await sha(pack),
    packageBytes: pack.size,
    browser: navigator.userAgent,
    regions: final.regions,
    parsedMeasures: final.parsed.measures,
  };
  const saved = await fetch("http://127.0.0.1:5191/artifacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...audit,
      package: await b64(pack),
      canonicalXML,
      pages: await Promise.all(final.pages.map(b64)),
    }),
  });
  if (!saved.ok) throw Error("Artifact receiver " + saved.status);
  window.redSunsetRecord = record;
  window.redSunsetSVG = await Promise.all(
    final.pages.map(async (p) => (await displayPage(p)).text()),
  );
  return audit;
}
