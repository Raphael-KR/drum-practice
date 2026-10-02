import { t as i18nText } from "./i18n";
/** Verified PDF system starts, from data/reference/geometry.json (Real Paradis). */
export const BUNDLED_PDF_SYSTEMS = [
  [1, 5, 9, 13, 17, 21, 25, 29, 33],
  [37, 41, 45, 49, 53, 57, 61, 65, 69, 73],
  [77, 81, 85, 89, 93, 97, 101, 105, 107],
] as const;

/** This mapping is only for the app's known 110-measure score, not arbitrary XML. */
export function matchBundledPDFLayout(text: string): {
  text: string;
  changed: boolean;
} {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror"))
    throw Error(i18nText("score-system-layout.message539"));
  const starts = new Set<number>(BUNDLED_PDF_SYSTEMS.flat());
  const pages = new Set<number>(BUNDLED_PDF_SYSTEMS.slice(1).map((p) => p[0]));
  let changed = false;
  for (const part of doc.querySelectorAll("score-partwise > part")) {
    const measures = Array.from(part.children).filter(
      (e) => e.localName === "measure",
    );
    if (
      measures.length !== 110 ||
      measures.some((m, i) => m.getAttribute("number") !== String(i + 1))
    )
      throw Error(i18nText("score-system-layout.message540"));
    for (const [index, measure] of measures.entries()) {
      const number = index + 1;
      const pageBreak = pages.has(number);
      const lineBreak = number > 1 && starts.has(number) && !pageBreak;
      let print = Array.from(measure.children).find(
        (e) => e.localName === "print",
      );
      if ((number === 1 || lineBreak || pageBreak) && !print) {
        print = doc.createElementNS(measure.namespaceURI, "print");
        measure.insertBefore(print, measure.firstChild);
      }
      if (number === 1 && print) {
        let layout = print.querySelector("system-layout");
        if (!layout) {
          layout = doc.createElementNS(measure.namespaceURI, "system-layout");
          print.append(layout);
        }
        if (!layout.querySelector("top-system-distance")) {
          const distance = doc.createElementNS(
            measure.namespaceURI,
            "top-system-distance",
          );
          distance.textContent = "180";
          layout.append(distance);
          changed = true;
        }
      }
      if (number === 84) {
        let barline = measure.querySelector('barline[location="right"]');
        if (!barline) {
          barline = doc.createElementNS(measure.namespaceURI, "barline");
          barline.setAttribute("location", "right");
          measure.append(barline);
        }
        let style = barline.querySelector("bar-style");
        if (!style) {
          style = doc.createElementNS(measure.namespaceURI, "bar-style");
          barline.insertBefore(style, barline.firstChild);
        }
        if (style.textContent !== "light-light") {
          style.textContent = "light-light";
          changed = true;
        }
      }
      if (!print) continue;
      for (const [attribute, needed] of [
        ["new-system", lineBreak],
        ["new-page", pageBreak],
      ] as const) {
        if (needed && print.getAttribute(attribute) !== "yes") {
          print.setAttribute(attribute, "yes");
          changed = true;
        } else if (!needed && print.hasAttribute(attribute)) {
          print.removeAttribute(attribute);
          changed = true;
        }
      }
    }
  }
  return {
    text: changed ? new XMLSerializer().serializeToString(doc) : text,
    changed,
  };
}
