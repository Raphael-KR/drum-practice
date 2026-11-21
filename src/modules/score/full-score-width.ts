import type { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import type { GraphicalMusicPage } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalMusicPage";
import type { MusicSystem } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/MusicSystem";
import { rowScale } from "./time-spacing";

const scales = new WeakMap<MusicSystem, number>();

/** Keep a normal four-bar row at native size; only overflowing systems shrink. */
export function fitFullScoreWidth(page: GraphicalMusicPage) {
  const systems = page.MusicSystems;
  const reference =
    systems.find((system) => {
      const measures = system.StaffLines[0].Measures.filter(
        (measure) => !measure.IsExtraGraphicalMeasure,
      );
      return (
        measures.length === 4 &&
        measures.every((m) => m.parentSourceMeasure?.Duration.RealValue === 1)
      );
    }) ?? systems[0];
  // Scores without a four-bar 4/4 row retain their first authored row as reference.
  const width = reference.StaffLines[0].PositionAndShape.Size.width;
  for (const system of systems)
    scales.set(
      system,
      rowScale([system.StaffLines[0].PositionAndShape.Size.width], width),
    );
  return width;
}

/** Native glyph coordinates stay intact; drawing and derived regions share this transform. */
export function fullScoreSystemTransform(system: MusicSystem) {
  const scale = scales.get(system) ?? 1;
  const staff = system.StaffLines[0].PositionAndShape.AbsolutePosition;
  const page = system.Parent.PositionAndShape.AbsolutePosition;
  return {
    scale,
    x: (1 - scale) * (staff.x - page.x) * 10,
    y: (1 - scale) * (staff.y - page.y) * 10,
  };
}

/** Create the transform group before native drawing, never rewrite a finished SVG. */
export function installFullScoreDrawing(osmd: OpenSheetMusicDisplay) {
  const renderer = osmd as unknown as {
    createOrRefreshRenderBackend(width?: number): void;
  };
  const create = renderer.createOrRefreshRenderBackend.bind(osmd);
  renderer.createOrRefreshRenderBackend = (width) => {
    const rules = osmd.EngravingRules;
    create(
      width ??
        (rules.PageLeftMargin +
          osmd.GraphicSheet.MusicPages[0].PositionAndShape.Size.width +
          rules.PageRightMargin) *
          10 *
          osmd.Zoom,
    );
    const drawer = osmd.Drawer as unknown as {
      drawMusicSystem(system: MusicSystem): void;
    };
    const draw = drawer.drawMusicSystem.bind(drawer);
    drawer.drawMusicSystem = (system) => {
      const context =
        osmd.Drawer.Backends[system.Parent.PageNumber - 1].getContext();
      const group = context.openGroup();
      if (!(group instanceof SVGElement))
        throw Error("Full-score row fitting requires the SVG backend");
      const { scale, x, y } = fullScoreSystemTransform(system);
      group.classList.add("osmd-full-score-system");
      group.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
      try {
        draw(system);
      } finally {
        context.closeGroup();
      }
    };
  };
}
