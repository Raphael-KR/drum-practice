import { scoreAnchorCorrections } from './score-anchor-data';
import type { Region, Song } from './model';

// Verified source-page trim for the supplied Real Paradis score (612pt wide).
// Only its system-start regions contain the repeated percussion clef at 59–66pt.
// Stop at 69pt: before the first notes and printed time signatures.
export function displayRegion(song: Song, region: Region): Region {
  // Only fill missing anchors for the exact reviewed source crop.
  const correction = scoreAnchorCorrections[region.id as keyof typeof scoreAnchorCorrections];
  if (song.id === 'real-paradis' && !region.beatXs.length && correction &&
      ['page','x','y','w','h'].every(k => Math.abs(region[k as 'x'] - correction[k as 'x']) < 1e-8)) {
    const measure=song.measures.find(m=>m.regionId===region.id);
    if(measure && (correction.kind==='symbolic' || correction.points.length===measure.beats)) {
      region={...region,beatXs:correction.kind==='symbolic'
        ? Array.from({length:measure.beats+1},(_,i)=>i/measure.beats)
        : [...correction.points.map(x=>(x/612-region.x)/region.w),1]};
    }
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
