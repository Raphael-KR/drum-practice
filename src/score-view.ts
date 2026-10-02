import { scoreAnchorCorrections } from './score-anchor-data';
import type { Region, Song } from './model';
import pdfDisplayCrops from './pdf-display-crops.json';

/** Display-only horizontal crop. Preserve absolute page coordinates of every beat. */
export function trimRegionLeft(region: Region, left: number): Region {
  const trim = left - region.x;
  if (!Number.isFinite(left) || trim <= 0 || trim >= region.w) return region;
  const fraction = trim / region.w;
  return {
    ...region,
    x: left,
    w: region.w - trim,
    // Do not clamp: a musical anchor before the visible crop remains before it.
    beatXs: region.beatXs.map(x => (x - fraction) / (1 - fraction)),
  };
}

// Verified source-page trim for the supplied Real Paradis score (612pt wide).
// Only its system-start regions contain the repeated percussion clef at 59–66pt.
// Stop at 69pt: before the first notes and printed time signatures.
export function displayRegion(song: Song, region: Region): Region {
  if (song.scoreFormat === 'musicxml') return region;
  if (song.id === pdfDisplayCrops.songId) {
    const crop = pdfDisplayCrops.regions.find(c => c.id === region.id &&
      (['page','x','y','w','h'] as const).every(k => Math.abs(c[k] - region[k]) < 1e-8));
    if (crop) return trimRegionLeft(region, crop.left);
  }
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
  return trimRegionLeft(region, region.x + trim);
}
