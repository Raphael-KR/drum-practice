import { renderMeasure } from "../../../../src/modules/playback/playback-measure.ts";
import playbackCSS from "../../../../src/modules/playback/styles/01-score-transport.css?inline";
import interactionCSS from "../../../../src/modules/playback/styles/04-interaction.css?inline";
import {
  activeScore,
  useScore,
} from "../../../../src/modules/score/song-scores.ts";
import { displayPage } from "../../../../src/modules/score/score-pages.ts";
import { displayRegion } from "../../../../src/modules/score/score-view.ts";
import { lyricMeasureId } from "../../../../src/modules/lyrics/lyric-grid.ts";
import { xAtBeat } from "../../../../src/model/model.ts";

const activeReviews = new WeakMap();
const LABEL_HEIGHT = 28;
const LYRIC_HEIGHT = 48;
const LYRIC_GAP = 6;
// CSSStyleDeclaration serializes decimal px values differently across browsers.
export const REVIEW_ANCHOR_TOLERANCE_PX = 0.05;

/** Numbers are one-based positions in record.song.measures; strings are stable IDs. */
export function planScoreReview(record, options = {}) {
  const active = activeScore(record);
  const defaultAlternate = (record.otherScores ?? []).findIndex(
    (s) => s.format !== active.format,
  );
  const alternateIndex =
    options.alternateIndex === undefined
      ? defaultAlternate < 0
        ? null
        : defaultAlternate
      : options.alternateIndex;
  let alternate;
  if (alternateIndex !== null) {
    if (
      !Number.isInteger(alternateIndex) ||
      alternateIndex < 0 ||
      !record.otherScores?.[alternateIndex]
    )
      throw Error(
        `Invalid review alternateIndex=${alternateIndex}; available alternates=${record.otherScores?.length ?? 0}`,
      );
    alternate = record.otherScores[alternateIndex];
    useScore(record, alternate); // Validate correspondence without changing record.
  }
  const variants = [active, ...(alternate ? [alternate] : [])];
  const source = variants.find((s) => s.format === "pdf") ?? active;
  const svg = variants.find((s) => s.format === "musicxml");
  const song = useScore(record, source).song;
  song.settings = { ...song.settings, view: "rows" };
  const groups = [];
  if (options.measureGroups !== undefined) {
    if (!Array.isArray(options.measureGroups) || !options.measureGroups.length)
      throw Error(
        `Review measureGroups must contain at least one group; received ${Array.isArray(options.measureGroups) ? options.measureGroups.length : typeof options.measureGroups}`,
      );
    for (const [groupIndex, group] of options.measureGroups.entries()) {
      if (!Array.isArray(group) || !group.length)
        throw Error(
          `Review measure group ${groupIndex + 1} is empty or not an array`,
        );
      const indices = group.map((value) => {
        const index =
          typeof value === "string"
            ? song.measures.findIndex((m) => m.id === value)
            : Number.isInteger(value)
              ? value - 1
              : -1;
        if (index < 0 || index >= song.measures.length)
          throw Error(
            `Unknown review measure: ${value}; expected position 1..${song.measures.length} or existing measure ID`,
          );
        return index;
      });
      if (new Set(indices).size !== indices.length)
        throw Error(
          `Duplicate measure within review group ${groupIndex + 1}: ${group.join(", ")}`,
        );
      groups.push(indices);
    }
  } else {
    // Source systems are geometry boundaries, never a hard-coded bar count.
    let previous;
    for (const [i, measure] of song.measures.entries()) {
      const region = song.regions.find((r) => r.id === measure.regionId);
      if (!region) throw Error(`Missing review region: ${measure.id}`);
      if (
        !previous ||
        region.page !== previous.page ||
        Math.abs(region.y - previous.y) > 1e-6 ||
        Math.abs(region.h - previous.h) > 1e-6 ||
        region.x <= previous.x
      )
        groups.push([]);
      groups.at(-1).push(i);
      previous = region;
    }
  }
  if (!groups.length) throw Error("Review requires score measures");
  const rowWidth = options.rowWidth ?? 1200;
  if (!Number.isFinite(rowWidth) || rowWidth < 200 || rowWidth > 5000)
    throw Error(`Review rowWidth=${rowWidth}; expected 200..5000 CSS pixels`);
  return {
    song,
    source,
    svg,
    groups,
    rowWidth,
    alternateIndex: alternate ? alternateIndex : null,
  };
}

