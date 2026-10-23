/** Read-only SVG measurements and MusicXML display-only offset fitting. */
import { renderMusicXML } from "/src/modules/score/musicxml.ts";
import { displayPage } from "/src/modules/score/score-pages.ts";
import { SCORE_RENDER_POLICY } from "/src/modules/score/score-render-cache.ts";
import { SCORE_TEXT_FONT_FAMILY } from "/src/modules/score/score-text-font.ts";

const STEP = 1 / 16;
const EPS = 1e-5;
const fail = (label, actual) => {
  throw Error(`${label}: actual=${JSON.stringify(actual)}`);
};
const intersects = (a, b, gap = 0) =>
  a.x < b.x + b.w + gap - EPS &&
  a.x + a.w + gap > b.x + EPS &&
  a.y < b.y + b.h + gap - EPS &&
  a.y + a.h + gap > b.y + EPS;
const box = (element, stroke = 0) => {
  const b = element.getBBox();
  return {
    x: b.x - stroke,
    y: b.y - stroke,
    w: b.width + 2 * stroke,
    h: b.height + 2 * stroke,
  };
};
const serialize = (document) =>
  new globalThis.XMLSerializer().serializeToString(document);

function inputs(xml) {
  const document = new globalThis.DOMParser().parseFromString(
    xml,
    "application/xml",
  );
  if (document.querySelector("parsererror"))
    fail(
      "Invalid source XML",
      document.querySelector("parsererror").textContent,
    );
  const root = document.documentElement;
  let defaults = root.querySelector(":scope > defaults");
  if (!defaults) {
    defaults = document.createElement("defaults");
    root.insertBefore(defaults, root.querySelector("credit, part-list"));
  }
  for (const tag of ["word-font", "lyric-font"]) {
    let fonts = [...defaults.children].filter((e) => e.tagName === tag);
    if (!fonts.length) {
      const font = document.createElement(tag);
      defaults.insertBefore(
        font,
        defaults.querySelector(
          tag === "word-font" ? "lyric-font, lyric-language" : "lyric-language",
        ),
      );
      fonts = [font];
    }
    for (const font of fonts)
      font.setAttribute("font-family", SCORE_TEXT_FONT_FAMILY);
  }
  for (const text of document.querySelectorAll(
    "rehearsal, words, credit-words, lyric > text",
  ))
    text.setAttribute("font-family", SCORE_TEXT_FONT_FAMILY);
  let divisions,
    meter = 4;
  const directions = [],
    sections = [],
    meters = [];
  const part = document.querySelector('part[id="P1"]');
  if (!part)
    fail(
      "Drum part missing",
      [...document.querySelectorAll("part")].map((p) => p.id),
    );
  [...part.children].forEach((measure, index) => {
    let cursor = 0;
    for (const child of measure.children) {
      if (child.tagName === "attributes") {
        if (child.querySelector("divisions"))
          divisions = Number(child.querySelector("divisions").textContent);
        const time = child.querySelector("time");
        if (time)
          meter =
            (Number(time.querySelector("beats").textContent) * 4) /
            Number(time.querySelector("beat-type").textContent);
      } else if (child.tagName === "backup" || child.tagName === "forward") {
        cursor +=
          ((child.tagName === "backup" ? -1 : 1) *
            Number(child.querySelector("duration").textContent)) /
          divisions;
      } else if (
        child.tagName === "note" &&
        !child.querySelector("chord, grace")
      ) {
        cursor +=
          Number(child.querySelector("duration")?.textContent || 0) / divisions;
      } else if (child.tagName === "direction") {
        for (const rehearsal of child.querySelectorAll(
          "direction-type > rehearsal",
        )) {
          rehearsal.setAttribute("default-x", "0");
          rehearsal.setAttribute("halign", "left");
          rehearsal.setAttribute("justify", "left");
          sections.push({ measure: index + 1, text: rehearsal.textContent });
        }
        const words = child.querySelector("direction-type > words");
        if (!words || /^\s*BPM\s*[:=]?\s*\d/i.test(words.textContent)) continue;
        if (
          child.querySelector("sound,listening") ||
          words.hasAttribute("default-x")
        )
          fail("Review mixed sound or explicit words x before fitting", {
            measure: index + 1,
            text: words.textContent,
          });
        if (!Number.isFinite(divisions) || divisions <= 0)
          fail("Invalid divisions", { measure: index + 1, divisions });
        const previousOffset = child.querySelector("offset");
        if (previousOffset?.getAttribute("sound") === "yes")
          fail("Review performance offset before fitting display", {
            measure: index + 1,
            text: words.textContent,
            offset: previousOffset.textContent,
            sound: "yes",
          });
        previousOffset?.remove();
        directions.push({
          measure: index + 1,
          text: words.textContent,
          appliedQuarter: cursor,
          divisions,
          meter,
          element: child,
          words,
          baseRelativeY: Number(words.getAttribute("relative-y") || 0),
          verticalTenths: 0,
          steps: 0,
        });
      }
    }
    meters.push(meter);
  });
  return { document, directions, sections, meters };
}

