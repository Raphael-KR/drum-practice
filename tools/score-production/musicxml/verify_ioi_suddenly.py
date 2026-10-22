"""Compare I.O.I XML to source IR and independently read source fixtures."""
import argparse
from collections import Counter
from copy import deepcopy
from fractions import Fraction
import json
from pathlib import Path
from lxml import etree as E
from common.artifacts import require_equal, sha
from common.musicxml import validate_schema, read_timeline
from ioi_suddenly_xml import ORDER, INSTRUMENTS, DOUBLE_BARS

NAMES = {'tom4':'floor-tom','hh':'hi-hat'}


def xml_events(measure, timeline):
    events = []
    for note, time in zip(measure.findall('note'), timeline['events']):
        iid = time['instrument'].removeprefix('P1-') if time['instrument'] else None
        if not time['chord']:
            events.append(dict(quarterOffset=float(time['onset']), durationQuarters=float(time['duration']), instruments=[], rest=time['rest']))
        if iid: events[-1]['instruments'].append(NAMES.get(iid, iid))
    for event in events: event['instruments'].sort()
    return events


def check(root, bars, fixture, order):
    timeline = read_timeline(root); measures = root.findall("part[@id='P1']/measure")
    require_equal(len(timeline), len(order), 'measure count')
    expected_mapping = {v[0]:(v[3],str(v[4]),v[5]) for v in INSTRUMENTS.values()}
    fixtures = {b['printedMeasure']:b['events'] for b in fixture['representativeBars']}
    checked = 0
    for index, (measure, t, source_number) in enumerate(zip(measures,timeline,order)):
        require_equal(t['extent'], Fraction(4), f'm{index+1} extent')
        actual = xml_events(measure,t)
        expected = [dict(quarterOffset=e['onset'],durationQuarters=e['duration'],
                         instruments=sorted(NAMES.get(INSTRUMENTS[h['glyph'],h['pos']][0],INSTRUMENTS[h['glyph'],h['pos']][0]) for h in e['heads']),
                         rest=bool(e.get('rest'))) for e in bars[source_number-1]['events']]
        require_equal(actual, expected, f'm{index+1}/printed{source_number} source IR')
        if source_number in fixtures:
            independent = [{k:e[k] for k in ['quarterOffset','durationQuarters','instruments','rest']} for e in fixtures[source_number]]
            for e in independent: e['instruments']=sorted(e['instruments'])
            require_equal(actual, independent, f'printed{source_number} independent fixture'); checked += 1
        for note in measure.findall('note'):
            if note.find('instrument') is None: continue
            iid=note.find('instrument').get('id').removeprefix('P1-')
            require_equal((note.findtext('unpitched/display-step'),note.findtext('unpitched/display-octave'),note.findtext('notehead')),
                          expected_mapping[iid],f'printed{source_number} approved mapping')
        if source_number in DOUBLE_BARS:
            require_equal(measure.findtext("barline[@location='right']/bar-style"),'light-light',f'printed{source_number} double bar')
    return dict(measures=len(order),quarters=len(order)*4,independentFixtureOccurrences=checked,
                noteHeads=len(root.findall("part[@id='P1']/measure/note/instrument")))


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--xml',type=Path,required=True);p.add_argument('--ir',type=Path,required=True)
    p.add_argument('--fixture',type=Path,required=True);p.add_argument('--out',type=Path,required=True)
    a=p.parse_args();bars=json.loads(a.ir.read_text());fixture=json.loads(a.fixture.read_text())
    root=validate_schema(a.xml,Path('data/reference/musicxml/schema'))
    order=ORDER if len(root.findall("part[@id='P1']/measure"))==93 else list(range(1,80))
    result=check(root,bars,fixture,order)
    # Mutate only in memory: prove these checks reject wrong source content,
    # not merely an XML that happens to total four beats per bar.
    negative=[]
    for kind in ('instrument','duration','position','double-bar'):
        bad=deepcopy(root)
        note=bad.find("part[@id='P1']/measure/note")
        if kind=='instrument':note.find('instrument').set('id','P1-snare')
        elif kind=='duration':note.find('duration').text='48'
        elif kind=='position':note.find('unpitched/display-step').text='A'
        else:bad.findall("part[@id='P1']/measure")[3].find("barline/bar-style").text='regular'
        try: check(bad,bars,fixture,order)
        except ValueError:negative.append(kind)
        else:raise ValueError(f'Mutation not detected: {kind}')
    result.update(status='PASS',xmlSHA256=sha(a.xml),schema='MusicXML 4.0 PASS',negativeChecks=negative,
                  limits='Independent reading covers 21 printed measures; remaining comparisons use preserved source IR and glyph coverage.')
    if a.out.exists():raise ValueError('Use fresh report path')
    a.out.write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2))


if __name__=='__main__':main()