const reviewCSS = `
:host { color-scheme: light; --accent: #2458a0; --muted: #536171; --line: #d4dae2; }
* { box-sizing: border-box; }
.review { background: white; color: #17212f; font: 15px/1.4 system-ui, sans-serif; min-height: 100%; }
header { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: white; border-bottom: 1px solid #d4dae2; }
h1 { font-size: 18px; margin: 0; flex: 1; }
button { color: #17212f; background: white; border: 1px solid #b8c1cd; border-radius: 8px; min-width: 44px; min-height: 44px; font: inherit; cursor: pointer; }
button:focus-visible { outline: 3px solid #2458a0; }
.body { padding: 20px; width: max-content; min-width: 100%; }
h2 { margin: 0 0 12px; font-size: 16px; }
.review-group { margin: 0 0 20px; background: white; }
.review-row { display: flex; position: relative; padding-top: ${LABEL_HEIGHT}px; background: white; }
.review-row > .measure { position: relative; flex: none; box-sizing: content-box; border: 0; cursor: default; background: white; }
.review-row .label { top: -${LABEL_HEIGHT}px; left: 6px; height: ${LABEL_HEIGHT}px; line-height: ${LABEL_HEIGHT}px; color: #536171; background: white; }
.review-row .crop { position: absolute; top: 0; left: 0; background-color: white; background-repeat: no-repeat; }
.review-row .lyrics { height: ${LYRIC_HEIGHT}px; line-height: 22px; color: #2458a0; background: white; }
.review-row .syllable { color: #2458a0; }
.review-row .measure-state-layer, .review-row .measure-marker { display: none; }
.review-pages { margin-top: 28px; }
figure { margin: 0 0 24px; background: white; }
figcaption { margin-bottom: 8px; }
.review-page { display: block; max-width: none; background: white; }
`;

/**
 * Temporary, read-only local editor inspection. No fetch, DB, cache, save or
 * engraving calls. Only package page blobs and the app's real measure component.
 * Caller must keep code edits/builds finished before browser review.
 */