function setHeight(direction, tenths) {
  direction.verticalTenths = tenths;
  if (direction.baseRelativeY + tenths)
    direction.words.setAttribute(
      "relative-y",
      String(direction.baseRelativeY + tenths),
    );
  else direction.words.removeAttribute("relative-y");
}

// If actual ink obstacles cover every possible left edge on the source line,
// no 1/16-quarter candidate can fit. This avoids rendering impossible trials.
function horizontalSpace(direction, layout) {
  const a = direction.bounds;
  const start = Math.max(a.x, direction.system.left);
  const end = direction.system.right - a.w;
  const gap = direction.minimumGap;
  const intervals = [...layout.sections, ...layout.obstacles]
    .filter(
      (o) =>
        o.page === direction.page &&
        a.y < o.bounds.y + o.bounds.h + gap - EPS &&
        a.y + a.h + gap > o.bounds.y + EPS,
    )
    .map((o) => ({
      left: o.bounds.x - a.w - gap,
      right: o.bounds.x + o.bounds.w + gap,
      kind: o.kind || "section",
    }))
    .filter((o) => o.right > start && o.left < end)
    .sort((a, b) => a.left - b.left);
  let cursor = start;
  for (const interval of intervals) {
    if (interval.left > cursor + EPS) return { available: true };
    cursor = Math.max(cursor, interval.right);
    if (cursor >= end - EPS) return { available: false, start, end, intervals };
  }
  return { available: cursor < end - EPS, start, end, intervals };
}

function setOffset(direction, steps) {
  direction.steps = steps;
  let offset = direction.element.querySelector("offset");
  if (!steps) {
    offset?.remove();
    return;
  }
  if (!offset) {
    offset = direction.element.ownerDocument.createElement("offset");
    const next = [...direction.element.children].find(
      (e) => !["direction-type"].includes(e.tagName),
    );
    direction.element.insertBefore(offset, next || null);
  }
  offset.setAttribute("sound", "no");
  offset.textContent = String(
    Number((steps * STEP * direction.divisions).toFixed(9)),
  );
}

