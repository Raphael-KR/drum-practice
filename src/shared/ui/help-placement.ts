/** Viewport coordinates shared by targets, speech bubbles and their tails. */
export interface HelpRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface HelpPlacement extends HelpRect {
  side: "top" | "bottom" | "left" | "right";
}
export function overlaps(a: HelpRect, b: HelpRect, gap = 8) {
  return (
    a.x < b.x + b.width + gap &&
    a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap &&
    a.y + a.height + gap > b.y
  );
}
export function placeHelpBubble(
  target: HelpRect,
  width: number,
  height: number,
  viewport: HelpRect,
  obstacles: HelpRect[],
): HelpPlacement | undefined {
  const clamp = (n: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, n));
  const cx = target.x + target.width / 2,
    cy = target.y + target.height / 2,
    gap = 18;
  const x = clamp(
    cx - width / 2,
    viewport.x,
    viewport.x + viewport.width - width,
  );
  const y = clamp(
    cy - height / 2,
    viewport.y,
    viewport.y + viewport.height - height,
  );
  const candidates: HelpPlacement[] = [
    { x, y: target.y + target.height + gap, width, height, side: "top" },
    { x, y: target.y - height - gap, width, height, side: "bottom" },
    { x: target.x - width - gap, y, width, height, side: "right" },
    { x: target.x + target.width + gap, y, width, height, side: "left" },
  ];
  return candidates.find(
    (r) =>
      r.x >= viewport.x &&
      r.y >= viewport.y &&
      r.x + r.width <= viewport.x + viewport.width &&
      r.y + r.height <= viewport.y + viewport.height &&
      !obstacles.some((o) => overlaps(r, o)),
  );
}
