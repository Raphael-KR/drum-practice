import { REST_LAYOUT_VERSION, restCenterShift } from "./whole-rest-layout";
import { compressSVG } from "./score-pages";
import JSZip from "jszip";
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
  if (text.length > MAX_XML)
    throw Error("MusicXML은 12MB 이하로 가져와 주세요.");
  if (/<!ENTITY/i.test(text))
    throw Error("엔티티 선언을 포함한 XML은 지원하지 않습니다.");
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror"))
    throw Error("MusicXML 문법을 확인하세요.");
  const root = doc.documentElement;
  if (root.localName !== "score-partwise")
    throw Error("score-partwise 형식의 MusicXML로 내보내 주세요.");
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
      ) || `파트 ${i + 1}`,
  }));
  const partId = selectedPart || parts[0]?.id;
  const index = parts.findIndex((p) => p.id === partId),
    part = partEls[index];
  if (!part) throw Error("가져올 악기 파트를 선택하세요.");
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
    warnings.push(
      "반복·다카포는 펼치지 않고 인쇄된 마디 순서로 가져왔습니다. 음원 순서에 맞춰 마디를 복제·정렬하세요.",
    );
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
      throw Error("MusicXML divisions 값이 올바르지 않습니다.");
    if (Number(content(attr && one(attr, "staves")) || 1) > 1)
      throw Error(
        "현재는 한 파트의 단일 오선 악보를 지원합니다. 드럼 파트만 단일 오선으로 내보내 주세요.",
      );
    if (time) {
      if (children(time, "beats").length !== 1)
        throw Error("복합 박자표는 단일 박자표로 내보내 주세요.");
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
      throw Error(`${i + 1}마디의 박자표는 현재 지원하지 않습니다.`);
    if (m.getAttribute("implicit") === "yes")
      throw Error(
        "못갖춘마디는 현재 자동 시간 배치를 지원하지 않습니다. 완전한 마디로 내보내 주세요.",
      );
    let cursor = 0,
      lastOnset = 0,
      maxBeat = 0;
    for (const e of Array.from(m.children)) {
      const duration =
        ((Number(content(one(e, "duration")) || 0) / divisions) * denominator) /
        4;
      if (!Number.isFinite(duration) || duration < 0)
        throw Error(`${i + 1}마디 음가가 올바르지 않습니다.`);
      if (
        e.localName === "direction" &&
        e.querySelector("sound[tempo], metronome") &&
        cursor > 1e-8
      )
        throw Error("마디 중간의 템포 변경은 현재 지원하지 않습니다.");
      if (e.localName === "backup") {
        cursor -= duration;
        if (cursor < -1e-8)
          throw Error(`${i + 1}마디 성부 위치가 올바르지 않습니다.`);
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
      throw Error(
        `${i + 1}마디 음가 합계가 박자표와 다릅니다. 못갖춘마디 또는 불완전한 마디를 확인하세요.`,
      );
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
      throw Error("템포는 사분음표 기준 20~300 BPM 범위여야 합니다.");
    if (
      tempos.length > 1 ||
      Array.from(m.querySelectorAll("direction")).some(
        (d) =>
          d.querySelector("sound[tempo], metronome") &&
          Number(d.querySelector("offset")?.textContent || 0) !== 0,
      )
    )
      throw Error("마디 중간의 템포 변경은 현재 지원하지 않습니다.");
    if (i === 0) initialBpm = bpm;
    return {
      label: m.getAttribute("number") || String(i + 1),
      beats,
      denominator,
      bpm,
    };
  });
  if (!measures.length || measures.length > 2000)
    throw Error("1~2000마디의 악보를 가져와 주세요.");
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
  if (blob.size > MAX_XML)
    throw Error("MusicXML/MXL은 12MB 이하로 가져와 주세요.");
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b)
    return new TextDecoder().decode(bytes);
  const zip = await JSZip.loadAsync(bytes);
  const container = zip.file("META-INF/container.xml");
  if (!container) throw Error("MXL에 META-INF/container.xml이 없습니다.");
  const meta = new DOMParser().parseFromString(
    await container.async("string"),
    "application/xml",
  );
  const path = meta.querySelector("rootfile")?.getAttribute("full-path");
  if (!path || path.includes("..") || path.startsWith("/"))
    throw Error("MXL 악보 경로가 올바르지 않습니다.");
  const entry = zip.file(path);
  if (!entry) throw Error("MXL의 악보 파일이 누락되었습니다.");
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
        reject(Error("압축 해제한 MusicXML이 12MB를 넘습니다."));
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
export async function renderMusicXML(
  blob: Blob,
  progress: (s: string) => void,
  partId?: string,
) {
  const parsed = parseMusicXML(await readMusicXML(blob), partId);
  progress("MusicXML 악보를 그리는 중입니다.");
  const { OpenSheetMusicDisplay } = await import("opensheetmusicdisplay");
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-20000px;top:0;width:1100px;pointer-events:none;";
  document.body.append(host);
  try {
    const osmd = new OpenSheetMusicDisplay(host, {
      backend: "svg",
      autoResize: false,
      pageFormat: "A4_P",
      drawTitle: true,
      drawMeasureNumbers: false,
      drawLyrics: false,
      drawPartNames: false,
      drawPartAbbreviations: false,
    });
    osmd.EngravingRules.RenderXMeasuresPerLineAkaSystem = 4;
    osmd.EngravingRules.RenderMultipleRestMeasures = false;
    osmd.EngravingRules.AutoGenerateMultipleRestMeasuresFromRestMeasures = false;
    await osmd.load(parsed.document);
    osmd.render();
    const svgs = Array.from(host.querySelectorAll("svg"));
    if (!svgs.length) throw Error("MusicXML 악보를 그릴 수 없습니다.");
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
              if (!glyph)
                throw Error("빈 음표머리의 SVG 위치를 찾지 못했습니다.");
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
              !note.sourceNote.Pitch ||
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
            const dx = restCenterShift(left, right, bounds.x, bounds.width);
            glyph.setAttribute(
              "transform",
              `translate(${dx} 0) ${glyph.getAttribute("transform") || ""}`,
            );
            glyph.setAttribute("data-full-measure-rest", "centered");
          }
      }
    for (const svg of svgs)
      svg.setAttribute("data-rest-layout", REST_LAYOUT_VERSION);
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
      if (!g) throw Error(`${i + 1}마디의 악보 위치가 없습니다.`);
      const page = g.ParentMusicSystem.Parent,
        pi = page.PageNumber - 1,
        svg = svgs[pi];
      if (!svg) throw Error("악보 페이지 좌표를 찾지 못했습니다.");
      const box = g.PositionAndShape,
        p = box.AbsolutePosition,
        pp = page.PositionAndShape.AbsolutePosition;
      // OSMD SVG viewBox coordinates use ten units per engraving unit.
      const width = svg.viewBox.baseVal.width,
        height = svg.viewBox.baseVal.height;
      if (!(width > 0 && height > 0))
        throw Error("SVG 페이지 크기가 올바르지 않습니다.");
      const sx = 1,
        sy = 1;
      const x = Math.max(0, (p.x - pp.x + box.BorderLeft) * 10 * sx),
        right = Math.min(width, (p.x - pp.x + box.BorderRight) * 10 * sx);
      const top =
        Math.min(
          box.BorderTop,
          g.ParentStaffLine.PositionAndShape.BorderTop,
          ...g.ParentStaffLine.SkyLine,
          -4,
        ) - 1;
      const y = Math.max(0, (p.y - pp.y + top) * 10 * sy),
        bottom = Math.min(
          height,
          (p.y - pp.y + (Math.max(box.BorderBottom, 9) + 0.5)) * 10 * sy,
        );
      const w = right - x,
        h = bottom - y;
      if (w <= 0 || h <= 0)
        throw Error("MusicXML 마디 영역이 올바르지 않습니다.");
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
        throw Error(`${i + 1}마디의 진행 위치를 계산할 수 없습니다.`);
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
    return { pages, regions, parsed };
  } finally {
    host.remove();
  }
}
