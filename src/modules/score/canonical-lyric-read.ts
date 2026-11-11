import type { Lyric } from "../../model/model";
import type { CanonicalManifest } from "./canonical-metadata";
import { LYRIC_DIVISIONS as DIV } from "./canonical-metadata";
import { xmlChild as child, xmlChildren as kids } from "./canonical-xml-dom";
import { t as i18nText } from "../../shared/i18n/i18n";

/** Restore owned lyric identities and independent rhythm from either canonical format. */
export function readCanonicalLyrics(
  d: Document,
  data: CanonicalManifest,
): Lyric[] {
  const part = kids(d.documentElement, "part").find(
    (p) => p.id === data.partId,
  );
  if (!part) throw Error(i18nText("canonical-xml.message018"));
  const lyrics = new Map<string, Lyric>();
  const activeVoice = new Map<string, Lyric>();
  let divisions = data.version === 1 ? DIV : 1;
  kids(part, "measure").forEach((m, i) => {
    let cursor = 0;
    for (const e of Array.from(m.children)) {
      if (e.localName === "attributes") {
        const div = child(e, "divisions");
        if (div) divisions = Number(div.textContent);
      }
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
        const meta =
          data.version === 1
            ? data.lyrics.find((l) => l.voice === voice)
            : data.lyrics.find((l) => l.noteId === e.id);
        if (!meta) {
          if (data.version === 2) {
            // Imported drum lyrics are not the managed lyric voice.
            if (!child(e, "chord")) cursor += duration;
            continue;
          }
          throw Error(i18nText("canonical-xml.message019"));
        }
        const restored: Lyric = {
          id: meta.id,
          text: value || "",
          confirmed: meta.confirmed,
          time: 0,
          end: 0,
          scorePosition: {
            measureId: data.measures[i].id,
            quarterOffset: cursor,
            durationQuarters: duration,
          },
        };
        lyrics.set(meta.id, restored);
        activeVoice.set(voice, restored);
      } else if (lyric && child(lyric, "extend")) {
        const l = activeVoice.get(voice);
        if (l) l.scorePosition!.durationQuarters += duration;
      }
      if (!child(e, "chord")) cursor += duration;
    }
  });
  return data.lyrics.map((meta) => {
    const lyric = lyrics.get(meta.id);
    if (!lyric)
      throw Error(
        `Missing canonical lyric: id=${meta.id}, voice=${meta.voice}, version=${data.version}`,
      );
    return lyric;
  });
}
