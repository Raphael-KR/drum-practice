import json,numpy as np,mlx.core as mx
from pathlib import Path
from mlx_whisper.load_models import load_model
from mlx_whisper.tokenizer import get_tokenizer
from mlx_whisper.audio import load_audio,log_mel_spectrogram,pad_or_trim
from mlx_whisper.timing import find_alignment
import argparse
parser=argparse.ArgumentParser(description="Phonetic-token DTW estimates, not listening verification. Requires mlx-whisper.")
for flag in ['model','audio','units','kana','manifest','out']:
 parser.add_argument('--'+flag,required=True,type=Path)
args=parser.parse_args()
if args.out.exists():parser.error('Output already exists')
args.out.parent.mkdir(parents=True,exist_ok=True)
model=load_model(str(args.model),dtype=mx.float16)
tok=get_tokenizer(True,num_languages=100,language='ja',task='transcribe')
a=load_audio(str(args.audio));units=json.loads(args.units.read_text());kana=json.loads(args.kana.read_text());manifest=json.loads(args.manifest.read_text())
class Groups:
 def __init__(self,groups,words):self.groups=groups;self.words=words
 def __getattr__(self,name):return getattr(tok,name)
 def split_to_word_tokens(self,ts):
  assert ts==sum(self.groups,[])+[tok.eot]
  return self.words+['<|endoftext|>'],self.groups+[[tok.eot]]
out=[]
for ci,ch in enumerate(manifest['segments']):
 us=[(i,u) for i,u in enumerate(units) if u['chunk']==ci]
 # Encode each phonetic display syllable separately so DTW gives a measured model
 # boundary instead of uniformly dividing a multi-syllable word duration.
 words=[kana[u['text']] for _,u in us]
 groups=[tok.encode(w) for w in words];proxy=Groups(groups,words);runs=[]
 for delta in [0,-.6]:
  lo=ch['start']+delta;x=a[int(lo*16000):int(ch['end']*16000)]
  mel=log_mel_spectrogram(pad_or_trim(x),n_mels=model.dims.n_mels).astype(mx.float16)
  ws=find_alignment(model,proxy,sum(groups,[]),mel,int(len(x)/160))
  runs.append([dict(id='l'+str(i),text=u['text'],start=float(w.start)+lo,end=float(w.end)+lo,prob=float(w.probability)) for (i,u),w in zip(us,ws)])
 out.append({'chunk':ci,'runs':runs});args.out.write_text(json.dumps(out,ensure_ascii=False,indent=2));print(ci,len(us),flush=True)
