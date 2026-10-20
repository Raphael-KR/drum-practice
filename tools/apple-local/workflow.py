#!/usr/bin/env python3
"""Local STT -> deterministic comparison -> advisory AFM -> human/Codex review.
Never edits the song, applies timestamps, or marks lyrics confirmed.
"""
import argparse
import difflib
import hashlib
import json
import math
import shutil
import subprocess
import time
from pathlib import Path
from boundaries import validate_anchors, boundary_candidates, probe_windows, assess_boundary

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent


def write(path, value):
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2))
    temporary.replace(path)


def validate_segments(segments, duration):
    previous = -1
    for s in segments:
        if not isinstance(s.get('text'), str):
            raise ValueError('Invalid STT text')
        a, b = s['start'], s['end']
        if not all(math.isfinite(v) for v in (a, b)) or not 0 <= a <= b <= duration + .1 or a < previous:
            raise ValueError('Invalid STT time range')
        previous = a


def compare(reference, segments, offset, prefix):
    recognized = ''.join(s['text'] for s in segments)
    owners = [i for i, s in enumerate(segments) for _ in s['text']]
    candidates, anchors = [], []
    for op, a, b, c, d in difflib.SequenceMatcher(None, reference, recognized, autojunk=False).get_opcodes():
        ids = sorted(set(owners[c:d]))
        span = None if not ids else [offset + segments[ids[0]]['start'], offset + segments[ids[-1]]['end']]
        row = dict(reference=reference[a:b], recognized=recognized[c:d], runIds=ids, audioSpan=span)
        if op == 'equal':
            # A range belongs to the complete STT run, never a phoneme boundary.
            anchors.append(row)
        else:
            row.update(id=f'{prefix}-{len(candidates)}', operation=op, needsReview=True,
                       referenceContext=reference[max(0,a-6):min(len(reference),b+6)],
                       recognizedContext=recognized[max(0,c-6):min(len(recognized),d+6)])
            if not ids:
                row['neighbors'] = [i for i in [owners[c-1] if c else None, owners[c] if c < len(owners) else None] if i is not None]
            candidates.append(row)
    return candidates, anchors


