"""Review Korean lyric acoustics locally; never write song timing or alter lyrics.

CTC leading/trailing blank states allow silence before the first supplied token.
PDF row starts only bound broad search windows, never supply vocal timestamps.
Unsupported source characters remain explicit and are not replaced or timed.
"""
import argparse
import hashlib
import json
import re
import subprocess
import time
from pathlib import Path

import numpy as np


def align_ctc(emission, tokens, blank):
    if not tokens or blank in tokens:
        raise ValueError("Non-empty, non-blank target required")
    labels = np.asarray([blank] + [x for token in tokens for x in (token, blank)])
    size = len(labels)
    prev = np.full(size, -np.inf)
    prev[0] = emission[0, blank]
    prev[1] = emission[0, tokens[0]]
    back = np.zeros((len(emission), size), dtype=np.int8)
    skip = (labels != blank) & (labels != np.roll(labels, 2))
    skip[:2] = False
    for frame in range(1, len(emission)):
        one = np.r_[-np.inf, prev[:-1]]
        two = np.r_[[-np.inf, -np.inf], prev[:-2]]
        two[~skip] = -np.inf
        choices = np.stack([prev, one, two])
        back[frame] = choices.argmax(axis=0)
        prev = choices.max(axis=0) + emission[frame, labels]
    state = size - 1 if prev[-1] >= prev[-2] else size - 2
    if not np.isfinite(prev[state]):
        raise ValueError("No valid complete alignment")
    states = np.empty(len(emission), dtype=np.int32)
    for frame in range(len(emission)-1, -1, -1):
        states[frame] = state
        state -= int(back[frame, state])
    spans = []
    for i, token in enumerate(tokens):
        frames = np.flatnonzero(states == 2*i+1)
        if not len(frames):
            raise ValueError("Alignment omitted a target")
        spans.append(dict(firstFrame=int(frames[0]), lastFrame=int(frames[-1]),
                          probability=float(np.exp(emission[frames, token]).mean())))
    return spans


def self_test():
    # Silence, repeated labels separated by blanks, and trailing silence.
    targets = [1, 1, 2]
    path = [0, 0, 1, 1, 0, 1, 0, 2, 2, 0, 0]
    emission = np.full((len(path), 3), -12.)
    emission[np.arange(len(path)), path] = 0
    spans = align_ctc(emission, targets, 0)
    assert [(s['firstFrame'], s['lastFrame']) for s in spans] == [(2, 3), (5, 5), (7, 8)]
    for invalid in ([], [0]):
        try:
            align_ctc(emission, invalid, 0)
        except ValueError:
            pass
        else:
            raise AssertionError("Invalid target accepted")
    print("CTC synthetic silence/repeated-token/invalid-target checks PASS", flush=True)


