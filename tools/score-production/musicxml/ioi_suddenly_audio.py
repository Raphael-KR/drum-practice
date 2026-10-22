"""Reproduce the reviewed I.O.I audio grid from its hash-bound song profile.

Uses the shared spectral-flux implementation. Source rhythm decisions remain in
profiles/ioi-suddenly-audio.json; this is a signal estimate, not listening proof.
The original audio is read without changes and PCM stays in memory.
"""
import argparse
import json
from pathlib import Path

import numpy as np

from common.artifacts import PROFILES, profile, require_equal, sha
from common.audio_features import spectral_flux
from ioi_suddenly_xml import ORDER


def run(audio, out):
    config = json.loads((PROFILES / 'ioi-suddenly-audio.json').read_text())
    song = profile('ioi-suddenly')
    source = json.loads((PROFILES / 'ioi-suddenly-source.json').read_text())
    audio_digest = sha(audio)
    require_equal(audio_digest, config['audio_sha256'], f'Audio identity: {audio}')
    score_bpm = config['score_bpm']
    order = [number for start, end in config['actual_order_ranges'] for number in range(start, end + 1)]
    quarters_per_measure = config['quarters_per_measure']
    pulse_start, source_quarters = config['pulse_quarter_range']
    require_equal(score_bpm, song['bpm'], 'Audio profile / canonical song BPM')
    require_equal(order, ORDER, 'Audio profile / canonical XML playback order')
    require_equal(config['printed_measures'], source['source_measures'], 'Audio / PDF printed measure count')
    require_equal(quarters_per_measure, source['beats_per_measure'], 'Audio / PDF quarters per measure')
    require_equal(len(order), config['played_measures'], 'Audio profile playback count')
    require_equal(len(order), song['expectedMeasures'], 'Audio / canonical playback count')
    require_equal(source_quarters, len(order) * quarters_per_measure, 'Audio pulse ending quarter')
    if out.exists():
        raise FileExistsError(f'Fresh output folder required: expected absent, actual exists: {out}')
    out.mkdir(parents=True)
    times, fs, duration = spectral_flux(audio, sample_rate=config['sample_rate'],
        hop=config['hop'], nfft=config['nfft'], bands=config['bands'])
    raw_features = np.array(fs)
    fs = raw_features
    np.savez_compressed(out / 'spectral-flux.npz', times=times, features=fs, duration=duration)
    fine_bpm = config['fine_bpm_deltas']
    fine_offset = config['fine_offset_deltas']
    # 10ms local allowance compensates feature window/transient placement.
    fs=np.maximum.reduce([fs,np.pad(fs[:,1:],((0,0),(0,1)),mode='edge'),np.pad(fs[:,:-1],((0,0),(1,0)),mode='edge')])
    combined=np.mean(fs,axis=0)

    def pulse(offset,bpm,start=pulse_start,end=source_quarters):
        q=np.arange(start,end,.5); tt=offset+q*60/bpm
        return float(np.mean(np.interp(tt,times,combined,left=0,right=0)))

    # Intro independently transcribed from original PDF before automated extraction.
    intro=[np.array(q) for q in config["intro_onsets_by_band"]]
    def intro_score(offset,bpm):
        return float(np.mean([np.mean(np.interp(offset+q*60/bpm,times,fs[ch],left=0,right=0)) for ch,q in enumerate(intro)]))

    coarse=sorted([(pulse(off,bpm),float(off),float(bpm)) for bpm in np.arange(*config["coarse_bpm_range"]) for off in np.arange(*config["coarse_offset_range"])],reverse=True)
    best=coarse[0]
    fine=sorted([(pulse(off,bpm),float(off),float(bpm)) for bpm in np.arange(best[2]+fine_bpm[0],best[2]+fine_bpm[1],fine_bpm[2]) for off in np.arange(max(0,best[1]+fine_offset[0]),best[1]+fine_offset[1],fine_offset[2])],reverse=True)
    strength,phase,bpm=fine[0]
    phases=[]
    for shift in np.arange(-4,5,.5):
        off=phase+shift*60/bpm
        if off<-.05: continue
        phases.append(dict(shiftQuarters=float(shift),firstBeat=off,introObjective=intro_score(off,bpm),fullPulseObjective=pulse(off,bpm)))
    peaks=[]
    raw=np.mean(raw_features,axis=0)
    for i in range(2,len(raw)-2):
        if times[i]>10:break
        if raw[i]>.22 and raw[i]==max(raw[i-2:i+3]):peaks.append(dict(time=round(float(times[i]),3),strength=round(float(raw[i]),4),bands=fs[:,i].tolist()))
    result=dict(audioSHA256=audio_digest,durationSeconds=duration,scoreBpm=score_bpm,
        pulseBpmEstimate=bpm,pulsePhaseEstimateSeconds=phase,fullPulseObjective=strength,phaseCandidates=phases,first10SecondsTransients=peaks,
        method=config['report_method'],
        sampleRate=config["sample_rate"],hopSeconds=config["hop"]/config["sample_rate"],sourceQuarterCount=source_quarters,printedMeasureCount=config["printed_measures"],playedMeasureCount=len(order),
        actualOrder=order)
    (out/'preliminary.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))

    # Independent source review received from source-review agent. Channel names are
    # broad transient bands, not a claim that mixed-audio timbres are isolated.
    source_anchors={int(number): events for number,events in config["source_anchors"].items()}
    windows=[]
    for lo,hi in config["review_windows"]:
        cand=sorted([(pulse(phase+d,bpm,lo,hi),float(d)) for d in np.arange(-.1,.101,.001)],reverse=True)
        v,delta=cand[0]
        windows.append(dict(startQuarter=lo,endQuarter=hi,startSeconds=phase+lo*60/bpm,endSeconds=phase+hi*60/bpm,
            localShiftSeconds=round(delta,6),objective=v,fixedGridObjective=pulse(phase,bpm,lo,hi)))
    anchors=[]
    rawfs=raw_features
    for printed,events in source_anchors.items():
        for play_index,p in enumerate(result['actualOrder']):
            if p!=printed:continue
            base=play_index*quarters_per_measure
            rows=[]
            for q,channels in events:
                tt=phase+(base+q)*60/bpm
                idx=np.flatnonzero((times>=tt-.06)&(times<=tt+.06))
                f=np.mean(rawfs[channels],axis=0)
                best_i=idx[np.argmax(f[idx])]
                rows.append(dict(quarterOffset=q,channels=channels,expectedSeconds=round(float(tt),6),
                     nearbyPeakSeconds=float(times[best_i]),peakDeltaSeconds=round(float(times[best_i]-tt),6),
                     peakStrength=float(f[best_i])))
            phase_obj=[]
            for delta_q in [-4,-1,-.5,0,.5,1,4]:
                vals=[]
                for q,channels in events:
                    tt=phase+(base+q+delta_q)*60/bpm
                    vals.extend(float(np.interp(tt,times,fs[c],left=0,right=0)) for c in channels)
                phase_obj.append(dict(shiftQuarters=delta_q,objective=float(np.mean(vals))))
            anchors.append(dict(printedMeasure=printed,playMeasure=play_index+1,events=rows,phaseObjectives=phase_obj))

    # Method resolution: the parameter steps are finer than the 10ms feature hop;
    # report numerical optimum without asserting millisecond ground truth.
    near=[(v,off,b) for v,off,b in fine if v>=strength*.99]
    final={**result,'firstBeatEstimateSeconds':round(phase,3),'bpmEstimate':round(bpm,3),
     'status':'signal estimate; not listening-confirmed',
     'windows':windows,'distinctiveAnchors':anchors,
     'printedTempoGridEndSeconds':phase+source_quarters*60/score_bpm,
     'measuredTempoGridEndSeconds':phase+source_quarters*60/bpm,
     'printedVsMeasuredCumulativeDriftSeconds':source_quarters*60/bpm-source_quarters*60/score_bpm,
     'gridTailSeconds':duration-(phase+source_quarters*60/bpm),
     'objectiveSensitivity99Percent':dict(bpmMin=min(x[2] for x in near),bpmMax=max(x[2] for x in near),offsetMin=min(x[1] for x in near),offsetMax=max(x[1] for x in near),meaning='optimization sensitivity only, not confidence interval'),
     'measures':[dict(playMeasure=i+1,sourcePrintedMeasure=p,sourceOccurrence=result['actualOrder'][:i+1].count(p),
           start=round(phase+i*quarters_per_measure*60/bpm,6),end=round(phase+(i+1)*quarters_per_measure*60/bpm,6),status='uniform signal estimate') for i,p in enumerate(result['actualOrder'])],
     'limits':config['report_limits']}
    (out/'audio-alignment.json').write_text(json.dumps(final,ensure_ascii=False,indent=2))
    brief={k:final[k] for k in ['firstBeatEstimateSeconds','bpmEstimate','printedTempoGridEndSeconds','measuredTempoGridEndSeconds','printedVsMeasuredCumulativeDriftSeconds','gridTailSeconds','objectiveSensitivity99Percent','windows']}
    brief['anchors']=[dict(printedMeasure=a['printedMeasure'],playMeasure=a['playMeasure'],medianAbsolutePeakDeltaSeconds=float(np.median([abs(e['peakDeltaSeconds']) for e in a['events']])),maximumAbsolutePeakDeltaSeconds=max(abs(e['peakDeltaSeconds']) for e in a['events']),phaseObjectives=a['phaseObjectives']) for a in anchors]
    (out/'summary.json').write_text(json.dumps(brief,ensure_ascii=False,indent=2))
    return brief


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--audio', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True, help='New output directory; existing outputs are never overwritten.')
    args = parser.parse_args()
    summary = run(args.audio, args.out)
    print(json.dumps({key: summary[key] for key in (
        'firstBeatEstimateSeconds', 'bpmEstimate', 'printedVsMeasuredCumulativeDriftSeconds', 'gridTailSeconds'
    )}, indent=2))
