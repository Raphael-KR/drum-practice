// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { installScoreLyrics } from "../../src/modules/score/score-lyrics";

it("keeps all verses below drum ink without accumulating offsets or moving clear lyrics", () => {
  const labels = [6.4, 8.8].map((y) => ({
    PositionAndShape: {
      RelativePosition: { x: -1, y },
      Parent: { RelativePosition: { x: 3 } },
      BorderTop: -1.7,
      BorderMarginLeft: 0,
      BorderMarginRight: 2,
      BorderMarginBottom: 0,
    },
  }));
  const entries = [
    {
      relInMeasureTimestamp: { RealValue: 0 },
      LyricsEntries: labels.map((GraphicalLabel) => ({ GraphicalLabel })),
    },
  ];
  let bottom = 7.1;
  const updateBottomLineWithLabel = vi.fn();
  const staff = {
    Measures: [],
    ParentStaff: { idInMusicSheet: 0 },
    SkyBottomLineCalculator: {
      getBottomLineMax: () => bottom,
      updateBottomLineWithLabel,
    },
  };
  const native = vi.fn(() => {
    labels[0].PositionAndShape.RelativePosition.y = 6.4;
    labels[1].PositionAndShape.RelativePosition.y = 8.8;
    return entries;
  });
  const calculator = { calculateSingleStaffLineLyricsPosition: native };
  const osmd = {
    GraphicSheet: { GetCalculator: calculator },
    EngravingRules: { LyricsYMarginToBottomLine: 0.2 },
  } as unknown as Parameters<typeof installScoreLyrics>[0];
  installScoreLyrics(osmd, new Map(), true);
  const layout =
    calculator.calculateSingleStaffLineLyricsPosition as unknown as (
      line: typeof staff,
      verses: string[],
    ) => typeof entries;
  for (let pass = 0; pass < 2; pass++) {
    expect(layout(staff, ["1", "2"])).toBe(entries);
    expect(labels[0].PositionAndShape.RelativePosition.y).toBeCloseTo(9);
    expect(labels[1].PositionAndShape.RelativePosition.y).toBeCloseTo(11.4);
  }
  expect(updateBottomLineWithLabel).toHaveBeenCalledWith(2, 4, 9);
  bottom = 4;
  layout(staff, ["1", "2"]);
  expect(labels[0].PositionAndShape.RelativePosition.y).toBe(6.4);
  expect(labels[1].PositionAndShape.RelativePosition.y).toBe(8.8);

  const fullScore = {
    ...osmd,
    GraphicSheet: {
      GetCalculator: { calculateSingleStaffLineLyricsPosition: native },
    },
  };
  installScoreLyrics(fullScore as unknown as typeof osmd, new Map());
  const fullLayout = fullScore.GraphicSheet.GetCalculator
    .calculateSingleStaffLineLyricsPosition as unknown as typeof layout;
  expect(fullLayout(staff, ["1", "2"])).toBe(entries);
  expect(
    labels.map((label) => label.PositionAndShape.RelativePosition.y),
  ).toEqual([6.4, 8.8]);
});

it("assigns one valid native SVG class per owned lyric across repeated layout passes", () => {
  const manifest = {
    version: 3,
    partId: "P1",
    audioName: "",
    measures: [{ id: "m1", start: 0, end: 4, beats: 4, denominator: 4 }],
    lyrics: [{ noteId: "n1", voice: "3", id: "가사 / 1", confirmed: true }],
  };
  const doc = new DOMParser().parseFromString(
    `<score-partwise>
    <identification><miscellaneous><miscellaneous-field name="drum-practice:score:v3">${JSON.stringify(manifest)}</miscellaneous-field></miscellaneous></identification>
    <part id="P1"><measure><attributes><divisions>1</divisions></attributes><note id="n1"><rest/><duration>1</duration><voice>3</voice><lyric><text>가</text></lyric></note></measure></part>
  </score-partwise>`,
    "application/xml",
  );
  const label = { SVGClass: "" };
  const entry = {
    parentMeasure: { parentSourceMeasure: { measureListIndex: 0 } },
    relInMeasureTimestamp: { RealValue: 0 },
    LyricsEntries: [{ GraphicalLabel: label }],
  };
  const staff = {
    ParentStaff: { idInMusicSheet: 0 },
    Measures: [],
    SkyBottomLineCalculator: { getBottomLineMax: () => 4 },
  };
  const calc: {
    calculateSingleStaffLineLyricsPosition(
      line: typeof staff,
      verses: string[],
    ): (typeof entry)[];
  } = {
    calculateSingleStaffLineLyricsPosition: () => [entry],
  };
  installScoreLyrics(
    {
      GraphicSheet: { GetCalculator: calc },
      EngravingRules: {},
    } as unknown as Parameters<typeof installScoreLyrics>[0],
    new Map(),
    false,
    doc,
  );
  const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
  for (let pass = 0; pass < 3; pass++) {
    calc.calculateSingleStaffLineLyricsPosition(staff, ["1"]);
    // OSMD's drawer calls DOMTokenList.add(SVGClass), not a whitespace-splitting setter.
    expect(() => node.classList.add(label.SVGClass)).not.toThrow();
  }
  expect(node.classList.length).toBe(1);
  expect(label.SVGClass).toMatch(/^score-lyric-[a-f0-9]+$/);
});
