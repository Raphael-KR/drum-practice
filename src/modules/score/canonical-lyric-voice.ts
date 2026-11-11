import type { Lyric, Measure } from "../../model/model";
import {
  LYRIC_DIVISIONS,
  canonicalManifest,
  type LyricVoiceIdentity,
} from "./canonical-metadata";
import {
  xmlAdd as add,
  xmlChild as child,
  xmlChildren as kids,
} from "./canonical-xml-dom";

const START = "drum-practice:lyric-voices:start";
const END = "drum-practice:lyric-voices:end";
const EPSILON = 1e-8;

/** Locate the owned block without changing it; shared by readers and replacement. */
function lyricVoiceBlock(measure: Element, voices: string[]): ChildNode[] {
  const nodes = Array.from(measure.childNodes);
  const start = nodes.findIndex(
    (n) => n.nodeType === 8 && n.nodeValue === START,
  );
  if (start < 0) {
    // Some XML tools remove comments. The manifest still identifies our voices.
    const elements = Array.from(measure.children);
    const owned = (e: Element) =>
      e.localName === "note" &&
      voices.includes(child(e, "voice")?.textContent || "");
    const first = elements.findIndex(owned);
    if (first < 0) return [];
    let last = first;
    for (let i = first + 1; i < elements.length; i++)
      if (owned(elements[i])) last = i;
    const begin =
      elements[first - 1]?.localName === "backup" ? first - 1 : first;
    const block = elements.slice(begin, last + 1);
    if (block.some((e) => e.localName !== "backup" && !owned(e)))
      throw Error(
        `Interleaved lyric voice block: measure=${measure.getAttribute("number")}, voices=${voices.join(",")}`,
      );
    return block;
  }
  const end = nodes.findIndex(
    (n, i) => i > start && n.nodeType === 8 && n.nodeValue === END,
  );
  if (end < 0)
    throw Error(
      `Incomplete lyric voice block: measure=${measure.getAttribute("number")}, end=missing`,
    );
  return nodes.slice(start, end + 1);
}

/** Read-only ownership: lyric notes and timing rests, never every hidden note. */
export function lyricVoiceNotes(part: Element): ReadonlySet<Element> {
  const data = canonicalManifest(part.ownerDocument);
  const voices =
    data?.version === 2 && data.partId === part.id
      ? data.lyrics.map((l) => l.voice)
      : [];
  const notes = new Set<Element>();
  for (const measure of kids(part, "measure"))
    for (const node of lyricVoiceBlock(measure, voices))
      if (node.nodeType === 1 && (node as Element).localName === "note")
        notes.add(node as Element);
  return notes;
}

/** Remove only our appended rhythm block, including its backup. Drum nodes stay intact. */
export function removeLyricVoices(part: Element, voices: string[] = []) {
  for (const measure of kids(part, "measure"))
    lyricVoiceBlock(measure, voices).forEach((node) => node.remove());
}

