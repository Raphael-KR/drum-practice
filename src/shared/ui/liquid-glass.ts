import "../styles/liquid-glass.css";

let nextLensId = 0;

/** Shared decoration for a mounted surface; content and controls stay intact. */
export function mountLiquidGlass(surface: HTMLElement) {
  const id = `liquid-glass-lens-${++nextLensId}`;
  const definitions = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  definitions.setAttribute("width", "0");
  definitions.setAttribute("height", "0");
  definitions.setAttribute("aria-hidden", "true");
  definitions.setAttribute("focusable", "false");
  definitions.classList.add("liquid-glass-definitions");
  definitions.innerHTML = `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="4" result="noise"/>
    <feGaussianBlur in="noise" stdDeviation="4" result="map"/>
    <feDisplacementMap in="SourceGraphic" in2="map" scale="40" xChannelSelector="R" yChannelSelector="G"/>
  </filter>`;
  const refract = document.createElement("span");
  refract.className = "liquid-glass__refract";
  refract.setAttribute("aria-hidden", "true");
  refract.style.setProperty("--liquid-glass-filter", `url(#${id})`);
  const shine = document.createElement("span");
  shine.className = "liquid-glass__shine";
  shine.setAttribute("aria-hidden", "true");
  const refresh = () => {
    // Define the filter before the element that references it, including WebKit.
    surface.before(definitions);
    surface.prepend(refract, shine);
  };
  surface.classList.add("liquid-glass");
  refresh();
  return {
    refresh,
    dispose() {
      definitions.remove();
      refract.remove();
      shine.remove();
      surface.classList.remove("liquid-glass");
    },
  };
}
