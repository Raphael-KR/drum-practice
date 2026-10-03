import { normalizeDrumScore } from "./drum-legend";
import { installDrumBeams } from "./drum-beams";
import { RIBBON_TIMELINE_VERSION } from "./ribbon-timeline";
import { t as i18nText } from "./i18n";
import {
  annotateNoteHighlights,
  NOTE_HIGHLIGHT_VERSION,
} from "./note-highlight";
import { prepareDrumDecorations, applyDrumDecorations } from "./drum-notation";
import { REST_LAYOUT_VERSION, restCenterShift } from "./whole-rest-layout";
import { compressSVG } from "./score-pages";
import JSZip from "jszip";
import {
  ribbonSpacing,
  installRibbonEngraving,
  type RibbonSpacing,
} from "./ribbon-engraving";
import { displayPage } from "./score-pages";
import { uid, type Region } from "./model";

export interface XMLMeasure {
  label: string;
  beats: number;
  denominator: number;
  bpm?: number;
}
export interface XMLScore {
  document: Document;
  parts: { id: string; name: string }[];
  partId: string;
  measures: XMLMeasure[];
  title: string;
  bpm?: number;
  warnings: string[];
  lyrics: { measure: number; beat: number; duration: number; text: string }[];
}
const children = (e: Element, name: string) =>
  Array.from(e.children).filter((c) => c.localName === name);
