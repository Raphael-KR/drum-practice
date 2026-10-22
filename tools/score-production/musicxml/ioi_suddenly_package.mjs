import {
  sha,
  base64,
  saveEvidence,
  prepareCanonical,
  bindRenderedScore,
  createVerifiedPackage,
  projectBase,
} from "./common/package.mjs";
import profiles from "./profiles/songs.json";
import { renderMusicXML } from "/src/modules/score/musicxml.ts";
import { readScorePackage } from "/src/modules/library/score-package.ts";
import { defaults, validateSong } from "/src/model/model.ts";
import { projectLyrics } from "/src/modules/lyrics/lyric-score.ts";

const config = profiles["ioi-suddenly"];
const root = projectBase + config.root;
const get = async (path) => {
  const result = await fetch(root + path);
  if (!result.ok) throw Error(`Missing production input: ${path}`);
  return result;
};
const json = async (path) => (await get(path)).json();
const blob = async (path, type) =>
  new Blob([await (await get(path)).arrayBuffer()], { type });
const xmlMime = "application/vnd.recordare.musicxml+xml";

export async function build({ xmlDirectory, lyricFile, pdfRegionsFile }) {
  window.ioiBuildState.phase = "input";
  const [provenance, alignment, order, lyricReview, pdfRegions] =
    await Promise.all([
      json("input/provenance.json"),
      json("audio-analysis/audio-alignment.json"),
      json(xmlDirectory + "/measure-order.json"),
      json(lyricFile),
      json(pdfRegionsFile),
    ]);
  window.ioiBuildState.phase = "media";
  const source = await blob(
    xmlDirectory + "/playback-transcription.musicxml",
    xmlMime,
  );
  const audio = await blob("input/source.mp3", "audio/mpeg");
  const pdf = await blob("input/source.pdf", "application/pdf");
  if (
    (await sha(audio)) !== alignment.audioSHA256 ||
    (await sha(audio)) !== provenance.audio_sha256 ||
    (await sha(pdf)) !== provenance.pdf_sha256
  )
    throw Error("Original media identity mismatch");
  window.ioiBuildState.phase = "source-render";
  const rendered = await renderMusicXML(
    source,
    (s) => (window.ioiBuildState.progress = s),
    "P1",
  );
  if (
    rendered.regions.length !== config.expectedMeasures ||
    rendered.parsed.warnings.length
  )
    throw Error("Expanded score structure/warnings");
  const song = {
    version: 1,
    id: "ioi-suddenly-25750839",
    title: "갑자기",
    originalTitle: "갑자기",
    artist: "I.O.I",
    bpm: config.bpm,
    firstBeat: alignment.firstBeatEstimateSeconds,
    measures: alignment.measures.map((m, i) => ({
      id: `ioi-suddenly-m${i + 1}`,
      regionId: rendered.regions[i].id,
      label: String(i + 1),
      beats: 4,
      denominator: 4,
      start: m.start,
      end: m.end,
    })),
    regions: rendered.regions,
    lyrics: lyricReview.lyrics.map(
      ({ id, text, confirmed, scorePosition }) => ({
        id,
        text,
        confirmed,
        scorePosition,
        time: 0,
        end: 0,
      }),
    ),
    measureLyrics: (lyricReview.measureLyrics ?? []).map(
      ({ id, measureId, text, placement }) => ({
        id,
        measureId,
        text,
        placement,
      }),
    ),
    markers: order.flatMap((o, i) => {
      const section = {
        1: "Intro",
        5: "A",
        13: "B",
        21: "C",
        31: "A",
        39: "B",
        47: "C",
        56: "D",
        64: "C1",
        72: "C2",
      }[o.sourceMeasure];
      return section
        ? [
            {
              id: `ioi-section-${i + 1}`,
              name: section,
              time: alignment.measures[i].start,
            },
          ]
        : [];
    }),
    loops: [],
    settings: { ...defaults(), countIn: 0, tempoMode: "original" },
    audioName: "아이오아이 (I.O.I) - 갑자기.mp3",
    pdfName: "ioi-suddenly-final.musicxml",
    scoreFormat: "musicxml",
    scorePartId: "P1",
    pageCount: rendered.pages.length,
  };
  window.ioiBuildState.phase = "lyrics-canonical";
  projectLyrics(song);
  validateSong(song);
  const { canonicalXML, restored } = prepareCanonical(
    song,
    await source.text(),
    await sha(audio),
    (doc) => {
      const misc = doc.querySelector("identification > miscellaneous");
      const values = {
        "recording-tempo:v1": {
          version: 1,
          scoreBpm: config.bpm,
          bpmEstimate: alignment.bpmEstimate,
          firstBeatEstimateSeconds: alignment.firstBeatEstimateSeconds,
          audioSHA256: alignment.audioSHA256,
          method: alignment.method,
          status: "signal estimate; actual listening unverified",
        },
        "source-measure-map:v1": order,
        "printed-lyric-anchors:v1": {
          sourcePDFSHA256: provenance.pdf_sha256,
          positionBasis:
            lyricReview.positionBasis ??
            "Printed note/rest underlay; uncertain subdivisions retained only as measure text",
          durationBasis: lyricReview.durationBasis,
          measureOnly: lyricReview.measureLyrics.map(
            ({ sourceMeasure, evidence }) => ({ sourceMeasure, evidence }),
          ),
          unresolved: lyricReview.unresolved ?? [],
          vocalTimingVerified: false,
        },
      };
      for (const [name, value] of Object.entries(values)) {
        const field = doc.createElement("miscellaneous-field");
        field.setAttribute("name", "drum-practice:" + name);
        field.textContent = JSON.stringify(value);
        misc.append(field);
      }
    },
  );
  const signature = (lyrics) =>
    lyrics.map(({ id, text, scorePosition, time, end }) => ({
      id,
      text,
      scorePosition,
      time,
      end,
    }));
  if (
    JSON.stringify(signature(restored.lyrics)) !==
      JSON.stringify(signature(song.lyrics)) ||
    JSON.stringify(restored.measureLyrics) !==
      JSON.stringify(song.measureLyrics) ||
    restored.artist !== "I.O.I" ||
    restored.bpm !== 117
  )
    throw Error("Canonical lyric/metadata roundtrip");
  const canonical = new Blob([canonicalXML], { type: xmlMime });
  window.ioiBuildState.phase = "canonical-render";
  const final = await renderMusicXML(
    canonical,
    (s) => (window.ioiBuildState.progress = s),
    "P1",
  );
  bindRenderedScore(song, final);
  validateSong(song);
  const pdfPages = await Promise.all(
    [1, 2].map((i) => blob(`input/source-poppler-${i}.png`, "image/png")),
  );
  const variant = {
    format: "pdf",
    name: "아이오아이 (I.O.I) - 갑자기.pdf",
    source: pdf,
    pages: pdfPages,
    regions: pdfRegions,
    measures: song.measures.map((m, i) => ({
      id: m.id,
      regionId: pdfRegions[i].id,
      beats: 4,
      denominator: 4,
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
  window.ioiBuildState.phase = "package";
  const pack = await createVerifiedPackage(record);
  const loaded = await readScorePackage(pack);
  const audit = {
    status: "PASS",
    scope:
      "Common renderer, canonical musical positions and full package byte/metadata roundtrip",
    measures: 93,
    printedMeasures: 79,
    quarters: 372,
    svgPages: final.pages.length,
    lyrics: song.lyrics.length,
    measureLyrics: song.measureLyrics.length,
    artist: song.artist,
    scoreBpm: song.bpm,
    firstBeat: song.firstBeat,
    recordingBpmEstimate: alignment.bpmEstimate,
    canonicalSHA256: await sha(canonical),
    audioSHA256: await sha(audio),
    sourcePDFSHA256: await sha(pdf),
    packageSHA256: await sha(pack),
    packageBytes: pack.size,
    browser: navigator.userAgent,
    warnings: final.parsed.warnings,
    regions: final.regions,
    parsedMeasures: final.parsed.measures,
    notVerified: [
      "Actual listening/count-in ON-OFF/rate/loop playback",
      "App library save and reopen",
      "iPad playback",
    ],
  };
  await saveEvidence(
    "render",
    { ...audit, pages: await Promise.all(final.pages.map(base64)) },
    config.evidencePort,
  );
  await saveEvidence(
    "package",
    { ...audit, package: await base64(pack), canonicalXML },
    config.evidencePort,
  );
  window.ioiRecord = loaded;
  window.ioiFinal = final;
  window.ioiPackage = pack;
  return audit;
}
