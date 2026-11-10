import type { Song } from "../../model/model";

interface PageOptions {
  url: string;
  alt: string;
}

/** All notation, lyrics and measure numbers scale together in the native SVG. */
export function fullScoreSurface({ url, alt }: PageOptions) {
  const surface = document.createElement("div");
  surface.className = "full-score-page";
  surface.setAttribute("role", "group");
  surface.setAttribute("aria-label", alt);
  const image = document.createElement("img");
  image.src = url;
  image.alt = alt;
  surface.append(image);
  return surface;
}

/** Keep the renderer lazy; every score uses the same continuous layout, including lyric-free scores. */
export async function prepareFullScore(
  song: Song,
  canonicalXML: string | undefined,
  partId?: string,
) {
  if (!canonicalXML)
    throw Error(
      `Full-score MusicXML unavailable: song=${song.id}, lyrics=${song.lyrics.length}, measureLyrics=${song.measureLyrics?.length ?? 0}`,
    );
  const { renderFullScore } = await import("./musicxml");
  return renderFullScore(canonicalXML, song, partId);
}
