"""Approved minimal geometry fixtures; no claims about an unmeasured PDF font."""

from types import SimpleNamespace
import unittest

from common.musescore_pdf import extract_measure


class SixtyFourthGeometryTests(unittest.TestCase):
    def read(self, *, beams=0, flag=False, rest=False):
        # Isolated 1/16-quarter event. Four beams span 2.25 staff spaces;
        # the former two-space search missed the fourth beam.
        def char(text, x, y):
            return dict(
                text=text, x0=x, fontname="Fixture", matrix=(1, 0, 0, 1, 0, 200 - y)
            )

        profile = dict(
            music_font="Fixture",
            stem_linewidth=0.5,
            beats_per_measure=1 / 16,
            heads={"n": dict(stem_offset=1)},
            flags={"f": 4},
            rests={"r": dict(duration=1 / 16, type="64th")},
            techniques={},
            non_rhythm_glyphs=set(),
        )
        page = SimpleNamespace(
            height=200,
            chars=[char("r" if rest else "n", 10, 100)]
            + ([char("f", 11, 88)] if flag else []),
            lines=(
                []
                if rest
                else [dict(width=0, linewidth=0.5, x0=11, top=88, bottom=100)]
            ),
            rects=[
                dict(fill=True, x0=11, x1=20, top=y, width=9, height=2)
                for y in [88, 91, 94, 97, 99][:beams]
            ],
        )
        system = dict(staff=100, spacing=4, page=1, start=1)
        return extract_measure(page, system, 0, 40, 1, profile)

    def test_four_beams_include_the_lowest_beam(self):
        result = self.read(beams=4)
        self.assertEqual(result["issues"], [])
        event = result["events"][0]
        self.assertEqual(
            (event["type"], event["duration"], len(event["beams"])), ("64th", 0.0625, 4)
        )

    def test_profile_defined_flag_and_rest(self):
        for case in (dict(flag=True), dict(rest=True)):
            with self.subTest(case=case):
                result = self.read(**case)
                self.assertEqual(result["issues"], [])
                event = result["events"][0]
                self.assertEqual((event["type"], event["duration"]), ("64th", 0.0625))

    def test_ambiguous_and_unsupported_rhythm_is_reported(self):
        self.assertTrue(
            any(
                "Ambiguous flag/beam" in issue
                for issue in self.read(beams=4, flag=True)["issues"]
            )
        )
        self.assertTrue(
            any(
                "Unsupported beam/flag count" in issue
                for issue in self.read(beams=5)["issues"]
            )
        )


if __name__ == "__main__":
    unittest.main()
