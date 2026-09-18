import { stretch } from "./stretch";
self.onmessage = (e: MessageEvent) => {
  try {
    const { left, right, sr, rate } = e.data;
    const out = stretch(left, right, sr, rate, (v) =>
      self.postMessage({ progress: v }),
    );
    self.postMessage(out, { transfer: [out.left.buffer, out.right.buffer] });
  } catch (e) {
    self.postMessage({ error: String(e) });
  }
};
