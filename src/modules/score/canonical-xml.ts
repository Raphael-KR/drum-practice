import { readCanonicalLyrics } from "./canonical-lyric-read";
import { t as i18nText } from "../../shared/i18n/i18n";
import { sha256 } from "../../platform/browser/sha256";
import {
  validMeasureBeatTimes,
  validateMeasureLyrics,
  type Song,
  type Lyric,
} from "../../model/model";
import type { RecordData } from "../../model/record";
import { migrateLyricPositions, projectLyrics } from "../lyrics/lyric-score";
import {
  LEGACY_LYRIC_PART as PART,
  CANONICAL_FIELD as FIELD,
  LEGACY_CANONICAL_FIELD,
  LYRIC_DIVISIONS as DIV,
  canonicalManifest as manifest,
  type CanonicalManifest,
} from "./canonical-metadata";
import {
  xmlAdd as add,
  xmlChild as child,
  xmlChildren as kids,
} from "./canonical-xml-dom";
import { removeLyricVoices, writeLyricVoices } from "./canonical-lyric-voice";
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
function put(parent: Element, name: string, text: string) {
  const e = child(parent, name) || add(parent, name);
  e.textContent = text;
  return e;
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
  if (s.measures.some((m) => !validMeasureBeatTimes(m)))
    throw Error(i18nText("model.message385"));
  validateMeasureLyrics(s.measureLyrics, new Set(s.measures.map((m) => m.id)));
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
    LEGACY_CANONICAL_FIELD,
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
  if (old?.version === 1) {
    kids(root, "part")
      .find((p) => p.id === old.partId)
      ?.remove();
    kids(partList, "score-part")
      .find((p) => p.id === old.partId)
      ?.remove();
  }
  const candidates = kids(root, "part").filter(
    (p) => p.id !== "DrumPracticeVocalSource",
  );
  let part =
    candidates.find(
      (p) => p.id === (old?.version === 2 ? old.partId : s.scorePartId),
    ) || candidates[0];
  if (!part) {
    // Audio/PDF-only records still need lyric timing, but no invented drum notation.
    const sp = add(partList, "score-part", undefined, { id: PART });
    add(sp, "part-name", i18nText("canonical-xml.message014"));
    part = add(root, "part", undefined, { id: PART });
  }
  if (part.id === PART) {
    part.replaceChildren();
    s.measures.forEach((sm, index) => {
      const m = add(part!, "measure", undefined, { number: sm.label });
      const a = add(m, "attributes");
      add(a, "divisions", DIV);
      const previous = s.measures[index - 1];
      if (
        !previous ||
        previous.beats !== sm.beats ||
        previous.denominator !== sm.denominator
      ) {
        const time = add(a, "time");
        add(time, "beats", sm.beats);
        add(time, "beat-type", sm.denominator);
      }
      if (!index) {
        add(add(a, "clef"), "sign", "percussion");
        const direction = add(m, "direction");
        const met = add(add(direction, "direction-type"), "metronome");
        add(met, "beat-unit", "quarter");
        add(met, "per-minute", s.bpm);
        add(direction, "sound", undefined, { tempo: String(s.bpm) });
      }
      const note = add(m, "note", undefined, { "print-object": "no" });
      add(note, "rest");
      add(note, "duration", ((sm.beats * 4) / sm.denominator) * DIV);
      add(note, "voice", "1");
    });
  }
  if (old?.version === 2 && old.partId === part.id)
    removeLyricVoices(
      part,
      old.lyrics.map((l) => l.voice),
    );
  const identities = writeLyricVoices(part, s);
  const data: CanonicalManifest = {
    version: 2,
    partId: part.id,
    audioName: s.audioName,
    audioSHA256: audioSHA256 || old?.audioSHA256,
    measures: s.measures.map(
      ({ id, label, beats, denominator, start, end, beatTimes }) => ({
        id,
        label,
        beats,
        denominator,
        start,
        end,
        ...(beatTimes ? { beatTimes: [...beatTimes] } : {}),
        occurrence: 1,
      }),
    ),
    ...(s.measureLyrics?.length
      ? { measureLyrics: s.measureLyrics.map((l) => ({ ...l })) }
      : {}),
    lyrics: identities,
  };
  add(misc, "miscellaneous-field", JSON.stringify(data), { name: FIELD });
  return new XMLSerializer().serializeToString(d);
}
export function readCanonical(text: string, s: Song): void {
  const d = parse(text),
    data = manifest(d);
  s.lyricText =
    Array.from(d.querySelectorAll("miscellaneous-field")).find(
      (e) => e.getAttribute("name") === "drum-practice:lyric-text",
    )?.textContent || undefined;
  if (!data || (data.version !== 1 && data.version !== 2))
    throw Error(i18nText("canonical-xml.message016"));
  if (
    data.measures.length !== s.measures.length ||
    data.measures.some(
      (m, i) => m.id !== s.measures[i].id || !validMeasureBeatTimes(m),
    )
  )
    throw Error(i18nText("canonical-xml.message017"));
  Object.assign(s, metadataFromXML(text));
  data.measures.forEach((m, i) => {
    delete s.measures[i].beatTimes;
    Object.assign(s.measures[i], {
      label: m.label,
      beats: m.beats,
      denominator: m.denominator,
      start: m.start,
      end: m.end,
      ...(m.beatTimes ? { beatTimes: [...m.beatTimes] } : {}),
    });
  });
  const part = kids(d.documentElement, "part").find(
    (p) => p.id === data.partId,
  );
  if (!part) throw Error(i18nText("canonical-xml.message018"));
  const bpm = Number(part.querySelector("sound[tempo]")?.getAttribute("tempo"));
  if (bpm > 0) s.bpm = bpm;
  s.firstBeat = s.measures[0]?.start ?? s.firstBeat;
  validateMeasureLyrics(
    data.measureLyrics,
    new Set(s.measures.map((m) => m.id)),
  );
  s.measureLyrics = data.measureLyrics?.map((l) => ({ ...l }));
  s.lyrics = readCanonicalLyrics(d, data);
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
    p = blob.arrayBuffer().then(sha256);
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
  return parsed.lyrics.map((l) => ({
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
    data = manifest(d);
  return kids(d.documentElement, "part").some(
    (e) =>
      e.id !== (data?.version === 1 ? data.partId : PART) &&
      e.id !== "DrumPracticeVocalSource",
  );
}
