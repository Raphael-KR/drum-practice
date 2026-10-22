"""Rank printed underlay candidates; never silently choose an ambiguous syllable."""

def underlay_candidates(unit, bar, head_centers):
    center=(unit['bounds'][0]+unit['bounds'][2])/2
    candidates=[]
    for event in bar['events']:
        xs=[h['x']+head_centers[h['glyph']] for h in event['heads']] or [event['x']]
        anchor=min(xs,key=lambda x:abs(x-center))
        candidates.append(dict(distancePt=abs(anchor-center),sourceX=anchor,
                               quarterOffset=event['onset'],durationQuarters=event['duration'],
                               kind='rest' if event.get('rest') else 'note'))
    return sorted(candidates,key=lambda x:x['distancePt'])
