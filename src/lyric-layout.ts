// Least-squares horizontal adjustment, keeping text order and a single baseline.
// Time anchors are untouched; only the label boxes move to avoid collisions.
export function packLabels(items: { left: number; width: number }[], gap = 2) {
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
  for (const b of blocks)
    for (let i = b.start; i <= b.end; i++)
      positions[i] = b.sum / b.count + offsets[i];
  return positions;
}
