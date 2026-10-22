"""Regression checks using existing, preserved score inputs (no new composition)."""
import base64
import gzip
import json
import tempfile
import unittest
from pathlib import Path
from common.artifacts import ROOT, profile, sha
from common.evidence import write_artifacts
from common.instruments import INSTRUMENTS
from common.midi import midi, schedule
from common.musicxml import validate_schema, read_timeline

ASSETS = ROOT / 'data/production'


class CommonTests(unittest.TestCase):
    def test_existing_score_schema_and_timeline(self):
        cases = [
            (ROOT/'data/reference/musicxml/real-paradis-110-candidate.musicxml',110,441),
            (ASSETS/'loveholic/final/Loveholic-final.musicxml',123,492),
            (ASSETS/'red-sunset/final/build-03/red-sunset-final.musicxml',137,550),
            (ASSETS/'preplay-warmup/final/preplay-warmup-final.musicxml',96,384),
            (ASSETS/'tom-moving/final/tom-moving-final.musicxml',28,112),
        ]
        for path,count,quarters in cases:
            with self.subTest(path=path):
                rows=read_timeline(validate_schema(path,ROOT/'data/reference/musicxml/schema'))
                self.assertEqual(len(rows),count)
                self.assertEqual(sum(r['extent'] for r in rows),quarters)

    def test_midi_and_sampled_events_match_preserved_scores(self):
        for name in ('preplay-warmup','tom-moving'):
            with self.subTest(song=name):
                c=profile(name);source=ASSETS/name/'source'
                bars=json.loads((source/'composition.json').read_text())['bars']
                sampled,ticks=schedule(bars,INSTRUMENTS,bpm=c['bpm'],first=c['firstBeat'],sample_rate=c['sampleRate'])
                self.assertEqual(sampled,json.loads((source/'midi-events.json').read_text())['events'])
                self.assertEqual(midi(ticks,c['quarters'],bpm=c['bpm']),(source/(name+'.mid')).read_bytes())

    def test_midi_uses_explicit_tempo(self):
        # Use an existing score's BPM, not a new fabricated music fixture.
        source=ASSETS/'tom-moving/source'
        c=profile('tom-moving');bars=json.loads((source/'composition.json').read_text())['bars']
        _,ticks=schedule(bars,INSTRUMENTS,bpm=c['bpm'],first=c['firstBeat'],sample_rate=c['sampleRate'])
        bpm=profile('loveholic')['bpm']
        data=midi(ticks,c['quarters'],bpm=bpm)
        self.assertEqual(int.from_bytes(data[26:29],'big'),round(60_000_000/bpm))
        self.assertNotEqual(data,(source/'tom-moving.mid').read_bytes())

    def test_artifact_receiver_keeps_real_package_xml_and_svg(self):
        source=ASSETS/'red-sunset/final/build-03'
        package=(source/'red-sunset.drumscore').read_bytes()
        xml=(source/'red-sunset-final.musicxml').read_text()
        pages=[p.read_bytes() for p in sorted((source/'osmd-render').glob('*.svg'))]
        payload=dict(package=base64.b64encode(package).decode(),canonicalXML=xml,
                     pages=[base64.b64encode(gzip.compress(p)).decode() for p in pages],
                     **json.loads((source/'package-audit.json').read_text()))
        parent=ROOT/'.tmp';parent.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=parent,prefix='score-common-') as folder:
            out=Path(folder)
            write_artifacts(out,'/artifacts',payload,'red-sunset')
            self.assertEqual((out/'red-sunset.drumscore').read_bytes(),package)
            self.assertEqual((out/'red-sunset-final.musicxml').read_text(),xml)
            self.assertEqual([p.read_bytes() for p in sorted((out/'osmd-render').glob('*.svg'))],pages)
            with self.assertRaises(FileExistsError):
                write_artifacts(out,'/artifacts',payload,'red-sunset')
            self.assertEqual(sha(out/'red-sunset.drumscore'),sha(source/'red-sunset.drumscore'))


if __name__=='__main__':
    unittest.main()