async function measure(rendered, expected) {
  const document = globalThis.document;
  const host = document.createElement("div");
  host.style.cssText =
    "position:absolute;left:-20000px;top:0;width:1500px;pointer-events:none";
  document.body.append(host);
  const pages = [],
    sections = [],
    directions = [],
    obstacles = [],
    notes = [];
  try {
    await document.fonts.ready;
    for (const [pageIndex, page] of rendered.pages.entries()) {
      const holder = document.createElement("div");
      holder.innerHTML = await (await displayPage(page)).text();
      host.append(holder);
      const svg = holder.querySelector("svg");
      if (!svg) fail("Missing SVG page", pageIndex);
      // Inserting embedded @font-face starts a new load after the previous ready.
      svg.getBBox();
      await document.fonts.ready;
      const measures = [...svg.querySelectorAll(".vf-measure")];
      const findMeasure = (n) =>
        measures.find(
          (g) =>
            g.querySelector(`[data-note-measure="${n - 1}"]`) ||
            g.id === String(n),
        );
      const staff = (g) => {
        const lines = [];
        for (const p of g.children) {
          const d = p.getAttribute("d") || "";
          if (!/^M[\d. -]+L[\d. -]+$/.test(d)) continue;
          const v = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
          if (v.length === 4 && Math.abs(v[1] - v[3]) < EPS) lines.push(v);
        }
        if (lines.length < 5)
          fail("Missing staff", { measure: g.id, lines: lines.length });
        lines.sort((a, b) => a[1] - b[1]);
        return {
          x: lines[0][0],
          y: lines[0][1],
          right: lines[0][2],
          spacing: lines[1][1] - lines[0][1],
        };
      };
      for (const [index, element] of [
        ...svg.querySelectorAll(
          ".vf-stavenote, .vf-stem, .vf-beam, .vf-flag, .vf-ledgers, .vf-line, .vf-tuplet, .vf-slur, .vf-tie",
        ),
      ].entries()) {
        const stroke = Math.max(
          0,
          ...[
            ...element.querySelectorAll("path, line, rect, ellipse, circle"),
          ].map((p) => {
            const style = globalThis.getComputedStyle(p);
            return style.stroke === "none"
              ? 0
              : parseFloat(style.strokeWidth) || 0;
          }),
        );
        const bounds = box(element, stroke / 2);
        if (bounds.w > 0 && bounds.h > 0)
          obstacles.push({
            kind: "notation",
            index,
            page: pageIndex + 1,
            bounds,
          });
      }
      for (const s of expected.sections) {
        const g = findMeasure(s.measure);
        if (!g) continue;
        const text = [...g.children].find(
          (e) => e.tagName === "text" && e.textContent === s.text,
        );
        if (!text) fail("Section text missing", s);
        let frame = text.previousElementSibling;
        if (frame?.tagName === "path" && !frame.getAttribute("d"))
          frame = frame.previousElementSibling;
        if (frame?.tagName !== "rect") fail("Section frame missing", s);
        const line = staff(g),
          bounds = box(
            frame,
            Number(frame.getAttribute("stroke-width") || 0) / 2,
          );
        const error = bounds.x - line.x;
        const labelBounds = box(text);
        const labelInsideFrame =
          labelBounds.x >= bounds.x - EPS &&
          labelBounds.y >= bounds.y - EPS &&
          labelBounds.x + labelBounds.w <= bounds.x + bounds.w + EPS &&
          labelBounds.y + labelBounds.h <= bounds.y + bounds.h + EPS;
        if (!labelInsideFrame)
          fail("Section text outside frame", { ...s, bounds, labelBounds });
        if (Math.abs(error) > EPS)
          fail("Section not at staff start", {
            ...s,
            bounds,
            staff: line,
            error,
          });
        sections.push({
          ...s,
          page: pageIndex + 1,
          bounds,
          labelBounds,
          labelInsideFrame,
          staff: line,
          error,
        });
      }
      const used = new Set();
      for (const [index, d] of expected.directions.entries()) {
        const g = findMeasure(d.measure);
        if (!g) continue;
        const line = staff(g),
          system = g.closest(".staffline");
        const candidates = [...system.querySelectorAll("g.vf-text > text")]
          .filter((t) => t.textContent === d.text && !used.has(t))
          .sort(
            (a, b) => Math.abs(box(a).x - line.x) - Math.abs(box(b).x - line.x),
          );
        if (!candidates.length)
          fail("Direction text missing", { measure: d.measure, text: d.text });
        const bounds = box(candidates[0]);
        // Preserve the native text overhang at the original applied beat.
        // The section frame has a staff-edge anchor; words do not share it.
        if (!d.nativeLeft && d.nativeLeft !== 0) d.nativeLeft = bounds.x;
        const systemMeasures = [...system.querySelectorAll(".vf-measure")];
        const systemStaves = systemMeasures.map(staff);
        const systemIndices = systemMeasures.map((m) => {
          const note = m.querySelector("[data-note-measure]");
          return note
            ? Number(note.getAttribute("data-note-measure"))
            : Number(m.id) - 1;
        });
        const systemLast = Math.max(...systemIndices);
        const remainingQuarters =
          expected.meters
            .slice(d.measure - 1, systemLast + 1)
            .reduce((a, b) => a + b, 0) - d.appliedQuarter;
        for (const t of candidates) {
          const b = box(t);
          if (Math.abs(b.x - bounds.x) < EPS && Math.abs(b.y - bounds.y) < EPS)
            used.add(t);
        }
        directions.push({
          index,
          measure: d.measure,
          text: d.text,
          page: pageIndex + 1,
          bounds,
          staff: line,
          steps: d.steps,
          offsetQuarter: d.steps * STEP,
          appliedQuarter: d.appliedQuarter,
          verticalTenths: d.verticalTenths,
          system: {
            first: Math.min(...systemIndices) + 1,
            last: systemLast + 1,
            left: Math.min(d.nativeLeft, ...systemStaves.map((s) => s.x)),
            staffLeft: Math.min(...systemStaves.map((s) => s.x)),
            right: Math.max(...systemStaves.map((s) => s.right)),
            remainingQuarters,
          },
          minimumGap: line.spacing / 4,
        });
      }
      for (const n of svg.querySelectorAll("[data-note-measure]"))
        // Auto-generated VexFlow IDs differ on cold rerenders. Compare every
        // other attribute/path unchanged; do not modify exported SVG nodes.
        notes.push(
          n.outerHTML.replace(/\sid="vf-auto[^"]*"/g, ' id="native-auto"'),
        );
      svg.querySelectorAll("metadata").forEach((e) => e.remove());
      pages.push(serialize(svg));
      holder.remove();
    }
  } finally {
    host.remove();
  }
  if (
    sections.length !== expected.sections.length ||
    directions.length !== expected.directions.length
  )
    fail("Incomplete layout coverage", {
      sections: [sections.length, expected.sections.length],
      directions: [directions.length, expected.directions.length],
      missingDirections: expected.directions
        .filter(
          (d, index) => !directions.some((actual) => actual.index === index),
        )
        .map((d) => ({ measure: d.measure, text: d.text })),
    });
  for (const d of directions) {
    d.collisions = [
      ...sections.map((s) => ({ ...s, kind: "section" })),
      ...obstacles,
      ...directions
        .filter((other) => other.index !== d.index)
        .map((other) => ({ ...other, kind: "direction" })),
    ]
      .filter(
        (s) =>
          s.page === d.page && intersects(d.bounds, s.bounds, d.minimumGap),
      )
      .map((s) => ({
        kind: s.kind,
        measure: s.measure,
        text: s.text,
        index: s.index,
        bounds: s.bounds,
      }));
    d.withinSystem =
      d.bounds.x >= d.system.left - EPS &&
      d.bounds.x + d.bounds.w <= d.system.right + EPS;
    d.withinPage = d.bounds.y >= -EPS;
    d.gap = Math.min(
      ...sections
        .filter((s) => s.page === d.page && s.measure === d.measure)
        .map((s) => d.bounds.x - s.bounds.x - s.bounds.w),
    );
    if (!Number.isFinite(d.gap)) d.gap = null;
  }
  return {
    pages,
    sections,
    directions,
    obstacles,
    notes,
    regions: rendered.regions,
    parsed: rendered.parsed,
  };
}

