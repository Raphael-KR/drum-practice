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
export async function correctStoredRests(
  record: RecordData,
  progress: (s: string) => void,
): Promise<RecordData> {
  if (record.song.id !== "real-paradis") return record;
  const xml = songScores(record).find((s) => s.format === "musicxml");
  if (!xml) return record;
  const { readMusicXML, renderMusicXML } = await import("./musicxml");
  const fixed = correctMeasureFiveRests(await readMusicXML(xml.source));
  const canonical = record.canonicalXML
    ? correctMeasureFiveRests(record.canonicalXML)
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
