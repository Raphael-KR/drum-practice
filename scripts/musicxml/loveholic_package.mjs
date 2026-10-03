/* Run only through the existing localhost Vite app for this reviewed source.
 * Creates and rereads a package in memory; never modifies an IndexedDB record.
 * A loopback evidence receiver saves the new artifact under docs/experiments.
 */
import { renderMusicXML } from "/src/musicxml.ts";
import { writeCanonical, readCanonical } from "/src/canonical-xml.ts";
import { createScorePackage, readScorePackage } from "/src/score-package.ts";
import { defaults, validateSong } from "/src/model.ts";
import { displayPage } from "/src/score-pages.ts";
import { projectLyrics } from "/src/lyric-score.ts";

const ROOT = "/@fs/Users/raphael/Playground/drum-practice/docs/experiments/loveholic-20261002/";
const getBlob = async (name, type) => new Blob([await (await fetch(ROOT + name)).arrayBuffer()], { type });
const getJSON = async name => (await fetch(ROOT + name)).json();
const base64 = async blob => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let text = "";
  for (let i = 0; i < bytes.length; i += 8192) text += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(text);
};
const hash = async blob => [...new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()))].map(b => b.toString(16).padStart(2, "0")).join("");
const lyricSignature = lyrics => lyrics.map(({ id, text, confirmed, scorePosition, time, end }) => ({ id, text, confirmed,
  measureId: scorePosition?.measureId, quarterOffset: scorePosition?.quarterOffset,
  durationQuarters: scorePosition?.durationQuarters, time, end }));
const save = async (endpoint, data, port) => {
  const r = await fetch("http://127.0.0.1:" + port + "/" + endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!r.ok) throw Error("Evidence save failed " + r.status);
};

/** Add reviewed PDF-only lyric anchors without changing musical positions. */
export async function applyPDFLyricAnchors({ packageName, anchorName, evidencePort = 5187 }) {
  const record = await readScorePackage(await getBlob(packageName, "application/zip"));
  const review = await getJSON(anchorName);
  const variant = record.otherScores.find(v => v.format === "pdf");
  if (!variant || await hash(variant.source) !== review.sourcePDFSHA256 || record.song.lyrics.length !== review.lyrics) throw Error("PDF anchor source mismatch");
  const beforeXML = record.canonicalXML, beforeLyrics = JSON.stringify(record.song.lyrics);
  const updated = variant.regions.map((r, i) => {
    const expected = review.regions[i];
    if (expected.regionId !== r.id || JSON.stringify(expected.sourceRegion) !== JSON.stringify(r)) throw Error("PDF geometry changed");
    const anchors = expected.lyricAnchors.map(({ lyricId, quarterOffset, x }) => {
      const lyric = record.song.lyrics.find(l => l.id === lyricId);
      if (!lyric || lyric.scorePosition.measureId !== record.song.measures[i].id || lyric.scorePosition.quarterOffset !== quarterOffset || !Number.isFinite(x) || x < 0 || x > 1) throw Error("Invalid PDF lyric anchor");
      return { lyricId, quarterOffset, x };
    });
    return { ...r, lyricAnchors: anchors };
  });
  if (updated.reduce((n,r) => n + r.lyricAnchors.length, 0) !== 269) throw Error("Incomplete PDF anchors");
  variant.regions = updated;
  const packaged = await createScorePackage(record), loaded = await readScorePackage(packaged);
  if (loaded.canonicalXML !== beforeXML || JSON.stringify(loaded.song.lyrics) !== beforeLyrics || JSON.stringify(loaded.otherScores.find(v=>v.format==='pdf').regions) !== JSON.stringify(updated)) throw Error("PDF anchor roundtrip failed");
  const status = { status: "PASS", package_sha256: await hash(packaged), package_bytes: packaged.size,
    canonical_sha256: await hash(loaded.pdf), pdf_lyric_anchors: 269,
    scope: "PDF display-only lyric anchors; XML/lyrics/times/SVG/media unchanged" };
  await save("package", { package: await base64(packaged), canonicalXML: beforeXML, ...status }, evidencePort);
  return status;
}

