import { t as i18nText } from "./i18n";
import { validateSong, type Song } from "./model";
import type { RecordData } from "./storage";
import type { PortableShell } from "./portable";
export interface PlaybackInitial {
  restartMeasure: boolean;
  countOff: boolean;
  fullscreen: boolean;
  highlight: boolean;
}
export interface PlaybackAsset {
  type: string;
  base64: string;
}
export interface PlaybackExportV2 {
  version: 2;
  song: Song;
  audio: PlaybackAsset;
  pages: PlaybackAsset[];
  initial: PlaybackInitial;
  scores?: PlaybackScore[];
}
export const playbackInitial: PlaybackInitial = {
  restartMeasure: true,
  countOff: true,
  fullscreen: false,
  highlight: true,
};
export async function encodePlaybackAsset(blob: Blob): Promise<PlaybackAsset> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 32768)
    binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return { type: blob.type, base64: btoa(binary) };
}
export function decodePlaybackAsset(a: PlaybackAsset) {
  if (!a || typeof a.type !== "string" || typeof a.base64 !== "string")
    throw Error(i18nText("playback-export.message421"));
  return new Blob([Uint8Array.from(atob(a.base64), (c) => c.charCodeAt(0))], {
    type: a.type,
  });
}
/** Explicit fields at every level: no authoring record is copied into playback. */
export function playbackSong(s: Song): Song {
  return {
    version: 1,
    id: s.id,
    title: s.title,
    artist: s.artist,
    bpm: s.bpm,
    firstBeat: s.firstBeat,
    scoreFormat: s.scoreFormat ?? "pdf",
    pageCount: s.pageCount,
    pdfName: "",
    audioName: "",
    measures: s.measures.map((m) => ({
      id: m.id,
      regionId: m.regionId,
      label: m.label,
      beats: m.beats,
      denominator: m.denominator,
      start: m.start,
      end: m.end,
    })),
    regions: s.regions.map((r) => ({
      id: r.id,
      page: r.page,
      x: r.x,
      y: r.y,
      w: r.w,
      h: r.h,
      beatXs: [...r.beatXs],
    })),
    lyrics: s.lyrics.map((l) => ({
      id: l.id,
      text: l.text,
      time: l.time,
      end: l.end,
      confirmed: l.confirmed,
    })),
    markers: s.markers
      .slice(-3)
      .map((m) => ({ id: m.id, name: m.name, time: m.time })),
    loops: s.loops.slice(0, 1).map((l) => ({
      id: l.id,
      name: l.name,
      start: l.start,
      end: l.end,
    })),
    settings: {
      rate: s.settings.rate,
      click: s.settings.click,
      musicVolume: s.settings.musicVolume,
      clickVolume: s.settings.clickVolume,
      countIn: 1,
      countEach: false,
      zoom: s.settings.zoom,
      view: s.settings.view === "rows" ? "rows" : "ribbon",
      position: s.measures[0]?.start ?? 0,
    },
  };
}
export function validatePlayback(
  data: unknown,
): asserts data is PlaybackExportV2 {
  const d = data as PlaybackExportV2;
  if (!d || d.version !== 2)
    throw Error(i18nText("playback-export.message422"));
  validateSong(d.song);
  if (
    !["pdf", "musicxml"].includes(d.song.scoreFormat || "") ||
    !Array.isArray(d.pages) ||
    d.pages.length !== d.song.pageCount
  )
    throw Error(i18nText("playback-export.message423"));
  if (!d.audio?.base64 || !d.audio.type?.startsWith("audio/"))
    throw Error(i18nText("playback-export.message424"));
  if (
    !d.initial ||
    Object.keys(playbackInitial).some(
      (k) => typeof d.initial[k as keyof PlaybackInitial] !== "boolean",
    )
  )
    throw Error(i18nText("playback-export.message425"));
  if (
    !d.song.measures.length ||
    d.song.regions.some((r) => r.page >= d.pages.length)
  )
    throw Error(i18nText("playback-export.message426"));
  if (d.scores !== undefined) {
    if (
      !Array.isArray(d.scores) ||
      d.scores.length > 1 ||
      new Set(d.scores.map((v) => v.song?.scoreFormat)).size !== d.scores.length
    )
      throw Error(i18nText("playback-export.message427"));
    for (const variant of d.scores) {
      if (variant.song.scoreFormat === d.song.scoreFormat)
        throw Error(i18nText("playback-export.message428"));
      validatePlayback({ ...d, scores: undefined, ...variant });
      if (
        variant.song.measures.length !== d.song.measures.length ||
        variant.song.measures.some(
          (m, i) =>
            m.id !== d.song.measures[i].id ||
            m.start !== d.song.measures[i].start ||
            m.end !== d.song.measures[i].end,
        )
      )
        throw Error(i18nText("playback-export.message429"));
    }
  }
  const types =
    d.song.scoreFormat === "pdf"
      ? ["image/png", "image/jpeg", "image/webp"]
      : ["image/svg+xml", "application/vnd.drum-practice.svg+gzip"];
  if (d.pages.some((a) => !a?.base64 || !types.includes(a.type)))
    throw Error(i18nText("playback-export.message430"));
}
export async function packPlayback(
  record: RecordData,
  initial: PlaybackInitial = playbackInitial,
): Promise<PlaybackExportV2> {
  if (!record.audio.size) throw Error(i18nText("playback-export.message424"));
  const song = playbackSong(record.song),
    pages = [...record.pages],
    audio = record.audio;
  const data: PlaybackExportV2 = {
    version: 2,
    song,
    initial: {
      restartMeasure: initial.restartMeasure,
      countOff: initial.countOff,
      fullscreen: initial.fullscreen,
      highlight: initial.highlight,
    },
    audio: await encodePlaybackAsset(audio),
    pages: await Promise.all(pages.map(encodePlaybackAsset)),
  };
  validatePlayback(data);
  return data;
}
const json = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
export function makePlaybackHTML(
  shell: PortableShell,
  data: PlaybackExportV2 | null,
) {
  if (data) validatePlayback(data);
  if (/<\/script/i.test(shell.runtime) || /<\/style/i.test(shell.css))
    throw Error(i18nText("playback-export.message431"));
  return (
    '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\' blob:; style-src \'unsafe-inline\'; img-src blob: data:; worker-src blob:; media-src blob: data:; connect-src \'none\'; font-src data:"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>' +
    i18nText("main.message097") +
    '</title><style id="portable-style">' +
    String(shell.css) +
    '</style></head><body><div id="app"><p role="status">' +
    i18nText("playback-export.message432") +
    '</p></div><script type="application/json" id="portable-data">' +
    String(json(data)) +
    '</script><script type="application/json" id="portable-worker">' +
    String(json(shell.worker)) +
    '</script><script type="application/json" id="portable-licenses">' +
    String(json(shell.licenses)) +
    '</script><script id="portable-runtime">' +
    String(shell.runtime) +
    "</script></body></html>"
  );
}

/** Both rendered formats share a single audio asset; editing sources stay out. */
export interface PlaybackScore {
  song: Song;
  pages: PlaybackAsset[];
}
export async function packCombinedPlayback(
  record: RecordData,
  initial = playbackInitial,
) {
  const { songScores, useScore } = await import("./song-scores");
  const snapshot = {
    ...record,
    song: structuredClone(record.song),
    otherScores: structuredClone(record.otherScores),
  };
  const data = await packPlayback(snapshot, initial);
  const variants = songScores(snapshot);
  data.scores = [];
  for (const variant of variants.filter(
    (v) => v.format !== data.song.scoreFormat,
  )) {
    const selected = useScore(snapshot, variant);
    const entry = {
      song: playbackSong(selected.song),
      pages: await Promise.all(selected.pages.map(encodePlaybackAsset)),
    };
    validatePlayback({ ...data, scores: undefined, ...entry });
    data.scores.push(entry);
  }
  // Use the original app selection on first open; switching remains session-only.
  validatePlayback(data);
  return data;
}

export async function readPlaybackData(
  text: string,
): Promise<PlaybackExportV2> {
  const data = JSON.parse(text);
  validatePlayback(data);
  return data;
}
