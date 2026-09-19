import { it, expect } from "vitest";
import { packLabels } from "../src/lyric-layout";
it("preserves separated anchors and centers a crowded cluster without overlap", () => {
  const items = [
    { left: 0, width: 15 },
    { left: 50, width: 15 },
    { left: 58, width: 15 },
    { left: 120, width: 15 },
  ];
  const p = packLabels(items);
  expect(p[0]).toBe(0);
  expect(p[3]).toBe(120);
  expect(p[1] - 50).toBeCloseTo(-(p[2] - 58));
  for (let i = 1; i < p.length; i++)
    expect(p[i] - p[i - 1]).toBeGreaterThanOrEqual(items[i - 1].width + 2);
});
it('keeps a centered opening lyric inside the row without overlapping neighbors',()=>{
 const p=packLabels([{left:-18,width:40},{left:12,width:22},{left:100,width:20}],2,4);
 expect(p[0]).toBeGreaterThanOrEqual(4);
 expect(p[1]).toBeGreaterThanOrEqual(p[0]+42);
 expect(p[2]).toBe(100);
});