/** Sequential 0,1/16,... trials. Source direction cursor remains the applied beat. */
export async function fitDirectionOffsets(xml, progress = () => {}) {
  const expected = inputs(xml),
    trials = [];
  const render = async (label) => {
    progress({
      label,
      offsets: expected.directions.map((d) => d.steps * STEP),
      trials: trials.length,
    });
    const rendered = await renderMusicXML(
      new Blob([serialize(expected.document)], {
        type: "application/vnd.recordare.musicxml+xml",
      }),
      () => {},
      "P1",
    );
    return measure(rendered, expected);
  };
  let final;
  for (let round = 0; round <= 512; round++) {
    const result = await render(`search ${round}`);
    trials.push({ round, directions: result.directions });
    progress({
      label: `constraints ${round}`,
      trials: trials.length,
      directions: result.directions.map((d) => ({
        measure: d.measure,
        offsetQuarter: d.offsetQuarter,
        verticalTenths: d.verticalTenths,
        withinSystem: d.withinSystem,
        collisions: d.collisions.map((c) => c.kind),
      })),
    });
    const collisions = result.directions.filter(
      (d) =>
        !d.withinSystem ||
        !d.withinPage ||
        d.collisions.some((c) => c.kind !== "direction" || c.index < d.index),
    );
    if (!collisions.length) {
      final = result;
      break;
    }
    if (round === 512)
      fail("No placement within source system or page height", collisions);
    for (const d of collisions) {
      const input = expected.directions[d.index];
      if (input.verticalTenths) {
        const prior = trials.at(-2)?.directions[d.index];
        if (
          prior &&
          prior.verticalTenths !== d.verticalTenths &&
          Math.abs(prior.bounds.y - d.bounds.y) < EPS &&
          Math.abs(prior.staff.y - d.staff.y) < EPS
        )
          fail("XML words relative-y not reflected", {
            measure: d.measure,
            previous: prior,
            actual: d,
          });
        if (!d.withinPage) fail("No vertical placement before page edge", d);
        setHeight(input, input.verticalTenths + 2.5);
      } else if (!horizontalSpace(d, result).available) {
        input.fallbackProof = horizontalSpace(d, result);
        setOffset(input, 0);
        setHeight(input, 2.5);
      } else if (
        (input.steps + 1) * STEP < d.system.remainingQuarters &&
        d.bounds.x + d.bounds.w <= d.system.right + EPS
      ) {
        setOffset(input, input.steps + 1);
      } else {
        input.fallbackProof = {
          available: false,
          reason: "source-system boundary",
          lastOffsetQuarter: d.offsetQuarter,
          system: d.system,
          bounds: d.bounds,
        };
        setOffset(input, 0);
        setHeight(input, 2.5);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  const selectedSteps = expected.directions.map((d) => d.steps);
  const minimumProof = [];
  for (const [index, input] of expected.directions.entries()) {
    const finalDirection = final.directions[index];
    for (let step = 0; step < selectedSteps[index]; step++) {
      const candidate = trials
        .flatMap((t) => t.directions)
        .find(
          (d) =>
            d.index === index &&
            d.steps === step &&
            d.verticalTenths === input.verticalTenths,
        );
      const fixedObstacles = [
        ...final.sections.map((s) => ({ ...s, kind: "section" })),
        ...final.obstacles,
      ].filter((o) => o.page === finalDirection.page);
      const witness =
        candidate &&
        fixedObstacles.find((o) =>
          intersects(candidate.bounds, o.bounds, finalDirection.minimumGap),
        );
      if (candidate && witness) {
        minimumProof.push({
          index,
          measure: input.measure,
          step,
          offsetQuarter: step * STEP,
          reason: witness.kind,
        });
        continue;
      }
      setOffset(input, step);
      const result = await render(`minimum proof ${input.measure}:${step}`);
      const actual = result.directions[index];
      if (actual.withinSystem && actual.withinPage && !actual.collisions.length)
        fail("Earlier grid step is available", actual);
      minimumProof.push({
        index,
        measure: input.measure,
        step,
        offsetQuarter: step * STEP,
        reason: actual.collisions.map((c) => c.kind),
        withinSystem: actual.withinSystem,
      });
    }
    setOffset(input, selectedSteps[index]);
  }
  const previous = [];
  for (const [index, input] of expected.directions.entries()) {
    if (!selectedSteps[index]) continue;
    setOffset(input, selectedSteps[index] - 1);
    const result = await render(`previous grid step ${input.measure}`);
    const candidate = result.directions[index];
    if (
      candidate.withinSystem &&
      candidate.withinPage &&
      !candidate.collisions.length
    )
      fail("Selected offset is not minimal", candidate);
    previous.push(candidate);
    setOffset(input, selectedSteps[index]);
  }
  // Reopen the saved XML through the public renderer; no SVG position edits.
  const reopened = await render("final reopen");
  if (
    reopened.directions.some(
      (d) => d.collisions.length || !d.withinSystem || !d.withinPage,
    )
  )
    fail("Final collision", reopened.directions);
  const wordCollisions = reopened.directions.flatMap((a, i) =>
    reopened.directions
      .slice(i + 1)
      .filter(
        (b) =>
          a.page === b.page &&
          intersects(a.bounds, b.bounds, Math.max(a.minimumGap, b.minimumGap)),
      )
      .map((b) => [a.measure, b.measure]),
  );
  if (wordCollisions.length)
    fail("Directions overlap each other", wordCollisions);
  if (JSON.stringify(final.notes) !== JSON.stringify(reopened.notes)) {
    const node = final.notes.findIndex(
      (note, index) => note !== reopened.notes[index],
    );
    const expectedNote = final.notes[node] || "";
    const actualNote = reopened.notes[node] || "";
    let character = 0;
    while (
      character < expectedNote.length &&
      expectedNote[character] === actualNote[character]
    )
      character++;
    fail("Reopen changed notes", {
      final: final.notes.length,
      reopened: reopened.notes.length,
      node,
      character,
      expected: expectedNote.slice(
        Math.max(0, character - 60),
        character + 140,
      ),
      actual: actualNote.slice(Math.max(0, character - 60), character + 140),
    });
  }
  const value = serialize(expected.document);
  const hashBytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  const xmlSHA256 = [...new Uint8Array(hashBytes)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
  return {
    xml: value,
    pages: reopened.pages,
    regions: reopened.regions,
    report: {
      status: "PASS",
      xmlSHA256,
      policy: SCORE_RENDER_POLICY,
      stepQuarter: STEP,
      minimumGapStaffRatio: 0.25,
      searchScope:
        "source system; vertical fallback resets display offset to zero",
      verticalFallbackProof: expected.directions
        .filter((d) => d.verticalTenths)
        .map((d) => ({
          measure: d.measure,
          verticalTenths: d.verticalTenths,
          proof: d.fallbackProof,
        })),
      measures: reopened.parsed.measures.length,
      sections: reopened.sections,
      directions: reopened.directions,
      previousStep: previous,
      minimumProof,
      trials,
      wordCollisions,
      warnings: reopened.parsed.warnings,
      noteReopen: "unchanged",
      noteComparison:
        "All note SVG attributes and paths; only native vf-auto IDs normalized in comparison strings, never in exported SVG",
      musicalCursor: "unchanged; offset sound=no",
    },
  };
}
