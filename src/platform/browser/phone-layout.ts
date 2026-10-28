/** Keep these viewport boundaries aligned with playback/styles/06-responsive.css. */
export function isPhoneLandscape() {
  return !!window.matchMedia?.(PHONE_LANDSCAPE_QUERY).matches;
}

export const PHONE_LANDSCAPE_QUERY =
  "(orientation: landscape) and (max-width: 1023px) and (max-height: 480px)";
export const PHONE_LAYOUT_QUERY = `(orientation: portrait) and (max-width: 480px), ${PHONE_LANDSCAPE_QUERY}`;
