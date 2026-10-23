import { renderMusicXML } from "/src/modules/score/musicxml.ts";
import { displayPage } from "/src/modules/score/score-pages.ts";
import { layoutSectionDirections } from "./common/direction-layout.mjs";

export async function renderDirectionReview(base) {
  const read = async (name) => {
    const r = await fetch(`${base}/${name}`);
    if (!r.ok) throw Error(`Review input: ${name}, HTTP=${r.status}`);
    return r;
  };
  const audit = await (await read("xml-audit.json")).json();
  const rendered = await renderMusicXML(
    await (await read("score.musicxml")).blob(),
    () => {},
    "P1",
  );
  const host = document.createElement("div");
  host.style.cssText = "position:absolute;left:0;top:0;background:white";
  document.body.append(host);
  const pages = [],
    geometry = [];
  try {
    for (const [i, page] of rendered.pages.entries()) {
      const holder = document.createElement("div");
      holder.innerHTML = await (await displayPage(page)).text();
      host.append(holder);
      const svg = holder.querySelector("svg");
      const before = [...svg.querySelectorAll("[data-note-measure]")].map(
        (n) => n.outerHTML,
      );
      geometry.push(layoutSectionDirections(svg, audit, i));
      const after = [...svg.querySelectorAll("[data-note-measure]")].map(
        (n) => n.outerHTML,
      );
      if (JSON.stringify(before) !== JSON.stringify(after))
        throw Error(`Note geometry changed: page=${i + 1}`);
      pages.push(new XMLSerializer().serializeToString(svg));
      holder.remove();
    }
  } finally {
    host.remove();
  }
  const sections = geometry.flatMap((p) => p.sections);
  const directions = geometry.flatMap((p) => p.directions);
  if (
    sections.length !== audit.sections.length ||
    directions.length !== audit.directions.length
  )
    throw Error(
      `Layout coverage: sections=${sections.length}/${audit.sections.length}, directions=${directions.length}/${audit.directions.length}`,
    );
  return {
    pages,
    report: {
      geometry,
      sections: sections.length,
      directions: directions.length,
      measures: rendered.parsed.measures.length,
      warnings: rendered.parsed.warnings,
      noteGeometry: "unchanged",
      xmlAppliedBeats: "unchanged",
      status: "PASS",
    },
  };
}
