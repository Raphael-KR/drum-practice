import JSZip from "jszip";
import { t as i18nText } from "../../shared/i18n/i18n";

// Input inspection and bounded MXL decompression do not depend on the engraving engine.
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
          on(event: "data", callback: (value: Uint8Array) => void): void;
          on(event: "error", callback: (value: unknown) => void): void;
          on(event: "end", callback: () => void): void;
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
