/** Find five evenly spaced long horizontal staff lines, ignoring noteheads and beams. */
export function detectStaff(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  expectedGap?: number,
): { top: number; gap: number } | undefined {
  const rows: number[] = [];
  const strengths: number[] = [];
  for (let y = 0; y < height; y++) {
    let dark = 0;
    const left = Math.floor(width * 0.1),
      right = Math.ceil(width * 0.9);
    for (let x = left; x < right; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] > 100 && data[i] + data[i + 1] + data[i + 2] < 660)
        dark++;
    }
    strengths.push(dark / (right - left));
    if (dark / (right - left) > (expectedGap ? 0.3 : 0.55)) rows.push(y);
  }
  if (expectedGap) {
    let best = -1,
      top = 0;
    for (let y = 0; y + 4 * expectedGap < height; y++) {
      const score = [0, 1, 2, 3, 4]
        .map((k) =>
          Math.max(
            ...[-1, 0, 1].map(
              (d) => strengths[Math.round(y + k * expectedGap) + d] ?? 0,
            ),
          ),
        )
        .reduce((a, b) => a + b, 0);
      if (score > best) {
        best = score;
        top = y;
      }
    }
    if (best > 3) return { top, gap: expectedGap };
  }
  const peaks: number[] = [];
  for (let i = 0; i < rows.length;) {
    let j = i;
    while (j + 1 < rows.length && rows[j + 1] === rows[j] + 1) j++;
    peaks.push((rows[i] + rows[j]) / 2);
    i = j + 1;
  }
  for (const required of [5, 4]) {
    for (let i = 0; i < peaks.length; i++)
      for (let j = i + 1; j < peaks.length; j++) {
        const gap = peaks[j] - peaks[i];
        if (gap < 3 || (expectedGap && Math.abs(gap / expectedGap - 1) > 0.2))
          continue;
        const matches = [0, 1, 2, 3, 4].filter((k) =>
          peaks.some(
            (p) =>
              Math.abs(p - (peaks[i] + k * gap)) <= Math.max(1.5, gap * 0.15),
          ),
        ).length;
        if (matches >= required) return { top: peaks[i], gap };
      }
  }
}
