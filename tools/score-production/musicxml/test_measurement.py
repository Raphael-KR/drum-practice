"""Check two collected scopes against an existing checkpoint and actual logs.

No synthetic fixtures, sessions, or databases are created. Pass explicit local
report paths; ordinary unittest discovery skips this opt-in historical check.
"""
import argparse
import copy
import json
import unittest
from collections import defaultdict
from pathlib import Path
from common.measurement import KEYS, add, load_pricing, summarize, zero, write_json


class MeasurementTests(unittest.TestCase):
    paths = None

    @classmethod
    def setUpClass(cls):
        if cls.paths is None:
            raise unittest.SkipTest("Supply --legacy, --complete, --reference, --reference-records and --pricing")
        args = cls.paths
        cls.legacy = json.loads(args.legacy.read_text())
        cls.complete = json.loads(args.complete.read_text())
        cls.reference = json.loads(args.reference.read_text())
        cls.original_rows = json.loads(args.reference_records.read_text())
        cls.rows = json.loads(args.complete.with_name("usage-records.json").read_text())
        cls.legacy_rows = json.loads(args.legacy.with_name("usage-records.json").read_text())
        cls.rates, _ = load_pricing(args.pricing)

    def test_exact_original_scope(self):
        for key in ("root_thread_id", "root_turn_id", "started_at", "snapshot_at", "response_count", "tokens", "unpriced_tokens"):
            self.assertEqual(self.legacy[key], self.reference[key], key)
        self.assertAlmostEqual(self.legacy["reference_api_usd_priced_subset"],
                               self.reference["reference_api_usd_priced_subset"], places=9)
        self.assertEqual({r["response_id"]: r["usage"] for r in self.legacy_rows},
                         {r["response_id"]: r["usage"] for r in self.original_rows})

    def test_expanded_scope_and_receiver_delta(self):
        old_ids = {r["response_id"] for r in self.legacy_rows}
        all_ids = {r["response_id"] for r in self.rows}
        self.assertTrue(old_ids <= all_ids)
        self.assertEqual(len(all_ids), len(self.rows))
        extra = [r for r in self.rows if r["response_id"] not in old_ids]
        self.assertTrue(extra, "This comparison needs an observed expanded-scope delta")
        self.assertEqual({r["scope"] for r in extra}, {"causally_linked_thread"})
        total = zero()
        for row in extra:
            add(total, row["usage"])
        self.assertEqual(total, {k: self.complete["tokens"][k] - self.legacy["tokens"][k] for k in KEYS})
        self.assertAlmostEqual(sum(r["reference_api_usd"] or 0 for r in extra),
                               self.complete["reference_api_usd_priced_subset"] - self.legacy["reference_api_usd_priced_subset"], places=9)
        producer = next(s for s in self.complete["scopes"] if s["scope"] == "producer")
        self.assertEqual(producer["tokens"], self.legacy["tokens"])

    def test_actual_source_records_and_metadata_only_export(self):
        allowed = {"timestamp", "thread_id", "turn_id", "root_turn_id", "response_id", "model", "effort",
                   "service_tier", "thread_source", "scope", "usage", "log", "line",
                   "reference_api_usd", "reference_codex_credits"}
        by_log = defaultdict(dict)
        for row in self.rows:
            self.assertEqual(set(row), allowed)
            self.assertEqual(row["root_turn_id"], self.complete["root_turn_id"])
            by_log[row["log"]][row["line"]] = row
        for log, expected in by_log.items():
            seen = set()
            with Path(log).open() as source:
                for line_no, raw in enumerate(source, 1):
                    if line_no not in expected:
                        continue
                    event = json.loads(raw)
                    row = expected[line_no]
                    self.assertEqual(event["type"], "token_usage_record")
                    for key in ("root_turn_id", "thread_id", "turn_id", "response_id", "usage"):
                        self.assertEqual(event["payload"][key], row[key], f"{log}:{line_no} {key}")
                    seen.add(line_no)
            self.assertEqual(seen, set(expected))
        self.assertTrue(self.complete["diagnostics"]["root_turn_cumulative_matches"])
        self.assertEqual(self.legacy["diagnostics"]["compactions"], self.reference["diagnostics"]["compactions"])

    def test_absent_and_unsupported_model_rates_stay_unpriced(self):
        unpriced = summarize(copy.deepcopy(self.rows), None)
        self.assertIsNone(unpriced["reference_api_usd_priced_subset"])
        self.assertIsNone(unpriced["reference_codex_credits_priced_subset"])
        self.assertIsNone(unpriced["actual_charge_usd"])
        self.assertEqual(unpriced["unpriced_tokens"], self.complete["tokens"])
        unknown = [r for r in self.rows if r["reference_api_usd"] is None]
        self.assertTrue(unknown, "The historical checkpoint must contain actual unsupported-model records")
        result = summarize(copy.deepcopy(unknown), self.rates)
        self.assertIsNone(result["reference_api_usd_priced_subset"])
        self.assertEqual(result["api_priced_responses"], 0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("legacy", "complete", "reference", "reference-records", "pricing"):
        parser.add_argument("--" + name, required=True, type=Path)
    parser.add_argument("--comparison-out", type=Path, help="Optional metadata-only scope difference report")
    args = parser.parse_args()
    MeasurementTests.paths = args
    result = unittest.TextTestRunner(verbosity=1).run(unittest.defaultTestLoader.loadTestsFromTestCase(MeasurementTests))
    if result.wasSuccessful() and args.comparison_out:
        ids = {r["response_id"] for r in MeasurementTests.legacy_rows}
        extra = [r for r in MeasurementTests.rows if r["response_id"] not in ids]
        write_json(args.comparison_out, {
            "legacy_report": str(args.legacy.resolve()), "complete_report": str(args.complete.resolve()),
            "reference_report": str(args.reference.resolve()),
            "note": "Original candidate scope reproduced exactly. Existing recipient thread continued under the same root_turn_id after handoff; expanded scope includes these additional persisted responses.",
            "additional_records": extra, "additional_usage": summarize(copy.deepcopy(extra), MeasurementTests.rates),
            "tests_run": result.testsRun, "tests_passed": True})
    raise SystemExit(0 if result.wasSuccessful() else 1)
