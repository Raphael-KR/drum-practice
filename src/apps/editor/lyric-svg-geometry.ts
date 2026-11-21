import { lyricSVGClass } from "../../modules/score/score-lyric-id";
import { loadScoreTextFonts } from "../../modules/score/score-text-font";
import { parsePlaybackSVG } from "../../modules/playback/playback-svg";

export interface LyricBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Measure the native label in its SVG coordinate system; never recreate lyric text for hit testing. */
export async function lyricBoxes(
  source: string,
  ids: string[],
): Promise<LyricBox[]> {
  const doc = parsePlaybackSVG(source);
  // Only text geometry enters the DOM. Source scripts, links, style sheets,
  // foreign content and external resources are never copied from a package.
  const tags = new Set(["svg", "g", "text", "tspan"]);
  const attributes = new Set([
    "viewBox",
    "width",
    "height",
    "x",
    "y",
    "dx",
    "dy",
    "rotate",
    "transform",
    "class",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "text-anchor",
    "dominant-baseline",
    "alignment-baseline",
    "letter-spacing",
    "textLength",
    "lengthAdjust",
  ]);
  function geometry(element: Element): Element | undefined {
    if (!tags.has(element.localName)) return;
    const copy = document.createElementNS(
      "http://www.w3.org/2000/svg",
      element.localName,
    );
    for (const attribute of element.attributes)
      if (attributes.has(attribute.name))
        copy.setAttribute(attribute.name, attribute.value);
    for (const child of element.childNodes) {
      if (
        child.nodeType === Node.TEXT_NODE &&
        ["text", "tspan"].includes(element.localName)
      )
        copy.append(document.createTextNode(child.textContent ?? ""));
      else if (child.nodeType === Node.ELEMENT_NODE) {
        const nested = geometry(child as Element);
        if (nested) copy.append(nested);
      }
    }
    return copy;
  }
  const svg = geometry(doc.documentElement) as SVGSVGElement | undefined;
  if (!svg) throw Error("Lyric geometry requires an SVG root");
  await loadScoreTextFonts();
  const host = document.createElement("div");
  host.className = "lyric-measure-host";
  host.setAttribute("aria-hidden", "true");
  host.append(svg);
  document.body.append(host);
  try {
    await document.fonts.ready;
    const view = svg.viewBox.baseVal;
    const rootMatrix = svg.getCTM();
    if (!rootMatrix || !view.width || !view.height) return [];
    const inverse = rootMatrix.inverse();
    return ids.flatMap((id) => {
      const nodes = [
        ...svg.querySelectorAll<SVGGraphicsElement>(`.${lyricSVGClass(id)}`),
      ];
      const points = nodes.flatMap((node) => {
        const box = node.getBBox(),
          matrix = node.getCTM();
        if (!matrix || !box.width || !box.height) return [];
        const transform = inverse.multiply(matrix);
        return [
          [box.x, box.y],
          [box.x + box.width, box.y],
          [box.x, box.y + box.height],
          [box.x + box.width, box.y + box.height],
        ].map(([x, y]) => new DOMPoint(x, y).matrixTransform(transform));
      });
      if (!points.length) return [];
      const left = Math.min(...points.map((p) => p.x)),
        right = Math.max(...points.map((p) => p.x));
      const top = Math.min(...points.map((p) => p.y)),
        bottom = Math.max(...points.map((p) => p.y));
      return [
        {
          id,
          x: (left - view.x) / view.width,
          y: (top - view.y) / view.height,
          w: (right - left) / view.width,
          h: (bottom - top) / view.height,
        },
      ];
    });
  } finally {
    host.remove();
  }
}
