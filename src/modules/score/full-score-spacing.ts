import type { GraphicalMeasure } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalMeasure";
import type { MusicSystem } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/MusicSystem";
import { canonicalManifest } from "./canonical-metadata";
import { TIME_SPACING, type TimeSpacing } from "./time-spacing";

const systemSpacing = new WeakMap<MusicSystem, TimeSpacing>();

/** The canonical manifest identifies authored rows; song names never select layout. */
export function fullWidthSystemStarts(document: Document, partId: string) {
  const data = canonicalManifest(document);
  if (!data?.fullWidthSystems?.length || data.partId !== partId)
    return new Set<number>();
  return new Set(
    data.fullWidthSystems.map((id) => {
      const index = data.measures.findIndex((measure) => measure.id === id);
      if (index < 0)
        throw Error(
          `Full-width system start not found: part=${partId}, id=${id}`,
        );
      return index;
    }),
  );
}

/** Notes, native lyrics, words and centered rests share each row's musical axis. */
export function scoreMeasureSpacing(
  measure: GraphicalMeasure,
  fallback: TimeSpacing = TIME_SPACING,
) {
  return systemSpacing.get(measure.ParentMusicSystem) ?? fallback;
}

/** Expand rhythmic spacing only; instruction margins and glyph sizes stay native. */
export function expandFullWidthSystem(system: MusicSystem, extraWidth: number) {
  const realMeasures = system.StaffLines[0].Measures.filter(
    (measure) => !measure.IsExtraGraphicalMeasure,
  );
  const quarters = realMeasures.reduce(
    (sum, measure) => sum + measure.parentSourceMeasure.Duration.RealValue * 4,
    0,
  );
  if (extraWidth <= 0 || quarters <= 0) return 0;
  const extraQuarter = (extraWidth * 10) / quarters;
  const spacing = {
    ...TIME_SPACING,
    quarter: TIME_SPACING.quarter + extraQuarter,
  };
  systemSpacing.set(system, spacing);
  for (const staff of system.StaffLines)
    for (const measure of staff.Measures) {
      if (measure.IsExtraGraphicalMeasure) continue;
      measure.minimumStaffEntriesWidth +=
        (measure.parentSourceMeasure.Duration.RealValue * 4 * extraQuarter) /
        10;
    }
  return extraWidth;
}
