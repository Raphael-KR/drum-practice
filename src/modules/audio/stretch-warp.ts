import { stretch } from "./stretch";
import type { AudioTimeMap } from "./audio-time-map";
/** Preserve beat attacks at their anchors; stretch only the space between them. */
export function stretchWarp(
  left: Float32Array,
  right: Float32Array,
  sr: number,
  map: AudioTimeMap,
  progress?: (n: number) => void,
) {
  if (
    map.source.length < 2 ||
    map.source.length !== map.output.length ||
    map.source[0] !== 0 ||
    map.output[0] !== 0 ||
    map.source.some(
      (v, i) => !Number.isFinite(v) || (i > 0 && v <= map.source[i - 1]),
    ) ||
    map.output.some(
      (v, i) => !Number.isFinite(v) || (i > 0 && v <= map.output[i - 1]),
    )
  )
    throw Error("Invalid audio time map");
  const length = Math.round(map.output.at(-1)! * sr);
  const l = new Float32Array(length),
    r = new Float32Array(length);
  for (let i = 0; i < map.source.length - 1; i++) {
    const a = Math.round(map.source[i] * sr),
      b = Math.round(map.source[i + 1] * sr);
    const x = Math.round(map.output[i] * sr),
      y = Math.round(map.output[i + 1] * sr);
    if (b <= a || y <= x) throw Error("Invalid audio time map");
    if (b - a === y - x) {
      l.set(left.subarray(a, b), x);
      r.set(right.subarray(a, b), x);
      continue;
    }
    const guard = Math.min(
      Math.round(sr * 0.035),
      Math.floor(Math.min(b - a, y - x) * 0.15),
    );
    const fade = Math.max(
      1,
      Math.min(Math.round(sr * 0.012), Math.floor(guard / 2)),
    );
    const inputA = a + guard - fade,
      inputB = b - guard + fade;
    const target = y - x - 2 * guard + 2 * fade;
    const out = stretch(
      left.subarray(inputA, inputB),
      right.subarray(inputA, inputB),
      sr,
      (inputB - inputA) / target,
    );
    for (let j = 0; j < y - x; j++) {
      const read = j - guard + fade;
      const start = j < guard,
        end = j >= y - x - guard;
      const raw = start ? a + j : end ? b - (y - x - j) : 0;
      const mix = start
        ? Math.max(0, (j - guard + fade) / fade)
        : end
          ? Math.max(0, (y - x - 1 - j - guard + fade) / fade)
          : 1;
      l[x + j] = (1 - mix) * (left[raw] || 0) + mix * (out.left[read] || 0);
      r[x + j] = (1 - mix) * (right[raw] || 0) + mix * (out.right[read] || 0);
    }
    if (i % 16 === 0) progress?.((i + 1) / (map.source.length - 1));
  }
  progress?.(1);
  return { left: l, right: r };
}
