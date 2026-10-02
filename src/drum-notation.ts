import { t as i18nText } from "./i18n";
import halfOpenGlyph from './vendor/pict-half-open.json';
/** Approved SCORE-MUSICXML-OSMD-MAPPING.md: render-only annotations retain XML semantics. */
export type NoteDecoration = {
  ghost: boolean;
  sticking?: string;
  halfOpen?: boolean;
  color: string;
};
const kids = (e: Element, tag: string) =>
  Array.from(e.children).filter((x) => x.localName === tag);
export function prepareDrumDecorations(
  doc: Document,
): Map<string, NoteDecoration> {
  const decorations = new Map<string, NoteDecoration>();
  let serial = 1,
    divisions = 1;
  for (const measure of Array.from(doc.querySelectorAll("part > measure"))) {
    let time = 0,
      previous = 0;
    const notes: { node: Element; time: number; voice: string }[] = [];
    const marks: {
      node: Element;
      time: number;
      voice: string;
      value: string;
    }[] = [];
    for (const e of Array.from(measure.children)) {
      const duration =
        Number(e.querySelector("duration")?.textContent || 0) / divisions;
      if (e.localName === "attributes")
        divisions = Number(
          e.querySelector("divisions")?.textContent || divisions,
        );
      if (e.localName === "backup") time -= duration;
      if (e.localName === "forward") time += duration;
      if (e.localName === "direction")
        for (const w of Array.from(
          e.querySelectorAll("direction-type > words"),
        )) {
          const value = w.textContent?.trim() || "";
          if (/^[RL]$/.test(value))
            marks.push({
              node: w,
              time:
                time +
                Number(e.querySelector("offset")?.textContent || 0) / divisions,
              voice: e.querySelector("voice")?.textContent || "",
              value,
            });
        }
      if (e.localName === "note") {
        const chord = !!e.querySelector("chord");
        if (!chord) previous = time;
        notes.push({
          node: e,
          time: chord ? previous : time,
          voice: e.querySelector("voice")?.textContent || "1",
        });
        if (!chord && !e.querySelector("grace")) time += duration;
      }
    }
    const sticks = new Map<Element, string>();
    for (const mark of marks) {
      const target = notes.find(
        (n) =>
          Math.abs(n.time - mark.time) < 1e-7 &&
          (!mark.voice || mark.voice === n.voice) &&
          n.node.querySelector("unpitched") &&
          !n.node.querySelector("rest"),
      );
      if (!target || sticks.has(target.node)) continue;
      sticks.set(target.node, mark.value);
      mark.node.remove();
    }
    for (const { node } of notes) {
      if (
        !node.querySelector("unpitched") ||
        node.getAttribute("print-object") === "no"
      )
        continue;
      let head = kids(node, "notehead")[0];
      const ghost = head?.getAttribute("parentheses") === "yes",
        sticking = sticks.get(node);
      const halfOpen = !!node.querySelector('notations > technical > half-muted[smufl="pictHalfOpen1"]');
      if (!ghost && !sticking && !halfOpen) continue;
      const color =
        head?.getAttribute("color") || node.getAttribute("color") || "#000000";
      if (!head) {
        head = doc.createElement("notehead");
        head.textContent = "normal";
        node.insertBefore(
          head,
          kids(node, "staff")[0] ||
            kids(node, "beam")[0] ||
            kids(node, "notations")[0] ||
            kids(node, "lyric")[0] ||
            null,
        );
      }
      // Unique temporary colors bind XML annotations to exact chord members across OSMD.
      const token = "#" + (0x710000 + serial++).toString(16);
      head.setAttribute("color", token);
      decorations.set(token.toLowerCase(), { ghost, sticking, color, ...(halfOpen ? {halfOpen:true} : {}) });
    }
  }
  return decorations;
}
export function applyDrumDecorations(
  host: HTMLElement,
  osmd: any,
  decorations: Map<string, NoteDecoration>,
) {
  const seen = new Set<string>();
  for (const row of osmd.GraphicSheet.MeasureList)
    for (const measure of row)
      for (const entry of measure.staffEntries)
        for (const voice of entry.graphicalVoiceEntries)
          for (const n of voice.notes) {
            const token = String(
              n.sourceNote.NoteheadColorXml || n.sourceNote.NoteheadColor || "",
            ).toLowerCase();
            const rule = decorations.get(token);
            if (!rule) continue;
            const glyph = n.getNoteheadSVGs()[
              n.vfnote[1]
            ] as SVGGraphicsElement;
            if (!glyph) throw Error(i18nText("drum-notation.message025"));
            seen.add(token);
            const b = glyph.getBBox(),
              parent = glyph.parentNode!;
            const add = (tag: string) => {
              const e = document.createElementNS(
                "http://www.w3.org/2000/svg",
                tag,
              );
              parent.appendChild(e);
              return e;
            };
            if (rule.ghost)
              for (const side of [-1, 1]) {
                const x = side < 0 ? b.x - 3 : b.x + b.width + 3,
                  y = b.y - 2,
                  h = b.height + 4;
                const p = add("path");
                p.setAttribute(
                  "d",
                  `M ${x} ${y} Q ${x + side * 5} ${y + h / 2} ${x} ${y + h}`,
                );
                p.setAttribute("fill", "none");
                p.setAttribute("stroke", rule.color);
                p.setAttribute("stroke-width", "1.4");
                p.setAttribute("data-ghost-parenthesis", "true");
              }
            if (rule.sticking) {
              const stem = n
                .getSVGGElement()
                .querySelector(".vf-stem path") as SVGGraphicsElement | null;
              const sb = stem?.getBBox();
              const t = add("text");
              t.textContent = rule.sticking;
              t.setAttribute(
                "x",
                String(sb ? sb.x + sb.width / 2 : b.x + b.width / 2),
              );
              t.setAttribute("y", String(Math.min(sb?.y ?? b.y, b.y) - 9));
              t.setAttribute("text-anchor", "middle");
              t.setAttribute("font-family", "serif");
              t.setAttribute("font-size", "16");
              t.setAttribute("fill", rule.color);
              t.setAttribute("data-sticking", rule.sticking);
            }
            if (rule.halfOpen) {
              const stem = n.getSVGGElement().querySelector('.vf-stem path') as SVGGraphicsElement | null;
              const sb = stem?.getBBox();
              const size = 10, scale = size / 286;
              const x = b.x + b.width / 2 - size / 2;
              const y = Math.min(sb?.y ?? b.y, b.y) - (rule.sticking ? 30 : 16);
              const p = add('path');
              p.setAttribute('d', halfOpenGlyph.path);
              p.setAttribute('transform', `translate(${x} ${y + size}) scale(${scale} ${-scale})`);
              p.setAttribute('fill', rule.color);
              p.setAttribute('data-smufl', halfOpenGlyph.glyph);
            }
          }
  for (const el of Array.from(host.querySelectorAll("[fill],[stroke]")))
    for (const attr of ["fill", "stroke"]) {
      const rule = decorations.get((el.getAttribute(attr) || "").toLowerCase());
      if (rule) el.setAttribute(attr, rule.color);
    }
  if (seen.size !== decorations.size)
    throw Error(i18nText("drum-notation.message026"));
}

