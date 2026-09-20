import { locate, type Marker, type Song } from './model';

export const MARKER_SLOTS = 3;
/** Array order is creation order; display sorting must never change eviction order. */
export function recentMarkers(song: Song): Marker[] {
  return song.markers.slice(-MARKER_SLOTS);
}
export function sortedMarkerSlots(song: Song): (Marker | undefined)[] {
  const sorted = recentMarkers(song).sort((a, b) => a.time - b.time);
  return Array.from({ length: MARKER_SLOTS }, (_, i) => sorted[i]);
}
export function markMeasure(song: Song, position: number, id: string, name?: string) {
  const measure = locate(song, position).measure;
  if (!measure) return;
  const previous = song.markers.find(m => locate(song, m.time).measure?.id === measure.id);
  song.markers = song.markers.filter(m => locate(song, m.time).measure?.id !== measure.id).slice(-(MARKER_SLOTS - 1));
  song.markers.push({ id: previous?.id ?? id, name: name || previous?.name || `${measure.label}마디`, time: measure.start });
}
export function markedMeasureIndices(song: Song): Set<number> {
  return new Set(recentMarkers(song).map(m => locate(song, m.time).index));
}
