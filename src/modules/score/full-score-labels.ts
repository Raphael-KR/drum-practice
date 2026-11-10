import type { Measure, Region } from "../../model/model";

/** Match engraved row starts to real measure labels, never renderer element IDs. */
export function fullScoreLabels(
  svg: string | Document,
  cells: { measure: Pick<Measure, "id" | "label">; region: Region }[],
) {
  const doc =
    typeof svg === "string"
      ? new DOMParser().parseFromString(svg, "image/svg+xml")
      : svg;
  const view = doc.documentElement
    .getAttribute("viewBox")
    ?.trim()
    .split(/[ ,]+/)
    .map(Number);
  if (!view || view.length !== 4 || !(view[2] > 0 && view[3] > 0)) return [];
  const rows = new Map<number, { x: number; y: number }>();
  for (const measure of doc.querySelectorAll(".vf-measure")) {
    // OSMD 2.3 wraps staff paths in .vf-stave; older cached pages use direct paths.
    const stave = measure.querySelector(".vf-stave") ?? measure;
    const line = Array.from(stave.children).find(
      (e) =>
        e.localName === "path" &&
        /^M[\d. -]+L[\d. -]+$/.test(e.getAttribute("d") || ""),
    );
    const points = line
      ?.getAttribute("d")
      ?.match(/-?\d+(?:\.\d+)?/g)
      ?.map(Number);
    if (
      !points ||
      points.length !== 4 ||
      Math.abs(points[1] - points[3]) > 0.01
    )
      continue;
    const [x, y] = points,
      key = Math.round(y * 100);
    const previous = rows.get(key);
    if (!previous || x < previous.x) rows.set(key, { x, y });
  }
  return [...rows.values()]
    .sort((a, b) => a.y - b.y)
    .flatMap((row) => {
      const x = row.x - view[0],
        y = row.y - view[1];
      const cell = cells.find(
        ({ region }) =>
          Math.abs(region.x * view[2] - x) < 1 &&
          region.y * view[3] <= y + 1 &&
          (region.y + region.h) * view[3] >= y - 1,
      );
      if (!cell) {
        console.warn("Full-score row has no matching measure label", {
          staff: { x, y },
          viewBox: view,
          candidateCount: cells.length,
        });
        return [];
      }
      return [
        {
          label: cell.measure.label,
          left: (x / view[2]) * 100,
          top: (y / view[3]) * 100,
        },
      ];
    });
}