/** Refresh only rendering caches of the already reviewed standard-lyric package. */
export async function refresh({ packageName, evidencePort = 5187 }) {
  const original = await getBlob(packageName, "application/zip");
  const record = await readScorePackage(original);
  const xmlHash = await hash(record.pdf);
  if (xmlHash !== "e84578fe97421141fe6944f6a18aa72fdce746fb788ee2bc1ffcd082110f6df8" || record.song.lyrics.length !== 269 || record.song.measures.length !== 123) throw Error("Unexpected reviewed input");
  const before = JSON.stringify(lyricSignature(record.song.lyrics));
  const times = record.song.measures.map(({ id, label, beats, denominator, start, end }) => ({ id, label, beats, denominator, start, end }));
  const result = await renderMusicXML(record.pdf, s => { window.loveholicProgress = s; }, "P1");
  if (result.regions.length !== 123) throw Error("Wrong rendered measure count");
  record.pages = result.pages; record.song.regions = result.regions; record.song.pageCount = result.pages.length;
  record.song.measures.forEach((m, i) => { m.regionId = result.regions[i].id; });
  const packaged = await createScorePackage(record);
  const loaded = await readScorePackage(packaged);
  if (loaded.canonicalXML !== record.canonicalXML || await hash(loaded.pdf) !== xmlHash || JSON.stringify(lyricSignature(loaded.song.lyrics)) !== before) throw Error("XML or lyrics changed during cache refresh");
  if (JSON.stringify(loaded.song.measures.map(({ id, label, beats, denominator, start, end }) => ({ id, label, beats, denominator, start, end }))) !== JSON.stringify(times)) throw Error("Measure times changed");
  const sourceHashes = { audio: await hash(record.audio), pdf: await hash(record.otherScores[0].source) };
  if (await hash(loaded.audio) !== sourceHashes.audio || await hash(loaded.otherScores[0].source) !== sourceHashes.pdf) throw Error("Media changed");
  const status = { status: "PASS", package_sha256: await hash(packaged), package_bytes: packaged.size,
    canonical_sha256: xmlHash, originalPackageSHA256: await hash(original), measures: 123, standard_lyric_units: 269,
    original_pdf_sha256: sourceHashes.pdf, audio_sha256: sourceHashes.audio,
    sourcePackage: packageName, scope: "Rendering caches only; canonical XML, lyrics, measure times, media preserved", browser: navigator.userAgent };
  await save("package", { package: await base64(packaged), canonicalXML: record.canonicalXML, ...status }, evidencePort);
  await save("render", { pages: await Promise.all(result.pages.map(base64)), regions: result.regions,
    measures: result.parsed.measures, warnings: result.parsed.warnings,
    engine: "OSMD 2.1.2 / current src/musicxml.ts, time-proportional SVG ribbon", browser: navigator.userAgent }, evidencePort);
  return status;
}

