import { t as i18nText } from "../../shared/i18n/i18n";
import { normalizeDrumScore } from "./drum-legend";
import { renderMusicXMLEngine } from "./musicxml-engine";
import {
  extractMusicXMLRegions,
  measureMusicXMLSystems,
} from "./musicxml-geometry";
import { finishMusicXMLGlyphs } from "./musicxml-glyphs";
import { parseMusicXML, readMusicXML } from "./musicxml-parse";
import { ribbonSpacing, type RibbonSpacing } from "./ribbon-engraving";
import { RIBBON_TIMELINE_VERSION } from "./ribbon-timeline";
import { compressSVG, displayPage } from "./score-pages";
import { embedScoreTextFonts, loadScoreTextFonts } from "./score-text-font";
import { prepareScoreLyrics } from "./score-lyrics";
import type { Song } from "../../model/model";

// Preserve the existing public import paths for readers and callers.
export { interpolateX } from "./musicxml-geometry";
export {
  parseMusicXML,
  readMusicXML,
  type XMLMeasure,
  type XMLScore,
} from "./musicxml-parse";

/** One pass owns its temporary host through font embedding, compression and geometry extraction. */
async function renderMusicXMLPass(
  source: string,
  progress: (s: string) => void,
  partId?: string,
  timeline?: RibbonSpacing,
  fullScoreSong?: Song,
  measureLyrics = new Map<number, string>(),
) {
  const xml = normalizeDrumScore(source);
  const parsed = parseMusicXML(xml, partId);
  progress(i18nText("musicxml.message412"));
  const scoreFonts = await loadScoreTextFonts();
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-20000px;top:0;width:1500px;pointer-events:none;";
  document.body.append(host);
  try {
    const { osmd, renderDocument, positionedWords, lyricLabels } =
      await renderMusicXMLEngine(
        host,
        parsed,
        timeline,
        fullScoreSong,
        measureLyrics,
      );
    const svgs = finishMusicXMLGlyphs(
      host,
      osmd,
      renderDocument,
      parsed,
      timeline,
    );
    const systemBounds = measureMusicXMLSystems(
      osmd,
      svgs,
      positionedWords,
      lyricLabels,
    );
    const pages = await Promise.all(
      svgs.map((svg) => {
        const copy = svg.cloneNode(true) as SVGSVGElement;
        copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        embedScoreTextFonts(copy, scoreFonts);
        return compressSVG(new XMLSerializer().serializeToString(copy));
      }),
    );
    const { regions, staffs } = extractMusicXMLRegions(
      osmd,
      parsed,
      svgs,
      systemBounds,
      timeline,
    );
    return {
      pages,
      regions,
      parsed,
      staffs,
      spacing: timeline ?? ribbonSpacing(osmd),
    };
  } finally {
    host.remove();
  }
}

/** One continuous full-score pass; its layout never feeds playback engraving. */
export async function renderFullScore(
  xml: string,
  song: Song,
  partId?: string,
) {
  const { cachedScoreRender, scoreRenderKey, SCORE_RENDER_POLICY } =
    await import("./score-render-cache");
  const parsed = parseMusicXML(xml, partId);
  if (parsed.measures.length !== song.measures.length)
    throw Error(
      `Full-score structure mismatch: XML=${parsed.measures.length}, song=${song.measures.length}, part=${parsed.partId}`,
    );
  const mismatch = parsed.measures.findIndex(
    (m, i) =>
      m.beats !== song.measures[i].beats ||
      m.denominator !== song.measures[i].denominator,
  );
  if (mismatch >= 0) {
    const xmlMeasure = parsed.measures[mismatch],
      songMeasure = song.measures[mismatch];
    throw Error(
      `Full-score meter mismatch: measure=${songMeasure.label}, XML=${xmlMeasure.beats}/${xmlMeasure.denominator}, song=${songMeasure.beats}/${songMeasure.denominator}, part=${parsed.partId}`,
    );
  }
  const key = await scoreRenderKey(
    JSON.stringify([
      xml,
      song.measures.map((m) => m.id),
      song.measureLyrics ?? [],
      song.artist ?? "",
      song.bpm,
    ]),
    parsed.partId,
    `${SCORE_RENDER_POLICY}:full-score-continuous-v10-xml-system-width`,
  );
  const { value } = await cachedScoreRender(key, () => {
    const lyrics = prepareScoreLyrics(xml, parsed.partId, song);
    return renderMusicXMLPass(
      lyrics.xml,
      () => {},
      parsed.partId,
      undefined,
      song,
      lyrics.texts,
    );
  });
  return value;
}

