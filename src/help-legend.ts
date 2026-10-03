import { scoreLegendSVG } from "./vendor/score-legend-svg";
import { t, type MessageKey } from "./i18n";
export const legendItems = [
  {
    id: "closed",
    group: "cymbals",
    symbol: "×",
  },
  {
    id: "open",
    group: "cymbals",
    symbol: "⊗",
  },
  {
    id: "ride",
    group: "cymbals",
    symbol: "×",
  },
  {
    id: "bell",
    group: "cymbals",
    symbol: "▲",
  },
  {
    id: "crash",
    group: "cymbals",
    symbol: "×",
  },
  {
    id: "china",
    group: "cymbals",
    symbol: "⊗",
  },
  {
    id: "splash",
    group: "cymbals",
    symbol: "◇",
  },
  {
    id: "cowbell",
    group: "cymbals",
    symbol: "▲",
  },
  {
    id: "snare",
    group: "drums",
    symbol: "●",
  },
  {
    id: "tom1",
    group: "drums",
    symbol: "●",
  },
  {
    id: "tom2",
    group: "drums",
    symbol: "●",
  },
  {
    id: "tom3",
    group: "drums",
    symbol: "●",
  },
  {
    id: "tom4",
    group: "drums",
    symbol: "●",
  },
  {
    id: "tom5",
    group: "drums",
    symbol: "●",
  },
  {
    id: "rightkick",
    group: "drums",
    symbol: "●",
  },
  {
    id: "leftkick",
    group: "drums",
    symbol: "●",
  },
  {
    id: "pedal",
    group: "drums",
    symbol: "×",
  },
  {
    id: "hhSplash",
    group: "techniques",
    symbol: "⊗",
  },
  {
    id: "opening",
    group: "techniques",
    symbol: "○",
  },
  {
    id: "closing",
    group: "techniques",
    symbol: "＋",
  },
  {
    id: "half",
    group: "techniques",
    symbol: "⊕",
  },
  {
    id: "cross",
    group: "techniques",
    symbol: "×",
  },
  {
    id: "ghost",
    group: "techniques",
    symbol: "(●)",
  },
  {
    id: "choked",
    group: "techniques",
    symbol: "×",
  },
  {
    id: "doubles",
    group: "techniques",
    symbol: "///",
  },
  {
    id: "buzz",
    group: "techniques",
    symbol: "",
  },
  {
    id: "sticking",
    group: "techniques",
    symbol: "R / L",
  },
] as const;
export function scoreLegendHelp() {
  const container = document.createElement("div");
  container.className = "help-legend";
  // Trusted bundled illustration, never user-provided SVG.
  container.innerHTML = scoreLegendSVG;
  const svg = container.querySelector("svg")!;
  svg.setAttribute("aria-hidden", "true");
  svg.removeAttribute("aria-labelledby");
  const descriptions = document.createElement("dl");
  descriptions.className = "legend-accessible-text";
  for (const item of legendItems) {
    const name = document.createElement("dt");
    const body = document.createElement("dd");
    name.textContent = t(`help.legend.${item.id}.name` as MessageKey);
    body.textContent = t(`help.legend.${item.id}.body` as MessageKey);
    descriptions.append(name, body);
  }
  container.append(descriptions);
  return container;
}
