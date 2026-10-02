// @vitest-environment jsdom
import { it, expect, vi, beforeAll, afterAll } from "vitest";
import { Blob } from "node:buffer";
beforeAll(() => vi.stubGlobal("Blob", Blob));
afterAll(() => vi.unstubAllGlobals());
import {
  beamProgressX,
  notePulseBeats,
  highlightPage,
  updateNoteHighlights,
  annotateNoteHighlights,
} from "../src/note-highlight";
it("interpolates exact fractional note onsets, including tuplets, without rounding to beats", () => {
  const points = [
    { beat: 0, x: 20 },
    { beat: 1 / 3, x: 50 },
    { beat: 1, x: 140 },
  ];
  expect(beamProgressX(points, -0.01)).toBe(20);
  expect(beamProgressX(points, 0)).toBe(20);
  expect(beamProgressX(points, 1 / 6)).toBeCloseTo(35);
  expect(beamProgressX(points, 2 / 3)).toBeCloseTo(95);
  expect(beamProgressX(points, 1)).toBe(140);
});
it("switches simultaneous notes at onset; resets on rewind, bar changes and count-off", () => {
  const host = document.createElement("div");
  host.innerHTML =
    '<svg class="note-highlight" data-highlight-measure="0"><g data-highlight-beat="0"></g><g data-highlight-beat="0.5"></g><g data-highlight-beat="0.5"></g><g data-highlight-beam=\'[{"beat":0,"x":10},{"beat":1,"x":110}]\'><rect data-highlight-clip=""></rect></g></svg>';
  const notes = host.querySelectorAll<SVGElement>("[data-highlight-beat]");
  updateNoteHighlights(host, 0, 0.499);
  expect(notes[0].style.visibility).toBe("hidden");
  expect(notes[1].style.visibility).toBe("hidden");
  updateNoteHighlights(host, 0, 0.5);
  expect([...notes].map((n) => n.style.visibility)).toEqual([
    "hidden",
    "visible",
    "visible",
  ]);
  expect(
    host.querySelector("[data-highlight-clip]")!.getAttribute("width"),
  ).toBe("25");
  updateNoteHighlights(host, 0, 1.25);
  expect(
    host.querySelector("[data-highlight-clip]")!.getAttribute("width"),
  ).toBe("0");
  expect([...notes].every((n) => n.style.visibility === "hidden")).toBe(true);
  updateNoteHighlights(host, 0, 0);
  expect(notes[1].style.visibility).toBe("hidden");
  updateNoteHighlights(host, 1, 0);
  expect(host.querySelector("svg")!.style.display).toBe("none");
  updateNoteHighlights(host, 0, 0.5, true);
  expect(host.querySelector("svg")!.style.display).toBe("none");
});
it("extracts only tagged note and beam shapes, retaining hollow heads and dropping active content", async () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200"><path id="staff" d="M0 20H100"/><g transform="translate(0 3)"><g data-note-measure="4" data-note-beat="1.5" onclick="bad()"><path d="M1 1L3 3" fill="white" stroke="black"/><script>bad()</script><image href="https://example.com"/></g><path data-beam-measure="4" data-beam-points="[]" d="M1 2L3 4"/></g></svg>';
  const result = await highlightPage(
    new Blob([svg], { type: "image/svg+xml" }) as unknown as globalThis.Blob,
  );
  expect(result?.width).toBe(100);
  expect(result?.height).toBe(200);
  const text = result!.measures.get(4)!;
  expect(text).toContain('data-highlight-beat="1.5"');
  expect(text).toContain("translate(0 3)");
  expect(text).toContain('fill="white"');
  expect(text).toContain('stroke="currentColor"');
  expect(text).not.toMatch(/script|onclick|https:|staff/);
});
it("attaches rhythmic data to notes and beams but excludes rests", () => {
  const make = (rest = false) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const stem = document.createElementNS("http://www.w3.org/2000/svg", "path");
    Object.assign(stem, { getBBox: () => ({ x: 20, width: 2 }) });
    return {
      sourceNote: { isRest: () => rest },
      getSVGGElement: () => group,
      getStemSVG: () => stem,
      getBeamSVGs: () => [beam],
    };
  };
  const beam = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const note = make(),
    rest = make(true);
  const osmd = {
    GraphicSheet: {
      MeasureList: [
        [
          {
            staffEntries: [
              {
                relInMeasureTimestamp: { RealValue: 3 / 8 },
                graphicalVoiceEntries: [{ notes: [note, rest] }],
              },
            ],
          },
        ],
      ],
    },
  };
  annotateNoteHighlights(osmd, [4]);
  expect(note.getSVGGElement().getAttribute("data-note-beat")).toBe("1.5");
  expect(rest.getSVGGElement().hasAttribute("data-note-beat")).toBe(false);
  expect(beam.getAttribute("data-beam-measure")).toBe("0");
});
it("uses the connected beam voice instead of nearby simultaneous stems", () => {
  const beam = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const sourceBeam: { Notes: any[] } = { Notes: [] };
  const note = (beat: number, x: number, connected: boolean) => {
    const source = {
      isRest: () => false,
      NoteBeam: connected ? sourceBeam : undefined,
    };
    if (connected) sourceBeam.Notes.push(source);
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    Object.assign(group, { getBBox: () => ({ x, width: 1 }) });
    return {
      relInMeasureTimestamp: { RealValue: beat / 4 },
      graphicalVoiceEntries: [
        {
          notes: [
            {
              sourceNote: source,
              vfnote: [{ getStemX: () => x }],
              getSVGGElement: () => group,
              getBeamSVGs: () => (connected ? [beam] : []),
            },
          ],
        },
      ],
    };
  };
  const entries = [
    note(0, 30, true),
    note(0, 20, false),
    note(0.5, 80, true),
    note(0.25, 45, false),
  ];
  annotateNoteHighlights(
    { GraphicSheet: { MeasureList: [[{ staffEntries: entries }]] } },
    [4],
  );
  expect(JSON.parse(beam.getAttribute("data-beam-points")!)).toEqual([
    { beat: 0, x: 30 },
    { beat: 0.5, x: 80 },
  ]);
});
it("hides notes and beams immediately when disabled and restores current beat on enable", () => {
  const host = document.createElement("div");
  host.innerHTML =
    '<svg class="note-highlight" data-highlight-measure="0"><g data-highlight-beat="0"></g><g data-highlight-beat="1"></g></svg>';
  updateNoteHighlights(host, 0, 0.5, false, true);
  expect(host.querySelector("svg")!.style.display).toBe("block");
  updateNoteHighlights(host, 0, 0.5, false, false);
  expect(host.querySelector("svg")!.style.display).toBe("none");
  updateNoteHighlights(host, 0, 1, false, true);
  expect(host.querySelector("svg")!.style.display).toBe("block");
  expect(
    [...host.querySelectorAll<SVGElement>("[data-highlight-beat]")].map(
      (e) => e.style.visibility,
    ),
  ).toEqual(["hidden", "visible"]);
});

it("cuts off the previous pulse at fast consecutive onsets and expires isolated notes", () => {
  const host = document.createElement("div");
  host.innerHTML =
    '<svg class="note-highlight" data-highlight-measure="0"><g data-highlight-beat="0"></g><g data-highlight-beat="0.125"></g></svg>';
  const states = () =>
    [...host.querySelectorAll<SVGElement>("[data-highlight-beat]")].map(
      (n) => n.style.visibility,
    );
  updateNoteHighlights(host, 0, 0.1);
  expect(states()).toEqual(["visible", "hidden"]);
  updateNoteHighlights(host, 0, 0.125);
  expect(states()).toEqual(["hidden", "visible"]);
  updateNoteHighlights(host, 0, 0.375);
  expect(states()).toEqual(["hidden", "hidden"]);
});
it("keeps flashes about 140ms at practice tempo, capped at a quarter beat", () => {
  expect(notePulseBeats(4, 4, 1)).toBeCloseTo(0.14);
  expect(notePulseBeats(4, 4, 0.5)).toBeCloseTo(0.07);
  expect(notePulseBeats(4, 1, 1)).toBe(0.25);
});
