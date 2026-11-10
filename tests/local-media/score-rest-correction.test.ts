// @vitest-environment jsdom
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fixAllDrumRestPositions } from "../../src/modules/score/score-rest-correction";
it("fixes every rest to one of three audited lanes without changing rhythm or notes", () => {
  const text = readFileSync(
    "data/reference/test-fixtures/musicxml-candidate.musicxml",
    "utf8",
  );
  const result = fixAllDrumRestPositions(text);
  expect(result.counts).toEqual({
    cymbal: 15,
    drum: 10,
    kick: 237,
    fullBar: 5,
  });
  const a = new DOMParser().parseFromString(text, "application/xml"),
    b = new DOMParser().parseFromString(result.text, "application/xml");
  const barFiveRests = Array.from(
    b.querySelectorAll('part[id="P1"] > measure[number="5"] rest'),
  );
  expect(barFiveRests.map((r) => r.textContent)).toEqual([
    "A5",
    "A5",
    "D4",
    "D4",
    "D4",
    "D4",
  ]);
  for (const r of b.querySelectorAll('part[id="P1"] rest')) {
    if (r.getAttribute("measure") === "yes") expect(r.children.length).toBe(0);
    else expect(["A5", "B4", "D4"]).toContain(r.textContent);
  }
  for (const d of [a, b])
    for (const r of d.querySelectorAll("rest")) r.replaceChildren();
  expect(new XMLSerializer().serializeToString(b)).toBe(
    new XMLSerializer().serializeToString(a),
  );
  expect(fixAllDrumRestPositions(result.text).changed).toBe(false);
  expect(fixAllDrumRestPositions("<score-partwise/>").changed).toBe(false);
  expect(
    fixAllDrumRestPositions(readFileSync("public/demo/score.musicxml", "utf8"))
      .changed,
  ).toBe(false);
});

it("removes full-bar rest height once while retaining heights in active multi-voice measures", () => {
  const xml =
    '<score-partwise><part id="P1"><measure number="1"><note><rest measure="yes"><display-step>B</display-step><display-octave>4</display-octave></rest><duration>16</duration><voice>1</voice></note></measure><measure number="8"><note><rest measure="yes"><display-step>B</display-step><display-octave>4</display-octave></rest><duration>16</duration><voice>1</voice></note><note><unpitched/><duration>16</duration><voice>2</voice></note></measure></part></score-partwise>';
  const result = fixAllDrumRestPositions(xml);
  const d = new DOMParser().parseFromString(result.text, "application/xml");
  expect(d.querySelector('measure[number="1"] rest')?.children.length).toBe(0);
  expect(d.querySelector('measure[number="8"] rest')?.textContent).toBe("B4");
  expect(fixAllDrumRestPositions(result.text).changed).toBe(false);
});
