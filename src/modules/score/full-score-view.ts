import type { Measure, Region, Song } from "../../model/model";
import { t } from "../../shared/i18n/i18n";
import { layoutLyricRow } from "../lyrics/lyric-layout";
import { scoreLyricsHTML } from "../lyrics/score-lyrics";
import { fullScoreLabels } from "./full-score-labels";

interface PageOptions {
  svg: string;
  url: string;
  alt: string;
  page: number;
  song: Song;
  score: {
    regions: Region[];
    measures: Pick<Measure, "id" | "regionId">[];
  };
}

/** Slice only the displayed page; original SVG bytes and stored geometry stay intact. */
export function fullScoreSurface({
  svg,
  url,
  alt,
  page,
  song,
  score,
}: PageOptions) {
  const surface = document.createElement("div");
  surface.className = "full-score-page";
  surface.setAttribute("role", "group");
  surface.setAttribute("aria-label", alt);
  const documentSVG = new DOMParser().parseFromString(svg, "image/svg+xml");
  const view = documentSVG.documentElement
    .getAttribute("viewBox")
    ?.trim()
    .split(/[ ,]+/)
    .map(Number);
  const image = () => {
    const img = document.createElement("img");
    img.src = url;
    img.alt = alt;
    return img;
  };
  if (!view || view.length !== 4 || !(view[2] > 0 && view[3] > 0)) {
    console.warn("Full-score SVG viewBox unavailable; showing original page", {
      page,
      viewBox: view,
    });
    surface.append(image());
    return surface;
  }
  const [, , width, height] = view;
  const regions = new Map(
    score.regions.filter((r) => r.page === page).map((r) => [r.id, r]),
  );
  const measures = new Map(song.measures.map((m) => [m.id, m]));
  const cells = score.measures.flatMap((reference) => {
    const region = regions.get(reference.regionId),
      measure = measures.get(reference.id);
    return region && measure ? [{ region, measure }] : [];
  });
  const labels = fullScoreLabels(documentSVG, cells);
  function band(start: number, end: number) {
    if (end <= start) return;
    const slice = document.createElement("div");
    slice.className = "full-score-band";
    slice.style.aspectRatio = `${width} / ${(end - start) * height}`;
    const crop = document.createElement("div");
    crop.className = "full-score-band-image";
    const img = image();
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.style.top = `${(-start / (end - start)) * 100}%`;
    img.style.height = `${100 / (end - start)}%`;
    crop.append(img);
    slice.append(crop);
    for (const position of labels) {
      const top = position.top / 100;
      if (top < start || top >= end) continue;
      const label = document.createElement("span");
      label.className = "full-score-measure-label";
      label.textContent = position.label;
      label.setAttribute(
        "aria-label",
        t("marker-slots.message378", { value1: position.label }),
      );
      label.style.left = `${position.left}%`;
      label.style.top = `${((top - start) / (end - start)) * 100}%`;
      slice.append(label);
    }
    surface.append(slice);
  }
  if (!song.lyrics.length && !song.measureLyrics?.length) {
    band(0, 1);
    return surface;
  }
  const rows: {
    top: number;
    bottom: number;
    cells: { region: Region; measure: Measure }[];
  }[] = [];
  for (const { region, measure } of cells) {
    // Print regions from one system share their vertical crop bounds.
    let row = rows.find((r) => Math.abs(r.top - region.y) * height < 0.5);
    if (!row) {
      row = { top: region.y, bottom: region.y + region.h, cells: [] };
      rows.push(row);
    }
    row.bottom = Math.max(row.bottom, region.y + region.h);
    row.cells.push({ region, measure });
  }
  let start = 0;
  for (const row of rows.sort((a, b) => a.top - b.top)) {
    const lyrics = document.createElement("div");
    lyrics.className = "full-score-lyric-row";
    for (const { region, measure } of row.cells.sort(
      (a, b) => a.region.x - b.region.x,
    )) {
      const html = scoreLyricsHTML({
        song,
        measure,
        region,
        width: region.w * width,
        isSVG: true,
      });
      if (!html) continue;
      const cell = document.createElement("div");
      cell.className = "full-score-lyric-measure";
      cell.dataset.measureId = measure.id;
      cell.style.left = `${region.x * 100}%`;
      cell.style.width = `${region.w * 100}%`;
      cell.innerHTML = html;
      lyrics.append(cell);
    }
    if (!lyrics.childElementCount) continue;
    const end = Math.min(1, Math.max(start, row.bottom));
    band(start, end);
    surface.append(lyrics);
    start = end;
  }
  band(start, 1);
  return surface;
}

function layoutFullScoreLyrics(root: HTMLElement) {
  for (const row of root.querySelectorAll<HTMLElement>(
    ".full-score-lyric-row",
  )) {
    const bounds = row.getBoundingClientRect();
    if (!bounds.width) continue;
    const items = [...row.querySelectorAll<HTMLElement>(".syllable")]
      .map((el) => {
        el.style.top = "0px";
        el.style.marginLeft = "0px";
        return { el, rect: el.getBoundingClientRect() };
      })
      .filter(({ rect }) => rect.width > 0 && rect.height > 0);
    layoutLyricRow(items, bounds.left + 4, bounds.right - 4);
    let bottom = 0;
    for (const { el } of items)
      bottom = Math.max(bottom, el.getBoundingClientRect().bottom - bounds.top);
    // If both forms exist, reserve another line for untimed measure text.
    const centered = row.querySelectorAll<HTMLElement>(".measure-lyric");
    for (const el of centered)
      el.style.marginTop = items.length ? `${bottom + 2}px` : "0px";
    for (const el of centered)
      bottom = Math.max(bottom, el.getBoundingClientRect().bottom - bounds.top);
    row.style.height = `${Math.ceil(bottom)}px`;
  }
}

/** Repack on opening/font readiness/width changes, never on playback ticks or scrolling. */
export function observeFullScoreLyrics(root: HTMLElement) {
  if (!root.querySelector(".full-score-lyric-row")) return () => {};
  let active = true,
    width = -1;
  const refresh = () => {
    if (active && root.isConnected) layoutFullScoreLyrics(root);
  };
  const observer = new ResizeObserver((entries) => {
    const next = entries[0]?.contentRect.width;
    if (next === undefined || next === width) return;
    width = next;
    refresh();
  });
  observer.observe(root);
  refresh();
  void document.fonts?.ready.then(refresh);
  return () => {
    active = false;
    observer.disconnect();
  };
}
