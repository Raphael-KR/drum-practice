"""Shared preserved-EXS sample renderer, not GarageBand effects or project bounce.

Only the already supported non-looping, unpitched zone subset is rendered.
Kit/GM adapter and song audit expectations are explicit profile data.
"""
import hashlib
import json
import struct
import subprocess
from pathlib import Path
import numpy as np
from .artifacts import ROOT, PROFILES, sha

LIBRARY_ROOT = ROOT / 'local-libraries/garageband-drum-kits'

def library_file(root, entries, source):
    """Resolve a verified copy without falling back to its original location."""
    entry = entries[str(source)]
    path = (root / entry['relativePath']).resolve()
    if not path.is_relative_to(root.resolve()) or not path.is_file():
        raise ValueError(f'Missing or invalid preserved library file: {source}')
    if path.stat().st_size != entry['bytes'] or sha(path) != entry['sha256']:
        raise ValueError(f'Preserved library file differs from manifest: {source}')
    return path


def chunks(data):
    offset = 0
    while offset < len(data):
        signature, size = struct.unpack_from('<II', data, offset)
        assert data[offset + 16:offset + 20] == b'TBOS'
        end = offset + 84 + size
        assert offset + 84 <= end <= len(data)
        yield (signature >> 24) & 15, data[offset:end]
        offset = end
    assert offset == len(data)


def render(events_path, out, library_root, config, xml_path=None):
    kit=json.loads((PROFILES/'kits.json').read_text())[config['kit']]
    KEYS={int(k):v for k,v in kit['keys'].items()}
    library = json.loads((library_root / 'manifest.json').read_text())
    entries = {entry['source']: entry for entry in library['files']}
    exs = library_file(library_root, entries, kit['exsSource'])
    patch = library_file(library_root, entries, kit['patchSource'])
    out.mkdir(parents=True, exist_ok=False)
    data = json.loads(events_path.read_text())
    rate = data['sampleRate']
    assert rate == 44100 and data['endFrame'] > 0
    events = [e for e in data['events'] if e['on']]
    assert len(events) == config['hits'] and {e['note'] for e in events} == set(KEYS)
    assert all(e['velocity'] == config['velocity'] and e['channel'] == config['channel'] for e in events)
    assert all(0 <= e['frame'] < data['endFrame'] for e in events)
    assert [e['frame'] for e in events] == sorted(e['frame'] for e in events)
    blocks = list(chunks(exs.read_bytes()))
    groups = [c for k, c in blocks if k == 2]
    samples = [c for k, c in blocks if k == 3]
    zones = [c for k, c in blocks if k == 1]
    mix = np.zeros((data['endFrame'], 2), dtype=np.float64)
    mappings = []
    for midi_note, (kit_note, tom_name) in KEYS.items():
        matching = [c for c in zones if c[90] <= kit_note <= c[91]
                    and c[93] <= config['velocity'] <= c[94]]
        assert len(matching) == 1, 'Ambiguous sample/velocity mapping'
        c = matching[0]
        root, pan, fine = c[85], struct.unpack_from('b', c, 87)[0], struct.unpack_from('b', c, 86)[0]
        # Fail rather than approximating pitch, looping, or group trigger conditions.
        assert c[84] == 11 and c[117] == 0 and root == kit_note and pan == fine == c[164] == 0
        start, end = struct.unpack_from('<II', c, 96)
        group_index, sample_index = struct.unpack_from('<iI', c, 172)
        group = groups[group_index]
        name = group[20:84].split(b'\0')[0].decode()
        assert tom_name in name and group[168] == 0 and group[157] == 0
        sample = samples[sample_index]
        assert struct.unpack_from('<I', sample, 92)[0] == rate
        directory = sample[164:420].split(b'\0')[0].decode()
        filename = sample[420:676].split(b'\0')[0].decode()
        assert filename == kit['sampleFiles'][str(midi_note)]
        source = library_file(library_root, entries, Path(directory) / filename)
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(source), '-af',
                              f'atrim=start_sample={start}:end_sample={end}',
                              '-f', 'f32le', '-acodec', 'pcm_f32le', '-'],
                             check=True, capture_output=True).stdout
        audio = np.frombuffer(raw, dtype='<f4').reshape(-1, 2).astype(np.float64)
        assert len(audio) == end - start and np.isfinite(audio).all()
        # The EXS one-second zones have nonzero endpoints; avoid audible cut clicks.
        fade_frames = round(.02 * rate)
        audio[-fade_frames:] *= np.linspace(1, 0, fade_frames)[:, None]
        zone_db = struct.unpack_from('b', c, 88)[0]
        audio *= 10 ** (zone_db / 20) * (config['velocity'] / 127)
        selected = [e for e in events if e['note'] == midi_note]
        for event in selected:
            pos = event['frame']
            assert pos + len(audio) <= len(mix), 'Natural release exceeds output'
            mix[pos:pos + len(audio)] += audio
        mappings.append({'midiNote': midi_note, 'kitNote': kit_note,
                         'group': name, 'zoneId': struct.unpack_from('<I', c, 8)[0],
                         'zoneVolumeDb': zone_db, 'velocityRange': [c[93], c[94]],
                         'startFrame': start, 'endFrameExclusive': end,
                         'source': str(source), 'sourceSHA256': sha(source),
                         'decodedRegionSHA256': hashlib.sha256(raw).hexdigest(),
                         'hits': len(selected)})
    peak_before = float(np.max(np.abs(mix)))
    assert peak_before > 0
    gain = 10 ** (-3 / 20) / peak_before
    mix *= gain
    pcm = mix.astype('<f4').tobytes()
    wav = out / (config['audioStem']+'.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-n', '-f', 'f32le', '-ar', str(rate),
                    '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', str(wav)],
                   input=pcm, check=True)
    mp3 = out / (config['audioStem']+'.mp3')
    subprocess.run(['ffmpeg', '-v', 'error', '-n', '-i', str(wav), '-codec:a',
                    'libmp3lame', '-b:a', '192k', '-metadata',
                    'title='+config['audioTitle'], '-metadata',
                    'comment='+kit['comment'],
                    str(mp3)], check=True)
    audit = {'method': 'EXS region sample mix; GarageBand effects not reproduced',
             'exs': str(exs), 'exsSHA256': sha(exs), 'garageBandPatch': str(patch),
             'patchSHA256': sha(patch), 'libraryManifest': str((library_root / 'manifest.json').resolve()),
             'events': str(events_path.resolve()),
             'eventsSHA256': sha(events_path), 'sampleRate': rate,
             'frames': len(mix), 'durationSeconds': len(mix) / rate,
             'hits': len(events), 'mappings': mappings, 'tailFadeSeconds': .02,
             'velocityGain': 'velocity / 127', 'masterGain': gain,
             'peakBeforeGain': peak_before, 'peakAfterGain': float(abs(mix).max()),
             'wavSHA256': sha(wav), 'mp3SHA256': sha(mp3),
             'wavBytes': wav.stat().st_size, 'mp3Bytes': mp3.stat().st_size,
             'audition': 'not performed'}
    if xml_path is not None:
        audit.update(xml=str(xml_path.resolve()), xmlSHA256=sha(xml_path))
    (out / 'render-audit.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'mp3': str(mp3.resolve()), 'seconds': audit['durationSeconds'],
                      'hits': len(events), 'mp3Bytes': audit['mp3Bytes']}, ensure_ascii=False))
