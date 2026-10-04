import { t as i18nText } from "./i18n";
import { locate, type Marker, type Song } from "./model";

export const MARKER_SLOTS = 5;
/** Array order is creation order; display sorting must never change eviction order. */
export function recentMarkers(song: Song): Marker[] {
  return song.markers.slice(-MARKER_SLOTS);
}
export function sortedMarkerSlots(song: Song): (Marker | undefined)[] {
  if (song.markerSlots) return Array.from({length: MARKER_SLOTS}, (_, i) => song.markers.find(m => m.id === song.markerSlots![i]));
  const sorted = recentMarkers(song).sort((a, b) => a.time - b.time);
  return Array.from({ length: MARKER_SLOTS }, (_, i) => sorted[i]);
}
/** Remove legacy hidden markers as well as overflow; never resurrect them. */
export function pruneMarkerOverflow(song: Song): boolean {
  const visible = new Set(sortedMarkerSlots(song).filter((m): m is Marker => !!m).map(m => m.id));
  const retained = song.markers.filter(m => visible.has(m.id)).slice(-MARKER_SLOTS);
  if (retained.length === song.markers.length) return false;
  song.markers = retained;
  return true;
}
export function markMeasure(
  song: Song,
  position: number,
  id: string,
  name?: string,
) {
  pruneMarkerOverflow(song);
  const measure = locate(song, position).measure;
  if (!measure) return;
  const previous = song.markers.find(
    (m) => locate(song, m.time).measure?.id === measure.id,
  );
  song.markers = song.markers
    .filter((m) => locate(song, m.time).measure?.id !== measure.id)
    .slice(-(MARKER_SLOTS - 1));
  delete song.markerSlots;
  song.markers.push({
    id: previous?.id ?? id,
    name:
      name ||
      previous?.name ||
      i18nText("marker-slots.message378", { value1: measure.label }),
    time: measure.start,
  });
}
export function markedMeasureIndices(song: Song): Set<number> {
  return new Set(sortedMarkerSlots(song).filter((m): m is Marker => !!m).map((m) => locate(song, m.time).index));
}

/** Toggle this measure, permanently evicting the oldest marker on overflow. */
export function toggleMeasureMarker(song: Song, position: number, id: string, name?: () => string | undefined) {
  pruneMarkerOverflow(song);
  const measure = locate(song, position).measure;
  if (!measure) return;
  const matches = (marker: Marker) => locate(song, marker.time).measure?.id === measure.id;
  if (song.markers.some(matches)) {
    song.markerSlots = sortedMarkerSlots(song).map(marker => marker && !matches(marker) ? marker.id : "");
    song.markers = song.markers.filter(marker => !matches(marker));
  } else {
    delete song.markerSlots;
    song.markers = song.markers.slice(-(MARKER_SLOTS - 1));
    song.markers.push({id, time: measure.start, name: name?.() || i18nText("marker-slots.message378", {value1: measure.label})});
  }
}

/** Delete a visible marker without sliding other markers into its slot. */
export function deleteMarkerSlot(song: Song, id: string) {
  pruneMarkerOverflow(song);
  song.markerSlots = sortedMarkerSlots(song).map(marker => marker && marker.id !== id ? marker.id : "");
  song.markers = song.markers.filter(marker => marker.id !== id);
}
