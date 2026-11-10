import { t as i18nText } from "../../shared/i18n/i18n";
import { matchBundledPDFLayout } from "../../content/score-system-layout";
import { normalizeBundledDrumNotation } from "./drum-notation";
import type { RecordData } from "../../model/record";
import type { Region } from "../../model/model";
import { songScores } from "./song-scores";
import { lyricVoiceNotes } from "./canonical-lyric-voice";
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
    throw Error(i18nText("score-rest-correction.message528"));
  const part = d.querySelector('part[id="P1"]');
  const counts = { cymbal: 0, drum: 0, kick: 0, fullBar: 0 };
  let changed = false;
  if (!part) return { text, changed, counts };
  const lyricNotes = lyricVoiceNotes(part);
  const upperBars = new Set([5, 6, 36, 39, 40, 68, 72, 80, 91, 94, 96]);
  const middleBars = new Set([1, 2, 3, 4, 8, 107, 109, 110]);
  for (const m of Array.from(part.children).filter(
    (n) => n.tagName === "measure",
  )) {
    const notes = Array.from(m.children).filter(
      (n) => n.tagName === "note" && !lyricNotes.has(n),
    );
    // Vocal timing notes/rests neither determine drum silence nor need drum placement.
    const silentMeasure = notes.every((n) => n.querySelector("rest"));
    let voiceOneRest = 0;
    for (const n of notes) {
      const rest = n.querySelector("rest");
      if (!rest) continue;
      // Shared full-bar silence uses the renderer's default vertical/central placement.
      // Keep role-specific heights when another voice is playing in this measure.
      if (silentMeasure && rest.getAttribute("measure") === "yes") {
        counts.fullBar++;
        for (const e of Array.from(rest.children)) {
          if (e.tagName === "display-step" || e.tagName === "display-octave") {
            e.remove();
            changed = true;
          }
        }
        continue;
      }
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
        else
          throw Error(
            i18nText("score-rest-correction.message529", { number: number }),
          );
      } else {
        console.error("Unknown drum rest voice", {
          partId: part.id,
          measure: m.getAttribute("number"),
          voice: voice ?? null,
          expectedVoices: ["1", "2"],
        });
        throw Error(
          i18nText("score-rest-correction.message530", { number: number }),
        );
      }
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
  const normalize = (text: string) => {
    const a = fixAllDrumRestPositions(text),
      b = normalizeBundledDrumNotation(a.text),
      c = matchBundledPDFLayout(b.text);
    return { text: c.text, changed: a.changed || b.changed || c.changed };
  };
  const fixed = normalize(await readMusicXML(xml.source));
  const canonical = record.canonicalXML
    ? normalize(record.canonicalXML)
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
    if (record.song.scoreFormat === "musicxml")
      result = {
        ...result,
        pdf: source,
        pages: rendered.pages,
        song: {
          ...result.song,
          pageCount: rendered.pages.length,
          regions: refreshedRegions(xml.regions, rendered.regions),
        },
      };
    else
      result = {
        ...result,
        otherScores: record.otherScores?.map((s) =>
          s.format === "musicxml"
            ? {
                ...s,
                source,
                pages: rendered.pages,
                regions: refreshedRegions(s.regions, rendered.regions),
              }
            : s,
        ),
      };
  }
  return result;
}

/** Geometry belongs to the generated page; retain IDs referenced by song measures. */
function refreshedRegions(previous: Region[], generated: Region[]): Region[] {
  if (
    previous.length !== generated.length ||
    previous.some((r, i) => r.id !== generated[i].id)
  )
    throw Error(i18nText("score-rest-correction.message531"));
  return generated.map((r) => ({ ...r }));
}
