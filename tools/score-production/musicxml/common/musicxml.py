"""Schema and rational note timeline checks independent of source PDF layout."""
from fractions import Fraction as F
from pathlib import Path
from lxml import etree as E
from .artifacts import require_equal


class Resolver(E.Resolver):
    def __init__(self, directory):
        self.directory = Path(directory)

    def resolve(self, url, pubid, context):
        local = self.directory / url.split('/')[-1]
        if local.exists():
            return self.resolve_filename(str(local.resolve()), context)


def validate_schema(source, schema):
    schema = Path(schema)
    if schema.is_dir():
        schema /= 'musicxml.xsd'
    parser = E.XMLParser(no_network=True, resolve_entities=False)
    parser.resolvers.add(Resolver(schema.parent))
    tree = E.fromstring(source, parser) if isinstance(source, bytes) else E.parse(str(source), parser).getroot()
    E.XMLSchema(E.parse(str(schema), parser)).assertValid(tree)
    return tree


TYPES = {'maxima':32, 'long':16, 'breve':8, 'whole':4, 'half':2,
         'quarter':1, 'eighth':F(1,2), '16th':F(1,4), '32nd':F(1,8),
         '64th':F(1,16), '128th':F(1,32), '256th':F(1,64)}


def read_timeline(root, part_id='P1'):
    """Read divisions, backup/forward, voices, chords, dots, tuplets and grace.

    Returns quarters as Fraction. Does not infer missing voices, alter meter,
    or merge auxiliary lyric measures into drum length.
    """
    part = root.find(f"part[@id='{part_id}']")
    if part is None:
        raise ValueError(f'Missing percussion part: expected={part_id}, actual={[p.get("id") for p in root.findall("part")]}')
    divisions = None
    meter = None
    result = []
    for measure in part.findall('measure'):
        cursor = F(0)
        last = {}
        events = []
        for child in measure:
            if child.tag == 'attributes':
                if child.find('divisions') is not None:
                    divisions = F(child.findtext('divisions'))
                time = child.find('time')
                if time is not None and time.find('beats') is not None:
                    meter = sum((sum(F(n) for n in b.text.split('+')) * 4 / F(t.text)
                                 for b,t in zip(time.findall('beats'),time.findall('beat-type'))), F(0))
            elif child.tag in ('backup','forward','note'):
                context = f'part={part_id} measure={measure.get("number")}'
                if divisions is None or divisions <= 0:
                    raise ValueError(f'{context}: divisions={divisions}')
                duration = F(child.findtext('duration', '0')) / divisions
                if child.tag in ('backup','forward'):
                    cursor += duration if child.tag == 'forward' else -duration
                    if cursor < 0:
                        raise ValueError(f'{context}: negative cursor={cursor}')
                    continue
                grace = child.find('grace') is not None
                voice = child.findtext('voice','1')
                chord = child.find('chord') is not None
                if chord and voice not in last:
                    raise ValueError(f'{context}: chord without preceding voice={voice}')
                onset = last[voice] if chord else cursor
                if not chord:
                    last[voice] = onset
                    if not grace:
                        cursor += duration
                kind = child.findtext('type')
                if not grace and kind in TYPES and child.find('rest[@measure="yes"]') is None:
                    nominal = F(TYPES[kind]) * sum((F(1,2**i) for i in range(len(child.findall('dot'))+1)),F(0))
                    ratio = child.find('time-modification')
                    if ratio is not None:
                        nominal *= F(int(ratio.findtext('normal-notes')),int(ratio.findtext('actual-notes')))
                    require_equal(duration, nominal, context+' declared duration')
                events.append(dict(onset=onset,duration=duration,voice=voice,chord=chord,grace=grace,
                                   instrument=child.find('instrument').get('id') if child.find('instrument') is not None else None,
                                   rest=child.find('rest') is not None))
        result.append(dict(number=measure.get('number'),meter=meter,events=events,
                           extent=max((e['onset']+e['duration'] for e in events if not e['grace']),default=cursor)))
    return result
