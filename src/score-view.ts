import type { Region, Song } from './model';

// Verified source-page trim for the supplied Real Paradis score (612pt wide).
// Only its system-start regions contain the repeated percussion clef at 59–66pt.
// Stop at 69pt: before the first notes and printed time signatures.
export function displayRegion(song: Song, region: Region): Region {
  // m41 has a tom pattern, so the cymbal-only extractor left beatXs empty.
  // PDF notehead centers (612pt page): beats 1–4; retain explicit user calibration.
  if (song.id === 'real-paradis' && region.id === 'r41' && !region.beatXs.length &&
      region.page === 1 && Math.abs(region.x * 612 - 54.03) < 0.5 &&
      Math.abs(region.w * 612 - 138.99) < 0.5) {
    region = {...region, beatXs: [77.37,104.70,136.73,164.07].map(x =>
      (x / 612 - region.x) / region.w).concat(1)};
  }
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
