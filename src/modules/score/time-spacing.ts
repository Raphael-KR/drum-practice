/** Unscaled SVG units. Reuse the existing ribbon inset and quarter-note scale. */
export const TIME_SPACING = { quarter: 64, offset: 8 } as const;
export const RIBBON_HEAD_ANCHOR = 6;
export const SCORE_LYRIC_POINTS = 13;
export interface TimeSpacing {
  quarter: number;
  offset: number;
}
export function timePosition(
  quarter: number,
  spacing: TimeSpacing = TIME_SPACING,
) {
  return spacing.offset + RIBBON_HEAD_ANCHOR + quarter * spacing.quarter;
}
export function timeMeasureWidth(
  duration: number,
  spacing: TimeSpacing = TIME_SPACING,
) {
  return timePosition(duration, spacing);
}
/** Fit a complete row only when it exceeds the viewport; short rows stay short. */
export function rowScale(widths: readonly number[], available: number) {
  const width = widths.reduce((sum, value) => sum + value, 0);
  return width > 0 ? Math.min(1, available / width) : 1;
}
