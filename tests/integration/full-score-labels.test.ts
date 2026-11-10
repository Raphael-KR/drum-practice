// @vitest-environment jsdom
import { expect, it } from "vitest";
import { fullScoreLabels } from "../../src/modules/score/full-score-labels";
it("uses real labels at each row start instead of renderer element IDs", () => {
  const svg =
    '<svg viewBox="0 0 1000 2000"><g class="vf-measure" id="d-m32-0"><g class="vf-stave"><path d="M50 100L300 100"/></g></g><g class="vf-measure" id="d-m33-0"><g class="vf-stave"><path d="M300 100L500 100"/></g></g><g class="vf-measure" id="d-m36-0"><path d="M50 400L300 400"/></g></svg>';
  const cells = [
    { label: "33", x: 50, y: 100, w: 250 },
    { label: "34", x: 300, y: 100, w: 200 },
    { label: "37", x: 50, y: 400, w: 250 },
  ].map(({ label, x, y, w }) => ({
    measure: { id: label, label },
    region: {
      id: label,
      page: 0,
      x: x / 1000,
      y: y / 2000,
      w: w / 1000,
      h: 40 / 2000,
      beatXs: [],
    },
  }));
  expect(fullScoreLabels(svg, cells)).toEqual([
    { label: "33", left: 5, top: 5 },
    { label: "37", left: 5, top: 20 },
  ]);
  expect(svg).not.toContain("full-svg-measure-label");
});
it("rejects missing page geometry", () =>
  expect(fullScoreLabels("<svg/>", [])).toEqual([]));
