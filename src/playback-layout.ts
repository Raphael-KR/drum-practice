import {
  type Song,
  type Measure,
  type Region,
  clamp,
  continuousX,
  xAtBeat,
} from "./model";
import { displayRegion } from "./score-view";
import { packLabels } from "./lyric-layout";
import {
  practiceStaffLayout,
  staffFrameHeight,
  type StaffPosition,
} from "./practice-staff-layout";
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
  layoutLyrics: () => void;
}
export function engravingHeight(stageWidth: number, zoom: number) {
  return (clamp(stageWidth * 0.245, 170, 340) * zoom) / 2;
}
export function scoreLayout(
  s: Song,
  r: Region,
  width: number,
  stageWidth: number,
  staff?: StaffPosition,
) {
  if (!staff) return undefined;
  return practiceStaffLayout(
    r,
    staff,
    width,
    s.settings.view === "rows"
      ? clamp(width * 0.52, 100, 180)
      : engravingHeight(stageWidth, s.settings.zoom),
  );
}
export function measureWidth(
  s: Song,
  r: Region,
  stageWidth: number,
  ratio: number,
  staff?: StaffPosition,
) {
  const height = engravingHeight(stageWidth, s.settings.zoom);
  return staff
    ? (r.w * height) / (staffFrameHeight(staff) * staff.gap * ratio)
    : (height * r.w) / r.h / ratio;
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
  const {
    stage,
    ribbon,
    song,
    measureHTML,
    layoutLyrics,
    playing,
    scrubbing,
    resume,
  } = h;
  let { rowWindow, pausedBrowseIndex, renderedBrowseWidth, playbackRowOrigin } =
    state;
  try {
    if (!playing && !resume) {
      if (rowWindow !== -2) {
        rowWindow = -2;
        pausedBrowseIndex = -1;
        renderedBrowseWidth = NaN;
        stage.classList.add("paused-score-scroll");
      }
      const width = stage.clientWidth / 4;
      if (width !== renderedBrowseWidth) {
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
        layoutLyrics();
      }
      if (!scrubbing && pausedBrowseIndex !== index) {
        pausedBrowseIndex = index;
        const row = ribbon.querySelector<HTMLElement>(
          `[data-index="${Math.floor(index / 4) * 4}"]`,
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
    if (windowIndex === rowWindow) return;
    rowWindow = windowIndex;
    const s = song();
    const currentOnTop = (windowIndex - playbackRowOrigin) % 2 === 0;
    const upper = currentOnTop ? windowIndex : windowIndex + 1,
      lower = currentOnTop ? windowIndex + 1 : windowIndex;
    const indices = [
      ...Array.from({ length: 4 }, (_, j) => upper * 4 + j),
      ...Array.from({ length: 4 }, (_, j) => lower * 4 + j),
    ];
    ribbon.innerHTML = indices
      .filter((i) => i < s.measures.length)
      .map((i) => measureHTML(s.measures[i], i, stage.clientWidth / 4))
      .join("");
    layoutLyrics();
  } finally {
    Object.assign(state, {
      rowWindow,
      pausedBrowseIndex,
      renderedBrowseWidth,
      playbackRowOrigin,
    });
  }
}
export function layoutScoreLyrics(
  stage: HTMLElement,
  ribbon: HTMLElement,
  view: string,
) {
  const rows = new Map<number, { el: HTMLElement; rect: DOMRect }[]>();
  ribbon.querySelectorAll<HTMLElement>(".syllable").forEach((el) => {
    el.style.top = "0px";
    el.style.marginLeft = "0px";
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const row =
      el.closest<HTMLElement>(".browse-row")?.offsetTop ??
      el.closest<HTMLElement>(".measure")!.offsetTop;
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row)!.push({ el, rect });
  });
  for (const items of rows.values()) {
    const positions = packLabels(
      items.map(({ rect }) => ({ left: rect.left, width: rect.width })),
      2,
      // Clamp to the row content edge, not the moving viewport in ribbon mode.
      view === "rows"
        ? (items[0].el
            .closest<HTMLElement>(".browse-strip")
            ?.getBoundingClientRect().left ??
            stage.getBoundingClientRect().left) + 4
        : ribbon.getBoundingClientRect().left + 4,
    );
    const baseline = Math.max(...items.map(({ rect }) => rect.top));
    items.forEach(({ el, rect }, i) => {
      el.style.marginLeft = `${positions[i] - rect.left}px`;
      el.style.top = `${baseline - rect.top}px`;
    });
  }
}
