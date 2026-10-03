"""Local source-lyric token alignment evidence, never auto-applied to a song.

PDF line coordinates bound broad review windows only. The alignment model
measures each supplied token; no word interval is divided into equal syllables.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

import mlx.core as mx
from mlx_whisper.audio import load_audio, log_mel_spectrogram, pad_or_trim
from mlx_whisper.load_models import load_model
from mlx_whisper.timing import find_alignment
from mlx_whisper.tokenizer import get_tokenizer


def review(folder, model_path, output, selected, audio_path=None):
    if output.exists():
        raise ValueError("Use a new review output")
    cues=json.loads((folder/'printed-lyric-cues.json').read_text())
    measures=json.loads((folder/'audio-alignment.json').read_text())['measures']
    model=load_model(str(model_path),dtype=mx.float16)
    tokenizer=get_tokenizer(True,num_languages=model.num_languages,language='ko',task='transcribe')
    audio_path = audio_path or folder/'source.mp3'
    audio=load_audio(str(audio_path))
    rows=[]
    for i,cue in enumerate(cues):
        if selected and cue['system'] not in selected:
            continue
        text=re.sub(r'\s+','',cue['text'])
        units=re.findall(r"[가-힣]|I'm|loveholic|[A-Za-z]+",text,re.I)
        groups=[tokenizer.encode(u) for u in units]
        tokens=sum(groups,[])

        class Groups:
            def __getattr__(self,name):
                return getattr(tokenizer,name)
            def split_to_word_tokens(self,ts):
                if ts != tokens+[tokenizer.eot]:
                    raise ValueError("Unexpected alignment token sequence")
                return units+['<|endoftext|>'],groups+[[tokenizer.eot]]

        next_system=cues[i+1]['system'] if i+1<len(cues) else 121
        center=measures[cue['system']-1]['start']
        hi=min(len(audio)/16000,measures[next_system-1]['start']+1.0)
        runs=[]
        for delta in [-1.5,-2.0]:
            lo=max(0,center+delta)
            x=audio[int(lo*16000):int(hi*16000)]
            if len(x)>30*16000:
                raise ValueError("Review window exceeds Whisper context")
            mel=log_mel_spectrogram(pad_or_trim(x),n_mels=model.dims.n_mels).astype(mx.float16)
            aligned=find_alignment(model,Groups(),tokens,mel,len(x)//160)
            if len(aligned)!=len(units):
                raise ValueError("Alignment dropped source units")
            runs.append(dict(windowStart=lo,windowEnd=hi,
                             units=[dict(text=u,start=float(w.start)+lo,end=float(w.end)+lo,
                                         probability=float(w.probability))
                                    for u,w in zip(units,aligned)]))
        candidates=[]
        for j,unit in enumerate(units):
            values=[r['units'][j] for r in runs]
            spread=abs(values[0]['start']-values[1]['start'])
            reasons=[]
            if spread>.15: reasons.append('context-sensitive-start')
            if any(v['start']-r['windowStart']<.12 for v,r in zip(values,runs)):reasons.append('clip-start-pinning')
            if any(not .035<=v['end']-v['start']<=1.5 for v in values):reasons.append('duration-review')
            if any(v['probability']<.03 for v in values):reasons.append('low-model-probability')
            candidates.append(dict(text=unit,meanStart=sum(v['start'] for v in values)/2,
                                   startSpread=spread,reasons=reasons,needsReview=True,autoApply=False))
        rows.append(dict(system=cue['system'],sourceText=cue['text'],runs=runs,candidates=candidates))
        output.write_text(json.dumps(dict(status='review-only',engine='mlx-whisper 0.4.3',modelPath=str(model_path),
                                         audioSHA256=hashlib.sha256(audio_path.read_bytes()).hexdigest(),audioPath=str(audio_path),
                                         policy='No forced vocal beats or auto-application; first units/context disagreement require review',
                                         rows=rows),ensure_ascii=False,indent=2))
        print(json.dumps(dict(system=cue['system'],units=len(units),
                              flagged=sum(bool(c['reasons']) for c in candidates),
                              maximumSpread=max(c['startSpread'] for c in candidates)),ensure_ascii=False),flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dir',type=Path,required=True)
    parser.add_argument('--model',type=Path,required=True)
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--audio',type=Path,help='Optional separated vocals with unchanged timeline')
    parser.add_argument('--systems',type=int,nargs='*')
    args=parser.parse_args()
    review(args.dir,args.model,args.out,args.systems,args.audio)
