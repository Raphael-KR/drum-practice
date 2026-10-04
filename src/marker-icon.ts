// Shared by the web app, offline player, and score comparison canvas.
export const markerPath = "M6 3h12v18l-6-4-6 4Z";
export const markerFill = "#f52d35";
export const markerStroke = "#243044";
export const markerShape = `<path d="${markerPath}" fill="${markerFill}" stroke="${markerStroke}"/>`;
export const markerIcon = `<svg class="score-marker-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${markerShape}</svg>`;

/** Full marker-slot silhouette; the centre notch is shallow to keep numbers readable. */
export const markerButtonBackground = `<svg class="marker-button-background" viewBox="0 0 48 48" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M9 1H39Q47 1 47 9V47L24 41L1 47V9Q1 1 9 1Z" stroke="black" stroke-width="1.5" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;
