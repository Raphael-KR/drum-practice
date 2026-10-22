"""Handoff regressions from existing real score packages; no generated score data."""
import json
import tempfile
import unittest
from pathlib import Path

from common.artifacts import ROOT
from common.handoff import compose, inspect_artifacts, inspect_evidence, receipt


class HandoffTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config_path = ROOT/'tools/score-production/musicxml/profiles/ioi-suddenly-handoff.json'
        cls.config = json.loads(cls.config_path.read_text())
        (ROOT/'.tmp').mkdir(exist_ok=True)

    def test_candidate_bytes_and_bound_evidence(self):
        with tempfile.TemporaryDirectory(dir=ROOT/'.tmp') as temp:
            result = compose(self.config_path, Path(temp)/'draft')
            self.assertEqual(result['summary']['measures'], 93)
            self.assertEqual(result['summary']['lyrics'], 301)
            self.assertEqual([e['status'] for e in result['evidence']], ['passed', 'passed', 'recorded'])
            self.assertEqual(result['delivery'], 'not sent')
            self.assertIn('교정', (Path(temp)/'draft/handoff.md').read_text())
            with self.assertRaisesRegex(ValueError, 'fresh path'):
                compose(self.config_path, Path(temp)/'draft')
            with self.assertRaisesRegex(ValueError, 'recipient thread'):
                receipt(Path(temp)/'draft', '01a0fd08-ba73-7482-b10e-40e637a1efc0',
                        '2026-10-22T16:57:59Z', 'existing real handoff', 'accepted')

    def test_musicxml_only_does_not_require_unrequested_audio_or_package(self):
        artifacts, summary, checks = inspect_artifacts({'musicxml':self.config['artifacts']['musicxml']}, ROOT)
        self.assertEqual(list(artifacts), ['musicxml'])
        self.assertEqual(summary['title'], '갑자기')
        self.assertEqual(len(checks), 1)

    def test_record_observed_real_delivery_without_resending(self):
        original = ROOT/'data/production/ioi-suddenly-20261023'
        observed = json.loads((original/'handoff-result.json').read_text())
        with tempfile.TemporaryDirectory(dir=ROOT/'.tmp') as temp:
            folder = Path(temp)
            # Existing real body and recipient/receipt only; no simulated send.
            (folder/'handoff.md').write_bytes((original/'handoff.md').read_bytes())
            (folder/'handoff.json').write_text(json.dumps({'recipient':{'threadId':observed['recipientThreadId']}}))
            result = receipt(folder, observed['recipientThreadId'], observed['sentAt'],
                             observed['status'], 'accepted')
            self.assertEqual(result['status'], 'accepted')
            self.assertEqual(len(result['bodySHA256']), 64)
            with self.assertRaisesRegex(ValueError, 'fresh file'):
                receipt(folder, observed['recipientThreadId'], observed['sentAt'], observed['status'], 'accepted')

    def test_different_real_package_and_audio_are_rejected(self):
        spec = dict(self.config['artifacts'])
        spec['package'] = 'data/production/red-sunset/final/build-03/red-sunset.drumscore'
        with self.assertRaisesRegex(ValueError, 'package MusicXML SHA256'):
            inspect_artifacts(spec, ROOT)
        spec = dict(self.config['artifacts'])
        spec['sourceAudio'] = 'data/production/loveholic/audio/source.mp3'
        with self.assertRaisesRegex(ValueError, 'package audio SHA256'):
            inspect_artifacts(spec, ROOT)

    def test_old_evidence_cannot_pass_for_other_actual_score(self):
        artifacts, _, _ = inspect_artifacts({'musicxml':'data/production/ioi-suddenly-20261023/xml-final/source-transcription.musicxml'}, ROOT)
        result = inspect_evidence(self.config['evidence'][0], artifacts, ROOT)
        self.assertEqual(result['status'], 'failed')
        self.assertIn('expected=', result['reason'])
        # An existing report without a pass field remains unknown, never a pass.
        spec = {**self.config['evidence'][0], 'path':'data/production/ioi-suddenly-20261023/extraction/source-audit.json'}
        self.assertEqual(inspect_evidence(spec, artifacts, ROOT)['status'], 'unverified')


if __name__ == '__main__':
    unittest.main()
