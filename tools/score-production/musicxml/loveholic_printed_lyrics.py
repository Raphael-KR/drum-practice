"""Extract reviewed printed lyric ownership without inventing vocal durations.

Character ink boxes, not a row's first bar or its audio time, identify measures.
All source characters/spacing are preserved. Note proximity is review evidence;
measure-centered text carries no quarterOffset, duration or vocal timestamp.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

import pdfplumber
from PIL import Image, ImageDraw

from loveholic import PDF_SHA256


def display_text(units):
    text = ''
    previous_latin = False
    for unit in units:
        latin = bool(re.fullmatch(r"[A-Za-z']+", unit['text']))
        if text and (latin or previous_latin):
            text += ' '
        text += unit['text']
        previous_latin = latin
    return text


def extract_printed(folder, output):
    if output.exists():
        raise ValueError('Use a fresh review directory')
    pdf_path = folder/'source.pdf'
    if hashlib.sha256(pdf_path.read_bytes()).hexdigest() != PDF_SHA256:
        raise ValueError('Reviewed source digest mismatch')
    bars = json.loads((folder/'extracted.json').read_text())
    cues = json.loads((folder/'printed-lyric-cues.json').read_text())
    rows = []
    measures = []
    units = []
    source_chars = []
    with pdfplumber.open(pdf_path) as pdf:
        for cue in cues:
            bs = [b for b in bars if b['page']==cue['page'] and b['system']==cue['system']]
            page = pdf.pages[cue['page']-1]
            # Match every cached character back to the current original PDF.
            chars = []
            for index, c in enumerate(cue['chars']):
                matches = [a for a in page.chars if a['text']==c['text']
                           and abs(a['x0']-c['x'])<1e-5 and abs(a['top']-c['top'])<1e-5]
                if len(matches)!=1:
                    raise ValueError(f'Ambiguous original char {cue["system"]}/{index}')
                a = matches[0]
                chars.append(dict(index=index, text=c['text'], x0=a['x0'], x1=a['x1'],
                                  top=a['top'], bottom=a['bottom']))
            if ''.join(c['text'] for c in chars)!=cue['text']:
                raise ValueError('Source row text mismatch')
            grouped = []
            current = []
            for c in chars:
                if c['text'].isspace():
                    if current: grouped.append(current); current=[]
                elif re.fullmatch(r"[A-Za-z']+",c['text']):
                    current.append(c)
                else:
                    if current: grouped.append(current); current=[]
                    grouped.append([c])
            if current: grouped.append(current)
            by_bar = {b['number']:[] for b in bs}
            row_units = []
            for group in grouped:
                left,right = group[0]['x0'],group[-1]['x1']
                center = (left+right)/2
                owners = [b for b in bs if b['bounds'][0]<=center<b['bounds'][2]]
                if len(owners)!=1:
                    raise ValueError('Printed unit has no unique measure')
                owner = owners[0]
                if left<owner['bounds'][0] or right>owner['bounds'][2]:
                    raise ValueError('Unit crosses a barline; manual ownership required')
                # A reviewed approximate head-ink center; never used as timing.
                candidates = []
                for event in owner['events']:
                    if not event['heads']: continue
                    centers = [h['x']+{'œ':3.3325,'¿':2.5575,'Y':3.255}[h['glyph']]
                               for h in event['heads']]
                    candidates.append(dict(distancePt=min(abs(x-center) for x in centers),
                                           quarterOffset=event['onset'],
                                           sourceNoteDuration=event['duration']))
                candidates.sort(key=lambda a:a['distancePt'])
                unit = dict(id=f'loveholic-printed-{cue["system"]}-{group[0]["index"]}',
                            text=''.join(c['text'] for c in group), measureId=f'loveholic-m{owner["number"]}',
                            measure=owner['number'], page=cue['page'], system=cue['system'],
                            sourceCharIndices=[c['index'] for c in group],
                            bounds=[left,min(c['top'] for c in group),right,max(c['bottom'] for c in group)],
                            noteCandidates=candidates[:2], autoApplyNotePosition=False)
                units.append(unit); row_units.append(unit); by_bar[owner['number']].append(unit)
            # Non-space source characters survive in exact order across bars/rows.
            if re.sub(r'\s+','',cue['text'])!=''.join(u['text'] for u in row_units):
                raise ValueError('Source character omission/order change')
            raw_by_bar={b['number']:[] for b in bs}
            for c in chars:
                center=(c['x0']+c['x1'])/2
                owner=next((b for b in bs if b['bounds'][0]<=center<b['bounds'][2]),None)
                if owner:raw_by_bar[owner['number']].append(c)
                elif not c['text'].isspace():raise ValueError('Unassigned source char')
            for b in bs:
                owned=by_bar[b['number']]
                if not owned:continue
                measures.append(dict(id=f'loveholic-printed-m{b["number"]}',measureId=f'loveholic-m{b["number"]}',
                                     measure=b['number'],text=display_text(owned),
                                     placement='measure-center',sourcePage=cue['page'],sourceSystem=cue['system'],
                                     sourceText=''.join(c['text'] for c in raw_by_bar[b['number']]),
                                     sourceUnitIds=[u['id'] for u in owned],
                                     positionBasis='original-pdf-measure',vocalTimingVerified=False))
            source_chars.append(dict(page=cue['page'],system=cue['system'],text=cue['text'],chars=chars))
            rows.append(dict(page=cue['page'],system=cue['system'],sourceText=cue['text'],
                             measures=[b['number'] for b in bs if by_bar[b['number']]]))
    fixtures={7:'기억의터',8:'널속을나',9:'헤매어우',10:'는 loveholic',
              17:'갈곳을잃',18:'은 loveholic',39:'춤추는흰',40:'연기처럼',
              82:'춤추는흰',83:'연기처럼',116:'기억속꿈',117:'속에라',118:'도'}
    text_by_bar={m['measure']:m['text'] for m in measures}
    for number,text in fixtures.items():
        if text_by_bar.get(number)!=text:
            raise ValueError(f'Independent source fixture {number} failed')
    assert 37 not in text_by_bar and 80 not in text_by_bar
    output.mkdir(parents=True)
    result=dict(status='PASS',sourcePDFSHA256=PDF_SHA256,rows=rows,measureTexts=measures,units=units,
                sourceCharacters=source_chars,policy='Printed score position only; no vocal beats/durations inferred')
    (output/'printed-measure-lyrics.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    stats=dict(status='PASS',sourceRows=len(rows),nonemptyMeasures=len(measures),units=len(units),
               sourceNonspaceCharacters=sum(len(re.sub(r'\s+','',r['sourceText'])) for r in rows),
               boundaryCrossingUnits=0,sourceFixtures=list(fixtures),rowStartNotLyricStart=[37,80],
               notePositionAutoApplied=0,vocalDurationsCreated=0,sourceCharactersPreserved=True)
    (output/'printed-lyrics-validation.json').write_text(json.dumps(stats,indent=2))
    for page_number in [1,2,3]:
        image=Image.open(folder/f'source-poppler-{page_number}.png').convert('RGB')
        sx,sy=image.width/596,image.height/842
        strips=[]
        for row in rows:
            if row['page']!=page_number:continue
            b=next(b for b in bars if b['page']==page_number and b['system']==row['system'])
            top=int((b['staff']-21)*sy);bottom=int((b['staff']+44)*sy)
            strip=image.crop((0,top,image.width,bottom));draw=ImageDraw.Draw(strip)
            for bar in [x for x in bars if x['page']==page_number and x['system']==row['system']]:
                left,right=bar['bounds'][0]*sx,bar['bounds'][2]*sx
                draw.line([(left,0),(left,strip.height)],fill='#c23a30',width=2)
                draw.text((left+3,3),str(bar['number']),fill='#c23a30')
                draw.line([(right,0),(right,strip.height)],fill='#c23a30',width=2)
            strips.append(strip)
        sheet=Image.new('RGB',(image.width,sum(s.height+10 for s in strips)), 'white')
        y=0
        for strip in strips:sheet.paste(strip,(0,y));y+=strip.height+10
        sheet.save(output/f'printed-bar-contact-page-{page_number}.png')
    print(json.dumps(stats,ensure_ascii=False,indent=2))


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dir',type=Path,required=True)
    parser.add_argument('--out',type=Path,required=True)
    args=parser.parse_args()
    extract_printed(args.dir,args.out)
