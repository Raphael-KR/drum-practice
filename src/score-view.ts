import type { Region, Song } from './model';

// Verified source-page trim for the supplied Real Paradis score (612pt wide).
// Only its system-start regions contain the repeated percussion clef at 59–66pt.
// Stop at 69pt: before the first notes and printed time signatures.
export function displayRegion(song: Song, region: Region): Region {
  // Keep the opening context (Intro, clef and initial meter) intact.
  if (region.id === song.measures[0]?.regionId) return region;
  if (song.id !== 'real-paradis' || Math.abs(region.x * 612 - 54) > 0.5)
    return region;
  const trim = 15 / 612;
  if (region.w <= trim) return region;
  const fraction = trim / region.w;
  return {
    ...region,
    x: region.x + trim,
    w: region.w - trim,
    beatXs: region.beatXs.map(x => Math.max(0, (x - fraction) / (1 - fraction))),
  };
}