export async function build({ sourceName = "loveholic.musicxml", printedLyricsName, noteLyricsName, evidencePort = 5186 } = {}) {
  if (printedLyricsName && noteLyricsName) throw Error("Choose one printed lyric representation");
  const [provenance, alignment, bars, cues, cropSystems, pdf, audio, source] = await Promise.all([
    getJSON("provenance.json"), getJSON("audio-alignment.json"), getJSON("extracted.json"), getJSON("printed-lyric-cues.json"),
    getJSON("pdf-crop-systems.json"),
    getBlob("source.pdf", "application/pdf"), getBlob("source.mp3", "audio/mpeg"),
    getBlob(sourceName, "application/vnd.recordare.musicxml+xml"),
  ]);
  if (await hash(pdf) !== provenance.pdf_sha256 || await hash(audio) !== provenance.audio_sha256) throw Error("Source digest mismatch");
  const result = await renderMusicXML(source, s => { window.loveholicProgress = s; }, "P1");
  const renderedHalfOpen = (await Promise.all(result.pages.map(async page => {
    const svg = new DOMParser().parseFromString(await (await displayPage(page)).text(), "image/svg+xml");
    return svg.querySelectorAll('[data-smufl="pictHalfOpen1"]').length;
  }))).reduce((a, b) => a + b, 0);
  const selectedHalfOpen = new DOMParser().parseFromString(await source.text(), "application/xml")
    .querySelectorAll('half-muted[smufl="pictHalfOpen1"]').length;
  if (selectedHalfOpen && renderedHalfOpen !== selectedHalfOpen) throw Error("Half-open rendering incomplete");
  const regions = result.regions;
  const measures = alignment.measures.map((m, i) => ({ id: "loveholic-m" + m.label, regionId: regions[i].id, label: m.label, beats: 4, denominator: 4, start: m.start, end: m.end }));
  const song = {
    version: 1, id: "loveholic-003e2b2a", title: "Loveholic", originalTitle: "Loveholic", artist: "러브홀릭",
    lyricText: cues.map(c => c.text.replace(/\s+/g, " ").trim()).join("\n"),
    bpm: 136, firstBeat: measures[0].start, measures, regions, lyrics: [],
    markers: bars.filter(b => b.section).map(b => ({ id: "section-" + b.number, name: b.section, time: measures[b.number - 1].start })),
    loops: [], settings: defaults(), audioName: provenance.audio.split("/").at(-1), pdfName: "Loveholic.musicxml",
    scoreFormat: "musicxml", scorePartId: "P1", pageCount: result.pages.length,
  };
  if (printedLyricsName) {
    const printed = await getJSON(printedLyricsName);
    if (printed.sourcePDFSHA256 !== provenance.pdf_sha256 || printed.status !== "PASS") throw Error("Printed lyric source mismatch");
    song.measureLyrics = printed.measureTexts.map(({ id, measureId, text, placement }) => ({ id, measureId, text, placement }));
  }
  let noteReview;
  let baseXML = await source.text();
  if (noteLyricsName) {
    noteReview = await getJSON(noteLyricsName);
    if (noteReview.sourcePDFSHA256 !== provenance.pdf_sha256 || noteReview.status !== "PASS") throw Error("Note lyric source mismatch");
    song.lyrics = noteReview.lyrics.map(({ id, text, confirmed, scorePosition }) => ({ id, text, confirmed, scorePosition, time: 0, end: 0 }));
    projectLyrics(song);
    const doc = new DOMParser().parseFromString(baseXML, "application/xml");
    const misc = doc.querySelector("identification > miscellaneous");
    if (!misc) throw Error("Missing source identification");
    const evidence = doc.createElement("miscellaneous-field");
    evidence.setAttribute("name", "drum-practice:printed-lyric-anchors:v1");
    evidence.textContent = JSON.stringify({ sourcePDFSHA256: noteReview.sourcePDFSHA256,
      positionBasis: noteReview.positionBasis, durationBasis: noteReview.durationBasis,
      inferredInteriorPositions: noteReview.inferredInteriorPositions, vocalTimingVerified: false });
    misc.append(evidence); baseXML = new XMLSerializer().serializeToString(doc);
  }
  validateSong(song);
  let canonicalXML = writeCanonical(song, baseXML, provenance.audio_sha256);
  // Identical work/movement titles produce duplicate headings in OSMD. The
  // display title remains in the canonical metadata field; no music is changed.
  const doc = new DOMParser().parseFromString(canonicalXML, "application/xml");
  const movement = doc.querySelector("movement-title");
  if (movement?.textContent === doc.querySelector("work-title")?.textContent) movement.remove();
  canonicalXML = new XMLSerializer().serializeToString(doc);
  const restored = structuredClone(song);
  readCanonical(canonicalXML, restored);
  if (JSON.stringify(restored.measures) !== JSON.stringify(song.measures) || JSON.stringify(lyricSignature(restored.lyrics)) !== JSON.stringify(lyricSignature(song.lyrics))) throw Error("Canonical timeline/lyric positions changed");
  if (JSON.stringify(restored.measureLyrics) !== JSON.stringify(song.measureLyrics)) throw Error("Canonical printed lyrics changed");
  const canonicalBlob = new Blob([canonicalXML], { type: "application/vnd.recordare.musicxml+xml" });
  const pdfRegions = bars.map((b, i) => {
    const crop = cropSystems.find(s => s.page === b.page && s.system === b.system);
    if (!crop) throw Error("Missing PDF crop system " + b.system);
    const left = b.bounds[0], right = b.bounds[2], width = right - left;
    const points = b.events.map(e => ({ beat: e.onset, x: (e.x - left) / width }));
    if (b.events.length === 1 && b.events[0].rest) points[0].x = .04;
    points.push({ beat: 4, x: 1 });
    const beatXs = Array.from({ length: 5 }, (_, beat) => {
      for (let j = 1; j < points.length; j++) if (beat <= points[j].beat) {
        const a = points[j - 1], c = points[j];
        return a.x + (c.x - a.x) * (beat - a.beat) / (c.beat - a.beat);
      }
      return 1;
    });
    return { id: "loveholic-pdf-r" + (i + 1), page: b.page - 1, x: left / 596, y: crop.top / 842, w: width / 596, h: (crop.bottom - crop.top) / 842, beatXs };
  });
  const pdfPages = await Promise.all([1, 2, 3].map(i => getBlob("source-poppler-" + i + ".png", "image/png")));
  const record = { song, canonicalXML, pdf: canonicalBlob, audio, pages: result.pages, otherScores: [{
    format: "pdf", name: provenance.pdf.split("/").at(-1), source: pdf, pages: pdfPages, regions: pdfRegions,
    measures: measures.map((m, i) => ({ id: m.id, regionId: pdfRegions[i].id, beats: m.beats, denominator: m.denominator })),
  }] };
  const packaged = await createScorePackage(record);
  const loaded = await readScorePackage(packaged);
  if (JSON.stringify(loaded.song) !== JSON.stringify(song)) throw Error("Package song changed");
  if (loaded.canonicalXML !== canonicalXML || await loaded.pdf.text() !== canonicalXML) throw Error("Package XML changed");
  if (await hash(loaded.audio) !== provenance.audio_sha256 || await hash(loaded.otherScores[0].source) !== provenance.pdf_sha256) throw Error("Package source bytes changed");
  const status = {
    status: "PASS", package_sha256: await hash(packaged), package_bytes: packaged.size, song,
    original_pdf_sha256: await hash(loaded.otherScores[0].source), audio_sha256: await hash(loaded.audio),
    canonical_sha256: await hash(loaded.pdf), measures: song.measures.length, svg_pages: loaded.pages.length,
    pdf_pages: loaded.otherScores[0].pages.length, roundtrip: "createScorePackage -> readScorePackage, full song/XML/source hashes equal",
    timing_status: "signal-estimated; six-window pulse phase checked; no listening confirmation",
    lyrics_status: noteReview ? "Standard note/lyric carrier from printed score; vocal timing unverified, four disclosed inferred positions" : song.measureLyrics ? "Printed source text assigned to verified measures; no fabricated vocal rhythm" : "printed text retained; no fabricated vocal rhythm",
    standard_lyric_units: song.lyrics.length,
    inferred_lyric_measures: noteReview?.inferredInteriorPositions ?? [],
    lyric_duration_basis: noteReview?.durationBasis,
    printed_lyric_measures: song.measureLyrics?.length ?? 0,
    half_open_input: selectedHalfOpen, half_open_rendered: renderedHalfOpen,
    notation_limit: selectedHalfOpen ? "Official percussion SMuFL pictHalfOpen1 displayed by app supplement; native OSMD half-muted remains unsupported" : "20 half-muted marks preserved in MusicXML; OSMD 2.1.2 display unsupported",
    browser: navigator.userAgent,
  };
  await save("package", { package: await base64(packaged), canonicalXML, ...status }, evidencePort);
  await save("render", { pages: await Promise.all(result.pages.map(base64)), regions, measures: result.parsed.measures,
    warnings: result.parsed.warnings, title: result.parsed.title, bpm: result.parsed.bpm, engine: "OSMD 2.1.2 / current src/musicxml.ts", browser: navigator.userAgent }, evidencePort);
  window.loveholicRecord = record;
  window.loveholicPackage = packaged;
  const panel = document.createElement("section"); panel.id = "loveholic-qa";
  panel.style.cssText = "position:absolute;left:0;top:0;width:1500px;background:white;color:black;z-index:100000";
  const heading = document.createElement("h1"); heading.textContent = `Loveholic — MusicXML / 123마디 / 표준 가사 ${song.lyrics.length}개 / 중앙 가사 ${song.measureLyrics?.length ?? 0}마디`; panel.append(heading);
  for (const page of result.pages) {
    const img = document.createElement("img"); img.src = URL.createObjectURL(await displayPage(page));
    img.style.cssText = "display:block;width:1500px;background:white"; panel.append(img);
  }
  document.body.append(panel);
  return { status: status.status, package_sha256: status.package_sha256, bytes: packaged.size, measures: song.measures.length, svg_pages: loaded.pages.length, pdf_pages: loaded.otherScores[0].pages.length };
}
