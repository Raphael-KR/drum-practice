import { displayPage } from "./score-pages";

export const NOTE_HIGHLIGHT_VERSION = "2";
const NS = "http://www.w3.org/2000/svg";
let clipSerial = 0;

/** Keep OSMD's musical onset attached to its exact SVG glyph, not a pixel estimate. */
export function annotateNoteHighlights(osmd: any, denominators: number[]) {
  for (const [index, row] of osmd.GraphicSheet.MeasureList.entries()) {
    const measure = row[0];
    if (!measure) continue;
    const points: { beat: number; x: number }[] = [];
    const beams = new Map<SVGGraphicsElement, any>();
    const notePoints = new Map<any, Point>();
    for (const entry of measure.staffEntries) {
      const beat = entry.relInMeasureTimestamp.RealValue * denominators[index];
      for (const voice of entry.graphicalVoiceEntries)
        for (const note of voice.notes) {
          const stemX = note.vfnote?.[0]?.getStemX?.();
          if (Number.isFinite(stemX))
            notePoints.set(note.sourceNote, { beat, x: stemX });
          if (note.sourceNote.isRest()) continue;
          const group = note.getSVGGElement?.() as
            SVGGraphicsElement | undefined;
          if (!group) continue;
          group.setAttribute("data-note-measure", String(index));
          group.setAttribute("data-note-beat", String(beat));
          const stem = note.getStemSVG?.() as SVGGraphicsElement | undefined;
          if (stem && !group.contains(stem)) {
            stem.setAttribute("data-note-measure", String(index));
            stem.setAttribute("data-note-beat", String(beat));
          }
          const head = note.getNoteheadSVGs?.()[note.vfnote?.[1]] as
            SVGGraphicsElement | undefined;
          const box = (stem || head || group).getBBox();
          const point = {
            beat,
            x: Number.isFinite(stemX) ? stemX : box.x + box.width / 2,
          };
          points.push(point);
          notePoints.set(note.sourceNote, point);
          for (const beam of note.getBeamSVGs?.() || [])
            beams.set(beam, note.sourceNote.NoteBeam);
        }
    }
    const sorted = points
      .sort((a, b) => a.beat - b.beat || a.x - b.x)
      .filter((p, i, a) => !i || p.beat !== a[i - 1].beat);
    for (const [beam, sourceBeam] of beams) {
      const connected: Point[] = (sourceBeam?.Notes || [])
        .map((n: any) => notePoints.get(n))
        .filter(Boolean)
        .sort((a: Point, b: Point) => a.beat - b.beat);
      const anchors = connected.filter(
        (p, i) => !i || p.beat !== connected[i - 1].beat,
      );
      beam.setAttribute("data-beam-measure", String(index));
      beam.setAttribute(
        "data-beam-points",
        JSON.stringify(anchors.length > 1 ? anchors : sorted),
      );
    }
  }
}

interface Point {
  beat: number;
  x: number;
}
export function beamProgressX(points: Point[], beat: number): number {
  if (!points.length) return 0;
  if (beat <= points[0].beat) return points[0].x;
  for (let i = 1; i < points.length; i++)
    if (beat < points[i].beat) {
      const a = points[i - 1],
        b = points[i];
      return a.x + ((b.x - a.x) * (beat - a.beat)) / (b.beat - a.beat);
    }
  return points[points.length - 1].x;
}

