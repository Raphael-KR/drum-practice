import { t as i18nText } from "./i18n";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { uid, type Region } from "./model";
GlobalWorkerOptions.workerSrc = worker;
export async function renderPDF(blob: Blob, progress: (s: string) => void) {
  const task = getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
  const pdf = await task.promise;
  const pages: Blob[] = [];
  const regions: Region[] = [];
  try {
    for (let n = 1; n <= pdf.numPages; n++) {
      progress(i18nText("pdf.message420", { n: n, value2: pdf.numPages }));
      const page = await pdf.getPage(n),
        v = page.getViewport({ scale: 1.8 }),
        canvas = document.createElement("canvas");
      canvas.width = v.width;
      canvas.height = v.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvas, canvasContext: ctx, viewport: v }).promise;
      pages.push(
        await new Promise<Blob>((ok) =>
          canvas.toBlob((b) => ok(b!), "image/png"),
        ),
      );
      regions.push(
        ...detectRegions(
          ctx.getImageData(0, 0, canvas.width, canvas.height),
          n - 1,
        ),
      );
      page.cleanup();
      canvas.width = 1;
      canvas.height = 1;
    }
  } finally {
    await task.destroy();
  }
  return { pages, regions };
}
// Conservative staff-line / vertical-bar proposals; user confirmation remains required.
export function detectRegions(
  image: Pick<ImageData, "data" | "width" | "height">,
  page: number,
): Region[] {
  const { data, width: w, height: h } = image;
  const dark = (x: number, y: number) => data[(y * w + x) * 4] < 220;
  const lines: number[] = [];
  for (let y = 0; y < h; y++) {
    let run = 0,
      max = 0;
    for (let x = 0; x < w; x++) {
      run = dark(x, y) ? run + 1 : 0;
      max = Math.max(max, run);
    }
    if (max > w * 0.42 && (lines.length === 0 || y - lines.at(-1)! > 2))
      lines.push(y);
  }
  const out: Region[] = [];
  for (let i = 0; i + 4 < lines.length;) {
    const y0 = lines[i];
    let gap = 0;
    for (
      let candidate = 4;
      candidate <= Math.min(24, w / 30);
      candidate += 0.25
    ) {
      if (
        [1, 2, 3, 4].every((k) =>
          lines.some((y) => Math.abs(y - y0 - candidate * k) <= 1.5),
        )
      ) {
        gap = candidate;
        break;
      }
    }
    if (!gap) {
      i++;
      continue;
    }
    const g = gap,
      y1 = Math.round(y0 + 4 * g);
    while (i < lines.length && lines[i] <= y1 + 2) i++;
    let left = w,
      right = 0;
    for (let x = 0; x < w; x++)
      if (dark(x, Math.round(y0 + 2 * g))) {
        left = Math.min(left, x);
        right = x;
      }
    const bars: number[] = [left];
    for (let x = left + 2; x < right - 2; x++) {
      let hits = 0;
      for (let y = y0; y <= y1; y++) if (dark(x, y)) hits++;
      // Note stems can span the entire staff too, but continue above it.
      let above = 0;
      for (let y = Math.max(0, Math.round(y0 - g)); y < y0 - 2; y++)
        if (dark(x, y)) above++;
      if (
        hits / (y1 - y0 + 1) > 0.9 &&
        above < (g - 2) / 2 &&
        x - bars.at(-1)! > g * 4
      )
        bars.push(x);
    }
    if (right - bars.at(-1)! > g * 4) bars.push(right);
    else bars[bars.length - 1] = right;
    for (let b = 0; b < bars.length - 1; b++) {
      const top = Math.max(0, y0 - g * 6),
        bottom = Math.min(h, y1 + g * 7);
      if (bars[b + 1] - bars[b] < w * 0.035) continue;
      out.push({
        id: uid(),
        page,
        x: bars[b] / w,
        y: top / h,
        w: (bars[b + 1] - bars[b]) / w,
        h: (bottom - top) / h,
        beatXs: [],
      });
    }
  }
  return out;
}
