/** Full-bar silence is centered visually; its rhythmic onset stays at beat zero. */
export const REST_LAYOUT_VERSION = "centered-hollow-v2";
export function restCenterShift(
  left: number,
  right: number,
  glyphX: number,
  glyphWidth: number,
): number {
  return (left + right) / 2 - (glyphX + glyphWidth / 2);
}
