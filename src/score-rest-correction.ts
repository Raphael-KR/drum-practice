import type { RecordData } from "./storage";
import { songScores } from "./song-scores";
/** Exact reviewed bar only. Respect explicit placements from later user edits. */
export function correctMeasureFiveRests(text: string): {
  text: string;
  changed: boolean;
} {
  const d = new DOMParser().parseFromString(text, "application/xml");
  if (d.querySelector("parsererror"))
    throw Error("MusicXML을 읽을 수 없습니다.");
  const m = d.querySelector('part[id="P1"] > measure[number="5"]');
  if (!m) return { text, changed: false };
  const notes = Array.from(m.children).filter((n) => n.tagName === "note");
  const upper = notes.filter(
    (n) => n.querySelector("voice")?.textContent === "1",
  );
  const lower = notes.filter(
    (n) => n.querySelector("voice")?.textContent === "2",
  );
  const rests = notes.filter((n) => n.querySelector("rest"));
  if (
    upper.length !== 8 ||
    lower.length !== 4 ||
    rests.length !== 6 ||
    upper.filter(
      (n) =>
        n.querySelector("rest") &&
        n.querySelector("type")?.textContent === "eighth",
    ).length !== 2 ||
    !lower.every(
      (n) =>
        n.querySelector("rest") &&
        n.querySelector("type")?.textContent === "quarter",
    )
  )
    return { text, changed: false };
  let changed = false;
  for (const n of rests) {
    const r = n.querySelector("rest")!;
    if (r.children.length) continue;
    const isUpper = n.querySelector("voice")!.textContent === "1";
    for (const [tag, value] of [
      ["display-step", isUpper ? "A" : "D"],
      ["display-octave", isUpper ? "5" : "4"],
    ]) {
      const e = d.createElement(tag);
      e.textContent = value;
      r.append(e);
    }
    changed = true;
  }
  return {
    text: changed ? new XMLSerializer().serializeToString(d) : text,
    changed,
  };
}
/** PDF-audited roles for this conversion: voice 1 mixes cymbal and drum events.
 * Shared full-bar silence remains central; voice 2 is exclusively the kick lane.
 */
export function fixAllDrumRestPositions(text: string): {
  text: string;
  changed: boolean;
  counts: Record<string, number>;
} {
  const d = new DOMParser().parseFromString(text, "application/xml");
  if (d.querySelector("parsererror"))
    throw Error("MusicXML을 읽을 수 없습니다.");
  const part = d.querySelector('part[id="P1"]');
  const counts = { cymbal: 0, drum: 0, kick: 0 };
  let changed = false;
  if (!part) return { text, changed, counts };
  const upperBars = new Set([5, 6, 36, 39, 40, 68, 72, 80, 91, 94, 96]);
  const middleBars = new Set([1, 2, 3, 4, 8, 107, 109, 110]);
  for (const m of Array.from(part.children).filter(
    (n) => n.tagName === "measure",
  )) {
    let voiceOneRest = 0;
    for (const n of Array.from(m.children).filter(
      (n) => n.tagName === "note",
    )) {
      const rest = n.querySelector("rest");
      if (!rest) continue;
      const voice = n.querySelector("voice")?.textContent,
        number = Number(m.getAttribute("number"));
      let lane: keyof typeof counts;
      if (voice === "2") lane = "kick";
      else if (voice === "1") {
        voiceOneRest++;
        if (upperBars.has(number)) lane = "cymbal";
        else if (middleBars.has(number)) lane = "drum";
        else if (number === 84 || number === 108)
          lane = voiceOneRest === 1 ? "cymbal" : "drum";
        else throw Error(`${number}마디 쉼표의 악기 그룹을 확인해야 합니다.`);
      } else throw Error(`${number}마디의 알 수 없는 쉼표 성부입니다.`);
      counts[lane]++;
      const [step, octave] =
        lane === "cymbal"
          ? ["A", "5"]
          : lane === "drum"
            ? ["B", "4"]
            : ["D", "4"];
      for (const [tag, value] of [
        ["display-step", step],
        ["display-octave", octave],
      ]) {
        let e = rest.querySelector(tag);
        if (e?.textContent === value) continue;
        if (!e) {
          e = d.createElement(tag);
          rest.append(e);
        }
        e.textContent = value;
        changed = true;
      }
    }
  }
  return {
    text: changed ? new XMLSerializer().serializeToString(d) : text,
    changed,
    counts,
  };
}
export async function correctStoredRests(
  record: RecordData,
  progress: (s: string) => void,
): Promise<RecordData> {
  if (record.song.id !== "real-paradis") return record;
  const xml = songScores(record).find((s) => s.format === "musicxml");
  if (!xml) return record;
  const { readMusicXML, renderMusicXML } = await import("./musicxml");
  const fixed = fixAllDrumRestPositions(await readMusicXML(xml.source));
  const canonical = record.canonicalXML
    ? fixAllDrumRestPositions(record.canonicalXML)
    : undefined;
  if (!fixed.changed && !canonical?.changed) return record;
  let result = {
    ...record,
    canonicalXML: canonical?.text ?? record.canonicalXML,
  };
  if (fixed.changed) {
    const source = new Blob([fixed.text], {
      type: "application/vnd.recordare.musicxml+xml",
    });
    const rendered = await renderMusicXML(source, progress, xml.partId);
    if (rendered.pages.length !== xml.pages.length)
      throw Error("쉼표 보정 후 페이지 수가 달라 적용을 중단했습니다.");
    if (record.song.scoreFormat === "musicxml")
      result = { ...result, pdf: source, pages: rendered.pages };
    else
      result = {
        ...result,
        otherScores: record.otherScores?.map((s) =>
          s.format === "musicxml" ? { ...s, source, pages: rendered.pages } : s,
        ),
      };
  }
  return result;
}
