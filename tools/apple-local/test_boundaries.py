import unittest
from boundaries import validate_anchors,boundary_candidates,probe_windows,assess_boundary

class BoundaryTests(unittest.TestCase):
    def setUp(self):
        self.anchor={'id':'bar15-ko','segmentId':'verse','text':'こ','time':37.09022813444695,'reviewer':'user'}
        self.c=boundary_candidates([{'text':'こ','start':2.16,'end':3.36}],34,'verse',[self.anchor])[0]
    def test_identical_text_still_gets_boundary_review(self):
        self.assertEqual(self.c['text'],'こ');self.assertFalse(self.c['autoApply'])
        self.assertAlmostEqual(probe_windows(self.c,40)[0][0],36.4)
    def test_user_bar15_case_flags_context_sensitivity(self):
        probes=[{'offset':36.4,'segments':[{'text':'こ','start':.72,'end':1.02}]},
                {'offset':36.58,'segments':[{'text':'こ','start':.54,'end':.84}]}]
        r=assess_boundary(self.c,probes)
        self.assertEqual(r['status'],'context_sensitive');self.assertAlmostEqual(r['spreadSeconds'],.96)
        self.assertAlmostEqual(r['anchorComparisons'][0]['probeErrorsSeconds'][0],.02977186555305)
        self.assertEqual(self.anchor['time'],37.09022813444695);self.assertFalse(r['autoApply'])
    def test_late_clipped_start_is_not_evidence(self):
        r=assess_boundary(self.c,[{'offset':37,'segments':[{'text':'こ','start':0,'end':.3}]}])
        self.assertEqual(r['status'],'insufficient_evidence')
        self.assertEqual(r['probes'][0]['assessment'],'clipped_boundary')
    def test_multiple_occurrences_not_guessed(self):
        r=assess_boundary(self.c,[{'offset':36.4,'segments':[{'text':'こ','start':.3,'end':.5},{'text':'こ','start':.7,'end':1}]}])
        self.assertEqual(r['status'],'insufficient_evidence')
    def test_even_stable_long_vowel_never_auto_corrected(self):
        r=assess_boundary(self.c,[{'offset':35,'segments':[{'text':'こ','start':1.18,'end':2.4}]}]*2)
        self.assertEqual(r['status'],'stable_in_tested_windows');self.assertTrue(r['needsReview']);self.assertFalse(r['autoApply'])
    def test_missing_and_error_outputs_keep_review(self):
        r=assess_boundary(self.c,[{'offset':36.4,'error':'no_speech'}])
        self.assertEqual(r['status'],'insufficient_evidence');self.assertTrue(r['needsReview'])
    def test_anchor_validation(self):
        validate_anchors([self.anchor],{'verse'})
        for anchors in [[self.anchor,self.anchor],[dict(self.anchor,time=float('nan'))],[dict(self.anchor,reviewer='')]]:
            with self.assertRaises(ValueError):validate_anchors(anchors,{'verse'})
    def test_short_matching_run_with_anchor_is_also_reviewed(self):
        cs=boundary_candidates([{'text':'こ','start':3.08,'end':3.3}],34,'verse',[self.anchor])
        self.assertEqual(len(cs),1)

if __name__=='__main__':unittest.main()