const one = (e: Element, name: string) => children(e, name)[0];
const content = (e: Element | null | undefined) => e?.textContent?.trim() || "";
const MAX_XML = 12 * 1024 * 1024;
export function parseMusicXML(
  text: string,
  selectedPart?: string,
  inspectOnly = false,
): XMLScore {
  if (text.length > MAX_XML) throw Error(i18nText("musicxml.message390"));
  if (/<!ENTITY/i.test(text)) throw Error(i18nText("musicxml.message391"));
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror"))
    throw Error(i18nText("drum-notation.message027"));
  const root = doc.documentElement;
  if (root.localName !== "score-partwise")
    throw Error(i18nText("musicxml.message392"));
  // MusicXML data only: do not permit linked images or active foreign markup.
  for (const e of Array.from(
    doc.querySelectorAll("script, foreignObject, image, link, opus"),
  ))
    e.remove();
  for (const e of Array.from(doc.getElementsByTagName("*")))
    for (const a of Array.from(e.attributes)) {
      if (/^on/i.test(a.name) || /href/i.test(a.name)) e.removeAttributeNode(a);
    }
  const list = one(root, "part-list");
  const partEls = children(root, "part");
  const parts = partEls.map((p, i) => ({
    id: p.getAttribute("id") || String(i),
    name:
      content(
        list &&
          children(list, "score-part")
            .find((v) => v.getAttribute("id") === p.getAttribute("id"))
            ?.querySelector("part-name"),
      ) || i18nText("musicxml.message393", { value1: i + 1 }),
  }));
  const partId = selectedPart || parts[0]?.id;
  const index = parts.findIndex((p) => p.id === partId),
    part = partEls[index];
  if (!part) throw Error(i18nText("musicxml.message394"));
  if (inspectOnly) {
    const bpm =
      Number(part.querySelector("sound[tempo]")?.getAttribute("tempo")) ||
      undefined;
    return {
      document: doc,
      parts,
      partId,
      measures: [],
      lyrics: [],
      bpm,
      title: content(
        root.querySelector("work-title") ||
          root.querySelector("movement-title"),
      ),
      warnings: [],
    };
  }
  const warnings: string[] = [];
  if (
    part.querySelector(
      "repeat, ending, sound[da-capo], sound[dacapo], sound[dalsegno], sound[tocoda]",
    )
  )
    warnings.push(i18nText("musicxml.message395"));
  let beats = 4,
    denominator = 4,
    divisions = 1,
    initialBpm: number | undefined;
  const lyrics: XMLScore["lyrics"] = [];
  const measures = children(part, "measure").map((m, i) => {
    const attr = one(m, "attributes"),
      time = attr && one(attr, "time");
    if (attr && one(attr, "divisions"))
      divisions = Number(content(one(attr, "divisions")));
    if (!Number.isFinite(divisions) || divisions <= 0)
      throw Error(i18nText("musicxml.message396"));
    if (Number(content(attr && one(attr, "staves")) || 1) > 1)
      throw Error(i18nText("musicxml.message397"));
    if (time) {
      if (children(time, "beats").length !== 1)
        throw Error(i18nText("musicxml.message398"));
      beats = content(one(time, "beats"))
        .split("+")
        .reduce((a, b) => a + Number(b), 0);
      denominator = Number(content(one(time, "beat-type")));
    }
    if (
      !Number.isInteger(beats) ||
      beats < 1 ||
      beats > 16 ||
      ![2, 4, 8, 16].includes(denominator)
    )
      throw Error(i18nText("musicxml.message399", { value1: i + 1 }));
    if (m.getAttribute("implicit") === "yes")
      throw Error(i18nText("musicxml.message400"));
    let cursor = 0,
      lastOnset = 0,
      maxBeat = 0;
    for (const e of Array.from(m.children)) {
      const duration =
        ((Number(content(one(e, "duration")) || 0) / divisions) * denominator) /
        4;
      if (!Number.isFinite(duration) || duration < 0)
        throw Error(i18nText("musicxml.message401", { value1: i + 1 }));
      if (
        e.localName === "direction" &&
        e.querySelector("sound[tempo], metronome") &&
        cursor > 1e-8
      )
        throw Error(i18nText("musicxml.message402"));
      if (e.localName === "backup") {
        cursor -= duration;
        if (cursor < -1e-8)
          throw Error(i18nText("musicxml.message403", { value1: i + 1 }));
        continue;
      }
      if (e.localName === "forward") {
        cursor += duration;
        maxBeat = Math.max(maxBeat, cursor);
        continue;
      }
      if (e.localName !== "note") continue;
      const onset = one(e, "chord") ? lastOnset : cursor;
      if (!one(e, "grace")) maxBeat = Math.max(maxBeat, onset + duration);
      const lyric = one(e, "lyric"),
        text = lyric ? children(lyric, "text").map(content).join("") : "";
      if (text && !one(e, "grace"))
        lyrics.push({
          measure: i,
          beat: Math.max(0, onset),
          duration: Math.max(0, duration),
          text,
        });
      if (!one(e, "chord") && !one(e, "grace")) {
        lastOnset = cursor;
        cursor += duration;
      }
    }
    if (maxBeat > 0 && Math.abs(maxBeat - beats) > 1e-6)
      throw Error(i18nText("musicxml.message404", { value1: i + 1 }));
    const tempos = Array.from(m.querySelectorAll("sound[tempo]")).map((e) =>
      Number(e.getAttribute("tempo")),
    );
    if (!tempos.length) {
      const met = m.querySelector("metronome"),
        per = Number(met?.querySelector("per-minute")?.textContent);
      const units: Record<string, number> = {
        whole: 4,
        half: 2,
        quarter: 1,
        eighth: 0.5,
        "16th": 0.25,
      };
      if (per && met) {
        const factor =
          units[content(met.querySelector("beat-unit") || undefined)];
        if (factor)
          tempos.push(
            per * factor * (met.querySelector("beat-unit-dot") ? 1.5 : 1),
          );
      }
    }
    const bpm = tempos[0];
    if (tempos.some((t) => !Number.isFinite(t) || t < 20 || t > 300))
      throw Error(i18nText("musicxml.message405"));
    if (
      tempos.length > 1 ||
      Array.from(m.querySelectorAll("direction")).some(
        (d) =>
          d.querySelector("sound[tempo], metronome") &&
          Number(d.querySelector("offset")?.textContent || 0) !== 0,
      )
    )
      throw Error(i18nText("musicxml.message402"));
    if (i === 0) initialBpm = bpm;
    return {
      label: m.getAttribute("number") || String(i + 1),
      beats,
      denominator,
      bpm,
    };
  });
  if (!measures.length || measures.length > 2000)
    throw Error(i18nText("musicxml.message406"));
  for (const p of partEls) if (p !== part) p.remove();
  if (list)
    for (const p of Array.from(list.children))
      if (p.localName !== "score-part" || p.getAttribute("id") !== partId)
        p.remove();
  // Expand printed multimeasure rests so every playback bar owns a region.
  for (const e of Array.from(part.querySelectorAll("multiple-rest")))
    e.remove();
  return {
    document: doc,
    parts,
    partId,
    measures,
    lyrics,
    bpm: initialBpm,
    title: content(
      root.querySelector("work-title") ||
        root.querySelector("movement-title") ||
        undefined,
    ),
    warnings,
  };
}
export async function readMusicXML(blob: Blob): Promise<string> {
  if (blob.size > MAX_XML) throw Error(i18nText("musicxml.message407"));
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b)
    return new TextDecoder().decode(bytes);
  const zip = await JSZip.loadAsync(bytes);
  const container = zip.file("META-INF/container.xml");
  if (!container) throw Error(i18nText("musicxml.message408"));
  const meta = new DOMParser().parseFromString(
    await container.async("string"),
    "application/xml",
  );
  const path = meta.querySelector("rootfile")?.getAttribute("full-path");
  if (!path || path.includes("..") || path.startsWith("/"))
    throw Error(i18nText("musicxml.message409"));
  const entry = zip.file(path);
  if (!entry) throw Error(i18nText("musicxml.message410"));
  // Stop decompression once the limit is reached instead of allocating an arbitrary ZIP payload.
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Uint8Array[] = [];
    const stream = (
      entry as unknown as {
        internalStream(type: string): {
          on(event: string, callback: (value: any) => void): void;
          pause(): void;
          resume(): void;
        };
      }
    ).internalStream("uint8array");
    stream.on("data", (chunk: Uint8Array) => {
      size += chunk.length;
      if (size > MAX_XML) {
        stream.pause();
        reject(Error(i18nText("musicxml.message411")));
      } else chunks.push(chunk);
    });
    stream.on("error", reject);
    stream.on("end", () => {
      const all = new Uint8Array(size);
      let at = 0;
      for (const c of chunks) {
        all.set(c, at);
        at += c.length;
      }
      resolve(new TextDecoder().decode(all));
    });
    stream.resume();
  });
}
export function interpolateX(
  points: { beat: number; x: number }[],
  beat: number,
): number {
  if (beat <= points[0].beat) return points[0].x;
  if (beat >= points.at(-1)!.beat) return points.at(-1)!.x;
  for (let i = 1; i < points.length; i++)
    if (beat <= points[i].beat) {
      const a = points[i - 1],
        b = points[i];
      return a.x + ((b.x - a.x) * (beat - a.beat)) / (b.beat - a.beat);
    }
  return points.at(-1)!.x;
}
async function renderMusicXMLPass(
  blob: Blob,
  progress: (s: string) => void,
  partId?: string,
  timeline?: RibbonSpacing,
) {
  const parsed = parseMusicXML(normalizeDrumScore(await readMusicXML(blob)), partId);
  progress(i18nText("musicxml.message412"));
  const { OpenSheetMusicDisplay } = await import("opensheetmusicdisplay");
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-20000px;top:0;width:1500px;pointer-events:none;";
  document.body.append(host);
  try {
    const osmd = new OpenSheetMusicDisplay(host, {
      backend: "svg",
      autoResize: false,
      pageFormat: "A4_P",
      drawTitle: true,
      drawComposer: false,
      drawLyricist: false,
      drawMetronomeMarks: false,
      drawMeasureNumbers: false,
      drawLyrics: false,
      drawPartNames: false,
      drawPartAbbreviations: false,
    });
    // XML owns system boundaries; do not impose a fixed measure count.
    osmd.EngravingRules.RenderXMeasuresPerLineAkaSystem = 0;
    osmd.EngravingRules.NewSystemAtXMLNewSystemAttribute = true;
    osmd.EngravingRules.NewPageAtXMLNewPageAttribute = true;
    // Keep rehearsal boxes above cymbal stems, inside the seven-space top margin.
    osmd.EngravingRules.RehearsalMarkYOffset = 25;
    osmd.EngravingRules.StemWidth = 0.1;
    osmd.EngravingRules.RenderMultipleRestMeasures = false;
    osmd.EngravingRules.AutoGenerateMultipleRestMeasuresFromRestMeasures = false;
    const renderDocument = parsed.document.cloneNode(true) as Document;
    // Suppress textual BPM labels only in the engraving copy; keep tempo data.
    for (const words of renderDocument.querySelectorAll(
      "direction-type > words",
    )) {
      if (/^\s*BPM\s*[:=]?\s*\d+(?:\.\d+)?\s*$/i.test(words.textContent || ""))
        words.remove();
    }
    if (timeline) {
      renderDocument.querySelectorAll("print").forEach((e) => e.remove());
      osmd.EngravingRules.RenderXMeasuresPerLineAkaSystem = 1;
      osmd.EngravingRules.NewSystemAtXMLNewSystemAttribute = false;
      osmd.EngravingRules.NewPageAtXMLNewPageAttribute = false;
      osmd.EngravingRules.RenderTitle = false;
      host.style.width = `${Math.max(1500, ...parsed.measures.map((m) => ((m.beats * 4) / m.denominator) * timeline.quarter + 200))}px`;
    }

    const decorations = prepareDrumDecorations(renderDocument);
    await osmd.load(renderDocument);
    // MusicXML owns first-system spacing. OSMD 2.1.2 does not apply this
    // standard value to the system position, so translate tenths to its units.
    const firstMeasure = renderDocument.querySelector("part > measure");
    const topDistance =
      firstMeasure?.querySelector(
        "print > system-layout > top-system-distance",
      ) ??
      renderDocument.querySelector(
        "defaults > system-layout > top-system-distance",
      );
    const tenths = topDistance ? Number(topDistance.textContent) : NaN;
    if (
      Number.isFinite(tenths) &&
      tenths >= 0 &&
      osmd.EngravingRules.RenderTitle
    ) {
      const rules = osmd.EngravingRules;
      rules.TitleBottomDistance = Math.max(
        0,
        tenths / 10 - rules.TitleTopDistance - rules.SheetTitleHeight,
      );
    }
    installDrumBeams(osmd);
    if (timeline) installRibbonEngraving(osmd, timeline);
    osmd.render();
    applyDrumDecorations(host, osmd, decorations);
    // This drum practice viewer omits percussion clef glyphs, including system
    // repeats. Keep source XML and all barline/repeat glyphs unchanged.
    const clefSigns = Array.from(
      renderDocument.querySelectorAll(
        "part > measure > attributes > clef > sign",
      ),
    );
    if (
      clefSigns.length &&
      clefSigns.every((sign) => sign.textContent?.trim() === "percussion")
    ) {
      host.querySelectorAll(".vf-clef").forEach((clef) => clef.remove());
    }
    // VexFlow places rehearsal boxes differently at system starts. Normalize
    // their visible top edge to the practice viewport's seven-space headroom.
    for (const text of host.querySelectorAll<SVGTextElement>(
      ".vf-measure > text",
    )) {
      let frame = text.previousElementSibling;
      if (frame?.tagName === "path" && !frame.getAttribute("d"))
        frame = frame.previousElementSibling;
      const staff = text.parentElement?.querySelector<SVGPathElement>("path");
      if (
        frame?.tagName !== "rect" ||
        frame.getAttribute("fill") !== "none" ||
        !staff
      )
        continue;
      const dy = staff.getBBox().y - 70 - Number(frame.getAttribute("y"));
      for (const element of [frame, text]) {
        element.setAttribute(
          "y",
          String(Number(element.getAttribute("y")) + dy),
        );
        element.setAttribute("data-section-top", "safe");
      }
    }
    if (timeline)
      host.querySelectorAll(".vf-timesignature").forEach((e) => e.remove());
    const svgs = Array.from(host.querySelectorAll("svg"));
    if (!svgs.length) throw Error(i18nText("musicxml.message413"));
    // OSMD 2.1.2 ignores filled="no" for normal short-note heads.
    // Select the specific chord member so neighboring snare/tom heads stay filled.
    for (const row of osmd.GraphicSheet.MeasureList)
      for (const g of row) {
        for (const entry of g.staffEntries)
          for (const voice of entry.graphicalVoiceEntries)
            for (const note of voice.notes) {
              const head = note.sourceNote.Notehead;
              if (
                !head ||
                head.Shape !== 2 ||
                head.Filled !== false ||
                note.sourceNote.Length.RealValue >= 0.5 ||
                note.sourceNote.isRest()
              )
                continue;
              const vf = note as unknown as {
                vfnote: [unknown, number];
                getNoteheadSVGs(): HTMLElement[];
              };
              const glyph = vf.getNoteheadSVGs()[vf.vfnote[1]];
              if (!glyph) throw Error(i18nText("musicxml.message414"));
              glyph.setAttribute("data-hollow-notehead", "true");
              for (const path of glyph.querySelectorAll("path")) {
                path.setAttribute("fill", "white");
                path.setAttribute(
                  "stroke",
                  note.sourceNote.NoteheadColor || "#000000",
                );
                path.setAttribute("stroke-width", "1.1");
                (path as SVGElement).style.fill = "white";
                (path as SVGElement).style.stroke =
                  note.sourceNote.NoteheadColor || "#000000";
              }
            }
      }
    // Explicit rest display pitches bypass OSMD's automatic whole-rest centering.
    // Move only full-bar silence glyphs; keep staff entries and playback anchors intact.
    for (const row of osmd.GraphicSheet.MeasureList)
      for (const g of row) {
        if (!g?.hasOnlyRests || g.staffEntries.length !== 1) continue;
        if (timeline && !g.staffEntries.every(e => e.graphicalVoiceEntries.every(v => v.notes.every(n => n.sourceNote.isRest())))) continue;
        const page = g.ParentMusicSystem.Parent;
        const box = g.PositionAndShape;
        const left =
          (box.AbsolutePosition.x -
            page.PositionAndShape.AbsolutePosition.x +
            box.BorderLeft) *
          10;
        const right =
          (box.AbsolutePosition.x -
            page.PositionAndShape.AbsolutePosition.x +
            box.BorderRight) *
          10;
        for (const voice of g.staffEntries[0].graphicalVoiceEntries)
          for (const note of voice.notes) {
            if (
              !note.sourceNote.isRest() ||
              (!timeline && !note.sourceNote.Pitch) ||
              !(
                note.sourceNote.IsWholeMeasureRest ||
                note.sourceNote.Length.RealValue ===
                  note.sourceNote.SourceMeasure.ActiveTimeSignature.RealValue
              )
            )
              continue;
            const glyph = (
              note as unknown as { getSVGGElement(): SVGGElement }
            ).getSVGGElement();
            if (!glyph) continue;
            const bounds = glyph.getBBox();
            const nativeLeft = timeline
              ? (g as unknown as {getVFStave(): {getX(): number}}).getVFStave().getX()
              : left;
            const dx = timeline
              ? restCenterShift(nativeLeft, nativeLeft + (timeline.uniformQuarters && timeline.rowWidth ? timeline.rowWidth : g.parentSourceMeasure.Duration.RealValue * 4 * timeline.quarter), bounds.x, bounds.width)
              : restCenterShift(left, right, bounds.x, bounds.width);
            glyph.setAttribute(
              "transform",
              `translate(${dx} 0) ${glyph.getAttribute("transform") || ""}`,
            );
            glyph.setAttribute("data-full-measure-rest", "centered");
          }
      }
    annotateNoteHighlights(
      osmd,
      parsed.measures.map((m) => m.denominator),
    );
    for (const svg of svgs) {
      svg.setAttribute("data-rest-layout", REST_LAYOUT_VERSION);
      svg.setAttribute("data-note-highlight", NOTE_HIGHLIGHT_VERSION);
    }
    // Retain titles in whole-score SVG, but identify them for practice-only removal.
    const headings = new Set(
      Array.from(
        parsed.document.querySelectorAll(
          "work-title, movement-title, credit-words",
        ),
      )
        .map((e) => e.textContent?.trim())
        .filter(Boolean),
    );
    for (const svg of svgs)
      for (const text of svg.querySelectorAll("text")) {
        if (
          headings.has(text.textContent?.trim()) &&
          !text.closest(".vf-measure")
        )
          text.setAttribute("data-score-heading", "true");
      }
    // Crop against actual system ink, not a fixed nine-space lower margin.
    const systemBounds = svgs.map((svg) => {
      const rows = new Map<number, { top: number; bottom: number }>();
      for (const measure of svg.querySelectorAll<SVGGraphicsElement>(
        ".vf-measure",
      )) {
        const line = Array.from(measure.children).find(
          (e) =>
            e.localName === "path" &&
            /^M[\d. -]+L[\d. -]+$/.test(e.getAttribute("d") || ""),
        );
        const points = line
          ?.getAttribute("d")
          ?.match(/-?\d+(?:\.\d+)?/g)
          ?.map(Number);
        if (
          !points ||
          points.length !== 4 ||
          Math.abs(points[1] - points[3]) > 0.01
        )
          continue;
        const key = Math.round(points[1] * 100),
          box = measure.getBBox(),
          previous = rows.get(key);
        rows.set(key, {
          top: Math.min(previous?.top ?? Infinity, box.y),
          bottom: Math.max(previous?.bottom ?? -Infinity, box.y + box.height),
        });
      }
      return rows;
    });
    // Native wedges live outside .vf-measure. Include their ink in playback
    // crop bounds, otherwise an above-staff crescendo is cut at the beam top.
    for (const row of osmd.GraphicSheet.MeasureList) for (const g of row) {
      if (!g) continue;
      const page = g.ParentMusicSystem.Parent;
      const key = Math.round((g.PositionAndShape.AbsolutePosition.y -
        page.PositionAndShape.AbsolutePosition.y) * 1000);
      const bounds = systemBounds[page.PageNumber - 1].get(key);
      if (!bounds) continue;
      for (const expression of g.ParentStaffLine.AbstractExpressions as any[]) {
        for (const line of expression.Lines ?? expression.lines ?? []) {
          const box = line.SVGElement?.getBBox?.();
          if (!box) continue;
          bounds.top = Math.min(bounds.top, box.y - 1);
          bounds.bottom = Math.max(bounds.bottom, box.y + box.height + 1);
        }
      }
    }
    // Keep XML page/row boundaries; trim only the unused SVG canvas below ink.
    // Regions below are normalized against these final page dimensions.
    for (const svg of svgs) {
      const ink = svg.getBBox(),
        view = svg.viewBox.baseVal;
      const bottom = Math.min(view.height, Math.ceil(ink.y + ink.height + 30));
      if (bottom > 0) {
        svg.setAttribute(
          "viewBox",
          `${view.x} ${view.y} ${view.width} ${bottom}`,
        );
        svg.setAttribute("height", String(bottom));
      }
    }
    const pages = await Promise.all(
      svgs.map((svg) => {
        const copy = svg.cloneNode(true) as SVGSVGElement;
        copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        return compressSVG(new XMLSerializer().serializeToString(copy));
      }),
    );
    const regions: Region[] = [];
    for (let i = 0; i < parsed.measures.length; i++) {
      const g = osmd.GraphicSheet.MeasureList[i]?.[0];
      if (!g) throw Error(i18nText("musicxml.message415", { value1: i + 1 }));
      const page = g.ParentMusicSystem.Parent,
        pi = page.PageNumber - 1,
        svg = svgs[pi];
      if (!svg) throw Error(i18nText("musicxml.message416"));
      const box = g.PositionAndShape,
        p = box.AbsolutePosition,
        pp = page.PositionAndShape.AbsolutePosition;
      // OSMD SVG viewBox coordinates use ten units per engraving unit.
      const width = svg.viewBox.baseVal.width,
        height = svg.viewBox.baseVal.height;
      if (!(width > 0 && height > 0))
        throw Error(i18nText("musicxml.message417"));
      const sx = 1,
        sy = 1;
      const x = Math.max(0, (p.x - pp.x + box.BorderLeft) * 10 * sx),
        right = timeline
          ? x +
            (timeline.uniformQuarters && timeline.rowWidth ? timeline.rowWidth :
            (parsed.measures[i].beats * 4) / parsed.measures[i].denominator * timeline.quarter)
          : Math.min(width, (p.x - pp.x + box.BorderRight) * 10 * sx);
      const staffY = (p.y - pp.y) * 10;
      const bounds = systemBounds[pi].get(Math.round(staffY * 100));
      const y = Math.max(0, bounds ? bounds.top - 5 : staffY - 50),
        bottom = Math.min(height, bounds ? bounds.bottom + 5 : staffY + 95);
      const w = right - x,
        h = bottom - y;
      if (w <= 0 || h <= 0) throw Error(i18nText("musicxml.message418"));
      const meta = parsed.measures[i];
      const entries = g.staffEntries
        .map((e) => ({
          beat: e.relInMeasureTimestamp.RealValue * meta.denominator,
          x: ((e.PositionAndShape.AbsolutePosition.x - pp.x) * 10 * sx - x) / w,
        }))
        .filter(
          (e) => e.beat >= 0 && e.beat < meta.beats && e.x >= 0 && e.x < 1,
        );
      entries.sort((a, b) => a.beat - b.beat);
      const wholeRest = g.hasOnlyRests && g.staffEntries.length === 1;
      const points = wholeRest
        ? [{ beat: 0, x: 0.04 }]
        : entries.filter((e, j) => !j || e.beat > entries[j - 1].beat + 1e-8);
      if (!points.length) points.push({ beat: 0, x: 0.08 });
      points.push({ beat: meta.beats, x: 1 });
      const beatXs = Array.from({ length: meta.beats + 1 }, (_, b) =>
        interpolateX(points, b),
      );
      if (
        beatXs.some(
          (v, j) =>
            !Number.isFinite(v) ||
            v < 0 ||
            v > 1 ||
            (j > 0 && v <= beatXs[j - 1]),
        )
      )
        throw Error(i18nText("musicxml.message419", { value1: i + 1 }));
      regions.push({
        id: `xml-r${i + 1}`,
        page: pi,
        x: x / width,
        y: y / height,
        w: w / width,
        h: h / height,
        beatXs,
      });
    }
    const staffs = regions.map((r, i) => {
      const stave = (osmd.GraphicSheet.MeasureList[i][0] as any).getVFStave();
      const height = svgs[r.page].viewBox.baseVal.height;
      return {
        top: stave.getYForLine(0) / height,
        gap: (stave.getYForLine(1) - stave.getYForLine(0)) / height,
      };
    });
    return {
      pages,
      regions,
      parsed,
      staffs,
      spacing: timeline ?? ribbonSpacing(osmd),
    };
  } finally {
    host.remove();
  }
}

