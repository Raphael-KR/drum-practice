import { stretchWarp } from "./stretch-warp";
import { stretch } from "./stretch";
self.onmessage = (e: MessageEvent) => {
  try {
    const { left, right, sr, rate, timeMap } = e.data;
    const out = (timeMap ? stretchWarp : stretch)(
      left,
      right,
      sr,
      timeMap || rate,
      (v) => self.postMessage({ progress: v }),
    );
    self.postMessage(out, { transfer: [out.left.buffer, out.right.buffer] });
  } catch (e) {
    self.postMessage({ error: String(e) });
  }
};