/** Shared by canonical saving and the read-only upgrade of legacy engraving input. */
export function writeLyricVoices(
  part: Element,
  song: {
    measures: Pick<Measure, "id" | "beats" | "denominator">[];
    lyrics: Lyric[];
  },
): LyricVoiceIdentity[] {
  removeLyricVoices(part);
  const lyricFontFamily = part.ownerDocument
    .querySelector("score-partwise > defaults > lyric-font")
    ?.getAttribute("font-family");
  const measures = kids(part, "measure");
  if (measures.length !== song.measures.length)
    throw Error(
      `Lyric measure count: XML=${measures.length}, song=${song.measures.length}, part=${part.id}`,
    );
  const offsets: number[] = [];
  let total = 0;
  song.measures.forEach((m) => {
    offsets.push(total);
    total += (m.beats * 4) / m.denominator;
  });
  const usedVoices = new Set(
    Array.from(part.querySelectorAll("voice"), (e) => e.textContent || "1"),
  );
  usedVoices.add("1"); // Notes without an explicit voice belong to voice 1.
  const ids = new Set(
    Array.from(part.ownerDocument.querySelectorAll("[id]"), (e) => e.id),
  );
  let nextVoice = 1,
    nextId = 1;
  const lanes: { voice: string; end: number }[] = [];
  const rows = song.lyrics
    .map((lyric, index) => {
      const p = lyric.scorePosition;
      const mi = song.measures.findIndex((m) => m.id === p?.measureId);
      if (!p || mi < 0)
        throw Error(
          `Missing lyric position: lyric=${lyric.id}, measure=${p?.measureId}`,
        );
      const start = offsets[mi] + p.quarterOffset;
      const end = Math.min(total, start + p.durationQuarters);
      if (
        start < 0 ||
        !Number.isFinite(start + end) ||
        end <= start ||
        start >= total
      )
        throw Error(
          `Invalid lyric interval: lyric=${lyric.id}, start=${start}, end=${end}, total=${total}`,
        );
      return { lyric, index, start, end, voice: "", noteId: "" };
    })
    .sort((a, b) => a.start - b.start || a.index - b.index);
  for (const row of rows) {
    let lane = lanes.find((l) => l.end <= row.start + EPSILON);
    if (!lane) {
      while (usedVoices.has(String(nextVoice))) nextVoice++;
      lane = { voice: String(nextVoice++), end: 0 };
      lanes.push(lane);
    }
    lane.end = row.end;
    row.voice = lane.voice;
    while (ids.has(`dp-lyric-${nextId}`)) nextId++;
    row.noteId = `dp-lyric-${nextId++}`;
    ids.add(row.noteId);
  }
  let sourceDivisions = 1,
    outputDivisions = 1;
  measures.forEach((measure, index) => {
    const length =
      (song.measures[index].beats * 4) / song.measures[index].denominator;
    const events = rows.filter(
      (r) =>
        r.start < offsets[index] + length - EPSILON &&
        r.end > offsets[index] + EPSILON,
    );
    const timing = measureTiming(measure, sourceDivisions);
    sourceDivisions = timing.divisions;
    // Keep existing units when they can express every lyric boundary exactly.
    // Otherwise rescale durations and offsets together; never round drum rhythm.
    const values = events.flatMap((r) => [
      Math.max(0, r.start - offsets[index]),
      Math.min(length, r.end - offsets[index]),
    ]);
    let divisions = timing.divisions;
    if (
      values.some(
        (q) => Math.abs(q * divisions - Math.round(q * divisions)) > EPSILON,
      )
    )
      divisions = lcm(divisions, LYRIC_DIVISIONS);
    for (const unit of timing.units) divisions = lcm(divisions, unit.divisions);
    for (const unit of timing.units) {
      if (unit.divisions !== divisions)
        unit.element.textContent = String(
          (unit.value * divisions) / unit.divisions,
        );
    }
    const declarations = Array.from(
      measure.querySelectorAll("attributes > divisions"),
    );
    if (declarations.length)
      declarations.forEach((e) => (e.textContent = String(divisions)));
    else if (divisions !== outputDivisions) {
      const attributes =
        child(measure, "attributes") ||
        measure.insertBefore(
          measure.ownerDocument.createElement("attributes"),
          measure.firstChild,
        );
      const div = add(attributes, "divisions", divisions);
      attributes.prepend(div);
    }
    outputDivisions = divisions;
    if (!events.length) return;
    const d = measure.ownerDocument;
    const block = d.createElement("measure");
    block.append(d.createComment(START));
    let cursor = timing.cursor;
    for (const lane of lanes) {
      const laneEvents = events.filter((r) => r.voice === lane.voice);
      if (!laneEvents.length) continue;
      if (cursor > EPSILON)
        add(add(block, "backup"), "duration", Math.round(cursor * divisions));
      cursor = 0;
      const rest = (until: number) => {
        if (until - cursor <= EPSILON) return;
        const n = add(block, "note", undefined, {
          "print-object": "no",
          dynamics: "0",
        });
        add(n, "rest");
        add(n, "duration", Math.round((until - cursor) * divisions));
        add(n, "voice", lane.voice);
        cursor = until;
      };
      for (const row of laneEvents) {
        const start = Math.max(0, row.start - offsets[index]);
        const end = Math.min(length, row.end - offsets[index]);
        rest(start);
        const begins = Math.abs(row.start - offsets[index] - start) < EPSILON;
        const n = add(block, "note", undefined, {
          "print-object": "no",
          "print-lyric": "yes",
          dynamics: "0",
          ...(begins ? { id: row.noteId } : {}),
        });
        const unpitched = add(n, "unpitched");
        add(unpitched, "display-step", "C");
        add(unpitched, "display-octave", "4");
        add(n, "duration", Math.round((end - start) * divisions));
        add(n, "voice", lane.voice);
        const lyric = add(n, "lyric", undefined, { name: "pronunciation" });
        if (begins) {
          add(lyric, "syllabic", "single");
          add(
            lyric,
            "text",
            row.lyric.text,
            lyricFontFamily ? { "font-family": lyricFontFamily } : {},
          );
        } else add(lyric, "extend", undefined, { type: "continue" });
        cursor = end;
      }
      rest(length);
    }
    block.append(d.createComment(END));
    const finalBarline = kids(measure, "barline").find(
      (e) => (e.getAttribute("location") || "right") === "right",
    );
    for (const n of Array.from(block.childNodes))
      measure.insertBefore(n, finalBarline || null);
  });
  return rows
    .sort((a, b) => a.index - b.index)
    .map(({ lyric, voice, noteId }) => ({
      id: lyric.id,
      confirmed: lyric.confirmed,
      voice,
      noteId,
    }));
}

function lcm(a: number, b: number): number {
  if (a === b) return a;
  // MusicXML also allows decimal divisions. Use exact decimal integer multiples
  // before finding shared units instead of rejecting an otherwise valid score.
  const integerMultiple = (value: number) => {
    const [mantissa, exponent = "0"] = String(value).split("e");
    const fractionLength = mantissa.split(".")[1]?.length || 0;
    return (
      Number(mantissa.replace(".", "")) *
      10 ** Math.max(0, Number(exponent) - fractionLength)
    );
  };
  const first = integerMultiple(a),
    second = integerMultiple(b);
  let x = first,
    y = second;
  while (y) [x, y] = [y, x % y];
  const result = (first / x) * second;
  if (!Number.isSafeInteger(result))
    throw Error(`Unsupported lyric time resolution: divisions=${a}, ${b}`);
  return result;
}
function measureTiming(measure: Element, inherited: number) {
  let divisions = inherited,
    cursor = 0;
  const units: { element: Element; value: number; divisions: number }[] = [];
  for (const e of Array.from(measure.children)) {
    const div = e.localName === "attributes" && child(e, "divisions");
    if (div) divisions = Number(div.textContent);
    if (!Number.isFinite(divisions) || divisions <= 0)
      throw Error(
        `Invalid lyric divisions: measure=${measure.getAttribute("number")}, divisions=${divisions}`,
      );
    for (const unit of e.querySelectorAll("duration, offset"))
      units.push({ element: unit, value: Number(unit.textContent), divisions });
    const duration = Number(child(e, "duration")?.textContent || 0) / divisions;
    if (e.localName === "backup") cursor -= duration;
    else if (
      e.localName === "forward" ||
      (e.localName === "note" && !child(e, "chord"))
    )
      cursor += duration;
  }
  return { cursor, divisions, units };
}
