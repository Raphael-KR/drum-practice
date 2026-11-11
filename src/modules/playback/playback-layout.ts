import {
  type Song,
  type Measure,
  type Region,
  clamp,
  continuousX,
  xAtBeat,
} from "../../model/model";
import { displayRegion } from "../score/score-view";
import {
  practiceStaffLayout,
  staffFrameHeight,
  type StaffPosition,
} from "../score/practice-staff-layout";
export interface RowState {
  rowWindow: number;
  pausedBrowseIndex: number;
  renderedBrowseWidth: number;
  playbackRowOrigin: number;
}
interface RowHost {
  stage: HTMLElement;
  ribbon: HTMLElement;
  song: () => Song;
  playing: boolean;
  scrubbing: boolean;
  resume: boolean;
  measureHTML: (m: Measure, i: number, w: number) => string;
  cellWidth?: number;
}
export function engravingHeight(stageWidth: number, zoom: number) {
  return (clamp(stageWidth * 0.245, 170, 340) * zoom) / 2;
}
/** 100% shows sixteen quarter notes; uniform glyph scale at every zoom. */
function ribbonHeight(width: number, zoom: number, staff?: StaffPosition) {
  return staff?.ribbonQuarterInGaps
    ? (((width / 16) * zoom) / staff.ribbonQuarterInGaps) *
        staffFrameHeight(staff)
    : engravingHeight(width, zoom);
}
export function scoreLayout(
  s: Song,
  r: Region,
  width: number,
  stageWidth: number,
  staff?: StaffPosition,
) {
  if (!staff) return undefined;
  const layout = practiceStaffLayout(
    r,
    staff,
    width,
    s.settings.view === "rows"
      ? clamp(width * 0.52, 100, 180)
      : ribbonHeight(stageWidth, s.settings.zoom, staff),
    s.settings.view === "rows" || !!staff.nativePageRatio,
  );
  if (s.settings.view === "ribbon") {
    const [x, y] = layout.position.split(" ").map(parseFloat);
    return {
      ...layout,
      height: layout.height + 24,
      staffMiddle: layout.staffMiddle + 24,
      position: `${x}px ${y + 24}px`,
    };
  }
  return layout;
}
export function measureWidth(
  s: Song,
  r: Region,
  stageWidth: number,
  ratio: number,
  staff?: StaffPosition,
) {
  const height = ribbonHeight(stageWidth, s.settings.zoom, staff);
  return staff
    ? (r.w * height) / (staffFrameHeight(staff) * staff.gap * ratio)
    : (height * r.w) / r.h / ratio;
}
/** Linear timeline position; phase * width is the shared note-head offset. */
export function ribbonPosition(
  width: number,
  beat: number,
  beats: number,
  phase: number,
) {
  return width * (phase + beat / beats);
}
export function measurePosition(
  s: Song,
  index: number,
  beat: number,
  width: number,
  widthOf: (m: Measure) => number,
) {
  const m = s.measures[index],
    next = s.measures[index + 1];
  const region = (m: Measure) =>
    displayRegion(
      s,
      s.regions.find((r) => r.id === m.regionId)!,
    );
  return continuousX(
    region(m),
    m,
    beat,
    width,
    width + (next ? widthOf(next) * xAtBeat(region(next), next, 0) : 0),
  );
}
export function renderScoreRows(h: RowHost, state: RowState, index: number) {
  const { stage, ribbon, song, measureHTML, playing, scrubbing, resume } = h;
  let { rowWindow, pausedBrowseIndex, renderedBrowseWidth } = state;
  const { playbackRowOrigin } = state;
  try {
    if (!playing && !resume) {
      const stableBrowse =
        rowWindow === -2 &&
        (h.cellWidth ?? stage.clientWidth / 4) === renderedBrowseWidth;
      // Restore chronological browsing, retaining the active row's screen slot.
      const visible =
        rowWindow >= 0
          ? [
              ...ribbon.querySelectorAll<HTMLElement>(
                "[data-index], .empty-measure",
              ),
            ].map((e) => Number(e.dataset.index))
          : [];
      const wasLower = visible.slice(4, 8).includes(index);
      if (rowWindow !== -2) {
        rowWindow = -2;
        pausedBrowseIndex = -1;
        renderedBrowseWidth = NaN;
        stage.classList.add("paused-score-scroll");
      }
      const width = h.cellWidth ?? stage.clientWidth / 4;
      if (width !== renderedBrowseWidth) {
        pausedBrowseIndex = -1;
        renderedBrowseWidth = width;
        const measures = song().measures;
        ribbon.innerHTML = Array.from(
          { length: Math.ceil(measures.length / 4) },
          (_, row) =>
            `<div class="browse-row"><div class="browse-strip">${Array.from(
              { length: 4 },
              (_, j) => {
                const i = row * 4 + j;
                return i >= 0 && i < measures.length
                  ? measureHTML(measures[i], i, width)
                  : `<div class="measure empty-measure" style="width:${width}px"></div>`;
              },
            ).join("")}</div></div>`,
        ).join("");
      }
      if (!scrubbing && pausedBrowseIndex !== index) {
        pausedBrowseIndex = index;
        // A keyboard move between the two visible rows changes selection only.
        // Real geometry also respects manual scrolling; newly built/resized rows
        // still follow the selected measure using the existing alignment below.
        const selected = ribbon.querySelector<HTMLElement>(
          `[data-index="${index}"]`,
        );
        const cellBounds = selected?.getBoundingClientRect();
        const stageBounds = stage.getBoundingClientRect();
        if (
          stableBrowse &&
          cellBounds &&
          cellBounds.height > 0 &&
          stageBounds.height > 0 &&
          cellBounds.top >= stageBounds.top - 1 &&
          cellBounds.bottom <= stageBounds.bottom + 1
        )
          return;
        const keepLower =
          wasLower ||
          (stableBrowse &&
            !!cellBounds &&
            stageBounds.height > 0 &&
            cellBounds.bottom > stageBounds.bottom + 1);
        const topRow = Math.max(
          0,
          Math.min(
            Math.floor(index / 4) - (keepLower ? 1 : 0),
            Math.max(0, Math.ceil(song().measures.length / 4) - 2),
          ),
        );
        const row = ribbon.querySelector<HTMLElement>(
          `[data-index="${topRow * 4}"]`,
        );
        stage.scrollTop = Math.max(
          0,
          (row?.closest<HTMLElement>(".browse-row")?.offsetTop || 0) - 28,
        );
      }
      return;
    }
    if (stage.classList.contains("paused-score-scroll")) {
      stage.classList.remove("paused-score-scroll");
      stage.scrollTop = 0;
      pausedBrowseIndex = -1;
      rowWindow = -1;
    }
    const windowIndex = Math.floor(index / 4);
    const width = h.cellWidth ?? stage.clientWidth / 4;
    if (windowIndex === rowWindow && renderedBrowseWidth === width) return;
    const reuse = rowWindow >= 0 && renderedBrowseWidth === width;
    renderedBrowseWidth = width;
    rowWindow = windowIndex;
    const s = song();
    const currentOnTop = (windowIndex - playbackRowOrigin) % 2 === 0;
    const lastRow = Math.ceil(s.measures.length / 4) - 1;
    const atLastRow = lastRow > 0 && windowIndex === lastRow;
    const upper = atLastRow
        ? lastRow - 1
        : currentOnTop
          ? windowIndex
          : windowIndex + 1,
      lower = atLastRow
        ? lastRow
        : currentOnTop
          ? windowIndex + 1
          : windowIndex;
    const indices = [
      ...Array.from({ length: 4 }, (_, j) => upper * 4 + j),
      ...Array.from({ length: 4 }, (_, j) => lower * 4 + j),
    ];
    // Preserve all four slots when the upcoming final row is incomplete.
    const html = (i: number) =>
      i < s.measures.length
        ? measureHTML(s.measures[i], i, width)
        : `<div class="measure empty-measure" style="width:${width}px"></div>`;
    const uniform = s.scoreFormat === "musicxml" && s.settings.uniformSpacing;
    const parents = uniform
      ? [
          ...ribbon.querySelectorAll<HTMLElement>(
            ":scope > .browse-row > .browse-strip",
          ),
        ]
      : [ribbon];
    if (reuse && parents.length === (uniform ? 2 : 1)) {
      const existing = new Map(
        [...ribbon.querySelectorAll<HTMLElement>("[data-index]")].map(
          (cell) => [Number(cell.dataset.index), cell],
        ),
      );
      const missing = indices.filter((i) => !existing.has(i));
      const template = document.createElement("template");
      template.innerHTML = missing.map(html).join("");
      const created = [...template.content.children];
      missing.forEach((i, j) => existing.set(i, created[j] as HTMLElement));
      // Retain the currently playing row and its image/highlight DOM. Only the
      // outgoing row needs new cells; final-row swaps move the same nodes.
      parents.forEach((parent, row) => {
        const cells = (
          uniform ? indices.slice(row * 4, row * 4 + 4) : indices
        ).map((i) => existing.get(i)!);
        const wanted = new Set(cells);
        for (const cell of [...parent.children])
          if (!wanted.has(cell as HTMLElement)) cell.remove();
        cells.forEach((cell, i) => {
          if (parent.children[i] !== cell)
            parent.insertBefore(cell, parent.children[i] ?? null);
        });
      });
    } else {
      ribbon.innerHTML = uniform
        ? [indices.slice(0, 4), indices.slice(4)]
            .map(
              (row) =>
                `<div class="browse-row"><div class="browse-strip">${row.map(html).join("")}</div></div>`,
            )
            .join("")
        : indices.map(html).join("");
    }
  } finally {
    Object.assign(state, {
      rowWindow,
      pausedBrowseIndex,
      renderedBrowseWidth,
      playbackRowOrigin,
    });
  }
}
