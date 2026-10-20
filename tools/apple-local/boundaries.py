"""Boundary checks independent of text correctness. Never return automatic corrections."""
import math


def validate_anchors(anchors, chunk_ids):
    ids=set()
    for a in anchors:
        if (not isinstance(a.get('id'),str) or a['id'] in ids or
            a.get('segmentId') not in chunk_ids or
            not isinstance(a.get('text'),str) or not a['text'].strip() or
            not isinstance(a.get('reviewer'),str) or not a['reviewer'].strip() or
            not isinstance(a.get('time'),(int,float)) or not math.isfinite(a['time']) or a['time']<0):
            raise ValueError('Invalid or duplicate listening anchor')
        ids.add(a['id'])


def boundary_candidates(segments, offset, chunk_id, anchors, threshold=.8):
    result=[]
    for i,s in enumerate(segments):
        text=s['text'].strip(); start=offset+s['start'];end=offset+s['end']
        linked=[a for a in anchors if a['segmentId']==chunk_id and a['text']==text and start-.2<=a['time']<=end+.2]
        if not (text and ((len(text)==1 and end-start>=threshold) or linked)):
            continue
        result.append({'id':f'{chunk_id}-boundary-{i}','runId':i,'text':text,'originalStart':start,
                       'originalEnd':end,'anchors':linked,'needsReview':True,'autoApply':False})
    return result


def probe_windows(candidate, chunk_end):
    start=candidate['originalStart'];end=candidate['originalEnd'];duration=end-start
    if duration<.15:return []
    # Cropping can remove real sound. These deliberately different contexts test
    # sensitivity; a later returned onset is never assumed to be more accurate.
    return [(start+min(.25,duration*.2),min(chunk_end,end+2)),
            (start+min(.45,duration*.35),min(chunk_end,end+2))]


def assess_boundary(candidate, probes):
    starts=[candidate['originalStart']];valid=[]
    for p in probes:
        matches=[s for s in p.get('segments',[]) if s['text'].strip()==candidate['text']
                 and candidate['originalStart']-.2<=s['start']+p['offset']<=candidate['originalEnd']+.2]
        if len(matches)!=1:
            p['assessment']='ambiguous_or_missing';continue
        onset=matches[0]['start']+p['offset'];p['onset']=onset
        if onset-p['offset']<.12:
            p['assessment']='clipped_boundary';continue
        p['assessment']='matched';starts.append(onset);valid.append(onset)
    spread=max(starts)-min(starts)
    status=('context_sensitive' if spread>.2 else
            'stable_in_tested_windows' if len(valid)==2 else 'insufficient_evidence')
    return dict(candidate,probes=probes,status=status,spreadSeconds=spread,
                anchorComparisons=[{'id':a['id'],'time':a['time'],'reviewer':a['reviewer'],
                                    'originalErrorSeconds':candidate['originalStart']-a['time'],
                                    'probeErrorsSeconds':[t-a['time'] for t in valid]} for a in candidate['anchors']],
                needsReview=True,autoApply=False)
