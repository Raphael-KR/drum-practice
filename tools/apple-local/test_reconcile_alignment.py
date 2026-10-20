import unittest
from reconcile_alignment import reconcile
class ReconcileTests(unittest.TestCase):
    def test_clip_start_is_not_accepted_as_first_onset(self):
        units=[dict(text='가',chunk=0,time=3),dict(text='나',chunk=0,time=4)]
        runs=[[dict(start=0,end=3.5,prob=.9),dict(start=4,end=4.4,prob=.9)] for _ in range(3)]
        lyrics,evidence=reconcile(units,runs,{})
        self.assertEqual(lyrics[0]['time'],3)
        self.assertTrue(evidence[0]['reasons'])
        self.assertFalse(lyrics[0]['confirmed'])
    def test_anchor_is_fixed_when_neighbor_collides(self):
        units=[dict(text='가',chunk=0,time=1),dict(text='나',chunk=0,time=2),dict(text='다',chunk=0,time=3)]
        runs=[[dict(start=1,end=1.2,prob=.9),dict(start=2.5,end=2.7,prob=.9),dict(start=2.1,end=2.3,prob=.9)] for _ in range(3)]
        lyrics,evidence=reconcile(units,runs,{2:dict(time=2.1,confirmed=True)})
        self.assertEqual(lyrics[2]['time'],2.1)
        self.assertLess(lyrics[1]['time'],2.1)
        self.assertTrue(lyrics[2]['confirmed'])
        self.assertTrue(any('충돌' in r for r in evidence[1]['reasons']))
