/** Read row starts from engraving geometry; never modify the cached SVG. */
export function fullScoreLabels(svg: string) {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const view = doc.documentElement.getAttribute('viewBox')?.trim().split(/[ ,]+/).map(Number);
  if (!view || view.length !== 4 || !(view[2] > 0 && view[3] > 0)) return [];
  const rows = new Map<number, { label: string; x: number; y: number }>();
  for (const measure of doc.querySelectorAll('.vf-measure')) {
    // The first direct horizontal path is the top staff line, not a note stem.
    const line = Array.from(measure.children).find(e => e.localName === 'path' && /^M[\d. -]+L[\d. -]+$/.test(e.getAttribute('d') || ''));
    const points = line?.getAttribute('d')?.match(/-?\d+(?:\.\d+)?/g)?.map(Number);
    if (!points || points.length !== 4 || Math.abs(points[1]-points[3]) > .01) continue;
    const [x,y] = points, key = Math.round(y * 100);
    const previous = rows.get(key);
    if (!previous || x < previous.x) rows.set(key, { label: measure.id, x, y });
  }
  return [...rows.values()].sort((a,b)=>a.y-b.y).map(row=>({
    label: row.label,
    left: (row.x-view[0])/view[2]*100,
    top: (row.y-view[1])/view[3]*100,
  }));
}
