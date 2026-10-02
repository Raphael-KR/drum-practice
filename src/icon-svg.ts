import { markerShape } from "./marker-icon";
// Original SVG drawings using familiar Apple-style action metaphors.
// Embedded paths work offline and do not depend on an installed symbol font.
const paths: Record<string, string> = {
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  settings:
    '<path d="m10 3-.6 2.1-2 .9-2-.7-2 3.4 1.5 1.5-.2 2.2L3 14l2 3.4 2-.7 2 .9.6 2.1h4l.6-2.1 2-.9 2 .7 2-3.4-1.5-1.5.2-2.2L21 10l-2-3.4-2 .7-2-.9L14 3Z"/><circle cx="12" cy="11.5" r="3"/>',
  recenter:
    '<circle cx="12" cy="12" r="7"/><path d="M12 2v5m0 10v5M2 12h5m10 0h5"/>',
  play: '<path d="m8 4 13 8-13 8Z" fill="currentColor" stroke="none"/>',
  pause:
    '<path d="M7 5h3v14H7zm7 0h3v14h-3z" fill="currentColor" stroke="none"/>',
  start: '<path d="M5 5v14m14-14L8 12l11 7Z"/>',
  rewind: '<path d="M8 3 3 8l5 5M3 8h10a7 7 0 1 1-6 11"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  metronome: '<path d="m8 3-5 18h18L16 3ZM12 17l7-12M7 17h10"/>',
  repeat:
    '<path d="m16 3 4 4-4 4M4 11V9a2 2 0 0 1 2-2h14M8 21l-4-4 4-4m12 0v2a2 2 0 0 1-2 2H4"/>',
  library:
    '<path d="M3 5h10M3 10h7M3 15h7M18 17V4l4-1"/><ellipse cx="15" cy="18" rx="3" ry="2"/>',
  bookmark: markerShape,
  sliders:
    '<path d="M5 3v5m0 4v9M12 3v10m0 4v4M19 3v2m0 4v12M2 8h6v4H2zm7 5h6v4H9zm7-8h6v4h-6z"/>',
  screen:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 12h18"/>',
  reload: '<path d="M20 7v5h-5M20 12a8 8 0 1 0-2 6M20 12l-3-5"/>',
  expand: '<path d="M9 3H3v6m0-6 7 7m5 11h6v-6m0 6-7-7"/>',
  collapse: '<path d="M3 10h7V3m0 7L3 3m18 11h-7v7m0-7 7 7"/>',
};
export function svgFromPath(path: string) {
  return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
}

export const tempoNote =
  '<svg class="tempo-note" viewBox="0 0 18 32" aria-hidden="true"><ellipse cx="6.5" cy="26" rx="6" ry="4" transform="rotate(-22 6.5 26)" fill="currentColor"/><path d="M11.5 25V2" stroke="currentColor" stroke-width="2"/></svg>';

export function icon(name: string) {
  return svgFromPath(paths[name] || paths.info);
}
