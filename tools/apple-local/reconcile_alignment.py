"""Combine phonetic alignment estimates. Agreement is not listening verification."""
import argparse,json,statistics
from pathlib import Path

def reconcile(units, runs, anchors):
    evidence=[];times=[]
    for i,u in enumerate(units):
        values=[run[i] for run in runs]
        valid=[x for x in values if .035<=x['end']-x['start']<=.8 and x['prob']>=.03]
        reasons=[]
        if len(valid)<3:reasons.append('유효 음절 경계 근거 부족')
        use=valid or values
        candidates=[x['start'] for x in use]
        t=statistics.median(candidates) if len(valid)>=2 else u['time']
        if len(valid)<2:reasons.append('독립 경계 부족: 기존 구절 위치를 잠정 유지')
        if i == 0 or units[i-1]['chunk'] != u['chunk']:
            t=u['time'];reasons.append('구간 첫 음절: 강제 정렬이 클립 시작에 붙어 기존 위치 잠정 유지')
        spread=max(candidates)-min(candidates)
        if spread>.2:reasons.append('분석 조건별 시작 시각 차이 >0.2초')
        if statistics.median(x['end']-x['start'] for x in use)>.8:reasons.append('긴 음절/앞소리 경계 확인')
        if abs(t-u['time'])>.65:reasons.append('기존 구절 위치와 >0.65초 차이')
        if i in anchors:
            t=anchors[i]['time']
            reasons=[] if anchors[i]['confirmed'] else ['기존 청취 위치를 새 가사 구절에 대응; 새 발음 확인 필요']
        times.append(t);evidence.append(dict(index=i,text=u['text'],chunk=u['chunk'],spread=spread,reasons=reasons,estimates=values))
    # Repair only collisions, bounded by fixed user anchors. Flag every moved point.
    fixed={-1:0, len(units):max(times)+2, **{i:a['time'] for i,a in anchors.items()}}
    keys=sorted(fixed)
    for left,right in zip(keys,keys[1:]):
        previous=fixed[left]
        for i in range(left+1,right):
            upper=fixed[right]-.01*(right-i)
            value=min(upper,max(previous+.01,times[i]))
            if abs(value-times[i])>1e-7:evidence[i]['reasons'].append('음절 순서 충돌 보정; 경계 재확인')
            times[i]=value;previous=value
    assert all(a<b for a,b in zip(times,times[1:]))
    lyrics=[dict(id=f'v2-l{i}',text=u['text'],time=round(times[i],6),end=round(times[i+1] if i+1<len(times) else max(times[i]+.1,statistics.median(r[i]['end'] for r in runs)),6),confirmed=anchors.get(i,{}).get('confirmed',False)) for i,u in enumerate(units)]
    return lyrics,evidence

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--directory',type=Path,required=True);args=p.parse_args();d=args.directory
    units=json.loads((d/'units.json').read_text());runs=[]
    for name in ['aligned-mix.json','aligned-vocals.json','aligned-short.json']:
        chunks=json.loads((d/name).read_text())
        for n in range(len(chunks[0]['runs'])):runs.append([x for c in chunks for x in c['runs'][n]])
    assert all(len(r)==len(units) for r in runs)
    anchors={0:dict(time=20.828,confirmed=True),6:dict(time=24.268,confirmed=True),12:dict(time=26.872,confirmed=False),36:dict(time=37.09022813444695,confirmed=True)}
    assert [units[i]['text'] for i in anchors]==['아','사','카','코']
    lyrics,evidence=reconcile(units,runs,anchors)
    (d/'new-lyrics.json').write_text(json.dumps(lyrics,ensure_ascii=False,indent=2))
    (d/'evidence.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2))
    print(len(lyrics),'units;',sum(bool(x['reasons']) for x in evidence),'review candidates')
