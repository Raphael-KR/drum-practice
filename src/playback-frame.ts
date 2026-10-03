import {
  clamp,
  locate,
  continuousX,
  xAtBeat,
  type Song,
  type Loop,
} from "./model";
import { displayRegion } from "./score-view";
import { updateNoteHighlights, notePulseBeats } from "./note-highlight";
import { updatePlayhead } from "./playback-ui";
import { t as i18nText } from "./i18n";
import { engravingHeight } from "./playback-layout";
export function resizeScoreStage(
  stage: HTMLElement,
  ribbon: HTMLElement,
  s: Song,
) {
  const height =
    Math.max(
      s.settings.view === "rows" && stage.closest(".drawer-playback") ? (stage.clientHeight - 84) / 2 - 30 : 0,
      s.settings.view === "rows" && stage.closest(".drawer-playback") ? 0 : 100,
      ...Array.from(ribbon.querySelectorAll<HTMLElement>(".crop"), (e) =>
        parseFloat(e.style.height),
      ),
    ) + 30;
  stage.style.setProperty("--row-content-height", `${height}px`);
  stage.style.setProperty("--browse-row-pitch", `${height + 28}px`);
  stage.style.height = `${s.settings.view === "ribbon" ? Math.max(engravingHeight(stage.clientWidth, s.settings.zoom), ...Array.from(ribbon.querySelectorAll<HTMLElement>(".crop"), e => parseFloat(e.style.height) || 0)) + 94 : height * 2 + 84}px`;
}
export function timeAtScroll(
  s: Song,
  x: number,
  offsets: number[],
  widths: number[],
  position: (i: number, b: number, w: number) => number,
) {
  if (!offsets.length || !widths.length) return undefined;
  let i = Math.max(
    0,
    offsets.findIndex((_, j) => j === offsets.length - 1 || x < offsets[j + 1]),
  );
  const m = s.measures[i];
  if (!m) return undefined;
  let lo = 0,
    hi = m.beats;
  for (let n = 0; n < 20; n++) {
    const mid = (lo + hi) / 2;
    if (position(i, mid, widths[i]) < x - offsets[i]) lo = mid;
    else hi = mid;
  }
  return m.start + ((m.end - m.start) * (lo + hi)) / 2 / m.beats;
}
export function installScoreScroll(
  stage: HTMLElement,
  h: {
    enabled: () => boolean;
    song: () => Song;
    offsets: number[];
    widths: number[];
    position: (i: number, b: number, w: number) => number;
    seek: (t: number) => void;
    selected: () => void;
  },
) {
  const listener = () => {
    if (!h.enabled()) return;
    const x = stage.scrollLeft;
    // Frame alignment also emits scroll. Only a new viewport position is a
    // user seek; otherwise the final audio position becomes a score position.
    const alignedX = Number.parseFloat(stage.style.getPropertyValue("--scroll-x"));
    if (Number.isFinite(alignedX) && x === alignedX) return;
    stage.style.setProperty("--scroll-x", `${x}px`);
    const t = timeAtScroll(h.song(), x, h.offsets, h.widths, h.position);
    if (t !== undefined) {
      h.seek(t);
      h.selected();
    }
  };
  stage.addEventListener("scroll", listener);
  return () => stage.removeEventListener("scroll", listener);
}
export function updateScoreFrame(h: {
  root: HTMLElement;
  stage: HTMLElement;
  ribbon: HTMLElement;
  s: Song;
  t: number;
  playing: boolean;
  count: number;
  loop?: Loop;
  highlight: boolean;
  native: boolean;
  scrubbing: boolean;
  stationary?: number;
  offsets: number[];
  widths: number[];
  position: (i: number, b: number, w: number) => number;
  rows: (i: number) => void;
  compare?: () => void;
}) {
  const { s, t, stage, ribbon, count, loop } = h;
  const { index, measure: m, beat } = locate(s, t);
  if (!m) return h.native;
  updatePlayhead(h.root, m, beat, count, s.settings.view === "ribbon");
  let native = h.native;
  if (s.settings.view === "compare") h.compare?.();
  else if (s.settings.view === "rows") {
    native = false;
    stage.classList.remove("paused-ribbon-scroll");
    h.rows(index);
  } else {
    const x = h.offsets[index] + h.position(index, beat, h.widths[index]);
    if (!h.playing) {
      if (!native) {
        native = true;
        stage.classList.add("paused-ribbon-scroll");
        ribbon.style.transform = "none";
        stage.scrollLeft = x;
      } else if (!h.scrubbing && h.stationary !== t) stage.scrollLeft = x;
      stage.style.setProperty("--scroll-x", `${stage.scrollLeft}px`);
    } else {
      native = false;
      stage.classList.remove("paused-ribbon-scroll");
      stage.scrollLeft = 0;
      stage.style.setProperty("--scroll-x", "0px");
      ribbon.style.transform = `translateX(${stage.clientWidth / 3 - x}px)`;
    }
  }
  updateNoteHighlights(
    ribbon,
    index,
    beat,
    !!count,
    h.highlight,
    notePulseBeats(m.beats, m.end - m.start, s.settings.rate),
  );
  const region = displayRegion(
    s,
    s.regions.find((r) => r.id === m.regionId)!,
  );
  const next = s.measures[index + 1];
  const nextRegion =
    next &&
    displayRegion(
      s,
      s.regions.find((r) => r.id === next.regionId)!,
    );
  // Cross printed bar margins continuously, but never bridge two screen rows.
  const nextStart =
    next && index % 4 !== 3 ? 1 + xAtBeat(nextRegion!, next, 0) : 1;
  const playedThrough = index + continuousX(region, m, beat, 1, nextStart);
  ribbon.querySelectorAll<HTMLElement>("[data-index]").forEach((e) => {
    const measureIndex = Number(e.dataset.index);
    const active = measureIndex === index;
    if (s.settings.view === "rows") {
      const progress = clamp(playedThrough - measureIndex, 0, 1);
      e.style.setProperty("--played", `${progress * 100}%`);
      e.classList.toggle(
        "progress-edge",
        playedThrough >= measureIndex && playedThrough < measureIndex + 1,
      );
    }
    const barLoop = loop,
      bar = s.measures[measureIndex];
    e.classList.toggle(
      "in-loop",
      !!barLoop && bar.end > barLoop.start && bar.start < barLoop.end,
    );
    e.classList.toggle(
      "loop-start",
      !!barLoop && barLoop.start >= bar.start && barLoop.start < bar.end,
    );
    e.classList.toggle(
      "loop-end",
      !!barLoop && barLoop.end > bar.start && barLoop.end <= bar.end,
    );
    e.classList.toggle("active", active);
    if (active) {
      e.querySelector(".measure-beat")!.textContent =
        `${count ? i18nText("main.message246") : ""}${count || Math.min(m.beats, Math.floor(beat) + 1)}`;
    }
  });
  return native;
}
export function buildScoreTrack(
  stage: HTMLElement,
  ribbon: HTMLElement,
  s: Song,
  offsets: number[],
  widths: number[],
  widthOf: (m: Song["measures"][number]) => number,
  render: (m: Song["measures"][number], i: number, w: number) => string,
) {
  offsets.length = widths.length = 0;
  let x = 0;
  ribbon.style.transform = "";
  stage.style.setProperty("--scroll-x", "0px");
  ribbon.innerHTML = s.measures
    .map((m, i) => {
      const w = s.settings.view === "rows" ? stage.clientWidth / 4 : widthOf(m);
      offsets.push(x);
      widths.push(w);
      x += w;
      return render(m, i, w);
    })
    .join("");
  resizeScoreStage(stage, ribbon, s);
}
