"""Render this exercise using the project's preserved Portland Kit recordings.

Uses EXS zone ranges, not a GarageBand project bounce or its effect chain.
Requires numpy, ffmpeg and local-libraries/garageband-drum-kits/manifest.json.
Does not read the GarageBand app or the system sound library.
EXS field references: matt-allan/renoise-exs24 exs.lua and
asatamax/tonverk-elmulti-converter docs/EXS24_FORMAT_SPEC.md.
"""
import argparse
import hashlib
import json
import struct
import subprocess
from pathlib import Path

import numpy as np

LIBRARY_ROOT = Path(__file__).resolve().parents[2] / 'local-libraries/garageband-drum-kits'
# Original paths identify entries in the preservation manifest; they are not read.
EXS_SOURCE = '/Library/Application Support/Logic/Sampler Instruments/03 Drums & Percussion/04 Drum Kit Designer/Drum Kit Designer/Stereo/Portland Kit.exs'
PATCH_SOURCE = '/Applications/GarageBand.app/Contents/Resources/Patches/Instrument/Drum Kit/Portland.patch/#Root.cst'
# Playback-only adapter: Portland's internal EXS has Hi Tom at 48 and no zone at 50.
# Original GM MIDI and approved MusicXML instrument mapping are preserved.
KEYS = {36: (36, 'Bd1'), 38: (38, 'Sn2'), 50: (48, 'TomHi'), 47: (47, 'TomMidHi'), 43: (43, 'TomLo')}


def sha(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(8 * 1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--events', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--library', type=Path, default=LIBRARY_ROOT,
                        help='Preserved project library directory')
    args = parser.parse_args()
    library = json.loads((args.library / 'manifest.json').read_text())
    entries = {entry['source']: entry for entry in library['files']}
    exs = library_file(args.library, entries, EXS_SOURCE)
    patch = library_file(args.library, entries, PATCH_SOURCE)
    args.out.mkdir(parents=True, exist_ok=False)
    data = json.loads(args.events.read_text())
    # Refuse the old independent score, even if a modified event file has 336 hits.
    from tom_moving_corrected import verify, FIXTURE, INSTRUMENTS, FIRST, BPM
    bars, _ = verify(args.events.with_name('tom-moving-source.musicxml').read_bytes(), json.loads(FIXTURE.read_text()))
    expected = sorted((round((FIRST+(i*4+e['offsetUnits']/4)*60/BPM)*44100), INSTRUMENTS[e['instrument']][3]) for i,b in enumerate(bars) for e in b)
    assert sorted((e['frame'],e['note']) for e in data['events'] if e['on']) == expected
    rate = data['sampleRate']
    assert rate == 44100 and data['endFrame'] > 0
    events = [e for e in data['events'] if e['on']]
    assert len(events) == 336 and {e['note'] for e in events} == set(KEYS)
    assert all(e['velocity'] == 76 and e['channel'] == 9 for e in events)
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
                    and c[93] <= 76 <= c[94]]
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
        assert filename == 'Portland Kit '+('Kick' if midi_note==36 else 'Snare' if midi_note==38 else 'Toms')+'_consolidated.caf'
        source = library_file(args.library, entries, Path(directory) / filename)
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
        audio *= 10 ** (zone_db / 20) * (76 / 127)
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
    wav = args.out / 'tom-moving-portland.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-n', '-f', 'f32le', '-ar', str(rate),
                    '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', str(wav)],
                   input=pcm, check=True)
    mp3 = args.out / 'tom-moving-portland.mp3'
    subprocess.run(['ffmpeg', '-v', 'error', '-n', '-i', str(wav), '-codec:a',
                    'libmp3lame', '-b:a', '192k', '-metadata',
                    'title=탐탐 무빙 연습 — Portland Kit', '-metadata',
                    'comment=Installed GarageBand Portland samples; dry offline render, not GarageBand project bounce',
                    str(mp3)], check=True)
    audit = {'method': 'EXS region sample mix; GarageBand effects not reproduced',
             'exs': str(exs), 'exsSHA256': sha(exs), 'garageBandPatch': str(patch),
             'patchSHA256': sha(patch), 'libraryManifest': str((args.library / 'manifest.json').resolve()),
             'events': str(args.events.resolve()),
             'eventsSHA256': sha(args.events), 'sampleRate': rate,
             'frames': len(mix), 'durationSeconds': len(mix) / rate,
             'hits': len(events), 'mappings': mappings, 'tailFadeSeconds': .02,
             'velocityGain': 'velocity / 127', 'masterGain': gain,
             'peakBeforeGain': peak_before, 'peakAfterGain': float(abs(mix).max()),
             'wavSHA256': sha(wav), 'mp3SHA256': sha(mp3),
             'wavBytes': wav.stat().st_size, 'mp3Bytes': mp3.stat().st_size,
             'audition': 'not performed'}
    (args.out / 'render-audit.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'mp3': str(mp3.resolve()), 'seconds': audit['durationSeconds'],
                      'hits': len(events), 'mp3Bytes': audit['mp3Bytes']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