export async function mountScoreReview(record, options = {}) {
  const doc = globalThis.document;
  if (!doc?.body)
    throw Error("Score review requires the loaded editor document");
  const viewportWidth =
    doc.documentElement.clientWidth || doc.defaultView?.innerWidth;
  const rowWidth =
    options.rowWidth ??
    (viewportWidth > 0
      ? Math.max(200, Math.min(1200, viewportWidth - 40))
      : undefined);
  const plan = planScoreReview(record, { ...options, rowWidth });
  const urls = [];
  const pagesByScore = new Map();
  const rows = [];
  const pageViews = [];
  let disposed = false;
  const previousFocus =
    activeReviews.get(doc)?.previousFocus ?? doc.activeElement;
  const host = doc.createElement("dialog");
  host.dataset.scoreProductionReview = record.song.id;
  host.setAttribute("aria-label", `${record.song.title} 악보 검수`);
  Object.assign(host.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    maxWidth: "none",
    maxHeight: "none",
    margin: "0",
    padding: "0",
    border: "0",
    overflow: "auto",
    background: "white",
    color: "#17212f",
  });
  const shadowHost = doc.createElement("div");
  host.append(shadowHost);
  const root = shadowHost.attachShadow({ mode: "open" });
  const style = doc.createElement("style");
  style.textContent = playbackCSS + interactionCSS + reviewCSS;
  root.append(style);
  const surface = doc.createElement("div");
  surface.className = "review";
  const header = doc.createElement("header");
  const title = doc.createElement("h1");
  title.textContent = `${record.song.title} · 악보 검수`;
  const close = doc.createElement("button");
  close.type = "button";
  close.textContent = "×";
  close.setAttribute("aria-label", "검수 닫기");
  const body = doc.createElement("div");
  body.className = "body";
  header.append(title, close);
  surface.append(header, body);
  root.append(surface);

  function dispose() {
    if (disposed) return;
    disposed = true;
    const hadFocus = host.contains(doc.activeElement);
    if (host.open) host.close();
    host.remove();
    urls.splice(0).forEach((url) => URL.revokeObjectURL(url));
    if (activeReviews.get(doc)?.element === host) activeReviews.delete(doc);
    if (hadFocus && previousFocus?.isConnected)
      previousFocus.focus?.({ preventScroll: true });
  }
  close.addEventListener("click", dispose);
  host.addEventListener("close", dispose);
  host.addEventListener("cancel", (event) => {
    event.preventDefault();
    dispose();
  });
  // Keep the editor's delegated keyboard/pointer commands out of this view.
  for (const name of ["click", "pointerdown", "pointerup", "keydown", "keyup"])
    host.addEventListener(name, (event) => event.stopPropagation());

  try {
    for (const score of new Set([
      plan.source,
      ...(plan.svg ? [plan.svg] : []),
    ])) {
      const decoded = [];
      for (const [index, blob] of score.pages.entries()) {
        const url = URL.createObjectURL(await displayPage(blob));
        urls.push(url);
        const image = new globalThis.Image();
        image.src = url;
        try {
          await image.decode();
        } catch (cause) {
          throw Error(
            `Review ${score.format} page ${index + 1} decode failed`,
            {
              cause,
            },
          );
        }
        if (!(image.naturalWidth > 0 && image.naturalHeight > 0))
          throw Error(`Review ${score.format} page ${index + 1} has no size`);
        decoded.push({
          url,
          width: image.naturalWidth,
          height: image.naturalHeight,
          ratio: image.naturalHeight / image.naturalWidth,
        });
      }
      pagesByScore.set(score, decoded);
    }
    const sourcePages = pagesByScore.get(plan.source);
    for (const [groupIndex, indices] of plan.groups.entries()) {
      const group = doc.createElement("section");
      group.className = "review-group";
      const heading = doc.createElement("h2");
      heading.textContent = `${plan.source.format === "pdf" ? "PDF" : "MusicXML SVG"} · ${indices.map((i) => plan.song.measures[i].label).join(", ")}마디`;
      const row = doc.createElement("div");
      row.className = "review-row";
      row.dataset.reviewGroup = String(groupIndex);
      row.style.width = `${plan.rowWidth}px`;
      const regions = indices.map((i) =>
        displayRegion(
          plan.song,
          plan.song.regions.find(
            (r) => r.id === plan.song.measures[i].regionId,
          ),
        ),
      );
      const totalWidth = regions.reduce((sum, r) => sum + r.w, 0);
      const cells = indices.map((i, column) => {
        const measure = plan.song.measures[i];
        const region = regions[column];
        const width = (plan.rowWidth * region.w) / totalWidth;
        const page = sourcePages[region.page];
        const cropHeight = (width / region.w) * region.h * page.ratio;
        const lyrics = plan.song.lyrics.filter(
          (lyric) => lyricMeasureId(plan.song, lyric) === measure.id,
        );
        const template = doc.createElement("template");
        template.innerHTML = renderMeasure({
          s: plan.song,
          m: measure,
          i,
          width,
          r: region,
          ly: lyrics,
          pageURL: page.url,
          pageRatio: page.ratio,
          isSVG: plan.source.format === "musicxml",
          positionInMeasure: (_, beat, w) => w * xAtBeat(region, measure, beat),
        });
        const element = template.content.firstElementChild;
        row.append(element);
        return { i, region, width, cropHeight, lyrics, element };
      });
      const cellHeight =
        Math.max(...cells.map((cell) => cell.cropHeight)) +
        LYRIC_GAP +
        LYRIC_HEIGHT;
      cells.forEach((cell) => {
        cell.element.style.height = `${cellHeight}px`;
      });
      row.style.height = `${LABEL_HEIGHT + cellHeight}px`;
      group.append(heading, row);
      body.append(group);
      rows.push({ element: row, cells, groupIndex });
    }
    if (plan.svg && options.showSVGPages !== false) {
      const section = doc.createElement("section");
      section.className = "review-pages";
      const heading = doc.createElement("h2");
      heading.textContent = "MusicXML SVG · 패키지 전체 페이지";
      section.append(heading);
      for (const [index, page] of pagesByScore.get(plan.svg).entries()) {
        const figure = doc.createElement("figure");
        const caption = doc.createElement("figcaption");
        caption.textContent = `${index + 1} / ${plan.svg.pages.length}쪽`;
        const image = doc.createElement("img");
        image.className = "review-page";
        image.alt = `${record.song.title} MusicXML SVG ${index + 1}쪽`;
        image.src = page.url;
        image.style.width = `${plan.rowWidth}px`;
        image.style.height = `${plan.rowWidth * page.ratio}px`;
        figure.append(caption, image);
        section.append(figure);
        pageViews.push({
          page: index + 1,
          width: page.width,
          height: page.height,
        });
      }
      body.append(section);
    }

    function report() {
      const failures = [];
      let expectedAnchors = 0;
      let checkedAnchors = 0;
      let unanchoredLyrics = 0;
      let maxAnchorErrorPx = 0;
      let layoutObserved = !disposed;
      let previousBottom;
      const rowReports = rows.map(({ element, cells, groupIndex }) => {
        const rect = element.getBoundingClientRect();
        const observed = rect.width > 0 && rect.height > 0;
        layoutObserved &&= observed;
        if (
          observed &&
          previousBottom !== undefined &&
          rect.top < previousBottom - 0.5
        )
          failures.push({ code: "row-overlap", group: groupIndex + 1 });
        if (observed) previousBottom = rect.bottom;
        for (const cell of cells) {
          const fail = (code, extra = {}) =>
            failures.push({
              code,
              group: groupIndex + 1,
              measure: cell.i + 1,
              ...extra,
            });
          const crop = cell.element.querySelector(".crop");
          const lyrics = cell.element.querySelector(".lyrics");
          const height = parseFloat(cell.element.style.height);
          const lyricTop = parseFloat(lyrics?.style.top ?? "");
          const rowHeight = parseFloat(element.style.height);
          const cropHeight = parseFloat(crop?.style.height ?? "");
          if (
            !crop ||
            !lyrics ||
            !Number.isFinite(height) ||
            !Number.isFinite(rowHeight) ||
            !Number.isFinite(lyricTop) ||
            !Number.isFinite(cropHeight) ||
            height + 0.05 < cell.cropHeight + LYRIC_GAP + LYRIC_HEIGHT ||
            rowHeight + 0.05 < LABEL_HEIGHT + height ||
            lyricTop + 0.05 < cropHeight
          )
            fail("row-height-insufficient", {
              details: {
                rowHeight,
                cellHeight: height,
                cropHeight,
                lyricTop,
                requiredCellHeight: cell.cropHeight + LYRIC_GAP + LYRIC_HEIGHT,
              },
            });
          if (observed && crop && lyrics) {
            const cropRect = crop.getBoundingClientRect();
            const lyricRect = lyrics.getBoundingClientRect();
            if (
              cropRect.bottom > lyricRect.top + 0.5 ||
              lyricRect.bottom > rect.bottom + 0.5
            )
              fail("row-content-overlap", {
                details: {
                  cropBottom: cropRect.bottom,
                  lyricTop: lyricRect.top,
                  lyricBottom: lyricRect.bottom,
                  rowBottom: rect.bottom,
                },
              });
            for (const text of lyrics.querySelectorAll(
              ".syllable, .measure-lyric",
            )) {
              const textRect = text.getBoundingClientRect();
              if (textRect.bottom > rect.bottom + 0.5)
                fail("lyric-row-overlap", {
                  details: {
                    lyricBottom: textRect.bottom,
                    rowBottom: rect.bottom,
                  },
                });
            }
          }
          if (plan.source.format !== "pdf") continue;
          const syllables = [...cell.element.querySelectorAll(".syllable")];
          cell.lyrics.forEach((lyric, index) => {
            const anchor = cell.region.lyricAnchors?.find(
              (a) => a.lyricId === lyric.id,
            );
            if (!anchor) {
              unanchoredLyrics++;
              if (options.requirePDFAnchors)
                fail("anchor-missing", { lyricId: lyric.id });
              return;
            }
            expectedAnchors++;
            if (
              lyric.scorePosition?.measureId !==
                plan.song.measures[cell.i].id ||
              Math.abs(
                anchor.quarterOffset - lyric.scorePosition.quarterOffset,
              ) >= 1e-8
            ) {
              fail("anchor-score-position-mismatch", { lyricId: lyric.id });
              return;
            }
            const span = syllables[index];
            if (
              span?.dataset.pdfLyricAnchor !== "true" ||
              span.textContent !== lyric.text ||
              !span.style.left.endsWith("px")
            ) {
              fail("anchor-not-rendered", { lyricId: lyric.id });
              return;
            }
            const errorPx = Math.abs(
              parseFloat(span.style.left) - anchor.x * cell.width,
            );
            maxAnchorErrorPx = Math.max(maxAnchorErrorPx, errorPx);
            checkedAnchors++;
            if (
              !Number.isFinite(errorPx) ||
              errorPx > REVIEW_ANCHOR_TOLERANCE_PX
            )
              fail("anchor-position-error", {
                lyricId: lyric.id,
                errorPx,
                details: {
                  actualLeftPx: parseFloat(span.style.left),
                  expectedLeftPx: anchor.x * cell.width,
                  tolerancePx: REVIEW_ANCHOR_TOLERANCE_PX,
                },
              });
          });
        }
        return {
          group: groupIndex + 1,
          measures: cells.map((c) => c.i + 1),
          height: parseFloat(element.style.height),
          bounds: observed
            ? {
                top: rect.top,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height,
              }
            : null,
        };
      });
      return {
        songId: record.song.id,
        disposed,
        rowFormat: plan.source.format,
        alternateIndex: plan.alternateIndex,
        rows: rowReports,
        svgPages: pageViews.map((p) => ({ ...p })),
        anchors: {
          expected: expectedAnchors,
          checked: checkedAnchors,
          unanchored: unanchoredLyrics,
          maxErrorPx: maxAnchorErrorPx,
          tolerancePx: REVIEW_ANCHOR_TOLERANCE_PX,
        },
        layoutObserved,
        failures,
        status: disposed
          ? "disposed"
          : failures.length
            ? "failed"
            : layoutObserved
              ? "passed"
              : "unmeasured",
      };
    }
    const controller = { element: host, root, report, dispose };
    doc.body.append(host);
    host.showModal();
    activeReviews.get(doc)?.dispose();
    close.focus({ preventScroll: true });
    activeReviews.set(doc, { ...controller, previousFocus });
    return controller;
  } catch (error) {
    dispose();
    throw error;
  }
}
