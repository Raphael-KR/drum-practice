import unittest
from workflow import compare, validate_segments

class WorkflowTests(unittest.TestCase):
    def test_kanji_timing_is_never_split_into_syllables(self):
        differences, anchors = compare('思い', [{'text':'思','start':0,'end':1.2},{'text':'い','start':1.2,'end':1.4}],120,'x')
        self.assertEqual(differences, [])
        self.assertEqual(anchors[0]['audioSpan'], [120,121.4])
        self.assertEqual(anchors[0]['runIds'], [0,1])

    def test_missing_reference_text_has_no_invented_time(self):
        ds,_=compare('記憶指の間',[{'text':'記憶','start':1,'end':2},{'text':'の間','start':2,'end':3}],60,'x')
        self.assertEqual(ds[0]['reference'],'指')
        self.assertIsNone(ds[0]['audioSpan'])
        self.assertEqual(ds[0]['neighbors'],[0,1])
        self.assertTrue(ds[0]['needsReview'])

    def test_repeated_phrase_uses_distinct_run_indices(self):
        ds,_=compare('あのあも',[{'text':'あの','start':0,'end':1},{'text':'あの','start':1,'end':2}],10,'x')
        self.assertEqual(ds[0]['runIds'],[1])
        self.assertEqual(ds[0]['audioSpan'],[11,12])

    def test_invalid_times_rejected(self):
        for start,end in [(float('nan'),2),(2,1),(-1,1),(0,11)]:
            with self.assertRaises(ValueError):
                validate_segments([{'text':'a','start':start,'end':end}],10)

    def test_regression_in_time_rejected(self):
        with self.assertRaises(ValueError):
            validate_segments([{'text':'a','start':2,'end':3},{'text':'b','start':1,'end':2}],10)

if __name__=='__main__':unittest.main()