/** Print-only production measurements omit playback views and persistent caching. */
export async function renderPrintedScore(
  blob: Blob,
  progress: (s: string) => void,
  partId?: string,
) {
  const text = await readMusicXML(blob);
  const parsed = parseMusicXML(text, partId);
  return prepareMusicXMLRenderer(text, progress, parsed.partId)();
}

function prepareMusicXMLRenderer(
  source: string,
  progress: (s: string) => void,
  partId: string,
) {
  const lyrics = prepareScoreLyrics(source, partId);
  return (timeline?: RibbonSpacing) =>
    renderMusicXMLPass(
      lyrics.xml,
      progress,
      partId,
      timeline,
      undefined,
      lyrics.texts,
    );
}

/** Preserve print pages; the optional metadata contains native, time-spaced engraving. */
async function engraveMusicXML(
  source: string,
  progress: (s: string) => void,
  partId: string,
) {
  const render = prepareMusicXMLRenderer(source, progress, partId);
  const printed = await render();
  const ribbon = await render({
    ...printed.spacing,
    // The ribbon widens the native stave for longer meters, never the glyphs.
    // A four-quarter bar retains the same native width as a two-row cell.
    quarter: printed.spacing.rowWidth! / 4,
  });
  const durations = printed.parsed.measures.map(
    (m) => (m.beats * 4) / m.denominator,
  );
  const uniformQuarters = Math.max(...durations);
  // Rows reserve glyph clearance and distribute remaining space by time.
  // Do not reuse the ribbon global shortest-duration spacing for row glyph size.
  const rows = await render({
    ...printed.spacing,
    uniformQuarters,
  });
  const grid = await render({
    ...printed.spacing,
    uniformQuarters,
    fixedGrid: true,
  });
  const document = new DOMParser().parseFromString(
    await (await displayPage(printed.pages[0])).text(),
    "image/svg+xml",
  );
  const metadata = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "metadata",
  );
  metadata.setAttribute(
    "data-ribbon-timeline",
    String(RIBBON_TIMELINE_VERSION),
  );
  metadata.textContent = JSON.stringify({
    version: RIBBON_TIMELINE_VERSION,
    grid: {
      version: RIBBON_TIMELINE_VERSION,
      ...printed.spacing,
      uniformQuarters,
      regions: grid.regions,
      staffs: grid.staffs,
      pages: await Promise.all(
        grid.pages.map(async (p) => (await displayPage(p)).text()),
      ),
    },
    rows: {
      version: RIBBON_TIMELINE_VERSION,
      ...printed.spacing,
      uniformQuarters,
      regions: rows.regions,
      staffs: rows.staffs,
      pages: await Promise.all(
        rows.pages.map(async (p) => (await displayPage(p)).text()),
      ),
    },
    ...ribbon.spacing,
    regions: ribbon.regions,
    printStaffs: printed.staffs,
    staffs: ribbon.staffs,
    pages: await Promise.all(
      ribbon.pages.map(async (page) => (await displayPage(page)).text()),
    ),
  });
  document.documentElement.append(metadata);
  printed.pages[0] = await compressSVG(
    new XMLSerializer().serializeToString(document),
  );
  return {
    pages: printed.pages,
    regions: printed.regions,
    parsed: printed.parsed,
  };
}

/** Shared browser engraving. Cache is derived from source, never from bundled SVG. */
export async function renderMusicXML(
  blob: Blob,
  progress: (s: string) => void,
  partId?: string,
) {
  const { cachedScoreRender, scoreRenderKey } =
    await import("./score-render-cache");
  const text = await readMusicXML(blob);
  const parsed = parseMusicXML(text, partId);
  const key = await scoreRenderKey(text, parsed.partId);
  const start = performance.now();
  const { value, hit } = await cachedScoreRender(key, () =>
    engraveMusicXML(text, progress, parsed.partId),
  );
  performance.measure(hit ? "score-render:cache-hit" : "score-render:cold", {
    start,
    detail: { key, measures: parsed.measures.length },
  });
  return { ...value, parsed };
}
