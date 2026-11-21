/** Center a rest's ink within its display span without moving the rhythmic onset. */
export const REST_LAYOUT_VERSION = "svg-geometry-sync-v19";
export function restCenterShift(
  left: number,
  right: number,
  glyphX: number,
  glyphWidth: number,
): number {
  return (left + right) / 2 - (glyphX + glyphWidth / 2);
}
