import {
  sha,
  base64,
  saveEvidence,
  createVerifiedPackage,
  projectBase,
  prepareCanonical,
  bindRenderedScore,
} from "./common/package.mjs";
import profiles from "./profiles/songs.json";
const config = profiles["tom-moving"];
const measureSeconds = (4 * 60) / config.bpm;
const audioSeconds =
  config.firstBeat + (config.quarters * 60) / config.bpm + config.tailSeconds;
/* Current localhost common renderer/package APIs. No IndexedDB writes. */
import { renderMusicXML } from "/src/modules/score/musicxml.ts";
import { readScorePackage } from "/src/modules/library/score-package.ts";
import { defaults, validateSong, makeCycle } from "/src/model/model.ts";
import { displayPage } from "/src/modules/score/score-pages.ts";

const BASE = projectBase;
const ROOT = BASE + config.root + "source/";
const b64 = base64;
const save = (endpoint, data) =>
  saveEvidence(endpoint, data, config.evidencePort);

export async function build() {
  const source = new Blob(
    [await (await fetch(ROOT + "tom-moving-source.musicxml")).arrayBuffer()],
    { type: "application/vnd.recordare.musicxml+xml" },
  );
  const audio = new Blob(
    [
      await (
        await fetch(
          BASE + "data/production/tom-moving/audio/tom-moving-portland.mp3",
        )
      ).arrayBuffer(),
    ],
    { type: "audio/mpeg" },
  );
  const fixture = await (
    await fetch(
      BASE + "tools/score-production/musicxml/fixtures/tom_moving_video.json",
    )
  ).json();
  const metadata = (
    await (
      await fetch(
        BASE + "tools/score-production/musicxml/tom-moving-versions.json",
      )
    ).json()
  ).versions.find((v) => v.id === "tom-moving-video-v2");
  const generationResponse = await fetch(ROOT + "generation-audit.json");
  if (!generationResponse.ok)
    throw Error(
      "Generation audit was cleaned up. Run tools/score-production/musicxml/tom_moving_corrected.py with --out pointing to the source folder after obtaining test permission, then retry.",
    );
  const generation = await generationResponse.json();
  const audioAudit = await (
    await fetch(BASE + "data/production/tom-moving/audio/render-audit.json")
  ).json();
  if (
    generation.status !== "PASS" ||
    (await sha(audio)) !== audioAudit.mp3SHA256
  )
    throw Error("Input validation/hash mismatch");
  const render = await renderMusicXML(
    source,
    (s) => (window.tomMovingProgress = s),
    "P1",
  );
  if (render.regions.length !== config.expectedMeasures)
    throw Error("Expected 28 regions");
  const song = {
    version: 1,
    id: metadata.id,
    title: metadata.title,
    originalTitle: metadata.title,
    artist: metadata.artist,
    composer: "영상 기본 패턴 · 연습용 정리",
    bpm: config.bpm,
    firstBeat: config.firstBeat,
    measures: render.regions.map((r, i) => ({
      id: "tom-moving-v2-m" + (i + 1),
      regionId: r.id,
      label: String(i + 1),
      beats: 4,
      denominator: 4,
      start: config.firstBeat + i * measureSeconds,
      end: config.firstBeat + (i + 1) * measureSeconds,
    })),
    regions: render.regions,
    lyrics: [],
    markers: fixture.sections.map((section, i) => ({
      id: "tom-section-" + i,
      name: section.name,
      time: config.firstBeat + i * 4 * measureSeconds,
    })),
    loops: [],
    settings: defaults(),
    audioName: "tom-moving-portland.mp3",
    pdfName: "tom-moving-final.musicxml",
    scoreFormat: "musicxml",
    scorePartId: "P1",
    pageCount: render.pages.length,
  };
  validateSong(song);
  const { canonicalXML } = prepareCanonical(
    song,
    await source.text(),
    await sha(audio),
  );
  const canonical = new Blob([canonicalXML], { type: source.type });
  const finalRender = await renderMusicXML(
    canonical,
    (s) => (window.tomMovingProgress = s),
    "P1",
  );
  if (finalRender.regions.length !== config.expectedMeasures)
    throw Error("Final canonical region count");
  bindRenderedScore(song, finalRender);
  validateSong(song);
  const record = {
    song,
    canonicalXML,
    pdf: canonical,
    audio,
    pages: finalRender.pages,
  };
  const packaged = await createVerifiedPackage(record),
    loaded = await readScorePackage(packaged);
  if (
    JSON.stringify(loaded.song) !== JSON.stringify(song) ||
    loaded.canonicalXML !== canonicalXML ||
    (await loaded.pdf.text()) !== canonicalXML ||
    (await sha(loaded.audio)) !== (await sha(audio))
  )
    throw Error("Package roundtrip mismatch");
  const cycles = [];
  for (const rate of [0.75, 1, 1.25])
    for (const enabled of [false, true]) {
      const c = makeCycle(
        10,
        0,
        audioSeconds,
        rate,
        0,
        song.measures[0],
        enabled,
      );
      const first = c.musicAt + config.firstBeat / rate,
        expected = 10 + (enabled ? measureSeconds : config.firstBeat) / rate;
      if (Math.abs(first - expected) > 1e-9)
        throw Error("First beat/countoff mismatch");
      cycles.push({
        rate,
        countOff: enabled,
        firstBeatAt: first,
        expected,
        count: c.count,
      });
    }
  const context = new AudioContext();
  const decoded = await context.decodeAudioData(await audio.arrayBuffer());
  if (Math.abs(decoded.duration - audioSeconds) > 1 / decoded.sampleRate)
    throw Error("Decoded duration mismatch");
  await context.close();
  const svgs = await Promise.all(
    finalRender.pages.map(async (p) => (await displayPage(p)).text()),
  );
  const texts = svgs.flatMap((s) =>
    [
      ...new DOMParser()
        .parseFromString(s, "image/svg+xml")
        .querySelectorAll("text"),
    ].map((t) => t.textContent?.trim()),
  );
  const hands = {
    R: texts.filter((t) => t === "R").length,
    L: texts.filter((t) => t === "L").length,
  };
  if (hands.R !== 208 || hands.L !== 80)
    throw Error("Rendered sticking incomplete " + JSON.stringify(hands));
  const status = {
    status: "PASS",
    scope: "mechanical roundtrip, counts, decoding and numeric timing",
    visualStatus: "pending actual SVG visual review",
    measures: config.expectedMeasures,
    notes: 336,
    renderedHands: hands,
    svgPages: finalRender.pages.length,
    decodedAudioDuration: decoded.duration,
    cycles,
    canonicalSHA256: await sha(canonical),
    audioSHA256: await sha(audio),
    packageSHA256: await sha(packaged),
    packageBytes: packaged.size,
    roundtrip: "full Song/XML/audio hashes equal",
    browser: navigator.userAgent,
    notVerified: [
      "subjective audio quality/listening",
      "actual iPad playback",
      "actual device listening",
    ],
  };
  await save("package", {
    package: await b64(packaged),
    canonicalXML,
    ...status,
  });
  await save("render", {
    pages: await Promise.all(finalRender.pages.map(b64)),
    regions: finalRender.regions,
    measures: finalRender.parsed.measures,
    warnings: finalRender.parsed.warnings,
    browser: navigator.userAgent,
  });
  const review = document.createElement("div");
  review.id = "tom-moving-review";
  review.style.cssText =
    "position:fixed;inset:0;background:white;z-index:100000;overflow:auto;padding:16px;";
  for (const svg of svgs) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    img.style.cssText = "width:100%;max-width:1500px;display:block;";
    review.append(img);
  }
  document.body.append(review);
  window.tomMovingRecord = record;
  return status;
}