def run_json(binary, request, timeout):
    return json.loads(subprocess.check_output([str(binary)], input=json.dumps(request).encode(), timeout=timeout))


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--audio', required=True, type=Path)
    p.add_argument('--manifest', required=True, type=Path, help='JSON segments: [{id,start,end,reference}]')
    p.add_argument('--song', type=Path, help='Optional read-only song.json to annotate measure labels')
    p.add_argument('--out', required=True, type=Path, help='New output directory; existing runs never overwritten')
    args = p.parse_args()
    out = args.out.resolve()
    if out.exists():
        p.error('Output directory exists. Use a new run directory.')
    if not out.is_relative_to(ROOT):
        p.error('Output must stay inside this project.')
    manifest = json.loads(args.manifest.read_text())
    chunks = manifest['segments']
    ids = [c['id'] for c in chunks]
    if len(set(ids)) != len(ids) or any(not isinstance(x,str) or not x.replace('-','').isalnum() for x in ids):
        p.error('Segment IDs must be unique alphanumeric/hyphen strings.')
    for c in chunks:
        if not (0 <= c['start'] < c['end']) or not isinstance(c['reference'], str):
            p.error('Invalid reference segment')
    listening_anchors = manifest.get('anchors', [])
    validate_anchors(listening_anchors, set(ids))
    ffmpeg = shutil.which('ffmpeg')
    if not ffmpeg:
        p.error('ffmpeg is required')
    out.mkdir(parents=True)
    for source, name in [('SpeechBridge.swift', 'stt'), ('Review.swift', 'review')]:
        subprocess.run(['xcrun','swiftc','-parse-as-library',str(HERE/source),'-o',str(out/name)],check=True)
    status = run_json(out/'stt', {'action':'status','locale':manifest.get('locale','ja_JP')}, 30)
    write(out/'stt-status.json', status)
    if not status.get('available') or not status.get('localeSupported'):
        raise RuntimeError('STT unavailable; see stt-status.json')
    song = json.loads(args.song.read_text()) if args.song else {}
    report = {'method':'Apple STT + deterministic diff + advisory AFM', 'verifiedByListening':False,
              'audioSHA256':hashlib.sha256(args.audio.read_bytes()).hexdigest(),
              'manifestSHA256':hashlib.sha256(args.manifest.read_bytes()).hexdigest(),
              'sourceSHA256':{f:hashlib.sha256((HERE/f).read_bytes()).hexdigest() for f in ['SpeechBridge.swift','Review.swift','workflow.py','boundaries.py']},
              'sttStatus':status, 'segments':[], 'afmErrors':[], 'listeningAnchors':listening_anchors,
              'boundaryPolicy':{'singleCharacterSeconds':.8,'contextSpreadSeconds':.2,'autoApply':False}}
    pairs = []
    for chunk in chunks:
        ident = chunk['id']; wav = out/f'{ident}.wav'
        duration = chunk['end']-chunk['start']
        subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-ss',str(chunk['start']),'-t',str(duration),'-i',str(args.audio.resolve()),'-ar','16000','-ac','1',str(wav)],check=True)
        begin=time.perf_counter()
        raw=run_json(out/'stt',{'action':'transcribe','path':str(wav),'locale':manifest.get('locale','ja_JP')},120)
        elapsed=time.perf_counter()-begin
        write(out/f'{ident}-stt.json',raw)
        if 'segments' not in raw:
            raise RuntimeError(f'STT failed on {ident}: {raw.get("error")}')
        validate_segments(raw['segments'],duration)
        boundaries=[]
        for candidate in boundary_candidates(raw['segments'],chunk['start'],ident,listening_anchors):
            probes=[]
            for index,(lo,hi) in enumerate(probe_windows(candidate,chunk['end'])):
                clip=out/f'{candidate["id"]}-probe{index}.wav'
                begin_probe=time.perf_counter()
                try:
                    subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-ss',str(lo),'-t',str(hi-lo),'-i',str(args.audio.resolve()),'-ar','16000','-ac','1',str(clip)],check=True)
                    pr=run_json(out/'stt',{'action':'transcribe','path':str(clip),'locale':manifest.get('locale','ja_JP')},120)
                    if 'segments' in pr:validate_segments(pr['segments'],hi-lo)
                except (subprocess.SubprocessError,ValueError,KeyError) as error:
                    pr={'error':type(error).__name__}
                pr.update(offset=lo,windowEnd=hi,seconds=time.perf_counter()-begin_probe)
                write(out/f'{candidate["id"]}-probe{index}.json',pr)
                probes.append(pr)
            boundaries.append(assess_boundary(candidate,probes))
        diffs,anchors=compare(chunk['reference'],raw['segments'],chunk['start'],ident)
        for d in diffs:
            span=d['audioSpan']
            d['measures']=[m['label'] for m in song.get('measures',[]) if span and m['start'] < span[1] and m['end'] > span[0]]
            d['afm']={'verdict':'not_applicable'}
            if d['reference'] and d['recognized'] and max(len(d['reference']),len(d['recognized'])) <= 32:
                pairs.append({k:d[k] for k in ['id','reference','recognized','referenceContext','recognizedContext']})
        report['segments'].append(dict(id=ident,start=chunk['start'],end=chunk['end'],sttSeconds=elapsed,
          runs=[[s['text'],round(chunk['start']+s['start'],3),round(chunk['start']+s['end'],3)] for s in raw['segments']],
          differences=diffs, matchingTextRuns=anchors, boundaryChecks=boundaries))
        write(out/'report.json',report)
        print(f'{ident}: STT {elapsed:.2f}s, {len(diffs)} review candidates',flush=True)
    write(out/'afm-input.json',pairs)
    begin=time.perf_counter()
    # Only short comparisons. Each output ID/enum is checked; labels never filter candidates.
    try:
        result=subprocess.run([str(out/'review')],input=json.dumps(pairs).encode(),capture_output=True,timeout=max(60,len(pairs)*10),check=True)
        (out/'afm-output.jsonl').write_bytes(result.stdout)
        expected={x['id'] for x in pairs};seen=set()
        by={d['id']:d for s in report['segments'] for d in s['differences']}
        for line in result.stdout.decode().splitlines():
            r=json.loads(line)
            if r.get('id') not in expected or r['id'] in seen or r.get('verdict') not in ['sameReading','differentReading','uncertain','unavailable']:
                raise ValueError('Invalid AFM ID/verdict')
            seen.add(r['id']);by[r['id']]['afm']=r
        if seen != expected:
            raise ValueError('Missing AFM results')
    except (subprocess.SubprocessError,ValueError) as e:
        report['afmErrors'].append(type(e).__name__)
    report['afmSeconds']=time.perf_counter()-begin
    report['afmRequested']=len(pairs)
    matched_anchor_ids={a['id'] for s in report['segments'] for b in s['boundaryChecks'] for a in b['anchors']}
    report['unmatchedListeningAnchors']=[a['id'] for a in listening_anchors if a['id'] not in matched_anchor_ids]
    report['boundaryCandidateCount']=sum(len(s['boundaryChecks']) for s in report['segments'])
    report['contextSensitiveCount']=sum(b['status']=='context_sensitive' for s in report['segments'] for b in s['boundaryChecks'])
    report['reviewCandidateCount']=sum(len(s['differences']) for s in report['segments'])
    write(out/'report.json',report)
    lines=['# Local audio review queue','','All candidates retained. AFM is advisory. No lyric times applied or listening verification claimed.','']
    if report['unmatchedListeningAnchors']:
        lines.append(f'Unmatched listening anchors: {report["unmatchedListeningAnchors"]}')
    for s in report['segments']:
        lines.append(f'## {s["id"]}: {s["start"]}–{s["end"]} seconds')
        for b in s['boundaryChecks']:
            lines.append(f'- BOUNDARY {b["id"]} {b["text"]!r}: {b["status"]}, spread {b["spreadSeconds"]:.3f}s; automatic correction blocked; anchors {b["anchorComparisons"]}')
        for d in s['differences']:
            lines.append(f'- {d["id"]} | bars {d["measures"]} | audio {d["audioSpan"]} | reference {d["reference"]!r} / STT {d["recognized"]!r} | AFM {d["afm"]["verdict"]}')
    (out/'review.md').write_text('\n'.join(lines)+'\n')
    print(f'Report: {out}/report.json; candidates={report["reviewCandidateCount"]}; AFM errors={report["afmErrors"]}')


if __name__ == '__main__':
    main()
