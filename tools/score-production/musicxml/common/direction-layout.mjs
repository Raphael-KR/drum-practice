/** Production SVG layout only. XML onset/offset and note glyphs never change. */
export function layoutSectionDirections(svg, audit, pageIndex) {
  const rect = (e) => {
    const b = e.getBBox();
    return { x: b.x, y: b.y, w: b.width, h: b.height };
  };
  const overlaps = (a, b, gap = 8) =>
    a.x < b.x + b.w + gap &&
    a.x + a.w + gap > b.x &&
    a.y < b.y + b.h + gap &&
    a.y + a.h + gap > b.y;
  const measure = (i) =>
    [...svg.querySelectorAll(".vf-measure")].find(
      (g) =>
        g.querySelector(`[data-note-measure="${i}"]`) || g.id === String(i + 1),
    );
  const staff = (g) => {
    for (const p of g.children) {
      const d = p.getAttribute("d") || "";
      if (!/^M[\d. -]+L[\d. -]+$/.test(d)) continue;
      const n = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
      if (n.length === 4 && Math.abs(n[1] - n[3]) < 0.01)
        return { x: n[0], y: n[1], right: n[2] };
    }
    throw Error(`Staff line missing: measure=${g.id}`);
  };
  const movedSections = [],
    movedDirections = [];
  const obstacles = [];
  for (const section of audit.sections) {
    const g = measure(section.measureIndex);
    if (!g) continue;
    const text = [...g.children].find(
      (t) => t.localName === "text" && t.textContent === section.text,
    );
    if (!text)
      throw Error(
        `Section missing: page=${pageIndex + 1}, measure=${section.measure}, expected=${section.text}`,
      );
    let frame = text.previousElementSibling;
    if (frame?.localName === "path" && !frame.getAttribute("d"))
      frame = frame.previousElementSibling;
    if (frame?.localName !== "rect")
      throw Error(
        `Section frame missing: measure=${section.measure}, actual=${frame?.localName}`,
      );
    const line = staff(g),
      stroke = Number(frame.getAttribute("stroke-width")) / 2;
    const dx = line.x + stroke - Number(frame.getAttribute("x"));
    for (const e of [frame, text])
      e.setAttribute("x", String(Number(e.getAttribute("x")) + dx));
    const b = rect(frame);
    b.x -= stroke;
    b.y -= stroke;
    b.w += stroke * 2;
    b.h += stroke * 2;
    obstacles.push(b);
    movedSections.push({
      ...section,
      staffLeft: line.x,
      frame: b,
      error: Math.abs(b.x - line.x),
    });
  }
  for (const instruction of audit.directions) {
    const g = measure(instruction.measureIndex);
    if (!g) continue;
    const system = g.closest(".staffline");
    if (!system)
      throw Error(`Staff system missing: measure=${instruction.measure}`);
    const texts = [...system.querySelectorAll("g.vf-text > text")].filter(
      (t) =>
        t.textContent === instruction.text &&
        !t.hasAttribute("data-direction-layout"),
    );
    const line = staff(g);
    const grouped = new Map();
    for (const text of texts) {
      const b = rect(text),
        key = `${Math.round(b.x * 100)},${Math.round(b.y * 100)}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(text);
    }
    const groups = [...grouped.values()].sort(
      (a, b) =>
        Math.abs(rect(a[0]).x - line.x) - Math.abs(rect(b[0]).x - line.x),
    );
    const native = groups[0];
    if (!native)
      throw Error(
        `Direction missing: page=${pageIndex + 1}, measure=${instruction.measure}, expected=${instruction.text}`,
      );
    const notes = [
      ...system.querySelectorAll(".vf-stavenote[data-note-measure]"),
    ]
      .map((n) => {
        const head = n.querySelector(".vf-notehead");
        if (!head) throw Error(`Notehead missing: ${n.id}`);
        const b = rect(head);
        return {
          index: Number(n.getAttribute("data-note-measure")),
          beat: Number(n.getAttribute("data-note-beat")),
          x: b.x + b.w / 2,
        };
      })
      .filter(
        (n) =>
          n.index > instruction.measureIndex ||
          (n.index === instruction.measureIndex &&
            n.beat >= instruction.beat - 1e-7),
      )
      .sort((a, b) => a.index - b.index || a.beat - b.beat || a.x - b.x)
      .filter(
        (n, i, a) =>
          !i || n.index !== a[i - 1].index || n.beat !== a[i - 1].beat,
      );
    if (!notes.length)
      throw Error(
        `No target or following note in system: measure=${instruction.measure}, beat=${instruction.beat}`,
      );
    const source = rect(native[0]);
    const section = movedSections.find(
      (s) => s.measureIndex === instruction.measureIndex,
    );
    const y = section
      ? section.frame.y + section.frame.h / 2 - source.h / 2
      : line.y - 70;
    const systemRight = Math.max(
      ...[...system.querySelectorAll(".vf-measure")].map((m) => staff(m).right),
    );
    let chosen;
    for (let lane = 0; lane < 6 && !chosen; lane++) {
      for (const note of lane ? notes.slice(0, 1) : notes) {
        const b = {
          x: note.x,
          y: y - lane * (source.h + 8),
          w: source.w,
          h: source.h,
        };
        if (
          b.x + b.w > systemRight + 0.1 ||
          b.y < 0 ||
          obstacles.some((o) => overlaps(b, o))
        )
          continue;
        chosen = { note, b, lane };
        break;
      }
    }
    if (!chosen)
      throw Error(
        `No nonoverlapping placement: measure=${instruction.measure}, textWidth=${source.w}, right=${systemRight}`,
      );
    for (const text of native) {
      const b = rect(text);
      text.setAttribute(
        "x",
        String(Number(text.getAttribute("x")) + chosen.b.x - b.x),
      );
      text.setAttribute(
        "y",
        String(Number(text.getAttribute("y")) + chosen.b.y - b.y),
      );
      text.setAttribute("data-direction-layout", "note-anchor-v1");
      text.setAttribute("data-applies-measure", instruction.measure);
      text.setAttribute("data-applies-beat", String(instruction.beat));
    }
    const actual = rect(native[0]);
    const collisions = obstacles.filter((o) => overlaps(actual, o, 7.9));
    if (collisions.length)
      throw Error(
        `Placement collision: measure=${instruction.measure}, actual=${JSON.stringify(actual)}, obstacles=${JSON.stringify(collisions)}`,
      );
    obstacles.push(actual);
    movedDirections.push({
      ...instruction,
      visualMeasureIndex: chosen.note.index,
      visualBeat: chosen.note.beat,
      appliedBeat: instruction.beat,
      lane: chosen.lane,
      targetX: chosen.note.x,
      bounds: actual,
      anchorError: Math.abs(actual.x - chosen.note.x),
      nativeNodes: native.length,
    });
  }
  return {
    page: pageIndex + 1,
    sections: movedSections,
    directions: movedDirections,
  };
}
