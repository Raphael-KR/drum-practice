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
    { LyricsEntries: labels.map((GraphicalLabel) => ({ GraphicalLabel })) },
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
  expect(
    fullScore.GraphicSheet.GetCalculator.calculateSingleStaffLineLyricsPosition,
  ).toBe(native);
});
