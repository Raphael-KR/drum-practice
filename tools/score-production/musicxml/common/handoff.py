"""Compose a local handoff from actual artifacts and scoped evidence; never send."""
import hashlib
import json
import subprocess
import xml.etree.ElementTree as ET
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from .artifacts import ROOT, sha


def file_path(value, root):
    path = Path(value).expanduser()
    return (path if path.is_absolute() else root / path).resolve()


def pointer(document, path):
    """Read a JSON pointer without evaluating code or assuming a report schema."""
    if not path.startswith('/'):
        raise ValueError(f'JSON pointer expected leading /; actual={path!r}')
    for key in path[1:].split('/'):
        key = key.replace('~1', '/').replace('~0', '~')
        document = document[int(key)] if isinstance(document, list) else document[key]
    return document


def mismatch(field, expected, actual):
    # Small selected scalar values only; never dump an entire report or XML.
    def short(value):
        if isinstance(value, (dict, list)):
            return f'{type(value).__name__}(length={len(value)})'
        return repr(value)[:160]
    return f'{field}: expected={short(expected)}, actual={short(actual)}'


def inspect_evidence(spec, artifacts, root):
    path = file_path(spec['path'], root)
    row = dict(name=spec['name'], path=str(path), scope=spec['scope'], status='unverified')
    if not path.is_file():
        return {**row, 'reason': mismatch('evidence file', 'existing file', 'missing')}
    row['sha256'] = sha(path)
    if not spec.get('expect') and not spec.get('bind'):
        return {**row, 'status': 'recorded', 'reason': 'Evidence file recorded; no automated pass claimed'}
    try:
        data = json.loads(path.read_text())
        for key, expected in spec.get('expect', {}).items():
            actual = pointer(data, key)
            if actual != expected:
                return {**row, 'status': 'failed', 'reason': mismatch(key, expected, actual)}
        for key, artifact in spec.get('bind', {}).items():
            expected = artifacts[artifact]['sha256']
            actual = pointer(data, key)
            if actual != expected:
                return {**row, 'status': 'failed', 'reason': mismatch(key, expected, actual)}
    except (OSError, ValueError, KeyError, IndexError, TypeError) as error:
        return {**row, 'reason': f'Cannot establish evidence: {type(error).__name__}: {error}'}
    if spec.get('expect') and spec.get('bind'):
        return {**row, 'status': 'passed', 'reason': 'Recorded result and candidate SHA256 match; original check not rerun'}
    return {**row, 'status': 'recorded', 'reason': 'Recorded result only; no candidate-bound pass claimed'}


