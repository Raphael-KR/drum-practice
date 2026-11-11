"""Real-score regressions and the approved minimal 64th-note boundary input."""

import unittest
from pathlib import Path

from lxml import etree as E
from common.artifacts import ROOT
from common.lyric_onsets import audit_lyric_onsets


class LyricOnsetTests(unittest.TestCase):
    def audit(self, relative):
        return audit_lyric_onsets(E.parse(str(ROOT / relative)).getroot())

    def test_existing_six_canonicals_keep_all_syllables(self):
        counts = {
            "real-paradis": 515,
            "loveholic": 269,
            "ioi-suddenly": 301,
            "red-sunset": 0,
            "tom-moving": 0,
            "preplay-warmup": 0,
        }
        for song, count in counts.items():
            with self.subTest(song=song):
                report = self.audit(
                    Path("data/production/lyric-onsets-20261111")
                    / song
                    / "score.musicxml"
                )
                self.assertEqual(report["status"], "PASS")
                self.assertEqual(report["syllables"], count)
                self.assertEqual(report["duplicatePairs"], 0)
                self.assertEqual(report["grid64"]["offGridStarts"], [])
                self.assertEqual(report["grid64"]["offGridDurations"], [])

    def test_real_pre_correction_duplicates_are_still_detected(self):
        report = self.audit(
            Path("data/production/lyric-onsets-20261111/real-paradis/before.musicxml")
        )
        self.assertEqual(report["status"], "DUPLICATE_ONSETS")
        self.assertEqual(report["syllables"], 515)
        self.assertEqual(report["duplicatePairs"], 30)
        self.assertEqual(
            len({r["syllables"][0]["measure"] for r in report["duplicates"]}), 24
        )

    def test_sixty_fourth_start_duration_and_last_cell(self):
        root = E.fromstring(
            b'<score-partwise version="4.0"><part id="P1"><measure number="1">'
            b"<attributes><divisions>16</divisions><time><beats>4</beats>"
            b"<beat-type>4</beat-type></time></attributes>"
            b"<forward><duration>1</duration></forward>"
            b"<note><rest/><duration>1</duration><voice>3</voice><type>64th</type>"
            b"<lyric><text>a</text></lyric></note>"
            b"<forward><duration>61</duration></forward>"
            b"<note><rest/><duration>1</duration><voice>3</voice><type>64th</type>"
            b"<lyric><text>b</text></lyric></note>"
            b"</measure></part></score-partwise>"
        )
        before = E.tostring(root)
        report = audit_lyric_onsets(root)
        self.assertEqual(report["status"], "PASS")
        self.assertEqual(report["syllables"], 2)
        self.assertEqual(report["grid64"]["offGridStarts"], [])
        self.assertEqual(report["grid64"]["offGridDurations"], [])
        self.assertEqual(E.tostring(root), before)


if __name__ == "__main__":
    unittest.main()
