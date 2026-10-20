import {beatTime} from "../../model/model";
import { savedLoopSlots, LOOP_SLOT_COUNT } from "./loop-slots";
import { gridPhase } from "../score/ribbon-timeline";
import {
  clamp,
  locate,
  continuousX,
  xAtBeat,
  type Song,
  type Region,
  type Loop,
} from "../../model/model";
import { displayRegion } from "../score/score-view";
import { updateNoteHighlights, notePulseBeats } from "../score/note-highlight";
import { updatePlayhead } from "./playback-ui";
import { t as i18nText } from "../../shared/i18n/i18n";
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
  return beatTime(m, (lo + hi) / 2);
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
    if (h.song().audioPractice) { h.selected(); return; }
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
  selectedIndex?: number;
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
  regionAt?: (index: number) => Region | undefined;
}) {
  const { s, t, stage, ribbon, count, loop } = h;
  const { index, measure: m, beat } = locate(s, t);
  const selected = h.selectedIndex ?? index;
  if (!m) return h.native;
  updatePlayhead(h.root, m, beat, count, s.settings.view === "ribbon");
  let native = h.native;
  if (s.settings.view === "compare") h.compare?.();
  else if (s.settings.view === "rows") {
    native = false;
    stage.classList.remove("paused-ribbon-scroll");
    h.rows(selected);
  } else {
    const x = h.offsets[index] + h.position(index, beat, h.widths[index]);
    const navigationX = h.selectedIndex === undefined ? x
      : h.offsets[selected] + h.position(selected, 0, h.widths[selected]);
    const navigationTime = h.selectedIndex === undefined ? t : s.measures[selected].start;
    stage.style.setProperty("--playhead-x", `${x}px`);
    if (!h.playing) {
      if (!native) {
        native = true;
        stage.classList.add("paused-ribbon-scroll");
        ribbon.style.transform = "none";
        stage.scrollLeft = navigationX;
      } else if (!h.scrubbing && h.stationary !== navigationTime) stage.scrollLeft = navigationX;
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
  const region = s.audioPractice ? undefined : h.regionAt?.(index) ?? displayRegion(
    s,
    s.regions.find((r) => r.id === m.regionId)!,
  );
  const next = s.measures[index + 1];
  const nextRegion =
    !s.audioPractice && next ?
    (h.regionAt?.(index + 1) ?? displayRegion(
      s,
      s.regions.find((r) => r.id === next.regionId)!,
    )) : undefined;
  // Cross printed bar margins continuously, but never bridge two screen rows.
  const currentCell = ribbon.querySelector<HTMLElement>(`[data-index="${index}"]`);
  const nextCell = ribbon.querySelector<HTMLElement>(`[data-index="${index + 1}"]`);
  const sameRow = s.settings.uniformSpacing && s.settings.view === "rows"
    ? !!nextCell && currentCell?.closest(".browse-row") === nextCell.closest(".browse-row")
    : index % 4 !== 3;
  const nextStart = !s.audioPractice && next && sameRow
    ? 1 + xAtBeat(nextRegion!, next, 0) * (s.settings.uniformSpacing && currentCell && nextCell ? nextCell.offsetWidth / currentCell.offsetWidth : 1)
    : 1;
  const playedThrough = index + (s.audioPractice ? beat / m.beats : s.settings.uniformSpacing
    ? gridPhase(beat * 4 / m.denominator, m.beats * 4 / m.denominator)
    : continuousX(region!, m, beat, 1, nextStart));
  const savedRanges = savedLoopSlots(s).slice(0, LOOP_SLOT_COUNT).filter((range): range is Loop => !!range);
  ribbon.querySelectorAll<HTMLElement>("[data-index]").forEach((e) => {
    const measureIndex = Number(e.dataset.index);
    const active = measureIndex === selected;
    const progress = s.settings.view === "ribbon"
      ? clamp((h.offsets[index] + h.position(index, beat, h.widths[index]) - h.offsets[measureIndex]) / h.widths[measureIndex], 0, 1)
      : clamp(playedThrough - measureIndex, 0, 1);
    e.style.setProperty("--played", `${progress * 100}%`);
    e.classList.toggle("progress-edge", s.settings.view === "rows" &&
      playedThrough >= measureIndex && playedThrough < measureIndex + 1);
    const barLoop = loop,
      bar = s.measures[measureIndex];
    e.classList.toggle("has-saved-loop", savedRanges.some(range => bar.end > range.start && bar.start < range.end));
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
      e.querySelector(".measure-beat")!.textContent = bar.audioPrelude ? "" :
        `${count && selected === index ? i18nText("main.message246") : ""}${selected !== index ? 1 : count || Math.min(m.beats, Math.floor(beat) + 1)}`;
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