def inspect_artifacts(spec, root):
    if not spec.get('musicxml'):
        raise ValueError('artifacts.musicxml: expected=file path, actual=missing')
    artifacts = {}
    for name, value in spec.items():
        path = file_path(value, root)
        if not path.is_file():
            raise ValueError(mismatch(f'artifacts.{name}', 'existing file', str(path)))
        artifacts[name] = dict(path=str(path), bytes=path.stat().st_size, sha256=sha(path))
    xml_bytes = Path(artifacts['musicxml']['path']).read_bytes()
    xml = ET.fromstring(xml_bytes)
    if xml.tag != 'score-partwise':
        raise ValueError(mismatch('MusicXML root', 'score-partwise', xml.tag))
    summary = dict(title=xml.findtext('work/work-title') or xml.findtext('movement-title'),
                   artist=xml.findtext("identification/creator[@type='artist']"),
                   parts=[dict(id=p.get('id'), measures=len(p.findall('measure'))) for p in xml.findall('part')])
    sound = xml.find('.//sound[@tempo]')
    if sound is not None:
        summary['scoreBpm'] = sound.get('tempo')
    checks = ['XML metadata read; schema and musical correctness require their own evidence']
    canonical = xml.findtext("identification/miscellaneous/miscellaneous-field[@name='drum-practice:score:v1']")
    if canonical:
        try:
            metadata = json.loads(canonical)
            first = metadata.get('measures', [{}])[0].get('start')
            if type(first) in (int, float):
                summary['firstBeat'] = first
                summary['firstBeatOrigin'] = 'canonical first measure start'
        except (ValueError, TypeError, IndexError, AttributeError) as error:
            checks.append(f'Canonical first beat unavailable: expected=valid score metadata, actual={type(error).__name__}: {error}')
    if 'package' in artifacts:
        with zipfile.ZipFile(artifacts['package']['path']) as archive:
            bad = archive.testzip()
            if bad:
                raise ValueError(mismatch('package CRC', None, bad))
            manifest = json.loads(archive.read('manifest.json'))
            if (manifest.get('format'), manifest.get('version')) != ('drumscore', 1):
                raise ValueError(mismatch('package format/version', ('drumscore', 1),
                                         (manifest.get('format'), manifest.get('version'))))
            source = archive.read(manifest['source']['path'])
            actual = hashlib.sha256(source).hexdigest()
            if actual != artifacts['musicxml']['sha256']:
                raise ValueError(mismatch('package MusicXML SHA256', artifacts['musicxml']['sha256'], actual))
            song = manifest['song']
            summary.update(id=song['id'], title=song['title'], artist=song.get('artist'),
                           scoreBpm=song['bpm'], firstBeat=song.get('firstBeat'),
                           measures=len(song['measures']), lyrics=len(song.get('lyrics', [])),
                           measureLyrics=len(song.get('measureLyrics', [])))
            if 'sourceAudio' in artifacts:
                actual = hashlib.sha256(archive.read(manifest['audio']['path'])).hexdigest()
                if actual != artifacts['sourceAudio']['sha256']:
                    raise ValueError(mismatch('package audio SHA256', artifacts['sourceAudio']['sha256'], actual))
            if 'sourcePdf' in artifacts:
                actual = [hashlib.sha256(archive.read(s['source']['path'])).hexdigest()
                          for s in manifest.get('otherScores', []) if s.get('format') == 'pdf']
                if artifacts['sourcePdf']['sha256'] not in actual:
                    raise ValueError(mismatch('package PDF SHA256', artifacts['sourcePdf']['sha256'], actual))
            checks += ['Package ZIP CRC passed', 'Delivered MusicXML matches package source bytes']
            if 'sourceAudio' in artifacts:
                checks.append('Original audio bytes match package audio')
            if 'sourcePdf' in artifacts:
                checks.append('Original PDF bytes match package alternate')
    return artifacts, summary, checks


def git_state(root):
    def run(*args):
        return subprocess.check_output(['git', '-C', str(root), *args], text=True).strip()
    try:
        return dict(branch=run('branch', '--show-current'), head=run('rev-parse', 'HEAD'),
                    dirty=bool(run('status', '--porcelain')))
    except (OSError, subprocess.CalledProcessError):
        return dict(status='unavailable')


