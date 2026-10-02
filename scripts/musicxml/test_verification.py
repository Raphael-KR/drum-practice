"""Fault injection into generated MusicXML; requires the reproducible local inputs."""

import copy, json, tempfile, unittest, sys, io
from contextlib import redirect_stdout
from unittest.mock import patch
from compare import main as compare_main
from pathlib import Path
from lxml import etree as E
from verify import verify

BASE = Path(__file__).resolve().parents[2] / "docs/experiments/musicxml"


class VerificationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ir = json.loads((BASE / "extracted.json").read_text())
        cls.tree = E.parse(str(BASE / "real-paradis-110-candidate.musicxml"))

    def reject(self, mutate):
        tree = copy.deepcopy(self.tree)
        mutate(tree)
        with tempfile.TemporaryDirectory(dir=BASE) as tmp:
            path = Path(tmp) / "corrupt.musicxml"
            tree.write(str(path))
            with self.assertRaises((AssertionError, E.DocumentInvalid)):
                verify(path, self.ir, BASE / "schema")

    def test_comparison_accepts_measure_comments(self):
        tree = copy.deepcopy(self.tree)
        tree.find("part").insert(0, E.Comment("Audiveris measure annotation"))
        with tempfile.TemporaryDirectory(dir=BASE) as tmp:
            folder = Path(tmp)
            xml = folder / "commented.musicxml"
            tree.write(str(xml))
            with patch.object(sys, "argv", ["compare", "--claude", str(xml),
                              "--codex", str(xml), "--out", str(folder)]):
                with redirect_stdout(io.StringIO()):
                    compare_main()
            result = json.loads((folder / "comparison.json").read_text())
            self.assertEqual(result["results"]["Codex"]["metrics"]["attack_and_duration"]["f1"], 100)
            excerpt = E.parse(str(folder / "codex-excerpt.musicxml"))
            self.assertEqual([m.get("number") for m in excerpt.findall("./part/measure")], ["9", "12", "84"])

    def test_missing_note(self):
        def mutate(t):
            m = t.find(".//measure[@number='9']")
            m.remove(m.find("note"))

        self.reject(mutate)

    def test_wrong_drum_same_duration(self):
        self.reject(
            lambda t: t.find(".//measure[@number='9']/note/instrument").set(
                "id", "P1-kick"
            )
        )

    def test_lost_tuplet_ratio(self):
        def mutate(t):
            tm = t.find(".//time-modification")
            tm.getparent().remove(tm)

        self.reject(mutate)

    def test_chord_turned_into_sequential_note(self):
        def mutate(t):
            chord = t.find(".//chord")
            chord.getparent().remove(chord)

        self.reject(mutate)

    def test_wrong_time_signature(self):
        def mutate(t):
            t.find(".//measure[@number='84']/attributes/time/beats").text = "4"

        self.reject(mutate)

    def test_wrong_staff_position(self):
        def mutate(t):
            t.find(".//measure[@number='9']/note/unpitched/display-step").text = "B"

        self.reject(mutate)

    def test_repeat_style_missing(self):
        def mutate(t):
            style = t.find(".//measure-repeat")
            style.getparent().remove(style)

        self.reject(mutate)

    def test_wrong_tempo(self):
        self.reject(lambda t: t.find(".//sound").set("tempo", "120"))


if __name__ == "__main__":
    unittest.main()