// Copy only generated graphical primitives; never insert arbitrary SVG markup into the app.
function safeGlyph(source: Element): Element | undefined {
  if (
    ![
      "g",
      "path",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
    ].includes(source.localName)
  )
    return;
  const target = document.createElementNS(NS, source.localName);
  if (source.classList.contains("vf-notehead"))
    target.setAttribute("data-light-head", "");
  for (const attr of [
    "d",
    "x",
    "y",
    "x1",
    "y1",
    "x2",
    "y2",
    "width",
    "height",
    "cx",
    "cy",
    "r",
    "rx",
    "ry",
    "points",
    "transform",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "fill-rule",
  ]) {
    if (source.hasAttribute(attr))
      target.setAttribute(attr, source.getAttribute(attr)!);
  }
  for (const attr of ["fill", "stroke"]) {
    const value = (source.getAttribute(attr) || "").toLowerCase();
    if (value)
      target.setAttribute(
        attr,
        ["none", "white", "#fff", "#ffffff"].includes(value)
          ? value
          : "currentColor",
      );
  }
  for (const child of source.children) {
    const copy = safeGlyph(child);
    if (copy) target.append(copy);
  }
  return target;
}
export interface HighlightPage {
  width: number;
  height: number;
  measures: Map<number, string>;
}
export async function highlightPage(
  blob: Blob,
): Promise<HighlightPage | undefined> {
  const page = await displayPage(blob);
  if (page.type !== "image/svg+xml") return;
  const doc = new DOMParser().parseFromString(
    await page.text(),
    "image/svg+xml",
  );
  const view = doc.documentElement
    .getAttribute("viewBox")
    ?.split(/[ ,]+/)
    .map(Number);
  if (!view || view.length !== 4) return;
  const measures = new Map<number, string>();
  for (const source of doc.querySelectorAll(
    "[data-note-measure],[data-beam-measure]",
  )) {
    const isBeam = source.hasAttribute("data-beam-measure");
    const index = Number(
      source.getAttribute(isBeam ? "data-beam-measure" : "data-note-measure"),
    );
    const copy = safeGlyph(source);
    if (!copy) continue;
    const group = document.createElementNS(NS, "g");
    // Preserve any engraving transforms between the glyph and page root.
    const ancestors: Element[] = [];
    for (
      let p = source.parentElement;
      p && p !== doc.documentElement;
      p = p.parentElement
    )
      ancestors.unshift(p);
    let parent: Element = group;
    for (const ancestor of ancestors)
      if (ancestor.hasAttribute("transform")) {
        const g = document.createElementNS(NS, "g");
        g.setAttribute("transform", ancestor.getAttribute("transform")!);
        parent.append(g);
        parent = g;
      }
    if (isBeam) {
      group.setAttribute(
        "data-highlight-beam",
        source.getAttribute("data-beam-points")!,
      );
    } else
      group.setAttribute(
        "data-highlight-beat",
        source.getAttribute("data-note-beat")!,
      );
    parent.append(copy);
    if (isBeam) {
      const id = `note-beam-clip-${++clipSerial}`;
      const defs = document.createElementNS(NS, "defs"),
        clip = document.createElementNS(NS, "clipPath"),
        rect = document.createElementNS(NS, "rect");
      clip.id = id;
      clip.setAttribute("clipPathUnits", "userSpaceOnUse");
      rect.setAttribute("data-highlight-clip", "");
      rect.setAttribute("x", "-100000");
      rect.setAttribute("y", "-100000");
      rect.setAttribute("width", "0");
      rect.setAttribute("height", "200000");
      clip.append(rect);
      defs.append(clip);
      const content = document.createElementNS(NS, "g");
      content.setAttribute("clip-path", `url(#${id})`);
      content.append(...Array.from(group.childNodes));
      group.append(defs, content);
    }
    measures.set(
      index,
      (measures.get(index) || "") +
        new XMLSerializer().serializeToString(group),
    );
  }
  return { width: view[2], height: view[3], measures };
}

export function updateNoteHighlights(
  container: HTMLElement,
  index: number,
  beat: number,
  countOff = false,
  enabled = true,
  pulseBeats = 0.25,
) {
  for (const svg of container.querySelectorAll<SVGSVGElement>(
    ".note-highlight",
  )) {
    const active =
      enabled && Number(svg.dataset.highlightMeasure) === index && !countOff;
    svg.style.display = active ? "block" : "none";
    if (!active) continue;
    const notes = Array.from(
      svg.querySelectorAll<SVGElement>("[data-highlight-beat]"),
    );
    const onsets = [
      ...new Set(notes.map((n) => Number(n.dataset.highlightBeat))),
    ].sort((a, b) => a - b);
    for (const note of notes) {
      const onset = Number(note.dataset.highlightBeat);
      const next = onsets.find((b) => b > onset) ?? Infinity;
      const end = Math.min(onset + pulseBeats, next);
      const progress = Math.max(
        0,
        Math.min(1, (beat - onset) / Math.max(0.001, end - onset)),
      );
      note.style.opacity = String(1 - progress * progress);
      note.style.visibility =
        beat + 1e-7 >= onset && beat < end - 1e-7 ? "visible" : "hidden";
    }
    for (const beam of svg.querySelectorAll<SVGElement>(
      "[data-highlight-beam]",
    )) {
      const points: Point[] = JSON.parse(beam.dataset.highlightBeam!);
      const x = beamProgressX(points, beat),
        left = beamProgressX(points, beat - pulseBeats);
      // A moving light band, rather than accumulating color behind the playhead.
      const clip = beam.querySelector("[data-highlight-clip]");
      clip?.setAttribute("x", String(left));
      clip?.setAttribute("width", String(Math.max(0, x - left)));
    }
  }
}

/** About 140ms in real playback time, capped at a sixteenth-note beat span. */
export function notePulseBeats(
  beats: number,
  measureSeconds: number,
  rate: number,
) {
  return Math.min(
    0.25,
    ((0.14 * beats) / Math.max(0.001, measureSeconds)) * rate,
  );
}
