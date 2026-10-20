"""Score-constrained, uniform-per-measure timing estimate for this live source.

Not a transcription of each drummer microtiming. A score bar has one period.
Keep raw correlation evidence and competing solutions; no listening claim.
"""
import argparse,hashlib,json,subprocess
from pathlib import Path
import numpy as np

def features(audio,folder):
    sr=16000;hop=160;nfft=1024
    pcm=subprocess.run(['ffmpeg','-v','error','-i',str(audio),'-ac','1','-ar',str(sr),'-f','f32le','pipe:1'],capture_output=True,check=True).stdout
    wave=np.frombuffer(pcm,dtype='<f4');frames=np.lib.stride_tricks.sliding_window_view(wave,nfft)[::hop]
    spec=np.log1p(np.abs(np.fft.rfft(frames*np.hanning(nfft),axis=1)));flux=np.maximum(np.diff(spec,axis=0,prepend=spec[:1]),0)
    f=np.fft.rfftfreq(nfft,1/sr);times=(np.arange(len(frames))*hop+nfft/2)/sr
    fs=[]
    for lo,hi in [(30,180),(180,3000),(3000,7900)]:
        vals=flux[:,(f>=lo)&(f<hi)].mean(axis=1)
        vals=np.minimum(vals/max(np.percentile(vals,95),1e-8),4)
        fs.append(vals)
    np.savez_compressed(folder/'spectral-flux.npz',times=times,features=np.array(fs))
    return times,np.array(fs),len(wave)/sr

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--root',type=Path,required=True);a=ap.parse_args();root=a.root
    bars=json.loads((root/'source/extracted.json').read_text());audio=root/'audio/source.mp3'
    times,fs,duration=features(audio,root/'audio')
    # A ±10ms local peak allowance handles STFT window placement. Timing is
    # optimized once per full measure, with no separate beat/hit displacements.
    fs=np.maximum.reduce([fs,np.pad(fs[:,1:],((0,0),(0,1)),mode='edge'),np.pad(fs[:,:-1],((0,0),(1,0)),mode='edge')])
    grid=np.arange(0,duration,.01);sample=np.array([np.interp(grid,times,f) for f in fs])
    n=len(grid);dp=np.full(n,-np.inf);dp[1127]=0
    back=[];values=[];quarter=0
    for bar in bars[:133]:
        B=4
        # Restrict tempo to a musical measure average, penalize large drift.
        lengths=np.array([172]) if bar['number']==1 else np.arange(166,193)
        starts=np.arange(max(0,int((11.27+quarter*.44-4)*100)),min(n-193,int((11.27+quarter*.44+4)*100)))
        if bar['number']==1:starts=np.array([1127])
        nxt=np.full(n,-np.inf);pred=np.full(n,-1,dtype=np.int32);bestval=np.zeros(n)
        for length in lengths:
            score=np.zeros(len(starts));weight=0
            for ev in bar['events']:
                if not ev['heads'] or ev.get('grace'):continue
                channels=set(0 if h['pos']==7 else 1 if h['glyph']=='\ue0a4' else 2 for h in ev['heads'])
                for ch in channels:
                    at=np.rint(starts+ev['onset']/4*length).astype(int)
                    w=1 if ch<2 else .45
                    score+=sample[ch,at]*w;weight+=w
            score/=max(weight,1)
            # Per-bar tempo stays near the source's stable main pulse. No
            # per-event maxima wider than ±10ms and no arbitrary beat inserts.
            value=dp[starts]+score-((length-176)/18)**2*.15
            ends=starts+length;select=value>nxt[ends]
            nxt[ends[select]]=value[select];pred[ends[select]]=starts[select];bestval[ends[select]]=score[select]
        dp=nxt;back.append(pred);values.append(bestval);quarter+=B
    end=int(np.argmax(dp));ends=[end]
    for pred in back[::-1]:end=int(pred[end]);ends.append(end)
    boundaries=np.array(ends[::-1])/100
    report=dict(method='Three-band spectral flux, source-onset constrained dynamic programming; uniform tempo within each score measure; estimate, not listening-confirmed',audioSHA256=hashlib.sha256(audio.read_bytes()).hexdigest(),durationSeconds=duration,scoreBpm=134,firstBeatEstimateSeconds=float(boundaries[0]),mainBoundaries=boundaries.tolist(),mainMeasures=[dict(label=str(i+1),start=float(x),end=float(y),bpm=round(240/(y-x),3),objective=float(values[i][round(y*100)])) for i,(x,y) in enumerate(zip(boundaries,boundaries[1:]))],limits=['Mixed audio, not isolated drums.','First count-in candidate11.270s is based on the four pulses preceding automatic barOne12.990s; verify source intro form.','Free/slowing ending m134–137 needs separate musical correspondence; not forced into this main-pulse optimizer.'])
    (root/'audio/main-alignment-candidate.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    rows=[]
    for m in report['mainMeasures']:
        rows.append({**m,'beats':4,'denominator':4,'beatTimes':[round(m['start']+i*(m['end']-m['start'])/4,6) for i in range(4)],'status':'score-constrained signal estimate'})
    # These are reviewed signal candidates in a freely improvised ending,
    # not a claim that the source specifies the performed repetition count.
    # Coarse tempo curve keeps score positions; individual transients are not
    # adopted as beat times. Current score contract consumes start/end only.
    for label,start,end,B,shape in [(134,244.10,246.80,4,0),(135,246.80,252.84,6,.6),(136,252.84,256.02,4,0),(137,256.02,258.28,4,0)]:
        beat=[round(start+(end-start)*(i/B+shape*((i/B)**2-i/B)),6) for i in range(B)]
        rows.append(dict(label=str(label),start=start,end=end,beats=B,denominator=4,beatTimes=beat,status='provisional free-ending correspondence; not listening-confirmed',bpm=round(B*60/(end-start),3),shape=shape))
    final=dict(version=1,scoreBpm=134,audioSHA256=report['audioSHA256'],durationSeconds=duration,firstBeat=11.27,performanceStart=12.99,recordedCountScoreMeasure='1',measures=rows,tailStart=258.28,status='signal estimate; free ending provisional',currentApp='Score measures consume start/end with uniform beats; nonlinear m135 beat grid preserved only as metadata and separate JSON.',limits=['No actual listening confirmation.','Free ending has no unique one-to-one note-to-performance mapping.','Gradual m135 curve is a candidate, not independent ground truth.'])
    (root/'audio/audio-alignment.json').write_text(json.dumps(final,ensure_ascii=False,indent=2))
    print(json.dumps({'first':boundaries[:10].tolist(),'bars37-45':report['mainMeasures'][36:45],'last':boundaries[-10:].tolist()},indent=2))

if __name__=='__main__':main()