def review(folder, model_path, audio_path, output, selected):
    if output.exists():
        raise ValueError("Use a new evidence output")
    import torch
    from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2ForCTC

    torch.set_num_threads(4)
    model = Wav2Vec2ForCTC.from_pretrained(str(model_path), local_files_only=True,
                                         use_safetensors=True).eval()
    extractor = Wav2Vec2FeatureExtractor.from_pretrained(str(model_path), local_files_only=True)
    vocab = json.loads((model_path/'vocab.json').read_text())
    inverse = {value:key for key,value in vocab.items()}
    blank = model.config.pad_token_id
    cues = json.loads((folder/'printed-lyric-cues.json').read_text())
    measures = json.loads((folder/'audio-alignment.json').read_text())['measures']
    raw = subprocess.run(['ffmpeg','-v','error','-i',str(audio_path),'-f','f32le',
                          '-ac','1','-ar','16000','-'], check=True, capture_output=True).stdout
    audio = np.frombuffer(raw, dtype='<f4')
    # Model feature stride/receptive field, checked against emitted frame count.
    stride = 1
    field = 1
    for kernel, step in zip(model.config.conv_kernel, model.config.conv_stride):
        field += (kernel-1)*stride
        stride *= step
    rows = []
    started = time.monotonic()
    report = dict(status='review-only', engine='kresnik/wav2vec2-large-xlsr-korean',
                  modelRevision='629c9a3501c10ba128bf3fa1eebb12af3be03f61',
                  frameStrideSeconds=stride/16000, receptiveFieldSeconds=field/16000,
                  audioSHA256=hashlib.sha256(audio_path.read_bytes()).hexdigest(),
                  audioPath=str(audio_path),
                  policy='No source substitution, guessed vowel duration, equal subdivision, or automatic song application')
    for index, cue in enumerate(cues):
        if selected and cue['system'] not in selected:
            continue
        source = re.sub(r'\s+', '', cue['text'])
        # A supported Korean prefix is an acoustic probe, not the full lyric line.
        match = re.match(r'[가-힣]+', source)
        prefix = match.group() if match else ''
        missing = [c for c in prefix if c not in vocab]
        row = dict(system=cue['system'], sourceText=cue['text'], alignedPrefix=prefix,
                   unalignedSuffix=source[len(prefix):], missingTokens=missing,
                   fullLineVerified=False, autoApply=False)
        if not prefix or missing:
            row['status'] = 'unsupported-source-tokens'
            rows.append(row)
            continue
        center = measures[cue['system']-1]['start']
        next_system = cues[index+1]['system'] if index+1<len(cues) else 121
        hi = min(len(audio)/16000, measures[next_system-1]['start']+1.0)
        runs = []
        for delta in (-1.5, -2.0):
            sample_start = max(0, int((center+delta)*16000))
            lo = sample_start/16000
            clip = audio[sample_start:int(hi*16000)]
            if len(clip) > 30*16000:
                raise ValueError("Review clip exceeds 30 seconds")
            values = extractor(clip.copy(), sampling_rate=16000, return_tensors='pt')
            with torch.inference_mode():
                logp = model(values.input_values).logits.log_softmax(-1)[0].numpy()
            expected = (len(clip)-field)//stride+1
            if len(logp) != expected:
                raise ValueError("Feature frame geometry mismatch")
            spans = align_ctc(logp, [vocab[c] for c in prefix], blank)
            units = [dict(text=c, start=lo+(s['firstFrame']*stride+field/2)/16000,
                          end=lo+(s['lastFrame']*stride+field/2)/16000,
                          probability=s['probability']) for c,s in zip(prefix,spans)]
            greedy = logp.argmax(-1)
            decoded = []
            previous = None
            for token in greedy:
                if token != previous and token != blank:
                    decoded.append(inverse[int(token)])
                previous = token
            runs.append(dict(windowStart=lo, windowEnd=hi, units=units,
                             greedyText=''.join(decoded).replace('|',' ')))
        start_spread = abs(runs[0]['units'][0]['start']-runs[1]['units'][0]['start'])
        end_spread = abs(runs[0]['units'][-1]['end']-runs[1]['units'][-1]['end'])
        row.update(status='review-only', runs=runs,
                   prefixStartSpread=start_spread, prefixEndSpread=end_spread,
                   maximumTokenStartSpread=max(abs(a['start']-b['start'])
                                               for a,b in zip(runs[0]['units'],runs[1]['units'])),
                   lowProbabilityUnits=sum(min(a['probability'],b['probability'])<.05
                                           for a,b in zip(runs[0]['units'],runs[1]['units'])))
        rows.append(row)
        report.update(elapsedSeconds=time.monotonic()-started, rows=rows)
        output.write_text(json.dumps(report,ensure_ascii=False,indent=2))
        print(json.dumps(dict(system=cue['system'], prefixUnits=len(prefix),
                              firstStarts=[r['units'][0]['start'] for r in runs],
                              startSpread=start_spread,endSpread=end_spread,
                              lowProbabilityUnits=row['lowProbabilityUnits']),ensure_ascii=False),flush=True)
    output.write_text(json.dumps(report|dict(rows=rows,elapsedSeconds=time.monotonic()-started),ensure_ascii=False,indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--self-test', action='store_true')
    parser.add_argument('--dir', type=Path)
    parser.add_argument('--model', type=Path)
    parser.add_argument('--audio', type=Path)
    parser.add_argument('--out', type=Path)
    parser.add_argument('--systems', type=int, nargs='*')
    args = parser.parse_args()
    self_test()
    if not args.self_test:
        if not all((args.dir,args.model,args.audio,args.out)):
            parser.error('--dir, --model, --audio, --out required')
        review(args.dir,args.model,args.audio,args.out,args.systems)