/** Known bundled conversion only; never infer instruments from glyphs or MIDI. */
export function normalizeBundledDrumNotation(text: string) {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror"))
    throw Error(i18nText("drum-notation.message027"));
  const mapping: Record<string, [string, string, string, string]> = {
    "P1-hh": ["Closed hi-hat", "G", "5", "x"],
    "P1-hh-open": ["Open hi-hat", "G", "5", "circle-x"],
    "P1-ride": ["Ride cymbal", "F", "5", "x"],
    "P1-crash": ["Crash cymbal", "A", "5", "x"],
  };
  let changed = false;
  for (const n of Array.from(doc.querySelectorAll("part > measure > note"))) {
    const id = n.querySelector("instrument")?.getAttribute("id") || "",
      rule = mapping[id];
    if (!rule) continue;
    const instrument = Array.from(
      doc.querySelectorAll("score-instrument"),
    ).find((x) => x.id === id);
    if (instrument?.querySelector("instrument-name")?.textContent !== rule[0])
      continue;
    const u = n.querySelector("unpitched");
    if (!u) continue;
    for (const [tag, value] of [
      ["display-step", rule[1]],
      ["display-octave", rule[2]],
    ]) {
      const e = u.querySelector(tag);
      if (e && e.textContent !== value) {
        e.textContent = value;
        changed = true;
      }
    }
    const head = n.querySelector("notehead");
    if (head) {
      if (head.textContent !== rule[3]) {
        head.textContent = rule[3];
        changed = true;
      }
      if (head.hasAttribute("filled")) {
        head.removeAttribute("filled");
        changed = true;
      }
    }
  }
  return {
    text: changed ? new XMLSerializer().serializeToString(doc) : text,
    changed,
  };
}