/** Preserve print pages; the optional metadata contains native, time-spaced engraving. */
async function engraveMusicXML(
  blob: Blob,
  progress: (s: string) => void,
  partId?: string,
) {
  const printed = await renderMusicXMLPass(blob, progress, partId);
  const ribbon = await renderMusicXMLPass(
    blob,
    progress,
    partId,
    {...printed.spacing, rowWidth: undefined},
  );
  const durations = printed.parsed.measures.map(m => m.beats * 4 / m.denominator);
  const uniformQuarters = Math.max(...durations);
  // Rows reserve glyph clearance and distribute remaining space by time.
  // Do not reuse the ribbon global shortest-duration spacing for row glyph size.
  const rows = await renderMusicXMLPass(blob, progress, partId, {...printed.spacing, uniformQuarters});
  const document = new DOMParser().parseFromString(
    await (await displayPage(printed.pages[0])).text(),
    "image/svg+xml",
  );
  const metadata = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "metadata",
  );
  metadata.setAttribute(
    "data-ribbon-timeline",
    String(RIBBON_TIMELINE_VERSION),
  );
  metadata.textContent = JSON.stringify({
    version: RIBBON_TIMELINE_VERSION,
    rows: rows ? {version: RIBBON_TIMELINE_VERSION, ...printed.spacing, uniformQuarters,
      regions: rows.regions, staffs: rows.staffs,
      pages: await Promise.all(rows.pages.map(async p => (await displayPage(p)).text()))} : undefined,
    ...printed.spacing,
    regions: ribbon.regions,
    printStaffs: printed.staffs,
    staffs: ribbon.staffs,
    pages: await Promise.all(
      ribbon.pages.map(async (page) => (await displayPage(page)).text()),
    ),
  });
  document.documentElement.append(metadata);
  printed.pages[0] = await compressSVG(
    new XMLSerializer().serializeToString(document),
  );
  return {
    pages: printed.pages,
    regions: printed.regions,
    parsed: printed.parsed,
  };
}

/** Shared browser engraving. Cache is derived from source, never from bundled SVG. */
export async function renderMusicXML(
  blob: Blob,
  progress: (s: string) => void,
  partId?: string,
) {
  const { cachedScoreRender, scoreRenderKey } =
    await import("./score-render-cache");
  const text = await readMusicXML(blob);
  const parsed = parseMusicXML(text, partId);
  const key = await scoreRenderKey(text, parsed.partId);
  const start = performance.now();
  const { value, hit } = await cachedScoreRender(key, () =>
    engraveMusicXML(
      new Blob([text], { type: "application/vnd.recordare.musicxml+xml" }),
      progress,
      parsed.partId,
    ),
  );
  performance.measure(hit ? "score-render:cache-hit" : "score-render:cold", {
    start,
    detail: { key, measures: parsed.measures.length },
  });
  return { ...value, parsed };
}