def compose(config_path, out, root=ROOT):
    root, out = Path(root).resolve(), Path(out).resolve()
    if out.exists():
        raise ValueError(mismatch('output directory', 'fresh path', str(out)))
    config = json.loads(Path(config_path).read_text())
    if config.get('version') != 1:
        raise ValueError(mismatch('handoff manifest version', 1, config.get('version')))
    recipient = config['recipient']
    for field in ('title', 'threadId'):
        if not recipient.get(field):
            raise ValueError(mismatch(f'recipient.{field}', 'explicit value', 'missing'))
    document = file_path(config['productionDocument'], root)
    if not document.is_file():
        raise ValueError(mismatch('production document', 'existing file', str(document)))
    artifacts, summary, checks = inspect_artifacts(config['artifacts'], root)
    evidence = [inspect_evidence(row, artifacts, root) for row in config.get('evidence', [])]
    result = dict(version=1, generatedAt=datetime.now(timezone.utc).isoformat(),
                  status='draft', recipient=recipient, productionDocument=str(document),
                  artifacts=artifacts, summary=summary, artifactChecks=checks, evidence=evidence,
                  observations=config.get('observations', []), limitations=config.get('limitations', []),
                  nextActions=config.get('nextActions', []), repository=git_state(root),
                  delivery='not sent', appIntegration='not established by this tool',
                  listening='not established by this tool')
    lines = [f"# 악보 제작 인계 — {summary.get('title') or '제목 미기록'}", '',
             f"수신: {recipient['title']} / {recipient['threadId']}",
             '상태: 전송 전 초안. 사용자 상시 위임은 새 악보·교정본을 기존 개발자에게 전달하는 범위다.',
             f'제작 문서: {document}', '', '## 산출물', '']
    for name, artifact in artifacts.items():
        lines += [f"- {name}: {artifact['path']} ({artifact['bytes']:,} bytes)",
                  f"  SHA256: {artifact['sha256']}"]
    lines += ['', '## 악보 정보', '',
              f"- 제목: {summary.get('title') or '미기록'} / 가수: {summary.get('artist') or '미기록'}",
              f"- 곡 ID: {summary.get('id', 'MusicXML 단독; 패키지 ID 없음')}",
              f"- 악보 BPM: {summary.get('scoreBpm', '미기록')} / 첫 박: {summary.get('firstBeat', '미기록')}",
              '- 파트별 마디 수: '+', '.join(f"{p['id']}={p['measures']}" for p in summary['parts'])]
    if 'measures' in summary:
        lines.append(f"- 재생 마디: {summary['measures']} / 가사 단위: {summary['lyrics']} / 마디 문구: {summary['measureLyrics']}")
    lines += ['', '## 이번 인계 준비에서 확인한 항목', ''] + ['- '+s for s in checks]
    lines += ['', '## 기존 검사 근거와 적용 범위', '']
    for e in evidence:
        lines += [f"- [{e['status']}] {e['name']}: {e['scope']}",
                  f"  근거: {e['path']}; {e.get('reason', '')}"]
    if not evidence:
        lines.append('- 미확인: 검사 근거가 지정되지 않았음. 산출물 식별을 제작 검증으로 간주하지 않음.')
    for title, key in [('곡별 판단·변경', 'observations'), ('한계·미검증', 'limitations'), ('다음 조치', 'nextActions')]:
        lines += ['', '## '+title, '']
        lines += ['- '+s for s in result[key]] or ['- 미기록. 확인된 내용으로 간주하지 않음.']
    lines += ['', '실제 앱 수록·저장 후 재열기·기기 청취 완료 여부는 이 도구가 확인하지 않는다.',
              '자동 생성은 메시지 전달이 아니다. 승인된 전달 도구의 접수 결과를 별도로 기록한다.',
              f"Git 관측: {json.dumps(result['repository'], ensure_ascii=False)}",
              '기존 변경·로컬 자료를 보존한다. 이 인계는 새 커밋·push·공개 배포 요청이 아니다.', '']
    out.mkdir(parents=True)
    (out/'handoff.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    (out/'handoff.md').write_text('\n'.join(lines))
    return result


def receipt(folder, recipient, accepted_at, evidence, status):
    folder = Path(folder)
    draft = json.loads((folder/'handoff.json').read_text())
    if recipient != draft['recipient']['threadId']:
        raise ValueError(mismatch('recipient thread', draft['recipient']['threadId'], recipient))
    timestamp = datetime.fromisoformat(accepted_at.replace('Z', '+00:00'))
    if timestamp.utcoffset() is None:
        raise ValueError(mismatch('receipt timestamp', 'explicit timezone', accepted_at))
    path = folder/'delivery.json'
    if path.exists():
        raise ValueError(mismatch('delivery record', 'fresh file', str(path)))
    result = dict(status=status, recipientThreadId=recipient, acceptedAt=timestamp.isoformat(),
                  evidence=evidence, bodySHA256=sha(folder/'handoff.md'),
                  scope='Caller-supplied observed receipt. Acceptance is not app inclusion or listening.')
    path.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    return result
