import { t as i18nText } from "./i18n";
import { validateMeasureLyrics, type Song, type Lyric, type MeasureLyric } from "./model";
import type { RecordData } from "./storage";
import { migrateLyricPositions, projectLyrics } from "./lyric-score";
const PART = "DrumPracticeLyrics",
  FIELD = "drum-practice:score:v1",
  DIV = 9600;
const kids = (e: Element, name: string) =>
  Array.from(e.children).filter((c) => c.localName === name);
const child = (e: Element, name: string) => kids(e, name)[0];
function parse(text: string) {
  if (/<!ENTITY/i.test(text)) throw Error(i18nText("canonical-xml.message011"));
  const d = new DOMParser().parseFromString(text, "application/xml");
  if (
    d.querySelector("parsererror") ||
    d.documentElement.localName !== "score-partwise"
  )
    throw Error(i18nText("canonical-xml.message012"));
  return d;
}
function add(
  parent: Element,
  name: string,
  text?: string | number,
  attrs: Record<string, string> = {},
) {
  const e = parent.ownerDocument.createElement(name);
  if (text !== undefined) e.textContent = String(text);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  parent.append(e);
  return e;
}
function put(parent: Element, name: string, text: string) {
  const e = child(parent, name) || add(parent, name);
  e.textContent = text;
  return e;
}
interface Manifest {
  version: 1;
  measureLyrics?: MeasureLyric[];
  partId: string;
  audioName: string;
  audioSHA256?: string;
  measures: {
    id: string;
    label: string;
    beats: number;
    denominator: number;
    start: number;
    end: number;
    occurrence: number;
  }[];
  lyrics: { voice: string; id: string; confirmed: boolean }[];
}
function manifest(d: Document): Manifest | undefined {
  const e = Array.from(
    d.querySelectorAll("identification > miscellaneous > miscellaneous-field"),
  ).find((e) => e.getAttribute("name") === FIELD);
  return e ? JSON.parse(e.textContent || "") : undefined;
}
export function metadataFromXML(text: string) {
  const d = parse(text),
    root = d.documentElement;
  const creators = Array.from(
    root.querySelectorAll(":scope > identification > creator"),
  );
  const get = (role: string) =>
    creators.find((e) => e.getAttribute("type") === role)?.textContent || "";
  const display = Array.from(
    root.querySelectorAll(
      "identification > miscellaneous > miscellaneous-field",
    ),
  ).find(
    (e) => e.getAttribute("name") === "drum-practice:display-title",
  )?.textContent;
  return {
    originalTitle: root.querySelector("work > work-title")?.textContent || "",
    title:
      display ||
      child(root, "movement-title")?.textContent ||
      root.querySelector("work > work-title")?.textContent ||
      "",
    artist: get("artist"),
    composer: get("composer"),
    lyricist: get("lyricist"),
  };
}
export function writeCanonical(
  s: Song,
  base?: string,
  audioSHA256?: string,
): string {
  validateMeasureLyrics(s.measureLyrics, new Set(s.measures.map(m => m.id)));
  migrateLyricPositions(s);
  const d = parse(
      base || '<score-partwise version="4.0"><part-list/></score-partwise>',
    ),
    root = d.documentElement,
    old = manifest(d);
  const priorBpm = Number(
    kids(root, "part")
      .find((p) => p.id === old?.partId)
      ?.querySelector("sound[tempo]")
      ?.getAttribute("tempo"),
  );
  if (priorBpm > 0 && priorBpm !== s.bpm) {
    for (const e of Array.from(root.querySelectorAll("sound[tempo]")))
      e.setAttribute(
        "tempo",
        String((Number(e.getAttribute("tempo")) * s.bpm) / priorBpm),
      );
    for (const e of Array.from(
      root.querySelectorAll("metronome > per-minute"),
    )) {
      const n = Number(e.textContent);
      if (n > 0) e.textContent = String((n * s.bpm) / priorBpm);
    }
  }
  const work =
    child(root, "work") ||
    root.insertBefore(d.createElement("work"), root.firstChild);
  put(work, "work-title", s.originalTitle || s.title);
  let movement = child(root, "movement-title");
  if (!movement) {
    movement = d.createElement("movement-title");
    work.after(movement);
  }
  movement.textContent = s.title;
  let ident = child(root, "identification");
  if (!ident) {
    ident = d.createElement("identification");
    movement.after(ident);
  }
  for (const [role, value] of [
    ["artist", s.artist],
    ["composer", s.composer],
    ["lyricist", s.lyricist],
  ]) {
    const prior = kids(ident, "creator").filter(
      (e) => e.getAttribute("type") === role,
    );
    prior.forEach((e) => e.remove());
    if (value) {
      const e = d.createElement("creator");
      e.setAttribute("type", role!);
      e.textContent = value;
      ident.insertBefore(e, ident.firstChild);
    }
  }
  const misc = child(ident, "miscellaneous") || add(ident, "miscellaneous");
  for (const name of [
    FIELD,
    "drum-practice:display-title",
    "drum-practice:lyric-text",
  ])
    kids(misc, "miscellaneous-field")
      .filter((e) => e.getAttribute("name") === name)
      .forEach((e) => e.remove());
  add(misc, "miscellaneous-field", s.title, {
    name: "drum-practice:display-title",
  });
  if (s.lyricText)
    add(misc, "miscellaneous-field", s.lyricText, {
      name: "drum-practice:lyric-text",
    });
  const partList = child(root, "part-list") || add(root, "part-list");
  if (!old && kids(root, "part").some((p) => p.id === PART))
    throw Error(i18nText("canonical-xml.message013"));
  kids(root, "part")
    .filter((p) => p.id === (old?.partId || PART))
    .forEach((p) => p.remove());
  kids(partList, "score-part")
    .filter((p) => p.id === (old?.partId || PART))
    .forEach((p) => p.remove());
  const sp = add(partList, "score-part", undefined, { id: PART });
  add(sp, "part-name", i18nText("canonical-xml.message014"));
  const part = add(root, "part", undefined, { id: PART });
  const offsets: number[] = [];
  let total = 0;
  s.measures.forEach((m) => {
    offsets.push(total);
    total += (m.beats * 4) / m.denominator;
  });
  const rows = s.lyrics.map((l, i) => {
    const p = l.scorePosition!;
    const mi = s.measures.findIndex((m) => m.id === p.measureId);
    return {
      l,
      voice: String(i + 1),
      start: offsets[mi] + p.quarterOffset,
      end: Math.min(total, offsets[mi] + p.quarterOffset + p.durationQuarters),
    };
  });
  if (rows.some((r) => r.start >= total || r.end <= r.start))
    throw Error(i18nText("canonical-xml.message015"));
  for (let i = 0; i < s.measures.length; i++) {
    const sm = s.measures[i],
      len = (sm.beats * 4) / sm.denominator,
      m = add(part, "measure", undefined, { number: sm.label }),
      a = add(m, "attributes");
    add(a, "divisions", DIV);
    const time = add(a, "time");
    add(time, "beats", sm.beats);
    add(time, "beat-type", sm.denominator);
    const clef = add(a, "clef");
    add(clef, "sign", "percussion");
    if (i === 0) {
      const direction = add(m, "direction");
      const type = add(direction, "direction-type"),
        met = add(type, "metronome");
      add(met, "beat-unit", "quarter");
      add(met, "per-minute", s.bpm);
      add(direction, "sound", undefined, { tempo: String(s.bpm) });
    }
    const events = rows.filter(
      (r) => r.start < offsets[i] + len - 1e-8 && r.end > offsets[i] + 1e-8,
    );
    if (!events.length) {
      const n = add(m, "note", undefined, { "print-object": "no" });
      add(n, "rest");
      add(n, "duration", Math.round(len * DIV));
      continue;
    }
    for (let j = 0; j < events.length; j++) {
      const r = events[j],
        start = Math.max(0, r.start - offsets[i]),
        end = Math.min(len, r.end - offsets[i]);
      if (j) {
        add(add(m, "backup"), "duration", Math.round(len * DIV));
      }
      const rest = (length: number) => {
        if (length < 1e-8) return;
        const n = add(m, "note", undefined, { "print-object": "no" });
        add(n, "rest");
        add(n, "duration", Math.round(length * DIV));
        add(n, "voice", r.voice);
      };
      rest(start);
      const n = add(m, "note", undefined, {
        "print-object": "no",
        "print-lyric": "yes",
      });
      const un = add(n, "unpitched");
      add(un, "display-step", "C");
      add(un, "display-octave", "4");
      add(n, "duration", Math.max(1, Math.round((end - start) * DIV)));
      add(n, "voice", r.voice);
      const lyric = add(n, "lyric", undefined, { name: "pronunciation" });
      if (Math.abs(r.start - (offsets[i] + start)) < 1e-8) {
        add(lyric, "syllabic", "single");
        add(lyric, "text", r.l.text);
      } else add(lyric, "extend", undefined, { type: "continue" });
      rest(len - end);
    }
  }
  const data: Manifest = {
    version: 1,
    partId: PART,
    audioName: s.audioName,
    audioSHA256: audioSHA256 || old?.audioSHA256,
    measures: s.measures.map(
      ({ id, label, beats, denominator, start, end }) => ({
        id,
        label,
        beats,
        denominator,
        start,
        end,
        occurrence: 1,
      }),
    ),
    ...(s.measureLyrics?.length ? { measureLyrics: s.measureLyrics.map(l => ({ ...l })) } : {}),
    lyrics: rows.map(({ l, voice }) => ({
      voice,
      id: l.id,
      confirmed: l.confirmed,
    })),
  };
  add(misc, "miscellaneous-field", JSON.stringify(data), { name: FIELD });
  return new XMLSerializer().serializeToString(d);
}
export function readCanonical(text: string, s: Song): void {
  s.lyricText =
    Array.from(parse(text).querySelectorAll("miscellaneous-field")).find(
      (e) => e.getAttribute("name") === "drum-practice:lyric-text",
    )?.textContent || undefined;
  const d = parse(text),
    data = manifest(d);
  if (!data || data.version !== 1)
    throw Error(i18nText("canonical-xml.message016"));
  if (
    data.measures.length !== s.measures.length ||
    data.measures.some((m, i) => m.id !== s.measures[i].id)
  )
    throw Error(i18nText("canonical-xml.message017"));
  Object.assign(s, metadataFromXML(text));
  data.measures.forEach((m, i) =>
    Object.assign(s.measures[i], {
      label: m.label,
      beats: m.beats,
      denominator: m.denominator,
      start: m.start,
      end: m.end,
    }),
  );
  const part = kids(d.documentElement, "part").find(
    (p) => p.id === data.partId,
  );
  if (!part) throw Error(i18nText("canonical-xml.message018"));
  const bpm = Number(part.querySelector("sound[tempo]")?.getAttribute("tempo"));
  if (bpm > 0) s.bpm = bpm;
  s.firstBeat = s.measures[0]?.start ?? s.firstBeat;
  const lyrics = new Map<string, Lyric>();
  let divisions = DIV;
  kids(part, "measure").forEach((m, i) => {
    let cursor = 0;
    const div = m.querySelector("attributes > divisions");
    if (div) divisions = Number(div.textContent);
    for (const e of Array.from(m.children)) {
      const duration =
        Number(child(e, "duration")?.textContent || 0) / divisions;
      if (e.localName === "backup") {
        cursor -= duration;
        continue;
      }
      if (e.localName === "forward") {
        cursor += duration;
        continue;
      }
      if (e.localName !== "note") continue;
      const voice = child(e, "voice")?.textContent || "",
        lyric = child(e, "lyric"),
        value =
          lyric &&
          kids(lyric, "text")
            .map((t) => t.textContent)
            .join("");
      if (lyric && kids(lyric, "text").length) {
        const meta = data.lyrics.find((l) => l.voice === voice);
        if (!meta) throw Error(i18nText("canonical-xml.message019"));
        lyrics.set(voice, {
          id: meta.id,
          text: value || "",
          confirmed: meta.confirmed,
          time: 0,
          end: 0,
          scorePosition: {
            measureId: s.measures[i].id,
            quarterOffset: cursor,
            durationQuarters: duration,
          },
        });
      } else if (lyric && child(lyric, "extend")) {
        const l = lyrics.get(voice);
        if (l) l.scorePosition!.durationQuarters += duration;
      }
      if (!child(e, "chord")) cursor += duration;
    }
  });
  validateMeasureLyrics(data.measureLyrics, new Set(s.measures.map(m => m.id)));
  s.measureLyrics = data.measureLyrics?.map(l => ({ ...l }));
  s.lyrics = [...lyrics.values()];
  projectLyrics(s);
}
export async function ensureCanonical(record: RecordData) {
  if (record.canonicalXML) return;
  let base: string | undefined;
  const xml =
    record.song.scoreFormat === "musicxml"
      ? record.pdf
      : record.otherScores?.find((s) => s.format === "musicxml")?.source;
  if (xml) {
    base = await (await import("./musicxml")).readMusicXML(xml);
    const meta = metadataFromXML(base);
    for (const key of [
      "originalTitle",
      "composer",
      "lyricist",
      "artist",
    ] as const)
      record.song[key] ||= meta[key];
  }
  record.canonicalXML = writeCanonical(
    record.song,
    base,
    await audioHash(record.audio),
  );
}
export function saveCanonical(record: RecordData) {
  record.canonicalXML = writeCanonical(record.song, record.canonicalXML);
}
const hashes = new WeakMap<Blob, Promise<string>>();
async function audioHash(blob: Blob) {
  let p = hashes.get(blob);
  if (!p) {
    p = blob
      .arrayBuffer()
      .then((b) => crypto.subtle.digest("SHA-256", b))
      .then((b) =>
        Array.from(new Uint8Array(b), (v) =>
          v.toString(16).padStart(2, "0"),
        ).join(""),
      );
    hashes.set(blob, p);
  }
  return p;
}
export async function verifyCanonicalAudio(record: RecordData) {
  const expected =
    record.canonicalXML && manifest(parse(record.canonicalXML))?.audioSHA256;
  if (expected && expected !== (await audioHash(record.audio)))
    throw Error(i18nText("canonical-xml.message020"));
}
export function vocalLyrics(
  s: Song,
  parsed: import("./musicxml").XMLScore,
): Lyric[] {
  if (
    parsed.measures.length !== s.measures.length ||
    parsed.measures.some(
      (m, i) =>
        m.beats !== s.measures[i].beats ||
        m.denominator !== s.measures[i].denominator,
    )
  )
    throw Error(i18nText("canonical-xml.message021"));
  if (!parsed.lyrics.length) throw Error(i18nText("canonical-xml.message022"));
  return parsed.lyrics.map((l, i) => ({
    id: crypto.randomUUID(),
    text: l.text,
    confirmed: false,
    time: 0,
    end: 0,
    scorePosition: {
      measureId: s.measures[l.measure].id,
      quarterOffset: (l.beat * 4) / s.measures[l.measure].denominator,
      durationQuarters: Math.max(
        1 / DIV,
        (l.duration * 4) / s.measures[l.measure].denominator,
      ),
    },
  }));
}
/** Keep the complete imported vocal notation, as well as its lyric rhythm projection. */
export function withVocalSource(base: string, source: Document) {
  const d = parse(base),
    root = d.documentElement;
  const old = kids(root, "part").find(
    (p) => p.id === "DrumPracticeVocalSource",
  );
  old?.remove();
  const list = child(root, "part-list");
  kids(list, "score-part")
    .find((p) => p.id === "DrumPracticeVocalSource")
    ?.remove();
  const part = source.querySelector("score-partwise > part"),
    sp = source.querySelector("part-list > score-part");
  if (!part || !sp) throw Error(i18nText("canonical-xml.message023"));
  const cp = d.importNode(part, true),
    cs = d.importNode(sp, true);
  cp.id = cs.id = "DrumPracticeVocalSource"; // Avoid source note IDs colliding with existing drum notation.
  for (const el of Array.from(cp.querySelectorAll("[id]")))
    el.setAttribute("id", "Vocal-" + el.getAttribute("id"));
  for (const el of Array.from(cs.querySelectorAll("[id]")))
    el.setAttribute("id", "Vocal-" + el.getAttribute("id"));

  list.append(cs);
  root.append(cp);
  return new XMLSerializer().serializeToString(d);
}
export function importedCanonical(text: string, s: Song): string | undefined {
  const data = manifest(parse(text));
  if (!data) return;
  if (
    data.measures.length !== s.measures.length ||
    data.measures.some(
      (m, i) =>
        m.beats !== s.measures[i].beats ||
        m.denominator !== s.measures[i].denominator,
    )
  )
    throw Error(i18nText("canonical-xml.message024"));
  s.measures.forEach((m, i) => {
    m.id = data.measures[i].id;
  });
  return text;
}
export function hasDrumNotation(text: string) {
  const d = parse(text),
    p = manifest(d)?.partId;
  return kids(d.documentElement, "part").some(
    (e) => e.id !== p && e.id !== "DrumPracticeVocalSource",
  );
}
