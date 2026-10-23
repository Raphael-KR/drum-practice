/** Rebuild this source score with the shared XML-only direction fitter. */
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { renderMusicXML } from "/src/modules/score/musicxml.ts";
import { displayPage } from "/src/modules/score/score-pages.ts";
import { fitDirectionOffsets } from "./common/direction-offset.mjs";
import { base64, saveEvidence, sha } from "./common/package.mjs";

export async function run(
  profileURL = "/tools/score-production/musicxml/profiles/red-sunset-rebuild.json",
) {
  const profileResponse = await fetch(profileURL);
  if (!profileResponse.ok)
    throw Error(
      `Production profile: url=${profileURL} status=${profileResponse.status}`,
    );
  const profile = await profileResponse.json();
  const inputURL = `/${profile.input}`;
  const engines = new Set();
  const nativeRender = OpenSheetMusicDisplay.prototype.render;
  OpenSheetMusicDisplay.prototype.render = function (...args) {
    engines.add(this.Version);
    return nativeRender.apply(this, args);
  };
  window.redRebuild = { status: "running" };
  try {
    const response = await fetch(inputURL);
    if (!response.ok)
      throw Error(`Score input: url=${inputURL} status=${response.status}`);
    const result = await fitDirectionOffsets(
      await response.text(),
      (progress) => {
        window.redRebuild.progress = progress;
      },
    );
    if (!engines.size || [...engines].some((v) => v !== "2.2.1-release"))
      throw Error(
        `Renderer version: expected=2.2.1-release actual=${[...engines]}`,
      );
    const xml = new Blob([result.xml]);
    const rendered = await renderMusicXML(xml, () => {}, "P1");
    const first = new DOMParser().parseFromString(
      await (await displayPage(rendered.pages[0])).text(),
      "image/svg+xml",
    );
    const timelines = JSON.parse(
      first.querySelector("metadata[data-ribbon-timeline]").textContent,
    );
    const modes = {
      print: result.pages,
      ribbon: timelines.pages,
      rows: timelines.rows.pages,
      grid: timelines.grid.pages,
    };
    const targets = profile.openCloseMeasures;
    const technicalChecks = [];
    const host = document.createElement("div");
    host.style.cssText = "position:absolute;left:-20000px;top:0;width:1500px";
    document.body.append(host);
    try {
      for (const [mode, sources] of Object.entries(modes)) {
        const seen = [];
        for (const [page, source] of sources.entries()) {
          const doc = new DOMParser().parseFromString(source, "image/svg+xml");
          doc.querySelectorAll("metadata").forEach((e) => e.remove());
          host.replaceChildren(document.importNode(doc.documentElement, true));
          await document.fonts.ready;
          for (const measure of targets) {
            for (const note of host.querySelectorAll(
              `.vf-stavenote[data-note-measure="${measure - 1}"][data-note-beat="0"]`,
            )) {
              const paths = [...note.querySelectorAll(".vf-modifiers path")];
              if (paths.length !== 2)
                throw Error(
                  `O+ coverage: mode=${mode} measure=${measure} expected=2 actual=${paths.length}`,
                );
              const [stopped, harmonic] = paths.map((p) => {
                const b = p.getBBox();
                return { x: b.x, y: b.y, w: b.width, h: b.height };
              });
              const gap = stopped.x - harmonic.x - harmonic.w;
              const centerYDelta = Math.abs(
                stopped.y + stopped.h / 2 - harmonic.y - harmonic.h / 2,
              );
              if (gap < 2.5 || centerYDelta > 0.001)
                throw Error(
                  `O+ layout: mode=${mode} measure=${measure} gap=${gap} minimum=2.5 centerYDelta=${centerYDelta} maximum=0.001`,
                );
              seen.push(measure);
              technicalChecks.push({
                mode,
                page: page + 1,
                measure,
                harmonic,
                stopped,
                gap,
                centerYDelta,
              });
            }
          }
        }
        if (
          JSON.stringify(seen.sort((a, b) => a - b)) !== JSON.stringify(targets)
        )
          throw Error(
            `O+ mode coverage: mode=${mode} expected=${targets} actual=${seen}`,
          );
      }
    } finally {
      host.remove();
    }
    const pages = [];
    for (const page of result.pages)
      pages.push(
        await base64(
          await new Response(
            new Blob([page])
              .stream()
              .pipeThrough(new CompressionStream("gzip")),
          ).blob(),
        ),
      );
    const report = {
      ...result.report,
      xml: result.xml,
      xmlSHA256: await sha(xml),
      pages,
      regions: result.regions,
      technicalChecks,
      engines: [...engines],
      pageCount: pages.length,
    };
    await saveEvidence("render", report, 8917);
    window.redRebuild = { status: "saved", result, rendered, report };
    return {
      status: "saved",
      pages: pages.length,
      sections: report.sections.length,
      directions: report.directions.length,
      technicalPairs: technicalChecks.length,
      xmlSHA256: report.xmlSHA256,
    };
  } catch (error) {
    window.redRebuild.status = "failed";
    window.redRebuild.error = `${error.message}\n${error.stack || ""}`;
    throw error;
  } finally {
    OpenSheetMusicDisplay.prototype.render = nativeRender;
  }
}
