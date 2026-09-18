import { SoundTouch, SimpleFilter } from "soundtouchjs";
// Offline WSOLA rendering lets music and clicks use one sample-clock on playback.
export function stretch(
  left: Float32Array,
  right: Float32Array,
  sr: number,
  rate: number,
  progress?: (v: number) => void,
) {
  const st = new SoundTouch();
  st.stretch.setParameters(sr, 40, 15, 8);
  st.tempo = rate;
  const source = {
    extract(target: Float32Array, n: number, pos: number) {
      const size = Math.min(n, Math.max(0, left.length + sr - pos));
      for (let i = 0; i < size; i++) {
        target[2 * i] = left[pos + i] || 0;
        target[2 * i + 1] = right[pos + i] || 0;
      }
      return size;
    },
  };
  const filter = new SimpleFilter(source, st);
  const length = Math.ceil(left.length / rate);
  const l = new Float32Array(length),
    r = new Float32Array(length),
    block = new Float32Array(8192);
  let p = 0;
  while (p < length) {
    const got = filter.extract(block, Math.min(4096, length - p));
    if (!got) break;
    for (let i = 0; i < got; i++) {
      l[p + i] = block[i * 2];
      r[p + i] = block[i * 2 + 1];
    }
    p += got;
    if (p % (4096 * 40) === 0) progress?.(p / length);
  }
  return { left: l, right: r };
}
