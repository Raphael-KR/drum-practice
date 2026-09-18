from pathlib import Path
import json, shutil, hashlib
import pdfplumber
R=Path(__file__).resolve().parents[1];P=Path('/tmp/real-paradis-work');B=Path('/Users/raphael/Documents/드럼 악보')
D=R/'public/demo';D.mkdir(parents=True,exist_ok=True)
refs=R/'data/reference';refs.mkdir(parents=True,exist_ok=True)
for name in ['geometry.json','grid_verified.json','full_lyrics_positions.json']:
 shutil.copy2(P/name,refs/name)
for ext,target in [('pdf','score.pdf'),('mp3','audio.mp3')]:
 shutil.copy2(B/f'Real paradis-風と丘のバラード.{ext}',D/target)
for i in range(1,4):shutil.copy2(P/f'video-source-{i}.png',D/f'page-{i}.png')
g=json.loads((refs/'grid_verified.json').read_text());rows=json.loads((refs/'geometry.json').read_text());lyrics=json.loads((refs/'full_lyrics_positions.json').read_text())
regions=[];measures=[];q=0
for row in rows:
 edges=row['edges'];first=row['start']
 for j in range(4 if first==1 else len(edges)-1):
  bar=first+j;start=g['t0']+q*g['seconds_per_beat'];beats=5 if bar==84 else 4
  a,z=(edges[0]+j*(edges[-1]-edges[0])/4,edges[0]+(j+1)*(edges[-1]-edges[0])/4) if first==1 else edges[j:j+2]
  # Exclude source section labels from crops; retain stems, rests and noteheads.
  top=max(row['top'],row['staff']-28);bottom=min(row['bottom'],row['staff']+38)
  rid=f'r{bar}';regions.append(dict(id=rid,page=row['page'],x=a/612,y=top/792,w=(z-a)/612,h=(bottom-top)/792,beatXs=[]))
  measures.append(dict(id=f'm{bar}',regionId=rid,label=str(bar),beats=beats,denominator=4,start=start,end=start+beats*g['seconds_per_beat']))
  q+=beats
# Preserve note-spacing anchors for regular eighth-note cymbal patterns.
with pdfplumber.open(D/'score.pdf') as pdf:
 for m,r in zip(measures,regions):
  bar=int(m['label']);row=next(x for x in reversed(rows) if x['start']<=bar)
  if bar<=4:continue
  a=r['x']*612;z=(r['x']+r['w'])*612
  hats=sorted(set(round(c['x0']+2.4,2) for c in pdf.pages[r['page']].chars if c['text'] in ['x','o'] and a<c['x0']<z and -16<c['top']-row['staff']<-6))
  if len(hats)==8 and m['beats']==4:r['beatXs']=[(hats[i]-a)/(z-a) for i in [0,2,4,6]]+[1]
song=dict(version=1,id='real-paradis',artist='Real Paradis',title='바람과 언덕의 발라드',bpm=94,firstBeat=g['t0'],measures=measures,regions=regions,lyrics=[dict(id=f'l{i}',text=u['text'],time=u['time'],end=lyrics[i+1]['time'] if i<len(lyrics)-1 else 252,confirmed=False) for i,u in enumerate(lyrics)],markers=[dict(id=f'k{b}',name=n,time=measures[b-1]['start']) for b,n in [(9,'1절'),(25,'첫 후렴'),(41,'2절'),(73,'연결부'),(84,'5/4 전환'),(85,'마지막 후렴')]],loops=[],settings=dict(rate=1,click=True,musicVolume=.8,clickVolume=.3,countIn=1,countEach=False,zoom=1,view='ribbon',position=0),audioName='audio.mp3',pdfName='score.pdf',pageCount=3)
(D/'song.json').write_text(json.dumps(song,ensure_ascii=False,indent=2))
manifest={str(p.relative_to(R)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [D/'score.pdf',D/'audio.mp3',refs/'geometry.json',refs/'grid_verified.json',refs/'full_lyrics_positions.json']}
(refs/'manifest.json').write_text(json.dumps(manifest,indent=2))
print('Prepared',len(measures),'measures',q,'beats',len(lyrics),'lyric syllables')
