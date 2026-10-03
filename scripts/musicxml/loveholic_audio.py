"""Signal-based score/audio alignment estimates, not listening verification.

Requires numpy and ffmpeg. Uses decoded PCM spectral flux in three bands and
the independently transcribed score onsets. Never writes source audio or XML.
"""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

import numpy as np


def run(audio, bars_path, out):
    bars = json.loads(bars_path.read_text())
    sr, hop, nfft = 11025, 128, 1024
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(audio), "-ac", "1", "-ar", str(sr),
                          "-f", "f32le", "pipe:1"], capture_output=True, check=True).stdout
    wave = np.frombuffer(pcm, dtype="<f4")
    frames = np.lib.stride_tricks.sliding_window_view(wave, nfft)[::hop]
    spectrum = np.log1p(np.abs(np.fft.rfft(frames * np.hanning(nfft), axis=1)))
    flux = np.maximum(np.diff(spectrum, axis=0, prepend=spectrum[:1]), 0)
    freq = np.fft.rfftfreq(nfft, 1/sr)
    times = (np.arange(len(frames)) * hop + nfft/2) / sr
    features = []
    for lo, hi in [(30, 250), (250, 3000), (3000, 5400)]:
        f = flux[:, (freq >= lo) & (freq < hi)].mean(axis=1)
        scale = np.percentile(f, 95)
        features.append(np.minimum(f / max(scale, 1e-8), 4))
    scores = [[], [], []]
    for bar in bars:
        for ev in bar["events"]:
            for h in ev["heads"]:
                channel = 0 if h["pos"] == 7 else 1 if h["glyph"] == "œ" else 2
                scores[channel].append((bar["number"] - 1)*4 + ev["onset"])
    scores = [np.unique(q) for q in scores]
    def objective(offset, period, lo=0, hi=480):
        values = []
        for q, f in zip(scores, features):
            q = q[(q >= lo) & (q < hi)]
            tt = offset + q * period
            # Local band peak within roughly one feature frame accounts for
            # spectral-window latency and timbral transient placement.
            sample = np.maximum.reduce([np.interp(tt+d, times, f, left=0, right=0) for d in [-0.012,0,0.012]])
            values.append(float(sample.mean()) if len(sample) else 0)
        return sum(values)/3
    candidates=[]
    for bpm in np.arange(135.5, 136.51, .02):
        period=60/bpm
        for offset in np.arange(0, 5, .02):
            candidates.append((objective(offset,period),float(offset),float(bpm)))
    candidates.sort(reverse=True)
    best=candidates[0]
    refined=[]
    for bpm in np.arange(best[2]-.03,best[2]+.031,.002):
        for offset in np.arange(max(0,best[1]-.025),best[1]+.026,.002):
            refined.append((objective(offset,60/bpm),float(offset),float(bpm)))
    refined.sort(reverse=True); strength, offset, bpm = refined[0]
    windows=[]
    for lo in [0,80,160,240,320,400]:
        candidates=[(objective(offset+d,60/bpm,lo,lo+80),float(d)) for d in np.arange(-.12,.121,.004)]
        value, delta=max(candidates)
        windows.append(dict(start_quarter=lo,end_quarter=min(lo+80,480),local_delta_seconds=delta,objective=value))
    # Periodic grooves can correlate after a one-beat or one-bar displacement.
    # Compare competing phases and distinctive fills/end independently of the
    # six pulse windows. These remain mixed-audio diagnostics, not a listening
    # or stem-separated accuracy measurement.
    period = 60 / bpm
    overall_feature = sum(features) / 3
    phase_candidates = [dict(shift_quarters=q, first_beat_seconds=offset+q*period,
                             objective=objective(offset+q*period,period))
                        for q in range(-4,5)]
    anchors=[]
    for number in [1,2,10,36,62,79,119,120]:
        bar=bars[number-1]
        events=[]
        for ev in bar['events']:
            if not ev['heads']: continue
            expected=offset+((number-1)*4+ev['onset'])*period
            idx=np.flatnonzero((times>=expected-.08)&(times<=expected+.08))
            best_peak=int(idx[np.argmax(overall_feature[idx])]) if len(idx) else None
            events.append(dict(onset_quarters=ev['onset'],expected_seconds=expected,
                               nearby_peak_seconds=float(times[best_peak]) if best_peak is not None else None,
                               peak_delta_seconds=float(times[best_peak]-expected) if best_peak is not None else None))
        lo=(number-1)*4
        anchors.append(dict(measure=number,events=events,
                            phase_objectives=[dict(shift_quarters=q,objective=objective(offset+q*period,period,lo,lo+4))
                                              for q in [-4,-1,0,1,4]]))
    # List strong first-section transients for a separately reviewed anchor.
    peaks=[]
    overall=sum(features)/3
    for i in range(2,len(overall)-2):
        if times[i]>10: break
        if overall[i]>0.35 and overall[i]==max(overall[i-2:i+3]):
            peaks.append(dict(time=round(float(times[i]),4),strength=round(float(overall[i]),4)))
    result=dict(method="score-onset / three-band log spectral-flux correlation; estimate only",
                audio_sha256=hashlib.sha256(audio.read_bytes()).hexdigest(),
                decoded_duration_seconds=len(wave)/sr,sample_rate=sr,hop=hop,
                first_beat_estimate_seconds=offset,bpm_estimate=bpm,
                printed_bpm=136,objective=strength,
                windows=windows,first_ten_seconds_transients=peaks,
                phase_candidates=phase_candidates,distinctive_anchors=anchors,
                measures=[dict(label=str(b["number"]),start=offset+(b["number"]-1)*4*60/bpm,
                               end=offset+b["number"]*4*60/bpm,status="signal-estimate; not listening-confirmed") for b in bars],
                limits=["Correlation uses musical audio, not separated drums.",
                        "Model-free signal estimate does not confirm performed instrument identities or vocal syllables.",
                        "Silent closing measures are extrapolated from the established pulse."])
    out.write_text(json.dumps(result,indent=2))
    print(json.dumps({k:result[k] for k in ["first_beat_estimate_seconds","bpm_estimate","objective","windows"]},indent=2))


if __name__=="__main__":
    p=argparse.ArgumentParser()
    for flag in ["audio","bars","out"]:p.add_argument("--"+flag,type=Path,required=True)
    a=p.parse_args();run(a.audio,a.bars,a.out)
