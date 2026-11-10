// Least-squares horizontal adjustment, keeping text order and a single baseline.
// Time anchors are untouched; only the label boxes move to avoid collisions.
export function packLabels(
  items: { left: number; width: number }[],
  gap = 2,
  minLeft = -Infinity,
  maxRight = Infinity,
) {
  const offsets: number[] = [];
  const blocks: { start: number; end: number; sum: number; count: number }[] =
    [];
  let offset = 0;
  items.forEach((item, i) => {
    offsets.push(offset);
    blocks.push({ start: i, end: i, sum: item.left - offset, count: 1 });
    offset += item.width + gap;
    while (blocks.length > 1) {
      const a = blocks[blocks.length - 2],
        b = blocks[blocks.length - 1];
      if (a.sum / a.count <= b.sum / b.count) break;
      blocks.splice(-2, 2, {
        start: a.start,
        end: b.end,
        sum: a.sum + b.sum,
        count: a.count + b.count,
      });
    }
  });
  const positions: number[] = [];
  const maxStart = maxRight - (offset - gap);
  for (const b of blocks)
    for (let i = b.start; i <= b.end; i++)
      positions[i] =
        Math.max(minLeft, Math.min(b.sum / b.count, maxStart)) + offsets[i];
  return positions;
}

/** Align lyric boxes without changing their musical anchors or PDF note centers. */
export function layoutLyricRow(
  items: { el: HTMLElement; rect: DOMRect }[],
  minLeft: number,
  maxRight = Infinity,
) {
  if (!items.length) return;
  const baseline = Math.max(...items.map(({ rect }) => rect.top));
  const lines: (typeof items)[] = [];
  let line: typeof items = [],
    width = 0;
  for (const item of items) {
    if (line.length && width + 2 + item.rect.width > maxRight - minLeft) {
      lines.push(line);
      line = [];
      width = 0;
    }
    width += (line.length ? 2 : 0) + item.rect.width;
    line.push(item);
  }
  lines.push(line);
  let top = 0;
  for (const entries of lines) {
    const positions = packLabels(
      entries.map(({ rect }) => ({ left: rect.left, width: rect.width })),
      2,
      minLeft,
      maxRight,
    );
    entries.forEach(({ el, rect }, i) => {
      el.style.marginLeft = el.dataset.pdfLyricAnchor
        ? "0px"
        : `${positions[i] - rect.left}px`;
      el.style.top = `${baseline - rect.top + top}px`;
    });
    top += Math.max(...entries.map(({ rect }) => rect.height)) + 2;
  }
}
