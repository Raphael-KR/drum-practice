import regularURL from "./vendor/pretendard/Pretendard-Regular.woff2?url";
import boldURL from "./vendor/pretendard/Pretendard-Bold.woff2?url";
import license from "./vendor/pretendard/OFL.txt?raw";
import "./score-text-font.css";
import { encodeAsset } from "../../platform/storage/binary-asset";

export const SCORE_TEXT_FONT_FAMILY = "Pretendard";
const EMBEDDED_FONT_VERSION = "Pretendard-1.3.9";
const weights = [400, 700] as const;
type FontData = Record<(typeof weights)[number], string>;
let ready: Promise<FontData> | undefined;

/** Wait before native text measurement; never measure a temporary fallback. */
export function loadScoreTextFonts(): Promise<FontData> {
  ready ??= (async () => {
    const data = await Promise.all(
      [regularURL, boldURL].map(async (url) => {
        const response = await fetch(url);
        if (!response.ok)
          throw Error(
            `Score font unavailable: url=${url}, HTTP=${response.status}`,
          );
        const encoded = await encodeAsset(await response.blob(), "font/woff2");
        return `data:font/woff2;base64,${encoded.base64}`;
      }),
    );
    const loaded = await Promise.all(
      weights.map((weight) =>
        document.fonts.load(`${weight} 16px "${SCORE_TEXT_FONT_FAMILY}"`),
      ),
    );
    if (loaded.some((faces) => !faces.length))
      throw Error(
        `Score font CSS missing: family=${SCORE_TEXT_FONT_FAMILY}, expectedWeights=${weights}, actualFaces=${loaded.map((faces) => faces.length)}`,
      );
    return { 400: data[0], 700: data[1] };
  })().catch((error: unknown) => {
    ready = undefined;
    throw error;
  });
  return ready;
}

function embeddedFontCSS(fonts: FontData, used: Iterable<400 | 700>) {
  return (
    `/* ${license} */\n` +
    [...used]
      .map(
        (weight) =>
          `@font-face{font-family:"${SCORE_TEXT_FONT_FAMILY}";font-style:normal;font-weight:${weight};src:url("${fonts[weight]}") format("woff2")}`,
      )
      .join("\n")
  );
}

/** Recognize only CSS containing the app's exact bundled font bytes. */
export async function isEmbeddedScoreTextFontStyle(style: Element) {
  if (
    style.childElementCount ||
    style.getAttribute("data-score-font") !== EMBEDDED_FONT_VERSION
  )
    return false;
  const fonts = await loadScoreTextFonts();
  const combinations: (400 | 700)[][] = [[400], [700], [400, 700], [700, 400]];
  return combinations.some(
    (used) => style.textContent === embeddedFontCSS(fonts, used),
  );
}

/** Keep standalone SVG/image rendering on the same bytes used for measurement. */
export function embedScoreTextFonts(svg: SVGSVGElement, fonts: FontData) {
  const used = new Set<400 | 700>();
  for (const text of svg.querySelectorAll("text")) {
    if (!text.getAttribute("font-family")?.includes(SCORE_TEXT_FONT_FAMILY))
      continue;
    const weight = text.getAttribute("font-weight") || "400";
    used.add(weight === "bold" || Number(weight) >= 600 ? 700 : 400);
  }
  if (!used.size) return;
  const style = svg.ownerDocument.createElementNS(
    "http://www.w3.org/2000/svg",
    "style",
  );
  style.setAttribute("data-score-font", EMBEDDED_FONT_VERSION);
  style.textContent = embeddedFontCSS(fonts, used);
  svg.insertBefore(style, svg.firstChild);
}
