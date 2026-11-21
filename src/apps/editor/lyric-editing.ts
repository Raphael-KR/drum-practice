import type { Lyric, Song } from "../../model/model";
import type { RecordData } from "../../model/record";
import { projectLyrics } from "../../modules/lyrics/lyric-score";
import { joinLyricText } from "../../modules/score/lyric-groups";
import { t } from "../../shared/i18n/i18n";
export type LyricComponents = NonNullable<RecordData["lyricWork"]>["groups"];
/** Continuous quarter-note coordinates preserve tuplets until an item is actually moved. */
export function lyricAxis(song: Song) {
  let total = 0;
  const starts = song.measures.map((m) => {
    const at = total;
    total += (m.beats * 4) / m.denominator;
    return at;
  });
  const at = (lyric: Lyric) => {
    const p = lyric.scorePosition,
      i = song.measures.findIndex((m) => m.id === p?.measureId);
    if (!p || i < 0) throw Error(t("lyric-score.message092"));
    return starts[i] + p.quarterOffset;
  };
  const position = (quarter: number, duration: number) => {
    if (
      !Number.isFinite(quarter) ||
      quarter < 0 ||
      quarter >= total - 1e-9 ||
      quarter + duration > total + 1e-9
    )
      throw Error(t("editorWork.songEnd"));
    let i = starts.length - 1;
    while (i > 0 && quarter < starts[i] - 1e-9) i--;
    i = Math.max(0, i);
    return {
      measureId: song.measures[i].id,
      quarterOffset: Math.max(0, quarter - starts[i]),
      durationQuarters: duration,
    };
  };
  return { starts, total, at, position };
}
export function moveLyric(
  song: Song,
  id: string,
  target: number,
  division: number,
  groups: LyricComponents = {},
) {
  const axis = lyricAxis(song),
    step = 4 / division,
    index = song.lyrics.findIndex((l) => l.id === id);
  if (index < 0 || ![8, 16, 32, 64].includes(division))
    throw Error(t("editorWork.invalidSelection"));
  const nextGrid = (value: number) =>
    (Math.floor((value + 1e-9) / step) + 1) * step;
  let start = Math.max(0, Math.round(target / step) * step);
  if (index) {
    const previous = song.lyrics[index - 1];
    const parts = groups[previous.id];
    const tail =
      axis.at(previous) +
      Math.max(0, ...(parts ?? []).map((p) => p.offsetQuarters));
    start = Math.max(start, nextGrid(tail));
  }
  const result = structuredClone(song);
  for (let i = index; i < result.lyrics.length; i++) {
    const l = result.lyrics[i];
    if (i > index && axis.at(l) > start + 1e-9) break;
    if (i > index) start = nextGrid(start);
    l.scorePosition = axis.position(start, l.scorePosition!.durationQuarters);
    const components = groups[l.id];
    // A moved group retains its internal onsets. Later groups must remain after its last component.
    start += Math.max(0, ...(components ?? []).map((p) => p.offsetQuarters));
  }
  projectLyrics(result);
  return result.lyrics;
}
export function mergeLyrics(
  song: Song,
  ids: string[],
  groups: LyricComponents = {},
) {
  const indices = ids
    .map((id) => song.lyrics.findIndex((l) => l.id === id))
    .sort((a, b) => a - b);
  if (
    indices.length < 2 ||
    indices[0] < 0 ||
    indices.some((v, i) => v !== indices[0] + i)
  )
    throw Error(t("editorWork.contiguous"));
  const axis = lyricAxis(song),
    selected = indices.map((i) => song.lyrics[i]),
    first = selected[0],
    start = axis.at(first);
  const components = selected.flatMap((l) => {
    const offset = axis.at(l) - start;
    return (
      groups[l.id]?.map((p) => ({
        ...structuredClone(p),
        offsetQuarters: p.offsetQuarters + offset,
      })) ?? [{ lyric: structuredClone(l), offsetQuarters: offset }]
    );
  });
  const merged = {
    ...structuredClone(first),
    text: selected.map((l) => l.text).reduce(joinLyricText),
    confirmed: selected.every((l) => l.confirmed),
    scorePosition: {
      ...first.scorePosition!,
      durationQuarters:
        Math.max(
          ...selected.map(
            (l) => axis.at(l) + l.scorePosition!.durationQuarters,
          ),
        ) - start,
    },
  };
  const lyrics = structuredClone(song.lyrics);
  lyrics.splice(indices[0], indices.length, merged);
  const updated = { ...groups };
  selected.forEach((l) => delete updated[l.id]);
  updated[first.id] = components;
  return { lyrics, groups: updated };
}
export function splitLyrics(
  song: Song,
  ids: string[],
  groups: LyricComponents = {},
) {
  const axis = lyricAxis(song),
    updated = { ...groups };
  let changed = false;
  const lyrics = song.lyrics.flatMap((l) => {
    const parts = ids.includes(l.id) ? groups[l.id] : undefined;
    if (!parts?.length) return [structuredClone(l)];
    changed = true;
    delete updated[l.id];
    return parts.map((p) => ({
      ...structuredClone(p.lyric),
      scorePosition: axis.position(
        axis.at(l) + p.offsetQuarters,
        p.lyric.scorePosition!.durationQuarters,
      ),
    }));
  });
  if (!changed) throw Error(t("editorWork.noComponents"));
  for (let i = 1; i < lyrics.length; i++)
    if (axis.at(lyrics[i]) <= axis.at(lyrics[i - 1]) + 1e-9)
      throw Error(t("editorWork.componentOrder"));
  const projected = { ...song, lyrics };
  projectLyrics(projected);
  return { lyrics: projected.lyrics, groups: updated };
}
